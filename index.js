const express = require('express');
const axios = require('axios');
const https = require('https');
const qs = require('querystring');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SICOOB_CLIENT_ID = 'a698a074-065f-4653-9c47-764d56dbe957';
const SICOOB_CODIGO_BENEFICIARIO = 1319914;

const CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIHRDCCBSygAwIBAgIIVCImAyRqtu4wDQYJKoZIhvcNAQELBQAwWTELMAkGA1UE
BhMCQlIxEzARBgNVBAoTCklDUC1CcmFzaWwxFTATBgNVBAsTDEFDIFNPTFVUSSB2
NTEeMBwGA1UEAxMVQUMgU09MVVRJIE11bHRpcGxhIHY1MB4XDTI2MDMyNDIwMTcw
MFoXDTI3MDMyNDIwMTcwMFowgdoxCzAJBgNVBAYTAkJSMRMwEQYDVQQKEwpJQ1At
QnJhc2lsMQswCQYDVQQIEwJCQTESMBAGA1UEBxMJQmFycmVpcmFzMR4wHAYDVQQL
ExVBQyBTT0xVVEkgTXVsdGlwbGEgdjUxFzAVBgNVBAsTDjM5MTU3MDI3MDAwMTI4
MRkwFwYDVQQLExBWaWRlb2NvbmZlcmVuY2lhMRowGAYDVQQLExFDZXJ0aWZpY2Fk
byBQSiBBMTElMCMGA1UEAxMcT0NUQVZJVEEgTFREQTo2NTc2NTg0NTAwMDExMzCC
ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM1/Tw8RILL/mexFRTfCi5x4
9IoozQGhbH+Tqfbu06jmla5qDjKGg78GDh0CDxEe4aESZxxIRd1tlpe+Zt0Qcspz
Bg0oj68Y3JvDPJuXv/b+l6pSKdz+nWomTgBZC6uaw7iSR9CkCFXflC37PwL5tTjF
wT0qkg6lGA22+v3QvfLjOEeXXWBT5g+v2eQ3DDmNBfetJPD0/FwgegVaSexzD5Vb
0YzykJxpYgbH6HLNjbqLK+n/AaxDK4dx3mpsz9pvIQWdI+7hlyacDnQr0kwAMPgn
5Ydm8dP0x+smFqJnvSzJujNS0jqSQbvov6elegRRXSPyu6G01bkE4l8MDy8ENnEC
AwEAAaOCAowwggKIMAkGA1UdEwQCMAAwHwYDVR0jBBgwFoAUxVLtJYAJ35yCyJ9H
xt20XzHdubEwVAYIKwYBBQUHAQEESDBGMEQGCCsGAQUFBzAChjhodHRwOi8vY2Nk
LmFjc29sdXRpLmNvbS5ici9sY3IvYWMtc29sdXRpLW11bHRpcGxhLXY1LnA3YjCB
xwYDVR0RBIG/MIG8gR9kYW5pZWx0cml1bmZvY2FydHJ1Y2tAZ21haWwuY29toCsG
BWBMAQMCoCITIERBTklFTCBQRVJFSVJBIERPUyBTQU5UT1MgSlVOSU9SoBkGBWBM
AQMDoBATDjY1NzY1ODQ1MDAwMTEzoDgGBWBMAQMEoC8TLTI1MDQxOTg3MDI0NjUy
NzY1MDYwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMKAXBgVgTAEDB6AOEwwwMDAw
MDAwMDAwMDAwXQYDVR0gBFYwVDBSBgZgTAECASYwSDBGBggrBgEFBQcCARY6aHR0
cDovL2NjZC5hY3NvbHV0aS5jb20uYnIvZG9jcy9kcGMtYWMtc29sdXRpLW11bHRp
cGxhLnBkZjAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwQwgYwGA1UdHwSB
hDCBgTA+oDygOoY4aHR0cDovL2NjZC5hY3NvbHV0aS5jb20uYnIvbGNyL2FjLXNv
bHV0aS1tdWx0aXBsYS12NS5jcmwwP6A9oDuGOWh0dHA6Ly9jY2QyLmFjc29sdXRp
LmNvbS5ici9sY3IvYWMtc29sdXRpLW11bHRpcGxhLXY1LmNybDAdBgNVHQ4EFgQU
1IVRhwbBSG/IMB06mkkFXJ+KJ0swDgYDVR0PAQH/BAQDAgXgMA0GCSqGSIb3DQEB
CwUAA4ICAQChVBHzF69LR4RElu1jM2VBHpWP9IRNW/Ryz/6yIgsLGtRPL1UNwGZS
EGSpFTzbA1moRtfaZqffRjY49chXKiEpuCONEfB4qP2lcjo0LJPTg8kJeE0o5+Gh
NZ8dKhY+XBwXqX3Zup6JnpANMy9S+RA2W0iUw5FIlXzGa6VENm9Gg1OUQ2iIcQ5E
YrcffNCfBmBdYVJXgRg6QTzH20ZobgueQ6xtOxdXDOm1hwlyhCExEXpNj4s0WhII
+C0zP4HuUmUB6AT0Ubuam+STvTpKrtB6nIdnbNUBNDP2/K1dQb2amoQ5OQ+aF0qe
zGCvZVhZOgob+Ir6iVBtdKsM10nslRcmND0RrmXCf3hwQqMyUqrnkBiC1g243+ur
0kwV4z6Yy9BpU3Z89lYw1FhEegFJViFKpczdzZghPkhOOPB0RqsEYZTmwOpWlB0h
4K5jhRe9T+Xqf8dLfbG+EyHDxtRTUx7+5467KlTC81u2sG7BLHNLM/YNO5TR8G/D
/jPuwstxZRPtX4NLGhbwIQPgqekdI6tBDiWssEh4dYPvH0uAHkMvJl5XnuT5lYAp
WSZqWEJpec9XWx9SDiswg2Xp8NRKCG3QVgLR909/feZbXhoNHmkOl8SEb5rDmQ3n
K+r+D1gDVlSo9V8+TGiWinMf74QNWtkWED/oP1ne0XmSugZmHeOZQg==
-----END CERTIFICATE-----`;
const KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNf08PESCy/5ns
RUU3woucePSKKM0BoWx/k6n27tOo5pWuag4yhoO/Bg4dAg8RHuGhEmccSEXdbZaX
vmbdEHLKcwYNKI+vGNybwzybl7/2/peqUinc/p1qJk4AWQurmsO4kkfQpAhV35Qt
+z8C+bU4xcE9KpIOpRgNtvr90L3y4zhHl11gU+YPr9nkNww5jQX3rSTw9PxcIHoF
Wknscw+VW9GM8pCcaWIGx+hyzY26iyvp/wGsQyuHcd5qbM/abyEFnSPu4ZcmnA50
K9JMADD4J+WHZvHT9MfrJhaiZ70sybozUtI6kkG76L+npXoEUV0j8ruhtNW5BOJf
DA8vBDZxAgMBAAECggEAAttFLxFu4e4ZpqYj2y2SIT+xLoZ4qxAiYPedgjg5qvxh
kkYZImyqQiqEYbTYnsVOH54Q3tzGU9ilIkDcTzBeWCAXMnGg5a8zydqB6ivG2Fkb
pJt1x4OmjoYvyWNzfRQuqk8mPmk5UHBGMAlxC8qK0Vo2YHJKC3gSCIbFoGeZbFnj
2l/2KZu5AJ9yHjX/Mg7Iu/IjsznHwbziivuxfx0SBnx0dACWiqFbBZvj2JuaLJm3
NYqBTf0ulqkwx3/cvhoIOi9iAFWm+xCPehcwkV4i+P3sr3Rzz9a4BDu95H13c0Fr
u5fBSQNwxH76RMjzKdNHOUGcAQjPDjw4UBIsqsVhwQKBgQDroVqVL0uIkEgbdNrx
sAJf4C62Jef4N1azAZJR1J96Ce2lW7x+SEu1IfNhQtW8jrEoQQYJZQpOIGBIxvnn
wpiOeZ1PMrIoq7YS3krB6h8TRt+X9gedvJfoOJvb3EPKeIJtmYRMdLG5fBztMsyx
4Y3VdAIZkl1L/XLxEChCBHIMmQKBgQDfQxfRlfKOS9q/77+/eYedvMNhM7uHOs7B
tm/g0tHb6/Z6vxwQ3Lc0WcFKoV66Wj/LGtyhlpx2CP4SNoSKztbC0cyig4TFHFO0
lojsQaVyPYkGpZD+BTqhm5CoTXx7olSCjQYyYMpk3Bv53VIxS/K51nw4yASdZBk8
QYujT6aHmQKBgFY8MjuhGIK9UzaBONP1N5lBIbdV/iSQlDFlJNi/+TGfypKXFVAe
Q17iMwFohXLBwkJaMcxkZzYakUJxV+qjBFQ4XAMtKZjK5xLWugNoHMFgUdp6l2T6
LZo2hYwce87w9cMIySt2FcktjCSfT9zWEKOLFm2nbG+wLU3ePO2UVO0ZAoGBAIj0
VUYh33remT+oSE2itUhTpN6Zp22a63309chKSqXHp5lAZm0Jl/CrJmErgDp8Zimn
PrR4+V2GwqRVgRTNMPytSgRe/TEU4VwkA7Y5xs2/ZbEIG1tXxdGg5in37mbA+2pi
K+z3ZvBb/WVXGLZYynqpUeZa/Em4P6qw4oG5uIPxAoGBANreWlOrrZE0Ma27EpsY
RbSm8Ar8xOT6oCaY74SmV1z2oO0QkyoN35bOdBJgfm5jg8tfXz84tNXaDUl9rFZq
BFHsR5K2B7UmKrCXC9wJ0EnBTvifyDR4AECsfba/uP9gjwOupetKjhs7jwFJnfs3
hTHWFlRQervzreutYE/BT/XF
-----END PRIVATE KEY-----`;

const TOKEN_URL = 'https://auth.sicoob.com.br/auth/realms/cooperado/protocol/openid-connect/token';
const COBRANCA_URL = 'https://api.sicoob.com.br/cobranca-bancaria/v3/boletos';

console.log('STARTUP: CERT len=' + CERT_PEM.length + ' KEY len=' + KEY_PEM.length);

function getMtlsAgent() {
  return new https.Agent({
    cert: CERT_PEM,
    key: KEY_PEM,
    rejectUnauthorized: true,
  });
}

async function getAccessToken() {
  const agent = getMtlsAgent();
  const response = await axios.post(TOKEN_URL,
    qs.stringify({ grant_type: 'client_credentials', client_id: SICOOB_CLIENT_ID }),
    { httpsAgent: agent, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  console.log('Token scope:', response.data.scope);
  console.log('Token obtido com sucesso!');
  return response.data.access_token;
}

function authMiddleware(req, res, next) {
  next();
}

app.post('/boleto', authMiddleware, async (req, res) => {
  try {
    const { numeroSeuPedido, valorOriginal, dataVencimento, nomeDevedor, cpfCnpjDevedor, emailDevedor, descricao } = req.body;
    console.log('Gerando boleto V3 para:', nomeDevedor, 'valor:', valorOriginal);

    const token = await getAccessToken();
    const agent = getMtlsAgent();
    const cpfLimpo = (cpfCnpjDevedor || '').replace(/\D/g, '') || '00000000191';

    const payload = {
      numeroContrato: SICOOB_CODIGO_BENEFICIARIO,
      modalidade: 1,
      numeroSeuPedido: String(numeroSeuPedido),
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento,
      valorNominal: parseFloat(valorOriginal),
      pagador: {
        tipoPessoa: cpfLimpo.length === 14 ? 'J' : 'F',
        nomeRazaoSocial: nomeDevedor || 'Cliente',
        numeroCpfCnpj: cpfLimpo,
        email: emailDevedor || '',
      },
      mensagensInstrucao: {
        mensagem1: descricao || 'Pedido ' + numeroSeuPedido,
      },
    };

    console.log('Payload:', JSON.stringify(payload));

    const response = await axios.post(COBRANCA_URL, payload, {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'client_id': SICOOB_CLIENT_ID,
      },
    });

    console.log('Resposta Sicoob:', JSON.stringify(response.data));
    const boleto = response.data.resultado || response.data;

    res.json({
      sucesso: true,
      nossoNumero: boleto.nossoNumero || boleto.numeroNossoNumero,
      linhaDigitavel: boleto.linhaDigitavel || boleto.numeroLinhaDigitavel,
      codigoBarras: boleto.codigoBarras || boleto.numeroCodigoBarras,
      urlBoleto: boleto.urlBoleto || null,
      dataVencimento: boleto.dataVencimento,
      valor: boleto.valorNominal || boleto.valorOriginal,
    });
  } catch (err) {
    console.error('Erro:', err.response?.data || err.message);
    res.status(500).json({ sucesso: false, erro: err.response?.data || err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sicoob API rodando na porta ${PORT}`));
