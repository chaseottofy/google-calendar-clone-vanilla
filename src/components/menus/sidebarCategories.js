import setViews from '../../config/setViews';
import {
  getClosest,
  placePopup,
} from '../../utilities/helpers';
import {
  createCheckIcon,
  createCloseIcon,
  createEditIcon,
  createTrashIcon,
} from '../../utilities/svgs';
import createCategoryForm from './editCategory';
import setSidebarDatepicker from './sidebarDatepicker';

const sidebarColTwo = document.querySelector('.sb__categories');
const cWrapper = document.querySelector('.sb__categories--body');
const categoriesContainer = document.querySelector('.sb__categories--body-form');
const categoriesHeader = document.querySelector('.sb__categories--header');
const categoryHeaderCaret = document.querySelector('.sbch-caret');
// renders via menu click -- see ./renderViews.js

export default function handleSidebarCategories(context, store, datepickerContext) {
  const defaultCtg = store.getDefaultCtg()[0];

  function updateComponent() {
    setViews(context.getComponent(), context, store, datepickerContext);
  }

  function renderSidebarDatepickerCtg() {
    setSidebarDatepicker(context, store, datepickerContext);
  }

  function renderCategories() {
    categoriesContainer.innerText = '';
    const ctg = store.getAllCtg();
    const keys = Object.keys(ctg);
    for (let i = 0; i < keys.length; i++) {
      const [ctgname, color, status] = [
        keys[i],
        ctg[keys[i]].color,
        ctg[keys[i]].active,
      ];
      createCategoryListItem(ctgname, color, status);
    }
  }

  /**
   *
   * @param {string} ctgname - category name
   * @param {string} ctgcolor - hex color
   * @param {Boolean} status - checked or not
   */
  function createCategoryListItem(ctgname, ctgcolor, status) {
    const row = document.createElement('div');
    row.classList.add('sbch-form--item');
    const colone = document.createElement('div');
    colone.classList.add('sbch-form--item__col');
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.classList.add('sbch-form--item__checkbox--wrapper');
    const checkbox = document.createElement('button');
    checkbox.classList.add('sbch-form--item__checkbox');
    checkbox.setAttribute('data-sbch-checked', `${status}`);
    checkbox.setAttribute('data-sbch-category', ctgname);

    let checkIcon;
    if (status) {
      checkbox.style.backgroundColor = ctgcolor;
      checkIcon = createCheckIcon('var(--taskcolor0)');
    } else {
      checkbox.style.backgroundColor = 'var(--black1)';
      checkIcon = createCheckIcon('none');
    }

    checkbox.style.border = `2px solid ${ctgcolor}`;
    checkbox.append(checkIcon);
    checkboxWrapper.append(checkbox);

    const label = document.createElement('span');
    label.classList.add('sbch-form--item__label');
    label.textContent = ctgname;
    colone.append(checkboxWrapper, label);

    const coltwo = document.createElement('div');
    coltwo.classList.add('sbch-form--item__col--actions');
    const deleteicon = document.createElement('button');
    deleteicon.classList.add('sbch-col--actions__delete-icon');
    deleteicon.setAttribute('data-sbch-category', ctgname);
    deleteicon.setAttribute('data-sbch-color', ctgcolor);
    const editicon = document.createElement('button');
    editicon.classList.add('sbch-col--actions__edit-icon');
    editicon.setAttribute('data-sbch-category', ctgname);
    editicon.setAttribute('data-sbch-color', ctgcolor);

    // must have at least one category, so default cannot be deleted
    if (ctgname.toLowerCase() === defaultCtg) {
      editicon.classList.add('sbch-col--actions__edit-icon--immutable');
    } else {
      deleteicon.append(createCloseIcon('var(--white2)'));
      coltwo.append(deleteicon);
    }

    editicon.append(createEditIcon('var(--white2)'));
    coltwo.append(editicon);
    row.append(colone, coltwo);
    categoriesContainer.append(row);
  }

  function handleCategoryModalToggle() {
    cWrapper.classList.toggle('toggle-category--modal');
    if (!cWrapper.classList.contains('toggle-category--modal')) {
      categoryHeaderCaret.classList.add('sbch-caret--open');
    } else {
      categoryHeaderCaret.classList.remove('sbch-caret--open');
    }
    categoriesHeader.style.backgroundColor = 'var(--black0)';
    setTimeout(() => {
      categoriesHeader.style.backgroundColor = 'var(--black1)';
    }, 200);
  }

  function createDeleteCategoryPopup(e) {
    const ctgname = e.target.getAttribute('data-sbch-category');
    const ctgcolor = store.getCtgColor(ctgname);
    const offsetColor = ctgcolor;
    const categoryLength = store.getCtgLength(ctgname);
    let noEntries = false;

    // POPUP OVERLAY
    const popupBoxOverlay = document.createElement('aside');
    popupBoxOverlay.classList.add('popup-delete-ctg__overlay');

    // POPUP BOX
    const popupBox = document.createElement('aside');
    popupBox.classList.add('popup-delete-ctg');
    if (categoryLength === 0) {
      noEntries = true;
      popupBox.classList.add('popup-delete-ctg__no-entries');
    }
    const ord = categoryLength === 1 ? 'entry' : 'entries';

    /* **************************** */
    // POPUP HEADER
    const popupHeader = document.createElement('div');
    popupHeader.classList.add('popup-delete-ctg__header');

    const popupTitle = document.createElement('div');
    popupTitle.classList.add('popup-delete-ctg__title');
    popupTitle.style.border = `2px solid ${ctgcolor}`;
    popupTitle.style.backgroundColor = offsetColor;
    popupTitle.textContent = `removing – "${ctgname}"`;

    const popupCategoryStats = document.createElement('div');
    popupCategoryStats.classList.add('popup-delete-ctg__stats');
    popupCategoryStats.textContent = `(${categoryLength} total ${ord} in this category)`;
    /* **************************** */
    popupHeader.append(popupTitle, popupCategoryStats);
    popupBox.append(popupHeader);

    // category has entries -- provide options to move entries to another category or delete them
    // const setChecked = (inp) => {
    //   inp.checked = true;
    // }
    if (!noEntries) {
      // POPUP BODY
      const popupBody = document.createElement('div');
      popupBody.classList.add('popup-delete-ctg__body');

      // OPTION ONE : MOVE ENTRIES TO ANOTHER CATEGORY
      const optionsWrapperOne = document.createElement('div');
      const categoryNames = store.getAllCtgNames();
      optionsWrapperOne.classList.add('popup-delete-ctg__options');
      optionsWrapperOne.classList.add('popup-delete-act');
      optionsWrapperOne.style.backgroundColor = offsetColor;
      optionsWrapperOne.style.border = `2px solid ${ctgcolor}`;
      const optionMoveRadio = document.createElement('input');
      optionMoveRadio.setAttribute('type', 'radio');
      optionMoveRadio.setAttribute('name', 'popup-delete-ctg__option');
      optionMoveRadio.setAttribute('id', 'ctg-move');
      optionMoveRadio.setAttribute('checked', 'true');

      const optionMove = document.createElement('div');
      const optionMoveTitle = document.createElement('span');
      const optionMoveSelect = document.createElement('select');
      optionMove.classList.add('popup-delete-ctg__option--move');
      optionMoveTitle.textContent = `Move "${ctgname}" ${ord} to `;
      optionMoveSelect.classList.add('popup-delete-ctg__option--move-select');
      for (let i = 0; i < categoryNames.length; i++) {
        if (categoryNames[i] !== ctgname) {

          const option = document.createElement('option');
          option.value = categoryNames[i];
          option.textContent = categoryNames[i];
          optionMoveSelect.append(option);
        }
      }
      optionMove.append(optionMoveTitle, optionMoveSelect);
      optionsWrapperOne.append(optionMoveRadio, optionMove);

      /* ************ */
      // OPTION TWO : REMOVE CATEGORY AND ENTRIES
      const optionsWrapperTwo = document.createElement('div');
      optionsWrapperTwo.classList.add('popup-delete-ctg__options');
      optionsWrapperTwo.style.border = `2px solid ${ctgcolor}`;

      const optionRemoveRadio = document.createElement('input');
      optionRemoveRadio.setAttribute('type', 'radio');
      optionRemoveRadio.setAttribute('name', 'popup-delete-ctg__option');
      optionRemoveRadio.setAttribute('id', 'ctg-delete');

      const optionRemove = document.createElement('div');
      optionRemove.classList.add('popup-delete-ctg__option--remove');
      const optionRemoveTitle = document.createElement('span');

      optionRemoveTitle.textContent = `Delete "${ctgname}" and ${categoryLength} ${ord} (irreversible)`;
      const optionRemoveIcon = createTrashIcon(ctgcolor);
      const handleWrapperClick = (e) => {
        if (e.target.id === 'ctg-delete' || e.target.id === 'ctg-move' || e.target.classList.contains('popup-delete-ctg__option--move') || e.target.classList.contains('popup-delete-ctg__option--move-select')) {
          return;
        } else {
          e.target.closest('.popup-delete-ctg__options').querySelector('input').checked = true;
          for (const el of document.querySelectorAll('.popup-delete-ctg__options')) {
            // el.style.backgroundColor = "transparent";
            el.setAttribute('style', `background-color: transparent; border: 2px solid ${ctgcolor};`);
            el.classList.remove('popup-delete-act');
          }
          // popup-delete-act
          e.target.closest('.popup-delete-ctg__options').setAttribute('style', `background-color: ${offsetColor}; border: 2px solid ${ctgcolor};`);

          e.target.closest('.popup-delete-ctg__options').classList.add('popup-delete-act');
        }
      };

      optionRemove.append(optionRemoveTitle, optionRemoveIcon);
      optionsWrapperTwo.append(optionRemoveRadio, optionRemove);

      popupBody.append(optionsWrapperOne, optionsWrapperTwo);
      popupBox.append(popupBody);
      optionsWrapperOne.onclick = handleWrapperClick;
      optionsWrapperTwo.onclick = handleWrapperClick;
    }

    /* **************************** */
    // POPUP FOOTER
    const popupFooter = document.createElement('div');
    popupFooter.classList.add('popup-delete-ctg__footer');
    const btncancel = document.createElement('button');
    btncancel.textContent = 'cancel';
    btncancel.classList.add('popup-delete-ctg__btn--cancel');
    btncancel.style.backgroundColor = offsetColor;
    const btnproceed = document.createElement('button');
    btnproceed.classList.add('popup-delete-ctg__btn--proceed');
    btnproceed.textContent = 'proceed';
    /* **************************** */
    popupFooter.append(btncancel, btnproceed);
    popupBox.append(popupFooter);
    document.body.append(popupBoxOverlay, popupBox);

    // EVENT LISTENERS
    store.addActiveOverlay('popup-delete-ctg__overlay');
    const closeDeletePopupOnEscape = (e) => {
      if (e.key === 'Escape') closeDeletePopup();
    };

    const closeDeletePopup = () => {
      popupBox.remove();
      popupBoxOverlay.remove();
      store.removeActiveOverlay('popup-delete-ctg__overlay');
      document.removeEventListener('keydown', closeDeletePopupOnEscape);
    };

    const proceedDeletePopup = () => {
      if (!noEntries) {
        const selectedOption = document?.querySelector('input[name=\'popup-delete-ctg__option\']:checked').id;
        const selectedCategory = document.querySelector('.popup-delete-ctg__option--move-select').value;
        if (selectedOption === 'ctg-move') {
          store.moveCategoryEntriesToNewCategory(ctgname, selectedCategory);
        } else if (selectedOption === 'ctg-delete') {
          store.removeCategoryAndEntries(ctgname);
        }
      } else {
        store.deleteCategory(ctgname);
      }

      closeDeletePopup();
      updateComponent();
      renderSidebarDatepickerCtg();
      renderCategories();
    };

    btnproceed.onclick = proceedDeletePopup;
    popupBoxOverlay.onclick = closeDeletePopup;
    btncancel.onclick = closeDeletePopup;
    document.addEventListener('keydown', closeDeletePopupOnEscape);
  }

  function handleCategorySelection(e) {
    const checkbox = e.target.children[0].children[0];
    const status = checkbox.getAttribute('data-sbch-checked');
    const cat = checkbox.getAttribute('data-sbch-category');
    const color = store.getCtgColor(cat);
    if (status === 'true') {
      checkbox.setAttribute('data-sbch-checked', 'false');
      store.setCategoryStatus(cat, false);
      checkbox.style.backgroundColor = 'var(--black1)';
      checkbox.firstChild.setAttribute('fill', 'none');
    } else {
      checkbox.setAttribute('data-sbch-checked', 'true');
      store.setCategoryStatus(cat, true);
      checkbox.style.backgroundColor = color;
      checkbox.firstChild.setAttribute('fill', 'var(--taskcolor0)');
    }
    renderSidebarDatepickerCtg();
    updateComponent();
  }

  function openCategoryOptionsMenu(e, data) {
    const [targetCtg, targetElement] = data;
    const popupWidth = 192;
    const popupHeight = 128;
    const popupCoords = [
      e.clientX,
      Number.parseInt(targetElement.getBoundingClientRect().top) - 8,
    ];
    const [x, y] = placePopup(
      popupWidth,
      popupHeight,
      popupCoords,
      [window.innerWidth, window.innerHeight],
      false,
      null,
    );

    const popupBox = document.createElement('div');
    popupBox.classList.add('popup-ctg-options');
    popupBox.style.top = `${y}px`;
    popupBox.style.left = `${x}px`;
    const popupBoxOverlay = document.createElement('div');
    popupBoxOverlay.classList.add('popup-ctg-options__overlay');
    store.addActiveOverlay('popup-ctg-options__overlay');

    const optionEdit = document.createElement('div');
    optionEdit.classList.add('option__open-ctg-edit');
    optionEdit.textContent = 'Edit category (name, color)';
    const optionTurnOff = document.createElement('div');
    optionTurnOff.classList.add('option__close-other-ctg');
    optionTurnOff.textContent = 'Display this only';
    const optionTurnOn = document.createElement('div');
    optionTurnOn.classList.add('option__open-other-ctg');
    optionTurnOn.textContent = 'Display all but this';

    function closeCategoryOptionsMenu(flag, chckbox) {
      document.querySelector('.popup-ctg-options').remove();
      document.querySelector('.popup-ctg-options__overlay').remove();
      store.removeActiveOverlay('popup-ctg-options__overlay');
      if (flag) { chckbox.removeAttribute('style'); }
      document.removeEventListener('keydown', handleCloseOnEscapeCtgOptionsMenu);
    }

    function handleOpenEditCtg() {
      createCategoryForm(store, targetCtg, true, targetElement);
      closeCategoryOptionsMenu();
    }

    function rerender() {
      renderSidebarDatepickerCtg();
      updateComponent();
      renderCategories();
    }

    function closeAndRemoveStyle() {
      closeCategoryOptionsMenu(true, targetElement);
    }

    function turnoff() {
      store.setAllCategoryStatusExcept(targetCtg.name, false);
      closeAndRemoveStyle();
      rerender();
    }

    function turnon() {
      store.setAllCategoryStatusExcept(targetCtg.name, true);
      closeAndRemoveStyle();
      rerender();
    }

    function handleCloseOnEscapeCtgOptionsMenu(e) {
      if (e.key === 'Escape') { closeAndRemoveStyle(); }
    }

    popupBox.append(optionEdit, optionTurnOff, optionTurnOn);
    document.body.prepend(popupBoxOverlay, popupBox);
    document.addEventListener('keydown', handleCloseOnEscapeCtgOptionsMenu);
    optionEdit.onclick = handleOpenEditCtg;
    popupBoxOverlay.onclick = closeAndRemoveStyle;
    optionTurnOff.onclick = turnoff;
    optionTurnOn.onclick = turnon;
  }

  function delegateCategoryEvents(e) {
    const ctgtoggleModal = getClosest(e, '.sbch-col__one');
    const editctgBtn = getClosest(e, '.sbch-col--actions__edit-icon');
    const deletectgBtn = getClosest(e, '.sbch-col--actions__delete-icon');
    const ctgChck = getClosest(e, '.sbch-form--item__col');
    const ctgPlus = getClosest(e, '.sbch-plus');

    if (ctgtoggleModal) {
      handleCategoryModalToggle();
      return;
    }

    // open category options menu (edit, turn others off, turn others on)
    if (editctgBtn) {
      const targetcat = {
        name: e.target.getAttribute('data-sbch-category'),
        color: e.target.getAttribute('data-sbch-color'),
      };
      const targetparent = e.target.parentElement.parentElement;
      targetparent.style.borderBottom = `2px solid ${targetcat.color}`;
      openCategoryOptionsMenu(e, [targetcat, targetparent]);
      return;
    }

    if (deletectgBtn) {
      createDeleteCategoryPopup(e);
      return;
    }

    // toggle category checkbox and display entries
    if (ctgChck) {
      handleCategorySelection(e);
      return;
    }

    // create popup with category creation form
    if (ctgPlus) {
      const targetcat = {
        name: 'new category',
        color: store.getDefaultCtg()[1].color,
      };
      createCategoryForm(store, targetcat, false, e.target);
      return;
    }
  }

  const initSidebarCategories = () => {
    renderCategories();
    const fullCtgRender = () => {
      renderCategories();
      updateComponent();
    };

    store.setRenderCategoriesCallback(fullCtgRender);
    sidebarColTwo.onmousedown = delegateCategoryEvents;
  };
  initSidebarCategories();
}
