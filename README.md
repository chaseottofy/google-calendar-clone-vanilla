# About

## contact: ottofy@zohomail.com

**Project is still in development.**
I'll be periodically updating this documentation and would like to have it done within three weeks (mid february). Note that what I've provided in ./dist is purely for easy viewing. The production build will be compressed.

**Viewing**
View the app through screenshots (link below), or simply download the repo and open `./dist/testbundle.html` in your browser (or any live server extension). I will host shortly.

**[SCREENSHOTS](https://ibb.co/album/fQrm1F)**

**This is a front end recreation of the google calendar app in its entirety** (aside from google api / third party resources).

At the moment it works using local storage but there are options to backup data and load previously saved data using json.

I've implemented several new features to improve the user experience but overall tried to stay as true as possible to the original application.

* These changes include but are not limited to :
  * fully responsive up to 250px.
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
  * animation times adjusted.
    * option to turn off animations alltogether coming shortly.
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

## Cloning this repo

### `git clone`

### `npm install`

## Available Scripts

### `npm run build`

Builds the app and **necessary** resources in the `dist` folder.

### `npm run dev`

Starts the webpack development server on `localhost:3000`.

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
* Add date search component [screenshot](https://ibb.co/ZMQbjgG)
* New category options (turn all others off/on) || edit [screenshot](https://ibb.co/NWrkmww)
* Add dynamic form drag
  * shrinks and grows if dragged away/into corners
  * [screenshot](https://ibb.co/PghdtkS)
* All modals are now dynamic (mobile support)
  * Will open to left if no space on right of target & viceversa
  * Will open above if no space below target & viceversa
  * [screenshot](https://ibb.co/Ln75k7W)
