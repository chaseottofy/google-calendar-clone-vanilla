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

const headerPrevBtn = document.querySelector(".prev")
const headerNextBtn = document.querySelector(".next")

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
    headerLogo.setAttribute("data-current-day-of-month", context.getDay())
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
    const removeslide = (dir) => {
      dir === "left" ? view.classList.remove("transition--right") : view.classList.remove("transition--left");
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

  // define a means for opening the form then provide it to the store so that it can be accessed by other components
  function handleForm() {
    setEntryForm(context, store, datepickerContext)

    form.setAttribute("style", "top:5%;left:5%;right:5%;bottom:5%;margin:auto;")
    form.classList.remove("hide-form")
    formOverlay.classList.remove("hide-form-overlay")
    store.addActiveOverlay("hide-form-overlay")

    function closeform(e) {
      if (e.target === formOverlay) {
        form.classList.add("hide-form")
        formOverlay.classList.add("hide-form-overlay")
        store.removeActiveOverlay("hide-form-overlay")
        formOverlay.removeEventListener("click", closeform)
      }
    }
    formOverlay.addEventListener("click", closeform)
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
    } else {
      // if a callback has been provided to the store (from the datepicker), this means that the header datepicker is open and needs to be closed to prevent two calendars that share the same date state from coinciding.
      // this can only happen if datepicker is open and user presses "s" on their keyboard to open sidebar
      const resetdatepicker = store.getResetDatepickerCallback()
      if (resetdatepicker !== null) {
        resetdatepicker()
        store.setResetDatepickerCallback(null)
      }
      toggleForm.classList.add("hide-toggle--form")
      viewsContainer.classList.add("container__calendars-sb-active")
      dateTimeWrapper.classList.add("datetime-inactive");
      sidebar.classList.remove("hide-sidebar");
      datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay());
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
        // transition day header rather than entire view (too jarring)
        handleTransition(document.querySelector(".dayview--header-day"), "right", getPreviousDay)
        break;
      case "week":
        handleTransition(document.querySelector(".weekview--calendar"), "right", getPreviousWeek)
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
        // transition day header rather than entire view (too jarring)
        handleTransition(document.querySelector(".dayview--header-day"), "left", getNextDay)
        break;
      case "week":
        handleTransition(document.querySelector(".weekview--calendar"), "left", getNextWeek)
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
    headerPrevBtn.style.display = "none";
    headerNextBtn.style.display = "none";



    const newDatepickerLeft = parseInt(e.target.getBoundingClientRect().left) - 22
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

    // handleTransition(option, keyframeDirection, callback)
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

    if (settings) {
      handleToggleSubmenu(e);
      return;
    }

    if (select) {
      handleSelect(e);
      return;
    }
  }

  /* ***************************** */
  /* configure keyboard shortcuts */
  /* UPDATE: 2022-01-14
  * Google calendar has recently updated their app wide throttling from a global value of around 150 to the minimum of 4ms(might be 10) for period changes and (250-300) for view changes. 
  * 
  * I don't have too much of a personal preference for either, but I was taken aback by how fast it felt, and not in a good way. 
  * If you want to see what I mean by 'jarring', go to google calendar month view and hold down "n" or "p". I'm almost certain this is some kind of bug as I'm also getting loads of "error caught in promise" responses in the console.
  * 
  * For now, I'm keeping the throttle at 150ms. 
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

    const getNextPrevMonth = (direction) => {
      let comp = context.getComponent()
      if (comp === "week" || comp === "day") {
        if (direction === "next") {
          context.setNextMonth()
          fullRender(comp)
          renderSidebarDatepicker()
        } else {
          context.setPrevMonth()
          fullRender(comp)
          renderSidebarDatepicker()
        }
      } else {
        return;
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
      case "n":
        getNextPrevMonth("next");
        break;

      // (day/week) prev month
      case "p":
        getNextPrevMonth("prev");
        break;

      // set date to today
      case "t":
        handleBtnToday();
        break;

      // open submenu
      case "a":
        handleToggleSubmenu();
        break;

      // prev day/week/month/year
      case "arrowleft":
        handleBtnPrev();
        break;

      // next day/week/month/year
      case "arrowright":
        handleBtnNext();
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
        break;
      default:
        break;
    }
  }

  const getKeyPressThrottled = throttle(delegateGlobalKeyDown, 150)
  function handleGlobalKeydown(e) {
    // shortcuts defined within this function are global and will work anywhere within the application (except for modal/popup/form windows)

    // If a modal/popup is open, all keyboard shortcuts defined within this function will be disabled until the modal/popup is closed.
    // Note that Each modal/popup has its own keydown close event on escape thats defined within the scope of its own function,
    // once it is closed, the event listener is removed from the DOM.

    if (!store.getShortcutsStatus()) return;
    if (store.hasActiveOverlay()) return;
    getKeyPressThrottled(e)
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
      context.setSidebarState("open")
      handleBtnMainMenu()
    }
    store.setRenderSidebarCallback(ensureSidebarIsOpen);
    /*************************/
    // establish delegation
    toggleForm.onclick = handleForm;
    sbToggleForm.onclick = handleForm;
    header.onmousedown = delegateHeaderEvents;
    document.addEventListener("keydown", handleGlobalKeydown);
  }
  // store.setShortcutsStatus(true)
  appinit();
}