export function loadCSS(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(css => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    });
}