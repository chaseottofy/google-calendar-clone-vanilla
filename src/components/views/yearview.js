import setViews from "../../config/setViews"
import locales from "../../locales/en"
import { getClosest } from "../../utilities/helpers"
import { getDateFromAttribute } from "../../utilities/dateutils"
import setSidebarDatepicker from "../../components/menus/sidebarDatepicker";
const monthnames = locales.labels.monthsLong
const weekDayNames = locales.labels.weekdaysNarrow
const yearviewGrid = document.querySelector(".calendar__yearview");
const sidebar = document.querySelector(".sidebar");


export default function setYearView(context, store, datepickerContext) {
  const year = context.getYear();
  const today = context.getToday();
  const [ty, tm, td] = [today.getFullYear(), today.getMonth(), today.getDate()];
  const entries = store.getGroupedYearEntries(store.getYearEntries(year));

  function renderMonthCells() {
    yearviewGrid.innerText = ""
    for (let i = 0; i < 12; i++) {
      if (entries[i]) {
        yearviewGrid.appendChild(createMonthCell(i, entries[i]));
      } else {
        yearviewGrid.appendChild(createMonthCell(i, []));
      }
    }
  }

  function renderSidebarDatepicker() {
    if (!sidebar.classList.contains("hide-sidebar")) {
      datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay())
      setSidebarDatepicker(context, store, datepickerContext)
    }
  }

  function createMonthCell(month, entries) {
    const prevmonth = new Date(year, month, 0)
    const daysInPrevMonth = prevmonth.getDate()
    const nextmonth = new Date(year, month + 2, 0)
    const currentMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = currentMonth.getDay()

    const cellWrapper = document.createElement("div")
    cellWrapper.classList.add("yv-monthcell")

    const cellHeader = document.createElement("div")
    cellHeader.classList.add("yv-monthcell__header")

    const cellHeaderRowOne = document.createElement("div")
    cellHeaderRowOne.classList.add("yv-monthcell__header--rowone")

    const cellHeaderTitle = document.createElement("span")
    cellHeaderTitle.textContent = monthnames[month]

    if (month === context.getMonth() && year === context.getYear()) {
      cellHeaderTitle.classList.add("yvmht-current")
      cellWrapper.classList.add("cell-current")
    }

    cellHeaderTitle.classList.add("yv-monthcell__header--title")
    cellHeaderRowOne.append(cellHeaderTitle)

    // cell header row two
    const cellHeaderWeekDayNames = document.createElement("div")
    cellHeaderWeekDayNames.classList.add("yv-monthcell__header--weekdays")

    weekDayNames.forEach((el) => {
      const weekday = document.createElement("div")
      weekday.classList.add("yv-monthcell__header--weekday")
      weekday.textContent = el
      cellHeaderWeekDayNames.appendChild(weekday)
    })

    cellHeader.append(cellHeaderRowOne,cellHeaderWeekDayNames)

    const cellBody = document.createElement("div")
    cellBody.classList.add("yv-monthcell__body")

    function populateMonths() {
      let count = 0;
      let prevmonthstart = daysInPrevMonth - firstDayOfMonth

      const createcell = (day, classname, year, month, current) => {
        const daywrapper = document.createElement("div")
        daywrapper.classList.add("yv-monthcell__body--day-wrapper")
        
        const daynumber = document.createElement("div")
        daynumber.setAttribute("class", classname);
        daynumber.setAttribute("data-yv-date", `${year}-${month}-${day}`);
        daynumber.textContent = day;
        
        if (current) {
          // check if day is selected
          if (day === context.getDateSelected() && month === context.getMonth() && year === context.getYear()) {
            daynumber.classList.add("yvmb-selected")
          }

          // check if day is today
          if (day === td && month === tm && year === ty) {
            daynumber.classList.add("yvmb-today")
          }

          // check if day has entry
          if (entries[day]) {
            daynumber.classList.add("yvmb-has-entry")
          }
        }
        
        daywrapper.appendChild(daynumber)
        return daywrapper
      }


      for (let i = prevmonthstart; i < daysInPrevMonth; i++) {

        cellBody.appendChild(createcell(
          i + 1, 
          "yv-monthcell__body--day yvmb-prevnext",
          prevmonth.getFullYear(),
          prevmonth.getMonth(),
          false,
        ))
        count++
      }

      for (let i = 0; i < daysInMonth; i++) {
        cellBody.appendChild(createcell(
          i + 1, 
          "yv-monthcell__body--day",
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          true,
        ))
        count++
      }

      let i = 0
      while (count < 42) {
        i++
        cellBody.appendChild(createcell(
          i, 
          "yv-monthcell__body--day yvmb-prevnext",
          nextmonth.getFullYear(),
          nextmonth.getMonth(),
          false,
        ))
        count++
      }
    }
    
    populateMonths()
    cellWrapper.append(cellHeader, cellBody)
    return cellWrapper
  }

  function handleDaySelection(e) {
    const target = e.target;
    const [year, month, day] = getDateFromAttribute(target, "data-yv-date", null);
    context.setDate(year, month, day);
    context.setDateSelected(day);
    context.setComponent("day");
    setViews("day", context, store, datepickerContext);
    renderSidebarDatepicker();
  }

  function delegateYearEvents(e) {
    if (getClosest(e, ".yv-monthcell__body--day")) {
      handleDaySelection(e);
    }
  }

  renderMonthCells();
  yearviewGrid.onmousedown = delegateYearEvents;
}