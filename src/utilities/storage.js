class LocalStorageHandler {
  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.memoryStorage = new Map();
  }

  setUploadedData(data) {
    this.clear();
    for (const key in data) {
      this.setItem(key, data[key]);
    }
  }

  // get all data
  getAllData() {
    const data = {};
    for (let i = 0; i < this.length; i++) {
      const key = this.key(i);
      data[key] = this.getItem(key);
    }
    return data;
  }

  checkLocalStorageAvailability() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  setItem(key, value) {
    if (this.isLocalStorageAvailable) {
      localStorage.setItem(key, value);
    } else {
      this.memoryStorage.set(key, value);
    }
  }

  getItem(key) {
    if (this.isLocalStorageAvailable) {
      return localStorage.getItem(key);
    } else {
      return this.memoryStorage.get(key) || null;
    }
  }

  removeItem(key) {
    if (this.isLocalStorageAvailable) {
      localStorage.removeItem(key);
    } else {
      this.memoryStorage.delete(key);
    }
  }

  clear() {
    if (this.isLocalStorageAvailable) {
      localStorage.clear();
    } else {
      this.memoryStorage.clear();
    }
  }

  key(index) {
    if (this.isLocalStorageAvailable) {
      return localStorage.key(index);
    } else {
      return [...this.memoryStorage.keys()][index] || null;
    }
  }

  get length() {
    if (this.isLocalStorageAvailable) {
      return localStorage.length;
    } else {
      return this.memoryStorage.size;
    }
  }
}

const storage = new LocalStorageHandler();
export default storage;
