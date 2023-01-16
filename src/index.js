import context, { datepickerContext } from "./context/appContext"
import store from "./context/store"
import setAppDefaults from "./config/appDefaults"
import renderViews from "./config/renderViews"
// import generateRandomEvents from "./utilities/testing"
// store.setStoreForTesting(generateRandomEvents())
/*!*************************************!*\
// (CSS) 
/*!*************************************!*/
// css variables and reset
import "./styles/root.css";
// main app header -- fixed to top of app
import "./styles/header.css"
// (sidebar, yearview, monthview, weekview, dayview, listview)
import "./styles/containers.css"
import "./styles/yearview.css"
import "./styles/monthview.css"
import "./styles/weekview.css"
import "./styles/dayview.css"
import "./styles/listview.css"
import "./styles/sidebar.css"
import "./styles/sbdatepicker.css"
// popup / modals
import "./styles/aside/toast.css"
import "./styles/aside/goto.css"
import "./styles/aside/toggleForm.css"
import "./styles/aside/sidebarSubMenu.css"
import "./styles/aside/changeViewModule.css"
import "./styles/aside/editCategoryForm.css"

import "./styles/aside/form.css"
import "./styles/datepicker.css"
import "./styles/aside/popup.css"
import "./styles/aside/entryOptions.css"
import "./styles/aside/info.css"
import "./styles/aside/shortcuts.css"
/*!*************************************!*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// NOTES;
// * finish settings
// * finish privacy,terms,notes
// * do a write up on all of the features that I've either added or changed
// 

// FIX;
// * clicking on item in more modal and then escaping out of form causes error
// * validate .json files
// * top modal for day and week view
// * numbers monospace in form / table
// * set min width for week view
// * redo listview
// * time picker form
// * only show times from period of day in sidebar
// * aria labels and links not crawable
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// localStorage.clear()
setAppDefaults(context, store);
renderViews(context, datepickerContext, store);
console.log()
