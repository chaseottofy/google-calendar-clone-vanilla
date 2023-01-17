// render methods
import setViews from "../../config/setViews"
import setDatepicker from "../menus/datepicker"
import setSidebarDatepicker from "../menus/sidebarDatepicker"
import locales from "../../locales/en"

// svgs
import { createCheckIcon, createCloseIcon } from "../../utilities/svgs"

// popups
import createToast from "../toastPopups/toast"
import toastCallbackSaving from "../toastPopups/toastCallbacks"

// helpers
import {
  getClosest,
  hextorgba
} from "../../utilities/helpers"

// date / time helpers
import {
  getDateForStore,
  isBeforeDate,
  isDate,
  getDateFromAttribute,
  formatDateForDisplay
} from "../../utilities/dateutils"

import {
  compareTimes,
} from "../../utilities/timeutils"


// main app sidebar
const sidebar = document.querySelector(".sidebar")
// main app datepicker / overlay
const datepicker = document.querySelector(".datepicker")
const datepickeroverlay = document.querySelector(".datepicker-overlay")

// form wrappers / overlay
const formOverlay = document.querySelector(".form-overlay")
const formModalOverlay = document.querySelector(".form-modal-overlay")
const entriesFormWrapper = document.querySelector(".entries__form")
const entriesForm = document.querySelector(".entry-form")

// title / description inputs
const titleInput = document.querySelector(".form--body__title-input")
const descriptionInput = document.querySelector(".form--body__description-input")

// start date / time
// end date / time
const startDateInput = document.querySelector(".form--body-start__date")
const endDateInput = document.querySelector(".form--body-end__date")

const startTimeInput = document.querySelector(".form--body-start__time")
const endTimeInput = document.querySelector(".form--body-end__time")

// category modal
const categoryModal = document.querySelector(".form--body__category-modal")
const closeCategoryModalBtn = document.querySelector(".close-options-floating__btn")
const categoryModalIcon = document.querySelector(".form--body__category-icon")
const categoryModalWrapper = document.querySelector(".form--body__category-modal--wrapper")
const selectedCategoryWrapper = document.querySelector(".form--body__category-modal--wrapper-selection")
const selectedCategoryColor = document.querySelector(".form--body__category-modal--wrapper__color")
const selectedCategoryTitle = document.querySelector(".form--body__category-modal--wrapper__title")

// reset / save btns
const formSubmitButton = document.querySelector(".form--footer__button-save");
// const formClearButton = document.querySelector(".form--footer__button-cancel");

export default function setEntryForm(context, store, datepickerContext) {
  let categories;
  let activeCategories;
  let currentComponent;
  let [year, month, day] = [null, null, null]



  const closetimepicker = () => {
    const timep = document?.querySelector(".timepicker")
    const timepoverlay = document?.querySelector(".timepicker-overlay")
    if (timep) {
      timep.remove();
      timepoverlay.remove();
    }
  }

  function createTimepicker(coords, currentTime, end, endLimit) {
    const timepicker = document.createElement("div")
    timepicker.classList.add("timepicker")
    timepicker.style.top = `${coords.y}px`
    timepicker.style.left = `${coords.x}px`
    const timepickerOverlay = document.createElement("div")
    timepickerOverlay.classList.add("timepicker-overlay")
    const timepickerTimesContainer = document.createElement("div")
    timepickerTimesContainer.classList.add("timepicker-times__container");
    

    const hours = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
    const minutes = ["00", "15", "30", "45"];
    const [am, pm] = ['am', 'pm'];
    const [currenthour, currentmin] = currentTime.split(":")
    let isSameDay = startDateInput.getAttribute("data-form-date") === endDateInput.getAttribute("data-form-date")
    let [amStatus, pmStatus] = [currenthour < 12, currenthour >= 12]
    let selectedIndex = 0;
    // endhour / endmin (not relavent if timepicker is for start time)
    let [eh, em] = [null, null]
    let endCanIterate = true;
    let canCount = false;
    let count = 0;
    if (end && isSameDay) {
      endCanIterate = false;
      [eh, em] = endLimit.split(":");
    }

    // some annoying steps to ensure there is no possibility of a user selecting an end time before a start time on the same day;
    const createTimesTemp = (md, flag) => {
      hours.forEach((hour, houridx) => {
        minutes.forEach((min, minidx) => {
          if (!endCanIterate) {
            if (hour == eh) {
              if (em == min) {
                canCount = true;
              }
            }
          }
          // once the current start time is reached, the end time must wait until the next iteration to avoid picking the same time
          if (canCount) {
            count++;
            if (count == 2) {
              endCanIterate = true;
            }
          }

          // 'endCanIterate' flag will always be true if the timepicker is for the start time
          if (endCanIterate) {
            const timepickerTime = document.createElement("div")
            timepickerTime.classList.add("timepicker-time")
            timepickerTime.textContent = `${hour}:${min}${md}`

            let attr;
            md === "pm" ? attr = `${parseInt(hour) + 12}:${min}` : attr = `${hour}:${min}`
            timepickerTime.setAttribute("data-tp-time", attr)

            // determine where the timepicker should be scrolled to
            if (currenthour == hour && currentmin == min) {
              // if (am)
              if (flag && md === "am") {
                selectedIndex = houridx * 4 + minidx
                timepickerTime.classList.add("timepicker-time--selected")
                // if (pm)
              } else if (flag && md === "pm") {
                selectedIndex = houridx * 4 + minidx + 48
                timepickerTime.classList.add("timepicker-time--selected")
              }
            }
            timepickerTimesContainer.appendChild(timepickerTime)
          }
        })
      })
    }

    if (end) {
      createTimesTemp(am, amStatus)
      createTimesTemp(pm, pmStatus)
    } else {
      createTimesTemp(am, amStatus)
      createTimesTemp(pm, pmStatus)
    }

    const setnewtime = (e) => {
      const newtime = e.target.getAttribute("data-tp-time")
      const newtimetext = e.target.textContent;
      if (newtime) {
        if (end) {
          endTimeInput.textContent = newtimetext;
          endTimeInput.setAttribute("data-form-time", newtime);
        } else {
          startTimeInput.textContent = newtimetext;
          startTimeInput.setAttribute("data-form-time", newtime);
          let tempEndTime = endTimeInput.getAttribute("data-form-time")
          const [diff, status] = compareTimes(newtime, tempEndTime)
          let newEndHour = parseInt(newtime.split(":")[0]) + 1;
          let newEndMin = newtime.split(":")[1];
          if (status !== true && isSameDay) {
            console.log(newEndHour, newEndMin)
            if (newEndHour === 24) {
              if (newEndMin === '45') {
                newEndHour = 1;
                newEndMin = "00";
                let [ty, tm, td] = getDateFromAttribute(endDateInput, "data-form-date")
                let newEndDate = new Date(ty, tm, td + 1)

                endDateInput.textContent = `${locales.labels.monthsShort[newEndDate.getMonth()]} ${newEndDate.getDate()}, ${newEndDate.getFullYear()}`
                endDateInput.setAttribute("data-form-date", getDateForStore(newEndDate))

              } else {
                newEndHour = 24;
                newEndMin = "45";
              }
            }
            endTimeInput.setAttribute("data-form-time", `${newEndHour}:${newEndMin}`)

            let newEndHourText;
            let newEndMd;
            if (newEndHour > 12) {
              newEndMd = "pm"
              newEndHourText = newEndHour % 12
            } else if (newEndHour === 0 || newEndHour === 12) {
              newEndHour = 12;
            } else {
              newEndMd = "am"
              newEndHourText = newEndHour
            }

            endTimeInput.textContent = `${newEndHourText}:${newEndMin}${newEndMd}`
          }
        }
      }
      closetimepicker();
    }

    const delegateNewTime = (e) => {
      if (getClosest(e, ".timepicker-time")) {
        setnewtime(e)
        return;
      }
    }

    timepicker.appendChild(timepickerTimesContainer)
    const [x, y] = coords
    timepicker.setAttribute("style", `top:${y}px; left:${x}px;`)
    document.body.prepend(timepickerOverlay);
    document.body.prepend(timepicker)
    timepickerOverlay.onclick = closetimepicker;
    timepickerTimesContainer.onclick = delegateNewTime;

    console.log(timepickerTimesContainer.children.length)
    const containerLength = timepickerTimesContainer.children.length
    const denom = containerLength >= 48 ? 48 : 96;

    let percentageToScroll = Math.floor((containerLength * 40) * (selectedIndex / denom).toFixed(2))
    timepicker.scrollTo(0, percentageToScroll - 40)
  }

  function renderSidebarDatepickerForm() {
    if (!sidebar.classList.contains("hide-sidebar")) {
      // datepickerContext.setDate(year, month, day)
      context.setDateSelected(day)
      setSidebarDatepicker(context, store, datepickerContext)
    }
  }

  function getDefaultCategory() {
    if (activeCategories.length === 0) {
      return [categories[0][0], categories[0][1].color]
    } else {
      return [activeCategories[0][0], activeCategories[0][1].color]
    }
  }

  function setInitialFormCategory() {
    let [categoryTitle, categoryColor] = getDefaultCategory();
    categoryModalWrapper.setAttribute("data-form-category", categoryTitle)

    selectedCategoryWrapper.style.backgroundColor = categoryColor
    selectedCategoryTitle.textContent = categoryTitle
    selectedCategoryColor.style.backgroundColor = categoryColor
    categoryModalIcon.firstElementChild.setAttribute("fill", categoryColor)
  }

  function setFormInitialValues() {
    // variable setup
    categories = Object.entries(store.getAllCtg())
    activeCategories = store.getActiveCategoriesKeyPair()
    currentComponent = context.getComponent()
    year = context.getYear()
    month = context.getMonth()
    day = context.getDay()
    // ****************************************** //
    // title / description
    descriptionInput.value = "";
    let tempval = titleInput.value;
    setTimeout(() => {
      titleInput.value = "";
      titleInput.focus();
      titleInput.value = tempval;
    }, 10)

    // ****************************************** //
    // category setup 
    setInitialFormCategory()

    // ****************************************** // 
    // date picker setup
    datepickerContext.setDate(year, month, day)
    context.setDateSelected(day)
    // ****************************************** // 

    // date inputs setup
    const dateSelected = `${context.getMonthName().slice(0, 3)} ${day}, ${year}`
    // DATES : START/END
    startDateInput.textContent = dateSelected
    startDateInput.setAttribute("data-form-date", getDateForStore(context.getDate()))
    endDateInput.textContent = dateSelected
    endDateInput.setAttribute("data-form-date", getDateForStore(context.getDate()))

    // TIME : START/END 
    const temphours = new Date().getHours()
    startTimeInput.setAttribute("data-form-time", `${temphours}:00`)
    endTimeInput.setAttribute("data-form-time", `${temphours}:30`)
    const getTimeAndMd = (hour, min) => {
      return `${+hour === 0 || +hour === 12 ? 12 : hour % 12}:${min}${hour < 12 ? "am" : "pm"}`;
    }
    startTimeInput.textContent = getTimeAndMd(temphours, "00")
    endTimeInput.textContent = getTimeAndMd(temphours, "30")

    // ****************************************** // 
    // submit button setup 
    formSubmitButton.setAttribute("data-form-action", "create")
    formSubmitButton.setAttribute("data-form-id", "")
    // ****************************************** // 

    // approve form event delegation
    entriesFormWrapper.onmousedown = delegateEntryFormEvents
    formOverlay.onmousedown = handleOverlayClose
    document.addEventListener("keydown", delegateFormKeyDown)
    // ****************************************** // 
  }

  function getDatePicker(year, month, day) {
    datepickeroverlay.classList.remove("hide-datepicker-overlay")
    datepicker.classList.remove("hide-datepicker")
    store.addActiveOverlay("hide-datepicker-overlay")
    datepickerContext.setDate(year, month, day)
    datepickerContext.setDateSelected(day)
    setDatepicker(context, store, datepickerContext, "form")
  }

  function handleOverlayClose(e) {
    if (e.target.classList.contains("form-overlay")) {
      handleFormClose(e)
    }
  }

  function handleSetDate(e, type) {
    if (type === "start") {
      startDateInput.setAttribute("class", "form--body-start__date active-form-date");
      endDateInput.setAttribute("class", "form--body-end__date inactive-form-date");
    } else {
      startDateInput.setAttribute("class", "form--body-start__date inactive-form-date");
      endDateInput.setAttribute("class", "form--body-end__date active-form-date");
    }

    const [y, m, d] = getDateFromAttribute(e.target, "data-form-date");
    const rect = e.target.getBoundingClientRect();
    const datepickerLeft = parseInt(rect.left);
    const bott = parseInt(rect.bottom);
    let datepickerTop = parseInt(rect.top);

    if (type === "end") {
      datepickerTop -= 40;
    }

    if (window.innerHeight - 216 < bott) {
      datepickerTop = window.innerHeight - 216;
    }

    datepicker.setAttribute("style", `top:${datepickerTop}px;left:${datepickerLeft}px;`)
    getDatePicker(y, m, d)
  }

  function getDateFormatViaAttr(dateAttr) {
    const [year, month, day] = dateAttr.split("-").map(x => parseInt(x))
    return new Date(year, month, day)
  }

  function getTimeFormatViaAttr(timeAttr) {
    return timeAttr.split(":").map(x => parseInt(x))
  }

  function getDateTimeFormatted(dateAttr, timeAttr) {
    dateAttr.setHours(timeAttr[0])
    dateAttr.setMinutes(timeAttr[1])
    dateAttr.setSeconds(0)
    return dateAttr
  }

  function configDatesForStore() {
    let startDateAttr = startDateInput.getAttribute("data-form-date")
    let startDate = getDateFormatViaAttr(startDateAttr)
    let startTimeAttr = startTimeInput.getAttribute("data-form-time") || "12:00"
    let [starthour, startminute] = getTimeFormatViaAttr(startTimeAttr)

    let endDateAttr = endDateInput.getAttribute("data-form-date")
    let endDate = getDateFormatViaAttr(endDateAttr)
    let endTimeAttr = endTimeInput.getAttribute("data-form-time") || "12:30"
    let [endhour, endminute] = getTimeFormatViaAttr(endTimeAttr)

    console.log(starthour, endhour)
    if (starthour >= endhour) {
      if (starthour < 23) {
        endhour += 1
      } else {
        startminute = 0;
        endhour = 23;
        endminute = 30;
      }
    }

    return [
      getDateTimeFormatted(startDate, [starthour, startminute]),
      getDateTimeFormatted(endDate, [endhour, endminute])
    ]
  }

  function checkFormValidity(title, description, category, startDate, endDate) {
    // all inputs are valid by default 
    // if any input becomes invalid, only the error message for that input will be returned through a error object defined below
    const status = {
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      valid: true,
    }
    /* ************************ */
    /*  TITLE VALIDATION CHECK */
    if (typeof title === "string") {
      const titlecheck = title.trim().replace(/[^a-zA-Z0-9\s_-]+|\s{2,}/g, ' ');
      if (titlecheck.length > 50) {
        status.title = "Title must be Less than 50 characters";
        status.valid = false;
      } else if (titlecheck.length === 0) {
        status.title = "Title cannot be empty";
        status.valid = false;
      }
    } else {
      status.title = "Title cannot be empty";
    }
    /* ***************************** */
    /*  DESCRIPTION VALIDATION CHECK */
    if (description.length >= 200) {
      status.description = "Description must be less than 200 characters";
      status.valid = false;
    }
    /* ************************** */
    /*  CATEGORY VALIDATION CHECK */
    if (!store.hasCtg(category) || !category) {
      categoryModalWrapper.setAttribute("data-form-category", "default");
    }
    /* **************************** */
    /*  START DATE VALIDATION CHECK */
    if (!startDate) {
      status.startDate = "Start date cannot be empty";
      status.valid = false;
    } else if (!isDate(startDate)) {
      status.startDate = "Start date is not valid";
      status.valid = false;
    }
    /* **************************** */
    /*  END DATE VALIDATION CHECK */
    if (!endDate) {
      status.endDate = "End date cannot be empty";
      status.valid = false;
    } else if (!isDate(endDate)) {
      status.endDate = "End date is not valid";
      status.valid = false;
    } else if (!isBeforeDate(startDate, endDate)) {
      status.endDate = "End date must be after start date";
      status.valid = false;
    }
    /* ************* */
    /*  congregate any errors  */
    let errors = {};
    let hasErrors;
    for (let key in status) {
      if (status[key] !== true) {
        errors[key] = status[key];
        hasErrors = true;
      }
    }


    if (hasErrors) {
      return errors;
    } else {
      return true;
    }
  }

  function removeErrorMessages(e) {
    if (e.target.classList.contains("form-input-error")) {
      e.preventDefault()
      e.target.classList.remove("form-input-error")
      e.target.removeAttribute("data-form-error-message")
      e.target.firstElementChild.focus()
    } else if (e.target.classList.contains("form-input-error__custom-input")) {
      e.target.classList.remove("form-input-error__custom-input")
      e.target.removeAttribute("data-form-error-message")
      e.target.focus()
    } else {
      return;
    }
  }

  /**
   * 
   * @param {object} errorMessages object key represents the input name and the value represents the string error message
   * 
   * Use object key to get the input HTML element class name and append the error message as a data attribute to the input element using the err object.
   * 
   * Set the submit button to disabled until all errors are resolved
   * 
   */
  function handleFormErrors(errorMessages) {
    titleInput.blur()
    console.log(errorMessages)

    const components = {
      title: titleInput,
      description: descriptionInput,
      startDate: startDateInput,
      endDate: endDateInput,
    }
    const err = {
      inputAttr: "data-form-error-message",
      inputClass: "form-input-error",
      svgClass: "form-input-error__custom-input",
      submitbtn: "form-error__submit-btn"
    }

    for (let key in errorMessages) {
      if (components[key]) {
        if (key === "title" || key === "description") {
          components[key].parentElement.setAttribute(err.inputAttr, errorMessages[key]);
          components[key].parentElement.classList.add(err.inputClass)
        } else {
          components[key].setAttribute(err.inputAttr, errorMessages[key])
          components[key].classList.add(err.svgClass)
          const svg = components[key].parentElement.parentElement.firstElementChild.firstElementChild
          svg.style.fill = "var(--red2)";
          setTimeout(() => { svg.style.fill = "var(--white3)" }, 1000)
        }
      }
    }

    formSubmitButton.classList.add(err.submitbtn)
    setTimeout(() => { formSubmitButton.classList.remove(err.submitbtn) }, 1000)
  }

  function removeLastFormEntry() {
    store.removeLastEntry()
    setViews(currentComponent, context, store, datepickerContext);
  }

  function handleFormClose(e) {
    if (!datepicker.classList.contains("hide-datepicker")) {
      datepicker.classList.add("hide-datepicker")
      datepickeroverlay.classList.add("hide-datepicker-overlay")
    }

    entriesFormWrapper.classList.add("hide-form");
    formOverlay.classList.add("hide-form-overlay");
    store.removeActiveOverlay("hide-datepicker-overlay")
    store.removeActiveOverlay("hide-form-overlay")
    entriesForm.reset();
    descriptionInput.value = "";
    titleInput.value = "";
    if (categoryModalWrapper.classList.contains("category-modal-open")) {
      closeCategoryModal()
    }
    document.removeEventListener("keydown", delegateFormKeyDown)

    const resetCurrentView = store.getFormResetHandle(currentComponent)
    if (resetCurrentView !== null) {
      resetCurrentView()
      store.setFormResetHandle(currentComponent, null)
    } else {
      return;
    }
  }

  function handleSubmissionRender(start) {
    context.setDate(start.getFullYear(), start.getMonth(), start.getDate())
    context.setDateSelected(start.getDate())

    setViews(currentComponent, context, store, datepickerContext);

    if (store.getDayEntriesArray(context.getDate()).length <= 1) {
      renderSidebarDatepickerForm()
    }
    handleFormClose()
    createToast("Saving", 1000, null, null, null, removeLastFormEntry)
  }

  function handleFormSubmission(e) {
    e.preventDefault()
    const title = titleInput.value
    const description = descriptionInput.value;
    const [startDate, endDate] = configDatesForStore()
    const category = categoryModalWrapper.getAttribute("data-form-category")

    // if errors exist, validityStatus will represent an object with keys that match the input names, and values that represent the error messages as strings;
    // note that two types of submissions are possible: edit and create
    const validityStatus = checkFormValidity(
      title, description, category, startDate, endDate,
    )

    if (validityStatus !== true) {
      handleFormErrors(validityStatus)
      return;
    } else {
      // submission : edit
      if (formSubmitButton.getAttribute("data-form-action") === "edit") {
        store.updateEntry(
          formSubmitButton.getAttribute("data-form-entry-id"),
          {
            category: category,
            completed: false,
            description: description,
            end: endDate,
            id: formSubmitButton.getAttribute("data-form-entry-id"),
            start: startDate,
            title: title,
          }
        )
        handleSubmissionRender(startDate)
        return;
      } else {
        // submission : create
        store.createEntry(
          category, false, description, endDate, startDate, title
        )
        handleSubmissionRender(startDate)
      }
    }
  }

  function handleCategorySelection(e) {
    const title = e.target.getAttribute("data-form-category-title")
    const color = e.target.getAttribute("data-form-category-color")
    categoryModalWrapper.setAttribute("data-form-category", title)
    categoryModalIcon.firstElementChild.setAttribute("fill", color)

    selectedCategoryWrapper.style.backgroundColor = color
    selectedCategoryColor.style.backgroundColor = color
    selectedCategoryTitle.textContent = title
    closeCategoryModal()
  }

  function closeCategoryModal() {
    closeCategoryModalBtn.style.display = "none";
    categoryModalWrapper.classList.remove("category-modal-open")
    categoryModal.classList.add("hide-form-category-modal")
    selectedCategoryWrapper.classList.remove("hide-form-category-selection")
    formModalOverlay.classList.add("hide-form-overlay")
    categoryModalWrapper.removeAttribute("style")
  }

  function createCategoryOptions(parent, categories) {
    const currentCategory = categoryModalWrapper.getAttribute("data-form-category")


    categories.forEach(([key, value]) => {
      const color = value.color;
      const categoryWrapper = document.createElement("div")
      categoryWrapper.classList.add("category-modal--category")
      categoryWrapper.style.width = "200px"

      categoryWrapper.style.backgroundColor = color;
      categoryWrapper.setAttribute("data-form-category-title", key);
      categoryWrapper.setAttribute("data-form-category-color", color);

      const categoryDisplayColor = document.createElement("div")
      categoryDisplayColor.classList.add("category-modal--category-color")
      categoryDisplayColor.style.backgroundColor = color;

      const categoryTitle = document.createElement("div");
      categoryTitle.classList.add("category-modal--category-title");
      categoryTitle.textContent = key;

      if (key === currentCategory) {
        const checkIcon = createCheckIcon("var(--white4)");
        const checkIconWrapper = document.createElement("div");
        checkIconWrapper.classList.add("category-modal--category-check");
        checkIconWrapper.appendChild(checkIcon);

        categoryWrapper.append(
          categoryDisplayColor,
          categoryTitle,
          checkIconWrapper
        );

      } else {
        categoryWrapper.append(categoryDisplayColor, categoryTitle)
      }
      parent.appendChild(categoryWrapper)
    })
  }

  function openCategoryModal(e, categories) {
    const length = categories.length;
    if (length === 1) return;

    closeCategoryModalBtn.removeAttribute("style");

    if (length >= 5) {
      closeCategoryModalBtn.setAttribute("style", `top: -100px`)
    } else {
      closeCategoryModalBtn.setAttribute("style", `top: ${(length * 20) * -1}px`)
    }

    categoryModalWrapper.classList.add("category-modal-open")
    if (length < 5) {
      categoryModalWrapper.style.height = `${length * 32}px`;
    } else {
      categoryModalWrapper.style.height = "160px";
    }

    selectedCategoryWrapper.classList.add("hide-form-category-selection");
    categoryModal.classList.remove("hide-form-category-modal");
    categoryModal.innerText = "";
    categoryModal.style.height = `${length * 32}px`;
    createCategoryOptions(categoryModal, categories)

    if (categoryModal.childElementCount > 0) {
      categoryModal.onclick = delegateCategorySelection;
    }
    formModalOverlay.classList.remove("hide-form-overlay");
    formModalOverlay.onclick = closeCategoryModal;
    closeCategoryModalBtn.onclick = closeCategoryModal;
  }

  function dragFormAnywhere(e) {
    const target = e.target;
    const wrapper = entriesFormWrapper;
    if (wrapper.style.margin === "auto") {
      wrapper.setAttribute("style", `left:${+wrapper.offsetLeft}px;top:${+wrapper.offsetTop}px;margin:0;max-width:450px;height:420px;`)
    }

    wrapper.style.opacity = "0.8";
    wrapper.style.userSelect = "none";
    let [leftBefore, topBefore] = [e.clientX, e.clientY];
    const [winH, winW] = [window.innerHeight, window.innerWidth];

    function mousemove(e) {
      let [leftAfter, topAfter] = [
        leftBefore - e.clientX, topBefore - e.clientY
      ];

      leftBefore = e.clientX;
      topBefore = e.clientY;

      if ((wrapper.offsetHeight + wrapper.offsetTop) > winH) {
        wrapper.style.top = winH - wrapper.offsetHeight + "px";
      }

      wrapper.style.top = wrapper.offsetTop - topAfter + "px";
      wrapper.style.left = wrapper.offsetLeft - leftAfter + "px";
    }

    function mouseup() {
      wrapper.style.opacity = "1";
      wrapper.style.userSelect = "all";
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    }
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  }

  function delegateCategorySelection(e) {
    if (getClosest(e, ".category-modal--category")) {
      handleCategorySelection(e);
    }
  }

  function createfakediv(x, y) {
    const d = document.createElement("div");
    d.style.position = "absolute";
    d.style.left = x + "px";
    d.style.top = y + "px";
    d.style.width = "180px";
    d.style.height = "200px";
    d.style.zIndex = "2000";
    d.style.backgroundColor = "rgba(0,0,0,0.6)";

    const deletediv = () => {
      d.remove();
    }

    d.onclick = deletediv
    document.body.prepend(d);
  }


  function handleTimepickerSetup(target) {
    const rect = target.getBoundingClientRect()

    return [
      parseInt(rect.right) + 16,
      parseInt(rect.top) - 24,
    ]
  }

  function delegateEntryFormEvents(e) {
    // header
    const dragHeader = getClosest(e, ".form-header--dragarea");
    const closeicon = getClosest(e, ".form--header__icon-close");

    // form inputs
    const startdate = getClosest(e, ".form--body-start__date");
    const starttime = getClosest(e, ".form--body-start__time");
    const enddate = getClosest(e, ".form--body-end__date");
    const endtime = getClosest(e, ".form--body-end__time");
    const category = getClosest(e, ".form--body__category-modal--wrapper-selection");

    // error msg : <input> / <textarea>
    const inputError = getClosest(e, ".form-input-error");

    // error msg : custom inputs (date / time)
    const customInputError = getClosest(e, ".form-input-error__custom-input");

    // form footer buttons
    const clearbtn = getClosest(e, ".form--footer__button-cancel");
    const submitbtn = getClosest(e, ".form--footer__button-save");

    if (dragHeader) {
      dragFormAnywhere(e);
      return;
    }

    if (closeicon) {
      handleFormClose(e);
      return;
    }

    if (startdate) {
      handleSetDate(e, "start");
      return;
    }

    if (starttime) {
      createTimepicker(
        handleTimepickerSetup(e.target),
        startTimeInput.getAttribute("data-form-time"),
        false,
        null
      );
      return;
    }

    if (enddate) {
      handleSetDate(e, "end");
      return;
    }

    if (endtime) {
      createTimepicker(
        handleTimepickerSetup(e.target),
        endTimeInput.getAttribute("data-form-time"),
        true,
        startTimeInput.getAttribute("data-form-time"),
      );
      return;
    }

    if (category) {
      openCategoryModal(e, categories);
      return;
    }

    if (inputError) {
      removeErrorMessages(e);
      return;
    }

    if (customInputError) {
      removeErrorMessages(e);
      return;
    }

    if (clearbtn) {
      entriesForm.reset();
      setFormInitialValues();
      closeCategoryModal();
      return;
    }

    if (submitbtn) {
      handleFormSubmission(e);
      return;
    }
  }

  function delegateFormKeyDown(e) {
    if (!datepicker.classList.contains("hide-datepicker")) {
      return;
    } else {
      const timep = document?.querySelector(".timepicker")

      if (e.key === "Escape") {
        if (timep) {
          closetimepicker()
        } else {
          handleFormClose(e);
        }
      }

      if (e.key === "Enter") {
        handleFormSubmission(e);
      }
    }
  }


  titleInput.blur()
  setFormInitialValues()
}