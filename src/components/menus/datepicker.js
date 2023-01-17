import { getClosest } from "../../utilities/helpers"
import { 
  getDateForStore, 
  compareDates, 
  getDateFromAttribute,
  isBeforeDate
} from "../../utilities/dateutils";
import setViews from "../../config/setViews";

const datepicker = document.querySelector(".datepicker");
const datepickeroverlay = document.querySelector(".datepicker-overlay")
const datepickerBody = document.querySelector(".datepicker__body--dates");
const datepickerTitle = document.querySelector(".datepicker-title");
// prev and next buttons aside from main app header datewrapper
const headerPrevBtn = document.querySelector(".prev")
const headerNextBtn = document.querySelector(".next")


export default function setDatepicker(context, store, datepickerContext, type) {
  let montharray = datepickerContext.getMonthArray();
  let count = 0;
  let hasweek;

  function setDatepickerHeader() {
    const y = datepickerContext.getYear()
    const m = datepickerContext.getMonthName()
    datepickerTitle.textContent = `${m} ${y}`
  }

  function createCells(montharray) {
    let groupedEntries = store.getMonthEntryDates(montharray)
    let currentWeekStart = context.getWeek();

    datepickerBody.innerText = "";
    for (let i = 0; i < montharray.length; i++) {
      const cell = document.createElement("div");
      const datename = document.createElement("div");
      cell.classList.add("datepicker__body--dates-cell");
      datename.classList.add("datepicker__body--datename");

      if (montharray[i].getMonth() !== datepickerContext.getMonth()) {
        datename.classList.add("datepicker__body--datename-disabled");
      }

      if (compareDates(montharray[i], currentWeekStart) && context.getComponent() === "week") {
        hasweek = true;
      }

      if (hasweek) {
        count++
        if (count <= 7) {
          cell.classList.add("datepicker__body--dates-week")
        }
      } else {
        cell.classList.remove("datepicker__body--dates-week")
      }

      if (montharray[i].getDate() === context.getDateSelected() && montharray[i].getMonth() === datepickerContext.getMonth()) {
        if (!datename.classList.contains("datepicker__body--datename-today")) {
          datename.setAttribute("class", "datepicker__body--datename")
          datename.classList.add("datepicker__body--datename-selected");
        }
      }

      if (context.isToday(montharray[i])) {
        datename.setAttribute("class", "datepicker__body--datename")
        datename.classList.add("datepicker__body--datename-today");
      }

      datename.innerText = montharray[i].getDate();
      const formattedDate = getDateForStore(montharray[i])

      datename.setAttribute("data-datepicker-date", formattedDate);
      if (groupedEntries.includes(formattedDate)) {
        if (!datename.classList.contains("datepicker__body--datename-today") && !datename.classList.contains("datepicker__body--datename-selected")) {
          datename.setAttribute("class", "datepicker__body--datename")
          datename.classList.add("datepicker__body--datename-entries")
        }
      } else {
        datename.classList.remove("datepicker__body--datename-entries")
      }

      cell.appendChild(datename)
      datepickerBody.appendChild(cell);
    }

    currentWeekStart = null;
    groupedEntries = []
  }

  function closeDatepicker() {
    datepicker.classList.add("hide-datepicker");
    datepickeroverlay.classList.add("hide-datepicker-overlay")
    const formOpen = store.getActiveOverlay().has("hide-form-overlay");
    const listOpen = context.getComponent() !== "list";
    if (listOpen || !formOpen) {
      headerPrevBtn.removeAttribute("style");
      headerNextBtn.removeAttribute("style");
    }
    montharray = []

    if (type === "form") {
      document.querySelector(".active-form-date")?.classList.remove("active-form-date")
    }

    document.removeEventListener("keydown", handleKeydownNav)
  }

  function renderpicker(y, m, d) {
    context.setDate(y, m, d)
    context.setDateSelected(d)
    setViews(context.getComponent(), context, store, datepickerContext);
    datepickerContext.setDate(y, m, d)
    closeDatepicker()
  }

  function handleFormDate(y, m, d) {
    datepickerContext.setDate(y, m, d)
    context.setDateSelected(d)
    const datepickerDate = datepickerContext.getDate()

    const activeFormDate = document.querySelector(".active-form-date")
    activeFormDate.setAttribute("data-form-date", `${y}-${m}-${d}`)
    activeFormDate.textContent = `${datepickerContext.getMonthName().slice(0, 3)} ${d}, ${y}`

    const inactiveFormDate = document?.querySelector(".inactive-form-date")
    const inactiveValue = inactiveFormDate.getAttribute("data-form-date").split("-").map(x => parseInt(x))
    const inactiveDate = new Date(inactiveValue[0], inactiveValue[1], inactiveValue[2])
    const inactiveDateType = inactiveFormDate.getAttribute("data-form-date-type")

    /**
     * FORM DATEPICKER CONDITIONS
     * 1. if user selects start date that is after end date
     *   -- set end date to start date
     * 2. if user selects end date that is before start date
     *  -- set start date to end date
     */
    if ((isBeforeDate(inactiveDate, datepickerDate) && inactiveDateType === "end") || (isBeforeDate(datepickerDate, inactiveDate) && inactiveDateType === "start")) {
      inactiveFormDate.setAttribute("data-form-date", `${y}-${m}-${d}`)
      inactiveFormDate.textContent = `${datepickerContext.getMonthName().slice(0, 3)} ${d}, ${y}`
    }
  }

  function setNewDate(e) {
    const [y, m, d] = getDateFromAttribute(e.target, "data-datepicker-date")
    if (type === "form") {
      handleFormDate(y, m, d)
      closeDatepicker()
    } else {
      renderpicker(y, m, d)
    }
  }

  function renderNextMonth() {
    datepickerContext.setNextMonth()
    montharray = datepickerContext.getMonthArray()
    createCells(montharray)
    setDatepickerHeader()
  }

  function renderPrevMonth() {
    datepickerContext.setPrevMonth()
    montharray = datepickerContext.getMonthArray()
    createCells(montharray)
    setDatepickerHeader()
  }

  function setSelectedToNextDay() {
    console.log(datepickerContext.getDateSelected())
  }

  function delegateDatepickerEvents(e) {
    const datenumber = getClosest(e, ".datepicker__body--datename")
    const navnext = getClosest(e, ".datepicker-nav--next")
    const navprev = getClosest(e, ".datepicker-nav--prev")

    if (datenumber) {
      setNewDate(e)
      return;
    }

    if (navnext) {
      renderNextMonth()
      return;
    }

    if (navprev) {
      renderPrevMonth()
      return;
    }
  }

  function handleKeydownNav(e) {
    switch (e.key) {
      case "ArrowDown":
        renderPrevMonth();
        break;
      case "ArrowUp":
        renderNextMonth();
        break;
      case "ArrowRight":
        setSelectedToNextDay();
        break;
      case "Escape":
        closeDatepicker();
        break;
      default:
        break;
    }
  }

  const initDatepicker = () => {
    datepickeroverlay.addEventListener("click", e => {
      closeDatepicker()
    }, { once: true })
    setDatepickerHeader();
    createCells(montharray);
    datepicker.onmousedown = delegateDatepickerEvents;
    document.addEventListener("keydown", handleKeydownNav);
    montharray = [];
    store.setResetDatepickerCallback(closeDatepicker)
  }
  initDatepicker()
}
