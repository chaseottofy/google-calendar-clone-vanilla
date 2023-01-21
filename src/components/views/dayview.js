// import setViews from "../../config/setViews"
// import setSidebarDatepicker from "../../components/menus/sidebarDatepicker";
import fullFormConfig from "../forms/formUtils"
import FormSetup from "../forms/setForm";
import getEntryOptionModal from "../menus/entryOptions";

import {
  Day,
  CoordinateEntry
} from "../../factory/entries"

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

import { createCloseIcon } from "../../utilities/svgs"

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
  getOriginalBoxObject,
  resetOriginalBox,
} from "../../utilities/dragutils"

import {
  generateId,
  getClosest,
  placePopup
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

  function firstLastDates(bxs) {
    let longest = 0;
    let shortest = 100;
    for (let i = 0; i < bxs.length; i++) {
      let [tempshort, templong] = [
        bxs[i].coordinates.y,
        bxs[i].coordinates.e
      ];
      if (templong > longest) { longest = templong; }
      if (tempshort < shortest) { shortest = tempshort; }
    }
    let [h1, h2] = [Math.floor(shortest / 4), Math.floor(longest / 4)];
    let [m1, m2] = [(shortest % 4) * 15, (longest % 4) * 15];
    let [tempdate1, tempdate2] = [new Date(bxs[0].start), new Date(bxs[0].start)];
    tempdate1.setHours(h1);
    tempdate1.setMinutes(m1);
    tempdate2.setHours(h2);
    tempdate2.setMinutes(m2);
    return formatStartEndTime(
      tempdate1,
      tempdate2
    );
  }

  function getDayviewHeaderEntryCount() {
    let allboxes = boxes.getAllBoxes();
    if (allboxes.length === 0) { return "no entries"; }
    let [endingToday, startingToday] = [0, 0];
    let tempEndCase1;

    for (let i = 0; i < allboxes.length; i++) {
      const [start, end, current] = [
        new Date(allboxes[i].start),
        new Date(allboxes[i].end),
        context.getDate(),
      ]
      if (start.getDate() === current.getDate()) { startingToday++; }
      if (end.getDate() === current.getDate()) { 
        endingToday++; 
        tempEndCase1 = allboxes[i];
      }
    }

    if (startingToday === 1 && endingToday === 1) {
      return `1 entry ( ${formatStartEndTime(
        new Date(allboxes[0].start),
        new Date(allboxes[0].end)
      )} )`
    }

    if (startingToday > 1 && (startingToday === endingToday)) {
      return `${startingToday} entries starting & ending today ( ${firstLastDates(boxes.boxes)} )`;
    }


    let fulltitle = "";
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
        console.log(allboxes)
        fulltitle += ` – ${endingToday} ending ( ${formatStartEndTime(
          new Date(tempEndCase1.start),
          new Date(tempEndCase1.end)
        )} )`
      } else {
        fulltitle += ` – ${endingToday} ending ( ${firstLastDates(boxes.boxes)} )`
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

    let gmtOffset = new Date().getTimezoneOffset() / 60
    if (gmtOffset < 0) {
      gmtOffset = `+${Math.abs(gmtOffset)}`
    }

    document.querySelector(".dv-gmt").textContent = `UTC ${context.getGmt()}`
    let day = context.getDay();
    if (day < 10) { day = `0${day}` }
    dvHeaderDayOfWeek.textContent = day

    if (context.isToday()) {
      dvHeaderDayOfWeek.classList.add("dayview--header-day__number--today")
      dvHeaderDayNumber.style.color = "var(--primary1)";
    } else {
      dvHeaderDayOfWeek.classList.remove("dayview--header-day__number--today")
      dvHeaderDayNumber.removeAttribute("style");
    }
    dvHeaderDayNumber.textContent = locales.labels.weekdaysShort[context.getWeekday()].toUpperCase();
    dvHeaderInfo.textContent = getDayviewHeaderEntryCount();
  }

  function resetDayview() {
    dvMainGrid.innerText = "";
    dvOnTop.innerText = "";
  }

  function openDvMore(entr) {
    store.addActiveOverlay("morepopup")
    const morepopupoverlay = document.createElement("aside");
    morepopupoverlay.classList.add("dv--morepopup__overlay");

    const morepopup = document.createElement("aside");
    morepopup.classList.add("dv--morepopup");
    morepopup.style.left = `${dvOnTop.offsetLeft}px`;
    morepopup.style.top = `${dvOnTop.offsetTop + dvOnTop.offsetHeight}px`;
    morepopup.style.height = `${64 + (entr.length * 48)}px`;

    const morepopupHeader = document.createElement("div");
    morepopupHeader.classList.add("dv--morepopup__header");
    const morepopupTitle = document.createElement("span");
    morepopupTitle.classList.add("dv--morepopup__title");
    morepopupTitle.textContent = "More entries";
    const morepopupClose = document.createElement("span");
    morepopupClose.classList.add("dv--morepopup__close");
    morepopupClose.appendChild(createCloseIcon("var(--white3)"))
    morepopupHeader.append(morepopupTitle, morepopupClose);
    const morepopupBody = document.createElement("div");
    morepopupBody.classList.add("dv--morepopup__body");

    const createMorePopupEntry = (entry) => {
      const morepopupEntry = document.createElement("div");
      morepopupEntry.classList.add("dv--morepopup__entry");
      morepopupEntry.style.backgroundColor = `${store.getCtgColor(entry.category)}`
      const morepopupEntryTitle = document.createElement("span");
      morepopupEntryTitle.classList.add("dv--morepopup__entry-title");
      morepopupEntryTitle.textContent = entry.title;
      const morepopupCategory = document.createElement("span");
      morepopupCategory.classList.add("dv--morepopup__entry-category");
      morepopupCategory.textContent = entry.category;
      const morepopupEntryTime = document.createElement("span");
      morepopupEntryTime.classList.add("dv--morepopup__entry-time");
      morepopupEntryTime.textContent = formatStartEndTime(
        new Date(entry.start),
        new Date(entry.end)
      );
      morepopupEntry.append(morepopupEntryTitle, morepopupCategory, morepopupEntryTime);
      return morepopupEntry;
    }

    entr.forEach((entry) => {
      const morepopupEntry = createMorePopupEntry(entry);
      morepopupBody.appendChild(morepopupEntry);
    })

    const closemp = () => {
      morepopupoverlay.remove();
      morepopup.remove();
      store.removeActiveOverlay("morepopup");
      document.removeEventListener("keydown", closeMpOnEsc)
    }

    const closeMpOnEsc = (e) => {
      if (e.key === "Escape") {
        closemp();
        return;
      }
    }

    morepopup.append(morepopupHeader, morepopupBody);
    document.body.appendChild(morepopupoverlay);
    document.body.appendChild(morepopup);
    morepopupoverlay.onclick = closemp;
    morepopupClose.onclick = closemp;
    document.addEventListener("keydown", closeMpOnEsc)
  }

  function createDvTop(entr) {
    const dvtopgrid = document.createElement("div");
    dvtopgrid.classList.add("dv--ontop__grid");

    if (entries.length >= 6) {
      const moremessage = document.createElement("div");
      moremessage.classList.add("dv--ontop__more");
      moremessage.textContent = `${entr.length} more...`
      dvOnTop.appendChild(moremessage);
      // dvtopgrid.appendChild(moremessage);
      const opdm = () => openDvMore(entr)
      moremessage.onclick = opdm
      return;
    } else {
    }
    // entries.forEach((entry) => {

    // })
  }

  function renderBoxes() {
    resetDayview()
    createDvTop(boxes.getBoxesTop())
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
    document.body.style.cursor = "move";
    const col = box.parentElement

    let boxhasOnTop = false;
    const boxorig = getOriginalBoxObject(box)
    if (box.classList.contains("dv-box-ontop")) {
      boxhasOnTop = true;
      resetStyleOnClick("day", box)
    }

    box.classList.add("dv-box-resizing")
    const boxTop = box.offsetTop
    const headerOffset = +dvGrid.getBoundingClientRect().top.toFixed(2);
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
      if (boxhasOnTop) { box.classList.add("dv-box-ontop"); }

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

    const startTop = +box.style.top.split("px")[0]
    const boxHeight = +box.style.height.split("px")[0]
    const startCursorY = e.pageY - dvGrid.offsetTop;
    const headerOffset = dvGrid.offsetTop;
    let [tempX, tempY] = [e.pageX, e.pageY];
    let [sX, sY] = [0, 0];
    let hasStyles = false;

    /** DRAG NORTH SOUTH */
    const mousemove = (e) => {
      sX = Math.abs(e.clientX - tempX);
      sY = Math.abs(e.clientY - tempY);
      if (!hasStyles) {
        if (sX > 3 || sY > 3) {
          hasStyles = true;
          document.body.style.cursor = "move";
          if (box.classList.contains("dv-box-ontop")) {
            boxhasOnTop = true;
            resetStyleOnClick("day", box);
          }
          box.classList.add("dv-box-dragging")
          createTemporaryBox(box, col, boxhasOnTop, "day")
          sX = 0;
          sY = 0;
        }
      }

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
    }

    const mouseup = () => {
      const tempbox = document?.querySelector(".dv-temporary-box")
      // if box did not move, no render needed
      // click event to open form
      if (tempbox === null) {
        const setResetDv = () => {
          setStylingForEvent("dragend", dvGrid, store)
          box.classList.remove("dv-box-clicked")
        }
        box.classList.add("dv-box-clicked")
        const id = box.getAttribute("data-dv-box-id");
        const entry = store.getEntry(id);
        const start = entry.start;
        const color = box.style.backgroundColor;
        const rect = box.getBoundingClientRect()

        let [x, y] = placePopup(
          400,
          165,
          [parseInt(rect.left) + 32, parseInt(rect.top) + 32],
          [window.innerWidth, window.innerHeight],
          false,
        );
        store.setFormResetHandle("day", setResetDv)
        const setup = new FormSetup();
        setup.setSubmission("edit", id, entry.title, entry.description);
        setup.setCategory(entry.category, color, color);
        setup.setPosition(x, [x, y], y);
        setup.setDates(getFormDateObject(start, entry.end));
        fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

        const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());
        getEntryOptionModal(context, store, entry, datepickerContext, finishSetup);

        const modal = document.querySelector(".entry__options")
        if (window.innerWidth > 580) {
          modal.style.top = +y + "px";
          modal.style.left = x + "px";
        } else {
          modal.style.top = "64px";
        }
        // ******************
      } else {
        tempbox.remove()
        box.classList.remove("dv-box-dragging")
        if (boxhasOnTop) { box.classList.add("dv-box-ontop") }

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
        setStylingForEvent("dragend", dvGrid, store)
      }

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
      coords,
      parseInt(box.style.top)
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
    document.body.style.cursor = "move";
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
      if (newHeight <= 12.5) { newHeight = 12.5; }
      if ((newHeight + y) > 1188) { newHeight = 1187.5 - y; }

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
        [e.clientX, e.clientY],
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
    store.setResetPreviousViewCallback(resetDayview);
    dvGrid.onmousedown = delegateDayView;
    const elementCount = dvMainGrid.childElementCount;
    if (elementCount > 0) {
      setTimeout(() => {
        let fc;
        let checkForBOT = document?.querySelector(".dv-box-one")
        if (checkForBOT !== null) {
          fc = checkForBOT
        } else {
          fc = dvMainGrid.children[0];
        }

        dvGrid.scrollTo({
          top: parseInt(fc.style.top),
          behavior: "instant",
        })
      }, 4)
    } else {
      setTimeout(() => {
        let tempdate = new Date()
        let temphour = tempdate.getHours() * 50
        dvGrid.scrollTo({
          top: temphour - 50 > 0 ? temphour - 50 : 0,
          behavior: "auto",
        })
      }, 4)
    }
  }
  initDayView();
}