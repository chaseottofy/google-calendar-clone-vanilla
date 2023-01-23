# quick about

## contact: ottofy@zohomail.com

**Project is still in development.**
I'll be periodically updating this documentation and would like to have it done within three weeks (mid february). Note that what I've provided in ./dist is purely for easy viewing. The production build will be compressed.

**Viewing**
View the app through screenshots (link below), or simply download the repo and open `./dist/testbundle.html` in your browser (or any live server extension). I will host shortly.

**[SCREENSHOTS](https://ibb.co/album/fQrm1F)**

**This is a front end recreation of the google calendar app in its entirety** (aside from google api / third party resources).

At the moment it works using local storage but there are options to backup data and load previously saved data using json.

* I've included several features that are not in the original app to improve the user experience. These include but are not limited to :
  * header content still visible under 840px (app is viable on mobile)
  * dark theme
  * high contrast
  * keyboard shortcuts are available for most actions but they do differ from the original app. Use "?" or "/" to open the shortcuts menu (23 in total).
  * month date picker
  * year date picker
  * datepicker highlights current week if in week view
  * datepicker highlights day if it has events
  * download calendar as json file & upload calendar from json file
  * year view days with events are highlighted
  * monthview cells are highlighted when dragged over
  * move all events from one category to another
  * entire app is a single page, no page refreshes, no load times.
  * first contentful paint : 200ms
  * time to interactive : 200ms
  * speed index : 200ms
  * total blocking time : 0 seconds (no database / third party resources)
  * lighthouse : 100% (performance, accessibility, best practices, seo)

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
