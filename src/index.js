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
// NOTES;
// * finish settings
// * finish privacy,terms,notes

// FIX;
// * validate .json files
// * set toast to be removed on window focus
// * linter
// * 
/*
[
  "setDateDefaults",
  "setSchemaDefaults",
  "setDefaults",
  "getAllMethodNames",
  "getColorScheme",
  "setColorScheme",
  "setSidebarState",
  "toggleSidebarState",
  "getComponent",
  "setComponent",
  "getSidebarState",
  "setDay",
  "setMonth",
  "setYear",
  "setDate",
  "setDateSelected",
  "setPrevDay",
  "setPrevWeek",
  "setPrevMonth",
  "setPrevYear",
  "setNextDay",
  "setNextWeek",
  "setNextMonth",
  "setNextYear",
  "getGmt",
  "getDateSelected",
  "getDay",
  "getMonth",
  "getYear",
  "getDate",
  "getToday",
  "getWeek",
  "getWeekday",
  "getWeekArray",
  "getWeekRange",
  "getWeekNumber",
  "getMonthName",
  "getDaysInMonth",
  "getMonthArrayStartDay",
  "getMonthArrayStart",
  "getMonthArrayEndDay",
  "getMonthArrayEnd",
  "getMonthArray",
  "isToday"
]
*/

setAppDefaults(context, store);
renderViews(context, datepickerContext, store);