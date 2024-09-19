import store from '../../context/store';
import { getClosest } from '../../utilities/helpers';
import {
  createCloseIcon,
} from '../../utilities/svgs';

const toast = document.querySelector('.toast');
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
    toast.classList.remove('show-toast');
    toast.innerText = '';
    document.onmousedown = null;
    document.onkeydown = null;
    store.removeActiveOverlay('toast');
  }

  async function initToast() {
    if (toast.getAttribute('data-has-css') === 'false') {
      await import('../../styles/aside/toast.css').then(() => {
        toast.setAttribute('data-has-css', 'true');
      });
    }

    toast.innerText = '';

    const toastMessage = document.createElement('div');
    toastMessage.classList.add('toast-message');
    toastMessage.textContent = message;

    const closeIconWrapper = document.createElement('div');
    closeIconWrapper.classList.add('close-toast-icon-wrapper');
    closeIconWrapper.append(createCloseIcon('var(--white4)'));

    const undoToastWrapper = document.createElement('div');
    undoToastWrapper.classList.add('undo-toast-wrapper');
    const undoToastMessage = document.createElement('div');
    undoToastMessage.classList.add('undo-toast-message');
    undoToastMessage.textContent = 'Undo';
    undoToastWrapper.append(undoToastMessage);

    function delegateToast(e) {
      // if e.target is not in the toast, remove the toast
      const gettoast = getClosest(e, '.toast');
      if (!gettoast) {
        closetoast();
        return;
      }

      const getundo = getClosest(e, '.undo-toast-wrapper');
      const getclose = getClosest(e, '.close-toast-icon-wrapper');

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

    function handleToastKeydown(e) {
      if (e.key) {
        closetoast();
      }
    }

    toast.append(toastMessage, undoToastWrapper, closeIconWrapper);
    toast.classList.add('show-toast');
    store.addActiveOverlay('toast');

    document.onkeydown = handleToastKeydown;
    document.onmousedown = delegateToast;
  }

  initToast();
}
