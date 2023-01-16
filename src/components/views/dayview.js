// import setViews from "../../config/setViews"
// import setSidebarDatepicker from "../../components/menus/sidebarDatepicker";
import fullFormConfig from "../forms/formUtils"
import FormSetup from "../forms/setForm";
import { 
  Day, 
  CoordinateEntry 
} from "../../factory/entries"
import getEntryOptionModal from "../menus/entryOptions";


import calcTime, { formatTime } from "../../utilities/timeutils"

import {
  formatDateForDisplay,
  formatStartEndDate,
  formatStartEndTime,
  getDuration,
  getDateTimeFormatted,
  getTempDates,
  getFormDateObject,
  sortDates,
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

import {
  generateId,
  getClosest,
} from "../../utilities/helpers"

import createToast from "../toastPopups/toast"

import {
  toastNoCategorySelected,
  removeToastNoCategorySelected,
} from "../toastPopups/toastCallbacks"

import locales from "../../locales/en"


// main app header
const header = document.querySelector(".header")

// day view header (row 1)
const dvHeader = document.querySelector(".dayview--header")
const dvHeaderDayNumber = document.querySelector(".dayview--header-day__title")
const dvHeaderDayOfWeek = document.querySelector(".dayview--header-day__number")
const dvHeaderInfo = document.querySelector(".dayview--header-day__info")

// day view on top container (row 2)
const dvOnTop = document.querySelector('.dayview--ontop-container');

// main grid wrapper (row 3) (scroll wrapper) (offsettop)
const dvGrid = document.querySelector(".dayview__grid")
const dvSideGrid = document.querySelector(".dayview--side-grid")
const dvMainGrid = document.querySelector(".dayview--main-grid")

export default function setDayView(context, store, datepickerContext) {
  let entries = store.getDayEntries(context.getDate())
  let boxes = new Day(
    entries.day,
    entries.allDay
  );

  function getDayviewHeaderEntryCount() {
    let allboxes = boxes.getAllBoxes();
    if (allboxes.length === 0) { return "no entries"; } 
    let [endingToday, startingToday] = [0, 0];

    for (let i = 0; i < allboxes.length; i++) {
      const [start, end, current] = [
        new Date(allboxes[i].start), 
        new Date(allboxes[i].end),
        context.getDate(),
      ]
      if (start.getDate() === current.getDate()) { startingToday++; }
      if (end.getDate() === current.getDate()) { endingToday++; }
    }

    if (startingToday === 1 && endingToday === 1) {
      return `1 entry from ${formatStartEndTime(
        new Date(allboxes[0].start), 
        new Date(allboxes[0].end)
      )}`
    }

    if (startingToday > 1 && (startingToday === endingToday)) {
      return `${startingToday} entries starting & ending today`;
    }
    
    let fulltitle = ""
    if (startingToday > 0) {
      if (startingToday === 1) {
        fulltitle += `${startingToday} entry starting today`
      } else {
        fulltitle += `${startingToday} entries started`
      }
    } else {
      fulltitle += `no entries started`
    }

    if (endingToday > 0) {
      if (endingToday === 1) {
        fulltitle += ` – ${endingToday} ending`
      } else {
        fulltitle += ` – ${endingToday} ending`
      }
    } else {
      fulltitle += ` – no entries ending today`
    }

    return fulltitle;
  }

  function configHeader() {
    [dvHeaderDayNumber, dvHeaderDayOfWeek, dvHeaderInfo].forEach((el) => {
      el.innerText = "";
    })

    dvHeaderDayOfWeek.textContent = context.getDay()
    dvHeaderDayNumber.textContent = locales.labels.weekdaysShort[context.getWeekday()].toUpperCase() + " :";
    dvHeaderInfo.textContent = getDayviewHeaderEntryCount();
  }

  function renderBoxes() {
    dvMainGrid.innerText = ""
    boxes.getBoxes().forEach((entry) => {
      createBox(
        dvMainGrid,                         // column
        entry,                              // entry object
        "day",                              // current view 
        store.getCtgColor(entry.category)   // background color
      )
    })
  }

  /** RESIZE NORTH/SOUTH */
  function resizeBoxNSDay(e, box) {
    setStylingForEvent("dragstart", dvGrid, store)
    const col = box.parentElement

    let boxhasOnTop = false;
    const boxorig = getOriginalBoxObject(box)
    if (box.classList.contains("dv-box-ontop")) {
      boxhasOnTop = true;
      resetStyleOnClick("day", box)
    }

    box.classList.add("dv-box-resizing")
    const boxTop = box.offsetTop
    const headerOffset = 72 + header.offsetHeight
    createTemporaryBox(box, col, boxhasOnTop, "day")

    let amountScrolled = parseInt(dvGrid.scrollTop)
    const mousemove = (e) => {
      let newHeight = Math.round(((e.pageY + amountScrolled) - boxTop - headerOffset) / 12.5) * 12.5;

      if (newHeight <= 12.5) {
        box.style.height = "12.5px";
        return;
      } else if ((newHeight + boxTop) > 1188) {
        return;
      } else {
        box.style.height = `${newHeight}px`;
      }
    }

    function mouseup() {
      document.querySelector(".dv-temporary-box").remove();
      box.classList.remove("dv-box-resizing");
      if (boxhasOnTop) {box.classList.add("dv-box-ontop");}

      if (boxorig.height === box.offsetHeight) {
        resetOriginalBox(box, boxorig);
      } else {
        setBoxTimeAttributes(box, "day")
        const start = +box.getAttribute("data-dv-start-time")
        const length = +box.getAttribute("data-dv-time-intervals")
        const time = calcTime(start, length)
        box.setAttribute("data-dv-time", time)
        box.firstChild.nextSibling.firstElementChild.textContent = time

        updateBoxCoordinates(box, "day", boxes)
        boxes.updateStore(store, box.getAttribute("data-dv-box-id"))
        // check if new position overlaps with other boxes and handle
        if (boxes.getBoxes().length > 1) {
          handleOverlap(null, "day", boxes)
        } else {
          box.setAttribute("data-dv-box-index", "box-one")
        }
      }


      configHeader()
      setStylingForEvent("dragend", dvGrid, store);
      document.removeEventListener("mousemove", mousemove)
      document.removeEventListener("mouseup", mouseup)
    }
    document.addEventListener("mousemove", mousemove)
    document.addEventListener("mouseup", mouseup)
  }


  /** DRAG NORTH/ SOUTH, EAST/ WEST */
  function dragEngineDay(e, box) {
    setStylingForEvent("dragstart", dvGrid, store)
    const col = box.parentElement

    let boxhasOnTop = false;
    const boxorig = getOriginalBoxObject(box);
    if (box.classList.contains("dv-box-ontop")) {
      boxhasOnTop = true;
      resetStyleOnClick("day", box);
    }

    box.classList.add("dv-box-dragging")
    createTemporaryBox(box, col, boxhasOnTop, "day")

    const startTop = +box.style.top.split("px")[0]
    const boxHeight = +box.style.height.split("px")[0]
    const startCursorY = e.pageY - dvGrid.offsetTop
    const headerOffset = 72 + header.offsetHeight
    let movedY = 0;

    /** DRAG NORTH SOUTH */
    const mousemove = (e) => {
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
      movedY = newOffsetY
    }

    const mouseup = () => {
      document.querySelector(".dv-temporary-box").remove()
      box.classList.remove("dv-box-dragging")
      if (boxhasOnTop) { box.classList.add("dv-box-ontop") }

      // if box did not move, no render needed
      // click event to open form
      if (Math.abs(movedY) <= 6) {
        // @function setReset() is provided to the form via the store
        // it will call once the form is either submitted or cancelled
        const setReset = () => {
          resetOriginalBox(box, boxorig);
          document.querySelector(".dayview-temp-box")?.remove()
          configHeader()
          setStylingForEvent("dragend", dvGrid, store)
        }
        store.setFormResetHandle("day", setReset)

        const id = box.getAttribute("data-dv-box-id");
        const tempEntry = store.getEntry(id);
        const color = box.style.backgroundColor;
        let offsetColor = color;
        // let offsetColor = `${color.slice(0,3)}a(${color.slice(4, color.length - 1)}, 0.4)`;

        const dates = calcDateOnClick(
          new Date(tempEntry.start),
          +box.getAttribute("data-dv-start-time"),
          +box.getAttribute("data-dv-time-intervals"),
        );

        openDayviewForm(
          box,
          [1, 3],
          [tempEntry.category, color, offsetColor],
          dates,
          ["edit", id, tempEntry.title, tempEntry.description],
        );
        // ******************
      } else {
        setBoxTimeAttributes(box, "day")
        const start = +box.getAttribute("data-dv-start-time")
        const length = +box.getAttribute("data-dv-time-intervals")
        const time = calcTime(start, length)
        box.setAttribute("data-dv-time", time)

        box.children[1].children[0].textContent = time;
        updateBoxCoordinates(box, "day", boxes)
        boxes.updateStore(
          store,
          box.getAttribute("data-dv-box-id")
        )
        // check if new position overlaps with other boxes and handle
        if (boxes.getBoxes().length > 1) {
          handleOverlap(null, "day", boxes)
        } else {
          box.setAttribute("data-dv-box-index", "box-one")
        }


        configHeader()
      }
      
      setStylingForEvent("dragend", dvGrid, store)
      document.removeEventListener("mousemove", mousemove)
      document.removeEventListener("mouseup", mouseup)
    }
    document.addEventListener("mousemove", mousemove)
    document.addEventListener("mouseup", mouseup)
  }


  function handleDayviewClose() {
    document.querySelector(".dayview-temp-box")?.remove()
  }


  function openDayviewForm(box, coords, category, dates, type) {
    // store.setFormResetHandle("week", handleWeekviewFormClose);
    store.setFormResetHandle("day", handleDayviewClose);

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
      1,
      [1, 3],
      parseInt((coords.y * 12.5) - dvGrid.scrollTop)
    );

    const [start, end] = dates
    setup.setDates(getFormDateObject(start, end));

    openForm();
    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

    fullFormConfig.getConfig(setup.getSetup());
  }


  /** CREATE BOX ON DRAG */
  /** Drag down empty column to create box */
  function createBoxOnDragDay(e) {
    setStylingForEvent("dragstart", dvGrid, store)
    const [tempcategory, color] = store.getFirstActiveCategoryKeyPair()

    const box = document.createElement('div');
    box.setAttribute("class", "dv-box dv-box-dragging dayview-temp-box");

    // boxheader is static - create from template
    const boxheader = createTempBoxHeader("day")


    const boxcontent = document.createElement('div');
    const boxtime = document.createElement('span');
    const boxtimeend = document.createElement('span');
    boxcontent.classList.add('dv-box__content');
    boxtime.classList.add('dv-box-time');
    boxtimeend.classList.add('dv-box-time');

    const headerOffset = 72 + header.offsetHeight;
    const scrolled = parseInt(dvGrid.scrollTop);
    const startCursorY = e.pageY - headerOffset;

    let y = Math.round((startCursorY + Math.abs(scrolled)) / 12.5) * 12.5;
    box.setAttribute("style", getBoxDefaultStyle(y, color))
    
    let coords = { y: +y / 12.5, x: 1, h: 1, e: 2 }
    let [starthour, startmin, endhour, endmin] = startEndDefault(y);
    
    function mousemove(e) {
      let newHeight = Math.round(((e.pageY + scrolled) - y - headerOffset) / 12.5) * 12.5
      if (newHeight <= 12.5) {newHeight = 12.5;}
      if ((newHeight + y) > 1188) {newHeight = 1187.5 - y;}

      box.style.height = `${newHeight}px`
      coords.h = +newHeight / 12.5
      coords.e = +coords.y + coords.h

      endhour = calcNewHourFromCoords(newHeight, y)
      endmin = calcNewMinuteFromCoords(newHeight, y)

      boxtime.style.wordBreak = "break-word"
      boxtime.textContent = `${formatTime(starthour, startmin)} – `
      boxtimeend.textContent = `${formatTime(endhour, endmin)}`
    }

    // append content to temporary box
    boxcontent.append(boxtime, boxtimeend);
    box.append(boxheader, boxcontent)
    e.target.appendChild(box)

    function mouseup() {
      const datesData = getTempDates(
        new Date(context.getDate()),
        [starthour, endhour],
        [startmin, endmin],
      )

      openDayviewForm(
        box,
        [1, 3],
        [tempcategory, color, color],
        datesData,
        ["create", null, null, null],
      )

      setStylingForEvent("dragend", dvGrid, store)
      document.removeEventListener("mouseup", mouseup)
      document.removeEventListener("mousemove", mousemove)
    }
    document.addEventListener("mousemove", mousemove)
    document.addEventListener("mouseup", mouseup)
  }

  function renderBoxesForGrid() {
    renderBoxes()
    handleOverlap(null, "day", boxes)
  }

  function delegateDayView(e) {
    if (getClosest(e, ".dv-box-resize-s")) {
      resizeBoxNSDay(e, e.target.parentElement);
      return;
    }
    
    if (getClosest(e, ".dv-box")) {
      dragEngineDay(e, e.target);
      return;
    }

    if (getClosest(e, ".dayview--main-grid")) {
      createBoxOnDragDay(e, e.target);
      return;
    }
  }

  const initDayView = () => {
    renderBoxesForGrid();
    configHeader();
    dvGrid.onmousedown = delegateDayView;
  }
  initDayView();
}




// function setBoxWidth(box) {
//   switch (box.getAttribute("data-dv-box-index")) {
//     case "dv-box-one":
//       box.style.left = 'calc((100% - 0px) * 0 + 0px)';
//       box.style.width = "calc((100% - 0px) * 1)"
//       break;
//     case "dv-box-two":
//       box.style.left = "calc((100% - 0px) * 0.1 + 0px)"
//       box.style.width = "calc((100% - 0px) * 0.9)";
//       break;
//     case "dv-box-three":
//       box.style.left = "calc((100% - 0px) * 0.15 + 0px)"
//       box.style.width = "calc((100% - 0px) * 0.85)";
//       break;
//     case "dv-box-four":
//       box.style.left = "calc((100% - 0px) * 0.35 + 0px)"
//       box.style.width = "calc((100% - 0px) * 0.65)"
//       break;
//     case "dv-box-five":
//       box.style.left = "calc((100% - 0px) * 0 + 0px)"
//       box.style.width = "calc((100% - 0px) * 0.34)"
//       break;
//     case "dv-box-six":
//       box.style.left = "calc((100% - 0px) * 0.05 + 0px)"
//       box.style.width = "calc((100% - 0px) * 0.4)"
//       break;
//     case "dv-box-seven":
//       box.style.left = "calc((100% - 0px) * 0.1 + 0px)"
//       box.style.width = "calc((100% - 0px) * 0.38)"
//       break;
//     case "dv-box-eight":
//       box.style.left = "calc((100% - 0px) * 0.1)"
//       box.style.width = "calc((100% - 4px) * 0.4)"
//       break;
//     case "dv-box-nine":
//       box.style.left = "calc((100% - 0px) * 0.3)"
//       box.style.width = "calc((100% - 4px) * 0.7)"
//       break;
//     default:
//       break;
//   }
// }

// function handleOverlap() {
//   // console.log(ho(null, "day",boxes.checkForCollision()))
//   const collisions = boxes.checkForCollision()
//   if (collisions.length > 0) {
//     let boxnumarr = [
//       'dv-box-one',
//       'dv-box-two',
//       'dv-box-three',
//       'dv-box-four',
//       'dv-box-five',
//       'dv-box-six',
//       'dv-box-seven',
//       'dv-box-eight',
//       'dv-box-nine'
//     ]
//     for (let i = 0; i < collisions.length; i++) {
//       const box = document.querySelector(`[data-dv-box-id="${collisions[i].id}"]`)
//       if (i === 0) {
//         box.setAttribute("class", "dv-box box-one")
//         box.setAttribute("data-dv-box-index", "dv-box-one")
//       } else {
//         box.setAttribute("class", `dv-box dv-box-ontop ${boxnumarr[i]}`)
//         box.setAttribute("data-dv-box-index", boxnumarr[i])
//       }
//       setBoxWidth(box)
//     }
//   }
// }




  // function getScript(totalEntries, idx, endDate, endTime) {
//   const scripts = [
//     `1 entry ending on ${endDate}`,
//     `1 entry ending at ${endTime}`,
//     `${totalEntries} total entries ending on ${endDate}`, 
//     `${totalEntries} total entries - last ending on ${endDate}`, 
//     `${totalEntries} total entries - last ending at ${endTime}`,
//     `${totalEntries} entry ending today at ${endTime}`,
//   ];
//   return scripts[idx]
// }

// console.log(boxes.getAllBoxes().filter((box) => {
//   return box.end.getDate() === context.getDate() && box.end.getMonth() === context.getMonth() && box.end.getFullYear() === context.getYear()
// }))
// console.log(boxes.getEntriesEndingOnDay(context.getDay()))

// if (totalEntries > 0) {

//   // no day entries
//   if (dayLen === 0) {
//     if (alldayLen > 1) {
//       // multiple all day entries 
//       console.log(boxes)

//     } else {
//       // one all day entry
//       fulltitle = getScript(
//         1, 0, formatDateForDisplay(boxes.getBoxesTop()[0].end), null,
//       )
//     }
//     // multiple day & all day
//   } else if (dayLen > 0 && alldayLen > 0) {


//     // only day entries
//   } else {
//     // & multiple day entries
//     if (dayLen > 1) {
//       temp = boxes.getBoxes()[dayLen - 1].end
//       fulltitle = getScript(
//         totalEntries,
//         4,
//         null,
//         formatTime(temp.getHours(), temp.getMinutes()),
//       )
//     } else {
//       temp = boxes.getBoxes()[dayLen - 1].end
//       fulltitle = getScript(
//         1, 5, null, formatTime(temp.getHours(), temp.getMinutes())
//       )
//     }
//   }
// }