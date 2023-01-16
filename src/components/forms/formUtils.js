import locales from "../../locales/en"
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
    const [x, y] = coordinates;
    const cellWidth = cell.offsetWidth;
    const cellHeight = cell.offsetHeight;
    const cellTop = cell.offsetTop;
    const cellLeft = cell.offsetLeft;
    const windowWidth = window.innerWidth;

    let setTop = top + this.headerOffset.offsetHeight;
    let setMaxWidth = 380;
    let [setLeft, setBottom, setRight, setMargin] = [0, 0, 0, 0];

    // determine which side of the cell to open the form
    if (x === 3) {
      setMargin = "0 auto";
    } else {
      if (x < 3) {
        setLeft = cellWidth * (x + 1);
      } else {
        setLeft = cellWidth * (x - 4);
      }

      // if (y >= 3) {
      //   setTop = cellHeight * (y - 2);
      // } else {
      // }
    }

    this.setFormStyle([setTop, setLeft, setBottom, setRight, setMargin, setMaxWidth]);
  }

  configFormTitleDescriptionInput(title, description) {
    this.formTitleDescription.forEach((input, idx) => {
      input.firstElementChild.value = [title, description][idx]
    })
  }

  setFormDateInput(input, date, minutes, dateFormatted) {
    input.setAttribute(
      "data-form-time", 
      `${date.getHours()}:${minutes}`
    );
    input.setAttribute("data-form-date", dateFormatted)
    input.textContent = `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
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

  configFormDateInputs(dates) {
    for (let i = 0; i < 2; i++) {
      this.setFormDateInput(
        this.formStartEndCtg[i].lastElementChild.firstElementChild, 
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