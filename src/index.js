import context, { datepickerContext } from "./context/appContext"
import store from "./context/store"
import setAppDefaults from "./config/appDefaults"
import renderViews from "./config/renderViews"
import generateRandomEvents from "./utilities/testing"

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
setAppDefaults(context, store);
/*
// store.setAllCategoryStatusExcept("default", false)
store.addNewCtg("seven", "#2C52BA")
store.addNewCtg("eight", "#2C52BA")
store.addNewCtg("nine", "#2C52BA")
store.addNewCtg("ten", "#2C52BA")
store.addNewCtg("eleven", "#2C52BA")
store.addNewCtg("twelve", "#2C52BA")
store.addNewCtg("thirteen", "#2C52BA")
store.addNewCtg("fourteen", "#2C52BA")
store.addNewCtg("fifteen", "#2C52BA")
store.addNewCtg("sixteen", "#2C52BA")
store.addNewCtg("seventeen", "#2C52BA")
*/

renderViews(context, datepickerContext, store);
// addNewCtg