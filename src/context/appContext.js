import { compareDates } from "../utilities/dateutils";
import locales from "../locales/en";
const labels = locales.labels;


/*
"setDateDefaults",
"setSchemaDefaults",
"setDefaults",
"getAllMethodNames",
"getColorScheme",
"setColorScheme",
"setSidebarState",
"toggleSidebarState",
"getComponent",
"setComponent",
"getSidebarState",
"setDay",
"setMonth",
"setYear",
"setDate",
"setDateSelected",
"setPrevDay",
"setPrevWeek",
"setPrevMonth",
"setPrevYear",
"setNextDay",
"setNextWeek",
"setNextMonth",
"setNextYear",

"getGmt",
"getDateSelected",
"getDay",
"getMonth",
"getYear",
"getDate",
"getToday",
"getWeek",
"getWeekday",
"getWeekArray",
"getWeekRange",
"getWeekNumber",
"getMonthName",
"getDaysInMonth",
"getMonthArrayStartDay",
"getMonthArrayStart",
"getMonthArrayEndDay",
"getMonthArrayEnd",
"getMonthArray",
"isToday"
*/
class Context {
  constructor () {
    this.colorScheme = "dark";
    this.component = "month";
    this.sidebarState = "hide";
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

  setDateDefaults() {
    if (localStorage.getItem("yearSelected") === null) {
      if (this.yearSelected === undefined) {
        this.yearSelected = this.date.getFullYear();
      }
      Context.setLocalYear(this.yearSelected);
    }

    if (localStorage.getItem("monthSelected") === null) {
      if (this.monthSelected === undefined) {
        this.monthSelected = this.date.getMonth();
      }
      Context.setLocalMonth(this.monthSelected);
    }

    if (localStorage.getItem("daySelected") === null) {
      if (this.daySelected === undefined) {
        this.daySelected = this.date.getDate();
      }
      Context.setLocalDay(this.daySelected);
    }

    if (localStorage.getItem("dateSelected") === null) {
      if (this.dateSelected === undefined) {
        this.dateSelected = 1;
      }
      Context.setLocalDateSelected(this.dateSelected);
    }
  }

  setSchemaDefaults() {
    if (localStorage.getItem("colorScheme") === null) {
      if (this.colorScheme === undefined) {
        this.colorScheme = "dark";
      }
      Context.setLocalColorScheme(this.colorScheme);
    }

    if (localStorage.getItem("component") === null) {
      if (this.component === undefined) {
        this.component = "month";
      }
      Context.setLocalComponent(this.component);
    }

    if (localStorage.getItem("sidebarState") === null) {
      if (this.sidebarState === undefined) {
        this.sidebarState = "hide";
      }
      Context.setLocalSidebarState(this.sidebarState);
    }
  }

  setDefaults() {
    this.setSchemaDefaults();
    this.setDateDefaults();
  }

  /* **************************************** */
  /* LOCAL STATE MANAGEMENT */
  static getLocalDay() {
    return +localStorage.getItem("daySelected") === undefined ? 1 : +localStorage.getItem("daySelected");
  }

  static getLocalMonth() {
    return +localStorage.getItem("monthSelected") === undefined ? 1 : +localStorage.getItem("monthSelected");
  }

  static getLocalYear() {
    return +localStorage.getItem("yearSelected") === undefined ? 1 : +localStorage.getItem("yearSelected");
  }

  static getLocalDateSelected() {
    return +localStorage.getItem("dateSelected");
  }

  static getLocalComponent() {
    return localStorage.getItem("component");
  }

  static getLocalColorScheme() {
    return localStorage.getItem("colorScheme");
  }

  static getLocalSidebarState() {
    return localStorage.getItem("sidebarState");
  }

  static setLocalDay(day) {
    localStorage.setItem("daySelected", day);
  }

  static setLocalMonth(month) {
    localStorage.setItem("monthSelected", month);
  }

  static setLocalYear(year) {
    localStorage.setItem("yearSelected", year);
  }

  static setLocalDateSelected(date) {
    localStorage.setItem("dateSelected", date);
  }

  static setLocalComponent(component) {
    localStorage.setItem("component", component);
  }

  static setLocalSidebarState(state) {
    localStorage.setItem("sidebarState", state);
  }

  static setLocalColorScheme(colorScheme) {
    localStorage.setItem("colorScheme", colorScheme);
  }
  /* **************************************** */


  /* **************************************** */
  /* TESTING -- DEV ONLY */
  getAllMethodNames() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(
      (method) => {
        return method !== "constructor" && method !== "getStoreStats";
      }
    );
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
    this.sidebarState = this.getSidebarState() === "open" ? "hide" : "open";
    Context.setLocalSidebarState(this.sidebarState);
  }
  /* **************************************** */


  /* **************************************** */
  /* APPLICATION CURRENT COMPONENT */
  getComponent() {
    return Context.getLocalComponent() || "month";
  }
  setComponent(component) {
    this.component = component;
    Context.setLocalComponent(component);
  }
  getSidebarState() {
    return Context.getLocalSidebarState() || "hide";
  }
  /* **************************************** */



  /* **************************************** */
  /* APPLICATION DATE HANDLING */
  // set the current date for the following
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

  setDateSelected(date) {
    this.dateSelected = date;
    Context.setLocalDateSelected(date);
  }
  /* ************** */
  // Take current date and set it to previous day/week/month/year
  /* PREVIOUS : DAY, WEEK, MONTH, YEAR */
  setPrevDay() {
    const prevDay = new Date(
      this.getYear(), this.getMonth(), this.getDay() - 1
    );

    this.setDate(
      prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate()
    );
  }

  setPrevWeek() {
    const prevWeek = new Date(
      this.getYear(), this.getMonth(), this.getDay() - 7
    );

    this.setDate(
      prevWeek.getFullYear(), prevWeek.getMonth(), prevWeek.getDate()
    );
  }

  setPrevMonth() {
    const prevMonth = new Date(
      this.getYear(), +this.getMonth() - 1, this.getDay()
    );

    this.setDate(
      prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate()
    );
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


  /* ************** */
  /* GETTERS */
  getGmt() {
    return this.gmt;  // UTC Offset
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

  getToday() {
    return this.date;
  }

  getWeek() {
    let tempdate = this.getDate();
    tempdate.setDate(tempdate.getDate() - tempdate.getDay());
    return tempdate;
  }

  getWeekday() {
    return this.getDate().getDay();
  }

  getWeekArray() {
    let week = this.getWeek();
    let weekArray = [];
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
    let weekArray = this.getWeekArray();
    let [m1, m2] = [weekArray[0].getMonth(), weekArray[6].getMonth()];
    let [d1, d2] = [weekArray[0].getDate(), weekArray[6].getDate()];

    if (m1 === m2) {
      return `${labels.monthsShort[m1]} ${d1} – ${d2}, ${weekArray[0].getFullYear()}`;
    } else {
      return `${labels.monthsShort[m1]} ${d1} – ${d2} ${labels.monthsShort[m2]}, ${weekArray[1].getFullYear()}`;
    }
  }

  // ** not in use **
  getWeekNumber() {
    // returns week index 1 - 52
    let d = new Date(Date.UTC(this.getYear(), this.getMonth(), this.getDay()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  getMonthName() {
    return labels.monthsLong[this.getMonth()];
  }

  getDaysInMonth() {
    return new Date(this.getYear(), this.getMonth() + 1, 0).getDate();
  }

  getMonthArrayStartDay() {
    return new Date(this.getYear(), this.getMonth(), 1).getDay();
  }

  getMonthArrayStart() {
    let monthArrayStart = [];
    let [year, month] = [this.getYear(), this.getMonth()];
    for (let i = 0; i < this.getMonthArrayStartDay(); i++) {
      monthArrayStart.push(new Date(year, month, 0 - i));
    }
    return monthArrayStart;
  }

  getMonthArrayEndDay() {
    return new Date(this.getYear(), this.getMonth() + 1, 0).getDay();
  }

  getMonthArrayEnd(handleFourWeeks) {
    let monthArrayEnd = [];
    let [year, month] = [this.getYear(), this.getMonth()];

    if (handleFourWeeks) {
      for (let i = 1; i < 8; i++) {
        monthArrayEnd.push(new Date(year, +month + 1, i));
      }
      return monthArrayEnd;
    } else {
      for (let i = 1; i < 7 - this.getMonthArrayEndDay(); i++) {
        monthArrayEnd.push(new Date(year, +month + 1, i));
      }
      return monthArrayEnd;
    }
  }

  getMonthArray() {
    let monthArray = [];
    let start = this.getMonthArrayStart();
    let daysInMonth = this.getDaysInMonth();
    let [year, month] = [this.getYear(), this.getMonth()];
    let end = this.getMonthArrayEnd();

    for (let i = start.length - 1; i >= 0; i--) {
      monthArray.push(start[i]);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      monthArray.push(new Date(year, month, i));
    }

    monthArray[monthArray.length - 1].setHours(23, 59, 59, 999);

    if (monthArray.length === 28 && end.length < 7) {
      end = this.getMonthArrayEnd(true);
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
  constructor () {
    this.date = new Date();
    this.dateSelected = this.date.getDate();
    this.daySelected = this.date.getDate();
    this.monthSelected = this.date.getMonth();
    this.yearSelected = this.date.getFullYear();
    this.month = this.getMonth();
    this.monthArray = this.getMonthArray();
  }

  setDefaults() {
    if (localStorage.getItem("pickerYearSelected") === null) {
      if (this.yearSelected === undefined) {
        this.yearSelected = this.date.getFullYear();
      }
      DatepickerContext.setLocalPickerYear(this.yearSelected);
    }

    if (localStorage.getItem("pickerMonthSelected") === null) {
      if (this.monthSelected === undefined) {
        this.monthSelected = this.date.getMonth();
      }
      DatepickerContext.setLocalPickerMonth(this.monthSelected);
    }

    if (localStorage.getItem("pickerDaySelected") === null) {
      if (this.daySelected === undefined) {
        this.daySelected = this.date.getDate();
      }
      DatepickerContext.setLocalPickerDay(this.daySelected);
    }

    if (localStorage.getItem("pickerDateSelected") === null) {
      if (this.dateSelected === undefined) {
        this.dateSelected = this.date.getDate();
      }
      DatepickerContext.setLocalPickerDateSelected(this.dateSelected);
    }
  }

  /* **************************************** */
  /* LOCAL STATE MANAGEMENT */
  static getLocalPickerDay() {
    return +localStorage.getItem("pickerDaySelected");
  }

  static getLocalPickerMonth() {
    return +localStorage.getItem("pickerMonthSelected");
  }

  static getLocalPickerYear() {
    return +localStorage.getItem("pickerYearSelected");
  }

  static getLocalPickerDateSelected() {
    return +localStorage.getItem("pickerDateSelected");
  }

  static setLocalPickerDay(day) {
    localStorage.setItem("pickerDaySelected", day);
  }

  static setLocalPickerMonth(month) {
    localStorage.setItem("pickerMonthSelected", month);
  }

  static setLocalPickerYear(year) {
    localStorage.setItem("pickerYearSelected", year);
  }

  static setLocalPickerDateSelected(date) {
    localStorage.setItem("pickerDateSelected", date);
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

  /* ************** */
  setPrevMonth() {
    const prevMonth = new Date(
      this.getYear(), this.getMonth() - 1, this.getDay()
    );

    this.setDate(
      prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate()
    );
  }

  setNextMonth() {
    const nextMonth = new Date(
      this.getYear(), this.getMonth() + 1, this.getDay()
    );

    this.setDate(
      nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate()
    );
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
    return labels.monthsLong[this.getMonth()];
  }

  getDaysInMonth() {
    return new Date(this.getYear(), this.getMonth() + 1, 0).getDate();
  }

  getMonthArrayStartDay() {
    return new Date(this.getYear(), this.getMonth(), 1).getDay();
  }

  getMonthArrayStart() {
    let monthArrayStart = [];
    let [year, month] = [this.getYear(), this.getMonth()];
    for (let i = 0; i < this.getMonthArrayStartDay(); i++) {
      monthArrayStart.push(new Date(year, month, 0 - i));
    }
    return monthArrayStart;
  }

  getMonthArrayEndDay() {
    return new Date(this.getYear(), this.getMonth() + 1, 0).getDay();
  }

  getMonthArrayEnd() {
    let monthArrayEnd = [];
    let [year, month] = [this.getYear(), this.getMonth()];
    for (let i = 1; i < 7 - this.getMonthArrayEndDay(); i++) {
      monthArrayEnd.push(new Date(year, +month + 1, i));
    }
    return monthArrayEnd;
  }

  getMonthArray() {
    let monthArray = [];

    let start = this.getMonthArrayStart();
    for (let i = start.length - 1; i >= 0; i--) {
      monthArray.push(start[i]);
    }

    let [year, month] = [this.getYear(), this.getMonth()];
    for (let i = 1; i <= this.getDaysInMonth(); i++) {
      monthArray.push(new Date(year, month, i));
    }

    let end = this.getMonthArrayEnd();
    for (let i = 0; i < end.length; i++) {
      if (i === end.length - 1) {
        end[i].setHours(23, 59, 59, 999);
      }
      monthArray.push(end[i]);
    }
    return monthArray;
  }
}

const context = new Context();
const datepickerContext = new DatepickerContext();
context.setDefaults();
datepickerContext.setDefaults();
export default context;
export { datepickerContext };