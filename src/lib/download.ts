/**
 * Dispara o download de um blob no navegador.
 *
 * Estratégia por plataforma:
 *  - iOS Safari: window.open(blobUrl, '_blank') — o atributo `download` não é
 *    respeitado pelo iOS mesmo em cliques do usuário. Abrir em nova aba permite
 *    que o usuário use "Compartilhar > Salvar em Arquivos".
 *  - Android Chrome: link + click com document.body.appendChild funciona
 *    normalmente.
 *  - Desktop: idem Android.
 *  - Fallback: se window.open for bloqueado (pop-up blocker), exibe link
 *    clicável na tela.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isIOS) {
    // iOS Safari não suporta o atributo `download` para blob URLs.
    // Abrir em nova aba é o método mais confiável — o usuário pode usar
    // "Compartilhar > Salvar em Arquivos" ou "Abrir no app correspondente".
    const win = window.open(url, '_blank');
    if (!win) {
      // Pop-up bloqueado — exibir link de fallback
      showFallbackLink(url, filename, true);
    } else {
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
    return;
  }

  // Android Chrome e Desktop: link + click com elemento no DOM
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);

  try {
    a.click();
  } catch {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFallbackLink(url, filename, false);
    return;
  }

  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}

function showFallbackLink(url: string, filename: string, isIOS: boolean) {
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'left:50%',
    'transform:translateX(-50%)',
    'background:#1B5E20',
    'color:#fff',
    'padding:16px 24px',
    'border-radius:12px',
    'font-size:15px',
    'font-weight:600',
    'z-index:99999',
    'box-shadow:0 4px 20px rgba(0,0,0,0.35)',
    'text-align:center',
    'max-width:90vw',
    'line-height:1.5',
  ].join(';');

  const msg = document.createElement('div');
  msg.style.cssText = 'margin-bottom:8px;font-size:13px;font-weight:400;opacity:0.9;';
  msg.textContent = isIOS
    ? 'Toque no link e use "Compartilhar > Salvar em Arquivos"'
    : 'Toque no link para baixar o arquivo';
  container.appendChild(msg);

  const link = document.createElement('a');
  link.href = url;
  // Em iOS não usamos download attribute — queremos que abra em nova aba
  if (!isIOS) link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.cssText = 'color:#FFF9C4;text-decoration:underline;font-size:15px;font-weight:700;';
  link.textContent = filename;
  container.appendChild(link);

  // Botão fechar
  const close = document.createElement('button');
  close.textContent = '✕';
  close.style.cssText = [
    'position:absolute',
    'top:8px',
    'right:10px',
    'background:none',
    'border:none',
    'color:#fff',
    'font-size:16px',
    'cursor:pointer',
    'padding:0',
    'line-height:1',
  ].join(';');
  close.addEventListener('click', () => {
    URL.revokeObjectURL(url);
    if (document.body.contains(container)) document.body.removeChild(container);
  });
  container.appendChild(close);

  link.addEventListener('click', () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (document.body.contains(container)) document.body.removeChild(container);
    }, 3000);
  });

  document.body.appendChild(container);

  // Remove automaticamente após 20 segundos
  setTimeout(() => {
    if (document.body.contains(container)) {
      URL.revokeObjectURL(url);
      document.body.removeChild(container);
    }
  }, 20000);
}
