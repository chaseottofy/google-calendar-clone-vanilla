import setViews from '../../config/setViews';
import locales from '../../locales/en';
import {
  formatStartEndDate,
  getdatearray,
  getDateFromAttribute,
  getFormDateObject,
  longerThanDay,
} from '../../utilities/dateutils';
import {
  getClosest,
  hextorgba,
} from '../../utilities/helpers';
import { formatStartEndTimes } from '../../utilities/timeutils';
import fullFormConfig from '../forms/formUtils';
import FormSetup from '../forms/setForm';
import getEntryOptionModal from '../menus/entryOptions';

const dateTimeTitle = document.querySelector('.datetime-content--title');
const listview = document.querySelector('.listview');
const listviewBody = document.querySelector('.listview__body');

export default function setListView(context, store, datepickerContext) {
  const { labels } = locales;
  let monthNames = labels.monthsShort.map((x) => x.toUpperCase());
  let weekDayNames = labels.weekdaysShort.map((x) => x.toUpperCase());
  const [todayYear, todayMonth, todayDay] = getdatearray(new Date());
  /** ************************************* */

  /**
   * createRowGroups
   * @param {object} entries { "2020-01-01": [ {entry}, {entry}, {entry} ], "2020-01-02": [ {entry}, {entry}, {entry} ] }
   * @desc createRowGroups() is called from setListView().
   * The entries object uses the date as the key and the value as an array of entries for that specific date.
   */
  function createRowGroups(entries) {
    // use count to check for first rowgroup
    let count = 1;
    for (const [key, value] of Object.entries(entries)) {

      const tempdate = new Date(
        key.split('-').map((x) => Number.parseInt(x, 10)),
      );
      // {mumber} month, {number} day of month, {number} day of week
      const [month, day, dow] = [
        tempdate.getMonth(),
        tempdate.getDate(),
        tempdate.getDay(),
      ];

      const [wn, mn] = [weekDayNames[dow], monthNames[month]];

      const rgheader = createRowGroupHeader(
        wn,
        mn,
        day,
        key,
        count === 1,
      );
      count = null;

      // sort entries by end time if there are more than one per day
      if (value.length > 1) {
        value.sort((a, b) => {
          return new Date(a.end) - new Date(b.end);
        });
      }

      const rgContent = document.createElement('div');
      rgContent.classList.add('rowgroup-content');
      for (const entry of value) {
        rgContent.append(createRowGroupCell(entry));
      }

      const rg = document.createElement('div');
      rg.classList.add('listview__rowgroup');
      rg.append(rgheader, rgContent);
      listviewBody.append(rg);
    }
  }

  /**
   * createRowGroupHeader
   * @param {string} weekname SUN, MON, TUE, WED ...
   * @param {string} monthname JAN, FEB, MAR, APR ...
   * @param {number} day 1, 2, 3, 4 ...
   * @param {string} date yyyy-mm-dd
   * @param {boolean} settop true/false : is this the first rowgroup?
   */
  function createRowGroupHeader(weekname, monthname, day, date, settop) {
    const rgHeader = document.createElement('div');
    rgHeader.classList.add('rowgroup-header');
    const rgHeaderDateNumber = document.createElement('div');

    rgHeaderDateNumber.classList.add('rowgroup--header__datenumber');
    rgHeaderDateNumber.textContent = day;
    rgHeaderDateNumber.setAttribute('data-rgheader-date', date);
    const rgHeaderDate = document.createElement('div');
    rgHeaderDate.classList.add('rowgroup--header__monthdow');
    rgHeaderDate.textContent = `${monthname}, ${weekname}`;

    if (settop) {
      rgHeaderDateNumber.classList.add('top-datenumber');
      rgHeaderDate.classList.add('top-monthdow');
    }

    rgHeader.append(rgHeaderDateNumber, rgHeaderDate);
    return rgHeader;
  }

  function createRowGroupCell(entry) {
    const color = store.getCtgColor(entry.category);
    const [start, end] = [new Date(entry.start), new Date(entry.end)];
    let datetitle;
    if (longerThanDay(start, end)) {
      let tempyear = 0;
      if (start.getFullYear() !== end.getFullYear()) {
        tempyear = +end.getFullYear() - 2000;
      }

      datetitle = `${monthNames[end.getMonth()]} ${end.getDate()} ${tempyear > 0 ? tempyear : ''}`;
    } else {
      datetitle = `${formatStartEndTimes(
        [start.getHours(), end.getHours()],
        [start.getMinutes(), end.getMinutes()],
      )}`;
    }

    const rgCell = document.createElement('div');
    rgCell.classList.add('rowgroup--cell');
    rgCell.setAttribute('data-rgcell-id', entry.id);
    const rgCellColor = document.createElement('div');
    rgCellColor.classList.add('rowgroup--cell__color');
    rgCellColor.style.backgroundColor = color;
    const rgCellTime = document.createElement('div');
    rgCellTime.classList.add('rowgroup--cell__time');
    rgCellTime.textContent = datetitle;
    const rgCellTitle = document.createElement('div');
    rgCellTitle.classList.add('rowgroup--cell__title');
    rgCellTitle.textContent = entry.title;
    rgCell.append(rgCellColor, rgCellTime, rgCellTitle);
    return rgCell;
  }
  /** ************************************* */

  /**
   * resetCellActive
   * @desc remove active class & inline style from clicked cell
   */
  function resetCellActive() {
    const activeCell = document?.querySelector('.rowgroup--cell-active');
    if (activeCell) {
      activeCell.classList.remove('rowgroup--cell-active');
      activeCell.removeAttribute('style');
    }
  }

  /**
   * getRgContextMenu
   * @param {HTMLElement} cell element that was clicked
   */
  function getRgContextMenu(cell) {
    console.log(cell);
    const id = cell.getAttribute('data-rgcell-id');
    cell.classList.add('rowgroup--cell-active');
    const entry = store.getEntry(id);
    const start = entry.start;
    const color = store.getCtgColor(entry.category);
    cell.style.backgroundColor = hextorgba(color, 0.7);

    const rect = cell.getBoundingClientRect();
    const height = cell.offsetHeight;
    const rectTop = Number.parseInt(rect.top) + height;
    const rectLeft = Number.parseInt(rect.left);
    const modalHeight = 165;

    let y = rectTop + 12;
    if (rectTop + modalHeight > window.innerHeight) {
      y = rectTop - modalHeight - height - 12;
    }

    let x = rectLeft;
    if (rectLeft + 150 > window.innerWidth) {
      x = window.innerWidth - 150;
    }

    // *** config & open form ***
    store.setFormResetHandle('list', resetCellActive);

    const setup = new FormSetup();
    setup.setSubmission('edit', id, entry.title, entry.description);
    setup.setCategory(entry.category, color);
    setup.setDates(getFormDateObject(start, entry.end));
    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

    const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());
    getEntryOptionModal(context, store, entry, datepickerContext, finishSetup);
    const modal = document.querySelector('.entry__options');
    modal.style.top = y + 'px';
    modal.style.left = x + 'px';
  }

  /**
   * setDayViewLV
   * @param {HTMLElement} target first rowgroup header element (day number)
   * @desc switch to day view and set date to clicked day
   */
  function setDayViewLV(target) {
    const [year, month, day] = getDateFromAttribute(target, 'data-rgheader-date', 'month');
    context.setDate(year, month, day);
    context.setDateSelected(day);
    if (context.getSidebarState() === 'open') {
      datepickerContext.setDate(year, month, day);
      datepickerContext.setDateSelected(day);
    }
    context.setComponent('day');
    setViews('day', context, store, datepickerContext);
  }

  function delegateListview(e) {
    const headerNum = getClosest(e, '.rowgroup--header__datenumber');
    const rgCell = getClosest(e, '.rowgroup--cell');

    if (headerNum) {
      setDayViewLV(e.target);
      return;
    }

    if (rgCell) {
      getRgContextMenu(rgCell);
      return;
    }
  }

  function resetListview() {
    listviewBody.innerText = '';
    listview.onclick = null;
    monthNames = null;
    weekDayNames = null;
  }

  const initListView = () => {
    listviewBody.innerText = '';
    store.setResetPreviousViewCallback(resetListview);

    let activeEnt = store.getActiveEntries();
    console.log(activeEnt);
    if (activeEnt.length === 0) {
      dateTimeTitle.textContent = 'No Entries to Display';
    } else {

      let entries = store.sortBy(activeEnt, 'start', 'desc');
      console.log(entries);
      // console.log(entries)
      // console.log(activeEnt)
      let groupedEntries = entries.reduce((acc, curr) => {
        const date = new Date(curr.start);
        const [year, month, day] = getdatearray(date);
        const datestring = `${year}-${month}-${day}`;

        if (year < todayYear) {
          return acc;
        } else if (year === todayYear) {
          if (month < todayMonth) {
            return acc;
          } else if (month === todayMonth && day < todayDay) {
            return acc;
          }
        }

        if (!acc[datestring]) { acc[datestring] = []; }
        acc[datestring].push(curr);
        return acc;
      }, {});
      // console.log(groupedEntries)

      // set the header title to the first date with entries that is not in the past and the last date with entries
      // if no entries are in the future, set the header title to "Schedule Clear";
      let keys = Object.keys(groupedEntries);
      const length = keys.length;
      if (length === 0) {
        dateTimeTitle.textContent = 'Schedule Clear';
      } else {
        // true will slice the year at last two digits if two years are displayed at the same time;
        const earliestDate = new Date(keys[0].split('-').map((x) => Number.parseInt(x)));

        context.setDate(
          earliestDate.getFullYear(),
          earliestDate.getMonth(),
          earliestDate.getDate(),
        );

        context.setDateSelected(earliestDate.getDate());

        if (context.getSidebarState === 'open') {
          datepickerContext.setDate(
            earliestDate.getFullYear(),
            earliestDate.getMonth(),
            earliestDate.getDate(),
          );

          datepickerContext.setDateSelected(earliestDate.getDate());
        }

        dateTimeTitle.textContent = formatStartEndDate(
          keys[0],
          keys[length - 1],
          true,
        );
      }

      createRowGroups(groupedEntries);
      listview.onclick = delegateListview;
      activeEnt = null;
      entries = null;
      groupedEntries = null;
      keys = null;
    }
  };

  initListView();
}
