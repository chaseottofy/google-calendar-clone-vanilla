import setViews from '../../config/setViews';
import {
  compareDates,
  getDateForStore,
  getDateFromAttribute,
  isBeforeDate,
} from '../../utilities/dateutils';
import { getClosest, throttle } from '../../utilities/helpers';

const datepicker = document.querySelector('.datepicker');
const datepickeroverlay = document.querySelector('.datepicker-overlay');
const datepickerBody = document.querySelector('.datepicker__body--dates');
const datepickerTitle = document.querySelector('.datepicker-title');
const datepickerChangeDate = document.querySelector('.datepicker-change-date');

// prev and next buttons aside from main app header datewrapper
const headerPrevBtn = document.querySelector('.prev');
const headerNextBtn = document.querySelector('.next');

const yearpickerTitle = document.querySelector('.yearpicker-title');
const monthpickerMonths = document.querySelectorAll('.monthpicker__month');

export default function setDatepicker(context, store, datepickerContext, type) {
  let montharray = datepickerContext.getMonthArray();
  let count = 0;
  let hasweek;
  const testDateSelected = type === 'form' ? datepickerContext.getDateSelected() : context.getDateSelected();
  let [checkmonth, checkyear] = [null, null];
  const datepickerKeypressThrottle = throttle(handleKeydownNav, 100);

  function setDatepickerHeader() {
    const y = datepickerContext.getYear();
    const m = datepickerContext.getMonthName();
    datepickerTitle.textContent = `${m} ${y}`;
  }

  function createCells(marr) {
    datepickerBody.innerText = '';
    let groupedEntries = store.getMonthEntryDates(marr);
    let currentWeekStart = context.getWeek();

    for (let i = 0; i < marr.length; i++) {
      const cell = document.createElement('div');
      const datename = document.createElement('div');
      cell.classList.add('datepicker__body--dates-cell');
      datename.classList.add('datepicker__body--datename');

      if (marr[i].getMonth() !== datepickerContext.getMonth()) {
        datename.classList.add('datepicker__body--datename-disabled');
      }

      if (compareDates(marr[i], currentWeekStart) && context.getComponent() === 'week') {
        hasweek = true;
      }

      if (hasweek) {
        count++;
        if (count <= 7) {
          cell.classList.add('datepicker__body--dates-week');
        }
      } else {
        cell.classList.remove('datepicker__body--dates-week');
      }

      if (marr[i].getDate() === testDateSelected && marr[i].getMonth() === datepickerContext.getMonth()) {
        if (!datename.classList.contains('datepicker__body--datename-today')) {
          datename.setAttribute('class', 'datepicker__body--datename');
          datename.classList.add('datepicker__body--datename-selected');
        }
      }

      if (context.isToday(marr[i])) {
        datename.setAttribute('class', 'datepicker__body--datename');
        datename.classList.add('datepicker__body--datename-today');
      }

      datename.innerText = marr[i].getDate();
      const formattedDate = getDateForStore(marr[i]);

      datename.setAttribute('data-datepicker-date', formattedDate);
      if (groupedEntries.includes(formattedDate)) {
        if (!datename.classList.contains('datepicker__body--datename-today') && !datename.classList.contains('datepicker__body--datename-selected')) {
          datename.setAttribute('class', 'datepicker__body--datename');
          datename.classList.add('datepicker__body--datename-entries');
        }
      } else {
        datename.classList.remove('datepicker__body--datename-entries');
      }

      cell.append(datename);
      datepickerBody.append(cell);
    }

    currentWeekStart = null;
    groupedEntries = [];
  }

  function renderpicker(y, m, d) {
    context.setDate(y, m, d);
    context.setDateSelected(d);
    setViews(context.getComponent(), context, store, datepickerContext);
    datepickerContext.setDate(y, m, d);
    closeDatepicker();
  }

  function handleFormDate(y, m, d) {
    datepickerContext.setDate(y, m, d);
    context.setDateSelected(d);
    const datepickerDate = datepickerContext.getDate();

    const activeFormDate = document.querySelector('.active-form-date');
    activeFormDate.setAttribute('data-form-date', `${y}-${m}-${d}`);
    activeFormDate.textContent = `${datepickerContext.getMonthName().slice(0, 3)} ${d}, ${y}`;

    const inactiveFormDate = document?.querySelector('.inactive-form-date');
    const inactiveValue = inactiveFormDate.getAttribute('data-form-date').split('-').map((x) => Number.parseInt(x));
    const inactiveDate = new Date(inactiveValue[0], inactiveValue[1], inactiveValue[2]);
    const inactiveDateType = inactiveFormDate.getAttribute('data-form-date-type');

    /**
     * FORM DATEPICKER CONDITIONS
     * 1. if user selects start date that is after end date
     *   -- set end date to start date
     * 2. if user selects end date that is before start date
     *  -- set start date to end date
     */
    if ((isBeforeDate(inactiveDate, datepickerDate) && inactiveDateType === 'end') || (isBeforeDate(datepickerDate, inactiveDate) && inactiveDateType === 'start')) {
      inactiveFormDate.setAttribute('data-form-date', `${y}-${m}-${d}`);
      inactiveFormDate.textContent = `${datepickerContext.getMonthName().slice(0, 3)} ${d}, ${y}`;
    }
  }

  function setNewDate(e, data) {
    let [y, m, d] = [null, null, null];
    if (e === null) {
      y = data[0];
      m = data[1];
      d = data[2];
    } else {
      const temp = getDateFromAttribute(e.target, 'data-datepicker-date');
      y = temp[0];
      m = temp[1];
      d = temp[2];
    }
    if (type === 'form') {
      handleFormDate(y, m, d);
      closeDatepicker();
    } else {
      renderpicker(y, m, d);
    }
  }

  function setCheckMonthYear() {
    checkmonth = datepickerContext.getMonth();
    checkyear = datepickerContext.getYear();
  }

  function getMonthYearCheck() {
    return checkmonth === datepickerContext.getMonth() && checkyear === datepickerContext.getYear();
  }

  function renderNextMonth() {
    datepickerContext.setNextMonth();
    montharray = datepickerContext.getMonthArray();
    createCells(montharray);
    setDatepickerHeader();
  }

  function renderPrevMonth() {
    datepickerContext.setPrevMonth();
    montharray = datepickerContext.getMonthArray();
    createCells(montharray);
    setDatepickerHeader();
  }

  function setSelectedToNextDay() {
    let curr = document.querySelector('.datepicker__body--datename-selected');
    const parent = curr.parentElement;
    const next = parent?.nextElementSibling?.firstElementChild;

    if (!next || next === undefined || next === null) {
      renderNextMonth();
      datepickerContext.setDateSelected(1);
      curr = document.querySelector('.datepicker__body--datename-selected');
      curr.classList.remove('datepicker__body--datename-selected');
      const frst = document.querySelectorAll('.datepicker__body--datename');
      frst[0].classList.add('datepicker__body--datename-selected');
      return;
    } else {
      curr.classList.remove('datepicker__body--datename-selected');
      next.classList.add('datepicker__body--datename-selected');
      const attr = next.getAttribute('data-datepicker-date');
      const newDateSelected = Number.parseInt(attr.split('-')[2]);
      datepickerContext.setDateSelected(newDateSelected);
      return;
    }
  }

  function setSelectedToPrevDay() {
    let curr = document.querySelector('.datepicker__body--datename-selected');
    const parent = curr.parentElement;
    const prev = parent?.previousElementSibling?.firstElementChild;

    if (!prev || prev === undefined || prev === null) {
      renderPrevMonth();
      const lastday = datepickerContext.getDaysInMonth();
      datepickerContext.setDateSelected(+lastday);
      curr = document.querySelector('.datepicker__body--datename-selected');
      curr.classList.remove('datepicker__body--datename-selected');
      const last = document.querySelectorAll('.datepicker__body--datename');
      last.at(-1).classList.add('datepicker__body--datename-selected');
      return;
    } else {
      curr.classList.remove('datepicker__body--datename-selected');
      prev.classList.add('datepicker__body--datename-selected');
      return;
    }
  }

  function monthpickerSetMonth(val, init) {
    const newmonth = val;

    if (!init && newmonth === datepickerContext.getMonth()) return;
    datepickerContext.setMonth(newmonth);
    for (const [idx, month] of monthpickerMonths.entries()) {
      if (idx === newmonth) {
        month.classList.add('monthpicker__active-month');
      } else {
        month.classList.remove('monthpicker__active-month');
      }
    }
  }

  function yearpickerSetYear(increment, init) {
    if (init) {
      yearpickerTitle.textContent = datepickerContext.getYear();
      return;
    }

    const newyear = Number.parseInt(datepickerContext.getYear()) + increment;
    if (newyear == +datepickerContext.getYear()) return;
    datepickerContext.setYear(newyear);
    yearpickerTitle.textContent = newyear;
  }

  function handleMonthpicker(dir) {
    const target = document.querySelector('.monthpicker__active-month');
    const attr = Number.parseInt(target.getAttribute('data-dp-month'));
    if (dir === 'next') {
      monthpickerSetMonth((attr + 1) % 12);
    } else {
      if (attr === 0) {
        monthpickerSetMonth(11);
      } else {
        monthpickerSetMonth(attr - 1);
      }
    }
  }

  function openChangeDateModal() {
    setCheckMonthYear();
    datepickerChangeDate.classList.add('show-dpcd');
    yearpickerSetYear(null, true);
    monthpickerSetMonth(datepickerContext.getMonth(), true);
  }

  function closeChangeDateModal() {
    // check if date has changed;
    if (!getMonthYearCheck()) {
      montharray = datepickerContext.getMonthArray();
      createCells(montharray);
      setDatepickerHeader();
    }
    datepickerChangeDate.classList.remove('show-dpcd');
  }

  function closeDatepicker() {
    datepicker.classList.add('hide-datepicker');
    datepickeroverlay.classList.add('hide-datepicker-overlay');
    closeChangeDateModal();
    const formOpen = store.getActiveOverlay().has('hide-form-overlay');
    const listOpen = context.getComponent() !== 'list';
    if (listOpen || !formOpen) {
      headerPrevBtn.removeAttribute('style');
      headerNextBtn.removeAttribute('style');
    }

    if (type === 'form') {
      document.querySelector('.active-form-date')?.classList.remove('active-form-date');
    }

    datepickerBody.innerText = '';
    datepicker.removeAttribute('tabindex');
    count = 0;
    checkmonth = null;
    checkyear = null;
    montharray = [];

    datepickeroverlay.onclick = null;
    datepicker.onclick = null;
    document.removeEventListener('keydown', datepickerKeypressThrottle);
  }

  function delegateDatepickerEvents(e) {
    const datenumber = getClosest(e, '.datepicker__body--datename');
    const navnext = getClosest(e, '.datepicker-nav--next');
    const navprev = getClosest(e, '.datepicker-nav--prev');
    const title = getClosest(e, '.datepicker-title');
    const closeChangeDateBtn = getClosest(e, '.close-change-date');
    const ypNext = getClosest(e, '.yearpicker-next');
    const ypPrev = getClosest(e, '.yearpicker-prev');
    const mpMonth = getClosest(e, '.monthpicker__month');

    if (datenumber) {
      setNewDate(e);
      return;
    }

    if (navnext) {
      renderNextMonth();
      return;
    }

    if (navprev) {
      renderPrevMonth();
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
      const newmonth = Number.parseInt(e.target.getAttribute('data-dp-month'));
      monthpickerSetMonth(newmonth, false);
      return;
    }
  }

  function handleKeydownNav(e) {
    // functionality will change depending on whether the change date modal is open -- use flag to check
    const flag = datepickerChangeDate.classList.contains('show-dpcd');
    switch (e.key) {

      case 'ArrowDown': {
        if (flag) {
          yearpickerSetYear(-1, false);
        } else {
          renderPrevMonth();
        }
        break;
      }

      case 'ArrowUp': {
        if (flag) {
          yearpickerSetYear(1, false);
        } else {
          renderNextMonth();
        }
        break;
      }

      case 'ArrowRight': {
        if (flag) {
          handleMonthpicker('next');
        } else {
          setSelectedToNextDay();
        }
        break;
      }

      case 'ArrowLeft': {
        if (flag) {
          handleMonthpicker('prev');
        } else {
          setSelectedToPrevDay();
        }
        break;
      }

      case 'Enter': {
        if (datepickerChangeDate.classList.contains('show-dpcd')) {
          closeChangeDateModal();
        } else {
          const target = document.querySelector('.datepicker__body--datename-selected');
          if (target === null || !target) {
            // the last selected day in the previous month was longer than the days in the current month
            setNewDate(null, [
              datepickerContext.getYear(),
              datepickerContext.getMonth(),
              28,
            ]);
          } else {
            const attr = getDateFromAttribute(target, 'data-datepicker-date');
            setNewDate(null, attr);
          }
        }
        break;
      }

      case 'Escape': {
        if (datepickerChangeDate.classList.contains('show-dpcd')) {
          closeChangeDateModal();
        } else {
          closeDatepicker();
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  function initDatepicker() {
    setDatepickerHeader();
    createCells(montharray);
    store.setResetDatepickerCallback(closeDatepicker);
    datepickeroverlay.onclick = closeDatepicker;
    datepicker.onclick = delegateDatepickerEvents;
    document.addEventListener('keydown', datepickerKeypressThrottle);
    montharray = [];
  }

  initDatepicker();
}
