/**
 * Dispara o download de um blob no navegador.
 * iOS Safari não respeita o atributo `download` em blob URLs — nesses casos
 * abre o arquivo em nova aba para que o usuário possa salvar via share sheet.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  // iOS Safari ignora o atributo `download` em blob: URLs.
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  if (isIOS) {
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // Pop-up bloqueado — exibe link visível como fallback
      showFallbackLink(url, filename);
    } else {
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }
    return;
  }

  // Desktop e Android: clique programático com atributo download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1_000);
}

function showFallbackLink(url: string, filename: string) {
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'left:50%',
    'transform:translateX(-50%)',
    'background:#1B5E20',
    'color:#fff',
    'padding:14px 24px',
    'border-radius:12px',
    'font-size:15px',
    'font-weight:600',
    'z-index:99999',
    'box-shadow:0 4px 20px rgba(0,0,0,0.3)',
    'text-align:center',
  ].join(';');

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.cssText = 'color:#fff;text-decoration:underline;';
  link.textContent = 'Toque aqui para baixar';

  link.addEventListener('click', () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(container);
    }, 2000);
  });

  container.appendChild(link);
  document.body.appendChild(container);

  // Remove automaticamente após 15 segundos
  setTimeout(() => {
    if (document.body.contains(container)) {
      URL.revokeObjectURL(url);
      document.body.removeChild(container);
    }
  }, 15000);
}
