import setEntryForm from '../components/forms/entryForm';
import createGoTo from '../components/forms/goto';
import setDatepicker from '../components/menus/datepicker';
import createCategoryForm from '../components/menus/editCategory';
import handleShortCutsModal from '../components/menus/shortcutsModal';
import handleSidebarCategories from '../components/menus/sidebarCategories';
import setSidebarDatepicker from '../components/menus/sidebarDatepicker';
import handleSidebarFooter from '../components/menus/sidebarFooter';
import getSidebarSubMenu from '../components/menus/sidebarSubMenu';
import {
  getClosest,
  setTheme,
  throttle,
} from '../utilities/helpers';
import setViews from './setViews';

class DataAttributeHandler {
  constructor() {
    this.prefix = 'data-';
  }

  // Query select an attribute when given a value and return the element with that value
  querySelector(attribute, value) {
    const selector = `[${this.prefix}${attribute}="${value}"]`;
    return document.querySelector(selector);
  }

  // Query select attribute linked to only one element (no value given)
  querySelectorUnique(attribute) {
    const selector = `[${this.prefix}${attribute}]`;
    return document.querySelector(selector);
  }

  // Query select and return all elements with a given attribute
  querySelectorAll(attribute) {
    const selector = `[${this.prefix}${attribute}]`;
    return document.querySelectorAll(selector);
  }

  // Set attribute value
  setAttribute(element, attribute, value) {
    element.setAttribute(`${this.prefix}${attribute}`, value);
  }

  // Toggle attribute value
  toggleAttribute(element, attribute, value1, value2) {
    const currentValue = element.getAttribute(`${this.prefix}${attribute}`);
    const newValue = currentValue === value1 ? value2 : value1;
    this.setAttribute(element, attribute, newValue);
    return newValue;
  }
}

const attrHandler = new DataAttributeHandler();

const header = document.querySelector('.h__container');
const headerLogo = document.querySelector('.logo');

const toggleForm = document.querySelector('.toggle-form');
const sbToggleForm = document.querySelector('.sb-toggle-form-btn');
const sbToggleSubBtn = document.querySelector('.sb-data-btn');
const formOverlay = document.querySelector('.form-overlay');
const form = document.querySelector('.entries__form');

const datepicker = document.querySelector('.datepicker');
const datepickeroverlay = document.querySelector('.datepicker-overlay');
const dateTimeWrapper = document.querySelector('.datetime-wrapper');
const dateTimeBtn = document.querySelector('.datetime-content');

const sbDatepicker = document.querySelector('.datepicker-sidebar');
const sbDatepickerBody = document.querySelector('.sbdatepicker__body--dates');
const sbCategoriesWrapper = document.querySelector('.sb__categories--body-form');

const selectElement = document.querySelector('.select__modal');
const selectOverlay = document.querySelector('.change-view--overlay');
const optionswrapper = document.querySelector('.change-view--wrapper');
const options = document.querySelectorAll('.view-option');

const sidebar = document.querySelector('.sidebar');
const sbFooter = document.querySelector('.sb__info');
const sbCategories = document.querySelector('.sb__categories');

const viewsContainer = document.querySelector('.container__calendars');
const yearwrapper = document.querySelector('.yearview');
const monthwrapper = document.querySelector('.monthview');
const listviewBody = document.querySelector('.listview__body');

const collapsebtn = document.querySelector('.collapse-view');

export default function renderViews(context, datepickerContext, store) {
  function fullRender(component) {
    setViews(component, context, store, datepickerContext);
  }

  function setInitialAttributes() {
    selectElement.setAttribute('data-value', `${context.getComponent().slice(0, 1).toUpperCase()}`);
    headerLogo.setAttribute('data-current-day-of-month', new Date().getDate());
  }

  function renderSidebarDatepicker() {
    if (!sidebar.classList.contains('hide-sidebar')) {
      datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay());
      setSidebarDatepicker(context, store, datepickerContext);
    }
  }

  function renderSidebarCategories() {
    if (!sidebar.classList.contains('hide-sidebar')) {
      handleSidebarCategories(context, store, datepickerContext);
      handleSidebarFooter(store);
    }
  }

  function getPreviousDay() {
    context.setPrevDay();
    fullRender('day');
    context.setDateSelected(context.getDay());
    renderSidebarDatepicker();
  }

  function getNextDay() {
    context.setNextDay();
    fullRender('day');
    context.setDateSelected(context.getDay());
    renderSidebarDatepicker();
  }

  function getPreviousWeek() {
    context.setPrevWeek();
    fullRender('week');
    renderSidebarDatepicker();
  }

  function getNextWeek() {
    context.setNextWeek();
    fullRender('week');
    renderSidebarDatepicker();
  }

  function getPreviousMonth() {
    context.setPrevMonth();
    fullRender('month');
    renderSidebarDatepicker();
  }

  function getNextMonth() {
    context.setNextMonth();
    fullRender('month');
    renderSidebarDatepicker();
  }

  function getPreviousYear() {
    context.setPrevYear();
    fullRender('year');
    renderSidebarDatepicker();
  }

  function getNextYear() {
    context.setNextYear();
    fullRender('year');
    renderSidebarDatepicker();
  }

  /**
   * handleTransition
   * @desc  The main purpose of this function is to handle situations where a user is holding down a hotkey to navigate through previous and next periods. Rather than having the swipe fire every single time, it will wait until after the user has stopped holding down the hotkey.
   * Same goes for swipe gestures/prev & next button clicks.
   *
   * @param {HTMLElement} view (current calendar view to be transitioned)
   * @param {String} keyframeDirection (direction of the keyframe animation) prev/next period
   * @param {Function} callback (load next and previous periods)
   */
  let tm = 250; // define timeout out of scope so that it can be
  function handleTransition(view, keyframeDirection, callback) {
    if (!store.getAnimationStatus()) {
      callback();
    } else {
      if (!view.classList.contains('weekview--header')) {
        viewsContainer.style.overflowX = 'hidden';
        setTimeout(() => {
          viewsContainer.style.overflowX = 'auto';
        }, 200);
      }
      view.classList.remove(
        `transition--${keyframeDirection === 'left' ? 'right' : 'left'}`,
      );
      const slide = `transition--${keyframeDirection}`;
      if (view.classList.contains(slide)) {
        // prevent transition from firing too often
        callback();
        tm += 250;
      } else {
        view.classList.add(slide);
        setTimeout(() => {
          view.classList.remove(slide);
        }, tm);
        callback();
        tm = 250;
      }
    }
  }

  // define a means for opening the form then provide it to the store so that it can be accessed by other components
  function handleForm() {
    setEntryForm(context, store, datepickerContext);
    form.setAttribute('style', 'top:5%;left:5%;right:5%;bottom:5%;margin:auto;');
    form.classList.remove('hide-form');
    formOverlay.classList.remove('hide-form-overlay');
    store.addActiveOverlay('hide-form-overlay');
  }

  // the submenu (meatball menu) adjacent to "create" button in sidebar
  // opens instance of settings menu
  function handleToggleSubmenu() {
    getSidebarSubMenu(store, context);
  }

  // open / close sidebar
  // sidebar state (open / closed) is stored locally and will persist across sessions
  // triggers via "s" keypress or by clicking on the hamburger menu icon
  // will also trigger in instances where the user tries to create a new entry on a blank day but no categories are selected.
  function handleBtnMainMenu() {
    const currentSidebarState = context.getSidebarState();

    if (currentSidebarState === 'hide') {
      toggleForm.onclick = handleForm;
      sbToggleForm.onclick = null;
      sbToggleSubBtn.onclick = null;
      sbFooter.onmousedown = null;
      sbCategories.onmousedown = null;
      sbDatepicker.onclick = null;
      setTimeout(() => {
        sbDatepickerBody.innerText = '';
        sbCategoriesWrapper.innerText = '';
      }, 100);
      viewsContainer.classList.remove('container__calendars-sb-active');
      sidebar.classList.add('hide-sidebar');
      toggleForm.classList.remove('hide-toggle--form');
      dateTimeWrapper.classList.remove('datetime-inactive');
      dateTimeBtn.removeAttribute('tabindex');
      listviewBody.removeAttribute('style');
      // clear categories/datepicker content when inactive
    } else {
      toggleForm.onclick = null;
      sbToggleForm.onclick = handleForm;
      sbToggleSubBtn.onclick = handleToggleSubmenu;

      if (context.getComponent() === 'list') {
        listviewBody.style.width = '100%';
        listviewBody.style.marginLeft = '0';
      }

      viewsContainer.classList.add('container__calendars-sb-active');
      sidebar.classList.remove('hide-sidebar');
      toggleForm.classList.add('hide-toggle--form');
      dateTimeWrapper.classList.add('datetime-inactive');
      dateTimeBtn.setAttribute('tabindex', '-1');

      /**
       * @function resetdatepicker
       * @desc if at any point the datepicker in the header is opened, it will provide a callback to the global store with instructions to close. This can only trigger if the user presses "s" on the keyboard (open sidebar toggle) while the datepicker is open.
       */
      const resetdatepicker = store.getResetDatepickerCallback();
      if (resetdatepicker !== null) {
        resetdatepicker();
        store.setResetDatepickerCallback(null);
      }

      datepickerContext.setDate(+context.getYear(), +context.getMonth(), +context.getDay());
      datepickerContext.setDateSelected(+context.getDay());

      renderSidebarCategories();
      renderSidebarDatepicker();
    }
  }

  function handleBtnToday() {
    if (!context.isToday() && context.getComponent() !== 'list') {
      const tempdate = new Date();
      context.setDate(
        tempdate.getFullYear(),
        tempdate.getMonth(),
        tempdate.getDate(),
      );

      fullRender(context.getComponent());
      renderSidebarDatepicker();
    }
  }

  function handleBtnNavigation(direction) {
    const isNext = direction === 'next';
    const transitionDirection = isNext ? 'left' : 'right';
    const navigationConfig = {
      day: {
        element: () => document.querySelector('.dayview--header-day__number'),
        action: isNext ? getNextDay : getPreviousDay,
      },
      week: {
        element: () => document.querySelector('.weekview--header'),
        action: isNext ? getNextWeek : getPreviousWeek,
      },
      month: {
        element: () => monthwrapper,
        action: isNext ? getNextMonth : getPreviousMonth,
      },
      year: {
        element: () => yearwrapper,
        action: isNext ? getNextYear : getPreviousYear,
      },
    };
    const component = context.getComponent();
    const config = navigationConfig[component];
    if (config) {
      handleTransition(
        typeof config.element === 'function' ? config.element() : config.element,
        transitionDirection,
        config.action,
      );
    }
  }

  function handleDatePickerBtn(e) {
    datepicker.classList.remove('hide-datepicker');
    datepickeroverlay.classList.remove('hide-datepicker-overlay');
    datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay());
    const rect = e.target.getBoundingClientRect();
    const newDatepickerLeft = Number.parseInt(rect.left);
    const perc = Number.parseInt((newDatepickerLeft / window.innerWidth) * 100);
    datepicker.setAttribute('style', `left:${perc}%;top:12px;`);
    setDatepicker(context, store, datepickerContext, 'header');
  }

  function closeOptionsModal() {
    selectElement.classList.remove('selection--active');
    selectOverlay.style.display = 'none';
    selectOverlay.classList.add('toggle-options');
    optionswrapper.classList.add('toggle-options');
    optionswrapper.classList.remove('toggle-animate');
  }

  function renderOption(option, initialRender) {
    const comp = context.getComponent();
    const optionsList = ['day', 'week', 'month', 'year', 'list'];
    if (option === 'week' || option === 'day') {
      collapsebtn.onclick = handleCollapse;
      collapsebtn.classList.remove('hide-cbt');
    } else {
      collapsebtn.onclick = null;
      collapsebtn.classList.add('hide-cbt');
    }

    if (option === comp && !initialRender) return;
    closeOptionsModal();
    context.setComponent(option);
    fullRender(option);
    console.log(option);
    optionswrapper.setAttribute('data-view-option-active', option);
    // console.log(document.querySelector(`.view-option[data-view-option="${option}"]`));
    // for (const opt of options) {
    //   opt.classList.remove('view-option--active');
    //   console.log(opt, option)
    //   if (option === opt.getAttribute('data-view-option')) {
    //     opt.classList.add('view-option--active');
    //   }
    // }
    optionswrapper.setAttribute('data-view-option-active', option);
    if (comp || option === 'week') {
      renderSidebarDatepicker();
    }
    document.activeElement.blur();
  }

  function handleSelect() {
    selectElement.classList.add('selection--active');
    selectOverlay.classList.remove('toggle-options');
    selectOverlay.style.display = 'block';
    optionswrapper.classList.remove('toggle-options');
    optionswrapper.classList.add('toggle-animate');
    const setOption = (e) => renderOption(e.target.getAttribute('data-view-option'));
    optionswrapper.onclick = setOption;
    selectOverlay.onclick = closeOptionsModal;
  }

  // EVENT DELEGATION : HEADER ELEMENTS
  function delegateHeaderEvents(e) {
    e.preventDefault();
    const btnMainMenu = getClosest(e, '.menu');
    const btnToday = getClosest(e, '.btn-today');
    const btnPrev = getClosest(e, '.prev');
    const btnNext = getClosest(e, '.next');
    const dateTime = getClosest(e, '.datetime-content');
    const search = getClosest(e, '.h-search');
    const settings = getClosest(e, '.settings');
    const select = getClosest(e, '.select__modal');

    if (btnMainMenu) {
      context.toggleSidebarState();
      handleBtnMainMenu();
      return;
    }

    if (btnToday) {
      handleBtnToday();
      return;
    }

    if (btnPrev) {
      // handleBtnPrev();
      handleBtnNavigation('prev');
      return;
    }

    if (btnNext) {
      // handleBtnNext();
      handleBtnNavigation('next');
      return;
    }

    if (dateTime) {
      handleDatePickerBtn(e);
      return;
    }

    if (search) {
      createGoTo(context, store, datepickerContext);
      return;
    }

    if (settings) {
      handleToggleSubmenu(e);
      return;
    }

    if (select) {
      handleSelect(e);
      return;
    }
  }

  function delegateGlobalKeyDown(e) {
    const toggleChangeview = (e) => {
      if (selectElement.classList.contains('selection--active')) {
        if (e.key.toLowerCase() === 'v') {
          closeOptionsModal();
        }
      } else {
        handleSelect();
      }
    };

    switch (e.key.toLowerCase()) {
      // switch to day view
      case 'd':
      case '1': {
        renderOption('day');
        break;
      }

      // switch to week view
      case 'w':
      case '2': {
        renderOption('week');
        break;
      }

      // switch to month view
      case 'm':
      case '3': {
        renderOption('month');
        break;
      }

      // switch to year view
      case 'y':
      case '4': {
        renderOption('year');
        break;
      }

      // switch to list view
      case 'l':
      case '5': {
        renderOption('list');
        break;
      }

      // toggle sidebar open/close
      case 's': {
        context.toggleSidebarState();
        handleBtnMainMenu();
        break;
      }

      // toggle form open (close with escape)
      case 'f': {
        handleForm();
        break;
      }

      // open "views" menu
      case 'v': {
        toggleChangeview(e);
        break;
      }

      // (day/week) prev month
      case 'p': {
        // handleBtnPrev();
        handleBtnNavigation('prev');
        break;
      }

      // (day/week) next month
      case 'n': {
        // handleBtnNext();
        handleBtnNavigation('next');
        break;
      }

      // set date to today
      case 't': {
        handleBtnToday();
        break;
      }

      // open submenu
      case 'a': {
        handleToggleSubmenu();
        break;
      }

      // open keyboard shortcuts modal
      case '?':
      case '/': {
        handleShortCutsModal(store);
        break;
      }

      // toggle between light/dark mode
      case '0': {
        const currentScheme = context.getColorScheme();
        const schemes = ['light', 'dark', 'contrast'];
        context.setColorScheme(schemes[(schemes.indexOf(currentScheme) + 1) % 3]);
        setTheme(context, store);
        break;
      }

      // opens search modal
      case 'g': {
        createGoTo(context, store, datepickerContext);
        break;
      }

      // create new category
      case '+': {
        const sidebarState = context.getSidebarState();
        if (sidebarState === 'hide') {
          context.toggleSidebarState();
          handleBtnMainMenu();
        }
        createCategoryForm(store, {
          name: 'new category',
          color: store.getDefaultCtg()[1].color,
        }, false, null);
        break;
      }

      default: {
        break;
      }
    }
  }

  const getKeyPressThrottled = throttle(delegateGlobalKeyDown, 150);
  const handleHeaderDelegation = throttle(delegateHeaderEvents, 150);
  // shortcuts defined within this function are global and will work anywhere within the application (except for modal/popup/form windows)

  // If a modal/popup is open, all keyboard shortcuts defined within this function will be disabled until the modal/popup is closed.
  // Note that Each modal/popup has its own keydown close event on escape thats defined within the scope of its own function,
  // once it is closed, the event listener is removed from the DOM.
  let [lk, lk2] = ['', ''];
  function handleGlobalKeydown(e) {
    if (!store.getShortcutsStatus()) return;
    if (store.hasActiveOverlay()) return;

    // prevent ctrl + key shortcuts from triggering at all
    lk = e.key;
    if (lk === 'Control') {
      lk2 = 'Control';
      return;
    }
    if (lk2 === 'Control' && lk !== 'Control') {
      lk2 = '';
      return;
    }
    getKeyPressThrottled(e);
  }

  function handleCollapse() {
    const view = context.getComponent();
    if (view === 'week' || view === 'day') {
      document.querySelector('.cv-svg-on').classList.toggle('hide-cbt');
      document.querySelector('.cv-svg-off').classList.toggle('hide-cbt');
      if (view === 'day') {
        document.querySelector('.dayview--header').classList.toggle('dvh-collapse');
      } else {
        document.querySelector('.weekview--header').classList.toggle('wvh-collapse');
        document.querySelector('.weekview__grid').classList.toggle('wvh-body-collapse');
      }
    }
  }

  function initURL() {
    const pages = new Set(['list', 'year', 'month', 'week', 'day']);
    const handlePopstate = () => {
      const page = window.location.hash.slice(1);
      if (pages.has(page)) {
        if (context.getComponent() !== page) {
          renderOption(page);
        }
      } else {
        const currentView = context.getComponent();
        window.location.hash = currentView;
      }
    };

    window.addEventListener('hashchange', handlePopstate);

    document.addEventListener('DOMContentLoaded', handlePopstate);
  }

  const appinit = () => {
    /** ********************** */
    // render initial view and set initial attributes
    renderOption(context.getComponent(), true);
    setInitialAttributes();
    handleBtnMainMenu();

    /** ********************** */
    // supply callbacks to store for opening form and sidebar
    store.setRenderFormCallback(handleForm);
    const ensureSidebarIsOpen = () => {
      context.setSidebarState('open');
      handleBtnMainMenu();
    };
    store.setRenderSidebarCallback(ensureSidebarIsOpen);

    /** ********************** */
    // establish global event listeners
    header.onclick = throttle(handleHeaderDelegation, 150);
    document.addEventListener('keydown', handleGlobalKeydown);
    initURL();
  };
  appinit();
}
