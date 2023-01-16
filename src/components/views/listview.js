import { formatDateForDisplay } from "../../utilities/dateutils"
import getEntryOptionModal from "../menus/entryOptions";
import fullFormConfig from "../forms/formUtils";
import FormSetup from "../forms/setForm";

import debounce, { 
  hextorgba, 
  getClosest 
} from "../../utilities/helpers"

import {
  createSortPlaceholderIcon,
  createStatusIcon,
  createCategoryIcon,
  createEditIcon,
  createCaretDownIcon,
  createCaretUpIcon,
} from "../../utilities/svgs"

import {
  getFormDateObject,
} from "../../utilities/dateutils"

const tableheader = document.createElement("div")
const tablebody = document.createElement("div")
tableheader.classList.add('lv__list-header');
tablebody.classList.add('lv__list-body');

const header = document.querySelector(".header")
const lvheader = document.querySelector('.lv__header');

const searchoverlay = document.querySelector(".lv__search-overlay")
const lvsearchoptions = document.querySelector('.lv__search-options');
const searchwrapper = document.querySelector('.lv__header-search--wrapper');
const lvsearchinput = document.querySelector(".lv-search--input")
const searchIconWrapper = document.querySelector(".lv__header-search--iconwrapper")
const lvsearchdropdown = document.querySelector('.lv__header-search--dropdown');

const filtericon = document.querySelector(".lv__header-filter--btn")

const lvbody = document.querySelector('.lv__body');

const lvkanban = document.querySelector('.lv__kanban');

const lvlist = document.querySelector(".lv__list")
const listviewWrapper = document.querySelector('.listview');
const lvListItemOptionModal = document.querySelector(".lv--edit-btn__options")

export default function setListView(context, store, datepickerContext) {
  const searchIcon = searchIconWrapper.firstChild.nextElementSibling
  lvlist.innerText = ""
  let listEntries = store.getActiveEntries()
  
  
  function createtableheader() {
    // console.log(listEntries)
    tableheader.innerText = ""

    const setheaderItemDefaults = (item, sorttype) => {
      item.setAttribute("data-sort-direction", "asc")
      item.setAttribute("data-th-active", "false")
      item.setAttribute("data-sort-type", sorttype)
    }

    let tableHeaderTitles = ["Title", "Desc", "Start", "End", "Ctg",]
    const tableHeaderAttributes = ["title", "description", "start", "end", "category"]
    
    for (let i = 0; i < tableHeaderTitles.length + 1; i++) {
      const tableheaderitem = document.createElement("div")
      tableheaderitem.classList.add('lv__list-header--item');
      if (i === 0) {
        // empty column
        const filler = document.createElement("span")
        filler.classList.add("lvhi-filler")
        tableheaderitem.appendChild(filler)
      } else if (i === tableHeaderTitles.length) {
        tableheaderitem.appendChild(createStatusIcon())
        setheaderItemDefaults(tableheaderitem, tableHeaderAttributes[i - 1])
        tableheaderitem.appendChild(createSortPlaceholderIcon())
        tableheaderitem.classList.add("lvhi-status--iconwrapper")
        tableheaderitem.setAttribute("data-tooltip", "Status")
      } else if (tableHeaderTitles[i - 1] === "Ctg") {
        tableheaderitem.appendChild(createCategoryIcon())
        setheaderItemDefaults(tableheaderitem, tableHeaderAttributes[i - 1])
        tableheaderitem.appendChild(createSortPlaceholderIcon())
        tableheaderitem.classList.add("lvhi-ctg--iconwrapper")
        tableheaderitem.setAttribute("data-tooltip", "Category")
      } else {
        const tableheaderitemtext = document.createElement("span")
        tableheaderitemtext.classList.add('lv__list-header--item-text');
        tableheaderitemtext.textContent = tableHeaderTitles[i - 1]
        if (tableHeaderTitles[i - 1] === "Desc") {
          tableheaderitem.classList.add("lv__list-header--item--desc")
        }
        tableheaderitem.appendChild(tableheaderitemtext)
        setheaderItemDefaults(tableheaderitem, tableHeaderAttributes[i - 1])
        tableheaderitem.appendChild(createSortPlaceholderIcon())
      }


      tableheader.appendChild(tableheaderitem)
    }
    lvlist.appendChild(tableheader)
  }

  function createListEntry(entry, idx) {
    let categorycolor = store.getCtgColor(entry.category)
    const row = document.createElement("div")
    row.setAttribute("data-lv-row-category", entry.category)
    row.classList.add('lv__list-body--row');

    const editIconWrapper = document.createElement("span")
    editIconWrapper.classList.add("lvlb-col")
    editIconWrapper.classList.add("lvlb-col--edit")
    editIconWrapper.setAttribute("data-entry-lv-id", entry.id)
    const editIcon = createEditIcon()
    editIconWrapper.appendChild(editIcon)

    const titlewrapper = document.createElement("div")
    titlewrapper.classList.add("lvlb-col")
    titlewrapper.classList.add("lvlb-col--title")
    titlewrapper.textContent = entry.title

    const desc = document.createElement("div")
    desc.classList.add("lvlb-col")
    desc.classList.add("lvlb-col--desc")
    desc.textContent = entry.description

    const start = document.createElement("div")
    start.classList.add("lvlb-col")
    start.classList.add("lvlb-col--start")
    start.textContent = formatDateForDisplay(entry.start)

    const end = document.createElement("div")
    end.classList.add("lvlb-col")
    end.classList.add("lvlb-col--end")
    end.textContent = formatDateForDisplay(entry.end)

    const category = document.createElement("div")
    category.classList.add("lvlb-col")
    category.classList.add("lvlb-col--category")
    category.textContent = entry.category
    category.setAttribute("data-lv-item-category-name", entry.category)
    category.title = entry.category
    category.style.backgroundColor = categorycolor
    category.style.border = `1px solid ${categorycolor}`

    row.append(
      editIconWrapper,
      titlewrapper,
      desc,
      start,
      end,
      category,
    )
    return row;
  }

  function renderTableBody(entries) {
    tablebody.innerText = ""
    entries.forEach((entry, idx) => {
      if (idx < 50) {
        tablebody.appendChild(createListEntry(entry, idx))
      }
    })
    lvlist.appendChild(tablebody)
  }

  function handleTableSorting(e) {
    const target = e.target
    const sortType = e.target.getAttribute("data-sort-type");
    const sortDirection = e.target.getAttribute("data-sort-direction");

    const createSortIcon = (direction) => {
      const iconwrapper = document.createElement("span")
      iconwrapper.classList.add("lvhi-sort")
      let icon;
      let caretdown = createCaretDownIcon("var(--white1)")
      let caretup = createCaretUpIcon("var(--white1)")
      if (direction === "asc") {
        icon = caretdown
      } else {
        icon = caretup
      }
      iconwrapper.appendChild(icon)
      return iconwrapper;
    }

    const resetHeaders = () => {
      const inactiveHeaders = document.querySelectorAll(".lv__list-header--item:not([data-th-active='false'])")
      if (inactiveHeaders.length === 0) return;
      inactiveHeaders.forEach((el, idx) => {
        if (idx === 0) return;

        el.classList.remove("lv__list-header--item--active")
        el.setAttribute("data-th-active", "false")

        // remove placeholder sort icon if it exists 
        el.children[1].remove()
        el.appendChild(createSortPlaceholderIcon())
      })
    }

    // change direction of sort icon
    const renderTarget = (target, direction) => {
      resetHeaders()
      target.setAttribute("data-th-active", "true")
      let placeholdericon;
      for (const child of target.children) {
        if (child.classList.contains("lvhi-sort--placeholder")) {
          placeholdericon = child;
        }
      }
      if (placeholdericon) {
        placeholdericon.remove()
      } else {
        return;
      }

      target.classList.add("lv__list-header--item--active")
      target.appendChild(createSortIcon(direction))
      if (sortDirection === "asc") {
        target.setAttribute("data-sort-direction", "desc")
      } else {
        target.setAttribute("data-sort-direction", "asc")
      }
    }

    const rendersearchentries = () => {
      if (lvsearchinput.value !== "") {
        let entries = store.searchBy(listEntries, "title", lvsearchinput.value.toLowerCase())
        renderTableBody(entries)
        entries = []
      } else {
        renderTableBody(listEntries)
      }
    }

    if (sortDirection === "desc") {
      renderTarget(target, "desc")
      listEntries = store.sortBy(listEntries, sortType, "desc")
    } else {
      renderTarget(target, "asc")
      listEntries = store.sortBy(listEntries, sortType, "asc")
    }
    rendersearchentries()
  }

  function openSearchDropdown(e) {
    const parent = e.target.parentElement;

    lvsearchoptions.classList.remove("hide-lv-popup")
    searchoverlay.classList.remove("hide-lv-popup")
    lvsearchoptions.style.left = parent.offsetLeft + "px";
    lvsearchoptions.style.top = parent.offsetTop + parent.offsetHeight + "px";
    lvsearchoptions.style.width = searchwrapper.offsetWidth + "px";
    searchoverlay.addEventListener("click", (e) => {
      lvsearchoptions.classList.add("hide-lv-popup")
      searchoverlay.classList.add("hide-lv-popup")
    }, { once: true })
  }

  function getSearchInput(e) {
    const target = e.target
    const value = target.value
    const searchtype = "title"
    let entries = store.searchBy(listEntries, searchtype, value)
    renderTableBody(entries)
    entries = [];
    if (value === "") {
      searchIcon.setAttribute("stroke", "var(--white3)")
    } else {
      if (tablebody.children.length === 0) {
        searchIcon.setAttribute("stroke", "var(--error)")
      } else {
        searchIcon.setAttribute("stroke", "var(--primary1)")
      }
    }
  }

  function renderDefaultTable() {
    lvlist.innerText = ""
    lvsearchinput.value = ""
    if (listEntries.length === 0) {
      listviewWrapper.style.pointerEvents = "none"
      return;
    } else {
      listviewWrapper.style.pointerEvents = "all"
      createtableheader()
      renderTableBody(listEntries)
    }
  }

  function configListviewEditFormClose() {
    let activecell = document?.querySelector(".lv__cell--active")
    if (activecell) {
      activecell.removeAttribute("style");
      activecell.classList.remove("lv__cell--active");
      return;
    } else {
      return;
    }
  }

  function createListItemOptionModal(e) {
    const target = e.target;
    const cell = target.parentElement;
    const id = target.getAttribute("data-entry-lv-id");
    const entry = listEntries.find((entry) => entry.id === id);
    const start = entry.start;

    const color = store.getCtgColor(entry.category);
    const offsetColor = hextorgba(color, 0.5);
    


    cell.setAttribute("style", `background-color: ${offsetColor}; pointer-events: none;`)
    cell.classList.add("lv__cell--active")
    store.setFormResetHandle("list", configListviewEditFormClose);

    // get offset top of cell or bottom of cell for modal position
    let offsettop = parseInt(cell.getBoundingClientRect().top) + cell.offsetHeight;
    if (offsettop + 165 >= window.innerHeight) {
      offsettop -= (165 + cell.offsetHeight);
    }

    // get offset left of cell for modal position
    let offsetleft = parseInt(cell.getBoundingClientRect().left) + target.offsetWidth;


    const setup = new FormSetup();
    setup.setSubmission("edit", id, entry.title, entry.description);
    setup.setCategory(entry.category, color, color);
    setup.setPosition(3, [3, 3], 48);
    setup.setDates(getFormDateObject(start, entry.end))

    fullFormConfig.setFormDatepickerDate(context, datepickerContext, start);
    const finishSetup = () => fullFormConfig.getConfig(setup.getSetup());

    getEntryOptionModal(context, store, entry, datepickerContext,finishSetup); 
    const modal = document.querySelector(".entry__options")
    modal.style.top = offsettop + "px";
    modal.style.left = offsetleft + "px";
  }


  function delegateListEvents(e) {
    // open search dropdown | sort table | check/uncheck all checkboxes
    if (getClosest(e, ".lv__header-search--dropdown")) {
      openSearchDropdown(e);
      return;
    }

    if (getClosest(e, ".lv__list-header--item")) {
      if (e.target.hasAttribute("data-th-active")) {
        if (listEntries.length > 1) {
          handleTableSorting(e);
        }
      }
      return;
    }

    if (getClosest(e, ".lvlb-col--edit")) {
      createListItemOptionModal(e);
      return;
    }

    if (getClosest(e, ".lv__header-filter--btn")) {
      return;
    }

    const handleSearchInput = debounce(getSearchInput, 200)
    lvsearchinput.addEventListener("input", handleSearchInput)
  }

  const initListView = () => {
    renderDefaultTable();
    listviewWrapper.onmousedown = delegateListEvents;
  }

  initListView();
}