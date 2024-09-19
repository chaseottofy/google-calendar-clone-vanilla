import calcTime from './timeutils';
/**
 * For a full explanation see readme @grid-engines
 *
 * The weekiew & dayview drag/resize systems are 90% similar with the only difference of course being some additional calculations to drag between days in the weekview.
 *
 *
 * All drag / resize events throughout each view follow these steps;
 * -- capture :
 * document.onmousedown captures the position of cursor & defines variables for start/end points
 *
 * -- relay :
 * document.onmousemove relays the new position to start/end point variables, which in turn relay a new set of styling rules to the element target (entry)
 *
 * -- render :
 * document.onmouseup intitiates all render logic
 *
 */

const identifiers = {
  boxClasses: {
    week: {
      base: 'box',
      ontop: 'box-ontop',
      active: 'box-mv-dragactive',
      temporary: 'temporary-box',
      prepend: 'box-',
    },
    day: {
      base: 'dv-box',
      ontop: 'dv-box-ontop',
      active: 'dv-box-mv-dragactive',
      temporary: 'dv-temporary-box',
      prepend: 'dv-box-',
    },
  },
  boxAttributes: {
    week: {
      updatecoord: [
        'data-box-id',
        'data-start-time',
        'data-time-intervals',
      ],
      dataIdx: 'box-idx',
      dataId: 'data-box-id',
      dataCol: 'data-box-col',
      prepend: 'data-',
      prepentwo: 'data-wv-',
    },
    day: {
      updatecoord: [
        'data-dv-box-id',
        'data-dv-start-time',
        'data-dv-time-intervals',
      ],
      dataIdx: 'data-dv-box-index',
      dataId: 'data-dv-box-id',
      prepend: 'data-dv-',
      prepentwo: 'data-dv-',
    },
  },

  boxGrid: {
    leftCoord: [
      '0.00', '5.00',
      '10.00', '25.00',
      '55.00', '70.00',
      '5.00', '10.00',
      '25.00', '55.00',
      '80.00', '15.00',
      '5.00', '25.00',
      '65.00',
    ],
    widthCoord: [
      '100.00', '95.00',
      '90.00', '75.00',
      '45.00', '30.00',
      '45.00', '55.00',
      '75.00', '45.00',
      '20.00', '45.00',
      '30.00', '50.00',
      '25.00',
    ],
  },
  styles: {
    newBox: {
      left: '0%',
      height: '12.5px',
      width: '97%',
    },
  },
};

function setBoxW(box, ind, data, offset) {
  box.style.left = `${Number.parseFloat(data[ind])}%`;
  box.style.width = `${Number.parseFloat(offset[ind])}%`;
}

function groupOverlapping(tasks) {
  tasks.sort((a, b) => a.coordinates.y - b.coordinates.y);
  let groups = [];
  let currentGroup = [];
  function isOverlapping(task1, task2) {
    let bottom1 = task1.coordinates.y + task1.coordinates.h;
    let bottom2 = task2.coordinates.y + task2.coordinates.h;
    return (task1.coordinates.y <= task2.coordinates.y && bottom1 > task2.coordinates.y) ||
      (task2.coordinates.y <= task1.coordinates.y && bottom2 > task1.coordinates.y);
  }

  for (let task of tasks) {
    if (currentGroup.length === 0) {
      currentGroup.push(task);
    } else {
      let overlapsWithAny = currentGroup.some((groupTask) => isOverlapping(groupTask, task));

      if (overlapsWithAny) {
        currentGroup.push(task);
      } else {
        groups.push(currentGroup);
        currentGroup = [task];
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}

function handleOverlap(col, view, boxes) {
  const { boxClasses, boxAttributes, boxGrid } = identifiers;
  // const baseClass = boxClasses[view];
  // const { base, ontop, prepend } = baseClass;
  // const { dataIdx: boxIdxAttr, dataId: boxIdAttr } = boxAttributes[view];
  const { ontop } = boxClasses[view];
  const { dataId: boxIdAttr } = boxAttributes[view];
  const { leftCoord, widthCoord } = boxGrid;

  const currBoxes = view === 'week'
    ? boxes.getBoxesByColumn(col)
    : boxes.getBoxes();
  if (currBoxes.length === 0) return;

  const collisions = groupOverlapping(currBoxes);
  collisions.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      const currBox = group[i];
      const { id } = currBox;
      const boxElement = document.querySelector(`[${boxIdAttr}="${id}"]`);

      const currIdx = i % widthCoord.length;
      boxElement.style.zIndex = i + 1;
      if (i > 0) {
        boxElement.classList.add(ontop);
      }
      setBoxW(boxElement, currIdx, leftCoord, widthCoord);
    }
  });
}

function setStylingForEvent(clause, wrapper, store) {
  const sidebar = document.querySelector('.sidebar');
  const resizeoverlay = document.querySelector('.resize-overlay');

  switch (clause) {
    case 'dragstart': {
      // make sidebar slightly see through if it is open and the user is dragging or resizing (screens smaller than 840px);
      if (!sidebar.classList.contains('hide-sidebar')) {
        if (wrapper.offsetLeft === 0) {
          sidebar.classList.add('sidebar--dragged-over');
        }
      }
      store.addActiveOverlay('hide-resize-overlay');
      resizeoverlay.classList.remove('hide-resize-overlay');
      break;
    }
    case 'dragend': {
      store.removeActiveOverlay('hide-resize-overlay');
      sidebar.classList.remove('sidebar--dragged-over');
      resizeoverlay.classList.add('hide-resize-overlay');
      document.body.style.cursor = 'default';
      break;
    }
    default: {
      break;
    }
  }
}

function updateBoxCoordinates(box, view, boxes) {
  const [id, y, h] = identifiers.boxAttributes[view].updatecoord.map((x) => {
    return box.getAttribute(x);
  });
  const x = view === 'week' ? box.getAttribute('data-box-col') : 1;
  boxes.updateCoordinates(id, {
    x: Number.parseInt(x),
    y: Number.parseInt(y),
    h: Number.parseInt(h),
    e: Number.parseInt(y) + Number.parseInt(h),
  });
}

function setBoxTimeAttributes(box, view) {
  let start = +box.style.top.split('px')[0];
  start = start >= 0 ? start / 12.5 : 0;
  const length = +box.style.height.split('px')[0] / 12.5;
  const end = start + length;
  const prepend = identifiers.boxAttributes[view].prepend;
  box.setAttribute(`${prepend}start-time`, start);
  box.setAttribute(`${prepend}time-intervals`, length);
  box.setAttribute(`${prepend}end-time`, end);
}

function createBox(col, entry, view, color) {
  const baseClass = identifiers.boxClasses[view].base;
  const attrPrepend = identifiers.boxAttributes[view].prepend;
  const attrPrependTwo = identifiers.boxAttributes[view].prependtwo;
  const coord = entry.coordinates;

  const box = document.createElement('div');
  box.classList.add(baseClass);
  box.style.backgroundColor = color;
  box.style.top = `${+coord.y * 12.5}px`;
  box.style.height = `${+coord.h * 12.5}px`;
  box.style.left = 'calc((100% - 0px) * 0 + 0px)';
  box.style.width = 'calc((100% - 4px) * 1)';

  const boxheader = document.createElement('div');
  boxheader.classList.add(`${baseClass}__header`);
  const entryTitle = document.createElement('div');
  entryTitle.classList.add(`${baseClass}-title`);
  entryTitle.textContent = entry.title;
  boxheader.append(entryTitle);

  const boxcontent = document.createElement('div');
  boxcontent.classList.add(`${baseClass}__content`);
  const entryTime = document.createElement('span');
  entryTime.classList.add(`${baseClass}-time`);
  boxcontent.append(entryTime);

  const resizehandleS = document.createElement('div');
  resizehandleS.classList.add(`${baseClass}-resize-s`);

  if (col.getAttribute(`${attrPrependTwo}top`) === 'true') {
    box.setAttribute(`${attrPrependTwo}start`, coord.x);
    box.setAttribute(`${attrPrependTwo}end`, coord.x2);
  } else {
    box.setAttribute(`${attrPrepend}start-time`, coord.y);
    box.setAttribute(`${attrPrepend}time-intervals`, coord.h);
    box.setAttribute(`${attrPrepend}end-time`, +coord.y + +coord.h);
    if (view === 'week') {
      box.setAttribute('data-box-col', coord.x);
      box.setAttribute('box-idx', 1);
    } else {
      box.setAttribute('data-dv-box-index', 1);
    }
    entryTime.textContent = calcTime(coord.y, +coord.h);
  }

  box.setAttribute(`${attrPrepend}box-id`, entry.id);
  box.setAttribute(`${attrPrepend}box-category`, entry.category);
  box.append(boxheader, boxcontent, resizehandleS);
  col.append(box);
}

function createTemporaryBox(box, col, hasSibling, view) {
  const clone = box.cloneNode(true);
  clone.classList.add(`${identifiers.boxClasses[view].temporary}`);
  if (hasSibling) {
    col.insertBefore(clone, box.nextElementSibling);
  } else {
    col.append(clone);
  }
}

function getBoxDefaultStyle(y, backgroundColor) {
  const style = identifiers.styles.newBox;
  return `top:${y}px; left:${style.left}; height:${style.height}; width:${style.width}; background-color:${backgroundColor};`;
}

function resetStyleOnClick(view, box) {
  box.setAttribute('class', identifiers.boxClasses[view].base);
  box.style.left = 'calc((100% - 0px) * 0 + 0px)';
  box.style.width = 'calc((100% - 4px) * 1)';
}

function createTempBoxHeader(view) {
  const baseClass = identifiers.boxClasses[view].base;
  const boxheader = document.createElement('div');
  const boxtitle = document.createElement('div');
  boxheader.classList.add(`${baseClass}__header`);
  boxtitle.classList.add(`${baseClass}-title`);
  boxtitle.textContent = '(no title)';
  boxheader.append(boxtitle);
  return boxheader;
}

function startEndDefault(y) {
  const tempstarthour = Math.floor((y / 12.5) / 4);
  const tempstartmin = Math.floor((y / 12.5) % 4) * 15;
  return [
    tempstarthour,
    tempstartmin,
    tempstarthour,
    +tempstartmin + 15,
  ];
}

function calcNewHourFromCoords(h, y) {
  return Math.floor(((h + y) / 12.5) / 4);
}

function calcNewMinuteFromCoords(h, y) {
  return Math.floor(((h + y) / 12.5) % 4) * 15;
}

function getOriginalBoxObject(box) {
  return {
    height: box.style.height,
    left: box.style.left,
    width: box.style.width,
    class: box.getAttribute('class'),
  };
}

function resetOriginalBox(box, boxorig) {
  box.setAttribute('class', boxorig.class);
  box.style.left = boxorig.left;
  box.style.width = boxorig.width;
}

export default handleOverlap;
export {
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
};
