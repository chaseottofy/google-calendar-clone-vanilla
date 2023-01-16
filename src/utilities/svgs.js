let n = 40;
export default n

const createSortPlaceholderIcon = () => {
  const iconwrapper = document.createElement("span")
  iconwrapper.classList.add("lvhi-sort--placeholder")
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "20");
  icon.setAttribute("width", "20");
  icon.style.transform = "scale(0.7) rotate(90deg)"
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M8.5 15 3 10l5.5-5Zm-1-2.25v-5.5L4.5 10Zm4 2.25V5l5.5 5Z");
  icon.appendChild(path);
  iconwrapper.appendChild(icon)
  return iconwrapper;
}

const createStatusIcon = () => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "24");
  icon.setAttribute("width", "24");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "var(--white3)")
  icon.classList.add("lvhi-status--icon")
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M0 0h24v24H0z")
  pathone.setAttribute("fill", "none")
  const pathtwo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathtwo.setAttribute("d", "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z");
  icon.append(pathone, pathtwo)
  return icon
}

const createCategoryIcon = () => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "24");
  icon.setAttribute("width", "24");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "var(--white3)");
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M0 0h24v24H0z")
  pathone.setAttribute("fill", "none")
  const pathtwo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathtwo.setAttribute("d", "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z");
  icon.classList.add("lvhi-category--icon")
  icon.append(pathone, pathtwo);
  return icon;
}

const createEditIcon = () => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "20");
  icon.setAttribute("width", "20");
  icon.setAttribute("fill", "var(--white3)")
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M10 16q-.625 0-1.062-.438Q8.5 15.125 8.5 14.5t.438-1.062Q9.375 13 10 13t1.062.438q.438.437.438 1.062t-.438 1.062Q10.625 16 10 16Zm0-4.5q-.625 0-1.062-.438Q8.5 10.625 8.5 10t.438-1.062Q9.375 8.5 10 8.5t1.062.438q.438.437.438 1.062t-.438 1.062q-.437.438-1.062.438ZM10 7q-.625 0-1.062-.438Q8.5 6.125 8.5 5.5t.438-1.062Q9.375 4 10 4t1.062.438q.438.437.438 1.062t-.438 1.062Q10.625 7 10 7Z")
  icon.appendChild(pathone)
  return icon;
}

const createPencilIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "20");
  icon.setAttribute("width", "20");
  icon.setAttribute("viewBox", "0 0 24 24")
  if (!fill) {
    icon.setAttribute("fill", "var(--white3)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L3 16.82V21h4.18L20.41 7.77c.79-.78.79-2.05 0-2.83zm-14 14.12L5 19v-1.36l9.82-9.82 1.41 1.41-9.82 9.83z");
  icon.appendChild(pathone)
  return icon;
}

const createTrashIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "24");
  icon.setAttribute("width", "24");
  icon.setAttribute("viewBox", "0 0 24 24");
  if (!fill) {
    icon.setAttribute("fill", "var(--white3)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13z")
  const pathtwo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathtwo.setAttribute("d", "M9 8h2v9H9zm4 0h2v9h-2z")
  icon.append(pathone, pathtwo)
  return icon;
}

const createCloseIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "20");
  icon.setAttribute("width", "20");
  if (!fill) {
    icon.setAttribute("fill", "var(--white3)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M6.062 15 5 13.938 8.938 10 5 6.062 6.062 5 10 8.938 13.938 5 15 6.062 11.062 10 15 13.938 13.938 15 10 11.062Z")
  icon.appendChild(pathone)
  return icon;
}

const createCaretDownIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "18");
  icon.setAttribute("width", "18");
  icon.setAttribute("viewBox", "0 0 24 24");
  if (!fill) {
    icon.setAttribute("fill", "var(--white3)")
  } else {
    icon.setAttribute("fill", fill)
  }

  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M0 0h24v24H0z");
  pathone.setAttribute("fill", "none");
  const pathtwo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathtwo.setAttribute("d", "M7 10l5 5 5-5z");
  icon.append(pathone, pathtwo)
  return icon;
}

const createCaretUpIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "18");
  icon.setAttribute("width", "18");
  icon.setAttribute("viewBox", "0 0 24 24");
  if (!fill) {
    icon.setAttribute("fill", "var(--white3)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "M0 0h24v24H0V0z");
  pathone.setAttribute("fill", "none");
  const pathtwo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathtwo.setAttribute("d", "M7 14l5-5 5 5H7z");
  icon.append(pathone, pathtwo)
  return icon;
}

const createCaretRightIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "20");
  icon.setAttribute("width", "20");
  if (!fill) {
    icon.setAttribute("fill", "var(--white3)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "m6 18.167-1.583-1.584L11 10 4.417 3.417 6 1.833 14.167 10Z");
  icon.appendChild(pathone)
  return icon;  
}

const createCheckIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "20");
  icon.setAttribute("width", "20");
  if (!fill) {
    icon.setAttribute("fill", "var(--white2)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "m8.229 14.062-3.521-3.541L5.75 9.479l2.479 2.459 6.021-6L15.292 7Z")
  icon.appendChild(pathone)
  return icon;
}

const createCheckBoxIcon = (fill) => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("height", "24");
  icon.setAttribute("width", "24");
  if (!fill) {
    icon.setAttribute("fill", "var(--white2)")
  } else {
    icon.setAttribute("fill", fill)
  }
  const pathone = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathone.setAttribute("d", "m10.6 16.2 7.05-7.05-1.4-1.4-5.65 5.65-2.85-2.85-1.4 1.4ZM5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14ZM5 5v14V5Z")
  icon.appendChild(pathone)
  return icon;
}

export {
  createSortPlaceholderIcon,
  createStatusIcon,
  createCategoryIcon,
  createEditIcon,
  createPencilIcon,
  createTrashIcon, 
  createCloseIcon,
  createCaretDownIcon,
  createCaretUpIcon,
  createCaretRightIcon,
  createCheckIcon,
  createCheckBoxIcon,
}
