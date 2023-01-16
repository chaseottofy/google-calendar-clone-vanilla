import getEntryOptionModal from "../menus/entryOptions";
import setViews from "../../config/setViews";
import FormSetup from "../forms/setForm";
import fullFormConfig from "../forms/formUtils";
import { getClosest } from '../../utilities/helpers'
import { 
  getFormDateObject,
  getDateFromAttribute,
  getDuration,
  formatEntryOptionsDate,
  longerThanDay
} from "../../utilities/dateutils"
import { formatStartEndTimes } from "../../utilities/timeutils"
import locales from "../../locales/en"

const monthNames = locales.labels.monthsShort.map(x => x.toUpperCase())
const weekDayNames = locales.labels.weekdaysShort.map(x => x.toUpperCase())

const listview = document.querySelector('.listview');
const listviewBody = document.querySelector('.listview__body');

export default function setListView(context, store, datepickerContext) {
  /*************************************** */
  /* CREATE ROW GROUPS*/
  function createRowGroups(entries) {
    let count = 0;
    for (let [key, value] of Object.entries(entries)) {
      count++
      const tempdate = new Date(Date.parse(key))
      const [year, month, day, dow] = [
        tempdate.getFullYear(),
        tempdate.getMonth(),
        tempdate.getDate(),
        tempdate.getDay()
      ]

      const [wn, mn] = [weekDayNames[dow], monthNames[month]];
      const rgheader = createRowGroupHeader(wn, mn, day, key, count === 1 ? true : false);
      
      const rgContent = document.createElement("div");
      rgContent.classList.add("rowgroup-content");
      value.forEach((entry) => {
        rgContent.append(createRowGroupCell(entry))
      })
      const rg = document.createElement('div');
      rg.classList.add('listview__rowgroup');
      rg.append(rgheader, rgContent);
      listviewBody.appendChild(rg);

    }
  }

  function createRowGroupHeader(weekname, monthname, day, date, settop) {
    const rgHeader = document.createElement('div');
    rgHeader.classList.add('rowgroup-header');
    const rgHeaderDateNumber = document.createElement('div');

    rgHeaderDateNumber.classList.add('rowgroup--header__datenumber');
    rgHeaderDateNumber.textContent = day;
    rgHeaderDateNumber.setAttribute("data-rgheader-date", date)
    const rgHeaderDate = document.createElement('div');
    rgHeaderDate.classList.add('rowgroup--header__monthdow');
    rgHeaderDate.textContent = `${monthname}, ${weekname}`;
    if (settop) {
      rgHeaderDateNumber.classList.add("top-datenumber")
      rgHeaderDate.classList.add("top-monthdow")

    }
    rgHeader.append(rgHeaderDateNumber, rgHeaderDate);
    return rgHeader;
  }

  function createRowGroupCell(entry) {
    const color = store.getCtgColor(entry.category);
    const [start, end] = [new Date(entry.start), new Date(entry.end)]
    let datetitle;
    if (longerThanDay(start, end)) {
      let tempyear;
      if (start.getFullYear() !== end.getFullYear()) {
        tempyear = +end.getFullYear() - 2000;
      }

      datetitle = `${monthNames[end.getMonth()]} ${end.getDate()} ${tempyear ? tempyear : ""}`
    } else {
      datetitle = `${formatStartEndTimes(
        [start.getHours(), end.getHours()],
        [start.getMinutes(), end.getMinutes()]
      )}`
    }

    const rgCell = document.createElement('div');
    rgCell.classList.add('rowgroup--cell');
    rgCell.setAttribute('data-rgcell-id', entry.id);
    const rgCellColor = document.createElement("div");
    rgCellColor.classList.add("rowgroup--cell__color");
    rgCellColor.style.backgroundColor = color;
    const rgCellTime = document.createElement("div");
    rgCellTime.classList.add("rowgroup--cell__time");
    rgCellTime.textContent = datetitle;
    const rgCellTitle = document.createElement("div");
    rgCellTitle.classList.add("rowgroup--cell__title");
    rgCellTitle.textContent = entry.title;
    rgCell.append(rgCellColor, rgCellTime, rgCellTitle);
    return rgCell;
  }
  /*************************************** */


  /*************************************** */
  // EVENTS
  function resetCellActive() {
    const activeCell = document?.querySelector(".rowgroup--cell-active");
    if (activeCell) {
      activeCell.classList.remove("rowgroup--cell-active");
    }
  }

  function getRgContextMenu(cell) {
    const id = cell.getAttribute("data-rgcell-id");
    cell.classList.add("rowgroup--cell-active");
    const entry = store.getEntry(id);
    const start = entry.start;
    const color = store.getCtgColor(entry.category);

    const rect = cell.getBoundingClientRect();
    const height = cell.offsetHeight;
    const rectTop = parseInt(rect.top) + height;
    const rectLeft = parseInt(rect.left);

    let y = rectTop;
    if (rectTop > window.innerHeight) {
      y = window.innerHeight - rectTop;
    }

    let x = rectLeft;
    if (rectLeft + 150 > window.innerWidth) {
      x = window.innerWidth - 150;
    }

    // *** config & open form ***
    store.setFormResetHandle("list", resetCellActive);

    const setup = new FormSetup();
    setup.setSubmission("edit", id, entry.title, entry.description);
    setup.setCategory(entry.category, color, color);
    setup.setPosition(x, [x, y], y);
    setup.setDates(getFormDateObject(start, entry.end));
    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

    const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());
    getEntryOptionModal(context, store, entry, datepickerContext, finishSetup);
  }


  // SWITCH TO DAY VIEW
  function setDayViewLV(target) {
    let [year, month, day] = getDateFromAttribute(target, 'data-rgheader-date', "month");
    context.setDate(year, month, day);
    context.setDateSelected(day);
    if (context.getSidebarState() === "open") {
      datepickerContext.setDate(year, month, day);
      datepickerContext.setDateSelected(day);
    }
    context.setComponent("day")
    setViews("day", context, store, datepickerContext)
  }
  /*************************************** */


  /*************************************** */
  // DELEGATION
  function delegateListview(e) {
    const headerNum = getClosest(e, ".rowgroup--header__datenumber");
    const rgCell = getClosest(e, ".rowgroup--cell");

    if (headerNum) {
      setDayViewLV(e.target);
      return;
    }

    if (rgCell) {
      // console.log(rgCell)
      // rgCell.classList.toggle("rowgroup--cell-active")
      getRgContextMenu(rgCell)
      return;
    }
  }

  const initListView = () => {
    listviewBody.innerText = "";
    const entries = store.sortBy(store.getActiveEntries(), "start", "desc");
    const today = new Date();
    const [todayYear, todayMonth, todayDay] = [
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    ];

    const groupedEntries = entries.reduce((acc, curr) => {
      const date = new Date(curr.start)
      const [year, month, day] = [
        +date.getFullYear(),
        +date.getMonth() + 1,
        +date.getDate(),
      ];

      const datestring = `${year}-${month}-${day}` // for parse&group

      if (year < todayYear) {
        return acc;
      }

      if (year === todayYear && month < todayMonth) {
        return acc;
      }

      if (year === todayYear && month === todayMonth && day < todayDay) {
        return acc;
      }
    
      if (!acc[datestring]) {
        acc[datestring] = []
      }
      acc[datestring].push(curr)
      return acc;
    }, {})

    createRowGroups(groupedEntries);
    listview.onclick = delegateListview;
  }

  initListView();
}