import { setTheme } from "../utilities/helpers";
const appBody = document.querySelector(".body");
export default function setAppDefaults(context, store) {
  const disableTransitionsOnLoad = () => {
    setTimeout(() => {
      appBody.classList.remove("preload");
    }, 10)
  }
  disableTransitionsOnLoad();
  setTheme(context);
}

function checkLocalStorageAllowed() {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch (e) {
    return false;
  }
}

export {
  checkLocalStorageAllowed
}