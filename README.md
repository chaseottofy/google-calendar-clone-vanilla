# Google Calendar Clone

## contact: ottofy@zohomail.com

**[LIVE PROJECT LINK](https://chaseottofy.github.io/google-calendar-clone-vanilla/)**

**[SCREENSHOTS](https://ibb.co/album/fQrm1F)**

## Documentation

Thank you for taking the time to check out this project!

**This Documentation is a work in progress.**

## Glossary

1. [About](#about)

2. [Cloning](#cloning_this_repo)

3. [Events](#events)

4. [Drag_Systems](#drag_systems)
  
5. [Resize_Systems](#resize_systems)

6. [Date_Handling](#date_handling)

7. [Time_Handling](#time_handling)

8. [Form_Handling](#form_handling)

9. [Views](#views)

10. [Rendering](#rendering)

11. [Storage](#storage)

12. [Project_Goals](#project_goals)

13. [Journal](#journal)

## About

I hope to deliver the following information as clearly as possible. If you have any questions please refer to the email above and I will get back to you as soon as I see your message.

### Cloning_This_Repo

#### `git clone`

#### `cd google-calendar-clone-vanilla`

#### `npm install`

### Available_Scripts

#### `npm run build`

Builds the app and **necessary** resources in the `dist` folder.

#### `npm run dev`

Starts the webpack development server on `localhost:3000`.

## Events

### 1. [Active-Events](#active-events)

### 2. [Delegation-Example](#delegation-example)

### 3. [Garbage-Collection](#garbage-collection)

### 4. [Modal-Form-Events](#modal-form-events)

This application relies heavily on Event Delegation, the idea of administering events through a common parent element. The main benefit to this is the lack of actual listeners registered to the DOM.

## Active-Events

**At most, 5 of the following 7 delegators will be in the DOM at the same time.**

1. `window: resize` - for resizing the window (only in monthview).
2. `document: keydown` - for handling keyboard events.
3. `document: onclick` - for handling clicks on the overlay.
4. `document: onmousemove` - for handling drag / resize.
5. `document: onmouseup` - for handling drag / resize.
6. `modal/form: onmousedown` - for handling clicks on one of the several modals or two forms.
7. `dayview/weekview/monthview/yearview/listview: onmousedown` - calendar events are delegated from their respective views. Only one of these listeners will be active at a time.

## Delegation-Example

```javascript
function getClosest(e, element) {
  return e.target.closest(element);
}

function delegateEvent(e) {
  const targetElement = getClosest(e, ".target-class");
  const targetElement2 = getClosest(e, ".target-class2");

  if (targetElement) {
    // do something
    return;
  }

  if (targetElement2) {
    // do something else
    return;
  }
}

parentElement.onmousedown = delegateEvent;
```

## Garbage-Collection

Each time a new calendar view is rendered, the parent element listener from the previous view is removed from the DOM, as well as the elements that were delegated to it. The current view's parent element listener is then added to the DOM and delegation is re-established.

In short, this garbage collection process works as follows:
(In this example, the user is switching from monthview to dayview)

1. Monthview content is rendered.
2. Monthview parent container establishes delegation to its children through the `onmousedown` listener.
3. The global store that is passed through each component is updated with a callback function with instructions to set the `onmousedown` listener to null, and remove all delegated elements.
4. User switches to dayview.
5. Callback provided in step 3 is executed.
6. 1-5 are repeated for each view.

I hope this explanation helps shed some light on how I handle garbage collection however, do not take my word for gospel. I am constantly re-evaluating my approach to this problem. If you are under the impression that I am doing something wrong in this approach, please e-mail me and I will be in your debt.

## Modal-Form-Events

Each modal and form has its own "overlay" DOM element, a transparent `<aside>` element that is positioned absolutely and covers the entire screen just behind the modal / form.

Upon opening, the following happens:

1. The overlay is added to the DOM.
2. The global store is notified of the overlay's existence. This in turn tells the global keydown listener to
temporarily ignore keyboard events.
3. Once the global keydown listener is notified, a new keydown listener is registered to the overlay that will in turn handle "Escape" events and close the modal / form.
4. The modal / form is added to the DOM.
5. The overlay is given an `onclick` listener that will close the modal / form.

Upon closing, the following happens:

1. The overlay and modal / form listeners are removed from the DOM.
2. The global store is notified of the overlay's removal. Global keydown listener is re-registered to the document.

## Drag_Systems

### 1. [Week-Day-Drag](#week-day-drag)

### 2. [Month-Drag](#month-drag)

### 3. [Form-Drag](#form-drag)

There exist four total drag systems throughout the app, three of which are completely different from one another.

## Week-Day-Drag

Setting up this particular Drag System is really the trickiest part of the process.
Steps (i - iii) will cover most of the setup procedure.
Steps (iv) will cover the actual drag and drop system.

### I) [WD-Generating-Coordinates](#wd-generating-coordinates)

### II) [WD-Setup-Positioning](#wd-setup-positioning)

### III) [WD-Administer-Positioning](#wd-administer-positioning)

### IV) [WD-DragEngine](#wd-dragengine)

**This particular grid system operates as a 24 hour clock, with each hour being divided into 4 15 minute intervals.**

Each column has relative positioning and a fixed height of 1200px.

What makes this grid system particularly unique is the fact that columns do not technically have rows. Instead, each column is a container for a series of divs (entries) that are positioned absolutely.

The visual representation of rows is created by a background image (linear-gradient) defined in the parent containers css.

* Weekview Grid Container:
  * background-size: calc(100% / 7) 4%;
    * (7 days in a week, 4% of the height of each column).
  * background-image: linear-gradient(to bottom, var(--mediumgrey1) 1%,transparent 0);
    * (1% of the height of each column).

* Dayview Grid Container:
  * background-size: 100% 4%
    * (1 day, 4% of the height of each column).
  * background-image: linear-gradient(to bottom,var(--mediumgrey1) 1%,transparent 0)
    * (1% of the height of each column).

The parent container is also given a fixed height of 1200px, and each column within the container is given relative positioning / min-height of 100%.

The fixed height is necessary to ensure that the background-image linear gradient always coincides with the correct calculated row height. Screen width luckily does not affect the background-image gradient, so it only needs to be calculated once.

## WD-Generating-Coordinates

The coordinates for each entry are generated based on the start/end time of each entry.

### **a) : convert the start/end time of each entry into minutes.**

For example, if an entry starts at 9:30, it will be converted to 38, since 38 represents the number of 15 minute intervals from 12:00AM

```javascript
const startMinutes = start.getHours() * 4 + Math.floor(start.getMinutes() / 15)
const endMinutes = end.getHours() * 4 + Math.floor(end.getMinutes() / 15)
const height = endMinutes - startMinutes
const total = startMinutes + height
```

### **b) : determine whether an entry extends beyond a day by comparing the start/end day/week/year of entry**

**Coordinates:**

* Entry extends beyond a day:
  * allDay: true,
  * x: start.getDay() (day of the week),
  * x2: end.getDay() (day of the week),

* Entry does not extend beyond a day:
  * allDay: false,
  * x: start.getDay(),  (column of the day)
  * y: startMinutes,    (first row of entry)
  * h: height,          (total number of rows)
  * e: total,           (last row of entry)

## WD-Setup-Positioning

**Take note of the following:**
Each entry is positioned absolutely within its column. The top & height properties are calculated based on the coordinates calculated in step 2.

### **a) Calculate top & height properties for boxes inline-syling.**

```javascript
const top = (y * 12.5) + 'px'
const height = (h * 12.5) + 'px'
```

### **b) Provide the entry with a slew of data attributes that will be used for repositioning/collision handling after drag/resize events.**

**Important! From this point on I will be referring to entries as boxes.**

**Data Attributes**:

* Entries that start and end on the same day:
  * dataIdx: boxes are sorted by their y coordinates (start hour/min) before they are assigned for DOM placement. This attribute is necessary for collision handling.
  * dataId: the id of the entry that the box represents.
  * dataCol: the column that the box is placed in. (day of week)
  * data-start-time: starting row of the box (y).
  * data-time-intervalas: height of the box (h).
  * data-end-time: ending row of the box (e).
  * data-box-category: the category of the entry that the box represents. (used for color coding).

* Entries that start and end on different days (allDay):
  * dataIdx: same as above.
  * dataId: same as above.
  * data-start: x (day of week event starts).
  * data-end: x2 (day of week event ends).
  * data-box-category: same as above.

### **c) Define system to calculate the left & width properties of each box.**

This process is relatively simple for entries that start and end on different days since their position is static.

For entries that are not allDay, things begin to get a little more complicated at this very point.

Calculating collisions is a crucial part of this process and the whole reason why I had to create this custom grid system in the first place.

When it comes to collision handling, with a drag system that allows for essentially inifinte entries, four things become very important:

i.) The order in which the boxes are placed in the DOM.

ii.) The z-index of each box.

iii.) The left positional property of each box.

IV.) the width positional property of each box.

"i.)" and "ii.)" are both relatively simple to solve. The boxes are sorted by their y coordinates (start hour/min) before they are even given data attributes or classes for that matter. To understand why this is important, check out the screenshots below for an example of what not sorting by start time can lead to.

[sorted by start time (y)](https://ibb.co/gjm5fN9)

[not sorted](https://ibb.co/sjhGnHQ)

Once the boxes are sorted by their y coordinates, they are given a z-index value based on their index in the sorted array to further ensure that the boxes are placed in the correct order in the DOM.

**"iii.)" and "IV.)" are a little more complicated.**

By default, the left and width properties are as follows:

* (width of column - small offset) * (percentage amount to offset from column +/- small offset)

```css
left: calc((100% - 4px) * 0 + 0px);
width: calc((100% - 4px) * 1 - 0px);
```

### **d) Basic Example**

**Now lets take a look at a basic collision and how to handle it:**

Box 1: 9:00AM - 10:00AM

Box 2: 9:30AM - 10:30AM

The first box, Box 1, will keep its default left & width properties in which it inherits the full width of the column and has zero left offset.

The second box, Box 2, will need to be offset from the left by a percentage value of  lets say 0.25 (25%).

In order to prevent the second box from overlapping with adjacent columns or from going off the screen, it's width will need to be reduced by a percentage value as well.

Normally, the width of the second box will be reduced by (100 - left offset) or 75% in this case.

```css
left: calc((100% - 4px) * 0.25);
width: calc((100% - 4px) * 0.75);
```

This works fine for most cases, but when boxes really begin to stack up, it helps to reduce the width of boxes so that there is some horizontal space between them. This allows boxes behind other boxes to be selected in between the crevices of the boxes that are on top of them.

Currently, there are 15 different pairs of left & width properties that a box can inherit. To see the full list of potential property values, check out the @dragutils.js file @function setBoxWidthWeek.

The section below will explain how these values are assigned.

## **WD-Administer-Positioning**

### **a) Determine whether or not a collision has occurred**

Note that this is not necessary if only one box is present in the column.
Collision detection will only occur if there are two or more boxes in the column.
./src/factory/entries.js (@function checkForCollision())

```javascript

const arr = [];
let collisions = new Set();

// push the y & e coordinates of each box into an array
for (const box of bxs) {
  arr.push([box.coordinates.y, box.coordinates.e]);
}

// populate the collisions set with boxes that interset with each other either at their start (y) or end (e) coordinates
for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    if (arr[i][1] > arr[j][0] && arr[i][0] < arr[j][1]) {
      collisions.add(bxs[i]);
      collisions.add(bxs[j]);
    }
  }
}

// sort the collisions set by their y coordinates (start hour/min)
// the reasoning for this is explained in the "a.)" section above
return [...collisions].sort((a, b) => {
  let diff = +a.coordinates.y - +b.coordinates.y;
  if (diff === 0) {
    return +a.coordinates.e - +b.coordinates.e;
  } else {
    return diff;
  }
})
```

### b.) assign the left & width properties of each box

./src/utilities/dragutils.js (@function handleOverlap())

```javascript
const collisions = checkForCollision(bxs);

for (let i = 0; i < collisions.length; i++) {
  const box = document.querySelector(`[data-id="${collisions[i].id}"]`);
  let idx = i;
  // handle instance where there are more than 15 boxes in a column.
  if (i >= 15) { i -= 14; } 

  // assign identifier
  box.setAttribute("class", `box box-${i + 1}`)
  // call @setBoxWidthDay() or @setBoxWidthWeek() 
  // this assigns the left & width properties based on given identifier
  view === "day" ? setBoxWidthDay(box, idx) : setBoxWidthWeek(box, idx);
}
```

./src/utilities/dragutils.js (@function setBoxWidthDay/Week())

setBoxWidthDay() && setBoxWidthWeek() assign the left & width properties of each box.

They are separated because the left & width properties are different for the day/week view.

I've also opted to hard code the left & width properties because there really isn't a discernable pattern to getting them right... at least not one that I could figure out.

```javascript
function setBoxWidthDay(box, prepend, dataidx) {
  const attr = box.getAttribute(dataidx);
  switch (attr) {
    case `${prepend}one`:
      box.style.left = 'calc((100% - 0px) * 0 + 0px)';
      box.style.width = "calc((100% - 4px) * 1)"
      break;
    case `${prepend}two`:
      box.style.left = "calc((100% - 0px) * 0.15 + 0px)"
      box.style.width = "calc((100% - 4px) * 0.85)";
      break;
    case `${prepend}three`:
      box.style.left = "calc((100% - 0px) * 0.30 + 0px)"
      box.style.width = "calc((100% - 4px) * 0.70)";
      break;
    // etc...
    default:
      break;
  }
}
```

## **WD-DragEngine**

The biggest detail to note about the drag engine is that it does not use javascripts drag & drop API. Another key detail: the drag engine will treat the event as a click until 3px of movement is detected. Only until 3px of movement occurs will the actual drag process begin.

### a) Setup for a potential drag event

**Setup process:**

1.) The user clicks and holds down on a box.
2.) Listeners are added to the document to listen for mousemove and mouseup events.
3.) Starting positions of the box are created to handle instances where the box is moved around the grid and then returned to its original position.

```javascript
const startTop = +box.style.top.split("px")[0]
const boxHeight = +box.style.height.split("px")[0]
```

4.) Variables that contain the original mouse positions are set (x & y), these are not subject to change. originalColumn will also not change, currentColumn will change if the box moves to a new column. movedY & movedX will track the mouse movements for the below flag.

```javascript
let startCursorY = e.pageY - grid.offsetTop;
let startCursorX = e.pageX
const originalColumn = col.getAttribute("data-column-index");
let currentColumn = col.getAttribute("data-column-index");
let [movedY, movedX] = [null, null]
```

5.) A flag called "hasStyles" is created and set to false. If the below variables track movement beyond 3px either vertically or horizontally at any point, the flag will be set to true and a clone of the box will be appended to the DOM. The original box is then given .5 opacity and the document body's cursor is set to "move". The cloned box will now follow the mouse movements in intervals of 12.5px vertically, and between columns if in week view.

```javascript
// determine if dragging should begin.
sX = Math.abs(e.clientX - startCursorX);
sY = Math.abs(e.clientY - tempstartY);
if (!hasStyles) {
  if (sX > 3 || sY > 3) {
    hasStyles = true;
    document.body.style.cursor = "move";
    if (box.classList.contains("box-ontop")) {
      boxhasOnTop = true;
      resetStyleOnClick("week", box);
    }
    box.classList.add("box-dragging")
    createTemporaryBox(box, col, boxhasOnTop, "week")
    sX = 0;
    sY = 0;
  }
}
```

6.) If dragging is not registered and the user has already released the mouse, the mouseup function will be called. Otherwise, horizontal / vertical tracking will begin below.

**Vertical Movement:**

```javascript
// Tracking vertical movement
// get header offset (offset between the fixed app header and the top of the grid wrapper)
const headerOffset = grid.offsetTop;

// track the offset between the header and the mouse
const currentCursorY = e.pageY - headerOffset;

// calculate the difference between the original mouse position and the current mouse position
let newOffsetY = currentCursorY - startCursorY;

// calculate the new top position of the cloned box
// ensure that the new top position is an increment of 12.5px (15 minutes)
let newTop = Math.round((newOffsetY + startTop) / 12.5) * 12.5;

// ensure that the new top position does not exceed the top or bottom of column
if (newTop < 0 || currentCursorY < 0) {
  newTop = 0
  return;
} else if (newTop + boxHeight > 1188) {
  return;
}

// set the cloned box's top position
box.style.top = `${newTop}px`;
```

**Horizontal Movement, Week view only:**

The following is a bit more involved than the vertical movement because the user can move a box to a different column.

```javascript
// create variables to hold the following:
// 1.) track the offset between original mouse position and current mouse 
//     position to determine whether the user is moving left or right/
// 2.) current e.pageX
// 3.) offset between startCursorX and currentCursorX
// 4.) the previous column's left position (or null if there is no prev column)
// 5.) the next column's left position (or null if there is no next column)

const direction = e.pageX - startCursorX > 0 ? "right" : "left"
const currentCursorX = e.pageX
let newOffsetX = startCursorX - currentCursorX

// @function getcol() returns the column dom element at given index
let leftColX = currentColumn - 1 >= 0 ? parseInt(getCol(currentColumn - 1).getBoundingClientRect().right) : null;
let rightColX = currentColumn - 1 >= 0 ? parseInt(getCol(currentColumn + 1).getBoundingClientRect().left) : null;

// if the direction is right and the next column is not null, append the cloned box to the next column and update the current column variable
if (direction === "right" && rightColX !== null) {
  if (e.pageX >= rightColX) {
    getcol(+currentColumn + 1).appendChild(box)
    startCursorX = e.pageX
    currentColumn = +currentColumn + 1
    box.setAttribute("data-box-col", +currentColumn)
  }
}

// left movement follows the same process as the right movement, but using subtracting instead of adding
```

7.) User releases mouse, Mouseup function is called where two distinct actions can occur depending on whether the user has initiated dragging or not.

```javascript
// query select the cloned box and define it as a temporary box
const tempbox = document.querySelector(".temporary-box")

// if there is no temporary box, the user never initiated dragging, treat as click event and open the box's context menu where the user can choose to open the box's edit form or delete the box.
// This process is detailed in the @Form_Handling Section

if (tempbox === null) {
  // check @Form_Handling for more details
} else {

  // remove cloned box
  tempbox.remove();

  // function to format the box's time attribute
  setBoxTimeAttributes(box, "day or week");

  // use formatted time attribute to calc the new start/end times
  const time = calcTime(
    +box.getAttribute("data-start-time"),
    +box.getAttribute("data-time-intervals")
  );

  // update the start/end times useing calculation above
  box.setAttribute("data-time", time);
  box.children[1].children[0].textContent = time;

  // update the store with the new coordinates
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

  // This is where the overlap handling comes into play detailed in the @Administer-Positioning section
  let droppedCol = +box.getAttribute("data-box-col");
  if (boxes.getBoxesByColumn(droppedCol).length > 1) {
    handleOverlap(droppedCol, "week", boxes)
  } else {
    box.setAttribute("box-idx", "box-one")
  }

  // set documents cursor to normal and tells the store that other events can now be registered
  setStylingForEvent("dragend", main, store)

  // remove event listeners
  document.removeEventListener("mousemove", mousemove)
  document.removeEventListener("mouseup", mouseup)
}
```

## Month-Drag

### I) [MV-Setup-Positioning](#mv-setup-positioning)

### II) [MV-Administer-Positioning](#mv-administer-positioning)

### III) [MV-DragEngine](#mv-dragengine)

### IV) [MV-Grouping](#mv-grouping)

The Month Drag/Grid system follows a fairly similar procedure to the Week/Day drag system but is just different enough to warrant its own section entirely.

Some of the functions are re-used I will not be going into too much detail on them.

This particular view is very easy to underestimate. No it is not overly difficult to conceptualize, and getting a basic version running is relatively easy.

The money here is 100% in the details.
The details are what make this view so difficult to implement.
The details are what make this view so difficult to maintain.
The details are what make this view so difficult to scale.

Yes, I am aware I missed a few details myself, namely the ability to resize boxes horizontally across cells / have the length of boxes be represented across multiple days.

Until about a month ago, believe it or not, I did have this kind of feature implemented for a few days before removing it.Perhaps I will revisit it in the future but I'm really not sold on the idea... I digress.

I will cover how I solved the problems below but I advise you to self council before going further. (How you would solve/implement the features listed below? Do you immediately see the issue?)

* A dynamic grid with 35-42 cells depending on the month.
* Cells can hold up to 6 boxes at a time.
* If more than 6 boxes are in a cell, remove all boxes from the cell and populate the cell with div indicating the number of events on that day.
  * Clicking on the div will open a modal with all of the boxes in that cell.
  * The modal should essentially be a larger cloned version of its respective cell.
  * Boxes in the modal should be able to be dragged out of the modal and into the calendar.
  * They should also be able to be dragged back into the modal.
* Drag boxes to any cell, if the cell is full, group all boxes in that cell and create the modal described above.
* Boxes must be clickable AND draggable.
* Click on empty cell to open form on that day.
* Responsive design : boxes have inline styles, they must rely on some resize event for recalculation. System should only ever fire once per designated change and should be garbage collected if month is not in view.
* No more than 4 active listeners at any given time.

## MV-Setup-Positioning

Unlike the day & week view, the monthview grid does not have a fixed height, nor does it have a fixed number of rows. To accommodate this, this grid system uses a combination of flexbox, absolute positioned elements, and a query system attached to window resize events that will help recalculate the inline styles of boxes.

Lets get the elephant in the room out of the way first. (the query system?)

One thing that my grid systems all have in common is an abundance of inline styles. These are great for handling elements with positions that are always changing, and changing in large amounts (i.e. dragging an element from the first of the month to the 31st).
Unfortunately, they pose a real problem for responsive design. The reason for a query system in this view and not the others is because the month view has zero fixed positioning.

**Query System**
The idea is simple. Create a class that sets a flag to true if a certain width/height threshold limit has been hit, and return an array of height/width values based on the value of the flag.

Anytime the window is resized, the query system will be notified. If the previous flag value is different from the current flag value, the query system will proceed to update the inline styles of all boxes in each cell. (more on this later).

Note that the callback to run the query is attached to the window which is delegated through a debounce (100ms). Also, the window does not actually inherit the query system from the monthview function itself. Instead, the query system is passed to the global store and is attached to the window from @setViews() where it is also removed when the monthview is no longer in view.

```javascript
class MonthBoxQuery {
  constructor(flag) {
    this.flag = flag;
    this.tops = [16, 20];
    this.heights = [14, 18];
  }

  updateFlag() {
    this.flag = window.innerWidth <= 530 || window.innerHeight <= 470;
  }

  getFlag() {
    return this.flag;
  }

  getTop() {
    const [a, b] = this.tops;
    return this.flag ? a : b;
  }

  getHeight() {
    const [a, b] = this.heights;
    return this.flag ? a : b;
  }

  getPrevTop(top) {
    const [a, b] = this.tops;
    return top === a ? b : a;
  }
}
```

**Cells & Boxes**
With that out of the way, lets talk about the cells and boxes themselves.

The cells are as bare bones as I could make them. Each cell has a header with a day that when clicked will switch to the day view of that particular day. The rest of the cell is a container with relative positioning. The container is where all of the boxes will be placed.

The reasoning behind the relative positioning is to easily allow for boxes to be thrown from one cell to another (drag & drop). Upon the initiation of drag, a clone of the box is created and appended to the actual grid container itself. The box then simply follows the mouse cursor (more on this in MV-DragEngine).

## MV-Administer-Positioning

## MV-DragEngine

The process looks exaclty like the day/weekview in the very beginning.

## MV-grouping

Work in progress.

## Form-Drag

The Form Drag system follows a fairly simple procedure. (Nothing like the month/week/day views).

If you weren't aware that the form even had drag capabilities, try it out for yourself by grabbing on to the form's header (space adjacent to close form button).

## Resize_Systems

Work in progress.

## Date_Handling

Work in progress.

## Time_Handling

Work in progress.

## Form_Handling

Work in progress.

## Views

Work in progress.

## Rendering

Work in progress.

## Storage

Work in progress.

## Project_Goals

**This is a front end recreation of the google calendar app in its entirety** (aside from google api / third party resources).

At the moment it works using local storage but there are options to backup data and load previously saved data using json.

I've implemented several new features to improve the user experience but overall tried to stay as true as possible to the original application.

* These changes include but are not limited to :
  * fully responsive up to 250px.
  * Gzip: 40kb
  * **THEMES:**
    * Dark
    * High Contrast
    * Light
    * (coming soon) color blind options
    * some colors are changed here and there to accommodate any accessibility concerns.
  * Keyboard Shortcuts differ slightly from the original app. Use "?" or "/" to open the shortcuts menu when in app (23 in total).
  * **New Keyboard Shortcuts:**
    * toggle sidebar open/closed.
    * open event and category forms.
    * Datepicker: set date to next&prev month/week.
    * Datepicker: set date to next&prev days.
  * **Datepicker now has:**
    * monthpicker
    * yearpicker
    * days with events are highlighted
    * current week highlighted in weekview
  * Sidebar converts to fixed positioning under 840px and main content inherits the full page width.
  * Turn animations/transitions on and off.
  * animation times adjusted.
  * More details provided for when events start/end/ended **(see Jan 20th notes).**
  * Sorting animations for month/week/day view events.
  * Dayview header details how many entries are starting/ending on that day and the timeframes of first - last entry.
  * Yearview will automatically scroll to current selected month if not in view.
  * Yearview days with events are highlighted.
  * Dayview will automatically scroll to the top of first event if it is not in view.
  * Throttling optimized to always ensure content is visible during any keydown action.
  * **Download/Upload:**
    * all calendar events/categories/settings can be downloaded & uploaded.
  * Monthview cells are highlighted when dragged over.
  * resize bar for week & day events.
  * 42 color options for categories.
  * Move all events from one category to another
  * Single page. No page refreshes, no load times.
  * Aggressive memory handling.
  * At MAX there will be 4 active event listeners.
  * Statistics page coming soon.
  
* **Lighthouse**
  * First contentful paint : 200ms.
  * Time to interactive : 200ms.
  * Speed index : 200ms.
  * Total blocking time : 0 seconds (no database / third party resources).
  * Score : 100% (performance, accessibility, best practices, seo).
  
## Journal

### Jan 16, 2023

* **build list/agenda view prototype -- [screenshot](https://ibb.co/dPkFs8m)**.
* Category change name bug fix.
* Mobile query clean up.

### Jan 17, 2023

* Weekview now has max-width and horizontal scroll below 560px.
* improve list/agenda view.
* timepicker staging (form).
* improved context menus.
* links now crawable.
* improved keyframes.

### Jan 20, 2023

* Entry popup modlas will now provide the following details :
  * If the entry has ended, display the time since it ended.
  * If the entry ends today and has started, display a countdown until complete.
  * If the entry ends today and hasn't started, display the length in hours/minutes.
  * If the entry ended yesterday, display "ended yesterday".
  * If the entry is yet to start and is not in the past, display how long until it is scheduled to start.
* Improve collisions [screenshot](https://ibb.co/CwN951Z)

### Jan 23, 2023

* Click on datepicker title to open a month/year picker.
  * header datepicker [screenshot](https://ibb.co/qNXBXJ2)
  * sidebar datepicker [screenshot](https://ibb.co/nMNpjmf)
  * form datepicker [screenshot](https://ibb.co/kqTH6rQ)
* Added date search component [screenshot](https://ibb.co/ZMQbjgG)
* New category options (turn all others off/on) || edit [screenshot](https://ibb.co/NWrkmww)
* Added dynamic form drag
  * shrinks and grows if dragged away/into corners
  * [screenshot](https://ibb.co/PghdtkS)
* All modals are now dynamic (mobile support)
  * Will open to left if no space on right of target & viceversa
  * Will open above if no space below target & viceversa
  * [screenshot](https://ibb.co/Ln75k7W)
* Added switch to turn animations/transitions on and off in settings
* Added top modal compartment for dayview (events that span longer than the calendar day) [screenshot](https://ibb.co/Byq1vJb)
* Added floating eye icon to open/close the header for the week and day view (mobile support) [screenshot](https://ibb.co/JrpDj4X)

### Jan 24, 2023

* Prepare Production build & implement linter.
* Start trimming bundle. [screenshot](https://ibb.co/85fSgN6)
