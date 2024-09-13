// import locales from '../../locales/en';
import CatFormHelper from '../../factory/categories';
import { isNumeric, placePopup } from '../../utilities/helpers';
import { createCheckIcon } from '../../utilities/svgs';
// import adjustColorHue from '../../utilities/editcolors';

const ctgform = document.querySelector('.category__form');
const ctgformoverlay = document.querySelector('.category__form-overlay');
const ctgformInput = document.querySelector('.category__form-input');
const colorPickerTitle = document.querySelector('.color-picker__title');
const colorPickerOptions = document.querySelector('.color-picker__options');
const ctgErrMsg = document.querySelector('.ctg-input--err');

export default function createCategoryForm(store, selectedCategory, editing, resetParent) {
  // const { colors } = locales;
  // const colors = Object.values(adjustColorHue(locales.colors, 40));
  const colorObject = store.getColors();
  const colors = Object.values(colorObject);

  const checkIcon = createCheckIcon('var(--taskcolor)');

  const formhelper = new CatFormHelper(
    selectedCategory.name,
    selectedCategory.color,
  );

  function createColorOption(color, selected) {
    const colorOption = document.createElement('div');
    colorOption.classList.add('color-picker--option');
    colorOption.style.backgroundColor = color;
    colorOption.setAttribute('data-color-hex', color);

    if (color === selected) {
      colorOption.append(checkIcon);
      formhelper.setColor(color);
    }

    return colorOption;
  }

  function createPickerOptions(currentColor) {
    colorPickerOptions.innerText = '';
    for (const color of colors) {
      for (let i = 1; i < 8; i++) {
        colorPickerOptions.append(
          createColorOption(color[i], currentColor),
        );
      }
    }
  }

  function handleColorSelection(e, current) {
    const target = e.target;
    const color = target.getAttribute('data-color-hex');

    if (color === current) return;

    const colorOptions = document.querySelectorAll('.color-picker--option');
    for (const option of colorOptions) {
      option.innerText = '';
    }
    target.append(checkIcon);
    colorPickerTitle.style.backgroundColor = color;
    formhelper.setColor(color);
  }

  function handleInputErr() {
    const removeInputErr = () => {
      ctgErrMsg.classList.add('hide-ctg-err');
      ctgformInput.focus();
    };
    ctgErrMsg.textContent = formhelper.getErrMsg();
    ctgErrMsg.onclick = removeInputErr;
  }

  function validateNewCategory(categoryName, color) {
    let trimName = categoryName.trim().replaceAll(/[^\d\sA-Za-z]+|\s{2,}/g, ' ').trim();

    if (isNumeric(trimName)) {
      trimName = `category ${trimName}`;
    }

    const origName = formhelper.getOriginalName();

    let errormsg = false;
    if (trimName.length === 0) {
      formhelper.setErrMsg('Category name is required');
      errormsg = true;
    } else if (store.hasCtg(trimName)) {
      if (!editing || (editing && origName !== trimName)) {
        formhelper.setErrMsg('Category already exists');
        errormsg = true;
      }
    }

    if (errormsg) {
      ctgErrMsg.classList.remove('hide-ctg-err');
      handleInputErr(errormsg);
      return;
    } else {
      if (editing) {
        if (origName === trimName && formhelper.getOriginalColor() === color) {
          closeCategoryForm();
          return;
        } else {
          if (origName !== trimName) {
            store.updateCtg(trimName, color, formhelper.getName());
          } else {
            store.updateCtgColor(origName, color);
          }
        }
      } else {
        store.addNewCtg(trimName, color);
      }

      const fullrenderCtg = store.getRenderCategoriesCallback();
      closeCategoryForm();
      fullrenderCtg();
    }
  }

  function closeCategoryForm() {

    if (resetParent !== null) {
      resetParent.removeAttribute('style');
    }
    colorPickerOptions.innerText = '';
    ctgform.classList.add('hide-ctg-form');
    ctgformoverlay.classList.add('hide-ctg-form');
    ctgformInput.value = '';
    ctgErrMsg.classList.add('hide-ctg-err');
    store.removeActiveOverlay('hide-ctg-form');
    ctgform.onmousedown = null;
    ctgformoverlay.onclick = null;
    document.removeEventListener('keydown', closeCategoryFormOnEsc);
  }

  function closeCategoryFormOnEsc(e) {
    const val = e.key.toLowerCase();
    if (val === 'escape') {
      if (!ctgErrMsg.classList.contains('hide-ctg-err')) {
        ctgErrMsg.classList.add('hide-ctg-err');
        ctgformInput.focus();
        return;
      } else {
        closeCategoryForm();
        return;
      }
    }
    if (val === 'enter') {
      validateNewCategory(ctgformInput.value, formhelper.getColor());
      return;
    }
  }

  function openCtgForm(isEditing) {
    store.addActiveOverlay('hide-ctg-form');
    ctgformoverlay.classList.remove('hide-ctg-form');
    ctgform.classList.remove('hide-ctg-form');
    ctgform.removeAttribute('style');

    if (resetParent !== null) {
      const rect = resetParent.getBoundingClientRect();
      const getright = Number.parseInt(rect.right);
      const gettop = Number.parseInt(rect.top);
      const [x, y] = placePopup(
        280,
        352,
        [getright - 20, gettop - 28],
        [window.innerWidth, window.innerHeight],
        false,
        null,
      );
      ctgform.setAttribute('style', `left:${x}px;top:${y}px;`);
    } else {
      ctgform.setAttribute('style', 'left:5%;top:5%;right:5%;margin:auto;');
    }

    ctgErrMsg.classList.add('hide-ctg-err');
    colorPickerTitle.style.backgroundColor = formhelper.getColor();
    setTimeout(() => {
      if (isEditing) {
        ctgformInput.value = formhelper.getName();
      } else {
        ctgformInput.placeholder = 'Create new category';
      }
      ctgformInput.focus();
    }, 4);
  }

  function gc(e, element) {
    return e.target.closest(element);
  }

  function delegateCtgForm(e) {
    const cancelctgBtn = gc(e, '.category__form--cancel');
    const colorOption = gc(e, '.color-picker--option');
    const submitctgBtn = gc(e, '.category__form--submit');

    if (cancelctgBtn) {
      closeCategoryForm(e);
      return;
    }

    if (colorOption) {
      handleColorSelection(e, formhelper.getColor());
      return;
    }

    if (submitctgBtn) {
      validateNewCategory(ctgformInput.value, formhelper.getColor());
      return;
    }
  }

  const initCtgForm = () => {
    createPickerOptions(formhelper.getColor());
    openCtgForm(editing);
    ctgform.onmousedown = delegateCtgForm;
    ctgformoverlay.onclick = closeCategoryForm;
    document.addEventListener('keydown', closeCategoryFormOnEsc);
  };

  initCtgForm();
}
