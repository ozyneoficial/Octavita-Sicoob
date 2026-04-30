const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const qs = require('querystring');



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SICOOB_CLIENT_ID = process.env.SICOOB_CLIENT_ID;
const SICOOB_CERT_PEM  = process.env.SICOOB_CERT_PEM;
const SICOOB_NUMERO_COOPERATIVA = process.env.SICOOB_NUMERO_COOPERATIVA || '3055';
const SICOOB_CODIGO_BENEFICIARIO = process.env.SICOOB_CODIGO_BENEFICIARIO || '1319914';
const API_SECRET_KEY   = process.env.API_SECRET_KEY;

const TOKEN_URL = 'https://auth.sicoob.com.br/auth/realms/cooperado/protocol/openid-connect/token';
const COBRANCA_URL = 'https://api.sicoob.com.br/cobranca-bancaria/v2/boletos';

function getMtlsAgent() {
  const cert = SICOOB_CERT_PEM.replace(/\\n/g, '\n');
  return new https.Agent({ cert, key: cert, rejectUnauthorized: true });
}

async function getAccessToken() {
  const agent = getMtlsAgent();
  const response = await axios.post(TOKEN_URL,
    qs.stringify({ grant_type: 'client_credentials', client_id: SICOOB_CLIENT_ID }),
    { httpsAgent: agent, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

function authMiddleware(req, res, next) {
  next();
}

app.post('/boleto', authMiddleware, async (req, res) => {
  try {
    const { numeroSeuPedido, valorOriginal, dataVencimento, nomeDevedor, cpfCnpjDevedor, emailDevedor, descricao } = req.body;
    const token = await getAccessToken();
    const agent = getMtlsAgent();
    const cpfLimpo = (cpfCnpjDevedor || '').replace(/\D/g, '');
    const payload = {
      numeroCooperativa: parseInt(SICOOB_NUMERO_COOPERATIVA),
      numeroBeneficiario: parseInt(SICOOB_CODIGO_BENEFICIARIO),
      numeroContrato: parseInt(SICOOB_CODIGO_BENEFICIARIO),
      modalidade: 1,
      numeroSeuPedido: String(numeroSeuPedido),
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento,
      valorOriginal: parseFloat(valorOriginal),
      pagador: {
        tipoPessoa: cpfLimpo.length === 11 ? 1 : 2,
        nome: nomeDevedor,
        cpfCnpj: cpfLimpo || '00000000000',
        email: emailDevedor || '',
      },
      mensagensInstrucao: { mensagem1: descricao || 'Pedido ' + numeroSeuPedido },
    };
    const response = await axios.post(COBRANCA_URL, payload, {
      httpsAgent: agent,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const boleto = response.data.resultado;
    res.json({
      sucesso: true,
      nossoNumero: boleto.nossoNumero,
      linhaDigitavel: boleto.linhaDigitavel,
      codigoBarras: boleto.codigoBarras,
      urlBoleto: boleto.urlBoleto || null,
      dataVencimento: boleto.dataVencimento,
      valor: boleto.valorOriginal,
    });
  } catch (err) {
    console.error('Erro ao gerar boleto:', err.response?.data || err.message);
    res.status(500).json({ sucesso: false, erro: err.response?.data || err.message });
  }
});

app.get('/boleto/:nossoNumero', authMiddleware, async (req, res) => {
  try {
    const token = await getAccessToken();
    const agent = getMtlsAgent();
    const response = await axios.get(
      `${COBRANCA_URL}/${req.params.nossoNumero}?numeroCooperativa=${SICOOB_NUMERO_COOPERATIVA}&numeroBeneficiario=${SICOOB_CODIGO_BENEFICIARIO}`,
      { httpsAgent: agent, headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ sucesso: true, boleto: response.data.resultado });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.response?.data || err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sicoob API rodando na porta ${PORT}`));
