import setViews from '../../config/setViews';
import { getDateForStore } from '../../utilities/dateutils';
import { getClosest } from '../../utilities/helpers';

const sbdatepicker = document.querySelector('.datepicker-sidebar');
const sbdatepickerBody = document.querySelector('.sbdatepicker__body--dates');
const sbdatepickerTitle = document.querySelector('.sbdatepicker-title');

const sbdatepickerChangeDate = document.querySelector('.sb-datepicker-change-date');

const sbyearpickerTitle = document.querySelector('.sb-yearpicker-title');
const sbmonthpickerMonths = document.querySelectorAll('.sb-monthpicker__month');

export default function setSidebarDatepicker(context, store, datepickerContext) {

  datepickerContext.setDate(...context.getDateArray());
  let montharray = datepickerContext.getMonthArray();
  let groupedEntries = store.getMonthEntryDates(montharray);
  let currentWeekStart = context.getWeek();
  let hasweek = false;
  let count = 0;
  let [checkmonth, checkyear] = [null, null];

  function setDatepickerHeader() {
    const month = datepickerContext.getMonthName();
    const year = datepickerContext.getYear();
    sbdatepickerTitle.textContent = `${month} ${year}`;
  }

  function createCells(marr) {
    sbdatepickerBody.innerText = '';
    const component = context.getComponent();

    for (let i = 0; i < marr.length; i++) {
      const cell = document.createElement('div');
      const datename = document.createElement('div');
      cell.classList.add('sbdatepicker__body--dates-cell');
      datename.classList.add('sbdatepicker__body--datename');

      if (marr[i].getMonth() !== datepickerContext.getMonth()) {
        datename.classList.add('sbdatepicker__body--datename-disabled');
      }

      if (component === 'week') {
        if (currentWeekStart.getDate() === marr[i].getDate()) {
          if (currentWeekStart.getMonth() === marr[i].getMonth()) {
            if (currentWeekStart.getFullYear() === marr[i].getFullYear()) {
              hasweek = true;
            }
          }
        }
      }

      if (hasweek) {
        count++;
        if (count <= 7) {
          cell.classList.add('sbdatepicker__body--dates-week');
        }
      } else {
        cell.classList.remove('sbdatepicker__body--dates-week');
      }

      if (context.isToday(marr[i])) {
        datename.setAttribute('class', 'sbdatepicker__body--datename');
        datename.classList.add('sbdatepicker__body--datename-today');
      }

      if (marr[i].getDate() === context.getDateSelected() && marr[i].getMonth() === datepickerContext.getMonth()) {
        if (!datename.classList.contains('sbdatepicker__body--datename-today')) {
          datename.setAttribute('class', 'sbdatepicker__body--datename');
          datename.classList.add('sbdatepicker__body--datename-selected');
        }
      }

      datename.textContent = marr[i].getDate();
      const formattedDate = getDateForStore(marr[i]);

      datename.setAttribute('data-datepicker-date', formattedDate);
      if (groupedEntries.includes(formattedDate)) {
        if (!datename.classList.contains('sbdatepicker__body--datename-selected')
          && !datename.classList.contains('sbdatepicker__body--datename-today')
        ) {
          datename.setAttribute('class', 'sbdatepicker__body--datename');
          datename.classList.add('sbdatepicker__body--datename-entries');
        }
      } else {
        datename.classList.remove('sbdatepicker__body--datename-entries');
      }

      cell.append(datename);
      sbdatepickerBody.append(cell);
    }
  }

  function resetpickerData() {
    montharray = datepickerContext.getMonthArray();
    groupedEntries = store.getMonthEntryDates(montharray);
    currentWeekStart = context.getWeek();
    count = 0;
    hasweek = false;
  }

  function renderpicker(y, m, d) {
    context.setDate(y, m, d);
    context.setDateSelected(d);
    datepickerContext.setDate(y, m, d);
    setViews(
      context.getComponent(),
      context,
      store,
      datepickerContext,
    );

    resetpickerData();
    createCells(montharray);
    setDatepickerHeader();
    montharray = [];
  }

  function renderSelectedDay(e, d) {
    context.setDateSelected(d);
    const selected = document.querySelectorAll('.sbdatepicker__body--datename-selected');
    for (const x of selected) {
      x.classList.remove('sbdatepicker__body--datename-selected');
    }
    e.target.setAttribute('class', 'sbdatepicker__body--datename');
    e.target.classList.add('sbdatepicker__body--datename-selected');
  }

  function renderprevMonth() {
    datepickerContext.setPrevMonth();
    resetpickerData();
    createCells(montharray);
    setDatepickerHeader();
    montharray = [];
  }

  function rendernextMonth() {
    datepickerContext.setNextMonth();
    resetpickerData();
    createCells(montharray);
    setDatepickerHeader();
    montharray = [];
  }

  /**
   *
   * @param {*} e
   * @description some extra steps required for the sidebar datepicker
   * vs any other datepicker due to the fact that the sidebar datepicker will stay open after a date is selected.
   * These extra steps include:
   *  1. do not re render datepicker if the selected date is in the current month, just update the selected date
   *  2. the one exception to above rule is if the component is the week view and the selected date is not in the current week, then re render the datepicker
   *  3. if the component is in the list view (schedule), do not re render the view, just update the selected date
   */
  function setNewDate(e) {
    const target = e.target;
    const [y, m, d] = target.getAttribute('data-datepicker-date').split('-').map((x) => Number.parseInt(x));

    const component = context.getComponent();

    if (component === 'list') {
      renderSelectedDay(e, d);
      return;
    }

    if (component === 'year') {
      if (context.getYear() !== y) {
        renderpicker(y, m, d);
        return;
      } else {
        renderSelectedDay(e, d);
        return;
      }
    }

    if (component === 'month') {
      if (context.getMonth() !== m) {
        renderpicker(y, m, d);
        return;
      } else {
        renderSelectedDay(e, d);
        return;
      }
    }

    if (component === 'week') {
      if (e.target.parentElement.classList.contains('sbdatepicker__body--dates-week')) {
        renderSelectedDay(e, d);
        return;
      } else {
        renderpicker(y, m, d);
      }
      return;
    }

    if (component === 'day') {
      if (context.isToday(new Date(y, m, d))) {
        renderSelectedDay(e, d);
        return;
      } else {
        renderpicker(y, m, d);
        return;
      }
    }
  }

  function setCheckMonthYear() {
    checkmonth = datepickerContext.getMonth();
    checkyear = datepickerContext.getYear();
  }

  function getMonthYearCheck() {
    return checkmonth === datepickerContext.getMonth() && checkyear === datepickerContext.getYear();
  }

  function openChangeDateModal() {
    setCheckMonthYear();
    sbdatepickerChangeDate.classList.add('show-sbdpcd');
    yearpickerSetYear(null, true);
    monthpickerSetMonth(datepickerContext.getMonth(), true);
  }

  function closeChangeDateModal() {
    // check if date has changed;
    if (!getMonthYearCheck()) {
      resetpickerData();
      createCells(montharray);
      setDatepickerHeader();
      montharray = [];
    }
    sbdatepickerChangeDate.classList.remove('show-sbdpcd');
  }

  function monthpickerSetMonth(val, init) {
    const newmonth = val;

    if (!init && newmonth === datepickerContext.getMonth()) return;
    datepickerContext.setMonth(newmonth);
    for (const [idx, month] of sbmonthpickerMonths.entries()) {
      if (idx === newmonth) {
        month.classList.add('monthpicker__active-month');
      } else {
        month.classList.remove('monthpicker__active-month');
      }
    }
  }

  function yearpickerSetYear(increment, init) {
    if (init) {
      sbyearpickerTitle.textContent = datepickerContext.getYear();
      return;
    }

    const newyear = Number.parseInt(datepickerContext.getYear()) + increment;
    if (newyear == +datepickerContext.getYear()) return;
    datepickerContext.setYear(newyear);
    sbyearpickerTitle.textContent = newyear;
  }

  function delegateDatepickerEvents(e) {
    const datenumber = getClosest(e, '.sbdatepicker__body--datename');
    const navnext = getClosest(e, '.sbdatepicker-nav--next');
    const navprev = getClosest(e, '.sbdatepicker-nav--prev');
    const title = getClosest(e, '.sbdatepicker-title');
    const closeChangeDateBtn = getClosest(e, '.sb-close-change-date');
    const ypNext = getClosest(e, '.sb-yearpicker-next');
    const ypPrev = getClosest(e, '.sb-yearpicker-prev');
    const mpMonth = getClosest(e, '.sb-monthpicker__month');

    if (datenumber) {
      setNewDate(e);
      return;
    }

    if (navnext) {
      rendernextMonth();
      return;
    }

    if (navprev) {
      renderprevMonth();
      return;
    }

    if (datenumber) {
      setNewDate(e);
      return;
    }

    if (title) {
      openChangeDateModal();
      return;
    }

    if (closeChangeDateBtn) {
      closeChangeDateModal();
      return;
    }

    if (ypNext) {
      yearpickerSetYear(1, false);
      return;
    }

    if (ypPrev) {
      yearpickerSetYear(-1, false);
      return;
    }

    if (mpMonth) {
      const newmonth = Number.parseInt(e.target.getAttribute('data-sbdp-month'));
      monthpickerSetMonth(newmonth, false);
      return;
    }
  }

  function initsbdatepicker() {
    sbdatepickerChangeDate.classList.remove('show-sbdpcd');
    setDatepickerHeader();
    createCells(montharray);
    sbdatepicker.onclick = delegateDatepickerEvents;
    montharray = null;
    groupedEntries = null;
  }

  initsbdatepicker();
}
