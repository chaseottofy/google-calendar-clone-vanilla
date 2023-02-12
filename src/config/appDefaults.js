import { setTheme } from "../utilities/helpers";
const appBody = document.querySelector(".body");

export default function setAppDefaults(context, store) {
  let animationStatus = store.getAnimationStatus();

  const disableTransitionsOnLoad = () => {
    setTimeout(() => {
      appBody.classList.remove("preload");
    }, 4);
  };

  const setDefaultAnimationStatus = () => {
    animationStatus ? appBody.classList.remove("disable-transitions") : appBody.classList.add("disable-transitions");
  };

  disableTransitionsOnLoad();
  setTheme(context);
  setDefaultAnimationStatus();
}