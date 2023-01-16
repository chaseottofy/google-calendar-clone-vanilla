const overlay = document.querySelector(".toast-overlay")
const sbform = document.querySelector(".sb__categories--body-form")


export default function toastCallbackSaving() {
  const toastmessage = document.querySelector(".toast-message");
  toastmessage.textContent = "Saved";
  // overlay.classList.remove("hide-toast-overlay");
}

function removeToast() {
  document.querySelector(".toast")?.remove()
  overlay.classList.add("hide-toast-overlay")
}

function toastNoCategorySelected() {
  overlay.classList.add("toast-overlay--allow__sidebar")
  sbform.classList.add("sb__categories--body-form-hint")
  sbform.addEventListener("mouseover", removeToastNoCategorySelected)
}

function removeToastNoCategorySelected() {
  removeToast()
  overlay.classList.remove("toast-overlay--allow__sidebar")
  sbform.classList.remove("sb__categories--body-form-hint")
  sbform.removeEventListener("mouseover", removeToastNoCategorySelected)
}

function taostDeleteEntryWarning() {

}

export {
  toastNoCategorySelected,
  removeToastNoCategorySelected,
  taostDeleteEntryWarning,
}