// const outer = () => {
//   const inner = () => console.trace('inner');
//   inner();
// };

class LocalStorageHandler {
  constructor() {
    this.sessionOnlyKeys = new Set([
      'animationStatus',
      'dateSelected',
      'daySelected',
      'monthSelected',
      'pickerYearSelected',
      'pickerMonthSelected',
      'pickerDateSelected',
      'pickerDaySelected',
      'yearSelected',
      'colorScheme',
      'pickerDaySelected',
      'SidebarState',
      'component',
    ]);

    this.cache = new Map();
    this.secondaryStorage = this.localStorageAvailable()
      ? localStorage
      : this.cache;

    this.serverStorageCache = new Map();
    this.serverStorage = new Map();
    this.hasServer = false;
  }

  setHasServer(value) {
    this.hasServer = value;
  }

  getHasServer() {
    return this.hasServer;
  }

  setUploadedData(data) {
    this.clear();
    for (const [key, value] of Object.entries(data)) {
      this.setItem(key, value);
    }
  }

  getAllData() {
    const data = {};
    for (let i = 0; i < this.length; i++) {
      const key = this.key(i);
      data[key] = this.getItem(key);
    }
    return data;
  }

  localStorageAvailable() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  setServerStorage(data) {
    this.serverStorage.set(data.key, data.value);
    this.secondaryStorage.setItem(data.key, data.value);
  }

  getServerStorage(key) {
    return this.serverStorage.get(key);
  }

  setItem(key, value) {
    if (this.hasServer) {
      if (this.sessionOnlyKeys.has(key)) {
        this.secondaryStorage.setItem(key, value);
      } else {
        this.setServerStorage({ key, value });
      }
    } else {
      // console.log(key, value)
      this.secondaryStorage.setItem(key, value);
    }
  }

  getItem(key) {
    if (this.hasServer) {
      if (this.sessionOnlyKeys.has(key)) {
        return this.secondaryStorage.getItem(key) || null;
      } else {
        return this.getServerStorage(key) || this.secondaryStorage.getItem(key) || null;
      }
    } else {
      return this.secondaryStorage.getItem(key) || null;
    }
  }

  removeItem(key) {
    if (this.hasServer) {
      if (this.sessionOnlyKeys.has(key)) {
        this.secondaryStorage.removeItem(key);
      } else {
        this.serverStorage.delete(key);
        this.secondaryStorage.removeItem(key);
      }
    } else {
      this.secondaryStorage.removeItem(key);
    }
  }

  clear() {
    this.secondaryStorage.clear();
  }

  key(index) {
    return this.secondaryStorage instanceof Map
      ? [...this.secondaryStorage.keys()][index]
      : this.secondaryStorage.key(index);
  }

  get length() {
    return this.secondaryStorage instanceof Map
      ? this.secondaryStorage.size
      : this.secondaryStorage.length;
  }
}

const storage = new LocalStorageHandler();
export default storage;
