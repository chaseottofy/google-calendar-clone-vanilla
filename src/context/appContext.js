import locales from '../locales/en';
import { compareDates } from '../utilities/dateutils';
import storage from '../utilities/storage';

class Context {
  constructor() {
    this.colorScheme = 'dark';
    this.component = 'month';
    this.sidebarState = 'hide';
    this.date = new Date();
    this.gmt = new Date().getTimezoneOffset() / 60;

    this.dateSelected = 1;
    this.daySelected = this.date.getDate();
    this.monthSelected = this.date.getMonth();
    this.yearSelected = this.date.getFullYear();

    this.month = this.getMonth();
    this.monthArray = this.getMonthArray();
    this.week = this.getWeek();
  }

  setDefaults() {
    const schemaBase = {
      yearSelected: [this.date.getFullYear(), Context.setLocalYear],
      monthSelected: [this.date.getMonth(), Context.setLocalMonth],
      daySelected: [this.date.getDate(), Context.setLocalDay],
      dateSelected: [1, Context.setLocalDateSelected],
      colorScheme: ['dark', Context.setLocalColorScheme],
      component: ['month', Context.setLocalComponent],
      // sidebarState: ['hide', Context.setLocalSidebarState],
    };
    for (const [key, value] of Object.entries(schemaBase)) {
      if (storage.getItem(key) === null) {
        const [schemaValue, setter] = value;
        if (this[key] === undefined) this[key] = schemaValue;
        setter(this[key]);
      }
    }
  }

  /* **************************************** */
  /* LOCAL STATE MANAGEMENT */
  static getLocalDay() {
    return +storage.getItem('daySelected') === undefined ? 1 : +storage.getItem('daySelected');
  }

  static getLocalMonth() {
    return +storage.getItem('monthSelected') === undefined ? 1 : +storage.getItem('monthSelected');
  }

  static getLocalYear() {
    return +storage.getItem('yearSelected') === undefined ? 1 : +storage.getItem('yearSelected');
  }

  static getLocalDateSelected() {
    return +storage.getItem('dateSelected');
  }

  static getLocalComponent() {
    return storage.getItem('component');
  }

  static getLocalColorScheme() {
    return storage.getItem('colorScheme');
  }

  static getLocalSidebarState() {
    return this.sidebarState;
    // return storage.getItem('sidebarState');
  }

  static setLocalDay(day) {
    storage.setItem('daySelected', day);
  }

  static setLocalMonth(month) {
    storage.setItem('monthSelected', month);
  }

  static setLocalYear(year) {
    storage.setItem('yearSelected', year);
  }

  static setLocalDateSelected(date) {
    storage.setItem('dateSelected', date);
  }

  static setLocalComponent(component) {
    storage.setItem('component', component);
  }

  static setLocalSidebarState(state) {
    // this.sidebarState = state;
    storage.setItem('sidebarState', state);
  }

  static setLocalColorScheme(colorScheme) {
    storage.setItem('colorScheme', colorScheme);
  }
  /* **************************************** */

  /* **************************************** */
  /* TESTING -- DEV ONLY */
  getAllMethodNames() {
    return Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    ).filter((method) => {
      return method !== 'constructor' && method !== 'getStoreStats';
    });
  }

  /* **************************************** */
  /* APPLICATION THEME (DARK/LIGHT) */
  getColorScheme() {
    return Context.getLocalColorScheme();
  }

  setColorScheme(colorScheme) {
    this.colorScheme = colorScheme;
    Context.setLocalColorScheme(colorScheme);
  }

  setSidebarState(state) {
    this.sidebarState = state;
    Context.setLocalSidebarState(state);
  }

  toggleSidebarState() {
    this.sidebarState = this.getSidebarState() === 'open' ? 'hide' : 'open';
    // Context.setLocalSidebarState(this.sidebarState);
  }
  /* **************************************** */

  /* **************************************** */
  /* APPLICATION CURRENT COMPONENT */
  getComponent() {
    return Context.getLocalComponent() || 'month';
  }

  setComponent(component) {
    if (this.component !== component) {
      this.component = component;
      window.location.hash = component;
      Context.setLocalComponent(component);
    }
  }

  getSidebarState() {
    return this.sidebarState || 'hide';
    // return Context.getLocalSidebarState() || 'hide';
  }
  /* **************************************** */

  /* **************************************** */
  /* APPLICATION DATE HANDLING */
  /* DAY, MONTH, YEAR, DATE, DAY_SELECTED */
  setDay(day) {
    this.daySelected = day;
    Context.setLocalDay(day);
  }

  setMonth(month) {
    this.monthSelected = month;
    Context.setLocalMonth(month);
  }

  setYear(year) {
    this.yearSelected = year;
    Context.setLocalYear(year);
  }

  setDate(year, month, day) {
    this.setYear(year);
    this.setMonth(month);
    this.setDay(day);
  }

  setDateFromDateObj(dateObj) {
    this.setDate(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  }

  setDateSelected(date) {
    this.dateSelected = date;
    Context.setLocalDateSelected(date);
  }

  /* ************** */
  // Take current date and set it to previous day/week/month/year
  /* PREVIOUS : DAY, WEEK, MONTH, YEAR */
  setPrevDay() {
    const prevDay = new Date(this.getYear(), this.getMonth(), this.getDay() - 1);

    this.setDate(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate());
  }

  setPrevWeek() {
    const prevWeek = new Date(this.getYear(), this.getMonth(), this.getDay() - 7);

    this.setDate(prevWeek.getFullYear(), prevWeek.getMonth(), prevWeek.getDate());
  }

  setPrevMonth() {
    const prevMonth = new Date(this.getYear(), +this.getMonth() - 1, this.getDay());

    this.setDate(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate());
  }

  setPrevYear() {
    this.setYear(this.getYear() - 1);
  }
  /* ************** */

  // Take current date and set it to next day/week/month/year
  /* NEXT : DAY, WEEK, MONTH, YEAR */
  setNextDay() {
    const nextDay = new Date(this.getYear(), this.getMonth(), this.getDay() + 1);
    this.setDate(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
  }

  setNextWeek() {
    const nextWeek = new Date(this.getYear(), this.getMonth(), this.getDay() + 7);
    this.setDate(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate());
  }

  setNextMonth() {
    const nextMonth = new Date(this.getYear(), this.getMonth() + 1, this.getDay());
    this.setDate(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate());
  }

  setNextYear() {
    this.setYear(this.getYear() + 1);
  }
  /* ************** */

  // is it possible to check if local storage has been changed manunally in dev tools?
  /* ************** */
  /* GETTERS */
  getGmt() {
    return this.gmt; // UTC Offset
  }

  getDateSelected() {
    return +Context.getLocalDateSelected();
    // return +this.dateSelected;
  }

  getDay() {
    return +Context.getLocalDay();
    // return +this.daySelected;
  }

  getMonth() {
    // const month = Context.getLocalMonth();
    return +Context.getLocalMonth();
    // return +this.monthSelected;
  }

  getYear() {
    return +Context.getLocalYear() || this.date.getFullYear();
    // return +this.yearSelected;
  }

  getDate() {
    return new Date(this.getYear(), this.getMonth(), this.getDay());
  }

  getDateArray() {
    return [this.getYear(), this.getMonth(), this.getDay()];
  }

  getToday() {
    return this.date;
  }

  getWeek() {
    const tempdate = this.getDate();
    tempdate.setDate(tempdate.getDate() - tempdate.getDay());
    return tempdate;
  }

  getWeekday() {
    return this.getDate().getDay();
  }

  getWeekArray() {
    const week = this.getWeek();
    const weekArray = [];
    for (let i = 0; i < 7; i++) {
      if (i < 6) {
        weekArray.push(new Date(week.getFullYear(), week.getMonth(), week.getDate() + i));
      } else {
        weekArray.push(new Date(week.getFullYear(), week.getMonth(), week.getDate() + i, 23, 59, 59, 999));
      }
    }
    return weekArray;
  }

  getWeekRange() {
    const { labels } = locales;
    const weekArray = this.getWeekArray();
    const [m1, m2] = [weekArray[0].getMonth(), weekArray[6].getMonth()];
    const [d1, d2] = [weekArray[0].getDate(), weekArray[6].getDate()];

    if (m1 === m2) {
      return `${labels.monthsShort[m1]} ${d1} – ${d2}, ${weekArray[0].getFullYear()}`;
    } else {
      return `${labels.monthsShort[m1]} ${d1} – ${d2} ${labels.monthsShort[m2]}, ${weekArray[1].getFullYear()}`;
    }
  }

  // ** not in use **
  getWeekNumber() {
    // returns week index 1 - 52
    const d = new Date(Date.UTC(this.getYear(), this.getMonth(), this.getDay()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86_400_000) + 1) / 7);
  }

  getMonthName() {
    const { labels } = locales;
    return labels.monthsLong[this.getMonth()];
  }

  getDaysInMonth() {
    return new Date(this.getYear(), this.getMonth() + 1, 0).getDate();
  }

  getMonthArrayStart(year, month) {
    const monthArrayStart = [];
    const monthArrayStartDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < monthArrayStartDay; i++) {
      monthArrayStart.push(new Date(year, month, 0 - i));
    }
    return monthArrayStart;
  }

  getMonthArrayEnd(year, month, handleFourWeeks = false) {
    const monthArrayEnd = [];
    if (handleFourWeeks) {
      for (let i = 1; i < 8; i++) {
        monthArrayEnd.push(new Date(year, +month + 1, i));
      }
      return monthArrayEnd;
    } else {
      const monthArrayEndDay = new Date(year, month + 1, 0).getDay();
      for (let i = 1; i < 7 - monthArrayEndDay; i++) {
        monthArrayEnd.push(new Date(year, +month + 1, i));
      }
      return monthArrayEnd;
    }
  }

  getMonthArray() {
    const monthArray = [];
    let temp = [this.getYear(), this.getMonth()];
    let [year, month] = temp;
    const start = this.getMonthArrayStart(year, month);
    for (let i = start.length - 1; i >= 0; i--) {
      monthArray.push(start[i]);
    }

    [year, month] = temp;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      monthArray.push(new Date(year, month, i));
    }

    monthArray.at(-1).setHours(23, 59, 59, 999);
    [year, month] = temp;
    let end = this.getMonthArrayEnd(year, month);
    if (monthArray.length === 28 && end.length < 7) {
      const last = monthArray.at(-1);
      end = this.getMonthArrayEnd(last.getFullYear(), last.getMonth(), true);
    }

    for (let i = 0; i < end.length; i++) {
      if (i === end.length - 1) {
        end[i].setHours(23, 59, 59, 999);
      }
      monthArray.push(end[i]);
    }
    return monthArray;
  }

  isToday(testDate) {
    if (!testDate) {
      return compareDates(this.getDate(), new Date());
    } else {
      return compareDates(testDate, new Date());
    }
  }
}

/**
  * DatepickerContext
  * @class
  * @classdesc date context for datepicker --
  * slimmed down version of @Context class
  * @property {Date} date - today's date
  * @property {Date} dateSelected - selected date
  * @property {number} daySelected - selected day
  * @property {number} monthSelected - selected month
  * @property {number} yearSelected - selected year
  * @property {number} month - current month
  * @property {Array} monthArray - current month array
  *
 */
class DatepickerContext {
  constructor() {
    this.date = new Date();
    this.dateSelected = this.date.getDate();
    this.daySelected = this.date.getDate();
    this.monthSelected = this.date.getMonth();
    this.yearSelected = this.date.getFullYear();
    this.month = this.getMonth();
    this.monthArray = this.getMonthArray();
  }

  setDefaults() {
    const schemaBase = {
      pickerYearSelected: [
        this.yearSelected,
        this.date.getFullYear(),
        DatepickerContext.setLocalPickerYear,
      ],
      pickerMonthSelected: [
        this.monthSelected,
        this.date.getMonth(),
        DatepickerContext.setLocalPickerMonth,
      ],
      pickerDaySelected: [
        this.daySelected,
        this.date.getDate(),
        DatepickerContext.setLocalPickerDay,
      ],
      pickerDateSelected: [
        this.dateSelected,
        this.date.getDate(),
        DatepickerContext.setLocalPickerDateSelected,
      ],
    };
    for (const [key, value] of Object.entries(schemaBase)) {
      if (storage.getItem(key) === null) {
        const [defaultVar, defaultValue, setter] = value;
        if (this[defaultVar] === undefined) this[defaultVar] = defaultValue;
        setter(defaultVar);
      }
    }
  }

  /* **************************************** */
  /* LOCAL STATE MANAGEMENT */
  static getLocalPickerDay() {
    return +storage.getItem('pickerDaySelected');
  }

  static getLocalPickerMonth() {
    return +storage.getItem('pickerMonthSelected');
  }

  static getLocalPickerYear() {
    return +storage.getItem('pickerYearSelected');
  }

  static getLocalPickerDateSelected() {
    return +storage.getItem('pickerDateSelected');
  }

  static setLocalPickerDay(day) {
    storage.setItem('pickerDaySelected', day);
  }

  static setLocalPickerMonth(month) {
    storage.setItem('pickerMonthSelected', month);
  }

  static setLocalPickerYear(year) {
    storage.setItem('pickerYearSelected', year);
  }

  static setLocalPickerDateSelected(date) {
    storage.setItem('pickerDateSelected', date);
  }

  /* **************************************** */
  /* DAY, MONTH, YEAR, DATE, DAY_SELECTED */
  setDay(day) {
    this.daySelected = day;
    DatepickerContext.setLocalPickerDay(day);
  }

  setMonth(month) {
    this.monthSelected = month;
    DatepickerContext.setLocalPickerMonth(month);
  }

  setYear(year) {
    this.yearSelected = year;
    DatepickerContext.setLocalPickerYear(year);
  }

  setDateSelected(date) {
    this.dateSelected = date;
    DatepickerContext.setLocalPickerDateSelected(date);
  }

  setDate(year, month, day) {
    this.setYear(year);
    this.setMonth(month);
    this.setDay(day);
  }

  setDateFromDateObj(dateObj) {
    this.setDate(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  }

  resetDate() {
    this.setDate(
      this.date.getFullYear(),
      this.date.getMonth(),
      this.date.getDate(),
    );
  }

  /* ************** */
  setPrevMonth() {
    const prevMonth = new Date(this.getYear(), this.getMonth() - 1, this.getDay());

    this.setDate(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate());
  }

  setNextMonth() {
    const nextMonth = new Date(this.getYear(), this.getMonth() + 1, this.getDay());

    this.setDate(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate());
  }

  /* ************** */
  getDateSelected() {
    return +DatepickerContext.getLocalPickerDateSelected();
  }

  getDay() {
    return +DatepickerContext.getLocalPickerDay();
  }

  getMonth() {
    return +DatepickerContext.getLocalPickerMonth();
  }

  getYear() {
    return +DatepickerContext.getLocalPickerYear();
  }

  getDate() {
    return new Date(this.getYear(), this.getMonth(), this.getDay());
  }

  getToday() {
    return this.date;
  }

  getMonthName() {
    const { labels } = locales;
    return labels.monthsLong[this.getMonth()];
  }

  getDaysInMonth() {
    return new Date(this.getYear(), this.getMonth() + 1, 0).getDate();
  }

  getMonthArrayStart(year, month) {
    const monthArrayStart = [];
    const monthArrayStartDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < monthArrayStartDay; i++) {
      monthArrayStart.push(new Date(year, month, 0 - i));
    }
    return monthArrayStart;
  }

  getMonthArrayEnd(year, month) {
    const monthArrayEnd = [];
    const monthArrayEndDay = new Date(year, month + 1, 0).getDay();
    for (let i = 1; i < 7 - monthArrayEndDay; i++) {
      monthArrayEnd.push(new Date(year, +month + 1, i));
    }
    return monthArrayEnd;
  }

  getMonthArray() {
    const monthArray = [];
    let temp = [this.getYear(), this.getMonth()];
    let [year, month] = temp;
    const start = this.getMonthArrayStart(year, month);
    for (let i = start.length - 1; i >= 0; i--) {
      monthArray.push(start[i]);
    }

    [year, month] = temp;
    for (let i = 1; i <= this.getDaysInMonth(); i++) {
      monthArray.push(new Date(year, month, i));
    }

    const end = this.getMonthArrayEnd(year, month);
    for (let i = 0; i < end.length; i++) {
      if (i === end.length - 1) {
        end[i].setHours(23, 59, 59, 999);
      }
      monthArray.push(end[i]);
    }
    return monthArray;
  }
  // getMonthArrayStartDay() {
  //   return new Date(this.getYear(), this.getMonth(), 1).getDay();
  // }

  // getMonthArrayStart() {
  //   const monthArrayStart = [];
  //   const [year, month] = [this.getYear(), this.getMonth()];
  //   for (let i = 0; i < this.getMonthArrayStartDay(); i++) {
  //     monthArrayStart.push(new Date(year, month, 0 - i));
  //   }
  //   return monthArrayStart;
  // }

  // getMonthArrayEndDay() {
  //   return new Date(this.getYear(), this.getMonth() + 1, 0).getDay();
  // }

  // getMonthArrayEnd() {
  //   const monthArrayEnd = [];
  //   const [year, month] = [this.getYear(), this.getMonth()];
  //   for (let i = 1; i < 7 - this.getMonthArrayEndDay(); i++) {
  //     monthArrayEnd.push(new Date(year, +month + 1, i));
  //   }
  //   return monthArrayEnd;
  // }

  // getMonthArray() {
  //   const monthArray = [];

  //   const start = this.getMonthArrayStart();
  //   for (let i = start.length - 1; i >= 0; i--) {
  //     monthArray.push(start[i]);
  //   }

  //   const [year, month] = [this.getYear(), this.getMonth()];
  //   for (let i = 1; i <= this.getDaysInMonth(); i++) {
  //     monthArray.push(new Date(year, month, i));
  //   }

  //   const end = this.getMonthArrayEnd();
  //   for (let i = 0; i < end.length; i++) {
  //     if (i === end.length - 1) {
  //       end[i].setHours(23, 59, 59, 999);
  //     }
  //     monthArray.push(end[i]);
  //   }
  //   return monthArray;
  // }
}

const context = new Context();
const datepickerContext = new DatepickerContext();
context.setDefaults();
datepickerContext.setDefaults();
export default context;
export { datepickerContext };
