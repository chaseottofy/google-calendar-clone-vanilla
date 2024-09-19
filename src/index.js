import './styles/root.css';
import './styles/containers.css';
// import './styles/monthview.css';
// import './styles/sidebar.css';
import './styles/asideContainers.css';
import './styles/header.css';
import './styles/sbdatepicker.css';
import './styles/aside/datepicker.css';
import './styles/aside/goto.css';
import './styles/aside/toggleForm.css';
import './styles/aside/sidebarSubMenu.css';
import './styles/aside/changeViewModule.css';
import './styles/aside/editCategoryForm.css';
import './styles/aside/timepicker.css';
import './styles/aside/deleteCategoryPopup.css';
import './styles/aside/entryOptions.css';
import './styles/aside/info.css';
import './styles/aside/shortcuts.css';

async function initApp() {
  try {
    // await loadAllCSS();
    // Now dynamically import and execute your scripts
    const { setTheme } = await import('./utilities/helpers');
    const { default: renderViews } = await import('./config/renderViews');
    const { default: context, datepickerContext } = await import('./context/appContext');
    const { default: store } = await import('./context/store');
    setTheme(context, store);
    renderViews(context, datepickerContext, store);
  } catch (error) {
    console.error('Error loading application:', error);
  }
}

initApp();
// function loadAllCSS() {
//   return Promise.all(cssFiles.map(file => loadCSS(file)));
// }

// async function initApp() {
//   try {
//     await loadAllCSS();

//     // Now that CSS is loaded, dynamically import and execute your scripts
//     const { setTheme } = await import('./utilities/helpers');
//     const { default: renderViews } = await import('./config/renderViews');
//     const { default: context, datepickerContext } = await import('./context/appContext');
//     const { default: store } = await import('./context/store');

//     setTheme(context, store);
//     renderViews(context, datepickerContext, store);
//   } catch (error) {
//     console.error('Error loading application:', error);
//   }
// }

// initApp();
// import { setTheme } from './utilities/helpers';
// import renderViews from './config/renderViews';
// import context, { datepickerContext } from './context/appContext';
// import store from './context/store';

/* !*************************************! */
// setTheme(context, store);
// renderViews(context, datepickerContext, store);

/*
fetch('http://localhost:3001/store')
  .then((res) => res.json())
  .then((data) => console.log(data))
*/
