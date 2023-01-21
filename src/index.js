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
import "./styles/aside/toast.css"
import "./styles/aside/goto.css"
import "./styles/aside/toggleForm.css"
import "./styles/aside/sidebarSubMenu.css"
import "./styles/aside/changeViewModule.css"
import "./styles/aside/editCategoryForm.css"
import "./styles/aside/form.css"
import "./styles/aside/timepicker.css";
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

// FIX;
// * set onclick to null when not in use
// * validate .json files
// * top modal for day view
// * set toast to be removed on window focus
// localStorage.clear()
setAppDefaults(context, store);
renderViews(context, datepickerContext, store);