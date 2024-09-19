/**
 *
 * @param {callback} func
 * @param {number} limit
 * @returns strict debounce
 */
function debounce(func, limit) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), limit);
  };
}
/**
 *
 * @param {*} e
 * @param {*} element
 *
 * With the exception of popup modals, all events in the app
 * are delegated from their parent element.
 */
function getClosest(e, element) {
  return e.target.closest(element);
}

function hextorgba(hex, alpha) {
  let r = 0;
  let g = 0;
  let b = 0;
  const a = alpha;
  r = '0x' + hex[1] + hex[2];
  g = '0x' + hex[3] + hex[4];
  b = '0x' + hex[5] + hex[6];
  return 'rgba(' + +r + ',' + +g + ',' + +b + ',' + a + ')';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const throttle = (fn, wait) => {
  let inThrottle;
  let lastFn;
  let lastTime;

  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(this, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

function setTheme(context, store) {
  const appBody = document.querySelector('.body');
  const colorSchemeMeta = document.getElementsByName('color-scheme')[0];
  const currentScheme = context.getColorScheme();
  const hasLightMode = appBody.classList.contains('light-mode');
  const hasContrastMode = appBody.classList.contains('contrast-mode');
  const prevDT = store.getAnimationStatus();
  // appBody.setAttribute('data-disable-transitions', true);
  if (
    (currentScheme === 'light' && hasLightMode && !hasContrastMode) ||
    (currentScheme === 'dark' && !hasLightMode && !hasContrastMode) ||
    (currentScheme === 'contrast' && hasContrastMode && !hasLightMode)
  ) {
    setTimeout(() => {
      appBody.setAttribute('data-disable-transitions', prevDT);
    }, 2000);
    return;
  }

  const setUpTheme = (theme, content, className) => {
    appBody.setAttribute('data-disable-transitions', true);
    context.setColorScheme(theme);
    colorSchemeMeta.setAttribute('content', content);
    appBody.setAttribute('class', className);
    setTimeout(() => {
      appBody.setAttribute('data-disable-transitions', prevDT);
    }, 350);
  };

  switch (currentScheme) {
    case 'light': {
      setUpTheme('light', 'light', 'body light-mode');
      break;
    }
    case 'contrast': {
      setUpTheme('contrast', 'dark', 'body contrast-mode');
      break;
    }
    case 'dark': {
      setUpTheme('dark', 'dark light', 'body');
      break;
    }
    default: {
      setUpTheme('dark', 'dark light', 'body');
      break;
    }
  }
}

/**
 *
 * @param {number} popupWidth
 * @param {number} popupHeight
 * @param {array} coords [x: e.clientX, y: e.clientY]
 * @param {array} windowCoords [x: window.innerWidth, y: window.innerHeight]
 * @param {boolean} center should popup be centered ?
 * @param {number} targetWidth if center is true, targetWidth required to center
 * @returns [left position, top position];
 */
function placePopup(
  popupWidth,
  popupHeight,
  coords,
  windowCoords,
  center = false,
  targetWidth = null,
) {
  const [popupW, popupH] = [popupWidth, popupHeight];
  const [x, y] = coords;
  const [winW, winH] = windowCoords;
  let popupX;
  if (center && targetWidth) {
    popupX = x - (popupW / 2) + (targetWidth / 2);
    if (popupWidth + x + 4 >= winW) {
      popupX = winW - popupW - 4;
    }
  } else {
    popupX = x + popupW > winW ? x - popupW - 6 : x;
  }

  let popupY = y + popupH > winH ? winH - popupH - 6 : y;
  if (popupX < 0) popupX = Math.abs(popupX);
  if (popupY < 0) popupY = 56;
  return [popupX, popupY];
}

function isNumeric(n) {
  return !Number.isNaN(Number.parseFloat(n)) && Number.isFinite(n);
}

export default debounce;
export {
  generateId,
  getClosest,
  hextorgba,
  isNumeric,
  placePopup,
  setTheme,
  throttle,
};
