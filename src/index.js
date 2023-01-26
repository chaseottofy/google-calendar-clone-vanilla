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
// localStorage.clear();
setAppDefaults(context, store);
const deleteAfter = document.createElement("div");
deleteAfter.setAttribute("style", "position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;width:300px;height:80px;z-Index:4000;background:rgba(0,0,0,.6);text-align: center;line-height: 80px; color: white; font-size: 25px;")
deleteAfter.textContent = "sorted by h (height)"
// deleteAfter.innerHTML = `
//   <div style="position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;width:300px;height:240px;z-Index:4000;background:var(--black1);>asdf</div>
// `
document.body.prepend(deleteAfter)
renderViews(context, datepickerContext, store);


// console.log(store.getEntries())