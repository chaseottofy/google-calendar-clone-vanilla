function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(() => resolve(text))
        .catch(() => resolve(''));
    } else if (window.isSecureContext) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.append(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        resolve(successful ? text : '');
      } catch {
        textArea.remove();
        resolve('');
      }
    } else {
      // Fallback for non-secure contexts
      resolve('');
    }
  });
}

export default copyToClipboard;
