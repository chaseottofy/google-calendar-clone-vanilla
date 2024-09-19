import setViews from '../../config/setViews';
import locales from '../../locales/en';
import { getDateFromAttribute } from '../../utilities/dateutils';
import { getClosest } from '../../utilities/helpers';
import setSidebarDatepicker from '../menus/sidebarDatepicker';

const yearviewGrid = document.querySelector('.calendar__yearview');
const sidebar = document.querySelector('.sidebar');

export default function setYearView(context, store, datepickerContext) {
  const currDate = context.getDate();
  const currDateSelected = context.getDateSelected();

  function renderSidebarDatepicker() {
    if (!sidebar.classList.contains('hide-sidebar')) {
      datepickerContext.setDateFromDateObj(currDate);
      setSidebarDatepicker(context, store, datepickerContext);
    }
  }

  function renderMonthCells() {
    yearviewGrid.innerText = '';
    let year = currDate.getFullYear();
    let entries = store.getGroupedYearEntries(store.getYearEntries(year));
    for (let i = 0; i < 12; i++) {
      if (entries[i]) {
        yearviewGrid.append(createMonthCell(year, i, entries[i]));
      } else {
        yearviewGrid.append(createMonthCell(year, i, []));
      }
    }

    entries = null;
    year = null;
  }

  function createMonthCell(year, month, entries) {
    const { labels } = locales;
    const today = context.getToday();
    const [ty, tm, td] = [
      +today.getFullYear(),
      +today.getMonth(),
      +today.getDate(),
    ];

    const prevmonth = new Date(year, month, 0);
    const daysInPrevMonth = prevmonth.getDate();
    const currentMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = currentMonth.getDay();

    const cellWrapper = document.createElement('div');
    cellWrapper.classList.add('yv-monthcell');

    const cellHeader = document.createElement('div');
    cellHeader.classList.add('yv-monthcell__header');

    const cellHeaderRowOne = document.createElement('div');
    cellHeaderRowOne.classList.add('yv-monthcell__header--rowone');
    cellHeaderRowOne.textContent = labels.monthsLong[month];

    if (month === currDate.getMonth() && year === currDate.getFullYear()) {
      cellHeaderRowOne.classList.add('yvmht-current');
      cellWrapper.classList.add('cell-current');
    }

    // **************************
    // cell header row two
    const cellHeaderWeekDayNames = document.createElement('div');
    cellHeaderWeekDayNames.classList.add('yv-monthcell__header--weekdays');

    for (const el of labels.weekdaysNarrow) {
      const weekday = document.createElement('div');
      weekday.classList.add('yv-monthcell__header--weekday');
      weekday.textContent = el;
      cellHeaderWeekDayNames.append(weekday);
    }

    const cellBody = document.createElement('div');
    cellBody.classList.add('yv-monthcell__body');

    function populateMonths() {
      const prevmonthstart = daysInPrevMonth - firstDayOfMonth;

      const createyvcell = (day, classname, nyear, nmonth, current) => {
        const daywrapper = document.createElement('div');
        daywrapper.classList.add('yv-monthcell__body--day-wrapper');

        if (classname !== null) {
          daywrapper.classList.add(classname);
        }

        daywrapper.textContent = day;
        if (current) {
          daywrapper.setAttribute('data-yv-date', `${nyear}-${nmonth}-${day}`);
          if (day === currDateSelected && nmonth === currDate.getMonth() && nyear === currDate.getFullYear()) {
            daywrapper.classList.add('yvmb-selected');
          }
          if (day === td && nmonth === tm && nyear === ty) {
            daywrapper.classList.add('yvmb-today');
          }
          if (entries[day]) {
            daywrapper.classList.add('yvmb-has-entry');
          }
        }
        return daywrapper;
      };

      for (let i = prevmonthstart; i < daysInPrevMonth; i++) {
        cellBody.append(createyvcell(
          i + 1,
          'yvmb-prevnext',
          prevmonth.getFullYear(),
          prevmonth.getMonth(),
          false,
        ));
      }

      for (let i = 0; i < daysInMonth; i++) {
        cellBody.append(createyvcell(
          i + 1,
          null,
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          true,
        ));
      }

      const nextmonth = new Date(year, month + 1, 1);
      const nextmonthend = 42 - cellBody.children.length;
      for (let i = 0; i < nextmonthend; i++) {
        cellBody.append(createyvcell(
          i + 1,
          'yvmb-prevnext',
          nextmonth.getFullYear(),
          nextmonth.getMonth(),
          false,
        ));
      }
    }

    cellHeader.append(cellHeaderRowOne, cellHeaderWeekDayNames);
    populateMonths();
    cellWrapper.append(cellHeader, cellBody);
    return cellWrapper;
  }

  function handleDaySelection(e) {
    const target = e.target;
    const [tempy, tempm, tempd] = getDateFromAttribute(target, 'data-yv-date', null);
    context.setDate(tempy, tempm, tempd);
    context.setDateSelected(tempd);
    context.setComponent('day');
    setViews('day', context, store, datepickerContext);
    renderSidebarDatepicker();
  }

  function delegateYearEvents(e) {
    if (getClosest(e, '.yv-monthcell__body--day-wrapper')) {
      handleDaySelection(e);
    }
  }

  function resetYearview() {
    yearviewGrid.innerText = '';
    yearviewGrid.onmousedown = null;
  }

  function initYearview() {
    renderMonthCells();
    yearviewGrid.onmousedown = delegateYearEvents;
    store.setResetPreviousViewCallback(resetYearview);
    // const currentmonth = document?.querySelector('.cell-current');
    // if (currentmonth) {
    //   setTimeout(() => {
    //     yearviewGrid.scrollTo({
    //       top: Number.parseInt(currentmonth.offsetTop) - 100,
    //       behavior: 'instant',
    //     });
    //   }, 4);
    // }
  }
  initYearview();
}
