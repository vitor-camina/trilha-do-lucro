/**
 * Dispara o download de um blob no navegador.
 * Em mobile, se o clique automático não funcionar, exibe um link clicável como fallback.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);

  let downloaded = false;
  try {
    a.click();
    downloaded = true;
  } catch {
    // fallback abaixo
  }

  // Limpa o elemento e a URL após um delay para garantir que o download iniciou
  setTimeout(() => {
    document.body.removeChild(a);
    if (downloaded) {
      URL.revokeObjectURL(url);
    }
  }, 1000);

  // Fallback mobile: se o clique automático falhou, exibe um link flutuante
  if (!downloaded) {
    showFallbackLink(url, filename);
  }
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
