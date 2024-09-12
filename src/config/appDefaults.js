import { setTheme } from '../utilities/helpers';

const appBody = document.querySelector('.body');

export default function setAppDefaults(context, store) {
  const disableTransitionsOnLoad = () => {
    setTimeout(() => {
      appBody.classList.remove('preload');
    }, 4);
  };

  const setDefaultAnimationStatus = () => {
    if (store.getAnimationStatus() === null) {
      appBody.classList.add('disable-transitions');
    } else {
      appBody.classList.remove('disable-transitions');
    }
  };

  disableTransitionsOnLoad();
  setTheme(context);
  setDefaultAnimationStatus();
}
