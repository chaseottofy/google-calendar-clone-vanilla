import setHeader from "../components/menus/header"
import setYearView from "../components/views/yearview"
import setMonthView from "../components/views/monthview"
import setWeekView from "../components/views/weekview"
import setDayView from "../components/views/dayview"
import setListView from "../components/views/listviewtwo"
// import setListView from "../components/views/listview"

const yearComponent = document.querySelector(".yearview")
const monthComponent = document.querySelector(".monthview")
const weekComponent = document.querySelector(".weekview")
const dayComponent = document.querySelector(".dayview")
const listComponent = document.querySelector(".listview")


/**
 * 
 * @param {string} component 
 * @param {object} context 
 * @param {object} store 
 * @param {object} datepickerContext 
 * @desc  hides all views and renders @component passed in
 * 
 */

let previousview = "month";
export default function setViews(component, context, store, datepickerContext) {
  function hideViews() {
    const views = [
      yearComponent, 
      monthComponent, 
      weekComponent, 
      dayComponent,
      listComponent
    ];
    // only the month view relies on a resize listener
    // more info provided @readme > monthview > box queries
    views.forEach((view) => {
      view.classList.add("hide-view")
      if (view !== monthComponent) {
        window.removeEventListener("resize", store.getResizeHandle("month"))
      }
    })
  }

  function initView(component) {
    switch (component) {
      case "day":
        context.setComponent(component);
        setHeader(context, component);
        setDayView(context, store, datepickerContext);
        dayComponent.classList.remove("hide-view");
        break;
      case "week":
        context.setComponent(component);
        setHeader(context, component);
        setWeekView(context, store, datepickerContext);
        weekComponent.classList.remove("hide-view");
        break;
      case "month":
        context.setComponent(component);
        setHeader(context, component);
        setMonthView(context, store, datepickerContext);
        monthComponent.classList.remove("hide-view");
        window.addEventListener("resize", store.getResizeHandle("month"))
        break;
      case "year":
        context.setComponent(component);
        setHeader(context, component);
        setYearView(context, store, datepickerContext);
        yearComponent.classList.remove("hide-view");
        break;
      case "list":
        context.setComponent(component);
        setHeader(context, component, store);
        setListView(context, store, datepickerContext);
        listComponent.classList.remove("hide-view");
        break;
      default:
        context.setComponent("month");
        setHeader(context, "month");
        setMonthView(context, store, datepickerContext);
        monthComponent.classList.remove("hide-view");
        break;
    }
  }

  hideViews();
  document.title = context.getMonthName();
  initView(component);
}