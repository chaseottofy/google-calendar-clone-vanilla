/*! *************************************!*\
// (CSS)
/*!*************************************! */
// I'm not currently using CSS modules, so all of my styles are imported in the root of the project and are global. Is there a workaround for this without using CSS modules?
// import { loadCSS } from './utilities/cssLoader';
import './styles/root.css';
import './styles/header.css';
import './styles/containers.css';

const cssImports = {
  year: () => import('./styles/yearview.css').then(() => console.log('yearview.css loaded')),
  month: () => import('./styles/monthview.css').then(() => console.log('monthview.css loaded')),
  week: () => import('./styles/weekview.css').then(() => console.log('weekview.css loaded')),
  day: () => import('./styles/dayview.css').then(() => console.log('dayview.css loaded')),
  list: () => import('./styles/listview.css').then(() => console.log('listview.css loaded')),
  // year: () => loadCSS('./styles/yearview.css'),
  // month: () => loadCSS('./styles/monthview.css'),
  // week: () => loadCSS('./styles/weekview.css'),
  // day: () => loadCSS('./styles/dayview.css'),
  // list: () => loadCSS('./styles/listview.css'),
};
// import './styles/yearview.css';
// import './styles/monthview.css';
// import './styles/weekview.css';
// import './styles/dayview.css';
// import './styles/listview.css';

// Promise.all([
//   loadCSS('./styles/sidebar.css'),
//   loadCSS('./styles/sbdatepicker.css'),
// ]);
import './styles/sidebar.css';
import './styles/sbdatepicker.css';

import './styles/aside/datepicker.css';
import './styles/aside/toast.css';
import './styles/aside/goto.css';
import './styles/aside/toggleForm.css';
import './styles/aside/sidebarSubMenu.css';
import './styles/aside/changeViewModule.css';
import './styles/aside/editCategoryForm.css';
import './styles/aside/form.css';
import './styles/aside/timepicker.css';
import './styles/aside/deleteCategoryPopup.css';
import './styles/aside/entryOptions.css';
import './styles/aside/info.css';
import './styles/aside/shortcuts.css';

import renderViews from './config/renderViews';
import context, { datepickerContext } from './context/appContext';
import store from './context/store';
import { setTheme } from './utilities/helpers';

/* !*************************************! */
setTheme(context, store);
renderViews(context, datepickerContext, store, cssImports);

/*
fetch('http://localhost:3001/store')
  .then((res) => res.json())
  .then((data) => console.log(data))
*/
