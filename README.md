# 💠 pixcode

Extensão para Chromium que gera **QR Codes Pix válidos** diretamente no navegador — sem servidores, sem coleta de dados, 100% local.

---

## ✨ Funcionalidades

- **Menu de contexto:** selecione qualquer chave Pix em uma página, clique com o botão direito e gere o QR Code na hora
- **Popup manual:** cole ou digite uma chave Pix diretamente no ícone da extensão
- **5 tipos de chave suportados:** Celular, CPF, CNPJ, E-mail e Chave aleatória (UUID)
- **Payload Pix oficial:** gerado conforme o padrão EMV/BCB com CRC16 válido
- **Copiar código:** copia o payload copia-e-cola para usar em qualquer app bancário
- **Totalmente offline:** nenhum dado é enviado a servidores externos

---

## 🛠️ Tecnologias

- Manifest V3
- Vanilla JavaScript
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) — geração de QR Code client-side
- Padrão **EMV Merchant Presented Mode** (Pix QR Code estático)

---

## 📄 Como funciona o payload Pix

O payload segue o padrão **TLV (Tag-Length-Value)** definido pelo Banco Central do Brasil. A estrutura inclui:

- Identificador de payload (`00`)
- Conta transacional com GUI `BR.GOV.BCB.PIX` e a chave (`26`)
- Categoria do merchant (`52`)
- Moeda BRL — código `986` (`53`)
- País `BR` (`58`)
- CRC16-CCITT para validação (`63`)
