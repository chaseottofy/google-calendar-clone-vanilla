export default function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Style load error for ${url}`));

    document.head.append(link);
  });
}
