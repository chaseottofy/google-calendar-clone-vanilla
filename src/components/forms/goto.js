import setViews from '../../config/setViews';
import locales from '../../locales/en';
import setSidebarDatepicker from '../menus/sidebarDatepicker';

const gotoOverlay = document.querySelector('.go-to-date-overlay');
const goto = document.querySelector('.go-to-date');
const gotoInput = document.querySelector('.go-to-input');
const inputErrMessage = document.querySelector('.go-to-err');
const cancelGoto = document.querySelector('.cancel-go-to');
const submitGoto = document.querySelector('.submit-go-to');

export default function createGoTo(context, store, datepickerContext) {
  const currDate = context.getDate();
  const { labels } = locales;
  const { monthsShortLower: monthsArray } = labels;

  function validateDate(dateString) {
    const formatMMDDYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const formatMonDDYYYY = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\s+(\d{4})$/i;
    const matchMMDDYYYY = dateString.match(formatMMDDYYYY);
    const matchMonDDYYYY = dateString.match(formatMonDDYYYY);
    let month; let day; let year;

    if (matchMMDDYYYY) {
      // Format: mm/dd/yyyy
      [, month, day, year] = matchMMDDYYYY;
      month = Number.parseInt(month, 10) - 1;
      day = Number.parseInt(day, 10);
      year = Number.parseInt(year, 10);
    } else if (matchMonDDYYYY) {
      const [, monthStr, dayStr, yearStr] = matchMonDDYYYY;
      month = monthsArray.indexOf(monthStr.toLowerCase());
      day = Number.parseInt(dayStr, 10);
      year = Number.parseInt(yearStr, 10);
    } else {
      // If the string doesn't match either format
      return false;
    }

    // Create a new Date object and validate the date
    const date = new Date(year, month, day);
    // Check if the date is valid
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return false;
    }
    return date;
  }

  function removeError() {
    inputErrMessage.style.display = 'none';
    inputErrMessage.onmousedown = null;
  }

  function handleError() {
    inputErrMessage.style.display = 'block';
    inputErrMessage.onmousedown = removeError;
  }

  function handleGoTo() {
    const newdate = validateDate(gotoInput.value.toLowerCase());
    if (newdate instanceof Date) {
      context.setDateFromDateObj(newdate);
      context.setDateSelected(newdate.getDate());
      if (context.getSidebarState() !== 'hide') {
        setSidebarDatepicker(context, store, datepickerContext);
      }

      const component = context.getComponent();
      if (component === 'list') {
        context.setComponent('day');
      }
      closeGoTo();
      setViews(component, context, store, datepickerContext);
    } else {
      handleError();
    }
  }

  function closeGoToOnEscape(e) {
    const key = e.key.toLowerCase();
    if (key === 'escape') {
      if (inputErrMessage.style.display === 'block') {
        removeError();
      } else {
        closeGoTo();
      }
      return;
    }

    if (key === 'enter') {
      handleGoTo();
      return;
    }
  }

  function closeGoTo() {
    document.removeEventListener('keydown', closeGoToOnEscape);
    cancelGoto.onclick = null;
    submitGoto.onclick = null;
    store.removeActiveOverlay('hide-gotodate');
    gotoOverlay.classList.add('hide-gotodate');
    goto.classList.add('hide-gotodate');
    gotoInput.value = '';
  }

  function formatStart() {
    const [year, month, day] = [currDate.getFullYear(), currDate.getMonth(), currDate.getDate()];
    return `${monthsArray[month]} ${day} ${year}`;
  }

  function openGoTo() {
    // prevent keyboard shortcut from being registering in input field onload
    removeError();
    setTimeout(() => {
      gotoInput.focus();
      gotoInput.value = formatStart();
    }, 10); // 10ms is within browser threshold
    gotoOverlay.classList.remove('hide-gotodate');
    goto.classList.remove('hide-gotodate');
    store.addActiveOverlay('hide-gotodate');
    document.addEventListener('keydown', closeGoToOnEscape);
    cancelGoto.onclick = closeGoTo;
    submitGoto.onclick = handleGoTo;
  }

  openGoTo();
}
