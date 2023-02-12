import context, { datepickerContext } from "./context/appContext";
import store from "./context/store";
import setAppDefaults from "./config/appDefaults";
import renderViews from "./config/renderViews";

// import generateRandomEvents from "./utilities/testing"
// store.setStoreForTesting(generateRandomEvents(1000));

/*!*************************************!*\
// (CSS) 
/*!*************************************!*/

// <html>
import "./styles/root.css";
// </html>

// <header>
import "./styles/header.css";
// </header>

// <main>
import "./styles/containers.css";
import "./styles/yearview.css";
import "./styles/monthview.css";
import "./styles/weekview.css";
import "./styles/dayview.css";
import "./styles/listview.css";
import "./styles/sidebar.css";
import "./styles/sbdatepicker.css";
// </main>

// <aside>
import "./styles/aside/datepicker.css";
import "./styles/aside/toast.css";
import "./styles/aside/goto.css";
import "./styles/aside/toggleForm.css";
import "./styles/aside/sidebarSubMenu.css";
import "./styles/aside/changeViewModule.css";
import "./styles/aside/editCategoryForm.css";
import "./styles/aside/form.css";
import "./styles/aside/timepicker.css";
import "./styles/aside/deleteCategoryPopup.css";
import "./styles/aside/entryOptions.css";
import "./styles/aside/info.css";
import "./styles/aside/shortcuts.css";
// </aside>

/*!*************************************!*/
// FIX;
// hide sidebar datepicker after sidebar has been closed
// invalid date mobile
// stats sidebar
// drag mobile
// keyframe lag
// cursor issue, don't remember what it was
// * validate .json files
setAppDefaults(context, store);
renderViews(context, datepickerContext, store);
// window.addEventListener("touchmove", e => {
//   console.log("touchmove", e.target.getAttribute("class"));
// })
// for testing::
// window.addEventListener("mouseup", () => {
//   for (let i = 0; i < document.all.length; i++) {
//     const element = document.all[i];
//     if (element.onmousedown) {
//       console.log("onmousedown", element.getAttribute("class"));
//     }
//     if (element.onkeydown) {
//       console.log("onkeydown", element.getAttribute("class"));
//     }
//     if (element.onclick) {
//       console.log("onclick", element.getAttribute("class"));
//     }
//   }
// });