import Entry from "../factory/entries";
import localStoreKeyNames from "./constants";
import { testDate, compareDates } from "../utilities/dateutils";
import locales from "../locales/en";
import defautlKeyboardShortcuts from "../locales/kbDefault";
const colors = locales.colors;
/*
  this is a temporary list of store methods for development purposes, it is not a complete list of methods



  ***************************************
  // ENTRY MANAGEMENT
  "addEntry",
  "createEntry",
  "deleteEntry",
  "getActiveEntries",
  "getEntry",
  "getEntries",
  "removeLastEntry",
  "updateEntry",
  "searchBy",
  "sortBy",
  "getFirstAndLastEntry",
  "generateCoordinates",
  "getDayEntries",
  "getDayEntriesArray",
  "getMonthEntries",
  "getMonthEntryDates",
  "getGroupedMonthEntries",
  "getWeekEntries",
  "getYearEntries",
  "getGroupedYearEntries",
  ***************************************


  ***************************************
  // CATEGORY MANAGEMENT
  "addNewCtg",
  "deleteCategory",
  "getDefaultCtg",
  "getFirstActiveCategory",
  "getFirstActiveCategoryKeyPair",
  "getActiveCategories",
  "getActiveCategoriesKeyPair",
  "getAllCtg",
  "getAllCtgColors",
  "getAllCtgNames",
  "getCategoryStatus",
  "getCtgColor",
  "getCtgLength",
  "hasCtg",
  "moveCategoryEntriesToNewCategory",
  "removeCategoryAndEntries",
  "setCategoryStatus",
  "setAllCategoryStatusExcept",
  "updateCtgColor",
  "updateCtg"
  ***************************************


  ***************************************
  // KEYBOARD SHORTCUT MANAGEMENT
  "getShortcuts",
  "setShortCut",
  "setShortcutsStatus",
  "getShortcutsStatus",
  ***************************************

  ***************************************
  // ANIMATION MANAGEMENT
  "setAnimationStatus",
  "getAnimationStatus"
  ***************************************


  ***************************************
  // POPUP/TOAST/NOTIFICATION MANAGEMENT
  "addActiveOverlay",
  "removeActiveOverlay",
  "getActiveOverlay",
  "hasActiveOverlay",
  ***************************************


  ***************************************
  // USER UPLOAD/DOWNLOAD MANAGEMNET
  "validateUserUpload",
  "setUserUpload",
  "setDataReconfigCallback",
  "getUserUpload",
  "getDataReconfigCallback",
  ***************************************


  ***************************************
  // FORM MANAGEMENT 
  "setFormRenderHandle",
  "getFormRenderHandle",

  "setFormResetHandle",
  "getFormResetHandle",

  "setRenderFormCallback",
  "getRenderFormCallback",
  ***************************************


  ***************************************
  // SIDEBAR MANAGEMENT
  "setRenderSidebarCallback",
  "getRenderSidebarCallback"
  ***************************************


  ***************************************
  // DATEPICKER MANAGEMENT
  "setResetDatepickerCallback",
  "getResetDatepickerCallback",
  ***************************************


  ***************************************
  // CALENDAR MANAGEMENT
  "setResizeHandle",
  "getResizeHandle",
  ***************************************
]
*/
// Store is passed to all calendar views in the following order :
// ./index > ./renderViews > ./setViews > component

class Store {
  constructor () {
    this.store = localStorage.getItem("store")
      ? JSON.parse(localStorage.getItem("store"))
      : [];

    this.userUpload;

    this.ctg = localStorage.getItem("ctg")
      ? JSON.parse(localStorage.getItem("ctg"))
      : {
        default: { color: colors.blue[4], active: true },
      };

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
    this.animationStatus = true;
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
        return method !== "constructor" && method !== "getStoreStats";
      }
    );
  }

  /* ************************* */
  /* LOCAL STORAGE MANAGEMENT */
  static getStore() {
    return JSON.parse(localStorage.getItem("store")) || [];
  }

  static getActiveStore() {
    return JSON.parse(localStorage.getItem("activeStore")) || [];
  }

  static getCtg() {
    return JSON.parse(localStorage.getItem("ctg")) || [];
  }

  static getShortcutsStatus() {
    return JSON.parse(localStorage.getItem("keyboardShortcutsStatus"));
  }

  static getAnimationStatus() {
    return JSON.parse(localStorage.getItem("animationStatus"));
  }

  // *******************
  static setStore(store) {
    localStorage.setItem("store", JSON.stringify(store));
  }

  static setActiveStore(activeStore) {
    localStorage.setItem("activeStore", JSON.stringify(activeStore));
  }

  static setCtg(ctg) {
    localStorage.setItem("ctg", JSON.stringify(ctg));
  }

  static setShortcutsStatus(status) {
    localStorage.setItem("keyboardShortcutsStatus", JSON.stringify(status));
  }

  static setAnimationStatus(status) {
    localStorage.setItem("animationStatus", JSON.stringify(status));
  }
  /* ************************* */

  /* ************** */
  /* essential crud (entries) - create, read, update, delete */
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
    if (!active) return [];
    const activeEntries = this.store.filter((entry) => {
      return active ? active.indexOf(entry.category) > -1 : [];
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
    return this.store[this.store.length - 1].id;
  }

  compareEntries(entry1, entry2) {
    for (let key in entry1) {
      if (key === "id" || key === "coordinates") continue;
      if (key === "end" || key === "start") {
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
    let entry = this.getEntry(id);
    entry = Object.assign(entry, data);
    Store.setStore(this.store);
  }
  /* ************ */

  /* **************************** */
  /* (ENTRIES) FILTER/SORT/PARTITION/ */
  searchBy(entries, searchtype, value) {
    if (entries.length === 0) return;
    return entries.filter((entry) => {
      return entry[searchtype].toLowerCase().slice(0, value.length) === value;
    });
  }

  sortBy(entries, type, direction) {
    if (entries.length === 0) return;

    if (direction === "desc") {
      return entries.sort((a, b) => {
        if (type === "start") {
          return new Date(a.start) - new Date(b.start);
        } else if (type === "end") {
          return new Date(a.end) - new Date(b.end);
        } else if (
          type === "description" ||
          type === "title" ||
          type === "category"
        ) {
          return a[type].localeCompare(b[type]);
        } else {
          return a[type] - b[type];
        }
      });
    } else {
      return entries.sort((a, b) => {
        if (type === "start") {
          return new Date(b.start) - new Date(a.start);
        } else if (type === "end") {
          return new Date(b.end) - new Date(a.end);
        } else if (
          type === "description" ||
          type === "title" ||
          type === "category"
        ) {
          return b[type].localeCompare(a[type]);
        } else {
          return b[type] - a[type];
        }
      });
    }
  }

  /**
   *
   * @returns {Array} [
   *    start date/time of earliest entry,  {string}
   *    end date/time of last entry         {string}
   * ]
   */
  getFirstAndLastEntry() {
    let sorted = this.sortBy(this.getActiveEntries(), "start", "desc");
    if (sorted === undefined) {
      return [0, 0];
    } else {
      return [sorted[0].start, sorted[sorted.length - 1].end];
    }
  }
  /* **************************** */

  /* *************************************** */
  /* SEGMENT ENTRIES FOR SPECIFIC VIEWS (YEAR/MONTH/...ect)*/

  // @generateCoordinates -- (only used in week and day view)
  // generates coordinates based on start and end times for a given entry
  // if an entry spans beyond a day, it will render at the top of the grid in
  // a static (immobile) position.
  generateCoordinates(start, end) {
    [start, end] = [testDate(start), testDate(end)];

    let startMin = start.getHours() * 4 + Math.floor(start.getMinutes() / 15);
    let endMin = end.getHours() * 4 + Math.floor(end.getMinutes() / 15);
    let height = endMin - startMin;
    let total = startMin + height;

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
    let activeEntries = this.getActiveEntries();
    let boxes = {
      allDay: [], // entries that start on one day and end on another
      day: [], // entries that start and end on same day
    };

    if (activeEntries.length === 0) return boxes;

    let dayEntries = activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      return (
        y === day.getFullYear() && m === day.getMonth() && d === day.getDate()
      );
    });

    dayEntries.forEach((entry) => {
      entry.coordinates = this.generateCoordinates(
        new Date(entry.start),
        new Date(entry.end)
      );

      if (entry.coordinates.allDay) {
        boxes.allDay.push(entry);
      } else {
        boxes.day.push(entry);
      }
    });
    return boxes;
  }

  getDayEntriesArray(targetDate) {
    let activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];

    return activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      return (
        y === targetDate.getFullYear() &&
        m === targetDate.getMonth() &&
        d === targetDate.getDate()
      );
    });
  }

  getMonthEntries(montharr) {
    let activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];

    return activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      return (
        entryDate >= montharr[0] && entryDate <= montharr[montharr.length - 1]
      );
    });
  }

  getMonthEntryDates(montharr) {
    let entries = this.getMonthEntries(montharr);
    let grouped = {};
    entries.forEach((entry) => {
      let entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      let key = `${y}-${m}-${d}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    return Object.keys(grouped);
  }

  getGroupedMonthEntries(entries) {
    return entries.reduce((acc, entry) => {
      let tempDate = new Date(entry.start);
      let day = tempDate.getDate();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(entry);
      return acc;
    }, {});
  }

  getWeekEntries(week) {
    let activeEntries = this.getActiveEntries();
    let [start, end] = [week[0], week[6]];
    let boxes = {
      allDay: [], // entries that start on one day and end on another
      day: [], // entries that start and end on same day
    };

    if (activeEntries.length === 0) return boxes;
    let entries = activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      return entryDate >= start && entryDate <= end;
    });

    entries.forEach((entry) => {
      entry.coordinates = this.generateCoordinates(
        new Date(entry.start),
        new Date(entry.end)
      );

      if (entry.coordinates.allDay) {
        boxes.allDay.push(entry);
      } else {
        boxes.day.push(entry);
      }
    });

    return boxes;
  }

  getYearEntries(year) {
    let activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];
    return activeEntries.filter(
      (entry) => new Date(entry.start).getFullYear() === year
    );
  }

  getGroupedYearEntries(yearentries) {
    let grouped = {};
    yearentries.forEach((entry) => {
      let entryDate = new Date(entry.start);
      let month = entryDate.getMonth();
      let day = entryDate.getDate();

      if (!grouped[month]) {
        grouped[month] = {};
      }

      if (!grouped[month][day]) {
        grouped[month][day] = [];
      }

      grouped[month][day].push(entry);
    });

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
    for (let [key, value] of Object.entries(this.ctg)) {
      if (value.active) {
        return key;
      }
    }
    return "default";
  }

  getFirstActiveCategoryKeyPair() {
    for (let [key, value] of Object.entries(this.ctg)) {
      if (value.active) {
        return [key, value.color];
      }
    }
    const backup = this.getDefaultCtg();
    return [backup[0], backup[1].color];
  }

  getActiveCategories() {
    let active = Object.keys(this.ctg).filter((key) => this.ctg[key].active);
    if (active.length > 0) {
      return active;
    } else {
      active = [];
    }
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

  getCategoryStatus(category) {
    if (this.ctg.hasOwnProperty(category)) {
      return this.ctg[category].active;
    }
  }

  getCtgColor(ctg) {
    return this.ctg[ctg].color;
  }

  getCtgLength(category) {
    return this.store.filter((entry) => entry.category === category).length;
  }

  hasCtg(categoryName) {
    let hasctg = false;
    for (let key in this.ctg) {
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
      this.store.forEach((entry) => {
        if (entry.category === category) {
          entry.category = newCategory;
        }
      });
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
    for (let key in this.ctg) {
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
    let entries = Object.entries(this.ctg);
    let hasColor = newColor !== null;
    let count = 0;
    let length = entries.length;

    const isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n);
    if (isNumeric(newName)) {
      newName = "category " + newName;
    }

    for (let [key, value] of entries) {
      count++;
      if (count === 1) {
        // changing the default category;
        if (oldName === key) {
          entries[0][0] = newName;
          if (hasColor) {
            entries[0][1].color = newColor;
          }
        }
      } else {
        if (oldName === key) {
          entries[count - 1][0] = newName;
          if (hasColor) {
            entries[count - 1][1].color = newColor;
          }
        }
      }
    }
    if (entries.length !== length) {
      console.error("something went wrong with category name/color change");
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

  setShortCut(shortcut) {
    const keys = Object.keys(this.getShortcuts());
    let idx = keys.indexOf(shortcut);
    if (idx > -1) {
      return `Shortcut (${shortcut}) is already in use`;
    } else {
      return;
    }
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
    return status !== null ? status : true;
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
        [...this.activeOverlay].filter((o) => o !== overlay)
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
  validateUserUpload(userUpload) {
    const keys = Object.keys(userUpload);
    let message = {};
    if (keys.length > localStoreKeyNames.length) {
      message.err1 = "invalid number of keys (too many)";
    }

    for (let i = 0; i < keys.length; i++) {
      if (!localStoreKeyNames.includes(keys[i])) {
        let errname = "err" + Object.keys(message).length;
        message[errname] = "invalid key: " + keys[i];
      }
    }

    if (Object.keys(message).length > 0) {
      return message;
    } else {
      return true;
    }
  }

  setUserUpload(userUpload) {
    const validation = this.validateUserUpload(userUpload);
    let validated;
    if (validation === true) {
      localStorage.clear();
      validated = true;
      for (const [key, value] of Object.entries(userUpload)) {
        localStorage.setItem(key, value);
      }
    } else {
      return validation;
    }
    if (validated) {
      const refresh = localStorage.getItem("refresh");
      if (refresh === null) {
        window.location.reload();
        window.localStorage.setItem("refresh", "1");
      }
    }
  }

  getUserUpload() {
    return this.userUpload;
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
    this.handleRenders.calendars["previous"].reset = callback;
  }

  setRenderCategoriesCallback(callback) {
    this.handleRenders.categories.callback = callback;
  }

  getRenderCategoriesCallback() {
    return this.handleRenders.categories.callback;
  }

  getResetPreviousViewCallback() {
    return this.handleRenders.calendars["previous"].reset;
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

// single
export default new Store();
