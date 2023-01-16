import setViews from "../../config/setViews";
import { getClosest } from "../../utilities/helpers";
import createToast from "../toastPopups/toast";
import { taostDeleteEntryWarning } from "../toastPopups/toastCallbacks";
import { formatStartEndTimes } from "../../utilities/timeutils";

import { 
  formatEntryOptionsDate,
  compareDates,
  formatDuration
} from "../../utilities/dateutils";

const entryOptionsOverlay = document.querySelector(".entry__options--overlay");
const entryOptionsWrapper = document.querySelector('.entry__options');
const entryOptionsDateHeader = document.querySelector('.entry__options-date');
const entryOptionsTimeHeader = document.querySelector('.entry__options-time');
const entryOptionTitle = document.querySelector(".eob-title")
const entryOptionDescription = document.querySelector('.eob-description');
const entryOptionCategoryIcon = document.querySelector(".eob-category--icon")
const entryOptionCategory = document.querySelector('.eob-category');

const reset = [
  entryOptionsDateHeader,
  entryOptionsTimeHeader,
  entryOptionTitle,
  entryOptionDescription,
  entryOptionCategory,
]

export default function getEntryOptionModal(context, store, entry,datepickerContext, finishSetup) {
  function openEditForm() {
    const openForm = store.getRenderFormCallback()
    openForm();
    finishSetup();
    closeEntryOptions();
  }

  function openDeleteWarning() {
    // formNegated();
    store.deleteEntry(entry.id);
    // createToast(taostDeleteEntryWarning, store);
    closeEntryOptions();
    setViews(context.getComponent(), context, store, datepickerContext);
  }

  function formNegated() {
    // The form is responsible for resetting the current view
    // If the form is not toggled open from this modal,
    // reset it manually on close
    const resetCurrentView = store.getFormResetHandle(context.getComponent())
    closeEntryOptions()    
    resetCurrentView();
  }

  function closeEntryOptions() {
    // Close the modal and remove event listeners
    // Only ever called directly if the form is toggled open
    entryOptionsWrapper.classList.add("entry__options--hidden");
    entryOptionsOverlay.classList.add("entry__options--hidden");
    store.removeActiveOverlay("entry__options--hidden")
    entryOptionDescription.parentElement.removeAttribute("style");
    document.removeEventListener("keydown", handleEntryOptionKD);
  }

  function setEntryDefaults() {
    reset.forEach(el => el.textContent = "")
    entryOptionsWrapper.classList.remove("entry__options--hidden");
    entryOptionsOverlay.classList.remove("entry__options--hidden");
    store.addActiveOverlay("entry__options--hidden")

    const [start, end] = [new Date(entry.start), new Date(entry.end)]
    
    const getDateTime = formatEntryOptionsDate(start, end);
    entryOptionsDateHeader.textContent = getDateTime.date;
    if (getDateTime.time !== null) {
      entryOptionsTimeHeader.textContent = getDateTime.time;
    }
    
    entryOptionTitle.textContent = entry.title;

    entry.description.length === 0 ? entryOptionDescription.parentElement.style.display = "none" : entryOptionDescription.textContent = entry.description;

    entryOptionCategoryIcon.setAttribute("fill", store.getCtgColor(entry.category))
    entryOptionCategory.textContent = entry.category;

    entryOptionsWrapper.onmousedown = delegateEntryOptions;
    entryOptionsOverlay.onmousedown = formNegated
    document.addEventListener("keydown", handleEntryOptionKD)
  }

  function handleEntryOptionKD(e) {
    if (e.key === "Escape") { 
      formNegated();
    }
  }

  function delegateEntryOptions(e) {
    const editBtn = getClosest(e, ".eoi__edit")
    const deleteBtn = getClosest(e, ".eoi__delete")
    const closeBtn = getClosest(e, ".eoi__close")

    if (editBtn) {
      openEditForm();
      return;
    }

    if (deleteBtn) {
      openDeleteWarning();
      return;
    }

    if (closeBtn) {
      formNegated();
      return;
    }

  }

  setEntryDefaults()
}