const n = 40;
export default n;

const createEditIcon = () => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('height', '20');
  icon.setAttribute('width', '20');
  icon.setAttribute('fill', 'var(--white3)');
  const pathone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathone.setAttribute('d', 'M10 16q-.625 0-1.062-.438Q8.5 15.125 8.5 14.5t.438-1.062Q9.375 13 10 13t1.062.438q.438.437.438 1.062t-.438 1.062Q10.625 16 10 16Zm0-4.5q-.625 0-1.062-.438Q8.5 10.625 8.5 10t.438-1.062Q9.375 8.5 10 8.5t1.062.438q.438.437.438 1.062t-.438 1.062q-.437.438-1.062.438ZM10 7q-.625 0-1.062-.438Q8.5 6.125 8.5 5.5t.438-1.062Q9.375 4 10 4t1.062.438q.438.437.438 1.062t-.438 1.062Q10.625 7 10 7Z');
  icon.append(pathone);
  return icon;
};

const createTrashIcon = (fill) => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('height', '24');
  icon.setAttribute('width', '24');
  icon.setAttribute('viewBox', '0 0 24 24');
  if (!fill) {
    icon.setAttribute('fill', 'var(--white3)');
  } else {
    icon.setAttribute('fill', fill);
  }
  const pathone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathone.setAttribute('d', 'M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13z');
  const pathtwo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathtwo.setAttribute('d', 'M9 8h2v9H9zm4 0h2v9h-2z');
  icon.append(pathone, pathtwo);
  return icon;
};

const createCloseIcon = (fill) => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('height', '20');
  icon.setAttribute('width', '20');
  if (!fill) {
    icon.setAttribute('fill', 'var(--white3)');
  } else {
    icon.setAttribute('fill', fill);
  }
  const pathone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathone.setAttribute('d', 'M6.062 15 5 13.938 8.938 10 5 6.062 6.062 5 10 8.938 13.938 5 15 6.062 11.062 10 15 13.938 13.938 15 10 11.062Z');
  icon.append(pathone);
  return icon;
};

const createCheckIcon = (fill) => {
  // <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('height', '18px');
  icon.setAttribute('width', '18px');
  icon.setAttribute('viewBox', '0 0 24 24');
  if (!fill) {
    icon.setAttribute('fill', 'var(--white2)');
  } else {
    icon.setAttribute('fill', fill);
  }
  const pathone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathone.setAttribute('d', 'M0 0h24v24H0z');
  pathone.setAttribute('fill', 'none');
  const pathtwo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathtwo.setAttribute('d', 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z');
  icon.append(pathone, pathtwo);
  return icon;
};

const createMeatballVertIcon = (fill) => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('height', '24');
  icon.setAttribute('width', '24');
  if (!fill) {
    icon.setAttribute('fill', 'var(--white4)');
  } else {
    icon.setAttribute('fill', fill);
  }
  const pathone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathone.setAttribute('d', 'M6 14q-.825 0-1.412-.588Q4 12.825 4 12t.588-1.413Q5.175 10 6 10t1.412.587Q8 11.175 8 12q0 .825-.588 1.412Q6.825 14 6 14Zm6 0q-.825 0-1.412-.588Q10 12.825 10 12t.588-1.413Q11.175 10 12 10t1.413.587Q14 11.175 14 12q0 .825-.587 1.412Q12.825 14 12 14Zm6 0q-.825 0-1.413-.588Q16 12.825 16 12t.587-1.413Q17.175 10 18 10q.825 0 1.413.587Q20 11.175 20 12q0 .825-.587 1.412Q18.825 14 18 14Z');
  icon.append(pathone);
  return icon;
};

const createExpandDownIcon = (fill) => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('height', '18px');
  icon.setAttribute('width', '18px');
  icon.setAttribute('viewBox', '0 0 24 24');
  // icon.setAttribute("fill", "")
  if (!fill) {
    icon.setAttribute('fill', 'var(--white3)');
  } else {
    icon.setAttribute('fill', fill);
  }
  const pathone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathone.setAttribute('d', 'M0 0h24v24H0z');
  pathone.setAttribute('fill', 'none');
  const pathtwo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathtwo.setAttribute('d', 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z');
  icon.append(pathone, pathtwo);
  return icon;
};

export {
  createCheckIcon,
  createCloseIcon,
  createEditIcon,
  createExpandDownIcon,
  createMeatballVertIcon,
  createTrashIcon,
};
