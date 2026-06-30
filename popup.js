let payloadAtual = '';

// ─── Navegação entre telas ────────────────────────────────────────────────

function mostrarTelaInput() {
  document.getElementById('tela-input').style.display = 'block';
  document.getElementById('tela-qr').style.display = 'none';
  document.getElementById('qrContainer').innerHTML = '';
  document.getElementById('chaveInput').focus();
}

function mostrarTelaQR(payload, chave, tipoLabel) {
  payloadAtual = payload;

  document.getElementById('tela-input').style.display = 'none';
  document.getElementById('tela-qr').style.display = 'block';
  document.getElementById('tipo-label').innerText = tipoLabel;
  document.getElementById('chave-label').innerText = chave;
  document.getElementById('qrContainer').innerHTML = '';

  new QRCode(document.getElementById('qrContainer'), {
    text: payload,
    width: 220,
    height: 220,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ─── Eventos ──────────────────────────────────────────────────────────────

document.querySelectorAll('.tipo-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const chave = document.getElementById('chaveInput').value.trim();
    const erro  = document.getElementById('erro');

    if (!chave) {
      erro.innerText = 'Cole ou digite a chave Pix primeiro.';
      document.getElementById('chaveInput').focus();
      return;
    }
    erro.innerText = '';

    const chaveNormalizada = normalizarChave(chave, btn.dataset.tipo);
    const payload = gerarPayloadPix(chaveNormalizada);
    mostrarTelaQR(payload, chaveNormalizada, btn.innerText);
  });
});

document.getElementById('btn-voltar').addEventListener('click', mostrarTelaInput);

document.getElementById('btn-copiar').addEventListener('click', () => {
  navigator.clipboard.writeText(payloadAtual).then(() => {
    const btn = document.getElementById('btn-copiar');
    btn.innerText = '✔ Copiado!';
    setTimeout(() => { btn.innerText = 'Copiar código'; }, 2000);
  });
});

document.getElementById('chaveInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.querySelector('[data-tipo="telefone"]').click();
  }
});

// Inicia na tela de input
mostrarTelaInput();

// ─── Normalização ─────────────────────────────────────────────────────────

function normalizarChave(texto, tipo) {
  const chave = texto.trim();
  const digits = chave.replace(/\D/g, '');
  switch (tipo) {
    case 'telefone':
      if (chave.startsWith('+')) return '+' + digits;
      return '+55' + digits;
    case 'cpf':   return digits.slice(0, 11);
    case 'cnpj':  return digits.slice(0, 14);
    case 'email': return chave.toLowerCase().replace(/\s+/g, '');
    default:      return chave.replace(/\s+/g, '');
  }
}

// ─── Payload Pix ──────────────────────────────────────────────────────────

function tlv(id, valor) {
  return `${id}${valor.length.toString().padStart(2, '0')}${valor}`;
}

function gerarPayloadPix(chave) {
  const merchantAcct = tlv("26", tlv("00", "BR.GOV.BCB.PIX") + tlv("01", chave));
  let payload = "";
  payload += tlv("00", "01");
  payload += merchantAcct;
  payload += tlv("52", "0000");
  payload += tlv("53", "986");
  payload += tlv("58", "BR");
  payload += tlv("59", "Recebedor");
  payload += tlv("60", "Brasil");
  payload += tlv("62", tlv("05", "***"));
  payload += "6304";
  return payload + calcularCRC16(payload);
}

function calcularCRC16(payload) {
  let resultado = 0xFFFF;
  const polinomio = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    resultado ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      resultado = (resultado & 0x8000)
        ? ((resultado << 1) ^ polinomio)
        : (resultado << 1);
    }
  }
  return (resultado & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
