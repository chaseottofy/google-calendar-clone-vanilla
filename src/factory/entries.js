import { generateId } from '../utilities/helpers';

/**
 * @class Entry
 * @param {String} id - Unique identifier
 * @param {String} title
 * @param {String} description
 * @param {Date} start
 * @param {Date} end
 * @param {String} category
 * @param {Boolean} completed
 */
export default class Entry {
  constructor(category, completed, description, end, start, title) {
    this.category = category;
    this.completed = completed;
    this.description = description;
    this.end = end;
    this.id = generateId();
    this.start = start;
    this.title = title;
  }
}

class CoordinateEntry {
  constructor(category, completed, coordinates, description, id, title) {
    this.category = category;
    this.completed = completed || false;
    this.coordinates = coordinates || {};
    this.description = description;
    this.id = id;
    this.title = title;
  }
}

/**
 * @class Week
 *
 * @param {Array} dayEntries
 * @description Array of entries that span a single day.
 *
 * @param {Array} allDayEntries
 * @description Array of entries that span multiple days.
 */
class Week {
  constructor(dayEntries, allDayEntries) {
    this.boxes = dayEntries;
    this.boxesTop = allDayEntries;
  }

  setAllBoxes(tempEntries) {
    this.boxes = tempEntries.day;
    this.boxesTop = tempEntries.allDay;
  }

  addBox(box) {
    this.boxes.push(box);
  }

  addBoxTop(box) {
    this.boxesTop.push(box);
  }

  getBox(id) {
    return this.boxes.find((box) => box.id === id);
  }

  getBoxes() {
    return this.boxes;
  }

  getBoxesTop() {
    return this.boxesTop;
  }

  getLength() {
    return this.boxes.length;
  }

  getBoxesByColumn(col) {
    return this.boxes.filter((box) => +box.coordinates.x === col);
  }

  getBoxesByColumnTop(col) {
    return this.boxesTop.filter((box) => +box.coordinates.x === col);
  }

  getBoxesTopLengths() {
    return this.getBoxesTop().reduce((a, c) => {
      const start = new Date(c.start);
      if (a[start.getDay()]) {
        a[start.getDay()]++;
      } else {
        a[start.getDay()] = 1;
      }
      return a;
    }, {});
  }

  getColumnsWithMultipleBoxes() {
    const temp = {};
    const columns = [];
    for (const box of this.boxes) {
      if (temp[box.coordinates.x]) {
        temp[box.coordinates.x]++;
        if (temp[box.coordinates.x] === 2) {
          columns.push(box.coordinates.x);
        }
      } else {
        temp[box.coordinates.x] = 1;
      }
    }
    return columns;
  }

  getEntriesByTitle(title) {
    return this.boxes.filter((box) => box.title.toLowerCase().includes(title.toLowerCase()));
  }

  updateCoordinates(id, coordinates) {
    this.getBox(id).coordinates = coordinates;
  }

  sortByY(bxs) {
    return bxs.sort((a, b) => +a.coordinates.y - +b.coordinates.y);
  }

  updateStore(store, id, weekArray) {
    const boxEntry = this.getBox(id);
    const coords = boxEntry.coordinates;
    const boxstart = +coords.y * 15;
    const boxend = +coords.e * 15;
    const day = weekArray[+coords.x];

    const startDate = new Date(day);
    const starthours = Math.floor(boxstart / 60);
    const startminutes = boxstart % 60;
    startDate.setHours(starthours);
    startDate.setMinutes(startminutes);

    const endDate = new Date(day);
    const endhours = Math.floor(boxend / 60);
    const endminutes = boxend % 60;
    endDate.setHours(endhours);
    endDate.setMinutes(endminutes);

    store.updateEntry(id, {
      start: startDate,
      end: endDate,
    });
  }
}
/**
 * @class Week
 *
 * @param {Array} dayEntries
 * @description Array of entries that span a single day.
 *
 * @param {Array} allDayEntries
 * @description Array of entries that span multiple days.
 */
class Day {
  constructor(dayEntries, allDayEntries) {
    this.boxes = dayEntries;
    this.boxesTop = allDayEntries;
  }

  setAllBoxes(tempEntries) {
    this.boxes = tempEntries.day;
    this.boxesTop = tempEntries.allDay;
  }

  addBox(box) {
    this.boxes.push(box);
  }

  addBoxTop(box) {
    this.boxesTop.push(box);
  }

  getBox(id) {
    return this.boxes.find((box) => box.id === id);
  }

  getBoxes() {
    return this.boxes;
  }

  getBoxesTop() {
    return this.boxesTop;
  }

  getAllBoxes() {
    return [...this.boxes, ...this.boxesTop];
  }

  getLength() {
    return this.boxes.length;
  }

  getBoxesTopLengths() {
    return this.getBoxesTop().reduce((a, c) => {
      const start = new Date(c.start);
      if (a[start.getDay()]) {
        a[start.getDay()]++;
      } else {
        a[start.getDay()] = 1;
      }
      return a;
    }, {});
  }

  getEntriesByTitle(title) {
    return this.boxes.filter((box) => box.title.toLowerCase().includes(title.toLowerCase()));
  }

  updateCoordinates(id, coordinates) {
    this.getBox(id).coordinates = coordinates;
  }

  getEntriesEndingOnDay(day) {
    return this.boxes.filter((box) => +box.coordinates.e === day);
  }

  sortByY(bxs) {
    return bxs.sort((a, b) => {
      const diff = +a.coordinates.y - +b.coordinates.y;
      if (diff === 0) {
        return +a.coordinates.e - +b.coordinates.e;
      } else {
        return diff;
      }
    });
  }

  updateStore(store, id) {
    const boxEntry = this.getBox(id);
    const coords = boxEntry.coordinates;
    const boxstart = +coords.y * 15;
    const boxend = +coords.e * 15;

    const startDate = new Date(boxEntry.start);
    const starthours = Math.floor(boxstart / 60);
    const startminutes = boxstart % 60;
    startDate.setHours(starthours);
    startDate.setMinutes(startminutes);

    const endDate = new Date(boxEntry.start);
    let endhours = Math.floor(boxend / 60);
    let endminutes = boxend % 60;
    if (endhours === 24) {
      endhours = 23;
      endminutes = 59;
    }
    endDate.setHours(endhours);
    endDate.setMinutes(endminutes);

    store.updateEntry(id, {
      start: startDate,
      end: endDate,
    });
  }
}

export {
  CoordinateEntry,
  Day,
  Week,
};
