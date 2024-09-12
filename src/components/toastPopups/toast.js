import {
  createCloseIcon,
} from '../../utilities/svgs';

import { getClosest } from '../../utilities/helpers';
import store from '../../context/store';

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

  function initToast() {
    toast.innerText = '';

    const toastMessage = document.createElement('div');
    toastMessage.classList.add('toast-message');
    toastMessage.textContent = message;

    const closeIconWrapper = document.createElement('div');
    closeIconWrapper.classList.add('close-toast-icon-wrapper');
    closeIconWrapper.appendChild(createCloseIcon('var(--white4)'));

    const undoToastWrapper = document.createElement('div');
    undoToastWrapper.classList.add('undo-toast-wrapper');
    const undoToastMessage = document.createElement('div');
    undoToastMessage.classList.add('undo-toast-message');
    undoToastMessage.textContent = 'Undo';
    undoToastWrapper.appendChild(undoToastMessage);

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
