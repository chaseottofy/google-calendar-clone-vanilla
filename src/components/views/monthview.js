// rendering
import setViews from '../../config/setViews';
// Box query
import MonthBoxQuery from '../../factory/queries';
// naming
import locales from '../../locales/en';
// date utilities
import {
  compareDates,
  createDateFromFormattedString,
  generateTempStartEnd,
  getDateFormatted,
  getDateFromAttribute,
  getDurationSeconds,
  getFormDateObject,
} from '../../utilities/dateutils';
// drag&drop / resize utilities
import { setStylingForEvent } from '../../utilities/dragutils';
// general utilities
import {
  getClosest,
  hextorgba,
  placePopup,
} from '../../utilities/helpers';
import { createCloseIcon } from '../../utilities/svgs';
import fullFormConfig from '../forms/formUtils';
import FormSetup from '../forms/setForm';
import getEntryOptionModal from '../menus/entryOptions';
import setSidebarDatepicker from '../menus/sidebarDatepicker';

const resizeoverlay = document.querySelector('.resize-overlay');
const sidebar = document.querySelector('.sidebar');
const monthWrapper = document.querySelector('.monthview--calendar');

export default function setMonthView(context, store, datepickerContext) {

  const boxquery = new MonthBoxQuery(
    window.innerWidth <= 530 || window.innerHeight <= 470,
  );

  // const contextMonth = context.getMonth();
  // const contextDateSelected = context.getDateSelected();

  function renderSidebarDatepickerMonth() {
    if (!sidebar.classList.contains('hide-sidebar')) {
      datepickerContext.resetDate();
      context.setDateSelected(context.getDay());
      setSidebarDatepicker(context, store, datepickerContext);
    }
  }

  function handleOverlay(type) {
    if (type === 'hide') {
      resizeoverlay.classList.add('hide-resize-overlay');
      store.removeActiveOverlay('hide-resize-overlay');
    } else {
      resizeoverlay.classList.remove('hide-resize-overlay');
      store.addActiveOverlay('hide-resize-overlay');
    }
  }

  function setDayViewViaMonth() {
    context.setComponent('day');
    setViews('day', context, store, datepickerContext);
    renderSidebarDatepickerMonth();
  }

  function renderDayViewViaModal(parentDate) {
    handleOverlay('hide');
    context.setDate(
      parentDate.getFullYear(),
      parentDate.getMonth(),
      parentDate.getDate(),
    );
    setDayViewViaMonth();
  }

  function createBox(id, category, top, title) {
    const box = document.createElement('div');
    box.classList.add('monthview--box');
    box.setAttribute('data-monthview-id', id);
    box.style.backgroundColor = store.getCtgColor(category);
    box.style.top = `${top}px`;
    box.style.height = `${boxquery.getHeight()}px`;
    box.style.width = '100%';

    const boxtitle = document.createElement('div');
    boxtitle.classList.add('monthview--title');
    boxtitle.textContent = title;
    box.append(boxtitle);
    return box;
  }

  function createGroupedCell(cellDate, count) {
    const groupedBxs = document.createElement('div');
    groupedBxs.classList.add('monthview--daygroup');
    groupedBxs.setAttribute('data-mvgrouped-date', cellDate);
    groupedBxs.setAttribute('data-mvgrouped-length', count);
    const groupedDiv = document.createElement('div');
    groupedDiv.classList.add('monthview--grouped');
    const groupedTitle = document.createElement('div');
    groupedTitle.classList.add('monthview--daycontent__grouped-title');

    groupedTitle.textContent = `${count} more...`;

    groupedDiv.append(groupedTitle);
    groupedBxs.append(groupedDiv);
    return groupedBxs;
  }

  function createCellHeader(cell, day) {
    const { labels } = locales;
    const daynumberAndMonth = `${day.getDate()} ${labels.monthsShort[day.getMonth()]}`;
    const daynumber = document.createElement('span');
    daynumber.classList.add('monthview--daynumber');
    /**
     * case 1: cell does not represent current month
     * case 2: cell represents first day of current month
     * case 3: cell represents today
     * case 4: cell represents days within current month
    * */
    if (day.getMonth() !== context.getMonth()) {
      daynumber.textContent = daynumberAndMonth;
      daynumber.classList.add('monthview--daynumber-prevnext');
    } else if (day.getDate() === 1) {
      daynumber.textContent = daynumberAndMonth;
    } else if (compareDates(day, new Date())) {
      daynumber.textContent = day.getDate();
      daynumber.classList.add('monthview--daynumber-today');
      cell.classList.add('monthview--today');
    } else {
      daynumber.textContent = day.getDate();
    }
    return daynumber;
  }

  function createCell(day, idx, entry, cellDate) {
    const cellCoordinates = [
      +day.getDay(), // (x): day of week
      Math.floor((idx) / 7), // (y): week of month
    ];

    const cell = document.createElement('div');
    cell.classList.add('monthview--day');
    cell.setAttribute('data-mv-date', cellDate);
    cell.setAttribute('data-mv-idx', idx);
    cell.setAttribute('data-mv-coordinates', cellCoordinates);

    const dayofmonth = document.createElement('button');
    dayofmonth.classList.add('monthview--dayofmonth');
    const cellContent = document.createElement('div');
    cellContent.classList.add('monthview--daycontent');

    if (
      day.getMonth() === context.getMonth()
      && day.getDate() === context.getDateSelected()
    ) {
      dayofmonth.classList.add('monthview--dayofmonth-selected');
    }
    dayofmonth.append(createCellHeader(cell, day));

    let toptotal = 0; // box.style.top = (box index) * boxquery.getTop()

    if (entry !== undefined && entry.length > 0) {

      // handle instances where entries have same day but different month
      entry = entry.filter((el) => new Date(el.start).getMonth() === day.getMonth());

      if (entry.length >= 6) {
        // automatically group if there are more than 6 entries on a day
        cellContent.append(createGroupedCell(cellDate, entry.length));
        cellContent.classList.add('monthview--daycontent-grouped');

      } else {

        // not grouped (less than 6 entries)
        for (const [nidx, el] of entry.entries()) {
          if (compareDates(new Date(el.start), day)) {
            if (nidx > 0) {
              toptotal += boxquery.getTop();
            }
            cellContent.append(createBox(
              el.id, // entry id
              el.category, // backgroundColor
              toptotal, // style.top
              el.title, // entry title
            ));
          }
        }
      }
    }

    cell.append(dayofmonth, cellContent);
    monthWrapper.append(cell);
  }

  function resetMonthview() {
    monthWrapper.innerText = '';
    monthWrapper.onmousedown = null;
    monthWrapper.onclick = null;
  }

  function populateCells() {
    monthWrapper.innerText = '';
    let montharray = context.getMonthArray();
    let monthentries = store.getMonthEntries(montharray);
    let groupedEntries = store.getGroupedMonthEntries(monthentries);

    if (montharray.length < 42) {
      monthWrapper.classList.add('five-weeks');
    } else {
      monthWrapper.classList.remove('five-weeks');
    }

    const dayHasEntry = (day) => {
      const dayEntries = groupedEntries[day.getDate()];
      return dayEntries !== undefined ? dayEntries : [];
    };

    for (const [idx, day] of montharray.entries()) {
      createCell(day, idx, dayHasEntry(day), getDateFormatted(day));
    }

    montharray = null;
    monthentries = null;
    groupedEntries = null;
  }

  function getCoordinatesFromCell(cell) {
    return cell.getAttribute('data-mv-coordinates').split(',').map((x) => {
      return Number.parseInt(x);
    });
  }

  function configureForStorage(newCell, clone) {
    const [year, month, day] = getDateFromAttribute(newCell, 'data-mv-date', 'month');
    const id = clone.getAttribute('data-monthview-id');
    const tempEntry = store.getEntry(id);

    const [start, end] = [new Date(tempEntry.start), new Date(tempEntry.end)];
    const tempdate = new Date(year, month, day);
    const diff = getDurationSeconds(start, tempdate);
    const endDay = end.getDate() + Math.floor(diff / 86_400) + 1;

    store.updateEntry(id, {
      start: new Date(year, month, day, start.getHours(), start.getMinutes()),
      end: new Date(end.getFullYear(), end.getMonth(), endDay, end.getHours(), end.getMinutes()),
    });
  }

  function createTemporaryBox(box) {
    const clone = box.cloneNode(true);
    monthWrapper.prepend(clone);
    clone.classList.add('box-mv-dragactive');
    clone.focus();
  }

  function configGroupedCellOnDrop(groupedCell) {
    const count = groupedCell.getAttribute('data-mvgrouped-length');
    groupedCell.setAttribute('data-mvgrouped-length', +count + 1);
    groupedCell.firstChild.firstChild.textContent = `${groupedCell.getAttribute('data-mvgrouped-length')} more...`;
  }

  function configClonedBoxForDrop(clone) {
    clone.classList.remove('box-mv-dragactive');
    clone.style.top = '0px';
    clone.style.left = '0px';
    clone.style.width = '100%';
    clone.style.height = `${boxquery.getHeight()}px`;
  }

  function resetCellOnDrop(bxs, transition) {
    if (bxs.length === 0 || bxs === undefined) return;
    for (let i = 0; i < bxs.length; i++) {

      if (bxs[i] !== undefined && bxs[i] !== null && !bxs[i].classList.contains('monthview--box__form-temp')) {
        bxs[i].style.top = `${i * boxquery.getTop()}px`;

        if (transition) {
          bxs[i].classList.add('monthview--box__drop');
          setTimeout(() => {
            bxs[i].classList.remove('monthview--box__drop');
          }, 200);

        } else {
          bxs[i].setAttribute('class', 'monthview--box');
        }
      }
    }
  }

  function createGroupedCellOnDrop(cell, content, boxes, clone) {
    const newGroupedCell = document.createElement('div');
    newGroupedCell.classList.add('monthview--daygroup');
    newGroupedCell.setAttribute('data-mvgrouped-date', cell.getAttribute('data-mv-date'));
    newGroupedCell.setAttribute('data-mvgrouped-length', boxes.length);

    const groupedDiv = document.createElement('div');
    groupedDiv.classList.add('monthview--grouped');
    const groupedTitle = document.createElement('div');
    groupedTitle.classList.add('monthview--daycontent__grouped-title');
    groupedTitle.textContent = `${boxes.length} more...`;

    // reset cell content to empty then append grouped cell
    content.innerText = '';
    newGroupedCell.append(groupedDiv);
    groupedDiv.append(groupedTitle);
    content.append(newGroupedCell);
    content.classList.add('monthview--daycontent-grouped');
    clone.remove();
  }

  // the month view drag and drop system differs from the week & day views
  // see readme for more info (section : drag engine)
  function dragEngineMonth(e, box) {
    setStylingForEvent('dragstart', monthWrapper, store);
    const startDragTime = Date.now();
    const parent = box.parentElement;
    const cell = parent.parentElement;
    cell.classList.add('current-drop-zone');
    const targetModal = document?.querySelector('.more-modal');

    const originalCellLength = parent.childElementCount;
    const [cellX, cellY] = getCoordinatesFromCell(cell);

    // create cloned box with class box-mv-dragactive
    createTemporaryBox(box);
    const clone = document?.querySelector('.box-mv-dragactive');
    clone.setAttribute('data-box-mvx', cellX);
    clone.setAttribute('data-box-mvy', cellY);

    const cellRect = cell.getBoundingClientRect();
    const cellWidth = Number.parseFloat(cellRect.width.toFixed(2));
    const cellHeight = Number.parseFloat(cellRect.height.toFixed(2));
    const wrapperLeft = Number.parseInt(monthWrapper.offsetLeft);
    const boxRect = box.getBoundingClientRect();
    const boxWidth = Number.parseFloat(boxRect.width);
    const boxHeight = boxquery.getHeight();

    clone.style.top = `${parent.offsetTop}px`;
    clone.style.width = `${boxWidth}px`;
    clone.style.height = `${boxHeight}px`;
    clone.style.left = `${parent.offsetLeft}px`;
    clone.classList.add('hide-mv-clone');

    const hasFiveWeeks = monthWrapper.classList.contains('five-weeks');
    const [startcursorx, startcursory] = [e.clientX, e.clientY];
    let [movedX, movedY] = [0, 0];
    let [lastX, lastY] = [cellX, cellY];
    let gaveStyles = false;
    let changeCursor = false;

    const mousemove = (e) => {
      movedX = Math.abs(e.clientX - startcursorx);
      movedY = Math.abs(e.clientY - startcursory);
      // Do not apply styles until user has moved the box at least 5px from starting position.
      if (movedX > 1 || movedY > 1) {
        if (!changeCursor) {
          if (targetModal) {
            targetModal.remove();
          }
          document.body.style.cursor = 'move';
          changeCursor = true;
        }
      }
      if (movedX > 3 || movedY > 3) {
        if (!gaveStyles) {
          box.style.opacity = '0.5';
          clone.classList.remove('hide-mv-clone');
        }
        gaveStyles = true;
      }

      // *********************
      // DRAG EAST / WEST
      let newX = Math.floor((e.clientX - monthWrapper.offsetLeft) / cellWidth);
      // min : first column
      if (newX < 0) {
        newX = 0;
        return;
      }
      // max : last column
      if (newX > 6) {
        newX = 6;
        return;
      }

      // update new left position once
      if (lastX !== newX) {
        const multX = (newX * cellWidth) + wrapperLeft;
        clone.style.left = `${Number.parseFloat(multX.toFixed(2))}px`;
        lastX = newX;
      }

      // *********************
      // DRAG NORTH / SOUTH
      let newY = Math.floor((e.clientY - monthWrapper.offsetTop) / cellHeight);
      // min : first row
      if (newY < 0) {
        newY = 0;
        return;
      }
      // max : last row (5 weeks)
      if (hasFiveWeeks && newY > 4) {
        newY = 4;
        return;
      }
      // max : last row (6 weeks)
      if (!hasFiveWeeks && newY > 5) {
        newY = 5;
        return;
      }

      // ensure new top position is only calculated if the cursor has moved
      // vertically across a cell border
      if (lastY !== newY) {
        const multY = (newY * cellHeight) + monthWrapper.offsetTop + 16;
        clone.style.top = `${Number.parseFloat(multY.toFixed(2))}px`;
        lastY = newY;
      }

      // *********************
      // .current-drop-zone
      // Provides a callable reference to the
      // final drop zone initiated on mouseup.
      document.querySelector('.current-drop-zone')?.classList.remove('current-drop-zone');
      document.querySelector(`[data-mv-coordinates="${newX},${newY}"]`).classList.add('current-drop-zone');
    };

    const mouseup = () => {
      const newCell = document?.querySelector('.current-drop-zone');
      const endDragTime = Date.now();
      const timeDiff = endDragTime - startDragTime;
      const [newCellX, newCellY] = getCoordinatesFromCell(newCell);
      newCell.classList.remove('current-drop-zone');
      const newCellContent = newCell.children[1];
      const boxes = newCellContent?.children;
      let boxmoved = false;

      // newcell not found
      // edge case, haven't come across this yet
      if (newCell === undefined || newCell === null) {
        setStylingForEvent('dragend', monthWrapper, store);
        box.style.opacity = '1';
        clone.remove();
        boxmoved = false;
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        return;
      }

      // handle case where box is not moved
      // treat as click event if quick enough
      if (newCellX === cellX && newCellY === cellY) {
        boxmoved = false;
        box.style.opacity = '1';
        clone.remove();
        if (targetModal) {
          targetModal.remove();
        }
        if (timeDiff < 200) {
          openFormOnClickMV(box, newCell);
        }

        // box was moved
      } else {
        // case 1 : cell has 6 or more items (more than 6 items)
        // case 2 : cell is not empty and not group (1-5 items)
        // case 3 : cell becomes group (6 items)
        // case 4 : cell is empty
        // cases 1-4 : run update after to update styling
        // (click)     case 5 : box not moved
        // movedX / movedY : cursor distance, i.e. (dragstart to dragend)
        boxmoved = true;
        if (boxes[0] !== undefined) {

          // grouped cell
          if (boxes[0].classList.contains('monthview--daygroup')) {
            // (case 1)
            configGroupedCellOnDrop(boxes[0]);
            configureForStorage(newCell, clone);
            clone.remove();
            box.remove();

          } else {
            // ***********************
            // setup for cases 2 & 3 (not grouped/not empty)
            configClonedBoxForDrop(clone);
            clone.classList.remove('hide-mv-clone');
            newCellContent.insertBefore(clone, boxes[0]);
            configureForStorage(newCell, clone);
            box.remove();
            // ***********************
            if (boxes.length <= 5) {
              // (case 2)
              resetCellOnDrop(boxes, true);
            } else {
              // (case 3)
              createGroupedCellOnDrop(newCell, newCellContent, boxes, clone);
            }
          }
        } else {
          // (case 4)
          configClonedBoxForDrop(clone);
          box.remove();
          clone.classList.remove('hide-mv-clone');
          newCellContent.append(clone);
          configureForStorage(newCell, clone);
          renderSidebarDatepickerMonth();
        }
      }

      if (boxmoved) {
        // & original cell empty
        if (originalCellLength === 1) {
          renderSidebarDatepickerMonth();
        } else {
          // & original cell not empty --- re calculate styling
          resetCellOnDrop(parent.children, true);
        }
      }
      /** **************** */
      setStylingForEvent('dragend', monthWrapper, store);

      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
      // document.removeEventListener("touchmove", mousemove);
      // document.removeEventListener("touchend", mouseup);
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    // document.addEventListener("touchmove", mousemove);
    // document.addEventListener("touchend", mouseup);
  }

  function getMoreModalEntries(e) {
    const [y, m, d] = getDateFromAttribute(e.target.parentElement.parentElement, 'data-mv-date', 'month');
    return store.getDayEntriesArray(new Date(y, m, d));
  }

  function closeMoreModalOnEscape(e) {
    if (e.key === 'Escape') {
      closeMoreModal();
    }
  }

  function closeMoreModal() {
    const mm = document?.querySelector('.more-modal');
    if (mm) {
      mm.remove();
    }
    handleOverlay('hide');
    document.removeEventListener('keydown', closeMoreModalOnEscape);
  }

  function createMoreModalBox(moreModalEntries) {
    const modalContent = document.createElement('div');
    modalContent.classList.add('more-modal-content');
    for (let i = 0; i < moreModalEntries.length; i++) {
      const entry = moreModalEntries[i];

      const modalEntry = document.createElement('div');
      modalEntry.classList.add('more-modal-entry');
      modalEntry.style.top = `${i * 22}px`;

      modalEntry.style.width = 'calc(100% - 16px)';
      modalEntry.style.height = '20px';
      modalEntry.setAttribute('data-monthview-id', entry.id);
      modalEntry.setAttribute('data-mvhidden-category', entry.category);
      modalEntry.style.backgroundColor = store.getCtgColor(entry.category);

      const modalEntryTitle = document.createElement('div');
      modalEntryTitle.classList.add('more-modal-entry-title');
      modalEntryTitle.textContent = entry.title;

      modalEntry.append(modalEntryTitle);
      modalContent.append(modalEntry);
    }
    return modalContent;
  }
  // if more than four tasks exist in a cell, group them on next reload
  function createMoreModal(e) {
    const { labels } = locales;
    const moreModalEntries = getMoreModalEntries(e);
    handleOverlay('show');
    // parent : month cell
    const parent = e.target.parentElement.parentElement;
    const modal = document.createElement('div');
    modal.classList.add('more-modal');
    modal.setAttribute('data-mv-modal', parent.getAttribute('data-mv-idx'));

    let modalHeight = (moreModalEntries.length * 28) + 64;

    if (modalHeight > 400) {
      modalHeight = 400;
    }

    const rect = parent.getBoundingClientRect();
    // let newleft = parseInt(rect.left);
    const rectWidth = Number.parseInt(rect.width);

    const [x, y] = placePopup(
      216,
      modalHeight,
      [Number.parseInt(rect.left), Number.parseInt(rect.top)],
      [window.innerWidth, window.innerHeight],
      true,
      rectWidth,
      // parseInt(rect.width)
    );

    const maxH = +window.innerHeight - +y - 24;
    modal.setAttribute('style', `top: ${y}px; left: ${x}px; width: 216px; height: ${modalHeight}px; min-height: 120px; max-height: ${maxH}px;`);

    const modalHeader = document.createElement('div');
    modalHeader.classList.add('more-modal-header');
    const modalHeaderTitle = document.createElement('div');
    modalHeaderTitle.classList.add('more-modal-header-title');
    const parentDate = createDateFromFormattedString(e.target.parentElement.parentElement.getAttribute('data-mv-date'));

    // dayn: daynumber (1, 2, 3, etc)
    const dowspan = document.createElement('span');
    dowspan.classList.add('more-modal-header-title-dow');
    dowspan.textContent = labels.weekdaysShort[parentDate.getDay()].toUpperCase();

    const daynspan = document.createElement('span');
    daynspan.classList.add('more-modal-header-title-dayn');
    daynspan.textContent = parentDate.getDate();

    const modalHeaderClose = document.createElement('div');
    modalHeaderClose.classList.add('more-modal-header-close');
    modalHeaderClose.append(createCloseIcon('var(--white3)'));
    modalHeaderClose.setAttribute('data-tooltip', 'Close');

    modalHeaderTitle.append(modalHeaderClose, dowspan, daynspan);
    modalHeader.append(modalHeaderTitle);
    modal.append(modalHeader, createMoreModalBox(moreModalEntries)); // entries
    monthWrapper.append(modal);

    // open day view (number click)
    daynspan.addEventListener('click', () => {
      renderDayViewViaModal(parentDate);
    }, { once: true });

    // click away from modal to close
    resizeoverlay.addEventListener('click', () => {
      closeMoreModal();
    }, { once: true });

    document.addEventListener('keydown', closeMoreModalOnEscape);
  }

  function dragOutOfModal(e) {
    const targetModal = document.querySelector('.more-modal');
    const targetCellIdx = Number.parseInt(targetModal.getAttribute('data-mv-modal'));
    const targetCell = document.querySelector(`[data-mv-idx="${targetCellIdx}"]`);

    const cloned = e.target.cloneNode(true);
    cloned.setAttribute('class', 'monthview--box');
    cloned.firstChild.setAttribute('class', 'monthview--title');
    cloned.style.top = `${boxquery.getTop()}px`;
    cloned.style.left = '0px';
    cloned.style.width = '100%';
    targetCell.lastChild.append(cloned);

    // update title of more modal to reflect one less entry
    const moreModal = targetCell.lastChild.firstChild;
    const newLength = Number.parseInt(moreModal.getAttribute('data-mvgrouped-length')) - 1;

    if (newLength < 1) {
      targetCell.lastChild.classList.remove('monthview--daycontent-grouped');
      moreModal.remove();
      cloned.style.top = '0px';
    } else {
      moreModal.setAttribute('data-mvgrouped-length', newLength);
      moreModal.firstChild.firstChild.textContent = `${newLength} more...`;
    }

    // instantiate drag engine on cloned element and destroy the more modal instance
    //
    dragEngineMonth(e, cloned);
    cloned.focus();
    targetModal.style.opacity = '0.8';
  }

  function openDayView(e) {
    const [year, month, day] = getDateFromAttribute(e.target.parentElement, 'data-mv-date', 'month');
    context.setDate(year, month, day);
    context.setDateSelected(day);
    setDayViewViaMonth();
  }

  function handleMonthviewEditFormClose() {
    const tempcell = document.querySelector('.monthview--daycontent__form-temp');
    if (!tempcell) return;

    tempcell.removeAttribute('style');
    tempcell.classList.remove('monthview--daycontent__form-temp');
  }

  // reset cell to original state if form is closed without any action
  function handleMonthviewFormClose() {
    const tempbox = document?.querySelector('.monthview--box__form-temp');
    if (!tempbox) return;
    const cellContent = tempbox.parentElement;
    const cell = cellContent.parentElement;
    cell.removeAttribute('style');
    cell.classList.remove('monthview--daycontent__form-temp');
    tempbox.remove();
    resetCellOnDrop(cellContent.children, false);
  }

  function openFormOnClickMV(box, cell) {
    const id = box.getAttribute('data-monthview-id');
    const entry = store.getEntry(id);
    const start = entry.start;
    const color = store.getCtgColor(entry.category);
    const offsetColor = hextorgba(color, 0.5);
    cell.classList.add('monthview--daycontent__form-temp');
    cell.style.backgroundColor = offsetColor;

    const rect = cell.getBoundingClientRect();
    const [x, y] = placePopup(
      360,
      165,
      [Number.parseInt(rect.left), Number.parseInt(rect.top)],
      [window.innerWidth, window.innerHeight],
    );
    // *** config & open form ***
    store.setFormResetHandle('month', handleMonthviewEditFormClose);

    const setup = new FormSetup();
    setup.setSubmission('edit', id, entry.title, entry.description);
    setup.setCategory(entry.category, color);
    setup.setDates(getFormDateObject(start, entry.end));

    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);

    // Entry option modal will either trigger or release the above setup
    // provide callback to finish setup and open form
    const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());
    getEntryOptionModal(context, store, entry, datepickerContext, finishSetup);
    const modal = document.querySelector('.entry__options');
    modal.style.top = y + 'px';
    modal.style.left = x + 'px';
    // *******************
  }

  function configNewBoxInsertion(cellWrapper, cell, category, color) {
    const tempBox = createBox(
      'temp', // box.id
      category, // box.style.backgroundColor
      0, // box.style.top
      '( New Entry )', // box title
    );
    cellWrapper.scrollTop = 0;
    tempBox.classList.add('monthview--box__form-temp');
    cell.classList.add('monthview--daycontent__form-temp');
    cell.style.backgroundColor = color;
    if (cellWrapper.children.length > 0) {
      cellWrapper.insertBefore(tempBox, cellWrapper.children[0]);
      resetCellOnDrop(cellWrapper.children, false);
    } else {
      cellWrapper.append(tempBox);
    }
  }

  function createEntryOnEmptyTarget(e, cellWrapper) {
    if (e.target.classList.contains('monthview--daycontent')) {
      // get first active category & create temp box with its color
      const cell = cellWrapper.parentElement;
      const rect = cell.getBoundingClientRect();
      const attrDate = getDateFromAttribute(cell, 'data-mv-date', 'month');
      const [start, end] = generateTempStartEnd(attrDate);

      // handle case where no category is active
      let tempctg;
      let color;
      if (store.getActiveCategories().length === 0) {
        const tempdefaultctg = store.getDefaultCtg();
        tempctg = tempdefaultctg[0];
        color = tempdefaultctg[1].color;
      } else {
        const tempcurrentctg = store.getFirstActiveCategoryKeyPair();
        tempctg = tempcurrentctg[0];
        color = tempcurrentctg[1];
      }
      const offsetcolor = hextorgba(color, 0.5);

      configNewBoxInsertion(cellWrapper, cell, tempctg, offsetcolor);
      store.setFormResetHandle('month', handleMonthviewFormClose);
      const openForm = store.getRenderFormCallback();
      const setup = new FormSetup();

      setup.setSubmission('create', null, null, null);
      setup.setCategory(tempctg, color);
      setup.setDates(getFormDateObject(start, end));

      openForm();
      fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);
      fullFormConfig.getConfig(setup.getSetup());
      fullFormConfig.setFormStyle(
        Number.parseInt(rect.right),
        Number.parseInt(rect.top),
        false,
        null,
      );
    }
  }

  function delegateMonthEvents(e) {
    // delegates via monthview--box (monthWrapper) onmousedown
    const monthviewBox = getClosest(e, '.monthview--box');
    const monthviewBoxHeader = getClosest(e, '.monthview--dayofmonth');
    const groupedBox = getClosest(e, '.monthview--daygroup');
    const groupedBoxItem = getClosest(e, '.more-modal-entry');
    const closeGroupedBox = getClosest(e, '.more-modal-header-close');

    // target : any box (task/event) within a day
    // execute : drag and drop
    if (monthviewBox) {
      if (window.innerHeight <= 280) return;
      dragEngineMonth(e, e.target);
      return;
    }

    // target : cell day number
    // execute : open day view of that day
    if (monthviewBoxHeader) {
      e.stopPropagation();
      openDayView(e);
      return;
    }

    // target : grouped box (more...)
    // execute : create popup modal with all grouped entries of that day
    if (groupedBox) {
      createMoreModal(e);
      return;
    }

    // target : entry within more modal
    // execute : drag box (e.target) out of the more modal for reassignment, (same day works as well)
    if (groupedBoxItem) {
      if (window.innerHeight <= 300) return;
      dragOutOfModal(e);
      return;
    }

    // target : close btn within more modal
    if (closeGroupedBox) {
      closeMoreModal();
      return;
    }
  }

  function delegateNewBox(e) {
    // delegates via monthview--daycontent (cellWrapper) onclick
    // note that this is the same parent element that delegates mouse down events
    // second delegation is needed to prevent the scrollbars that exist within the cells (days) from triggering the creation of a new entry on cell click
    const emptyBoxClick = getClosest(e, '.monthview--daycontent');
    if (emptyBoxClick) {
      if (window.innerHeight <= 300) return;
      createEntryOnEmptyTarget(e, e.target);
      return;
    }
  }

  const initMonth = () => {
    populateCells();
    monthWrapper.onmousedown = delegateMonthEvents;
    monthWrapper.onclick = delegateNewBox;
    store.setResetPreviousViewCallback(resetMonthview);
  };

  initMonth();
}
