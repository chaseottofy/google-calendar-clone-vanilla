import copyToClipboard from '../../utilities/copyToClipboard';
import { getClosest } from '../../utilities/helpers';

const sidebarFooter = document.querySelector('.sb__info');

// popup containing : project notes, privacy policy, & terms of use
const sbInfoPopup = document.querySelector('.sb__info-popup');
const sbInfoPopupOverlay = document.querySelector('.sb__info-popup-overlay');
const selectInfo = document.querySelector('.select-popup-info');
const closePopupButton = document.querySelector('.close-sb-info');
const infopopupTitle = document.querySelector('.sbip-title');
const infopopupBody = document.querySelector('.sbip-content');

export default function handleSidebarFooter(store) {
  const infoContent = {
    notes: {
      title: 'Breakdown of project & current status',
      content: 'These are my project notes',
    },
    privacy: {
      title: 'Cookies and Data Privacy',
      content: 'This project uses an open source license',
    },
    terms: {
      title: 'Code license and terms of use',
      content: 'All data is stored locally meaning no data is sent to a server.',
    },
  };

  function closeInfoPopup() {
    store.removeActiveOverlay('hide-sb-info-popup');
    sbInfoPopup.classList.add('hide-sb-info-popup');
    sbInfoPopupOverlay.classList.add('hide-sb-info-popup');
    document.removeEventListener('keydown', closeInfoPopupOnEscape);
    sbInfoPopupOverlay.onclick = null;
    closePopupButton.onclick = null;
  }

  function setInfoContent(selection) {
    infopopupTitle.innerText = infoContent[selection].title;
    infopopupBody.innerText = infoContent[selection].content;
  }

  function handleSelectInfoChange(e) {
    const selection = e.target.value;
    setInfoContent(selection);
  }

  function closeInfoPopupOnEscape(e) {
    if (e.key === 'Escape') {
      closeInfoPopup();
    }
  }

  function setUpInfoPopup() {
    setInfoContent(selectInfo.value);
    selectInfo.onchange = handleSelectInfoChange;
    sbInfoPopupOverlay.onclick = closeInfoPopup;
    closePopupButton.onclick = closeInfoPopup;
    document.addEventListener('keydown', closeInfoPopupOnEscape);
  }

  function openInfoPopup(selection) {
    const selections = ['notes', 'privacy', 'terms'];
    const idx = selections.indexOf(selection);
    selectInfo.selectedIndex = idx;

    store.addActiveOverlay('hide-sb-info-popup');
    sbInfoPopup.classList.remove('hide-sb-info-popup');
    sbInfoPopupOverlay.classList.remove('hide-sb-info-popup');
    setUpInfoPopup();
  }

  function delegateSidebarFooterEvents(e) {
    const projectNotes = getClosest(e, '.sb__project-notes');
    const privacy = getClosest(e, '.sb__privacy');
    const terms = getClosest(e, '.sb__terms');
    const emailButton = getClosest(e, '.sbl-email');

    if (projectNotes) {
      openInfoPopup('notes');
      return;
    }

    if (privacy) {
      openInfoPopup('privacy');
      return;
    }

    if (terms) {
      openInfoPopup('terms');
      return;
    }

    if (emailButton) {
      copyToClipboard('ottofy@zohomail.com');
      return;
    }
  }

  sidebarFooter.onmousedown = delegateSidebarFooterEvents;
}
