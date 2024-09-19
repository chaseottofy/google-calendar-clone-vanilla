import setViews from '../../config/setViews';
import locales from '../../locales/en';
import {
  formatStartEndDate,
  getdatearray,
  getDateFromArray,
  getDateFromAttribute,
  getFormDateObject,
  longerThanDay,
  sortEndDateValues,
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
const listviewSwitchBtns = document.querySelectorAll('.lv-view-input');

export default function setListView(context, store, datepickerContext) {
  const { labels } = locales;
  let monthNames = labels.monthsShort.map((x) => x.toUpperCase());
  let weekDayNames = labels.weekdaysShort.map((x) => x.toUpperCase());
  const listViews = {
    tasks: {
      header: '',
      dom: [],
    },
    calendar: {
      header: '',
      dom: [],
    },
  };

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
      const tempdate = getDateFromArray(key.split('-'));
      const rgheader = createRowGroupHeader(
        weekDayNames[tempdate.getDay()],
        monthNames[tempdate.getMonth()],
        tempdate.getDate(),
        key,
        count === 1,
      );
      count = null;

      const rgContent = document.createElement('div');
      rgContent.classList.add('rowgroup-content');
      for (const entry of sortEndDateValues(value)) {
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

  const setListViewGrouped = (groupedEntries) => {
    let keys = Object.keys(groupedEntries);
    const length = keys.length;

    if (length === 0) {
      dateTimeTitle.textContent = 'Schedule Clear';
      return;
    }

    const earliestDate = getDateFromArray(keys[0].split('-'));
    context.setDateFromDateObj(earliestDate);
    context.setDateSelected(earliestDate.getDate());

    if (context.getSidebarState === 'open') {
      datepickerContext.setDateFromDateObj(earliestDate);
      datepickerContext.setDateSelected(earliestDate.getDate());
    }

    dateTimeTitle.textContent = formatStartEndDate(
      keys[0],
      keys[length - 1],
      true,
    );

    createRowGroups(groupedEntries);
    groupedEntries = null;
    keys = null;
  };

  const formatGroupEntries = (entries, startDate) => {
    const [todayYear, todayMonth, todayDay] = getdatearray(startDate);
    return entries.reduce((acc, curr) => {
      const date = new Date(curr.start);
      const [year, month, day] = getdatearray(date);
      const datestring = `${year}-${month}-${day}`;
      if (year < todayYear) return acc;
      if (year === todayYear && month < todayMonth) return acc;
      if (year === todayYear && month === todayMonth && day < todayDay) return acc;

      if (!acc[datestring]) { acc[datestring] = []; }
      acc[datestring].push(curr);
      return acc;
    }, {});
  };

  const setupListView = (activeEnt, entries) => {
    listviewBody.innerText = '';
    if (activeEnt.length === 0) {
      dateTimeTitle.textContent = 'No Entries to Display';
      return;
    }

    if (listview.getAttribute('data-listview-type') === 'tasks') {
      setListViewGrouped(formatGroupEntries(entries, new Date()));
    } else {
      const earliestDate = entries.length > 0 ? new Date(entries[0].start) : new Date();
      setListViewGrouped(formatGroupEntries(entries, earliestDate));
    }
    activeEnt = null;
    entries = null;
  };

  /**
   * list propogates either all active tasks or just tasks due after current date
   * 'listViews' stores result of both types
   * @param {MouseEvent} e input change event
   * @param {object} activeEntries
   * @param {object} entries
   */
  const handleReInit = (e, activeEntries, entries) => {
    const dataType = e.target.value;
    listview.setAttribute('data-listview-type', dataType);
    if (listViews.calendar.dom.length > 0) {
      listviewBody.innerText = '';
      for (const elem of listViews[dataType].dom) {
        listviewBody.append(elem);
      }
      dateTimeTitle.textContent = listViews[dataType].header;
    } else {
      setupListView(activeEntries, entries);
      listViews[dataType].dom.push(...listviewBody.children);
      listViews[dataType].header = dateTimeTitle.textContent;
    }
  };

  const initListView = () => {
    const activeEntries = store.getActiveEntries();
    let entries = store.sortBy(activeEntries, 'start', 'desc');

    store.setResetPreviousViewCallback(resetListview);
    setupListView(activeEntries, entries);

    listViews.tasks.dom.push(...listviewBody.children);
    listViews.tasks.header = dateTimeTitle.textContent;

    listview.onclick = delegateListview;

    for (const input of listviewSwitchBtns) {
      input.onchange = (e) => {
        handleReInit(e, activeEntries, entries);
      };
    }
  };

  initListView();
}
