# Google Calendar Clone

## contact: ottofy@zohomail.com

**[LIVE PROJECT LINK](https://chaseottofy.github.io/google-calendar-clone-vanilla/)**

**[SCREENSHOTS](https://ibb.co/album/fQrm1F)**

## Documentation

Thank you for taking the time to check out this project!

**This Documentation is a work in progress.**

## Glossary

1. [Cloning](#cloning_this_repo)

2. [Drag_Systems](#drag_systems)
  
3. [Resize_Systems](#resize_systems)

4. [Date_Handling](#date_handling)

5. [Time_Handling](#time_handling)

6. [Overlay_System](#overlay_system)

7. [Views](#views)

8. [Rendering](#rendering)

9. [Storage](#storage)

10. [Project_Goals](#project_goals)

11. [Journal](#journal)

## Cloning_This_Repo

### `git clone`

### `cd google-calendar-clone-vanilla`

### `npm install`

## Available_Scripts

### `npm run build`

Builds the app and **necessary** resources in the `dist` folder.

### `npm run dev`

Starts the webpack development server on `localhost:3000`.

## Drag_Systems

### 1. [Week-Day-Drag](#week-day-drag)

#### 1.a [Generate-Coordinates](#generate-coordinates)

#### 1.b [Positioning-Setup](#positioning-setup)

#### 1.c [Administer-Positioning](#administer-positioning)

### 2. [Month-Drag](#month-drag)

### 3. [Form-Drag](#form-drag)

There exist four total drag systems throughout the app, three of which are completely different from one another.

### Week-Day-Drag

This particular grid system operates as a 24 hour clock, with each hour being divided into 4 15 minute intervals.

Each column has relative positioning and a fixed height of 1200px.

What makes this grid system particularly unique is the fact that each column does not have any rows. Instead, each column is a container for a series of divs (entries) that are positioned absolutely.

The visual representation of rows is created by the background image of each colunmn, in which a linear gradient is calculated as follows:

* Weekview:
  * background-size: calc(100% / 7) 4%;
    * (7 days in a week, 4% of the height of each column).
  * background-image: linear-gradient(to bottom, var(--mediumgrey1) 1%,transparent 0);
    * (1% of the height of each column).

* Dayview:
  * background-size: 100% 4%
    * (1 day, 4% of the height of each column).
  * background-image: linear-gradient(to bottom,var(--mediumgrey1) 1%,transparent 0)
    * (1% of the height of each column).

The parent container of the columns is given a fixed height of 1200px, and each column within the container is given relative positioning and a min-height of 100%. The fixed height is necessary to ensure that the background-image linear gradient always coincides with the correct calculated row height. Screen width luckily does not affect the background-image gradient, so it only needs to be calculated once.

#### Generate-Coordinates

The coordinates for each entry are generated based on the start/end time of each entry.

**Steps:**

**a.)**: convert the start/end time of each entry into minutes.

**b.)**: convert minutes into 15 minute intervals. For example, if an entry starts at 9:30, it will be converted to 38, since 38 represents the number of 15 minute intervals from 12:00AM.

```javascript
const startMinutes = start.getHours() * 4 + Math.floor(start.getMinutes() / 15)
const endMinutes = end.getHours() * 4 + Math.floor(end.getMinutes() / 15)
const height = endMinutes - startMinutes
const total = startMinutes + height
```

**c.)**: determine whether an entry extends beyond a day by comparing the start/end day/week/year of entry.

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

#### Positioning-Setup

**Steps**
a.) Calculate top & height properties for boxes inline-syling.
b.) Provide the entry with a slew of data attributes that will be used for repositioning/collision handling after drag/resize events.
c.) Define system to calculate the left & width properties of each box.
d.) Basic Example

**Take note of the following:**
Each entry is positioned absolutely within its column. The top & height properties are calculated based on the coordinates calculated in step 2.

**a.):**

```javascript
const top = (y * 12.5) + 'px'
const height = (h * 12.5) + 'px'
```

**b.):**

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

**c.):**

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

**d.):**
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

#### **Administer-Positioning:**

**Steps:**

a.) determine whether or not a collision has occurred.
b.) assign the left & width properties of each box.

**a.):**

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

**b.):**

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

### Month-Drag

### Form-Drag

## Resize_Systems

Work in progress.

## Date_Handling

Work in progress.

## Time_Handling

Work in progress.

## Overlay_System

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
