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
  placePopup
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
import { 
  calcNewHourFromCoords, 
  getOriginalBoxObject 
} from "../../utilities/dragutils"





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
const entriesFormBody = document.querySelector(".entries__form--body")

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


/**
 * list of methods -- I plan on cleaning the form up
 * 
 * closetimepicker
 * setEndDateToNextDay
 * setEndDateToNextHour
 * createTimepicker
 * renderSidebarDatepickerForm
 * getDefaultCategory
 * setInitialFormCategory
 * setFormInitialValues
 * getDatePicker
 * handleOverlayClose
 * handleSetDate
 * getDateFormatViaAttr
 * getTimeFormatViaAttr
 * getDateTimeFormatted
 * configDatesForStore
 * checkFormValidity
 * removeErrorMessages
 * handleFormErrors
 * removeLastFormEntry
 * handleFormClose
 * handleSubmissionRender
 * handleFormSubmission
 * handleCategorySelection
 * closeCategoryModal
 * createCategoryOptions
 * openCategoryModal
 * dragFormAnywhere
 * delegateCategorySelection
 * handleTimepickerSetup
 * delegateEntryFormEvents
 * delegateFormKeyDown
 */

export default function setEntryForm(context, store, datepickerContext) {
  let categories;
  let activeCategories;
  let currentComponent;
  let [year, month, day] = [null, null, null]

  function closetimepicker() {
    const timep = document?.querySelector(".timepicker")
    const timepoverlay = document?.querySelector(".timepicker-overlay")
    const activeTimeElement = document?.querySelector(".active-form-time")
    if (timep) {
      timep.scrollTo(0, 0)
      timep.remove();
      timepoverlay.remove();
    }
    if (activeTimeElement) {
      activeTimeElement.classList.remove("active-form-time")
    }
  }

  function setEndDateToNextDay() {
    const startCurrentDate = startDateInput.getAttribute("data-form-date").split("-").map(x => parseInt(x))
    let nextDay = new Date(
      startCurrentDate[0],
      startCurrentDate[1],
      startCurrentDate[2] + 1
    )
    let nextDayString = `${nextDay.getFullYear()}-${nextDay.getMonth()}-${nextDay.getDate()}`
    let nextDayTitle = locales.labels.monthsShort[nextDay.getMonth()] + " " + nextDay.getDate() + ", " + nextDay.getFullYear();

    endDateInput.setAttribute("data-form-date", nextDayString);
    endDateInput.textContent = nextDayTitle;
    endTimeInput.setAttribute("data-form-time", "00:30")
    endTimeInput.textContent = "12:30am";
  }

  function setEndDateToNextHour() {
    const startCurrentTime = startTimeInput.getAttribute("data-form-time").split(":").map(x => parseInt(x));

    let [newh, newm] = [
      startCurrentTime[0] < 23 ? startCurrentTime[0] + 1 : 23,
      startCurrentTime[0] < 23 ? startCurrentTime[1] : 45
    ]

    let nextHour = new Date(0, 0, 0, newh, newm)
    let md = nextHour.getHours() > 12 ? "pm" : "am"

    let nextHourString = `${nextHour.getHours()}:${nextHour.getMinutes()}`
    let nextHourTitle = `${+nextHour.getHours() % 12}:${+nextHour.getMinutes() == 0 ? "00" : nextHour.getMinutes()}${md}`

    endTimeInput.setAttribute("data-form-time", nextHourString);
    endTimeInput.textContent = nextHourTitle;
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

    let hours = [
      12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ];
    let md = [
      'am', 'am', 'am', 'am', 'am', 'am', 'am', 'am', 'am', 'am', 'am', 'am',
      'pm', 'pm', 'pm', 'pm', 'pm', 'pm', 'pm', 'pm', 'pm', 'pm', 'pm', 'pm',
    ]
    let minutes = ["00", "15", "30", "45"];

    let [currenthour, currentmin] = currentTime.split(":").map((x) => {
      return parseInt(x)
    })

    let currentmd = currenthour > 12 ? "pm" : "am"

    let isSameDay = startDateInput.getAttribute("data-form-date") === endDateInput.getAttribute("data-form-date")
    let shouldTestReset = false;

    if (end && currenthour === 23 && currentmin === 45) {
      shouldTestReset = true;
    }

    currenthour > 12 ? currenthour -= 12 : currenthour


    if (endLimit !== null && isSameDay) {
      let [h, m] = endLimit.split(":").map(x => parseInt(x))
      if (shouldTestReset) {
        if (h === 23 && m >= 15) {
          setEndDateToNextDay();
          closetimepicker()
          return;
        }
      }

      if (h === 23) {
        if (m === 45) {
          setEndDateToNextDay();
        } else {
          hours = [12]
          md = ['pm']
          console.log(m)
          m = m.slice(-1)
        }
      } else {
        hours = hours.slice(+h + 1, hours.length)
        md = md.slice(+h + 1, md.length)
      }
    }

    let count = 0
    let si;
    hours.forEach((hour, houridx) => {
      minutes.forEach(min => {
        const timepickerTime = document.createElement("div")
        timepickerTime.classList.add("timepicker-time")
        let attr;
        if (md[houridx] === "am") {
          if (+hour === 12) {
            attr = `00:${min}`

          } else {
            attr = `${hour}:${min}`
          }
        } else if (md[houridx] === "pm") {
          if (hour === 12) {
            attr = `12:${min}`
          } else {
            attr = `${hour + 12}:${min}`
          }
        }

        timepickerTime.setAttribute("data-tp-time", attr)
        timepickerTime.textContent = `${hour}:${min}${md[houridx]}`
        count++

        if (!end) {
          if (+hour == +currenthour && +min == +currentmin) {
            if (currentmd === "pm" && md[houridx] === "pm") {
              timepickerTime.classList.add("timepicker-time--selected")
              si = count;
            } else if (currentmd === "am" && md[houridx] === "am") {
              timepickerTime.classList.add("timepicker-time--selected")
              si = count;
            }
          }
        }

        timepickerTimesContainer.appendChild(timepickerTime)
      })
    })


    function setnewtime(e) {
      const time = e.target.textContent
      let attr = e.target.getAttribute("data-tp-time")

      if (!end) {
        startTimeInput.textContent = time
        startTimeInput.setAttribute("data-form-time", attr)

        let [testhour, testminute] = attr.split(":").map(x => +x)
        let [endTestHour, endTestMinute] = endTimeInput.getAttribute("data-form-time").split(":").map(x => parseInt(x))

        if (isSameDay) {
          if (testhour === 23 && testminute === 45) {
            setEndDateToNextDay()
          } else {
            if (testhour > endTestHour || (testhour === endTestHour && testminute >= endTestMinute)) {
              setEndDateToNextHour()
            }
          }
        }
      } else {
        endTimeInput.textContent = time;
        endTimeInput.setAttribute("data-form-time", attr)
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
    if (!end) {
      if (si > 0) {
        timepicker.scrollTo(0, parseInt(si * 40) - 40)
      } else {
        timepicker.scrollTo(0, 0);
      }
    } else {
      timepicker.scrollTo(0, 0);
    }
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
    titleInput.blur();
    titleInput.value = "";
    setTimeout(() => {
      titleInput.focus();
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

    if (window.innerHeight - 216 <= bott) {
      datepickerTop = window.innerHeight - 242;
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
    let startTimeAttr = startTimeInput.getAttribute("data-form-time")
    let [starthour, startminute] = getTimeFormatViaAttr(startTimeAttr)

    let endDateAttr = endDateInput.getAttribute("data-form-date")
    let endDate = getDateFormatViaAttr(endDateAttr)
    let endTimeAttr = endTimeInput.getAttribute("data-form-time")
    let [endhour, endminute] = getTimeFormatViaAttr(endTimeAttr)

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
    entriesFormBody.scrollTo({
      top: entriesFormBody.scrollHeight,
      behavior: "smooth"
    })

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

  function handleTimepickerSetup(target) {
    const rect = target.getBoundingClientRect()
    let [x, y] = placePopup(
      180,
      200,
      [parseInt(rect.left), parseInt(rect.top)],
      [window.innerWidth, window.innerHeight],
      false,
    )
    return [x, y]
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
      e.target.classList.add("active-form-time")
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
      e.target.classList.add("active-form-time")
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
      const catsAct = document?.querySelector(".hide-form-category-modal")

      if (e.key === "Escape") {
        if (timep !== null) {
          closetimepicker()
        } else if (catsAct === null) {
          closeCategoryModal()
        } else {
          handleFormClose(e);
        }
      }

      if (e.key === "Enter") {
        handleFormSubmission(e);
      }
    }
  }

  setFormInitialValues()
}