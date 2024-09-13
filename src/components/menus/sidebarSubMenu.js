import { createTimestamp } from '../../utilities/dateutils';
import getJSONUpload from '../../utilities/getJsonUpload';
import { getClosest, setTheme } from '../../utilities/helpers';
import storage from '../../utilities/storage';
import handleShortCutsModal from './shortcutsModal';

const sidebarSubMenuOverlay = document.querySelector('.sidebar-sub-menu__overlay');
const sidebarSubMenu = document.querySelector('.sidebar-sub-menu');
/// const closeSubMenuBtn = document.querySelector('.close-sub-menu');
const appBody = document.querySelector('.body');
const themeRadioBtns = document.querySelectorAll('.theme-radio__input');
// keyboard shortcut toggle on/off | open modal
const shortcutSwitch = document.querySelector('.smia-toggle-shortcuts-checkbox');
const animationsSwitchBtn = document.querySelector('.smdt-toggle-checkbox');
const notifyDisabledShortcutsIcon = document.querySelector('.keyboard-disabled-sm');

export default function getSidebarSubMenu(store, context) {
  const themeRadioOptions = ['dark', 'light', 'contrast'];
  const closemenu = 'hide-sidebar-sub-menu';

  function closeSubOnEscape(e) {
    const popup = document.querySelector('.sb-sub-popup-confirm');
    if (e.key === 'Escape') {
      if (popup) {
        popup.remove();
        sidebarSubMenuOverlay.classList.remove('sub-overlay-vis');
        return;
      } else {
        closeSubMenu();
        sidebarSubMenuOverlay.classList.remove('sub-overlay-vis');
      }
    }
    if (e.key.toLowerCase() === 'a') {
      if (popup) {
        return;
      } else {
        closeSubMenu();
      }
    }
  }

  function createUploadConfirmationPopup() {
    const popup = document.createElement('div');
    popup.classList.add('sb-sub-popup-confirm');
    const [totalEntries, totalCategories] = store.getStoreStats();

    // let totals;
    let [hasEntries, hasCategories] = [false, false];
    let titleEntries;
    if (totalEntries > 0) {
      hasEntries = `Overwriting ${totalEntries} entries`;
    }
    if (totalCategories > 1) {
      if (totalCategories === 2) {
        hasCategories = '1 category.';
      } else {
        hasCategories = `${+totalCategories - 1} categories.`;
      }
    }

    if (hasEntries && hasCategories) {
      titleEntries = `${hasEntries} and ${hasCategories}`;
    } else if (hasEntries && !hasCategories) {
      titleEntries = `${hasEntries}.`;
    } else if (!hasEntries && hasCategories) {
      titleEntries = `No entries. Overwriting ${hasCategories}`;
    } else {
      titleEntries = 'Current calendar has no entries or categories.';
    }

    const subtitle = document.createElement('div');
    subtitle.classList.add('sb-sub-popup-subtitle');
    subtitle.textContent = titleEntries;
    const subtitle2 = document.createElement('div');
    subtitle2.classList.add('sb-sub-popup-subtitle');
    subtitle2.textContent = 'This action is irreversible.';
    const subtitle3 = document.createElement('div');
    subtitle3.classList.add('sb-sub-popup-title');
    subtitle3.textContent = 'Please ensure you have a valid backup before proceeding. Use the "validate .json" button next to "upload .json" to check that everything is in order.';

    const btns = document.createElement('div');
    btns.classList.add('sb-sub-popup-btns');
    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('sb-sub-popup-btn--cancel');
    cancelBtn.textContent = 'Cancel';
    const proceedBtn = document.createElement('button');
    proceedBtn.classList.add('sb-sub-popup-btn--proceed');
    proceedBtn.textContent = 'Proceed';

    btns.append(cancelBtn, proceedBtn);
    popup.append(
      subtitle,
      subtitle2,
      subtitle3,
      btns,
    );
    return popup;
  }

  function closeSubMenu() {
    const popup = document.querySelector('.sb-sub-popup-confirm');
    if (popup) {
      popup.remove();
      sidebarSubMenuOverlay.classList.remove('sub-overlay-vis');
      return;
    } else {
      store.removeActiveOverlay(closemenu);
      sidebarSubMenu.classList.add(closemenu);
      sidebarSubMenuOverlay.classList.add(closemenu);
      document.removeEventListener('keydown', closeSubOnEscape);
      sidebarSubMenuOverlay.onclick = null;
    }
  }

  function setStatusIcon(status) {
    if (status) {
      notifyDisabledShortcutsIcon.setAttribute('data-tooltip', 'Keyboard shortcuts enabled');
      notifyDisabledShortcutsIcon.firstElementChild.setAttribute('fill', 'var(--primary1)');
    } else {
      notifyDisabledShortcutsIcon.setAttribute('data-tooltip', 'Keyboard shortcuts disabled');
      notifyDisabledShortcutsIcon.firstElementChild.setAttribute('fill', 'var(--red1)');
    }
  }

  function openSubMenu() {
    // configure current active status of theme radio btns
    const themeIdx = themeRadioOptions.indexOf(context.getColorScheme());
    themeRadioBtns[themeIdx].checked = true;

    const shortcutStatus = store.getShortcutsStatus();
    setStatusIcon(shortcutStatus);
    shortcutSwitch.checked = shortcutStatus;

    const animationStatus = store.getAnimationStatus();
    setAnimationsIcons(animationStatus);
    animationsSwitchBtn.checked = animationStatus;

    store.addActiveOverlay(closemenu);
    sidebarSubMenu.classList.remove(closemenu);
    sidebarSubMenuOverlay.classList.remove(closemenu);

    document.addEventListener('keydown', closeSubOnEscape);
    sidebarSubMenuOverlay.onclick = closeSubMenu;
    // closeSubMenuBtn.onclick = closeSubMenu;
  }

  // reconfigure the following to use `Blob#text()` instead of `FileReader`
  function getJSONDownload() {
    // const json = storage.getAllData();
    const json = JSON.stringify(storage.getAllData(), null, 2);
    const [totalEntries, totalCategories] = store.getStoreStats();
    const filename = `ENT_${totalEntries}_CAT_${totalCategories}_${createTimestamp()}`;
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename + '.json';
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(href);
    link.remove();
  }

  function removePopup() {
    sidebarSubMenuOverlay.classList.remove('sub-overlay-vis');
    const popup = document.querySelector('.sb-sub-popup-confirm');
    if (popup) {
      popup.remove();
    }
  }

  function handleCalendarJSON(action) {
    if (action === 'download') {
      getJSONDownload();
    } else {
      // create popup to warn user that they are about to overwrite all calendar data
      const popup = createUploadConfirmationPopup();
      document.body.append(popup);
      sidebarSubMenuOverlay.classList.add('sub-overlay-vis');
      // cancel will close popup but keep open sidebar sub menu
      // "Escape" key will also close popup but keep open sidebar sub menu
      // "a" key will be temporarily disabled while popup is open
      const cancelBtn = popup.querySelector('.sb-sub-popup-btn--cancel');
      const proceedBtn = popup.querySelector('.sb-sub-popup-btn--proceed');
      cancelBtn.onclick = removePopup;
      proceedBtn.onclick = () => getJSONUpload(store, closeSubMenu)
        .then((json) => {
          console.log('JSON upload successful:', json);
        })
        .catch((error) => {
          console.error('JSON upload failed:', error);
        });
    }
  }

  function handleThemeChange(e) {
    const target = e.target;
    const targetinput = target.firstElementChild;
    const value = targetinput.value;
    targetinput.checked = true;
    const currentTheme = context.getColorScheme();
    if (value === currentTheme) {
      return;
    }
    context.setColorScheme(value);
    setTheme(context, store);
  }

  function openKbShortcutMenu() {
    closeSubMenu();
    handleShortCutsModal(store);
  }

  function toggleShortcuts() {
    const status = shortcutSwitch.checked === false;
    store.setShortcutsStatus(status);
    setStatusIcon(status);
  }

  function toggleShortcutsIcon() {
    let status = store.getShortcutsStatus();

    status = !status;
    store.setShortcutsStatus(status);
    setStatusIcon(status);
    shortcutSwitch.checked = status;
  }

  function setAnimationsIcons(val) {
    const parenticonwrapper = document.querySelector('.toggle-animations-icon__sm');
    const icons = {
      on: document.querySelector('.tai-on'),
      off: document.querySelector('.tai-off'),
    };

    if (val) {
      icons.on.classList.remove('hide-tai');
      icons.off.classList.add('hide-tai');
      parenticonwrapper.setAttribute('data-tooltip', 'Animations Enabled');
    } else {
      icons.on.classList.add('hide-tai');
      icons.off.classList.remove('hide-tai');
      parenticonwrapper.setAttribute('data-tooltip', 'Animations Disabled');
    }
  }

  function toggleAnimations(fromicon) {
    const status = animationsSwitchBtn.checked === false;
    store.setAnimationStatus(status);
    setAnimationsIcons(status);
    if (fromicon) {
      animationsSwitchBtn.checked = status;
    }
    appBody.setAttribute('data-disable-transitions', !status);
  }

  function delegateSubMenuEvents(e) {
    const downloadjsonBtn = getClosest(e, '.down-json');
    const uploadjsonBtn = getClosest(e, '.upload-json');
    const themebtn = getClosest(e, '.theme-option');
    const kbShortcutMenu = getClosest(e, '.toggle-kb-shortcuts-btn__smia');
    const shortcutSwitchEl = getClosest(e, '.smia-disable-shortcuts__btn');
    const shortcutSwitchNotifyIcon = getClosest(e, '.keyboard-disabled-sm');
    const animationsSwitch = getClosest(e, '.smdt-toggle');
    const animationsIcon = getClosest(e, '.toggle-animations-icon__sm');
    const getCloseSubMenuBtn = getClosest(e, '.close-sub-menu');

    if (downloadjsonBtn) {
      handleCalendarJSON('download');
      return;
    }

    if (uploadjsonBtn) {
      handleCalendarJSON('upload');
      return;
    }

    if (themebtn) {
      handleThemeChange(e);
      return;
    }

    if (kbShortcutMenu) {
      openKbShortcutMenu();
      return;
    }

    if (shortcutSwitchEl) {
      toggleShortcuts();
      return;
    }

    if (shortcutSwitchNotifyIcon) {
      toggleShortcutsIcon();
      return;
    }

    if (animationsSwitch) {
      toggleAnimations();
      return;
    }

    if (animationsIcon) {
      toggleAnimations(true);
      return;
    }

    if (getCloseSubMenuBtn) {
      closeSubMenu();
      return;
    }
  }

  function setSidebarSubMenu() {
    openSubMenu();
    sidebarSubMenu.onmousedown = delegateSubMenuEvents;
  }
  setSidebarSubMenu();
}
