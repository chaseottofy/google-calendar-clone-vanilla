import {
  createCloseIcon,
} from "../../utilities/svgs"

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
    const closetoastbtn = document?.querySelector(".close-toast-icon-wrapper")
    const toastpopup = document?.querySelector(".toast")

    if (toastpopup) {
      toastpopup.remove();
    }

    if (closetoastbtn) {
      closetoastbtn.onclick = null;
    }

    window.removeEventListener("mousedown", closetoast);
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
    closeIconWrapper.onclick = closetoast

    const undoToastWrapper = document.createElement("div")
    undoToastWrapper.classList.add("undo-toast-wrapper")

    const undoToastMessage = document.createElement("div")
    undoToastMessage.classList.add("undo-toast-message")
    undoToastMessage.textContent = "Undo"

    undoToastWrapper.appendChild(undoToastMessage);
    toast.append(toastMessage, undoToastWrapper, closeIconWrapper);

    undoToastWrapper.onclick = undo
    body.insertBefore(toast, body.firstChild)
    window.addEventListener("mousedown", closetoast);
  }
  
  createToast()
}