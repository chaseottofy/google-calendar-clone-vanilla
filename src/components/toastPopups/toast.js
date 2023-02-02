import {
  createCloseIcon,
} from "../../utilities/svgs"

import { getClosest } from "../../utilities/helpers";

const body = document.querySelector(".body");
/**
 * 
 * @param {string} message 
 * @param {function} callback 
 * @param {function} callbackTwo 
 * @param {function} removeCallback 
 * @param {function} undoCallback 
 */
export default function createToast(message, undoCallback) {

  function closetoast() {
    const toastpopup = document?.querySelector(".toast")
    if (toastpopup) {
      toastpopup.remove();
    }

    document.onmousedown = null;
  }


  function undo() {
    undoCallback()
    closetoast()
  }

  function createToast() {
    const toast = document.createElement("aside");
    toast.classList.add("toast");

    const toastMessage = document.createElement("div");
    toastMessage.classList.add("toast-message");
    toastMessage.textContent = message;

    const closeIconWrapper = document.createElement("div")
    closeIconWrapper.classList.add("close-toast-icon-wrapper")
    closeIconWrapper.appendChild(createCloseIcon("var(--white4)"))

    const undoToastWrapper = document.createElement("div")
    undoToastWrapper.classList.add("undo-toast-wrapper")
    const undoToastMessage = document.createElement("div")
    undoToastMessage.classList.add("undo-toast-message")
    undoToastMessage.textContent = "Undo"
    undoToastWrapper.appendChild(undoToastMessage);
    



    function delegateToast(e) {
      // if e.target is not in the toast, remove the toast
      const gettoast = getClosest(e, ".toast");
      if (!gettoast) {
        closetoast();
        return;
      }

      const getundo = getClosest(e, ".undo-toast-wrapper");
      const getclose = getClosest(e, ".close-toast-icon-wrapper");

      if (getundo) {
        undoCallback();
        closetoast();
        return;
      }

      if (getclose) {
        closetoast();
        return;
      }
    }

    toast.append(toastMessage, undoToastWrapper, closeIconWrapper);
    body.prepend(toast);

    document.onmousedown = delegateToast;
  }
  createToast();
}