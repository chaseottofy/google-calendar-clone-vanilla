import {
  createCloseIcon,
} from "../../utilities/svgs"

const body = document.querySelector(".body");
const toastoverlay = document.querySelector(".toast-overlay")

export default function createToast(message, timeout, callback, callbackTwo, removeCallback, undoCallback) {
  function closetoast() {
    toastoverlay.classList.add("hide-toast-overlay")
    document.querySelector(".toast")?.remove()
    if (removeCallback) {
      removeCallback()
    }
  }
  function undo() {
    undoCallback()
    closetoast()
  }

  function initToast() {
    toastoverlay.classList.remove("hide-toast-overlay")
    const toast = document.createElement("aside");
    toast.classList.add("toast");

    const toastMessage = document.createElement("div");
    toastMessage.classList.add("toast-message");
    toastMessage.textContent = message;
    
    const closeIconWrapper = document.createElement("div")
    closeIconWrapper.classList.add("close-toast-icon-wrapper")
    closeIconWrapper.appendChild(createCloseIcon("var(--white4)"))
    closeIconWrapper.onclick = closetoast
    
    if (undoCallback) {
      const undoToastWrapper = document.createElement("div")
      undoToastWrapper.classList.add("undo-toast-wrapper")

      const undoToastMessage = document.createElement("div")
      undoToastMessage.classList.add("undo-toast-message")
      undoToastMessage.textContent = "Undo"

      undoToastWrapper.appendChild(undoToastMessage);
      toast.append(toastMessage, undoToastWrapper, closeIconWrapper);

      undoToastWrapper.onclick = undo

    } else {
      toast.append(toastMessage, closeIconWrapper);
    }

    body.insertBefore(toast, body.firstChild)

    if (callback) {
      callback()
    }

    if (callbackTwo) {
      callbackTwo()
    }
  }

  initToast()
  toastoverlay.onclick = closetoast

  if (!timeout) {
    timeout = 1000
  } 
  setTimeout(() => {
    closetoast()
  }, timeout)
}