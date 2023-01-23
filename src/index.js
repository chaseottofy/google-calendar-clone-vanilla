import context, { datepickerContext } from "./context/appContext"
import store from "./context/store"
import setAppDefaults from "./config/appDefaults"
import renderViews from "./config/renderViews"
/*!*************************************!*\
// (CSS) 
/*!*************************************!*/
// css variables and reset
import "./styles/root.css";
import "./styles/header.css"

// <main>
import "./styles/containers.css"
import "./styles/yearview.css"
import "./styles/monthview.css"
import "./styles/weekview.css"
import "./styles/dayview.css"
import "./styles/listview.css"
import "./styles/sidebar.css"
import "./styles/sbdatepicker.css"
// </main>

// popup / modals
// <aside>
import "./styles/aside/datepicker.css"
import "./styles/aside/toast.css"
import "./styles/aside/goto.css"
import "./styles/aside/toggleForm.css"
import "./styles/aside/sidebarSubMenu.css"
import "./styles/aside/changeViewModule.css"
import "./styles/aside/editCategoryForm.css"
import "./styles/aside/form.css"
import "./styles/aside/timepicker.css";
import "./styles/aside/deleteCategoryPopup.css"
import "./styles/aside/entryOptions.css"
import "./styles/aside/info.css"
import "./styles/aside/shortcuts.css"
// </aside>
/*!*************************************!*/

/*
  about
* This is a front end recreation of the google calendar app in its entirety (aside from google api / third party resources).
* At the moment it works using local storage but there are options to backup data and load previous saved data using json.
* I've included several features that are not in the original app to improve the user experience. These include but are not limited to :
  * header content still visible under 840px (app is viable on mobile)
  * dark theme
  * high contrast theme
  * Keyboard shortcuts are available for most actions but they do differ from the original app. Use "?" or "/" to open the shortcuts menu (23 in total).
  * month date picker
  * year date picker
  * datepicker highlights current week if in week view
  * datepicker highlights day if it has events
  * download calendar as json file & upload calendar from json file
  * year view days with events are highlighted
  * move all events from one category to another
  * entire app is a single page, no page refreshes, no load times.
  * first contentful paint : .2 seconds
  * time to interactive : .2 seconds
  * speed index : .2 seconds
  * total blocking time : 0 seconds (no database / third party resources)
  * lighthouse : 100% (performance, accessibility, best practices, seo)
* 
*/

// NOTES;
// * finish settings
// * finish privacy,terms,notes

// FIX;
// * validate .json files
// * set toast to be removed on window focus
// * linter
// * 
setAppDefaults(context, store);
renderViews(context, datepickerContext, store);