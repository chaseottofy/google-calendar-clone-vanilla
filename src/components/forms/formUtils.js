import locales from "../../locales/en"
import { placePopup } from "../../utilities/helpers"
class FormConfig {
  constructor() {
    this.monthNames = locales.labels.monthsShort;
    this.headerOffset = document.querySelector(".header");
    this.form = document.querySelector(".entries__form");
    this.formBody = document.querySelector(".entries__form--body");
    this.formTitleDescription = document.querySelectorAll(".form-body-single");
    this.formStartEndCtg = document.querySelectorAll(".form-body-double");
    this.formsubmitbtn = document.querySelector(".form--footer__button-save");
    this.formCategoryWrapper = document.querySelector(".form--body__category-modal--wrapper");
    this.formCategorySelect = document.querySelector(".form--body__category-modal--wrapper-selection");
    this.formCategoryWrapperIcon = document.querySelector(".form--body__category-modal--wrapper__color");
    this.formCategoryTitle = document.querySelector(".form--body__category-modal--wrapper__title");
  }

  setFormStyle([...args]) {
    const [top, left, bottom, right, margin, mWidth] = args;
    this.form.style.top = `${top}px`;
    this.form.style.left = `${left}px`;
    this.form.style.bottom = `${bottom}px`;
    this.form.style.right = `${right}px`;
    this.form.style.margin = `${typeof margin === "string" ? margin : margin + "px"}`;
    this.form.style.maxWidth = `${mWidth}px`;

    if (mWidth < 450) {
      this.formBody.classList.add("form-body-xs");
      this.formTitleDescription.forEach((el) => {
        el.classList.add("form-body-single-xs");
      });
      this.formStartEndCtg.forEach((el) => {
        el.classList.add("form-body-double-xs");
        el.firstElementChild.classList.add("hide-form-body-icon");
      });
    }
  }

  setFormSubmitType(type, id) {
    this.formsubmitbtn.setAttribute("data-form-action", type);
    this.formsubmitbtn.setAttribute(
      "data-form-entry-id",
      id === null ? id = "" : id
    );
  }

  configFormPosition(cell, coordinates, top) {
    // console.log(coordinates)
    // console.log(coordinates)
    // const [x, y] = coordinates;
    // const cellWidth = cell.offsetWidth;
    // const cellHeight = cell.offsetHeight;
    // const cellTop = cell.offsetTop;
    // const cellLeft = cell.offsetLeft;
    // const windowWidth = window.innerWidth;

    // let setTop = top + this.headerOffset.offsetHeight;
    // let setMaxWidth = 380;
    // let [setLeft, setBottom, setRight, setMargin] = [0, 0, 0, 0];
    // console.log(cell, coordinates, top)

    // this.setFormStyle([setTop, setLeft, setBottom, setRight, setMargin, setMaxWidth]);
  }

  configFormTitleDescriptionInput(title, description) {
    this.formTitleDescription.forEach((input, idx) => {
      input.firstElementChild.value = [title, description][idx]
    })
  }

  /**
   * 
   * @param {HTML} input 
   * @param {object} date 
   * @param {number} minutes 
   * @param {string} dateFormatted 
   * @desc
   * Set the date & time for the form input fields
   * Set attributes for date/time inputs
   * Format date/time for display
   */
  setFormDateInput(input, date, minutes, dateFormatted) {
    const [dateinput, timeinput] = [
      input.firstElementChild,
      input.lastElementChild
    ]

    const timeformatted = `${date.getHours()}:${minutes}`
    timeinput.setAttribute(
      "data-form-time",
      timeformatted
    );

    // darn yankee time
    timeinput.textContent = `${+date.getHours() === 0 || +date.getHours() === 12 ? 12 : date.getHours() % 12}:${minutes}${date.getHours() < 12 ? "am" : "pm"}`;

    dateinput.setAttribute("data-form-date", dateFormatted)
    dateinput.textContent = `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  setFormDatepickerDate(context, datepickerContext, start) {
    start = new Date(start);
    context.setDateSelected(start.getDate());
    datepickerContext.setDate(
      context.getYear(),
      context.getMonth(),
      context.getDay(),
    );
    datepickerContext.setDateSelected(start.getDate());
  }


  /**
   * 
   * @param {object} dates 
   * @desc
   * Iterate through object containing the data below to both the start date/time & end date/time form inputs
   * 
   * DateObject: [Date(start), Date(end)]
   * 
   * Minutes: [start minutes, end minutes]
   * 
   * DateString [start date, end date]
   * 
   */
  configFormDateInputs(dates) {
    for (let i = 0; i < 2; i++) {
      this.setFormDateInput(
        this.formStartEndCtg[i].lastElementChild,
        dates.dateObj[i],
        dates.minutes[i],
        dates.formatted[i],
      );
    }
  }

  configFormCategoryInput(categoryData) {
    const [title, color, offsetColor] = categoryData;
    this.formCategoryWrapper.setAttribute("data-form-category", title)
    this.formCategorySelect.style.backgroundColor = offsetColor;
    this.formCategoryWrapperIcon.style.backgroundColor = color;
    this.formCategoryTitle.textContent = title;
  }

  getConfig(data) {
    this.setFormSubmitType(
      data.submission.type,
      data.submission.id
    );

    this.configFormCategoryInput([
      data.category.name,
      data.category.color,
      data.category.offsetColor
    ]);

    this.configFormPosition(
      data.position.cell,
      data.position.coordinates,
      data.position.offsetTop
    );

    this.configFormDateInputs(
      data.dates.object
    );

    if (data.submission.type === "edit") {
      this.configFormTitleDescriptionInput(
        data.submission.title,
        data.submission.description
      )
    }
  }
}

const fullFormConfig = new FormConfig()
export default fullFormConfig