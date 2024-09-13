export default async function getJSONUpload(store, closingFunction) {
  return new Promise((resolve, reject) => {
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'application/json';

    file.onchange = async (e) => {
      try {
        const targetFile = e.target.files[0];
        if (!targetFile) {
          throw new Error('No file selected');
        }

        const text = await targetFile.text();
        const json = JSON.parse(text);
        store.setUserUpload(json);
        closingFunction();
        resolve(json);
      } catch (error) {
        console.error('Error processing file:', error);
        reject(error);
      } finally {
        file.remove();
        closingFunction();
      }
    };

    document.body.append(file);
    file.click();
  });
}
