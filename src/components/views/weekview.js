import setViews from "../../config/setViews"
import setSidebarDatepicker from "../menus/sidebarDatepicker"
import fullFormConfig from "../forms/formUtils"
import FormSetup from "../forms/setForm";
import getEntryOptionModal from "../menus/entryOptions";
import { Week } from "../../factory/entries"
import locales from "../../locales/en"
import calcTime, { formatTime } from "../../utilities/timeutils"
import {
  formatStartEndDate,
  formatStartEndTime,
  getDuration,
  getDateTimeFormatted,
  getTempDates,
  getFormDateObject,
  getDateFromAttribute,
} from "../../utilities/dateutils"
import handleOverlap, {
  setStylingForEvent,
  updateBoxCoordinates,
  setBoxTimeAttributes,
  createBox,
  createTemporaryBox,
  getBoxDefaultStyle,
  resetStyleOnClick,
  createTempBoxHeader,
  startEndDefault,
  calcNewHourFromCoords,
  calcNewMinuteFromCoords,
  calcDateOnClick,
  getOriginalBoxObject,
  resetOriginalBox,
} from "../../utilities/dragutils"
import { getClosest } from "../../utilities/helpers"
import createToast from "../toastPopups/toast"
import {
  toastNoCategorySelected,
  removeToastNoCategorySelected,
} from "../toastPopups/toastCallbacks"



// main app sidebar
const sidebar = document.querySelector('.sidebar');

// calendar overlay
const resizeoverlay = document.querySelector(".resize-overlay")

// weekview main grid wrapper & children
const containerCalendars = document.querySelector(".container__calendars")
const main = document.querySelector(".weekview")
const container = document.querySelector(".weekview--calendar")
const weekviewHeader = document.querySelector(".weekview--header")
const weekviewHeaderDayNumber = document.querySelectorAll(".weekview--header-day__number")
const weekviewHeaderTitle = document.querySelectorAll('.weekview--header-day__title');
const weekviewHeaderDay = document.querySelectorAll(".weekview--header-day")
const weekviewGrid = document.querySelector(".weekview__grid")
const cols = document.querySelectorAll(".week--col")

// weekview top grid & children
const alldaymodule = document.querySelector(".weekview--allday-module")
const topCols = document.querySelectorAll(".allday--col")

export default function setWeekView(context, store, datepickerContext) {
  const weekArray = context.getWeekArray()
  let entries = store.getWeekEntries(weekArray)
  let boxes = new Week(entries.day, entries.allDay);

  function configureDaysOfWeek() {
    let hasToday;
    let hasSelected;
    let dayNumbers = []
    let ymd = []
    const today = context.getToday()
    let [ty, tm, td] = [today.getFullYear(), today.getMonth(), today.getDate()]

    weekArray.forEach((day, idx) => {
      let [y, m, d] = [
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
      ];

      dayNumbers.push(d);
      ymd.push(`${y}-${m}-${d}`)

      if (d === context.getDateSelected() && m === context.getMonth()) {
        hasSelected = d;
      }

      if (d === td && m === tm && y === ty) {
        hasToday = d;
      }
    })

    dayNumbers.forEach((num, idx) => {
      if (num === hasSelected) {
        weekviewHeaderDay[idx].classList.add("wvh--selected")
      } else {
        weekviewHeaderDay[idx].classList.remove("wvh--selected")
      }

      weekviewHeaderDayNumber[idx].textContent = num
      if (num === hasToday) {
        weekviewHeaderDay[idx].classList.add("wvh--today")
      } else {
        weekviewHeaderDay[idx].classList.remove("wvh--today")
      }

      weekviewHeaderDay[idx].setAttribute("data-weekview-date", ymd[idx]);
      topCols[idx].setAttribute("data-wvtop-day", num)
    })


    function setDayView(e) {
      let [yr, mo, da] = getDateFromAttribute(e.target, "data-weekview-date")
      context.setDate(yr, mo, da)
      context.setDateSelected(da)
      context.setComponent("day")
      setViews("day", context, store, datepickerContext)
    }
    weekviewHeader.onmousedown = setDayView
  }

  function renderSidebarDatepickerWeek() {
    if (!sidebar.classList.contains("hide-sidebar")) {
      datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay())
      setSidebarDatepicker(context, store, datepickerContext)
    }
  }

  function renderBoxes() {
    cols.forEach(col => { col.innerText = "" })
    topCols.forEach(col => { col.innerText = "" })

    boxes.getBoxes().forEach((entry) => {
      const col = cols[+entry.coordinates.x];
      createBox(col, entry, "week", store.getCtgColor(entry.category))
    })

    const boxt = boxes.getBoxesTopLengths()
    for (const k in boxt) {
      const col = topCols[+k]
      createBoxesTop(col, boxt[k])
    }
  }

  function createBoxesTop(col, len) {
    const cell = document.createElement("div")

    cell.classList.add("allday__cell");
    cell.classList.add("allday__cell--active");
    const taskicons = document.createElement("div");
    taskicons.classList.add("wv-ad--taskicons");
    const icon = document.createElement("div");
    icon.classList.add("wv-ad--taskicon");
    icon.style.backgroundColor = "#6F0C2B";
    taskicons.appendChild(icon);

    const celltitle = document.createElement("div");
    celltitle.classList.add("wv-ad--celltitle");
    len > 1 ? celltitle.textContent = `${len} tasks` : celltitle.textContent = `${len} task`;
    cell.append(taskicons, celltitle);
    col.appendChild(cell);
  }

  function createAllDayModalCell(entry, idx) {
    const cell = document.createElement("div")
    cell.classList.add("allday-modal__cell")
    cell.setAttribute("data-allday-modal-cell", idx)
    cell.setAttribute("data-allday-modal-cell-id", entry.id)
    cell.style.backgroundColor = store.getCtgColor(entry.category)

    const celldatetimes = document.createElement("div")
    celldatetimes.classList.add("allday-modal__datetime")
    const celldate = document.createElement("div")
    celldate.classList.add("allday-modal__cell-dates")
    celldate.textContent = formatStartEndDate(entry.start, entry.end)
    const celltime = document.createElement("div")
    celltime.classList.add("allday-modal__cell-time")
    celltime.textContent = `(${formatStartEndTime(entry.start, entry.end)})`
    const cellduration = document.createElement("div")
    cellduration.classList.add("allday-modal__cell-duration")
    cellduration.textContent = getDuration(entry.start, entry.end)

    const cellcontent = document.createElement("div")
    cellcontent.classList.add("allday-modal__cell-content")
    const celltitle = document.createElement("div")
    celltitle.classList.add("allday-modal__cell-title")
    celltitle.textContent = `"${entry.title}"`

    celldatetimes.append(celldate, cellduration)
    cellcontent.append(celltitle)

    cell.append(cellcontent, celldatetimes)
    return cell;
  }

  function createAllDayModal(e, col, entries, idx, cell) {
    // setStylingForEvent("dragstart")
    // need to add resize overlay
    let dayofweek = locales.labels.weekdaysLong[idx]
    let daynumber = col.getAttribute("data-wvtop-day")

    const modal = document.createElement("div")
    modal.classList.add("allday-modal")
    const modalheader = document.createElement("div")
    modalheader.classList.add("allday-modal__header")
    const modaltitle = document.createElement("div")
    modaltitle.classList.add("allday-modal-title")
    modaltitle.textContent = `${dayofweek} ${daynumber}`
    const modalsubtitle = document.createElement("div")
    modalsubtitle.classList.add("allday-modal-subtitle")
    modalsubtitle.textContent = "(multiple day events)"
    modalheader.append(modaltitle, modalsubtitle)

    const modalcontent = document.createElement("div")
    modalcontent.classList.add("allday-modal__content")

    const colwidth = col.offsetWidth
    let colleft = col.offsetLeft + weekviewGrid.offsetLeft - 48
    let colheight = 86 + (entries.length * 48)

    const setColPos = () => {
      if (idx === 0) { colleft += 48 }
      if (idx === 6) { colleft -= 48 }
      if (colheight >= 760) { colheight = 760 }

      modal.style.height = colheight + "px"
      modal.style.left = colleft + "px"
      modal.style.width = (colwidth + 96) + "px"
      modal.style.top = +weekviewGrid.offsetTop + "px"
    }
    setColPos()

    modal.appendChild(modalheader)
    entries.forEach((entry, idx) => {
      const cell = createAllDayModalCell(entry, idx)
      modalcontent.appendChild(cell)
    })

    modal.appendChild(modalcontent)
    main.insertBefore(modal, document.querySelector(".weekview__top"))

    const closealldaymodal = () => {
      // modal.remove()
      // resizeoverlay.classList.add("hide-resize-overlay")
      // cell.firstChild.firstChild.style.backgroundColor = "#6F0C2B"
    }
  }

  function openAllDayModal(e, cell) {
    // const col = cell.parentElement
    // cell.firstChild.firstChild.style.backgroundColor = "#01635b"
    // const colidx = parseInt(col.getAttribute("data-allday-column"))
    // let colentries = boxes.getBoxesByColumnTop(colidx)
    // if (colentries.length > 0) {
    //   createAllDayModal(e, col, colentries, colidx, cell)
    // }
  }

  function getcol(idx) {
    return document.querySelector(`[data-column-index="${idx}"]`)
  }

  function handleWeekviewFormClose() {
    document.querySelector(".temp-week-box")?.remove()
  }

  function openWeekviewForm(box, coords, category, dates, type) {
    store.setFormResetHandle("week", handleWeekviewFormClose);

    const openForm = store.getRenderFormCallback();
    const setup = new FormSetup();

    const [submitType, id, title, description] = type;
    setup.setSubmission(submitType, id, title, description);
    if (submitType === "create") { box.style.opacity = 0.9; }

    const [categoryName, color, offsetColor] = category;
    setup.setCategory(
      categoryName,
      color,
      offsetColor,
    );

    setup.setPosition(
      +coords.x,
      [+coords.x, 3],
      parseInt((coords.y * 12.5) - weekviewGrid.scrollTop)
    );

    const [start, end] = dates
    setup.setDates(getFormDateObject(start, end));

    openForm();
    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);
    fullFormConfig.getConfig(setup.getSetup());
  }

  /** DRAG NORTH, SOUTH, EAST, WEST */
  function dragEngineWeek(e, box) {
    setStylingForEvent("dragstart", main, store)
    const col = box.parentElement
    const originalColumn = col.getAttribute("data-column-index")
    let currentColumn = col.getAttribute("data-column-index")

    let boxhasOnTop = false;
    const boxorig = getOriginalBoxObject(box)
    if (box.classList.contains("box-ontop")) {
      boxhasOnTop = true;
      resetStyleOnClick("week", box);
    }

    box.classList.add("box-dragging")
    box.setAttribute("data-box-col", currentColumn)
    // show original position while dragging
    createTemporaryBox(box, col, boxhasOnTop, "week")

    const startTop = +box.style.top.split("px")[0]
    const boxHeight = +box.style.height.split("px")[0]
    let startCursorY = e.pageY - weekviewGrid.offsetTop
    let startCursorX = e.pageX
    let [movedX, movedY] = [0, 0];

    /** DRAG NORTH SOUTH */
    const mousemove = (e) => {
      const headerOffset = weekviewGrid.offsetTop
      const currentCursorY = e.pageY - headerOffset
      let newOffsetY = currentCursorY - startCursorY
      let newTop = Math.round((newOffsetY + startTop) / 12.5) * 12.5

      if (newTop < 0 || currentCursorY < 0) {
        newTop = 0
        return;
      } else if (newTop + boxHeight > 1188) {
        return;
      }

      box.style.top = `${newTop}px`
      /** DRAG EAST/WEST */
      const direction = e.pageX - startCursorX > 0 ? "right" : "left"
      const currentCursorX = e.pageX
      let newOffsetX = startCursorX - currentCursorX
      let leftColX;
      let rightColX;

      if (+currentColumn - 1 >= 0) {
        leftColX = parseInt(getcol(currentColumn - 1).getBoundingClientRect().right)
      } else {
        leftColX = null
      }

      if (+currentColumn + 1 < cols.length) {
        rightColX = parseInt(getcol(+currentColumn + 1).getBoundingClientRect().left)
      } else {
        rightColX = null;
      }

      if (direction === "right" && rightColX !== null) {
        if (e.pageX >= rightColX) {
          getcol(+currentColumn + 1).appendChild(box)
          startCursorX = e.pageX
          currentColumn = +currentColumn + 1
          box.setAttribute("data-box-col", +currentColumn)
        }
      }

      if (direction === "left" && leftColX !== null) {
        if (e.pageX <= leftColX) {
          getcol(+currentColumn - 1).appendChild(box)
          startCursorX = e.pageX
          currentColumn = +currentColumn - 1
          box.setAttribute("data-box-col", +currentColumn)
        }
      }

      movedY = newOffsetY
      movedX = newOffsetX
    }

    function mouseup() {
      document.querySelector(".temporary-box").remove();
      box.classList.remove("box-dragging");
      if (boxhasOnTop) { box.classList.add("box-ontop") }

      if (Math.abs(movedX) <= 6 && Math.abs(movedY) <= 6) {
        resetOriginalBox(box, boxorig);
        const id = box.getAttribute("data-box-id");
        const tempEntry = store.getEntry(id);

        let color = box.style.backgroundColor;
        let offsetColor = color;

        const dates = calcDateOnClick(
          weekArray[parseInt(originalColumn)],
          +box.getAttribute("data-start-time"),
          +box.getAttribute("data-time-intervals"),
        );

        openWeekviewForm(
          box,
          [parseInt(originalColumn), 3],
          [tempEntry.category, color, offsetColor],
          dates,
          ["edit", id, tempEntry.title, tempEntry.description],
        );

      } else {
        setBoxTimeAttributes(box, "week");
        const time = calcTime(
          +box.getAttribute("data-start-time"),
          +box.getAttribute("data-time-intervals")
        );

        box.setAttribute("data-time", time);
        box.children[1].children[0].textContent = time;

        updateBoxCoordinates(box, "week", boxes);
        boxes.updateStore(
          store,
          box.getAttribute("data-box-id"),
          weekArray
        );
        // if box is moved to a new column, update sidebar datepicker
        if (currentColumn !== +originalColumn) {
          renderSidebarDatepickerWeek()
        };
        // check if new position overlaps with other boxes and handle
        let droppedCol = +box.getAttribute("data-box-col");
        if (boxes.getBoxesByColumn(droppedCol).length > 1) {
          handleOverlap(droppedCol, "week", boxes)
        } else {
          box.setAttribute("box-idx", "box-one")
        }
      }

      setStylingForEvent("dragend", main, store)
      document.removeEventListener("mousemove", mousemove)
      document.removeEventListener("mouseup", mouseup)
    }
    document.addEventListener("mousemove", mousemove)
    document.addEventListener("mouseup", mouseup)
  }



  /** RESIZE NORTH/SOUTH 
   * resizing will never trigger form
  */
  function resizeBoxNS(e, box) {
    setStylingForEvent("dragstart", main, store);
    const col = box.parentElement;
    const currentColumn = col.getAttribute("data-column-index");
    box.setAttribute("data-box-col", currentColumn);

    let boxhasOnTop = false;
    let boxorig = getOriginalBoxObject(box);
    if (box.classList.contains("box-ontop")) {
      boxhasOnTop = true;
      resetStyleOnClick("week", box);
    }

    box.classList.add("box-resizing")
    const boxTop = box.offsetTop;
    createTemporaryBox(box, col, boxhasOnTop, "week");

    const mousemove = (e) => {
      const headerOffset = weekviewGrid.offsetTop;
      let amountScrolled = Math.abs(parseInt(container.getBoundingClientRect().top));
      if (amountScrolled == headerOffset) {
        amountScrolled -= headerOffset;
      } else if (container.getBoundingClientRect().top > 0) {
        amountScrolled = headerOffset - amountScrolled;
      } else {
        amountScrolled += headerOffset;
      }



      // console.log(window.innerHeight, e.pageY)

      // if (window.innerHeight < e.pageY) {
      //   main.scrollBy(0, Math.abs(window.innerHeight - e.pageY));
      // }

      const newHeight = Math.round(((e.pageY - boxTop - headerOffset) + amountScrolled) / 12.5) * 12.5;

      if (newHeight <= 12.5) {
        box.style.height = '12.5px';
        return;
      } else if (newHeight + parseInt(box.style.top) > 1188) {
        return;
      } else {
        box.style.height = `${newHeight}px`;
      }
    }

    const mouseup = (e) => {
      document.querySelector(".temporary-box").remove();
      box.classList.remove("box-resizing");
      if (boxhasOnTop) { box.classList.add("box-ontop") }

      if (box.style.height === boxorig.height) {
        if (boxhasOnTop) {
          box.setAttribute("class", boxorig.class);
          box.style.left = boxorig.left;
          box.style.width = boxorig.width;
        }
      } else {
        setBoxTimeAttributes(box, "week");
        const start = +box.getAttribute("data-start-time");
        const length = +box.getAttribute("data-time-intervals");
        const time = calcTime(start, length);
        box.children[1].children[0].textContent = time;
        updateBoxCoordinates(box, "week", boxes);

        let droppedCol = +box.getAttribute("data-box-col");
        if (boxes.getBoxesByColumn(droppedCol).length > 1) {
          handleOverlap(droppedCol, "week", boxes);
        }

        boxes.updateStore(
          store,
          box.getAttribute("data-box-id"),
          weekArray,
        );
      }

      setStylingForEvent("dragend", main, store);
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    }
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  }

  function renderNewBox(newStartDate, newEndDate) {
    // render after new entry is created
    entries = store.getWeekEntries(weekArray)
    boxes = new Week(
      entries.day,
      entries.allDay
    );

    if (store.getBoxesByColumn().length === 0) {
      // no need to check for collisions
      renderBoxes();
      renderSidebarDatepickerWeek();
    } else {
      renderDataForGrid();
    }
  }

  // console.log()

  /** Drag down empty column to create box */
  function createBoxOnDrag(e) {
    setStylingForEvent("dragstart", main, store);
    const [tempcategory, color] = store.getFirstActiveCategoryKeyPair();
    const colIdx = parseInt(e.target.getAttribute("data-column-index"));

    const box = document.createElement('div');
    box.setAttribute("class", "box box-dragging temp-week-box");
    
    // boxheader is static - create from template
    const boxheader = createTempBoxHeader("week");
    const boxcontent = document.createElement('div');
    const boxtime = document.createElement('span');
    const boxtimeend = document.createElement('span');
    boxcontent.classList.add('box__content');
    boxtime.classList.add('box-time');
    boxtimeend.classList.add('box-time');
    

    const headerOffset = +weekviewGrid.offsetTop;
    const scrolled = parseInt(weekviewGrid.scrollTop);
    const startCursorY = e.pageY - weekviewGrid.offsetTop;

    let y = Math.round((startCursorY + Math.abs(scrolled))/12.5)*12.5;
    box.setAttribute("style", getBoxDefaultStyle(y, color));

    let coords = { y: +y / 12.5, x: colIdx, h: 1, e: 2 }
    let [starthour, startmin, endhour, endmin] = startEndDefault(y);

    function mousemove(e) {
      const currentCursorY = e.pageY - headerOffset;
      let newOffsetY = currentCursorY - startCursorY;
      let newHeight = Math.round((newOffsetY) / 12.5) * 12.5;

      if (newHeight <= 12.5) { newHeight = 12.5 }
      if (newHeight + y > 1188) { newHeight = 1187.5 - y }
      box.style.height = `${newHeight}px`;

      coords.h = +newHeight / 12.5;
      coords.e = +coords.y + coords.h;
      
      // console.log(coords.e)

      // if (e.pageY > (window.innerHeight - 12.5) && coords.e < 95) {
      //   let scrollIncrement = Math.abs(window.innerHeight - e.pageY);
      //   console.log(scrollIncrement)
      //   weekviewGrid.scrollTo({
      //     top: weekviewGrid.scrollTop + scrollIncrement,
      //   })
      // }

      // Math.floor(((h + y) / 12.5) / 4)
      endhour = Math.floor(((+newHeight + +y) / 12.5) / 4);
      endmin = Math.floor(((+newHeight + +y) / 12.5) % 4) * 15
      boxtime.style.wordBreak = "break-word";
      boxtime.textContent = `${formatTime(starthour, startmin)} – `;
      boxtimeend.textContent = `${formatTime(endhour, endmin)}`;
    }

    boxcontent.append(boxtime, boxtimeend);
    box.append(boxheader, boxcontent);
    e.target.appendChild(box);

    function mouseup() {
      const datesData = getTempDates(
        new Date(weekArray[colIdx]),
        [starthour, endhour],
        [startmin, endmin],
      );
      console.log(starthour, endhour)
      console.log(startmin, endmin)

      openWeekviewForm(
        box,
        coords,
        [tempcategory, color, color],
        datesData,
        ["create", null, null, null],
      );

      setStylingForEvent("dragend", main, store);
      document.removeEventListener("mouseup", mouseup);
      document.removeEventListener("mousemove", mousemove);
    }
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  }

  /** delegate via grid */
  function delegateGridEvents(e) {
    if (getClosest(e, ".box-resize-s")) {
      resizeBoxNS(e, e.target.parentElement);
      return;
    }

    if (getClosest(e, ".box")) {
      dragEngineWeek(e, e.target);
      return;
    }

    if (getClosest(e, ".week--col")) {
      createBoxOnDrag(e, e.target);
      return;
    }
  }

  function delegateGridTop(e) {
    if (getClosest(e, ".allday--col")) {
      openAllDayModal(e, e.target);
      return;
    }
  }

  function renderDataForGrid() {
    renderBoxes();
    const colsToCheck = boxes.getColumnsWithMultipleBoxes();
    colsToCheck.forEach(col => handleOverlap(col, "week", boxes));
  }

  const initWeek = () => {
    configureDaysOfWeek();
    renderDataForGrid();
    container.onmousedown = delegateGridEvents;
    alldaymodule.onmousedown = delegateGridTop;
  }
  initWeek();
 
  // console.log(containerCalendars.offsetWidth)
  // console.log(window.innerWidth);
  // console.log(main);
}