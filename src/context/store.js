import Entry from '../factory/entries';
import locales from '../locales/en';
import defautlKeyboardShortcuts from '../locales/kbDefault';
import { compareDates, testDate } from '../utilities/dateutils';
import storage from '../utilities/storage';

class Store {
  constructor() {
    this.store = this.getInitStore();

    this.userUpload = {};

    this.colors = locales.colorsMutedMed;

    this.ctg = this.getInitCtg();

    this.activeOverlay = new Set();

    this.handleRenders = {
      sidebar: {
        callback: null,
      },
      datepicker: {
        reset: null,
      },
      form: {
        callback: null,
      },
      reconfig: {
        callback: null,
      },
      categories: {
        callback: null,
      },
      calendars: {
        previous: {
          reset: null,
        },
        month: {
          reset: null,
          resize: null,
        },
        week: {
          reset: null,
          render: null,
        },
        day: {
          reset: null,
        },
        list: {
          reset: null,
        },
      },
    };

    this.keyboardShortcuts = defautlKeyboardShortcuts;
    this.keyboardShortcutsStatus = true;
    this.animationStatus = false;
    this.hasServerIntegration = false;
  }

  getInitStore() {
    return storage.getItem('store')
      ? JSON.parse(storage.getItem('store'))
      : [];
  }

  getInitCtg() {
    return storage.getItem('ctg')
      ? JSON.parse(storage.getItem('ctg'))
      : {
        default: { color: this.colors.blue[4], active: true },
      };
  }

  setStoreForTesting(store) {
    this.store = store;
    Store.setStore(this.store);
  }

  getStoreStats() {
    return [this.store.length, this.getAllCtgNames().length];
  }

  getAllMethodNames() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(
      (method) => {
        return method !== 'constructor' && method !== 'getStoreStats';
      },
    );
  }

  /* ************************* */
  /* LOCAL STORAGE MANAGEMENT */
  static getStore() {
    return JSON.parse(storage.getItem('store')) || [];
  }

  static getActiveStore() {
    return JSON.parse(storage.getItem('activeStore')) || [];
  }

  static getCtg() {
    return JSON.parse(storage.getItem('ctg')) || [];
  }

  static getShortcutsStatus() {
    return JSON.parse(storage.getItem('keyboardShortcutsStatus'));
  }

  static getAnimationStatus() {
    return JSON.parse(storage.getItem('animationStatus'));
  }

  // *******************
  static setStore(store) {
    storage.setItem('store', JSON.stringify(store));
  }

  static setActiveStore(activeStore) {
    storage.setItem('activeStore', JSON.stringify(activeStore));
  }

  static setCtg(ctg) {
    storage.setItem('ctg', JSON.stringify(ctg));
  }

  static setShortcutsStatus(status) {
    storage.setItem('keyboardShortcutsStatus', JSON.stringify(status));
  }

  static setAnimationStatus(status) {
    storage.setItem('animationStatus', JSON.stringify(status));
  }

  /* ************************* */
  getColors() {
    return this.colors;
  }

  /* ************** */
  /* essential crud (entries) - create, read, update, delete */
  getServerStatus() {
    return this.hasServerIntegration;
  }

  addEntry(entry) {
    this.store.push(entry);
    Store.setStore(this.store);
  }

  createEntry(...args) {
    this.addEntry(new Entry(...args));
    Store.setStore(this.store);
  }

  deleteEntry(id) {
    this.store = this.store.filter((entry) => entry.id !== id);
    Store.setStore(this.store);
  }

  getActiveEntries() {
    const active = this.getActiveCategories();
    if (active.length === 0) return [];
    const activeEntries = this.store.filter((entry) => {
      return active ? active.includes(entry.category) : [];
    });
    return activeEntries;
  }

  getEntry(id) {
    return this.store.find((entry) => entry.id === id);
  }

  getEntries() {
    return this.store || [];
  }

  getEntriesByCtg(ctg) {
    return this.store.filter((entry) => {
      return entry.category === ctg;
    });
  }

  removeLastEntry() {
    this.store.pop();
    Store.setStore(this.store);
  }

  getLastEntryId() {
    return this.store.at(-1).id;
  }

  compareEntries(entry1, entry2) {
    for (const key in entry1) {
      if (key === 'id' || key === 'coordinates') continue;

      if (key === 'end' || key === 'start') {
        if (new Date(entry1[key]).getTime() - new Date(entry2[key]).getTime() !== 0) {
          return false;
        }
      } else if (entry1[key] !== entry2[key]) {
        return false;
      }
    }
    return true;
  }

  updateEntry(id, data) {
    // let entry = this.getEntry(id);
    // entry = Object.assign(this.getEntry(id), data);
    this.store = this.store.map((entry) => {
      if (entry.id === id) {
        return Object.assign(entry, data);
      }
      return entry;
    });
    Store.setStore(this.store);
  }
  /* ************ */

  /* **************************** */
  /* (ENTRIES) FILTER/SORT/PARTITION/ */
  sortBy(entries, type, direction) {
    if (entries.length === 0) return [];
    const targType = ['description', 'title', 'category'].includes(type);

    const comp = (a, b) => {
      if (direction === 'desc') return a - b;
      return b - a;
    };
    return entries.sort((a, b) => {
      if (type === 'start') {
        return comp(new Date(a.start), new Date(b.start));
      } else if (type === 'end') {
        return comp(new Date(a.end), new Date(b.end));
      } else if (targType) {
        return comp(a[type].localeCompare(b[type]));
      }
      return comp(a[type], b[type]);
    });
  }

  /**
   *
   * @returns {Array} [
   *    start date/time of earliest entry,  {string}
   *    end date/time of last entry         {string}
   * ]
   */
  getFirstAndLastEntry() {
    const sorted = this.sortBy(this.getActiveEntries(), 'start', 'desc');
    return sorted === undefined ? [0, 0] : [sorted[0].start, sorted.at(-1).end];
  }
  /* **************************** */

  /* *************************************** */
  /* SEGMENT ENTRIES FOR SPECIFIC VIEWS (YEAR/MONTH/...ect) */

  // @generateCoordinates -- (only used in week and day view)
  // generates coordinates based on start and end times for a given entry
  // if an entry spans beyond a day, it will render at the top of the grid in
  // a static (immobile) position.
  generateCoordinates(start, end) {
    [start, end] = [testDate(start), testDate(end)];

    const startMin = start.getHours() * 4 + Math.floor(start.getMinutes() / 15);
    const endMin = end.getHours() * 4 + Math.floor(end.getMinutes() / 15);
    const height = endMin - startMin;
    const total = startMin + height;

    if (!compareDates(start, end)) {
      return {
        allDay: true,
        x: start.getDay(),
        x2: end.getDay(),
      };
    } else {
      return {
        allDay: false,
        x: start.getDay(),
        y: startMin,
        h: height,
        e: total,
      };
    }
  }

  getDayEntries(day) {
    const activeEntries = this.getActiveEntries();
    const boxes = {
      allDay: [], // entries that start on one day and end on another
      day: [], // entries that start and end on same day
    };

    if (activeEntries.length === 0) return boxes;

    const dayEntries = activeEntries.filter((entry) => {
      const entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      return (
        y === day.getFullYear() && m === day.getMonth() && d === day.getDate()
      );
    });

    for (const entry of dayEntries) {
      entry.coordinates = this.generateCoordinates(
        new Date(entry.start),
        new Date(entry.end),
      );

      if (entry.coordinates.allDay) {
        boxes.allDay.push(entry);
      } else {
        boxes.day.push(entry);
      }
    }
    return boxes;
  }

  getDayEntriesArray(targetDate) {
    const activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];

    return activeEntries.filter((entry) => {
      const entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      return (
        y === targetDate.getFullYear()
        && m === targetDate.getMonth()
        && d === targetDate.getDate()
      );
    });
  }

  getMonthEntries(montharr) {
    const activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];

    return activeEntries.filter((entry) => {
      const entryDate = new Date(entry.start);
      return (
        entryDate >= montharr[0] && entryDate <= montharr.at(-1)
      );
    });
  }

  getMonthEntryDates(montharr) {
    const entries = this.getMonthEntries(montharr);
    const grouped = {};
    for (const entry of entries) {
      const entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      const key = `${y}-${m}-${d}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    }
    return Object.keys(grouped);
  }

  getGroupedMonthEntries(entries) {
    return entries.reduce((acc, entry) => {
      const tempDate = new Date(entry.start);
      const day = tempDate.getDate();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(entry);
      return acc;
    }, {});
  }

  getWeekEntries(week) {
    const activeEntries = this.getActiveEntries();
    const [start, end] = [week[0], week[6]];
    const boxes = {
      allDay: [], // entries that start on one day and end on another
      day: [], // entries that start and end on same day
    };

    if (activeEntries.length === 0) return boxes;
    const entries = activeEntries.filter((entry) => {
      const entryDate = new Date(entry.start);
      return entryDate >= start && entryDate <= end;
    });

    for (const entry of entries) {
      entry.coordinates = this.generateCoordinates(
        new Date(entry.start),
        new Date(entry.end),
      );

      if (entry.coordinates.allDay) {
        boxes.allDay.push(entry);
      } else {
        boxes.day.push(entry);
      }
    }

    return boxes;
  }

  getYearEntries(year) {
    const activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];
    return activeEntries.filter(
      (entry) => new Date(entry.start).getFullYear() === year,
    );
  }

  getGroupedYearEntries(yearentries) {
    const grouped = {};
    for (const entry of yearentries) {
      const entryDate = new Date(entry.start);
      const month = entryDate.getMonth();
      const day = entryDate.getDate();
      if (!grouped[month]) {
        grouped[month] = {};
      }

      if (!grouped[month][day]) {
        grouped[month][day] = [];
      }
      grouped[month][day].push(entry);
    }

    return grouped;
  }

  /* ************************************* */

  /* ********************* */
  /*  CATEGORY MANAGEMENT */
  addNewCtg(categoryName, color) {
    if (!this.hasCtg(categoryName)) {
      this.ctg[categoryName] = {
        color: color,
        active: true,
      };
      Store.setCtg(this.ctg);
    }
  }

  deleteCategory(category) {
    if (this.hasCtg(category)) {
      delete this.ctg[category];
      Store.setCtg(this.ctg);
    }
  }

  getDefaultCtg() {
    return Object.entries(this.ctg)[0];
  }

  getFirstActiveCategory() {
    for (const [key, value] of Object.entries(this.ctg)) {
      if (value.active) {
        return key;
      }
    }
    return 'default';
  }

  getFirstActiveCategoryKeyPair() {
    for (const [key, value] of Object.entries(this.ctg)) {
      if (value.active) {
        return [key, value.color];
      }
    }
    const backup = this.getDefaultCtg();
    return [backup[0], backup[1].color];
  }

  getActiveCategories() {
    const active = Object.keys(this.ctg).filter((key) => this.ctg[key].active);
    return active.length > 0 ? active : [];
  }

  getActiveCategoriesKeyPair() {
    return Object.entries(this.ctg).filter((key) => key[1].active);
  }

  getAllCtg() {
    return this.ctg;
  }

  getAllCtgColors() {
    return Object.values(this.ctg).map((ctg) => ctg.color);
  }

  getAllCtgNames() {
    return Object.keys(this.ctg);
  }

  getCtgColor(ctg) {
    return this.ctg[ctg].color;
  }

  getCtgLength(category) {
    return this.store.filter((entry) => entry.category === category).length;
  }

  hasCtg(categoryName) {
    let hasctg = false;
    for (const key in this.ctg) {
      if (key.toLowerCase() === categoryName.toLowerCase()) {
        hasctg = true;
      }
    }
    return hasctg;
  }

  /**
   *
   * @param {string} category
   * @param {string} newCategory
   */
  moveCategoryEntriesToNewCategory(category, newCategory, newName) {
    if (this.hasCtg(category) || newName === true) {
      for (const entry of this.store) {
        if (entry.category === category) {
          entry.category = newCategory;
        }
      }
      Store.setStore(this.store);
    }
    this.deleteCategory(category);
  }

  removeCategoryAndEntries(category) {
    if (this.hasCtg(category)) {
      this.store = this.store.filter((entry) => entry.category !== category);
      Store.setStore(this.store);
    }
    this.deleteCategory(category);
  }

  setCategoryStatus(category, status) {
    if (this.hasCtg(category)) {
      this.ctg[category].active = status;
      Store.setCtg(this.ctg);
    }
  }

  setAllCategoryStatusExcept(category, status) {
    for (const key in this.ctg) {
      if (key !== category) {
        this.ctg[key].active = status;
      } else {
        this.ctg[key].active = !status;
      }
    }
    Store.setCtg(this.ctg);
  }

  /**
   *
   * @param {string} categoryName
   * @param {string} color
   * @desc updates the color of a category
   */
  updateCtgColor(categoryName, color) {
    if (this.hasCtg(categoryName)) {
      this.ctg[categoryName].color = color;
      Store.setCtg(this.ctg);
    }
  }

  getCtgIndex(category) {
    return Object.keys(this.ctg).indexOf(category);
  }

  /**
   *
   * @param {string} newName
   * @param {string} newColor
   * @param {string} oldName
   * @returns new category object
   * @desc note that 'value' of [key, value] is necessary to segment the object, even if it is not directly referenced
   */
  updateCtg(newName, newColor, oldName) {
    const entries = Object.entries(this.ctg);
    const hasColor = newColor !== null;
    const length = entries.length;
    if (!Number.isNaN(Number.parseFloat(newName)) && Number.isFinite(newName)) {
      newName = `category ${newName}`;
    }

    // for (let [key, value] of entries) {
    for (let i = 0; i < entries.length; i++) {
      const key = entries[i][0];
      if (i === 0) {
        if (oldName === key) {
          entries[i][0] = newName;
          if (hasColor) {
            entries[i][1].color = newColor;
          }
        }
      } else {
        if (oldName === key) {
          entries[i][0] = newName;
          if (hasColor) {
            entries[i][1].color = newColor;
          }
        }
      }
    }

    if (entries.length !== length) {
      console.error('something went wrong with category name/color change');
      return;
    } else {
      this.ctg = Object.fromEntries(entries);
      this.moveCategoryEntriesToNewCategory(oldName, newName, true);
      Store.setCtg(this.ctg);
    }
  }
  /* ********************* */

  /* ***************************** */
  /*  KEYBOARD SHORTCUT MANAGEMENT */
  getShortcuts() {
    return this.keyboardShortcuts;
  }

  setShortcutsStatus(status) {
    this.keyboardShortcutsStatus = status;
    Store.setShortcutsStatus(status);
  }

  getShortcutsStatus() {
    const status = Store.getShortcutsStatus();
    return status !== null ? status : true;
  }
  /* ***************************** */

  /* ***************************** */
  /*  ANIMATION MANAGEMENT */

  getAnimationStatus() {
    const status = Store.getAnimationStatus();
    if (status === null) {
      this.animationStatus = false;
      storage.setItem('animationStatus', JSON.stringify(false));
    }
    return this.animationStatus;
  }

  setAnimationStatus(status) {
    this.animationStatus = status;
    Store.setAnimationStatus(status);
  }
  /* ***************************** */

  /* ******************** */
  /*  OVERLAY MANAGEMENT */
  // see readme @ --overlay management-- for more info
  addActiveOverlay(overlay) {
    this.activeOverlay.add(overlay);
  }

  removeActiveOverlay(overlay) {
    const len = this.activeOverlay.size;
    if (len === 0) {
      return;
    } else if (this.activeOverlay.size === 1) {
      this.activeOverlay = new Set();
      return;
    } else {
      this.activeOverlay = new Set(
        [...this.activeOverlay].filter((o) => o !== overlay),
      );
      return;
    }
  }

  getActiveOverlay() {
    return this.activeOverlay;
  }

  hasActiveOverlay() {
    return this.activeOverlay.size > 0;
  }
  /* ******************** */

  /* ************************ */
  /*  JSON UPLOAD & DOWNLOAD */
  setUserUpload(userUpload) {
    storage.setUploadedData(userUpload);
    window.location.reload();
  }

  /* ************************ */

  /* ******************************************* */
  /*  STATE MANAGEMENT : RENDERING / RESET / RESIZE */
  /**
   * This got a bit more complicated than I anticipated, I'll come back to this later;
   */
  setFormRenderHandle(type, callback) {
    this.handleRenders.calendars[type].render = callback;
  }

  setFormResetHandle(type, callback) {
    this.handleRenders.calendars[type].reset = callback;
  }

  setRenderFormCallback(callback) {
    this.handleRenders.form.callback = callback;
  }

  setRenderSidebarCallback(callback) {
    this.handleRenders.sidebar.callback = callback;
  }

  setResizeHandle(type, callback) {
    this.handleRenders.calendars[type].resize = callback;
  }

  setDataReconfigCallback(callback) {
    this.handleRenders.reconfig.callback = callback;
  }

  setResetDatepickerCallback(callback) {
    this.handleRenders.datepicker.reset = callback;
  }

  setResetPreviousViewCallback(callback) {
    this.handleRenders.calendars['previous'].reset = callback;
  }

  setRenderCategoriesCallback(callback) {
    this.handleRenders.categories.callback = callback;
  }

  getRenderCategoriesCallback() {
    return this.handleRenders.categories.callback;
  }

  getResetPreviousViewCallback() {
    return this.handleRenders.calendars['previous'].reset;
  }

  getResetDatepickerCallback() {
    return this.handleRenders.datepicker.reset;
  }

  getDataReconfigCallback() {
    return this.handleRenders.reconfig.callback;
  }

  getResizeHandle(type) {
    if (this.handleRenders.calendars[type] === undefined) {
      return null;
    } else {
      return this.handleRenders.calendars[type].resize;
    }
  }

  getFormRenderHandle(type) {
    if (this.handleRenders.calendars[type] === undefined) {
      return null;
    } else {
      return this.handleRenders.calendars[type].render;
    }
  }

  getFormResetHandle(type) {
    if (this.handleRenders.calendars[type].reset === undefined) {
      return null;
    } else {
      return this.handleRenders.calendars[type].reset;
    }
  }

  getRenderFormCallback() {
    const callback = this.handleRenders.form.callback;
    if (callback !== null) {
      return callback;
    } else {
      return null;
    }
  }

  getRenderSidebarCallback() {
    const callback = this.handleRenders.sidebar.callback;
    if (callback !== null) {
      return callback;
    } else {
      return null;
    }
  }
  /* ************************************ */
}

const store = new Store();
export default store;
