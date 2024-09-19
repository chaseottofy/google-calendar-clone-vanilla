import CatFormHelper from '../../factory/categories';
import { isNumeric } from '../../utilities/helpers';

const ctgform = document.querySelector('.category__form');
const ctgformoverlay = document.querySelector('.category__form-overlay');
const ctgformInput = document.querySelector('.category__form-input');
const colorPickerOptions = document.querySelector('.color-picker__options');
const ctgErrMsg = document.querySelector('.ctg-input--err');

export default function createCategoryForm(store, selectedCategory, editing, resetParent) {
  const colors = Object.values(store.getColors());
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
      colorOption.classList.add('selected-color');
      formhelper.setColor(color);
    }
    return colorOption;
  }

  function createPickerOptions(currentColor) {
    if (colorPickerOptions.children.length === 0) {
      for (const color of colors) {
        for (const val of Object.values(color)) {
          colorPickerOptions.append(createColorOption(val, currentColor));
        }
      }
    }
  }

  function handleColorSelection(e, current) {
    const target = e.target;
    const color = target.getAttribute('data-color-hex');
    if (color === current) return;
    document?.querySelector('.selected-color')?.classList.remove('selected-color');
    target.classList.add('selected-color');
    ctgformInput.style.border = `2px solid ${color}`;
    e.target.blur();
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
      } else {
        closeCategoryForm();
      }
    } else if (val === 'enter') {
      validateNewCategory(ctgformInput.value, formhelper.getColor());
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
      ctgform.setAttribute('style', `left:${getright}px;top:0;margin-top:auto;`);
    } else {
      ctgform.setAttribute('style', 'inset:5%;margin:auto;');
    }

    ctgErrMsg.classList.add('hide-ctg-err');
    ctgformInput.style.border = `2px solid ${formhelper.getColor()}`;
    setTimeout(() => {
      if (isEditing) {
        ctgformInput.value = formhelper.getName();
      } else {
        ctgformInput.placeholder = 'create new category...';
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
      ctgformInput.focus();
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
