## Cloning this repo

### `git clone`

### `npm install`

## Available Scripts

### `npm run build`

Builds the app and **necessary** resources in the `dist` folder.

### `npm run dev`

Starts the webpack development server on `localhost:3000`.

## contact: ottofy@zohomail.com

### Jan 15, 2023

**Project is still in development.**
I'll be periodically updating the documentation and would like to have it done within three weeks. Note that what I've provided in ./dist is purely for development/viewing. The production build will be a fraction of the size.

**Viewing**
For now, you can view the app through screenshots (link below), or simply download the repo and open `./dist/testbundle.html` in your browser (or any live server extension). I will host on github pages shortly.

**[SCREENSHOTS](https://ibb.co/album/fQrm1F)** (<https://ibb.co/album/fQrm1F>)

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