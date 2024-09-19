import { Day } from '../../factory/entries';
import locales from '../../locales/en';
import {
  formatEntryOptionsDate,
  formatStartEndTime,
  getFormDateObject,
  getTempDates,
} from '../../utilities/dateutils';
import handleOverlap, {
  calcNewHourFromCoords,
  calcNewMinuteFromCoords,
  createBox,
  createTempBoxHeader,
  createTemporaryBox,
  getBoxDefaultStyle,
  getOriginalBoxObject,
  resetOriginalBox,
  resetStyleOnClick,
  setBoxTimeAttributes,
  setStylingForEvent,
  startEndDefault,
  updateBoxCoordinates,
} from '../../utilities/dragutils';
import { getClosest, placePopup } from '../../utilities/helpers';
import { createCloseIcon } from '../../utilities/svgs';
import calcTime, { formatTime } from '../../utilities/timeutils';
import fullFormConfig from '../forms/formUtils';
import FormSetup from '../forms/setForm';
import getEntryOptionModal from '../menus/entryOptions';
// day view header (row 1)
const dvHeaderDayNumber = document.querySelector('.dayview--header-day__title');
const dvHeaderDayOfWeek = document.querySelector(
  '.dayview--header-day__number',
);
const dvHeaderInfo = document.querySelector('.dayview--header-day__info');

// day view on top container (row 2)
const dvOnTop = document.querySelector('.dayview--ontop-container');

// main grid wrapper (row 3) (scroll wrapper) (offsettop)
const dvContainer = document.querySelector('.calendar__dayview');
const dvGrid = document.querySelector('.dayview__grid');
const dvMainGrid = document.querySelector('.dayview--main-grid');

export default function setDayView(context, store, datepickerContext) {
  const currDate = context.getDate();
  let entries = null;
  let boxes = null;
  let firstY = null;

  function firstLastDates(bxs) {
    let longest = 0;
    let shortest = 100;
    for (let i = 0; i < bxs.length; i++) {
      const [tempshort, templong] = [bxs[i].coordinates.y, bxs[i].coordinates.e];
      if (templong > longest) longest = templong;
      if (tempshort < shortest) shortest = tempshort;
    }

    const [h1, h2] = [Math.floor(shortest / 4), Math.floor(longest / 4)];
    const [m1, m2] = [(shortest % 4) * 15, (longest % 4) * 15];
    const [tempdate1, tempdate2] = [
      new Date(bxs[0].start),
      new Date(bxs[0].start),
    ];
    tempdate1.setHours(h1);
    tempdate1.setMinutes(m1);
    tempdate2.setHours(h2);
    tempdate2.setMinutes(m2);
    return formatStartEndTime(tempdate1, tempdate2);
  }

  function getDayviewHeaderEntryCount() {
    const allboxes = boxes.getAllBoxes();
    if (allboxes.length === 0) {
      return 'no entries';
    }
    let [endingToday, startingToday] = [0, 0];
    let tempEndCase1;
    const currentDay = currDate.getDate();

    for (let i = 0; i < allboxes.length; i++) {
      const [start, end] = [
        new Date(allboxes[i].start),
        new Date(allboxes[i].end),
      ];

      if (start.getDate() === currentDay) {
        startingToday++;
      }

      if (end.getDate() === currentDay) {
        endingToday++;
        tempEndCase1 = allboxes[i];
      }
    }

    if (startingToday === 1 && endingToday === 1) {
      return `1 entry ( ${formatStartEndTime(
        new Date(allboxes[0].start),
        new Date(allboxes[0].end),
      )} )`;
    }

    if (startingToday > 1 && startingToday === endingToday) {
      return `${startingToday} entries starting & ending today ( ${firstLastDates(
        boxes.boxes,
      )} )`;
    }

    let fulltitle = '';
    if (startingToday > 0) {
      if (startingToday === 1) {
        fulltitle += `${startingToday} entry starting today`;
      } else {
        fulltitle += `${startingToday} entries started`;
      }
    } else {
      fulltitle += 'no entries started';
    }

    if (endingToday > 0) {
      if (endingToday === 1) {
        fulltitle += ` – ${endingToday} ending ( ${formatStartEndTime(
          new Date(tempEndCase1.start),
          new Date(tempEndCase1.end),
        )} )`;
      } else {
        fulltitle += ` – ${endingToday} ending ( ${firstLastDates(
          boxes.boxes,
        )} )`;
      }
    } else {
      fulltitle += ' – no entries ending today';
    }
    return fulltitle;
  }

  function configHeader() {
    for (const el of [dvHeaderDayNumber, dvHeaderDayOfWeek, dvHeaderInfo]) {
      el.innerText = '';
    }

    let gmtOffset = new Date().getTimezoneOffset() / 60;
    if (gmtOffset < 0) {
      gmtOffset = `+${Math.abs(gmtOffset)}`;
    }

    document.querySelector('.dv-gmt').textContent = `UTC ${context.getGmt()}`;
    const day = context.getDay();
    dvHeaderDayOfWeek.textContent = day;

    if (context.isToday()) {
      dvHeaderDayOfWeek.classList.add('dayview--header-day__number--today');
      dvHeaderDayNumber.style.color = 'var(--primary1)';
    } else {
      dvHeaderDayOfWeek.classList.remove('dayview--header-day__number--today');
      dvHeaderDayNumber.removeAttribute('style');
    }
    dvHeaderDayNumber.textContent = locales.labels.weekdaysShort[context.getWeekday()].toUpperCase();
    dvHeaderInfo.textContent = getDayviewHeaderEntryCount();
  }

  function resetDayview() {
    dvMainGrid.innerText = '';
    dvOnTop.innerText = '';
    dvHeaderInfo.innerText = '';
    dvContainer.onmousedown = null;
    entries = null;
    boxes = null;
    firstY = null;
  }

  function openDvMore(entr) {
    store.addActiveOverlay('morepopup');
    const morepopupoverlay = document.createElement('aside');
    morepopupoverlay.classList.add('dv--morepopup__overlay');

    const morepopup = document.createElement('aside');
    morepopup.classList.add('dv--morepopup');
    morepopup.style.left = `${dvOnTop.offsetLeft}px`;
    morepopup.style.top = `${dvOnTop.offsetTop}px`;

    const morepopupHeader = document.createElement('div');
    morepopupHeader.classList.add('dv--morepopup__header');
    const morepopupTitle = document.createElement('span');
    morepopupTitle.classList.add('dv--morepopup__title');
    morepopupTitle.textContent = 'Events spanning multiple days';
    const morepopupClose = document.createElement('span');
    morepopupClose.classList.add('dv--morepopup__close');
    morepopupClose.append(createCloseIcon('var(--white3)'));
    morepopupHeader.append(morepopupTitle, morepopupClose);
    const morepopupBody = document.createElement('div');
    morepopupBody.classList.add('dv--morepopup__body');

    const createMorePopupEntry = (entry) => {
      const morepopupEntry = document.createElement('div');
      morepopupEntry.classList.add('dv--morepopup__entry');
      morepopupEntry.style.backgroundColor = `${store.getCtgColor(
        entry.category,
      )}`;
      morepopupEntry.setAttribute('data-sdvt-id', entry.id);
      const morepopupEntryTitle = document.createElement('span');
      morepopupEntryTitle.classList.add('dv--morepopup__entry-title');
      morepopupEntryTitle.textContent = entry.title;
      const morepopupCategory = document.createElement('span');
      morepopupCategory.classList.add('dv--morepopup__entry-category');
      morepopupCategory.textContent = entry.category;
      const morepopupEntryTime = document.createElement('span');
      morepopupEntryTime.classList.add('dv--morepopup__entry-time');
      morepopupEntryTime.textContent = formatEntryOptionsDate(
        new Date(entry.start),
        new Date(entry.end),
      ).date;
      morepopupEntry.append(
        morepopupEntryTitle,
        morepopupCategory,
        morepopupEntryTime,
      );
      return morepopupEntry;
    };

    for (const entry of entr) {
      const morepopupEntry = createMorePopupEntry(entry);
      morepopupBody.append(morepopupEntry);
    }

    const closemp = () => {
      morepopupoverlay.remove();
      morepopup.remove();
      store.removeActiveOverlay('morepopup');
      document.removeEventListener('keydown', closeMpOnEsc);
      morepopupoverlay.onclick = null;
      morepopupClose.onclick = null;
      morepopupBody.onclick = null;
    };

    const closeMpOnEsc = (e) => {
      if (e.key === 'Escape') {
        closemp();
        return;
      }
    };

    function getEntrItem(e) {
      if (getClosest(e, '.dv--morepopup__entry')) {
        openStackEntryOnTop(e, closemp);
        return;
      }
    }

    morepopup.append(morepopupHeader, morepopupBody);
    document.body.prepend(morepopupoverlay, morepopup);
    morepopupoverlay.onclick = closemp;
    morepopupClose.onclick = closemp;
    morepopupBody.onclick = getEntrItem;
    document.addEventListener('keydown', closeMpOnEsc);
  }

  function openStackEntryOnTop(e, closearg) {
    const target = e.target;
    const id = target.getAttribute('data-sdvt-id');
    const setResetDv = () => {
      console.log('reset');
    };

    const entry = store.getEntry(id);
    const start = entry.start;
    const color = store.getCtgColor(entry.category);
    const rect = target.getBoundingClientRect();

    const [x, y] = placePopup(
      400,
      165,
      [Number.parseInt(rect.left), Number.parseInt(rect.top) + 24],
      [window.innerWidth, window.innerHeight],
      false,
    );

    store.setFormResetHandle(
      'day',
      closearg || setResetDv,
    );

    const setup = new FormSetup();
    setup.setSubmission('edit', id, entry.title, entry.description);
    setup.setCategory(entry.category, color);
    setup.setDates(getFormDateObject(start, entry.end));
    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

    const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());
    getEntryOptionModal(context, store, entry, datepickerContext, finishSetup);

    const modal = document.querySelector('.entry__options');
    modal.style.top = +y + 'px';
    modal.style.left = +x + 'px';
  }

  function createStackableEntriesOnTop(entr) {
    const dvOnTopGrid = document.createElement('div');
    dvOnTopGrid.classList.add('dayview--ontop__grid');
    for (const ent of entr) {
      const dvOnTopEntry = document.createElement('div');
      dvOnTopEntry.classList.add('dayview--ontop__grid-item');
      dvOnTopEntry.textContent = ent.title;
      dvOnTopEntry.style.backgroundColor = store.getCtgColor(ent.category);
      dvOnTopEntry.setAttribute('data-sdvt-id', ent.id);
      dvOnTopGrid.append(dvOnTopEntry);
    }
    dvOnTop.append(dvOnTopGrid);
  }

  function createDvTop(entr) {
    const dvtopgrid = document.createElement('div');
    dvtopgrid.classList.add('dv--ontop__grid');

    if (entr.length > 6) {
      const moremessage = document.createElement('div');
      moremessage.classList.add('dv--ontop__more');
      moremessage.textContent = `${entr.length} more...`;
      dvOnTop.append(moremessage);
      return;
    } else {
      createStackableEntriesOnTop(entr);
    }
  }

  function renderBoxes() {
    dvMainGrid.innerText = '';
    dvOnTop.innerText = '';
    createDvTop(boxes.getBoxesTop());
    for (const entry of boxes.getBoxes()) {
      const y = entry.coordinates.y;
      if (firstY === null || y < firstY) {
        firstY = y;
      }
      createBox(
        dvMainGrid, // column
        entry, // entry object
        'day', // current view
        store.getCtgColor(entry.category), // background color
      );
    }
  }

  /** RESIZE NORTH/SOUTH */
  function resizeBoxNSDay(e, box) {
    setStylingForEvent('dragstart', dvGrid, store);
    document.body.style.cursor = 'move';
    const col = box.parentElement;

    let boxhasOnTop = false;
    const boxorig = getOriginalBoxObject(box);
    if (box.classList.contains('dv-box-ontop')) {
      boxhasOnTop = true;
      resetStyleOnClick('day', box);
    }

    box.classList.add('dv-box-resizing');
    const boxTop = box.offsetTop;
    const headerOffset = Number.parseInt(dvGrid.offsetTop);
    createTemporaryBox(box, col, boxhasOnTop, 'day');

    const amountScrolled = Number.parseInt(dvGrid.scrollTop);
    const mousemove = (e) => {
      const newHeight = Math.round((e.pageY + amountScrolled - boxTop - headerOffset) / 12.5)
        * 12.5;

      if (newHeight <= 12.5) {
        box.style.height = '12.5px';
        return;
      } else if (newHeight + boxTop > 1188) {
        return;
      } else {
        box.style.height = `${newHeight}px`;
      }
    };

    function mouseup() {
      document.querySelector('.dv-temporary-box').remove();
      box.classList.remove('dv-box-resizing');
      if (boxhasOnTop) {
        box.classList.add('dv-box-ontop');
      }

      if (boxorig.height === box.offsetHeight) {
        resetOriginalBox(box, boxorig);
      } else {
        setBoxTimeAttributes(box, 'day');
        const start = +box.getAttribute('data-dv-start-time');
        const length = +box.getAttribute('data-dv-time-intervals');
        const time = calcTime(start, length);
        box.setAttribute('data-dv-time', time);
        box.firstChild.nextSibling.firstElementChild.textContent = time;

        updateBoxCoordinates(box, 'day', boxes);
        boxes.updateStore(store, box.getAttribute('data-dv-box-id'));
        // check if new position overlaps with other boxes and handle
        if (boxes.getBoxes().length > 1) {
          handleOverlap(null, 'day', boxes);
        } else {
          box.setAttribute('data-dv-box-index', 'box-one');
        }
      }

      configHeader();
      setStylingForEvent('dragend', dvGrid, store);
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    }
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  /** DRAG NORTH/ SOUTH, EAST/ WEST */
  function dragEngineDay(e, box) {
    setStylingForEvent('dragstart', dvGrid, store);
    const col = box.parentElement;
    let boxhasOnTop = false;

    const startTop = +box.style.top.split('px')[0];
    const boxHeight = +box.style.height.split('px')[0];
    const startCursorY = e.pageY - Number.parseInt(dvGrid.offsetTop);
    const headerOffset = +dvGrid.getBoundingClientRect().top.toFixed(2);
    const [tempX, tempY] = [e.pageX, e.pageY];
    let [sX, sY] = [0, 0];
    let hasStyles = false;

    /** DRAG NORTH SOUTH */
    const mousemove = (e) => {
      sX = Math.abs(e.clientX - tempX);
      sY = Math.abs(e.clientY - tempY);
      if (!hasStyles) {
        if (sX > 3 || sY > 3) {
          hasStyles = true;
          document.body.style.cursor = 'move';
          if (box.classList.contains('dv-box-ontop')) {
            boxhasOnTop = true;
            resetStyleOnClick('day', box);
          }
          box.classList.add('dv-box-dragging');
          createTemporaryBox(box, col, boxhasOnTop, 'day');
          sX = 0;
          sY = 0;
        }
      }

      const currentCursorY = e.pageY - headerOffset;
      const newOffsetY = currentCursorY - startCursorY;
      let newTop = Math.round((newOffsetY + startTop) / 12.5) * 12.5;
      if (newTop < 0 || currentCursorY < 0) {
        newTop = 0;
        return;
      } else if (newTop + boxHeight > 1188) {
        return;
      }
      box.style.top = `${newTop}px`;
    };

    const mouseup = () => {
      const tempbox = document?.querySelector('.dv-temporary-box');
      // if box did not move, no render needed
      // click event to open form
      if (tempbox === null) {
        const setResetDv = () => {
          setStylingForEvent('dragend', dvGrid, store);
          box.classList.remove('dv-box-clicked');
        };

        box.classList.add('dv-box-clicked');
        const id = box.getAttribute('data-dv-box-id');
        const entry = store.getEntry(id);
        const start = entry.start;
        const color = box.style.backgroundColor;
        const rect = box.getBoundingClientRect();

        const [x, y] = placePopup(
          400,
          165,
          [Number.parseInt(rect.left) + 32, Number.parseInt(rect.top) + 32],
          [window.innerWidth, window.innerHeight],
          false,
        );
        store.setFormResetHandle('day', setResetDv);
        const setup = new FormSetup();
        setup.setSubmission('edit', id, entry.title, entry.description);
        setup.setCategory(entry.category, color);
        setup.setDates(getFormDateObject(start, entry.end));
        fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

        const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());
        getEntryOptionModal(
          context,
          store,
          entry,
          datepickerContext,
          finishSetup,
        );

        const modal = document.querySelector('.entry__options');
        if (window.innerWidth > 580) {
          modal.style.top = +y + 'px';
          modal.style.left = x + 'px';
        } else {
          modal.style.top = '64px';
        }
        // ******************
      } else {
        tempbox.remove();
        box.classList.remove('dv-box-dragging');
        if (boxhasOnTop) {
          box.classList.add('dv-box-ontop');
        }

        setBoxTimeAttributes(box, 'day');
        const start = +box.getAttribute('data-dv-start-time');
        const length = +box.getAttribute('data-dv-time-intervals');
        const time = calcTime(start, length);
        box.setAttribute('data-dv-time', time);

        box.children[1].children[0].textContent = time;
        updateBoxCoordinates(box, 'day', boxes);
        boxes.updateStore(store, box.getAttribute('data-dv-box-id'));
        // check if new position overlaps with other boxes and handle
        if (boxes.getBoxes().length > 1) {
          handleOverlap(null, 'day', boxes);
        } else {
          box.setAttribute('data-dv-box-index', 'box-one');
        }

        configHeader();
        setStylingForEvent('dragend', dvGrid, store);
      }

      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    };
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  function handleDayviewClose() {
    document.querySelector('.dayview-temp-box')?.remove();
  }

  function openDayviewForm(box, category, dates, type) {
    store.setFormResetHandle('day', handleDayviewClose);

    const openForm = store.getRenderFormCallback();
    const setup = new FormSetup();

    const [submitType, id, title, description] = type;
    setup.setSubmission(submitType, id, title, description);
    if (submitType === 'create') {
      box.style.opacity = 0.9;
    }

    const [categoryName, color] = category;
    setup.setCategory(categoryName, color);

    const [start, end] = dates;
    setup.setDates(getFormDateObject(start, end));

    openForm();
    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

    fullFormConfig.getConfig(setup.getSetup());
  }

  /** CREATE BOX ON DRAG */
  function createBoxOnDragDay(e) {
    setStylingForEvent('dragstart', dvGrid, store);
    document.body.style.cursor = 'move';
    const [tempcategory, color] = store.getFirstActiveCategoryKeyPair();

    const box = document.createElement('div');
    box.setAttribute('class', 'dv-box dv-box-dragging dayview-temp-box');

    // boxheader is static - create from template
    const boxheader = createTempBoxHeader('day');
    const boxcontent = document.createElement('div');
    const boxtime = document.createElement('span');
    const boxtimeend = document.createElement('span');
    boxcontent.classList.add('dv-box__content');
    boxtime.classList.add('dv-box-time');
    boxtimeend.classList.add('dv-box-time');

    const headerOffset = Number.parseInt(dvGrid.offsetTop);
    const scrolled = Number.parseInt(dvGrid.scrollTop);
    const startCursorY = e.pageY - headerOffset;

    const y = Math.round((startCursorY + Math.abs(scrolled)) / 12.5) * 12.5;
    box.setAttribute('style', getBoxDefaultStyle(y, color));

    const coords = { y: +y / 12.5, x: 1, h: 1, e: 2 };
    let [starthour, startmin, endhour, endmin] = startEndDefault(y);
    let movedY = 0;

    function mousemove(e) {
      movedY += e.movementY;
      let newHeight = Math.round((e.pageY + scrolled - y - headerOffset) / 12.5) * 12.5;
      if (newHeight <= 12.5) {
        newHeight = 12.5;
      }
      if (newHeight + y > 1188) {
        newHeight = 1187.5 - y;
      }

      box.style.height = `${newHeight}px`;
      coords.h = +newHeight / 12.5;
      coords.e = +coords.y + coords.h;

      endhour = calcNewHourFromCoords(newHeight, y);
      endmin = calcNewMinuteFromCoords(newHeight, y);

      boxtime.style.wordBreak = 'break-word';
      boxtime.textContent = `${formatTime(starthour, startmin)} – `;
      boxtimeend.textContent = `${formatTime(endhour, endmin)}`;
    }

    // append content to temporary box
    boxcontent.append(boxtime, boxtimeend);
    box.append(boxheader, boxcontent);
    e.target.append(box);

    function mouseup() {
      if (movedY <= 20) {
        if (+coords.y >= 92) {
          coords.y = 92;
          coords.e = 95;
          coords.h = 3;
          box.style.height = '37.5px';
          box.style.top = '1150px';
          [starthour, startmin] = [23, 0];
          [endhour, endmin] = [23, 45];
          boxtime.textContent = `${formatTime(starthour, startmin)} – `;
          boxtimeend.textContent = `${formatTime(endhour, endmin)}`;
        } else {
          coords.y = starthour * 4;
          coords.e = +coords.y + 4;
          coords.h = 4;
          box.style.height = '50px';
          box.style.top = `${+coords.y * 12.5}px`;
          startmin = 0;
          [endhour, endmin] = [starthour + 1, 0];
          boxtime.textContent = `${formatTime(starthour, startmin)} – `;
          boxtimeend.textContent = `${formatTime(endhour, endmin)}`;
        }
      }

      const datesData = getTempDates(
        currDate,
        [starthour, endhour],
        [startmin, endmin],
      );

      openDayviewForm(
        box,
        [tempcategory, color],
        datesData,
        ['create', null, null, null],
      );

      setStylingForEvent('dragend', dvGrid, store);
      document.removeEventListener('mouseup', mouseup);
      document.removeEventListener('mousemove', mousemove);
    }
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  function renderBoxesForGrid() {
    renderBoxes();
    handleOverlap(null, 'day', boxes);
  }

  function delegateDayView(e) {
    const dvhresizehandle = getClosest(e, '.dv-box-resize-s');
    const dvhbox = getClosest(e, '.dv-box');
    const dvhgrid = getClosest(e, '.dayview--main-grid');
    const dvhboxTop = getClosest(e, '.dayview--ontop__grid-item');
    const dvhGrouped = getClosest(e, '.dv--ontop__more');

    // resize existing event
    if (dvhresizehandle) {
      resizeBoxNSDay(e, e.target.parentElement);
      return;
    }

    // drag existing event
    if (dvhbox) {
      dragEngineDay(e, e.target);
      return;
    }

    // drag empty space to create new event
    if (dvhgrid) {
      createBoxOnDragDay(e, e.target);
      return;
    }

    // opens stacked all day events (less than 6)
    if (dvhboxTop) {
      openStackEntryOnTop(e);
      return;
    }

    // opens grouped all day events (more than 6)
    if (dvhGrouped) {
      openDvMore(boxes.getBoxesTop());
      return;
    }
  }

  function handleScrollToOnInit() {
    if (firstY !== null) {
      const settop = +firstY * 12.5;
      setTimeout(() => {
        dvGrid.scrollTo({
          top: settop,
          behavior: 'instant',
        });
      }, 4);
    } else {
      const hour = new Date().getHours() * 50;
      setTimeout(() => {
        dvGrid.scrollTo({
          top: hour - 25 <= 0 ? 0 : hour - 25,
          behavior: 'smooth',
        });
      }, 4);
    }
  }

  const initDayView = () => {
    entries = store.getDayEntries(currDate);
    boxes = new Day(entries.day, entries.allDay);
    renderBoxesForGrid();
    configHeader();
    dvContainer.onmousedown = delegateDayView;
    store.setResetPreviousViewCallback(resetDayview);
    handleScrollToOnInit();
  };

  initDayView();
}
