import setHeader from '../components/menus/header';

const setDayView = () => import('../components/views/dayview').then((module) => module.default);
const setListView = () => import('../components/views/listview').then((module) => module.default);
const setMonthView = () => import('../components/views/monthview').then((module) => module.default);
const setWeekView = () => import('../components/views/weekview').then((module) => module.default);
const setYearView = () => import('../components/views/yearview').then((module) => module.default);

const views = {
  year: document.querySelector('.yearview'),
  month: document.querySelector('.monthview'),
  week: document.querySelector('.weekview'),
  day: document.querySelector('.dayview'),
  list: document.querySelector('.listview'),
};

const viewsKeys = ['year', 'month', 'week', 'day', 'list'];
let [prev1, prev2] = [null, null];
export default function setViews(
  component,
  context,
  store,
  datepickerContext,
) {
  prev1 = prev2;
  prev2 = component;

  function hideViews() {
    const resetPrevView = store.getResetPreviousViewCallback();
    console.log(resetPrevView, prev1, prev2);
    if (prev1 !== null && resetPrevView !== null && prev1 !== prev2) {
      resetPrevView();
    }

    for (const key of viewsKeys) {
      if (key !== component) {
        views[key].classList.add('hide-view');
      }
    }
  }

  async function initView(comp) {
    context.setComponent(comp);
    setHeader(context, comp);
    views[comp].classList.remove('hide-view');

    switch (comp) {
      case 'day': {
        const dayViewModule = await setDayView();
        dayViewModule(context, store, datepickerContext);
        break;
      }
      case 'week': {
        const weekViewModule = await setWeekView();
        weekViewModule(context, store, datepickerContext);
        break;
      }
      case 'month': {
        const monthViewModule = await setMonthView();
        monthViewModule(context, store, datepickerContext);
        break;
      }
      case 'year': {
        const yearViewModule = await setYearView();
        yearViewModule(context, store, datepickerContext);
        break;
      }
      case 'list': {
        const listViewModule = await setListView();
        listViewModule(context, store, datepickerContext);
        break;
      }
      default: {
        // setMonthView(context, store, datepickerContext);
        // monthComponent.classList.remove('hide-view');
        break;
      }
    }
  }

  hideViews();
  document.title = context.getMonthName();
  initView(component);
}
