if (!window.__pixListenerRegistrado) {
  window.__pixListenerRegistrado = true;

  chrome.runtime.onMessage.addListener((request) => {
    // Chamado pelo menu de contexto (texto selecionado)
    if (request.action === "generate_pix") {
      mostrarSeletorTipo(request.text.trim());
    }
    // Chamado pelo popup (payload já pronto)
    if (request.action === "show_qr") {
      const overlay = criarOverlay();
      const card = criarCard();
      document.body.appendChild(overlay);
      overlay.appendChild(card);
      mostrarQR(overlay, card, request.payload, request.chave, request.tipo);
    }
  });
}

// ─── Seletor de tipo (menu de contexto) ───────────────────────────────────

function mostrarSeletorTipo(textoOriginal) {
  const modalAntigo = document.getElementById('meuPixModal');
  if (modalAntigo) modalAntigo.remove();

  const overlay = criarOverlay();
  const card = criarCard();

  const title = document.createElement('h3');
  title.innerText = '🟢 Gerar QR Code Pix';
  Object.assign(title.style, { margin: '0 0 8px 0', fontSize: '20px', color: '#1a1a1a' });

  const sub = document.createElement('p');
  sub.innerText = 'Qual é o tipo desta chave?';
  Object.assign(sub.style, { margin: '0 0 16px 0', fontSize: '14px', color: '#555' });

  const chaveTxt = document.createElement('p');
  chaveTxt.innerText = textoOriginal;
  Object.assign(chaveTxt.style, {
    fontSize: '13px', color: '#333', margin: '0 0 20px 0',
    wordBreak: 'break-all', background: '#f4f4f4',
    padding: '8px 12px', borderRadius: '8px', textAlign: 'left'
  });

  const tipos = [
    { label: '📱 Celular',         valor: 'telefone' },
    { label: '🪪 CPF',             valor: 'cpf'      },
    { label: '🏢 CNPJ',            valor: 'cnpj'     },
    { label: '📧 E-mail',          valor: 'email'    },
    { label: '🔑 Chave aleatória', valor: 'uuid'     },
  ];

  const grid = document.createElement('div');
  Object.assign(grid.style, {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '10px', marginBottom: '16px'
  });

  tipos.forEach(({ label, valor }) => {
    const btn = document.createElement('button');
    btn.innerText = label;
    Object.assign(btn.style, {
      padding: '10px 8px', border: '2px solid #ddd',
      borderRadius: '8px', backgroundColor: '#fafafa',
      cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333'
    });
    btn.onmouseover = () => { btn.style.borderColor = '#32BCAD'; btn.style.backgroundColor = '#f0fffd'; };
    btn.onmouseout  = () => { btn.style.borderColor = '#ddd';    btn.style.backgroundColor = '#fafafa'; };
    btn.onclick = () => {
      const chaveNormalizada = normalizarChave(textoOriginal, valor);
      const payload = gerarPayloadPix(chaveNormalizada);
      mostrarQR(overlay, card, payload, chaveNormalizada, label);
    };
    grid.appendChild(btn);
  });

  grid.lastChild.style.gridColumn = '1 / -1';

  const btnCancelar = document.createElement('button');
  btnCancelar.innerText = 'Cancelar';
  estilizarBotao(btnCancelar, '#aaa');
  btnCancelar.style.width = '100%';
  btnCancelar.onclick = () => overlay.remove();

  card.appendChild(title);
  card.appendChild(sub);
  card.appendChild(chaveTxt);
  card.appendChild(grid);
  card.appendChild(btnCancelar);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ─── QR Code ──────────────────────────────────────────────────────────────

function mostrarQR(overlay, card, dadosQrCode, chaveExibir, tipoLabel) {
  card.innerHTML = '';

  const title = document.createElement('h3');
  title.innerText = '🟢 QR Code Pix';
  Object.assign(title.style, { margin: '0 0 4px 0', fontSize: '20px', color: '#1a1a1a' });

  const tipoTxt = document.createElement('p');
  tipoTxt.innerText = tipoLabel;
  Object.assign(tipoTxt.style, { fontSize: '12px', color: '#888', margin: '0 0 6px 0' });

  const chaveTxt = document.createElement('p');
  chaveTxt.innerText = chaveExibir;
  Object.assign(chaveTxt.style, {
    fontSize: '13px', color: '#333', margin: '0 0 16px 0',
    wordBreak: 'break-all', background: '#f4f4f4',
    padding: '6px 10px', borderRadius: '6px'
  });

  const qrContainer = document.createElement('div');
  Object.assign(qrContainer.style, { margin: '0 auto 20px auto', display: 'inline-block' });

  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '10px', justifyContent: 'center' });

  const btnVoltar = document.createElement('button');
  btnVoltar.innerText = '← Voltar';
  estilizarBotao(btnVoltar, '#888');
  btnVoltar.onclick = () => mostrarSeletorTipo(chaveExibir);

  const btnCopiar = document.createElement('button');
  btnCopiar.innerText = 'Copiar código';
  estilizarBotao(btnCopiar, '#32BCAD');
  btnCopiar.onclick = () => {
    navigator.clipboard.writeText(dadosQrCode).then(() => {
      btnCopiar.innerText = '✔ Copiado!';
      setTimeout(() => { btnCopiar.innerText = 'Copiar código'; }, 2000);
    });
  };

  const btnClose = document.createElement('button');
  btnClose.innerText = 'Fechar';
  estilizarBotao(btnClose, '#e53935');
  btnClose.onclick = () => overlay.remove();

  btnRow.appendChild(btnVoltar);
  btnRow.appendChild(btnCopiar);
  btnRow.appendChild(btnClose);

  card.appendChild(title);
  card.appendChild(tipoTxt);
  card.appendChild(chaveTxt);
  card.appendChild(qrContainer);
  card.appendChild(btnRow);

  new QRCode(qrContainer, {
    text: dadosQrCode,
    width: 240, height: 240,
    colorDark: "#000000", colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────

function criarOverlay() {
  const velho = document.getElementById('meuPixModal');
  if (velho) velho.remove();
  const overlay = document.createElement('div');
  overlay.id = 'meuPixModal';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: '2147483647', fontFamily: 'system-ui, sans-serif'
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  return overlay;
}

function criarCard() {
  const card = document.createElement('div');
  Object.assign(card.style, {
    backgroundColor: '#fff', padding: '28px 32px',
    borderRadius: '16px', textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    maxWidth: '360px', width: '90vw'
  });
  return card;
}

function estilizarBotao(btn, cor) {
  Object.assign(btn.style, {
    padding: '9px 16px', border: 'none', borderRadius: '7px',
    backgroundColor: cor, color: '#fff', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px'
  });
}
