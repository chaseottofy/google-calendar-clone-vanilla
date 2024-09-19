// render methods
import setViews from '../../config/setViews';
import locales from '../../locales/en';
// date / time helpers
import {
  getDateForStore,
  getDateFromAttribute,
  getHour12Time,
  getHour24Time,
  getHourMinInts,
  getNextQuarterHour,
  isBeforeDate,
  isDate,
} from '../../utilities/dateutils';
// event helpers
import {
  getClosest,
  placePopup,
  throttle,
} from '../../utilities/helpers';
// svgs
import { createCheckIcon } from '../../utilities/svgs';
import setDatepicker from '../menus/datepicker';
import setSidebarDatepicker from '../menus/sidebarDatepicker';
import createToast from '../toastPopups/toast';

// main app sidebar
const sidebar = document.querySelector('.sidebar');
// main app datepicker / overlay
const datepicker = document.querySelector('.datepicker');
const datepickeroverlay = document.querySelector('.datepicker-overlay');

// form wrappers / overlay
const formOverlay = document.querySelector('.form-overlay');
const formModalOverlay = document.querySelector('.form-modal-overlay');
const entriesFormWrapper = document.querySelector('.entries__form');
const entriesFormHeader = document.querySelector('.entries__form--header');
const entriesForm = document.querySelector('.entry-form');
const entriesFormBody = document.querySelector('.entries__form--body');

// title / description inputs
const titleInput = document.querySelector('.form--body__title-input');
const descriptionInput = document.querySelector('.form--body__description-input');

// start date / time
// end date / time
const startDateInput = document.querySelector('.form--body-start__date');
const endDateInput = document.querySelector('.form--body-end__date');

const startTimeInput = document.querySelector('.form--body-start__time');
const endTimeInput = document.querySelector('.form--body-end__time');

// category modal
const categoryModal = document.querySelector('.form--body__category-modal');
const closeCategoryModalBtn = document.querySelector('.close-options-floating__btn');
const categoryModalIcon = document.querySelector('.form--body__category-icon');
const categoryModalWrapper = document.querySelector('.form--body__category-modal--wrapper');
const selectedCategoryWrapper = document.querySelector('.form--body__category-modal--wrapper-selection');
const selectedCategoryColor = document.querySelector('.form--body__category-modal--wrapper__color');
const selectedCategoryTitle = document.querySelector('.form--body__category-modal--wrapper__title');

// reset / save btns
const formSubmitButton = document.querySelector('.form--footer__button-save');
// const hasCSS = false
export default function setEntryForm(context, store, datepickerContext) {
  let categories;
  let activeCategories;
  let currentComponent;
  let [year, day] = [null, null, null];

  function closetimepicker() {
    const timep = document?.querySelector('.timepicker');
    const timepoverlay = document?.querySelector('.timepicker-overlay');
    const timepcontainer = document?.querySelector('.timepicker-times__container');
    const activeTimeElement = document?.querySelector('.active-form-time');
    if (timep) {
      timep.scrollTo(0, 0);
      timep.remove();
      timepoverlay.remove();
      timepoverlay.onclick = null;
      timepcontainer.onclick = null;
    }

    if (activeTimeElement) {
      activeTimeElement.classList.remove('active-form-time');
    }
  }

  function setEndDateToNextDay() {
    const { labels } = locales;
    const startCurrentDate = startDateInput.getAttribute('data-form-date').split('-').map((x) => Number.parseInt(x));
    const nextDay = new Date(
      startCurrentDate[0],
      startCurrentDate[1],
      startCurrentDate[2] + 1,
    );

    const nextDayString = `${nextDay.getFullYear()}-${nextDay.getMonth()}-${nextDay.getDate()}`;
    const nextDayTitle = labels.monthsShort[nextDay.getMonth()] + ' ' + nextDay.getDate() + ', ' + nextDay.getFullYear();
    endDateInput.setAttribute('data-form-date', nextDayString);
    endDateInput.textContent = nextDayTitle;
    endTimeInput.setAttribute('data-form-time', '00:30');
    endTimeInput.textContent = '12:30am';
  }

  function createTimepicker(coords, currentTime, end, endLimit) {
    const timepicker = document.createElement('div');
    timepicker.classList.add('timepicker');
    timepicker.style.top = `${coords.y}px`;
    timepicker.style.left = `${coords.x}px`;

    const timepickerOverlay = document.createElement('div');
    timepickerOverlay.classList.add('timepicker-overlay');

    const timepickerTimesContainer = document.createElement('div');
    timepickerTimesContainer.classList.add('timepicker-times__container');
    const startDateValue = startDateInput.getAttribute('data-form-date');
    const endDateValue = endDateInput.getAttribute('data-form-date');
    const isSameDate = startDateValue === endDateValue;

    if (endLimit === null || !isSameDate) {
      const [currhr, currmin] = getHourMinInts(currentTime);
      for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
          const [h, m] = getHourMinInts(`${i}:${j}`);
          const timepickerTime = document.createElement('div');
          timepickerTime.classList.add('timepicker-time');
          timepickerTime.setAttribute('data-tp-for', end ? 'end' : 'start');
          timepickerTime.setAttribute('data-tp-time', `${h}:${m}`);
          timepickerTime.textContent = getHour12Time(h, m);
          if (h === currhr && m === currmin) {
            timepickerTime.classList.add('timepicker-time--selected');
          }
          timepickerTimesContainer.append(timepickerTime);
        }
      }
    } else {
      if (startDateValue === endDateValue) {
        if (currentTime === '11:45') {
          setEndDateToNextDay();
          currentTime = '00:00';
        }
      }
      const min = startTimeInput.getAttribute('data-form-time');
      const [currhr, currmin] = getHourMinInts(min);
      let [temphr, tempmin] = [currhr, currmin];
      for (let i = currhr; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
          const [h, m] = getHourMinInts(`${i}:${j}`);
          if (h <= temphr) {
            if (m <= tempmin) continue;
          }
          const timepickerTime = document.createElement('div');
          timepickerTime.classList.add('timepicker-time');
          timepickerTime.setAttribute('data-tp-for', end ? 'end' : 'start');
          timepickerTime.setAttribute('data-tp-time', `${h}:${m}`);
          timepickerTime.textContent = getHour12Time(h, m);
          timepickerTimesContainer.append(timepickerTime);
        }
      }
    }

    function setnewtime(e) {
      const { target } = e;
      const time = target.textContent;
      const attr = target.getAttribute('data-tp-time');
      const attrFor = target.getAttribute('data-tp-for');
      const [testhour, testminute] = getHourMinInts(attr);
      const [endTestHour, endTestMinute] = getHourMinInts(endTimeInput.getAttribute('data-form-time'));

      if (attrFor === 'start') {
        startTimeInput.textContent = time.startsWith('0') ? time.slice(1) : time;
        startTimeInput.setAttribute('data-form-time', attr);
        if (testhour > endTestHour || (testhour === endTestHour && testminute >= endTestMinute)) {
          let [t1, t2] = getNextQuarterHour(testhour, testminute);
          endTimeInput.textContent = t1;
          endTimeInput.setAttribute('data-form-time', t2.join(':'));
        }
      } else {
        endTimeInput.textContent = time.startsWith('0') ? time.slice(1) : time;
        endTimeInput.setAttribute('data-form-time', attr);
      }
      closetimepicker();
    }

    const delegateNewTime = (e) => {
      if (getClosest(e, '.timepicker-time')) {
        setnewtime(e);
        return;
      }
    };

    timepicker.append(timepickerTimesContainer);
    const [x, y] = coords;
    timepicker.setAttribute('style', `top:${y}px; left:${x}px;`);
    document.body.prepend(timepickerOverlay, timepicker);
    timepickerOverlay.onclick = closetimepicker;
    timepickerTimesContainer.onclick = delegateNewTime;
    const activeTimeElement = document?.querySelector('.timepicker-time--selected');
    if (activeTimeElement) {
      timepicker.scrollTo(0, activeTimeElement.offsetTop);
    }
  }

  function renderSidebarDatepickerForm() {
    if (!sidebar.classList.contains('hide-sidebar')) {
      context.setDateSelected(day);
      setSidebarDatepicker(context, store, datepickerContext);
    }
  }

  function getDatePicker(dpyear, dpmonth, dpday) {
    datepickeroverlay.classList.remove('hide-datepicker-overlay');
    datepicker.classList.remove('hide-datepicker');
    store.addActiveOverlay('hide-datepicker-overlay');
    datepickerContext.setDate(dpyear, dpmonth, dpday);
    datepickerContext.setDateSelected(dpday);
    setDatepicker(context, store, datepickerContext, 'form');
  }

  function handleSetDate(e, type) {
    e.preventDefault();
    if (type === 'start') {
      startDateInput.setAttribute('class', 'form--body-start__date active-form-date');
      endDateInput.setAttribute('class', 'form--body-end__date inactive-form-date');
    } else {
      startDateInput.setAttribute('class', 'form--body-start__date inactive-form-date');
      endDateInput.setAttribute('class', 'form--body-end__date active-form-date');
    }

    const [y, m, d] = getDateFromAttribute(e.target, 'data-form-date');
    const rect = e.target.getBoundingClientRect();
    const datepickerLeft = Number.parseInt(rect.left);
    const bott = Number.parseInt(rect.bottom);
    let datepickerTop = Number.parseInt(rect.top);

    if (type === 'end') {
      datepickerTop -= 40;
    }

    if (window.innerHeight - 216 <= bott) {
      datepickerTop = window.innerHeight - 242;
    }

    datepicker.setAttribute('style', `top:${datepickerTop}px;left:${datepickerLeft}px;`);
    getDatePicker(y, m, d);
  }

  function getDateFormatViaAttr(dateAttr) {
    return new Date(...dateAttr.split('-').map((x) => Number.parseInt(x)));
  }

  function getDateTimeFormatted(dateAttr, timeAttr) {
    dateAttr.setHours(timeAttr[0]);
    dateAttr.setMinutes(timeAttr[1]);
    dateAttr.setSeconds(0);
    return dateAttr;
  }

  function configDatesForStore() {
    const startDateAttr = startDateInput.getAttribute('data-form-date');
    const startDate = getDateFormatViaAttr(startDateAttr);
    const startTimeAttr = startTimeInput.getAttribute('data-form-time');
    const [starthour, startminute] = getHourMinInts(startTimeAttr);

    const endDateAttr = endDateInput.getAttribute('data-form-date');
    const endDate = getDateFormatViaAttr(endDateAttr);
    const endTimeAttr = endTimeInput.getAttribute('data-form-time');
    const [endhour, endminute] = getHourMinInts(endTimeAttr);

    return [
      getDateTimeFormatted(startDate, [starthour, startminute]),
      getDateTimeFormatted(endDate, [endhour, endminute]),
    ];
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
    };
    /* ************************ */
    /*  TITLE VALIDATION CHECK */
    if (typeof title === 'string') {
      const titlecheck = title.trim().replaceAll(/[^\s\w-]+|\s{2,}/g, ' ');
      if (titlecheck.length > 50) {
        status.title = 'Title must be Less than 50 characters';
        status.valid = false;
      } else if (titlecheck.length === 0) {
        status.title = 'Title cannot be empty';
        status.valid = false;
      }
    } else {
      status.title = 'Title cannot be empty';
    }
    /* ***************************** */
    /*  DESCRIPTION VALIDATION CHECK */
    if (description.length >= 200) {
      status.description = 'Description must be less than 200 characters';
      status.valid = false;
    }
    /* ************************** */
    /*  CATEGORY VALIDATION CHECK */
    if (!store.hasCtg(category) || !category) {
      categoryModalWrapper.setAttribute('data-form-category', 'default');
    }
    /* **************************** */
    /*  START DATE VALIDATION CHECK */
    if (!startDate) {
      status.startDate = 'Start date cannot be empty';
      status.valid = false;
    } else if (!isDate(startDate)) {
      status.startDate = 'Start date is not valid';
      status.valid = false;
    }
    /* **************************** */
    /*  END DATE VALIDATION CHECK */
    if (!endDate) {
      status.endDate = 'End date cannot be empty';
      status.valid = false;
    } else if (!isDate(endDate)) {
      status.endDate = 'End date is not valid';
      status.valid = false;
    } else if (!isBeforeDate(startDate, endDate)) {
      status.endDate = 'End date must be after start date';
      status.valid = false;
    }
    /* ************* */
    /*  congregate any errors  */
    const errors = {};
    let hasErrors;
    for (const key in status) {
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
    if (e.target.classList.contains('form-input-error')) {
      e.preventDefault();
      e.target.classList.remove('form-input-error');
      e.target.removeAttribute('data-form-error-message');
      e.target.firstElementChild.focus();
    } else if (e.target.classList.contains('form-input-error__custom-input')) {
      e.target.classList.remove('form-input-error__custom-input');
      e.target.removeAttribute('data-form-error-message');
      e.target.focus();
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
    titleInput.blur();

    const components = {
      title: titleInput,
      description: descriptionInput,
      startDate: startDateInput,
      endDate: endDateInput,
    };
    const err = {
      inputAttr: 'data-form-error-message',
      inputClass: 'form-input-error',
      svgClass: 'form-input-error__custom-input',
      submitbtn: 'form-error__submit-btn',
    };

    for (const key in errorMessages) {
      if (components[key]) {
        if (key === 'title' || key === 'description') {
          components[key].parentElement.setAttribute(err.inputAttr, errorMessages[key]);
          components[key].parentElement.classList.add(err.inputClass);
        } else {
          components[key].setAttribute(err.inputAttr, errorMessages[key]);
          components[key].classList.add(err.svgClass);
          const svg = components[key].parentElement.parentElement.firstElementChild.firstElementChild;
          svg.style.fill = 'var(--red2)';
          setTimeout(() => { svg.style.fill = 'var(--white3)'; }, 1000);
        }
      }
    }

    formSubmitButton.classList.add(err.submitbtn);
    setTimeout(() => { formSubmitButton.classList.remove(err.submitbtn); }, 1000);
  }

  function removeLastFormEntry() {
    store.removeLastEntry();
    setViews(currentComponent, context, store, datepickerContext);
  }

  function undoLastFormEdit(id, entryBefore) {
    const start = new Date(entryBefore.start);
    store.updateEntry(
      id,
      {
        category: entryBefore.category,
        completed: entryBefore.completed,
        description: entryBefore.description,
        end: new Date(entryBefore.end),
        id: id,
        start: start,
        title: entryBefore.title,
      },
    );

    context.setDate(start.getFullYear(), start.getMonth(), start.getDate());
    context.setDateSelected(start.getDate());
    setViews(currentComponent, context, store, datepickerContext);
  }

  function clearAllErrors() {
    const inputErrElements = document?.querySelectorAll('.form-input-error');
    if (inputErrElements) {
      for (const el of inputErrElements) {
        el.classList.remove('form-input-error');
        el.removeAttribute('data-form-error-message');
      }
    }
  }

  function handleFormClose() {
    if (!datepicker.classList.contains('hide-datepicker')) {
      datepicker.classList.add('hide-datepicker');
      datepickeroverlay.classList.add('hide-datepicker-overlay');
    }

    clearAllErrors();

    formOverlay.onclick = null;
    entriesFormHeader.onmousedown = null;
    entriesFormWrapper.onclick = null;
    document.removeEventListener('keydown', delegateFormKeyDown);
    entriesFormWrapper.classList.add('hide-form');
    formOverlay.classList.add('hide-form-overlay');
    store.removeActiveOverlay('hide-datepicker-overlay');
    store.removeActiveOverlay('hide-form-overlay');
    entriesForm.reset();
    descriptionInput.value = '';
    titleInput.value = '';

    if (categoryModalWrapper.classList.contains('category-modal-open')) {
      closeCategoryModal();
    }

    const resetCurrentView = store.getFormResetHandle(currentComponent);
    if (resetCurrentView !== null) {
      resetCurrentView();
      store.setFormResetHandle(currentComponent, null);
    } else {
      return;
    }
  }

  function handleSubmissionRender(start, type, id, entryBefore) {
    context.setDate(start.getFullYear(), start.getMonth(), start.getDate());
    context.setDateSelected(start.getDate());
    setViews(currentComponent, context, store, datepickerContext);

    if (store.getDayEntriesArray(context.getDate()).length <= 1) {
      renderSidebarDatepickerForm();
    }

    handleFormClose();

    // if the submission type is create, pass a callback function to allow user to remove the last entry if they wish
    if (type === 'create') {
      setTimeout(() => {
        createToast('Event created', removeLastFormEntry);
      }, 4);
    } else {
      // if the submission type is edit, pass a callback function to allow user to undo the last edit if they wish

      // determine whether the entry was edited or not
      const shouldCreateToast = store.compareEntries(
        entryBefore,
        store.getEntry(id),
      );

      if (!shouldCreateToast) {
        const handleUndoLastEdit = () => {
          undoLastFormEdit(id, entryBefore);
        };
        setTimeout(() => {
          createToast('Event updated', handleUndoLastEdit);
        }, 4);
      }
    }
  }

  function handleFormSubmission(e) {
    e.preventDefault();
    const title = titleInput.value;
    const description = descriptionInput.value;
    const [startDate, endDate] = configDatesForStore();
    const category = categoryModalWrapper.getAttribute('data-form-category');

    // if errors exist, validityStatus will represent an object with keys that match the input names, and values that represent the error messages as strings;
    // note that two types of submissions are possible: edit and create
    const validityStatus = checkFormValidity(title, description, category, startDate, endDate);

    if (validityStatus !== true) {
      handleFormErrors(validityStatus);
      return;
    } else {
      // submission : edit
      if (formSubmitButton.getAttribute('data-form-action') === 'edit') {
        const id = formSubmitButton.getAttribute('data-form-entry-id');
        const entryBefore = structuredClone(store.getEntry(id));
        store.updateEntry(
          id,
          {
            category: category,
            completed: false,
            description: description,
            end: endDate,
            id: id,
            start: startDate,
            title: title,
          },
        );

        handleSubmissionRender(startDate, 'edit', id, entryBefore);
        return;
      } else {
        // submission : create
        store.createEntry(category, false, description, endDate, startDate, title);
        handleSubmissionRender(startDate, 'create', store.getLastEntryId(), null);
      }
    }
  }

  function handleCategorySelection(e) {
    const title = e.target.getAttribute('data-form-category-title');
    const color = e.target.getAttribute('data-form-category-color');
    categoryModalWrapper.setAttribute('data-form-category', title);
    categoryModalIcon.firstElementChild.setAttribute('fill', color);

    selectedCategoryWrapper.style.backgroundColor = color;
    selectedCategoryColor.style.backgroundColor = color;
    selectedCategoryTitle.textContent = title;
    closeCategoryModal();
  }

  function closeCategoryModal() {
    closeCategoryModalBtn.style.display = 'none';
    categoryModalWrapper.classList.remove('category-modal-open');
    categoryModal.classList.add('hide-form-category-modal');
    selectedCategoryWrapper.classList.remove('hide-form-category-selection');
    formModalOverlay.classList.add('hide-form-overlay');
    categoryModalWrapper.removeAttribute('style');
    categoryModal.innerText = '';
  }

  function createCategoryOptions(parent, ctgopts) {
    const currentCategory = categoryModalWrapper.getAttribute('data-form-category');

    // I keep seeing that forEach is slower than for of loop, is this true?
    for (const [key, value] of ctgopts) {
      const color = value.color;
      const categoryWrapper = document.createElement('div');
      categoryWrapper.classList.add('category-modal--category');
      categoryWrapper.style.width = '200px';

      categoryWrapper.style.backgroundColor = color;
      categoryWrapper.setAttribute('data-form-category-title', key);
      categoryWrapper.setAttribute('data-form-category-color', color);

      const categoryDisplayColor = document.createElement('div');
      categoryDisplayColor.classList.add('category-modal--category-color');
      categoryDisplayColor.style.backgroundColor = color;

      const categoryTitle = document.createElement('div');
      categoryTitle.classList.add('category-modal--category-title');
      categoryTitle.textContent = key;

      if (key === currentCategory) {
        const checkIcon = createCheckIcon('var(--white4)');
        const checkIconWrapper = document.createElement('div');
        checkIconWrapper.classList.add('category-modal--category-check');
        checkIconWrapper.append(checkIcon);

        categoryWrapper.append(
          categoryDisplayColor,
          categoryTitle,
          checkIconWrapper,
        );

      } else {
        categoryWrapper.append(categoryDisplayColor, categoryTitle);
      }

      parent.append(categoryWrapper);
    }
  }

  function openCategoryModal(e, ctgmodal) {
    const length = ctgmodal.length;
    if (length === 1) return;

    closeCategoryModalBtn.removeAttribute('style');
    setTimeout(() => {
      entriesFormBody.scrollTo({
        top: entriesFormBody.scrollHeight,
        behavior: 'smooth',
      });
    }, 5);

    if (length >= 5) {
      closeCategoryModalBtn.setAttribute('style', 'top: -100px');
    } else {
      closeCategoryModalBtn.setAttribute('style', `top: ${(length * 20) * -1}px`);
    }

    categoryModalWrapper.classList.add('category-modal-open');
    if (length < 5) {
      categoryModalWrapper.style.height = `${length * 32}px`;
    } else {
      categoryModalWrapper.style.height = '160px';
    }

    selectedCategoryWrapper.classList.add('hide-form-category-selection');
    categoryModal.classList.remove('hide-form-category-modal');
    categoryModal.style.height = `${length * 32}px`;
    categoryModal.innerText = '';
    createCategoryOptions(categoryModal, ctgmodal);
    formModalOverlay.classList.remove('hide-form-overlay');
  }

  function dragFormAnywhere(e) {
    const closeBtn = document.querySelector('.form--header__icon-close');
    const rect = entriesFormWrapper.getBoundingClientRect();

    // get current left / top form position
    const [currleft, currtop] = [
      Number.parseInt(rect.left),
      Number.parseInt(rect.top),
    ];

    entriesFormWrapper.style.margin = '0';
    entriesFormWrapper.style.opacity = '0.8';
    entriesFormWrapper.style.userSelect = 'none';
    entriesFormWrapper.style.top = currtop + 'px';
    entriesFormWrapper.style.left = currleft + 'px';
    entriesFormWrapper.style.bottom = '0';
    entriesFormWrapper.style.right = '0';
    closeBtn.style.pointerEvents = 'none';
    entriesForm.style.pointerEvents = 'none';

    let [leftBefore, topBefore] = [e.clientX, e.clientY];
    const [winH, winW] = [window.innerHeight, window.innerWidth];

    function mousemove(e) {
      const [leftAfter, topAfter] = [
        leftBefore - e.clientX, topBefore - e.clientY,
      ];

      leftBefore = e.clientX;
      topBefore = e.clientY;

      if (entriesFormWrapper.offsetTop < 0) {
        entriesFormWrapper.style.top = '0px';
      }

      if (entriesFormWrapper.offsetLeft < 0) {
        entriesFormWrapper.style.left = '0px';
      }

      if ((entriesFormWrapper.offsetLeft + entriesFormWrapper.offsetWidth) > winW) {
        entriesFormWrapper.style.left = winW - entriesFormWrapper.offsetWidth + 'px';
      }

      if ((entriesFormWrapper.offsetTop + entriesFormWrapper.offsetHeight) > winH) {
        entriesFormWrapper.style.top = winH - entriesFormWrapper.offsetHeight + 'px';
      }

      entriesFormWrapper.style.top = entriesFormWrapper.offsetTop - topAfter + 'px';
      entriesFormWrapper.style.left = entriesFormWrapper.offsetLeft - leftAfter + 'px';
    }

    const throttlemove = throttle(mousemove, 10);

    function mouseup() {
      entriesFormWrapper.style.opacity = '1';
      entriesFormWrapper.style.userSelect = 'all';
      closeBtn.removeAttribute('style');
      entriesForm.removeAttribute('style');
      document.removeEventListener('mousemove', throttlemove);
      document.removeEventListener('mouseup', mouseup);
    }

    document.addEventListener('mousemove', throttlemove);
    document.addEventListener('mouseup', mouseup);
  }

  function handleTimepickerSetup(target) {
    const rect = target.getBoundingClientRect();
    const [x, y] = placePopup(
      180,
      200,
      [Number.parseInt(rect.left), Number.parseInt(rect.top)],
      [window.innerWidth, window.innerHeight],
      false,
    );
    return [x, y];
  }

  function delegateEntryHeader(e) {
    const dragHeader = getClosest(e, '.form-header--dragarea');
    const closeicon = getClosest(e, '.form--header__icon-close');
    if (dragHeader) {
      if (window.innerWidth < 500 || window.innerHeight < 500) {
        return;
      } else dragFormAnywhere(e);
      return;
    }

    if (closeicon) {
      handleFormClose(e);
      return;
    }
  }

  function delegateEntryFormEvents(e) {
    // date / time inputs
    const startdate = getClosest(e, '.form--body-start__date');
    const starttime = getClosest(e, '.form--body-start__time');
    const enddate = getClosest(e, '.form--body-end__date');
    const endtime = getClosest(e, '.form--body-end__time');

    // category selection
    const getCategoryModal = getClosest(e, '.form--body__category-modal');
    const category = getClosest(e, '.form--body__category-modal--wrapper-selection');
    const getcloseCategoryModalBtn = getClosest(e, '.close-options-floating__btn');
    const getCategoryModalOverlay = getClosest(e, '.form-modal-overlay');

    // error msg : <input> / <textarea>
    const inputError = getClosest(e, '.form-input-error');

    // error msg : custom inputs (date / time)
    const customInputError = getClosest(e, '.form-input-error__custom-input');

    // form footer buttons
    const resetbtn = getClosest(e, '.form--footer__button-cancel');
    const submitbtn = getClosest(e, '.form--footer__button-save');

    if (startdate) {
      handleSetDate(e, 'start');
      return;
    }

    if (starttime) {
      e.target.classList.add('active-form-time');
      createTimepicker(
        handleTimepickerSetup(e.target),
        startTimeInput.getAttribute('data-form-time'),
        false,
        null,
      );
      return;
    }

    if (enddate) {
      handleSetDate(e, 'end');
      return;
    }

    if (endtime) {
      e.target.classList.add('active-form-time');
      createTimepicker(
        handleTimepickerSetup(e.target),
        endTimeInput.getAttribute('data-form-time'),
        true,
        startTimeInput.getAttribute('data-form-time'),
      );
      return;
    }

    if (getCategoryModal) {
      if (categoryModal.childElementCount > 0) {
        handleCategorySelection(e);
      }
      return;
    }

    if (category) {
      openCategoryModal(e, categories);
      return;
    }

    if (getcloseCategoryModalBtn) {
      closeCategoryModal();
      return;
    }

    if (getCategoryModalOverlay) {
      closeCategoryModal();
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

    if (resetbtn) {
      entriesForm.reset();
      clearAllErrors();
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
    if (!datepicker.classList.contains('hide-datepicker')) {
      return;
    } else {
      const timep = document?.querySelector('.timepicker');
      const catsAct = document?.querySelector('.hide-form-category-modal');

      if (e.key === 'Escape') {
        if (timep !== null) {
          closetimepicker();
        } else if (catsAct === null) {
          closeCategoryModal();
        } else {
          handleFormClose(e);
        }
      }

      if (e.key === 'Enter') {
        if (timep !== null) {
          closetimepicker();
        } else if (catsAct === null) {
          closeCategoryModal();
        } else {
          handleFormSubmission(e);
        }
      }
    }
  }

  function setFormInitialValues() {
    categories = Object.entries(store.getAllCtg());
    activeCategories = store.getActiveCategoriesKeyPair();
    currentComponent = context.getComponent();
    year = context.getYear();
    day = context.getDay();
    // ****************************************** //
    // title / description
    descriptionInput.value = '';
    titleInput.blur();
    titleInput.value = '';
    setTimeout(() => {
      titleInput.focus();
    }, 10);

    // ****************************************** //
    // category setup
    setInitialFormCategory();

    // ****************************************** //
    // date picker setup
    datepickerContext.setDate(context.getDate());
    context.setDateSelected(day);

    // ****************************************** //
    // date inputs setup
    const dateSelected = `${context.getMonthName().slice(0, 3)} ${day}, ${year}`;
    // DATES : START/END
    startDateInput.textContent = dateSelected;
    startDateInput.setAttribute('data-form-date', getDateForStore(context.getDate()));
    endDateInput.textContent = dateSelected;
    endDateInput.setAttribute('data-form-date', getDateForStore(context.getDate()));

    // TIME : START/END
    const tempdate = context.getDate();
    let [th, tm] = [tempdate.getHours(), tempdate.getMinutes()];
    tm = tm % 15 !== 0 ? (Math.ceil(tm / 15) * 15) : tm;
    let [t1, t2] = getNextQuarterHour(th, tm);
    if (th === 23 && tm === 45) {
      setEndDateToNextDay();
      [t1, t2] = getNextQuarterHour(1, 15);
    }
    endTimeInput.textContent = t1;
    endTimeInput.setAttribute('data-form-time', t2.join(':'));

    startTimeInput.setAttribute('data-form-time', getHour24Time(th, tm));
    startTimeInput.textContent = getHour12Time(th, tm);
    // ****************************************** //
    // submit button setup
    formSubmitButton.setAttribute('data-form-action', 'create');
    formSubmitButton.setAttribute('data-form-id', '');

    // ****************************************** //
    // approve form event delegation
    entriesFormHeader.onmousedown = delegateEntryHeader;
    formOverlay.onclick = handleFormClose;
    entriesFormWrapper.onclick = delegateEntryFormEvents;
    document.addEventListener('keydown', delegateFormKeyDown);
    // ****************************************** //
  }

  function getDefaultCategory() {
    if (activeCategories.length === 0) {
      return [categories[0][0], categories[0][1].color];
    } else {
      return [activeCategories[0][0], activeCategories[0][1].color];
    }
  }

  function setInitialFormCategory() {
    const [categoryTitle, categoryColor] = getDefaultCategory();
    categoryModalWrapper.setAttribute('data-form-category', categoryTitle);
    selectedCategoryWrapper.style.backgroundColor = categoryColor;
    selectedCategoryTitle.textContent = categoryTitle;
    selectedCategoryColor.style.backgroundColor = categoryColor;
    categoryModalIcon.firstElementChild.setAttribute('fill', categoryColor);
  }

  // async function initForm() {
  //   if (entriesFormWrapper.getAttribute('data-has-css') === 'false') {
  //     setFormInitialValues();
  //     await import('../../styles/aside/form.css').then(() => {
  //       entriesFormWrapper.setAttribute('data-has-css', 'true');
  //     });
  //   } else {
  //   }
  // }
  // initForm();
  setFormInitialValues();
}
