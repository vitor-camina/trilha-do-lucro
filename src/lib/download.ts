/**
 * Dispara o download de um blob no navegador.
 * Em mobile, exibe um link clicável porque o atributo `download` não é
 * respeitado em cliques programáticos no Safari/iOS e Android WebView.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  // Mobile Safari e Android WebView ignoram cliques programáticos com download=
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  if (isMobile) {
    showFallbackLink(url, filename);
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);

  try {
    a.click();
  } catch {
    document.body.removeChild(a);
    showFallbackLink(url, filename);
    return;
  }

  // Limpa o elemento e a URL após um delay para garantir que o download iniciou
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
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
