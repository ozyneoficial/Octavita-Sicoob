const express = require('express');
const axios = require('axios');
const https = require('https');
const qs = require('querystring');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SICOOB_CLIENT_ID = 'a698a074-065f-4653-9c47-764d56dbe957';
const SICOOB_NUMERO_COOPERATIVA = '3055';
const SICOOB_CODIGO_BENEFICIARIO = '1319914';
const SICOOB_CERT_PEM = 'Bag Attributes\n    localKeyID: 15 BA B2 6B 24 61 62 A7 4B 62 31 D3 97 AC 38 16 4C 1D FB 67 \nsubject=C = BR, O = ICP-Brasil, ST = BA, L = Barreiras, OU = AC SOLUTI Multipla v5, OU = 39157027000128, OU = Videoconferencia, OU = Certificado PJ A1, CN = OCTAVITA LTDA:65765845000113\nissuer=C = BR, O = ICP-Brasil, OU = AC SOLUTI v5, CN = AC SOLUTI Multipla v5\n-----BEGIN CERTIFICATE-----\nMIIHRDCCBSygAwIBAgIIVCImAyRqtu4wDQYJKoZIhvcNAQELBQAwWTELMAkGA1UE\nBhMCQlIxEzARBgNVBAoTCklDUC1CcmFzaWwxFTATBgNVBAsTDEFDIFNPTFVUSSB2\nNTEeMBwGA1UEAxMVQUMgU09MVVRJIE11bHRpcGxhIHY1MB4XDTI2MDMyNDIwMTcw\nMFoXDTI3MDMyNDIwMTcwMFowgdoxCzAJBgNVBAYTAkJSMRMwEQYDVQQKEwpJQ1At\nQnJhc2lsMQswCQYDVQQIEwJCQTESMBAGA1UEBxMJQmFycmVpcmFzMR4wHAYDVQQL\nExVBQyBTT0xVVEkgTXVsdGlwbGEgdjUxFzAVBgNVBAsTDjM5MTU3MDI3MDAwMTI4\nMRkwFwYDVQQLExBWaWRlb2NvbmZlcmVuY2lhMRowGAYDVQQLExFDZXJ0aWZpY2Fk\nbyBQSiBBMTElMCMGA1UEAxMcT0NUQVZJVEEgTFREQTo2NTc2NTg0NTAwMDExMzCC\nASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM1/Tw8RILL/mexFRTfCi5x4\n9IoozQGhbH+Tqfbu06jmla5qDjKGg78GDh0CDxEe4aESZxxIRd1tlpe+Zt0Qcspz\nBg0oj68Y3JvDPJuXv/b+l6pSKdz+nWomTgBZC6uaw7iSR9CkCFXflC37PwL5tTjF\nwT0qkg6lGA22+v3QvfLjOEeXXWBT5g+v2eQ3DDmNBfetJPD0/FwgegVaSexzD5Vb\n0YzykJxpYgbH6HLNjbqLK+n/AaxDK4dx3mpsz9pvIQWdI+7hlyacDnQr0kwAMPgn\n5Ydm8dP0x+smFqJnvSzJujNS0jqSQbvov6elegRRXSPyu6G01bkE4l8MDy8ENnEC\nAwEAAaOCAowwggKIMAkGA1UdEwQCMAAwHwYDVR0jBBgwFoAUxVLtJYAJ35yCyJ9H\nxt20XzHdubEwVAYIKwYBBQUHAQEESDBGMEQGCCsGAQUFBzAChjhodHRwOi8vY2Nk\nLmFjc29sdXRpLmNvbS5ici9sY3IvYWMtc29sdXRpLW11bHRpcGxhLXY1LnA3YjCB\nxwYDVR0RBIG/MIG8gR9kYW5pZWx0cml1bmZvY2FydHJ1Y2tAZ21haWwuY29toCsG\nBWBMAQMCoCITIERBTklFTCBQRVJFSVJBIERPUyBTQU5UT1MgSlVOSU9SoBkGBWBM\nAQMDoBATDjY1NzY1ODQ1MDAwMTEzoDgGBWBMAQMEoC8TLTI1MDQxOTg3MDI0NjUy\nNzY1MDYwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMKAXBgVgTAEDB6AOEwwwMDAw\nMDAwMDAwMDAwXQYDVR0gBFYwVDBSBgZgTAECASYwSDBGBggrBgEFBQcCARY6aHR0\ncDovL2NjZC5hY3NvbHV0aS5jb20uYnIvZG9jcy9kcGMtYWMtc29sdXRpLW11bHRp\ncGxhLnBkZjAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwQwgYwGA1UdHwSB\nhDCBgTA+oDygOoY4aHR0cDovL2NjZC5hY3NvbHV0aS5jb20uYnIvbGNyL2FjLXNv\nbHV0aS1tdWx0aXBsYS12NS5jcmwwP6A9oDuGOWh0dHA6Ly9jY2QyLmFjc29sdXRp\nLmNvbS5ici9sY3IvYWMtc29sdXRpLW11bHRpcGxhLXY1LmNybDAdBgNVHQ4EFgQU\n1IVRhwbBSG/IMB06mkkFXJ+KJ0swDgYDVR0PAQH/BAQDAgXgMA0GCSqGSIb3DQEB\nCwUAA4ICAQChVBHzF69LR4RElu1jM2VBHpWP9IRNW/Ryz/6yIgsLGtRPL1UNwGZS\nEGSpFTzbA1moRtfaZqffRjY49chXKiEpuCONEfB4qP2lcjo0LJPTg8kJeE0o5+Gh\nNZ8dKhY+XBwXqX3Zup6JnpANMy9S+RA2W0iUw5FIlXzGa6VENm9Gg1OUQ2iIcQ5E\nYrcffNCfBmBdYVJXgRg6QTzH20ZobgueQ6xtOxdXDOm1hwlyhCExEXpNj4s0WhII\n+C0zP4HuUmUB6AT0Ubuam+STvTpKrtB6nIdnbNUBNDP2/K1dQb2amoQ5OQ+aF0qe\nzGCvZVhZOgob+Ir6iVBtdKsM10nslRcmND0RrmXCf3hwQqMyUqrnkBiC1g243+ur\n0kwV4z6Yy9BpU3Z89lYw1FhEegFJViFKpczdzZghPkhOOPB0RqsEYZTmwOpWlB0h\n4K5jhRe9T+Xqf8dLfbG+EyHDxtRTUx7+5467KlTC81u2sG7BLHNLM/YNO5TR8G/D\n/jPuwstxZRPtX4NLGhbwIQPgqekdI6tBDiWssEh4dYPvH0uAHkMvJl5XnuT5lYAp\nWSZqWEJpec9XWx9SDiswg2Xp8NRKCG3QVgLR909/feZbXhoNHmkOl8SEb5rDmQ3n\nK+r+D1gDVlSo9V8+TGiWinMf74QNWtkWED/oP1ne0XmSugZmHeOZQg==\n-----END CERTIFICATE-----\nBag Attributes: <Empty Attributes>\nsubject=C = BR, O = ICP-Brasil, OU = AC SOLUTI v5, CN = AC SOLUTI Multipla v5\nissuer=C = BR, O = ICP-Brasil, OU = Autoridade Certificadora Raiz Brasileira v5, CN = AC SOLUTI v5\n-----BEGIN CERTIFICATE-----\nMIIHFjCCBP6gAwIBAgIBDDANBgkqhkiG9w0BAQ0FADBvMQswCQYDVQQGEwJCUjET\nMBEGA1UEChMKSUNQLUJyYXNpbDE0MDIGA1UECxMrQXV0b3JpZGFkZSBDZXJ0aWZp\nY2Fkb3JhIFJhaXogQnJhc2lsZWlyYSB2NTEVMBMGA1UEAxMMQUMgU09MVVRJIHY1\nMB4XDTE5MDIwNTE0MzQ1NloXDTI5MDMwMjExNTg1OVowWTELMAkGA1UEBhMCQlIx\nEzARBgNVBAoTCklDUC1CcmFzaWwxFTATBgNVBAsTDEFDIFNPTFVUSSB2NTEeMBwG\nA1UEAxMVQUMgU09MVVRJIE11bHRpcGxhIHY1MIICIjANBgkqhkiG9w0BAQEFAAOC\nAg8AMIICCgKCAgEAuIIdPZR/Ntz47joJvl7bf95r1gdFRBMo+evFua6ExWPPifqy\n6/gO97XvtjJuMdJIYqExiijS0STmUP2Sq1BDOz8VkpTBAzF6wiDMX4224uWn7ndK\n8J3BmOWzmIj4Lfk+lFNbwIYSeJ6/C6TSwcZpqQy6NOhLW3eOIr+EWdJFEiyr2yU0\nhzSRvDtdmpl2DzntlUO+5pgM5YD5GR/YxsrrycCV10ZSXN7BJLGIVZAg0BBc5d8/\nQYBqzk7FKdviRi2k79XV+feH1UzpUaOD2s/fTQqqhDDaNEbd+LpP9pVeuB/xxuSK\n70SDDWFoaKP4dqxgDBEZIAPUOJ9aIFiVUFJxNPTBgQVTb5mdKknLywVCMPA8Nf88\niv1gEk3wZq3y4kyJddg5UrIVnY2xzoG3z61/N93ty1B7Inpm3D917bvuLXaYcGfD\nGyPYSKXITc8yvdB8FuUW3C3ugTUxU7IywrP0M58jGYXbEWotHG1CwDwureKRVaYn\nzt062NDYOha7r88bXD4FymU4ieMyYN/SX0VviCXnzG+x4lWYwj+r29gSZ2LBSAe3\nq5MePTRkU3V25Fopm7olQka7zpuKTN7ITFQWJ78yhKEdcUEAsTB03BhAPXdJ0iUj\noPzFIdUZAtfa4KP/C/YODMo/oY9ru/OrOoOixte8koyHAbQube9OFZ7ATNsCAwEA\nAaOCAdEwggHNMB0GA1UdDgQWBBTFUu0lgAnfnILIn0fG3bRfMd25sTAPBgNVHRMB\nAf8EBTADAQH/MB8GA1UdIwQYMBaAFErHl9y4Wa0KBztHVSbf1bInrnpxMIHvBgNV\nHSAEgecwgeQwSgYGYEwBAgEmMEAwPgYIKwYBBQUHAgEWMmh0dHBzOi8vY2NkLmFj\nc29sdXRpLmNvbS5ici9kb2NzL2RwYy1hYy1zb2x1dGkucGRmMEoGBmBMAQIEDzBA\nMD4GCCsGAQUFBwIBFjJodHRwczovL2NjZC5hY3NvbHV0aS5jb20uYnIvZG9jcy9k\ncGMtYWMtc29sdXRpLnBkZjBKBgZgTAECAyUwQDA+BggrBgEFBQcCARYyaHR0cHM6\nLy9jY2QuYWNzb2x1dGkuY29tLmJyL2RvY3MvZHBjLWFjLXNvbHV0aS5wZGYweAYD\nVR0fBHEwbzA1oDOgMYYvaHR0cDovL2NjZC5hY3NvbHV0aS5jb20uYnIvbGNyL2Fj\nLXNvbHV0aS12NS5jcmwwNqA0oDKGMGh0dHA6Ly9jY2QyLmFjc29sdXRpLmNvbS5i\nci9sY3IvYWMtc29sdXRpLXY1LmNybDAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcN\nAQENBQADggIBALRfV/fT9jlFPGFrAa1Hnri1WgOlG9dhBL2orVahlkeS4NXe2FyT\n8VbOmhOkWGsHoCd7jwly7v5Q1CMo3Uw92E8akgqtbXj9kTXB80tSDctkIC++eAil\nOJCFMYomK5/X8TjVwj9KSnWRgXihEd+Hc/bowV7nIe3B6Ebs+C2VoVkkMT6qT/Tq\nafrmIH9uJfvKWuOWtGv4RLNTg6YHxqEUnD+R+l0iohxuh29+uaJhjElRrd8gNFqv\nEDWm4EdhWTvzMkZdH4Zun1yMUl5Y3CdD5zSLOVcgGrmE0Skh9drDZTN4BdV84FJT\nGrj0DwANXUNSihpaMr32Cnav7J0zmDFXeM7tIj/CVfmxQczVfRlwSb2LM+NE8+Xk\nQFZfeHOOa2ioeI1jlGuLjuLqj9yVAX2Vn/MkFsA1tt9CeHCEI7cEBi55B9bgjBNN\n1kOC9XZBdxp5RS3eZSe6T1AZovxgAQEirEKmCxmlICDz4qVh1SgT3Gvj7Pubrv6S\nqL7dJK6VxQlUPJAibQDn29uyqwHwFX/jmbxol3GOE3ae1AKBFONwlE2YkwJb5li+\nIGnUeFgIwiQwZdm43TFu68QeTE2Mq30w0GsY6nbLhOnBbsrmX+dBwWi85JFtZsy9\ny3Kr+jNdExUPIc7VQbYZGu+5cdHthRJcTnllZeQU36sTKznw5NK0QhdR\n-----END CERTIFICATE-----\nBag Attributes: <Empty Attributes>\nsubject=C = BR, O = ICP-Brasil, OU = Autoridade Certificadora Raiz Brasileira v5, CN = AC SOLUTI v5\nissuer=C = BR, O = ICP-Brasil, OU = Instituto Nacional de Tecnologia da Informacao - ITI, CN = Autoridade Certificadora Raiz Brasileira v5\n-----BEGIN CERTIFICATE-----\nMIIGPjCCBCagAwIBAgIBCzANBgkqhkiG9w0BAQ0FADCBlzELMAkGA1UEBhMCQlIx\nEzARBgNVBAoMCklDUC1CcmFzaWwxPTA7BgNVBAsMNEluc3RpdHV0byBOYWNpb25h\nbCBkZSBUZWNub2xvZ2lhIGRhIEluZm9ybWFjYW8gLSBJVEkxNDAyBgNVBAMMK0F1\ndG9yaWRhZGUgQ2VydGlmaWNhZG9yYSBSYWl6IEJyYXNpbGVpcmEgdjUwHhcNMTgw\nNjI5MTg1NTIwWhcNMjkwMzAyMTIwMDIwWjBvMQswCQYDVQQGEwJCUjETMBEGA1UE\nChMKSUNQLUJyYXNpbDE0MDIGA1UECxMrQXV0b3JpZGFkZSBDZXJ0aWZpY2Fkb3Jh\nIFJhaXogQnJhc2lsZWlyYSB2NTEVMBMGA1UEAxMMQUMgU09MVVRJIHY1MIICIjAN\nBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtoQbmI4YZawD53+Un9kiyaLa1Yf0\nOtZ1HtRX8dEJ/a8gMegdj8octdGAid1SKe7IMYRCN554iZldoDhfK7YLJxbjQaT/\nOfA7fRu6uA7z7joS34zdYhEN4P4EgL3DTCQPVzStjExIhu+qG0VV4cuZQ8n+jrRL\n653/liXqTwgVJd1YHZO/vQnjWWUmuANO1Gxp/cIRjASUenWfT0LV3Uiu9x9ZwYi/\nfS6eX7ihmpxVgRrzf717EcYZziVjNJj/wwLRbVs4pgz005d+W96iqxhi0Hb/f4rB\nYqYci9DwEFzYdvkkk62KbrbHw+lhpGXdQs+wHPYR8rh6nxdNwMuXLyF1UU9EXxy5\nTGsrbQmCdjWVDcJs2ViLDcmBHSdvLcgkOQYj7vCw5Mpfu+7s2veGa0H/U+FrdYSn\n4JXy9E78TNcRv5mV1y98eDR4iHSSJMPcPmn54QImkoXwch6t5EmmPEd1FpPD0bw5\ncs8Fm30GFkIH1245ANRI298V9s3qcR+hHTKianI7uFmrgZEPu8hl8rNnQmAo1q8X\nOShp8h9XB1xh6I9yETNX+LbaPsoZ7iFNbvQ6+TLxBzM6wcKaT9eW6DXscIRFviyq\neLy2finG9IE9hGYVeWoLl2uGVqFr124HTLppej/0Wbfel7QjDL0I99u2vKviD14J\n+2E+UBLjsFgOf5UCAwEAAaOBuzCBuDAUBgNVHSAEDTALMAkGBWBMAQEuMAAwPwYD\nVR0fBDgwNjA0oDKgMIYuaHR0cDovL2FjcmFpei5pY3BicmFzaWwuZ292LmJyL0xD\nUmFjcmFpenY1LmNybDAfBgNVHSMEGDAWgBRpqL512cTvbOcTReRhbuVo+LZAXjAd\nBgNVHQ4EFgQUSseX3LhZrQoHO0dVJt/VsieuenEwDwYDVR0TAQH/BAUwAwEB/zAO\nBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQENBQADggIBAHTHprVP4HJFNsMWtG/1\nuj+CRSITHaIqKokRSoDFGRuxKLWNAXv1G59Ioyn0iiQimDUijBSVizNBHRFYpxs6\nJ+0Ju9z8cHUWahqBkqhMLNNzPDjWCgxiBCGwMHvkSku1nJHkKf0Tbo7XL5GvZTE7\nrXY4phop6hqImfCPdaG9uoI2RENAuGF5Vsa/7I7x3pbKwQV78UbmrFfCoLrZB8e3\npawY5JVxZU5PHyf59A+g8l9o5g7IqMtkKdpq2r52q/1SRaRZHWYwMc2o823nb57f\njP+n21Ccxnve2j3a1lmsCbpvfwgkku9xTzOE3BhTSFYMUGeD7FUfSmztTxuvtYGG\n4dKqfHXYmKE/GHtrKwbj4zU9DNsItO4BXCGnJg+Cm/1qJAvCBT8NHMwPp82jvxc7\nJC3KSREmLFQfhj5ndMi0T/B0HWhOEpe30GeZQToRxjPjV68UBjURNzEybWMTQwPf\n5hx6TtxCQ1ogUNR9Em/qmt3EWxXB+JDv3CgjeCNgzQQ8AQHdAvRYDu7z8xNhTaE+\nSL9+Ctp1LS9O9n8Miu4ZwsG/WP0A36ftUQSZ9QizDue2iS4HCvK8qhBWmqq8bF5p\nnPWCXSxxj7x+rKo648BBJSKpd4B5sQW+YG43ONUuE6VmFio4ofrwjvf+xZVoghfk\nADeq6/5hsGNJsLzXDfr6hCDB\n-----END CERTIFICATE-----\nBag Attributes: <Empty Attributes>\nsubject=C = BR, O = ICP-Brasil, OU = Instituto Nacional de Tecnologia da Informacao - ITI, CN = Autoridade Certificadora Raiz Brasileira v5\nissuer=C = BR, O = ICP-Brasil, OU = Instituto Nacional de Tecnologia da Informacao - ITI, CN = Autoridade Certificadora Raiz Brasileira v5\n-----BEGIN CERTIFICATE-----\nMIIGoTCCBImgAwIBAgIBATANBgkqhkiG9w0BAQ0FADCBlzELMAkGA1UEBhMCQlIx\nEzARBgNVBAoMCklDUC1CcmFzaWwxPTA7BgNVBAsMNEluc3RpdHV0byBOYWNpb25h\nbCBkZSBUZWNub2xvZ2lhIGRhIEluZm9ybWFjYW8gLSBJVEkxNDAyBgNVBAMMK0F1\ndG9yaWRhZGUgQ2VydGlmaWNhZG9yYSBSYWl6IEJyYXNpbGVpcmEgdjUwHhcNMTYw\nMzAyMTMwMTM4WhcNMjkwMzAyMjM1OTM4WjCBlzELMAkGA1UEBhMCQlIxEzARBgNV\nBAoMCklDUC1CcmFzaWwxPTA7BgNVBAsMNEluc3RpdHV0byBOYWNpb25hbCBkZSBU\nZWNub2xvZ2lhIGRhIEluZm9ybWFjYW8gLSBJVEkxNDAyBgNVBAMMK0F1dG9yaWRh\nZGUgQ2VydGlmaWNhZG9yYSBSYWl6IEJyYXNpbGVpcmEgdjUwggIiMA0GCSqGSIb3\nDQEBAQUAA4ICDwAwggIKAoICAQD3LXgabUWsF+gUXw/6YODeF2XkqEyfk3VehdsI\nx+3/ERgdjCS/ouxYR0Epi2hdoMUVJDNf3XQfjAWXJyCoTneHYAl2McMdvoqtLB2i\nleQlJiis0fTtYTJayee9BAIdIrCor1Lc0vozXCpDtq5nTwhjIocaZtcuFsdrkl+n\nbfYxl5m7vjTkTMS6j8ffjmFzbNPDlJuV3Vy7AzapPVJrMl6UHPXCHMYMzl0KxR/4\n7S5XGgmLYkYt8bNCHA3fg07y+Gtvgu+SNhMPwWKIgwhYw+9vErOnavRhOimYo4M2\nAwNpNK0OKLI7Im5V094jFp4Ty+mlmfQH00k8nkSUEN+1TGGkhv16c2hukbx9iCfb\nmk7im2hGKjQA8eH64VPYoS2qdKbPbd3xDDHN2croYKpy2U2oQTVBSf9hC3o6fKo3\nzp0U3dNiw7ZgWKS9UwP31Q0gwgB1orZgLuF+LIppHYwxcTG/AovNWa4sTPukMiX2\nL+p7uIHExTZJJU4YoDacQh/mfbPIz3261He4YFmQ35sfw3eKHQSOLyiVfev/n0l/\nr308PijEd+d+Hz5RmqIzS8jYXZIeJxym4mEjE1fKpeP56Ea52LlIJ8ZqsJ3xzHWu\n3WkAVz4hMqrX6BPMGW2IxOuEUQyIaCBg1lI6QLiPMHvo2/J7gu4YfqRcH6i27W3H\nyzamEQIDAQABo4H1MIHyME4GA1UdIARHMEUwQwYFYEwBAQAwOjA4BggrBgEFBQcC\nARYsaHR0cDovL2FjcmFpei5pY3BicmFzaWwuZ292LmJyL0RQQ2FjcmFpei5wZGYw\nPwYDVR0fBDgwNjA0oDKgMIYuaHR0cDovL2FjcmFpei5pY3BicmFzaWwuZ292LmJy\nL0xDUmFjcmFpenY1LmNybDAfBgNVHSMEGDAWgBRpqL512cTvbOcTReRhbuVo+LZA\nXjAdBgNVHQ4EFgQUaai+ddnE72znE0XkYW7laPi2QF4wDwYDVR0TAQH/BAUwAwEB\n/zAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQENBQADggIBABRt2/JiWapef7o/\nplhR4PxymlMIp/JeZ5F0BZ1XafmYpl5g6pRokFrIRMFXLyEhlgo51I05InyCc9Td\n6UXjlsOASTc/LRavyjB/8NcQjlRYDh6xf7OdP05mFcT/0+6bYRtNgsnUbr10pfsK\n/UzyUvQWbumGS57hCZrAZOyd9MzukiF/azAa6JfoZk2nDkEudKOY8tRyTpMmDzN5\nfufPSC3v7tSJUqTqo5z7roN/FmckRzGAYyz5XulbOc5/UsAT/tk+KP/clbbqd/hh\nevmmdJclLr9qWZZcOgzuFU2YsgProtVu0fFNXGr6KK9fu44pOHajmMsTXK3X7r/P\nwh19kFRow5F3RQMUZC6Re0YLfXh+ypnUSCzA+uL4JPtHIGyvkbWiulkustpOKUSV\nwBPzvA2sQUOvqdbAR7C8jcHYFJMuK2HZFji7pxcWWab/NKsFcJ3sluDjmhizpQax\nbYTfAVXu3q8yd0su/BHHhBpteyHvYyyz0Eb9LUysR2cMtWvfPU6vnoPgYvOGO1Cz\niyGEsgKULkCH4o2Vgl1gQuKWO4V68rFW8a/jvq28sbY+y/Ao0I5ohpnBcQOAawiF\nbz6yJtObajYMuztDDP8oY656EuuJXBJhuKAJPI/7WDtgfV8ffOh/iQGQATVMtgDN\n0gv8bn5NdUX8UMNX1sHhU3H1UpoW\n-----END CERTIFICATE-----\nBag Attributes\n    localKeyID: 15 BA B2 6B 24 61 62 A7 4B 62 31 D3 97 AC 38 16 4C 1D FB 67 \nKey Attributes: <No Attributes>\n-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQI7wkRl9wTt/YCAggA\nMAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECFX1dd1x4JIlBIIEyOG8r3DooqOY\n8RdgGin++11qbhinK+YYc7qxqgNN2WDGa1aVZoSjQwQqNJHt+B98aJtEDjqx7TRo\nEW3JbUd3TS7D7HABVzSKvllwoNanoD1a/ePRt+/gpziEow20y1gaIh2uu+ef0ONE\n6A4S8BzRQ9CBrKvYQusP+6MQW3582Tl9IWv6BCVZR4nXg5J6fmIvsSiambCX2zEE\nOzfflGe85wug/YQ5RkbJUoOhAr6I4ZccfqGuZw1Xr+0t9vkOHl9q1HqLvNIU/YY7\nZzs3KkCYp+lCXtgBsPwwR2hnDCP8nz/dLBK5VFv2WsspzrfK9rfahPw5QvkqVPQY\n9b93D/OX8QBCtSq0ZvhfjAimJezrbiWhkGuYA3CATAaebk88LziN9YNuB1+bGjj2\nhkQE9irAWHu1y/KqXk/GDMlkFoKT/RrYCqAMOTBblmu+QkNCYCr7EB8PE/eibr2a\nyMVAkbo+acwUSnXBQdMFFBtmBDUoQ8xPEks4DOZbyjibetEPKCKRqWmU4p7YyHi4\n5JddymBaBuEE7S8CtrZV8OW6vF7AxiO5blIsHQsbbS/hc7T13MLmfiJsFL7HNDKB\nIXUYd1MF5K+flNK8teRRKJSEeHuOKL0O8XZZdf6HkIjf7fykirjIB23TW3VV27sj\nyAXG1GFTCmwAn6qCK3AGrq/tNjixEcRn//z3yrO39QGqNF9uYFoUCDNr4KV7Q1Aw\ntBSovI+9ruTnJMnNWdPb7YEzaGJQ+WllpeV7bwD/+L/frxlxetf0DVgYr7GyPv7h\n8NABbTY2t+wdeO4i3v8Wd5xg/t8bbZozCZ2y8jzU9dKFJJWYuTWrJENnw2nILXha\n1aoaLYMBHguhfkyC67DJc7xaEuE5xJ4qnOQcbVNrGWZ8iH3+1va+ZbCXnq4AkYuQ\nyWRmaH6dQFiEd1rfj+MxXGMN31bZHpzZ/9Ecf9Af0is5ftV+Kz9hcVfVBk1Gi2SD\nB/ZSHUEohqOTULY4Y3Gge0oJ9Z2Ov5ZwNM/Z+bCSkJOP88cPt6hHH86CZOouN8e1\nPVyBIXyI43GwLulnHrqQJWePjqjCVhxuHsXb2VKTUosB+DeWAYjU0BZSU2o//wVr\nMYNVnOov8CSMaqvm8bcsHYH7YrXwN/50wNrG11VFaAlN4Ck99RG5RcH8VZ5khh4I\nvaQWO/eDBnPO7RwgC+V3kLEt6OD0dxw+AAlsEdr8/w6PbffWwohdNnU92zIE0RDJ\nEhiZcSq5dkTxV8pe7hmeSt1fGUvNZ7vnkmQIhnvjVC/Nc1eDCZlkvKqo2sCttacO\nbWodJHq1GEf3cqqNwc9myhh4ylW+oCRToRUDlgEXLPb9K8N/gdMHnTf7BPIt//9q\nMFRGJtaFbd9QSR0aI4dQlJpzi9mFulX069HZQe3Cb+s5eS4v81YUh3ubHJj2ykqD\nTBSsyKfHJEHcdvhs1YnFMEuwah0iifVdNveb/ixVvohzo5twRO8TUGiaeDhBvgmp\nGLbVnR1sWjpl/ODgKndLnbhu0IeUnGZTdDG42PyFppL5QnORw2sNPRXrUiEYsN18\nhfFPmU1P2tnuDRHcWI17SD0C2lnvrsdBW2f1JF2U040CpmYmSzwDTml2ZDFH5a7A\n2/OeRbKfLy+afoBy5RXF/Q==\n-----END ENCRYPTED PRIVATE KEY-----\n';

const TOKEN_URL = 'https://auth.sicoob.com.br/auth/realms/cooperado/protocol/openid-connect/token';
const COBRANCA_URL = 'https://api.sicoob.com.br/cobranca-bancaria/v2/boletos';

console.log('STARTUP: CERT len=' + SICOOB_CERT_PEM.length);

function getMtlsAgent() {
  const cert = SICOOB_CERT_PEM.replace(/\n/g, '
');
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
    console.log('Gerando boleto para:', nomeDevedor, 'valor:', valorOriginal);

    const token = await getAccessToken();
    const agent = getMtlsAgent();
    const cpfLimpo = (cpfCnpjDevedor || '').replace(/\D/g, '') || '00000000000';

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
        tipoPessoa: cpfLimpo.length === 14 ? 2 : 1,
        nome: nomeDevedor || 'Cliente',
        cpfCnpj: cpfLimpo,
        email: emailDevedor || '',
      },
      mensagensInstrucao: { mensagem1: descricao || 'Pedido ' + numeroSeuPedido },
    };

    const response = await axios.post(COBRANCA_URL, payload, {
      httpsAgent: agent,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    const boleto = response.data.resultado;
    console.log('Boleto gerado:', boleto.nossoNumero);

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
