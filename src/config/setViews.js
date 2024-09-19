import setHeader from '../components/menus/header';

const hasCSS = new Set();

const views = {
  year: [
    document.querySelector('.yearview'),
    () => import('../components/views/yearview').then((module) => module.default),
    () => import('../styles/yearview2.css').then(() => hasCSS.add('year')),
  ],
  month: [
    document.querySelector('.monthview'),
    () => import('../components/views/monthview').then((module) => module.default),
    () => import('../styles/monthview.css').then(() => hasCSS.add('month')),
  ],
  week: [
    document.querySelector('.weekview'),
    () => import('../components/views/weekview').then((module) => module.default),
    () => import('../styles/weekview.css').then(() => hasCSS.add('week')),
  ],
  day: [
    document.querySelector('.dayview'),
    () => import('../components/views/dayview').then((module) => module.default),
    () => import('../styles/dayview.css').then(() => hasCSS.add('day')),
  ],
  list: [
    document.querySelector('.listview'),
    () => import('../components/views/listview').then((module) => module.default),
    () => import('../styles/listview.css').then(() => hasCSS.add('list')),
  ],
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
    if (prev1 !== null && resetPrevView !== null && prev1 !== prev2) {
      resetPrevView();
    }

    for (const key of viewsKeys) {
      if (key !== component) {
        views[key][0].classList.add('hide-view');
      }
    }
  }

  async function initView(comp) {
    const [view, setView, setCSS] = views[comp];
    setHeader(context, comp);
    context.setComponent(comp);

    if (!hasCSS.has(comp)) {
      await setCSS();
    }

    const viewModule = await setView();
    viewModule(context, store, datepickerContext);
    view.classList.remove('hide-view');
  }
  hideViews();
  document.title = context.getMonthName();
  initView(component);
}
// const setDayView = () => import('../components/views/dayview').then((module) => {
//   module.default();
// });
// const setListView = () => import('../components/views/listview').then((module) => module.default);
// const setMonthView = () => import('../components/views/monthview').then((module) => module.default);
// const setWeekView = () => import('../components/views/weekview').then((module) => module.default);
// const setYearView = () => import('../components/views/yearview').then((module) => module.default);
// const cssImports = {
//   year: () => import('../styles/yearview2.css').then(() => console.log('yearview.css loaded')),
//   month: () => import('../styles/monthview.css').then(() => console.log('monthview.css loaded')),
//   week: () => import('../styles/weekview.css').then(() => console.log('weekview.css loaded')),
//   day: () => import('../styles/dayview.css').then(() => console.log('dayview.css loaded')),
//   list: () => import('../styles/listview.css').then(() => console.log('listview.css loaded')),
// };
