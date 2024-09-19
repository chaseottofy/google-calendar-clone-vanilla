const shortcutsModalOverlay = document.querySelector('.shortcuts-modal-overlay');
const shortcutsModal = document.querySelector('.shortcuts__modal');
const shortcutsModalContent = document.querySelector('.shortcuts-modal-content');
const shortcutsModalClose = document.querySelector('.close-shortcuts-modal');
const notifyShortcutsStatus = document.querySelector('.keyboard-disabled-sm-two');
// const shortCutStyles = () => import('../../styles/aside/shortcuts.css').then(() => console.log('shortcuts.css loaded'));

export default function handleShortCutsModal(store) {
  function createShortcut(key, description) {
    const shortcut = document.createElement('div');
    shortcut.classList.add('sm-item');

    const shortcutKey = document.createElement('div');
    shortcutKey.classList.add('sm-key');
    const keyone = document.createElement('span');
    if (Array.isArray(key)) {
      const or = document.createElement('span');
      or.textContent = ' or ';
      const keytwo = document.createElement('span');
      keyone.textContent = key[0].toUpperCase();
      keytwo.textContent = key[1].toUpperCase();
      shortcutKey.append(keyone, or, keytwo);
    } else {
      if (key == 'ENTER' || key == 'ESCAPE' || key == 'DELETE') {
        keyone.classList.add('key-full');
      }
      keyone.textContent = key.toUpperCase();
      shortcutKey.append(keyone);
    }

    const shortcutDescription = document.createElement('div');
    shortcutDescription.classList.add('sm-description');
    if (Array.isArray(description)) {
      shortcut.classList.add('sm-item--full');
      shortcutDescription.classList.add('sm-description--full');
      const descriptionOne = document.createElement('span');
      const descriptionTwo = document.createElement('span');
      descriptionOne.textContent = description[0];
      descriptionTwo.textContent = description[1];
      shortcutDescription.append(descriptionOne, descriptionTwo);
    } else {
      shortcutDescription.textContent = description;
    }
    shortcut.append(shortcutKey, shortcutDescription);
    return shortcut;
  }

  function handleShortcutsModalClose() {
    shortcutsModalContent.innerText = '';
    shortcutsModalOverlay.classList.add('hide-shortcuts');
    shortcutsModal.classList.add('hide-shortcuts');
    store.removeActiveOverlay('hide-shortcuts');
    document.removeEventListener('keydown', closeShortcutsOnKeydown);
  }

  function closeShortcutsOnKeydown(e) {
    const inp = e.key.toLowerCase();
    if (inp === 'escape' || inp === '/' || inp === '?') {
      handleShortcutsModalClose();
    }
  }

  function setStatusIcon(status) {
    if (status) {
      notifyShortcutsStatus.setAttribute('data-tooltip', 'Keyboard shortcuts enabled');
      notifyShortcutsStatus.firstElementChild.setAttribute('fill', 'var(--primary1)');

    } else {
      notifyShortcutsStatus.setAttribute('data-tooltip', 'Keyboard shortcuts disabled');
      notifyShortcutsStatus.firstElementChild.setAttribute('fill', 'var(--red1)');
    }
  }

  function handleShortcutsModalOpen() {
    shortcutsModalOverlay.classList.remove('hide-shortcuts');
    shortcutsModal.classList.remove('hide-shortcuts');
    store.addActiveOverlay('hide-shortcuts');

    const status = store.getShortcutsStatus();
    setStatusIcon(status);

    const shortcuts = store.getShortcuts();
    for (let i = 0; i < Object.values(shortcuts).length; i++) {
      const value = Object.values(shortcuts)[i];
      shortcutsModalContent.append(createShortcut(
        value.shortcut,
        value.action,
      ));
    }

    function toggleShortcutsStatus() {
      const tgstatus = store.getShortcutsStatus() === false;
      setStatusIcon(tgstatus);
      store.setShortcutsStatus(tgstatus);
    }

    shortcutsModalOverlay.onclick = handleShortcutsModalClose;
    shortcutsModalClose.onclick = handleShortcutsModalClose;
    notifyShortcutsStatus.onclick = toggleShortcutsStatus;
    document.addEventListener('keydown', closeShortcutsOnKeydown);
  }

  handleShortcutsModalOpen();
}
