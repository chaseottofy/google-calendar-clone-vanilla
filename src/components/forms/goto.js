import locales from "../../locales/en";
import setViews from "../../config/setViews";
import setSidebarDatepicker from "../menus/sidebarDatepicker";
const monthsArray = locales.labels.monthsShortLower;
const monthsArrayLong = locales.labels.monthsLongLower;
const gotoOverlay = document.querySelector(".go-to-date-overlay");
const goto = document.querySelector(".go-to-date");
const gotoInput = document.querySelector(".go-to-input");
const inputErrMessage = document.querySelector(".go-to-err");
const cancelGoto = document.querySelector(".cancel-go-to");
const submitGoto = document.querySelector(".submit-go-to");
export default function createGoTo(context, store, datepickerContext) {
  function validateDate(date) {
    let arr;
    let haserr = false;

    // accepts two formats: DD/MM/YYYY or jan 1 2021
    if (date.includes("/")) {
      arr = date.split("/");
    } else {
      arr = date.split(" ");
    }

    if (arr.length !== 3) {
      haserr = true;
    }

    // convert string year/month/day to int
    // convert 'jan' to 0 || 'january' to 0
    const [month, day, year] = arr.map((date, idx) => {
      let dateInt = parseInt(date);
      let tempMonth = null; // in case of month string


      if (isNaN(dateInt)) {
        if (date.length > 3) {
          tempMonth = monthsArrayLong.indexOf(date.toLowerCase());
        } else {
          tempMonth = monthsArray.indexOf(date.toLowerCase());
        }
      }

      if (idx === 0 && tempMonth === null) {
        dateInt -= 1;
        if (dateInt === -1) {
          dateInt = 0;
        }
      }

      if (tempMonth === -1) {
        haserr = true;
      }

      // check if year is valid
      // if user inputs value less than 100, assume they mean 2000s
      // do not allow year greater than 2100 or less than 1901
      if (idx === 2) {
        if (dateInt < 100) {
          dateInt += 2000;
        } else if (dateInt > 2100) {
          haserr = true;
        } else if (dateInt > 100 && dateInt < 1901) {
          haserr = true;
        }
      }

      return tempMonth === null ? dateInt : tempMonth;
    });


    // form date object and check if valid
    const dateObj = new Date(year, month, day);
    if (dateObj.toString() === "Invalid Date") {
      haserr = true;
    }

    return haserr ? false : dateObj;
  }

  function removeError() {
    inputErrMessage.style.display = "none";
    inputErrMessage.onmousedown = null;
  }

  function handleError() {
    inputErrMessage.style.display = "block";
    inputErrMessage.onmousedown = removeError;
  }

  function handleGoTo() {
    const newdate = validateDate(gotoInput.value);
    if (newdate instanceof Date) {
      context.setDate(
        newdate.getFullYear(),
        newdate.getMonth(),
        newdate.getDate()
      );

      context.setDateSelected(newdate.getDate());
      if (context.getSidebarState() !== "hide") {
        setSidebarDatepicker(context, store, datepickerContext);
      }

      let component = context.getComponent();
      if (component === 'list') {
        component = 'day';
      }

      closeGoTo();
      setViews(component, context, store, datepickerContext);
    } else {
      handleError();
    }
  }

  function closeGoToOnEscape(e) {
    const key = e.key.toLowerCase();
    if (key === "escape") {
      if (inputErrMessage.style.display === "block") {
        removeError();
      } else {
        closeGoTo();
      }
      return;
    }

    if (key === "enter") {
      handleGoTo();
      return;
    }
  }

  function closeGoTo() {
    document.removeEventListener("keydown", closeGoToOnEscape);
    cancelGoto.onclick = null;
    submitGoto.onclick = null;
    store.removeActiveOverlay("hide-gotodate");
    gotoOverlay.classList.add("hide-gotodate");
    goto.classList.add("hide-gotodate");
    gotoInput.value = "";
  }

  function formatStart() {
    const [year, month, day] = [
      context.getYear(),
      context.getMonth(),
      context.getDay(),
    ];
    return `${monthsArray[month]} ${day} ${year}`;
  }

  function openGoTo() {
    // prevent keyboard shortcut from being registering in input field onload
    removeError();
    setTimeout(() => {
      gotoInput.focus();
      gotoInput.value = formatStart();
    }, 10); // 10ms is within browser threshold
    gotoOverlay.classList.remove("hide-gotodate");
    goto.classList.remove("hide-gotodate");
    store.addActiveOverlay("hide-gotodate");
    document.addEventListener("keydown", closeGoToOnEscape);
    cancelGoto.onclick = closeGoTo;
    submitGoto.onclick = handleGoTo;
  }

  openGoTo();
}