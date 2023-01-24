import setViews from "./setViews";
import setDatepicker from "../components/menus/datepicker";
import setSidebarDatepicker from "../components/menus/sidebarDatepicker";
import handleSidebarCategories from "../components/menus/sidebarCategories";
import { getClosest, throttle } from "../utilities/helpers";
import setEntryForm from "../components/forms/entryForm";
import handleSidebarFooter from "../components/menus/sidebarFooter";
import handleShortCutsModal from "../components/menus/shortcutsModal";
import getSidebarSubMenu from "../components/menus/sidebarSubMenu";
import createGoTo from "../components/forms/goto";
import createCategoryForm from "../components/menus/editCategory";

const appBody = document.querySelector(".body");
const colorSchemeMeta = document.getElementsByName("color-scheme")[0];

const header = document.querySelector(".h__container");
const headerLogo = document.querySelector(".logo")

const toggleForm = document.querySelector(".toggle-form")
const sbToggleForm = document.querySelector(".sb-toggle-form-btn")
const sbToggleSubBtn = document.querySelector(".sb-data-btn")
const sbToggleThemeBtn = document.querySelector(".sb-theme-btn")
const formOverlay = document.querySelector(".form-overlay")
const form = document.querySelector(".entries__form")

const datepicker = document.querySelector(".datepicker")
const datepickeroverlay = document.querySelector(".datepicker-overlay")
const dateTimeWrapper = document.querySelector(".datetime-wrapper")

const selectElement = document.querySelector(".select__modal")
const selectOverlay = document.querySelector(".change-view--overlay")
const optionswrapper = document.querySelector(".change-view--wrapper")
const options = document.querySelectorAll(".view-option")

const sidebar = document.querySelector(".sidebar");

const viewsContainer = document.querySelector(".container__calendars")
const yearwrapper = document.querySelector(".yearview")
const monthwrapper = document.querySelector(".monthview")
const listviewBody = document.querySelector(".listview__body");

const collapsebtn = document.querySelector(".collapse-view")

export default function renderViews(context, datepickerContext, store) {
  function setColorScheme() {
    const darkicon = document.querySelector(".sbti-one")
    const lighticon = document.querySelector(".sbti-two")
    const contrasticon = document.querySelector(".sbti-three")

    const setlight = () => {
      context.setColorScheme("light")
      colorSchemeMeta.setAttribute("content", "light");
      appBody.classList.add("light-mode");
      appBody.classList.remove("contrast-mode")
      darkicon.classList.add("sb-theme-icon-hide")
      contrasticon.classList.add("sb-theme-icon-hide")
      lighticon.classList.remove("sb-theme-icon-hide")
    }

    const setdark = () => {
      context.setColorScheme("dark")
      colorSchemeMeta.setAttribute("content", "dark light");
      appBody.classList.remove("light-mode");
      appBody.classList.remove("contrast-mode")
      darkicon.classList.remove("sb-theme-icon-hide")
      contrasticon.classList.add("sb-theme-icon-hide")
      lighticon.classList.add("sb-theme-icon-hide")
    }

    const setcontrast = () => {
      context.setColorScheme("contrast")
      colorSchemeMeta.setAttribute("content", "dark");
      appBody.classList.remove("light-mode");
      appBody.classList.add("contrast-mode")
      contrasticon.classList.remove("sb-theme-icon-hide")
      darkicon.classList.add("sb-theme-icon-hide")
      lighticon.classList.add("sb-theme-icon-hide")
    }

    const currentScheme = context.getColorScheme()
    if (currentScheme === "light") {
      setdark()
    } else if (currentScheme === "dark") {
      setcontrast()
    } else {
      setlight()
    }
  }

  function fullRender(component) {
    setViews(component, context, store, datepickerContext);
  }

  function setInitialAttributes() {
    selectElement.setAttribute("data-value", `${context.getComponent().slice(0, 1).toUpperCase()}`)

    headerLogo.setAttribute("data-current-day-of-month", new Date().getDate())
  }

  function renderSidebarDatepicker() {
    if (!sidebar.classList.contains("hide-sidebar")) {
      datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay())
      setSidebarDatepicker(context, store, datepickerContext)
    }
  }

  function renderSidebarCategories() {
    if (!sidebar.classList.contains("hide-sidebar")) {
      handleSidebarCategories(context, store, datepickerContext)
      handleSidebarFooter(store)
    }
  }

  function getPreviousDay() {
    context.setPrevDay()
    fullRender("day")
    context.setDateSelected(context.getDay())
    renderSidebarDatepicker()
  }

  function getNextDay() {
    context.setNextDay()
    fullRender("day")
    context.setDateSelected(context.getDay())
    renderSidebarDatepicker()
  }

  function getPreviousWeek() {
    context.setPrevWeek()
    fullRender("week")
    renderSidebarDatepicker()
  }

  function getNextWeek() {
    context.setNextWeek()
    fullRender("week")
    renderSidebarDatepicker()
  }

  function getPreviousMonth() {
    context.setPrevMonth()
    fullRender("month")
    renderSidebarDatepicker()
  }

  function getNextMonth() {
    context.setNextMonth()
    fullRender("month")
    renderSidebarDatepicker()
  }

  function getPreviousYear() {
    context.setPrevYear()
    fullRender("year")
    renderSidebarDatepicker()
    return;
  }

  function getNextYear() {
    context.setNextYear()
    fullRender("year")
    renderSidebarDatepicker()
    return;
  }

  /**
   * handleTransition
   * @desc  The main purpose of this function is to handle situations where a user is holding down a hotkey to navigate through previous and next periods. Rather than having the swipe fire every single time, it will wait until after the user has stopped holding down the hotkey.
   * Same goes for swipe gestures/prev & next button clicks.
   * 
   * @param {HTMLElement} view (current calendar view to be transitioned)
   * @param {String} keyframeDirection (direction of the keyframe animation) prev/next period
   * @param {Function} callback (load next and previous periods)
   */
  let tm = 250; // define timeout out of scope so that it can be 
  function handleTransition(view, keyframeDirection, callback) {
    if (!store.getAnimationStatus()) {
      callback()
      return;
    } else {
      const removeslide = (dir) => {
        dir === "left" ? view.classList.remove("transition--right") : view.classList.remove("transition--left");
      }

      if (!view.classList.contains("weekview--header")) {
        viewsContainer.style.overflowX = "hidden";
        setTimeout(() => {
          viewsContainer.style.overflowX = "auto";
        }, 200);
      }

      removeslide(keyframeDirection)
      const slide = `transition--${keyframeDirection}`
      if (view.classList.contains(slide)) {
        // prevent transition from firing too often
        callback()
        tm += 250
      } else {
        view.classList.add(slide)
        setTimeout(() => {
          view.classList.remove(slide)
        }, tm)
        callback()
        tm = 250;
      }
    }
  }

  // define a means for opening the form then provide it to the store so that it can be accessed by other components
  function handleForm() {
    setEntryForm(context, store, datepickerContext)

    form.setAttribute("style", "top:5%;left:5%;right:5%;bottom:5%;margin:auto;")
    form.classList.remove("hide-form")
    formOverlay.classList.remove("hide-form-overlay")
    store.addActiveOverlay("hide-form-overlay")

    function closeform(e) {
      if (e.target === formOverlay) {
        form.classList.add("hide-form");
        formOverlay.classList.add("hide-form-overlay");
        store.removeActiveOverlay("hide-form-overlay");
        formOverlay.onclick = null;
        // formOverlay.removeEventListener("click", closeform)
      }
    }
    formOverlay.onclick = closeform
    // formOverlay.addEventListener("click", closeform)
  }

  // the submenu (meatball? menu) adjacent to "create" button in sidebar
  // opens instance of settings menu
  function handleToggleSubmenu() {
    getSidebarSubMenu(store, context)
  }

  // open / close sidebar
  // triggers via "s" keypress or by clicking on the hamburger menu icon
  // will also trigger in instances where the user tries to create a new entry on a blank day but no categories are selected.
  function handleBtnMainMenu() {
    const currentSidebarState = context.getSidebarState()
    if (currentSidebarState === "hide") {
      toggleForm.classList.remove("hide-toggle--form")
      viewsContainer.classList.remove("container__calendars-sb-active")
      sidebar.classList.add("hide-sidebar");
      dateTimeWrapper.classList.remove("datetime-inactive");
      listviewBody.removeAttribute("style");
    } else {
      // if a callback has been provided to the store (from the datepicker), this means that the header datepicker is open and needs to be closed to prevent two calendars that share the same date state from coinciding.
      // this can only happen if datepicker is open and user presses "s" on their keyboard to open sidebar

      const resetdatepicker = store.getResetDatepickerCallback()
      if (resetdatepicker !== null) {
        resetdatepicker()
        store.setResetDatepickerCallback(null)
      }

      listviewBody.style.width = "100%";
      listviewBody.style.marginLeft = "0";

      toggleForm.classList.add("hide-toggle--form")
      viewsContainer.classList.add("container__calendars-sb-active")
      dateTimeWrapper.classList.add("datetime-inactive");
      sidebar.classList.remove("hide-sidebar");

      datepickerContext.setDate(
        context.getYear(), context.getMonth(), context.getDay()
      );
      datepickerContext.setDateSelected(context.getDay())

      renderSidebarCategories();
      renderSidebarDatepicker();
      sbToggleSubBtn.onclick = handleToggleSubmenu
      sbToggleThemeBtn.onclick = setColorScheme;
    }
  }

  function handleBtnToday() {
    if (!context.isToday() && context.getComponent() !== "list") {
      let tempdate = new Date();
      context.setDate(
        tempdate.getFullYear(),
        tempdate.getMonth(),
        tempdate.getDate(),
      )

      fullRender(context.getComponent())
      renderSidebarDatepicker()
    }
  }

  function handleBtnPrev() {
    switch (context.getComponent()) {
      case "day":
        handleTransition(
          document.querySelector(".dayview--header-day__number"),
          "right",
          getPreviousDay
        );
        break;
      case "week":
        handleTransition(
          document.querySelector(".weekview--header"),
          "right",
          getPreviousWeek
        );
        break;
      case "month":
        handleTransition(monthwrapper, "right", getPreviousMonth)
        break;
      case "year":
        handleTransition(yearwrapper, "right", getPreviousYear)
        break;
      default:
        break;
    }
  }

  function handleBtnNext() {
    switch (context.getComponent()) {
      case "day":
        handleTransition(
          document.querySelector(".dayview--header-day__number"),
          "left",
          getNextDay
        );
        break;
      case "week":
        handleTransition(
          document.querySelector(".weekview--header"),
          "left",
          getNextWeek
        );
        break;
      case "month":
        handleTransition(monthwrapper, "left", getNextMonth)
        break;
      case "year":
        handleTransition(yearwrapper, "left", getNextYear)
        break;
      default:
        break;
    }
  }

  function handleDatePickerBtn(e) {
    datepicker.classList.remove("hide-datepicker")
    datepickeroverlay.classList.remove("hide-datepicker-overlay")
    datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay())
    const rect = e.target.getBoundingClientRect()
    const newDatepickerLeft = parseInt(rect.left)
    // convert rect left into a percentage so that it scales with window resize
    const perc = parseInt((newDatepickerLeft / window.innerWidth) * 100)
    datepicker.setAttribute("style", `left:${perc}%;top:12px;`)
    setDatepicker(context, store, datepickerContext, "header")

  }

  function setOptionStyle(option) {
    const views = ['day', 'week', 'month', 'year', 'list']
    const activeIndex = views.indexOf(option)
    for (let i = 0; i < options.length; i++) {
      if (i === activeIndex) {
        options[i].classList.add("change-view--option__active")
      } else {
        options[i].classList.remove("change-view--option__active")
      }
    }
  }

  function closeOptionsModal() {
    selectElement.classList.remove("selection--active")
    selectOverlay.style.display = "none";
    selectOverlay.classList.add("toggle-options")
    optionswrapper.classList.add("toggle-options")
    optionswrapper.classList.remove("toggle-animate")
  }

  function renderOption(option, initialRender) {
    const comp = context.getComponent()
    if (option === comp && !initialRender) return;
    closeOptionsModal()
    context.setComponent(option)
    fullRender(option)
    setOptionStyle(option)
    // week datepicker is the only one that has any stylistic difference
    if (comp || option === "week") {
      renderSidebarDatepicker()
    }
    document.activeElement.blur()
  }

  function handleSelect(e) {
    selectElement.classList.add("selection--active")
    selectOverlay.classList.remove("toggle-options")
    selectOverlay.style.display = "block";
    optionswrapper.classList.remove("toggle-options")
    optionswrapper.classList.add("toggle-animate")
    const setOption = (e) => {
      const option = e.target.getAttribute("data-view-option");
      renderOption(option);
    }
    optionswrapper.onclick = setOption
    selectOverlay.onclick = closeOptionsModal
  }

  // EVENT DELEGATION : HEADER ELEMENTS
  function delegateHeaderEvents(e) {
    e.preventDefault();
    const btnMainMenu = getClosest(e, ".menu");
    const btnToday = getClosest(e, ".btn-today");
    const btnPrev = getClosest(e, ".prev");
    const btnNext = getClosest(e, ".next");
    const dateTime = getClosest(e, ".datetime-content");
    const search = getClosest(e, ".h-search");
    const settings = getClosest(e, ".settings");
    const select = getClosest(e, ".select__modal");

    if (btnMainMenu) {
      context.toggleSidebarState();
      handleBtnMainMenu();
      return;
    }

    if (btnToday) {
      handleBtnToday();
      return;
    }

    if (btnPrev) {
      handleBtnPrev();
      return;
    }

    if (btnNext) {
      handleBtnNext();
      return;
    }

    if (dateTime) {
      handleDatePickerBtn(e);
      return;
    }

    if (search) {
      createGoTo(context, store, datepickerContext);
      return;
    }

    if (settings) {
      handleToggleSubmenu(e);
      return;
    }

    if (select) {
      handleSelect(e);
      return;
    }
  }

  /* configure keyboard shortcuts */
  /* 2022-01-14
  * Google calendar has recently updated their app wide throttling from a global value of around 150 to the minimum of 4ms(might be 10) for period changes and (250-300) for view changes. 
  * For now, I'm keeping global throttle at 150ms. 
  */
  function delegateGlobalKeyDown(e) {
    const toggleChangeview = (e) => {
      if (selectElement.classList.contains("selection--active")) {
        if (e.key.toLowerCase() === "v") {
          closeOptionsModal()
        }
      } else {
        handleSelect();
      }
    }

    switch (e.key.toLowerCase()) {
      // switch to day view
      case "d":
        renderOption("day");
        break;
      case "1":
        renderOption("day");
        break;

      // switch to week view
      case "w":
        renderOption("week");
        break;
      case "2":
        renderOption("week");
        break;

      // switch to month view
      case "m":
        renderOption("month");
        break;
      case "3":
        renderOption("month");
        break;

      // switch to year view
      case "y":
        renderOption("year");
        break;
      case "4":
        renderOption("year");
        break;

      // switch to list view
      case "l":
        renderOption("list");
        break;
      case "5":
        renderOption("list");
        break;

      // toggle sidebar open/close
      case "s":
        context.toggleSidebarState();
        handleBtnMainMenu();
        break;

      // toggle form open (close with escape)
      case "f":
        handleForm();
        break;

      // open "views" menu
      case "v":
        toggleChangeview(e);
        break;

      // (day/week) next month
      case "p":
        handleBtnPrev();
        break;

      // (day/week) prev month
      case "n":
        handleBtnNext();
        break;

      // set date to today
      case "t":
        handleBtnToday();
        break;

      // open submenu
      case "a":
        handleToggleSubmenu();
        break;

      // open keyboard shortcuts modal
      case "?":
        handleShortCutsModal(store);
        break;
      case "/":
        handleShortCutsModal(store);
        break;

      // toggle between light/dark mode
      case "0":
        setColorScheme()
        break;

      // opens search modal
      case "g":
        createGoTo(context, store, datepickerContext);
        // document.querySelector("")
        break;

      case "+":
        const targetcat = {
          name: "new category",
          color: "#2C52BA",
        }
        createCategoryForm(store, targetcat, false, null);
      default:
        break;
    }
  }

  const getKeyPressThrottled = throttle(delegateGlobalKeyDown, 150)
  // shortcuts defined within this function are global and will work anywhere within the application (except for modal/popup/form windows)

  // If a modal/popup is open, all keyboard shortcuts defined within this function will be disabled until the modal/popup is closed.
  // Note that Each modal/popup has its own keydown close event on escape thats defined within the scope of its own function,
  // once it is closed, the event listener is removed from the DOM.
  let [lk, lk2] = ['', ''];
  function handleGlobalKeydown(e) {
    if (!store.getShortcutsStatus()) return;
    if (store.hasActiveOverlay()) return;

    // prevent ctrl + key shortcuts from triggering at all
    lk = e.key;
    if (lk === "Control") {
      lk2 = "Control";
      return;
    }
    if (lk2 === "Control" && lk !== "Control") {
      lk2 = "";
      return;
    }

    getKeyPressThrottled(e);
  }

  function handleCollapse() {
    const view = context.getComponent();
    const headers = {
      ['day']: {
        component: document.querySelector(".dayview--header"),
        collapse: "dvh-collapse",
      },
      ['week']: {
        component: document.querySelector(".weekview--header"),
        componentBody: document.querySelector(".weekview__grid"),
        collapse: "wvh-collapse",
        componentBodytoggle: "wvh-body-collapse"
      },
    };
    const eyeIcons = {
      on: document.querySelector(".cv-svg-on"),
      off: document.querySelector(".cv-svg-off")
    }

    if (view === "week" || view === "day") {
      eyeIcons.on.classList.toggle("hide-cbt");
      eyeIcons.off.classList.toggle("hide-cbt");
      headers[view].component.classList.toggle(headers[view].collapse);
      if (view === "week") {
        headers[view].componentBody.classList.toggle(headers[view].componentBodytoggle)
      }
    }
  }

  const appinit = () => {
    /*************************/
    // render initial view and set initial attributes
    renderOption(context.getComponent(), true);
    setInitialAttributes();
    handleBtnMainMenu();
    /*************************/
    // supply callbacks to store for opening form and sidebar
    store.setRenderFormCallback(handleForm);
    const ensureSidebarIsOpen = () => {
      context.setSidebarState("open");
      handleBtnMainMenu();
    }
    store.setRenderSidebarCallback(ensureSidebarIsOpen);
    /*************************/
    // establish delegation
    toggleForm.onclick = handleForm;
    sbToggleForm.onclick = handleForm;
    collapsebtn.onclick = handleCollapse;

    header.onmousedown = delegateHeaderEvents;
    document.addEventListener("keydown", handleGlobalKeydown);
  }
  appinit();
}