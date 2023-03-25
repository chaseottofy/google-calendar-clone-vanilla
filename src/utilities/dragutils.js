import calcTime from "./timeutils";

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
  boxnumarr: {
    week: [
      'box-one', 'box-two', 'box-three',
      'box-four', 'box-five', 'box-six',
      'box-seven', 'box-eight', 'box-nine',
      'box-ten', 'box-eleven', 'box-twelve',
      'box-thirteen', 'box-fourteen', 'box-fifteen',
    ],
    day: [
      'dv-box-one', 'dv-box-two', 'dv-box-three',
      'dv-box-four', 'dv-box-five', 'dv-box-six',
      'dv-box-seven', 'dv-box-eight', 'dv-box-nine',
      'dv-box-ten', 'dv-box-eleven', 'dv-box-twelve',
      'dv-box-thirteen', 'dv-box-fourteen', 'dv-box-fifteen',
    ],
  },

  boxClasses: {
    week: {
      base: "box",
      ontop: "box-ontop",
      active: "box-mv-dragactive",
      temporary: "temporary-box",
      prepend: "box-",
    },
    day: {
      base: "dv-box",
      ontop: "dv-box-ontop",
      active: "dv-box-mv-dragactive",
      temporary: "dv-temporary-box",
      prepend: "dv-box-",
    },
  },

  boxAttributes: {
    week: {
      updatecoord: [
        "data-box-id",
        "data-start-time",
        "data-time-intervals"
      ],
      dataIdx: "box-idx",
      dataId: "data-box-id",
      dataCol: "data-box-col",
      prepend: "data-",
      prepentwo: "data-wv-"
    },
    day: {
      updatecoord: [
        "data-dv-box-id",
        "data-dv-start-time",
        "data-dv-time-intervals",
      ],
      dataIdx: "data-dv-box-index",
      dataId: "data-dv-box-id",
      prepend: "data-dv-",
      prepentwo: "data-dv-"
    },
  },

  styles: {
    newBox: {
      left: "calc((100% - 0px) * 0 + 0px)",
      height: "12.5px",
      width: "calc((100% - 4px) * 1)",
    }
  }
};

function calcNewLeft(index) {
  let base = 0.1;
  let add = 0.05;

  if (index === 0) {
    return 0;
  }

  if (index >= 1 && index <= 5) {
    return (index * add) + base;
  }
}


// *** I'm using a temporary switch statement to try and fine tune the collision handling for now
function setBoxWidthWeek(box, prepend, dataidx) {
  const attr = box.getAttribute(dataidx);
  switch (attr) {
    case `${prepend}one`:
      box.style.left = 'calc((100% - 0px) * 0 + 0px)';
      box.style.width = "calc((100% - 4px) * 1)";
      break;
    case `${prepend}two`:
      box.style.left = "calc((100% - 0px) * 0.2 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.80)";
      break;
    case `${prepend}three`:
      box.style.left = "calc((100% - 0px) * 0.45 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.55)";
      break;
    case `${prepend}four`:
      box.style.left = "calc((100% - 0px) * 0.0 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.44)";
      break;
    case `${prepend}five`:
      box.style.left = "calc((100% - 0px) * .5 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.35)";
      break;
    case `${prepend}six`:
      box.style.left = "calc((100% - 0px) * 0.1 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.4)";
      break;
    case `${prepend}seven`:
      box.style.left = "calc((100% - 0px) * 0.5 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.5)";
      break;
    case `${prepend}eight`:
      box.style.left = "calc((100% - 0px) * 0.25 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.25)";
      break;
    case `${prepend}nine`:
      box.style.left = "calc((100% - 0px) * 0.55 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.35)";
      break;
    case `${prepend}ten`:
      box.style.left = "calc((100% - 0px) * 0.55 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}eleven`:
      box.style.left = "calc((100% - 0px) * 0.70 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}twelve`:
      box.style.left = "calc((100% - 0px) * 0.85 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}thirteen`:
      box.style.left = "calc((100% - 0px) * 0.05 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.25)";
      break;
    case `${prepend}fourteen`:
      box.style.left = "calc((100% - 0px) * 0.30 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.25)";
      break;
    case `${prepend}fifteen`:
      box.style.left = "calc((100% - 0px) * 0.55 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.25)";
      break;
    default:
      break;
  }
}

function setBoxWidthDay(box, prepend, dataidx) {
  const attr = box.getAttribute(dataidx);
  switch (attr) {
    case `${prepend}one`:
      box.style.left = 'calc((100% - 0px) * 0 + 0px)';
      box.style.width = "calc((100% - 4px) * 1)";
      break;
    case `${prepend}two`:
      box.style.left = "calc((100% - 0px) * 0.15 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.85)";
      break;
    case `${prepend}three`:
      box.style.left = "calc((100% - 0px) * 0.30 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.70)";
      break;
    case `${prepend}four`:
      box.style.left = "calc((100% - 0px) * 0.45 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.55)";
      break;
    case `${prepend}five`:
      box.style.left = "calc((100% - 0px) * 0.60 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.40)";
      break;
    case `${prepend}six`:
      box.style.left = "calc((100% - 0px) * 0.75 + 0px)";
      box.style.width = "calc((100% - 4px) * 0.25)";
      break;
    case `${prepend}seven`:
      box.style.left = "calc((100% - 0px) * 0.10 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}eight`:
      box.style.left = "calc((100% - 0px) * 0.25 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}nine`:
      box.style.left = "calc((100% - 0px) * 0.4 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}ten`:
      box.style.left = "calc((100% - 0px) * 0.55 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}eleven`:
      box.style.left = "calc((100% - 0px) * 0.70 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}twelve`:
      box.style.left = "calc((100% - 0px) * 0.85 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.15)";
      break;
    case `${prepend}thirteen`:
      box.style.left = "calc((100% - 0px) * 0.05 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.25)";
      break;
    case `${prepend}fourteen`:
      box.style.left = "calc((100% - 0px) * 0.30 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.25)";
      break;
    case `${prepend}fifteen`:
      box.style.left = "calc((100% - 0px) * 0.55 + 0px)";
      box.style.width = "calc((100% - 16px) * 0.25)";
      break;
    default:
      break;
  }
}
function handleOverlap(col, view, boxes) {

  const collisions = view === "day" ? boxes.checkForCollision() : boxes.checkForCollision(col);
  // console.log(boxes)

  const identifyBox = identifiers.boxnumarr[view];

  const [baseClass, classPrepend] = [
    identifiers.boxClasses[view],
    identifiers.boxClasses[view].prepend,
  ];

  const [boxIdxAttr, boxIdAttr] = [
    identifiers.boxAttributes[view].dataIdx,
    identifiers.boxAttributes[view].dataId,
  ];

  for (let i = 0; i < collisions.length; i++) {
    const box = document.querySelector(`[${boxIdAttr}="${collisions[i].id}"]`);
    let idx = i;
    if (i >= 15) {
      idx -= 12;
    }
    if (i === 0) {
      box.setAttribute("class", `${baseClass.base} ${identifyBox[idx]}`);
      box.setAttribute(boxIdxAttr, identifyBox[idx]);
    } else {
      box.setAttribute("class", `${baseClass.base} ${baseClass.ontop} ${identifyBox[idx]}`);
      box.setAttribute(boxIdxAttr, identifyBox[idx]);
    }
    view === "day"
      ? setBoxWidthDay(box, classPrepend, boxIdxAttr)
      : setBoxWidthWeek(box, classPrepend, boxIdxAttr);
  }
}

function setStylingForEvent(clause, wrapper, store) {
  const sidebar = document.querySelector(".sidebar");
  const resizeoverlay = document.querySelector(".resize-overlay");

  switch (clause) {
    case "dragstart":
      // make sidebar slightly see through if it is open and the user is dragging or resizing (screens smaller than 840px);
      if (!sidebar.classList.contains("hide-sidebar")) {
        if (wrapper.offsetLeft === 0) {
          sidebar.classList.add("sidebar--dragged-over");
        }
      }
      store.addActiveOverlay("hide-resize-overlay");
      resizeoverlay.classList.remove("hide-resize-overlay");
      break;
    case "dragend":
      store.removeActiveOverlay("hide-resize-overlay");
      sidebar.classList.remove("sidebar--dragged-over");
      resizeoverlay.classList.add("hide-resize-overlay");
      document.body.style.cursor = "default";
      break;
    default:
      break;
  }
}

function updateBoxCoordinates(box, view, boxes) {
  let [id, y, h] = identifiers.boxAttributes[view].updatecoord.map((x) => {
    return box.getAttribute(x);
  });
  let x = view === "week" ? box.getAttribute("data-box-col") : 1;
  boxes.updateCoordinates(id, {
    x: parseInt(x),
    y: parseInt(y),
    h: parseInt(h),
    e: parseInt(y) + parseInt(h),
  });
}

function setBoxTimeAttributes(box, view) {
  let start = +box.style.top.split("px")[0];
  start = start >= 0 ? start / 12.5 : 0;
  let length = +box.style.height.split("px")[0] / 12.5;
  let end = start + length;
  let prepend = identifiers.boxAttributes[view].prepend;
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
  box.style.width = "calc((100% - 4px) * 1)";

  const boxheader = document.createElement('div');
  boxheader.classList.add(`${baseClass}__header`);
  const entryTitle = document.createElement('div');
  entryTitle.classList.add(`${baseClass}-title`);
  entryTitle.textContent = entry.title;
  boxheader.appendChild(entryTitle);

  const boxcontent = document.createElement('div');
  boxcontent.classList.add(`${baseClass}__content`);
  const entryTime = document.createElement('span');
  entryTime.classList.add(`${baseClass}-time`);
  boxcontent.appendChild(entryTime);

  const resizehandleS = document.createElement('div');
  resizehandleS.classList.add(`${baseClass}-resize-s`);

  if (col.getAttribute(`${attrPrependTwo}top`) === "true") {
    box.setAttribute(`${attrPrependTwo}start`, coord.x);
    box.setAttribute(`${attrPrependTwo}end`, coord.x2);
  } else {
    box.setAttribute(`${attrPrepend}start-time`, coord.y);
    box.setAttribute(`${attrPrepend}time-intervals`, coord.h);
    box.setAttribute(`${attrPrepend}end-time`, +coord.y + +coord.h);
    if (view === "week") {
      box.setAttribute("data-box-col", coord.x);
      box.setAttribute("box-idx", 1);
    } else {
      box.setAttribute("data-dv-box-index", 1);
    }
    entryTime.textContent = calcTime(coord.y, +coord.h);
  }

  box.setAttribute(`${attrPrepend}box-id`, entry.id);
  box.setAttribute(`${attrPrepend}box-category`, entry.category);
  box.append(boxheader, boxcontent, resizehandleS);
  col.appendChild(box);
}

function createTemporaryBox(box, col, hasSibling, view) {
  const clone = box.cloneNode(true);
  clone.classList.add(`${identifiers.boxClasses[view].temporary}`);
  if (hasSibling) {
    col.insertBefore(clone, box.nextElementSibling);
  } else {
    col.appendChild(clone);
  }
}

function getBoxDefaultStyle(y, backgroundColor) {
  const style = identifiers.styles.newBox;
  return `top:${y}px; left:${style.left}; height:${style.height}; width:${style.width}; background-color:${backgroundColor};`;
}

function resetStyleOnClick(view, box) {
  box.setAttribute("class", identifiers.boxClasses[view].base);
  box.style.left = 'calc((100% - 0px) * 0 + 0px)';
  box.style.width = "calc((100% - 4px) * 1)";
}

function createTempBoxHeader(view) {
  const baseClass = identifiers.boxClasses[view].base;
  const boxheader = document.createElement('div');
  const boxtitle = document.createElement('div');
  boxheader.classList.add(`${baseClass}__header`);
  boxtitle.classList.add(`${baseClass}-title`);
  boxtitle.textContent = "(no title)";
  boxheader.appendChild(boxtitle);
  return boxheader;
}

function startEndDefault(y) {
  let tempstarthour = Math.floor((y / 12.5) / 4);
  let tempstartmin = Math.floor((y / 12.5) % 4) * 15;
  return [
    tempstarthour,        // start hour
    tempstartmin,         // start minute
    tempstarthour,        // end hour
    +tempstartmin + 15    // end minute
  ];
}

function calcNewHourFromCoords(h, y) {
  return Math.floor(((h + y) / 12.5) / 4);
}

function calcNewMinuteFromCoords(h, y) {
  return Math.floor(((h + y) / 12.5) % 4) * 15;
}

function calcDateOnClick(date, start, length) {
  let [startDate, endDate] = [new Date(date), new Date(date)];
  startDate.setHours(Math.floor(+start / 4));
  startDate.setMinutes((+start * 15) % 60);
  endDate.setHours(Math.floor((start + length) / 4));
  endDate.setMinutes(((start + length) * 15) % 60);
  return [startDate, endDate];
}

function getOriginalBoxObject(box) {
  return {
    height: box.style.height,
    left: box.style.left,
    width: box.style.width,
    class: box.getAttribute("class"),
  };
}

function resetOriginalBox(box, boxorig) {
  box.setAttribute("class", boxorig.class);
  box.style.left = boxorig.left;
  box.style.width = boxorig.width;
}

export default handleOverlap;
export {
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
  resetOriginalBox
};