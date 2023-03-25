/*
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  },
*/

/**
 * The following are functions that are used for testing purposes. The majority of testing has been done manually
 */

const randomTitles = "quaerat velit veniam amet cupiditate aut numquam ut sequi".split(" ");

const categoryNames = [
  'default',
];
let endYears = [2023, 2023];
function generateStart() {
  let year = endYears[Math.floor(Math.random() * 1)];
  let month = Math.floor(Math.random() * 4);
  let day = Math.floor(Math.random() * 30);
  let hour = Math.floor(Math.random() * 4) + 8;
  let minute = Math.round((Math.floor(Math.random() * 46) / 15)
  ) * 15;

  return new Date(
    year, month, day, hour, minute, 0, 0,
  );
}

function generateEnd(start) {
  let endDay = Math.floor(Math.random() * 1);
  let endHour = Math.floor(Math.random() * 4) + 12;

  return new Date(
    start.getFullYear(), start.getMonth(), start.getDate() + endDay,
    endHour, start.getMinutes(), 0, 0,
  );
}

class FEntry {
  constructor (category, completed, description, end, start, title) {
    this.category = category;
    this.completed = completed;
    this.description = description;
    this.end = end;
    this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.start = start;
    this.title = title;
  }
}

// const generateRandomEvents = () => {
export default function generateRandomEvents(numberOfEvents) {
  const events = [];
  if (numberOfEvents === undefined || numberOfEvents === null || numberOfEvents === 0 || numberOfEvents === NaN || numberOfEvents === Infinity || numberOfEvents === -Infinity || numberOfEvents === -0 || numberOfEvents > 1000) {
    numberOfEvents = 100;
  }
  for (let i = 0; i < numberOfEvents; i++) {
    const start = generateStart();
    const end = generateEnd(start);
    events.push(
      new FEntry(
        categoryNames[Math.floor(Math.random() * categoryNames.length)],
        true,
        "random body",
        end,
        start,
        randomTitles[Math.floor(Math.random() * randomTitles.length)]
      )
    );
  }
  return events;
}


/**
 * use the event listener below to find all elements with event listeners.
 */
// window.addEventListener("mouseup", () => {
//   for (let i = 0; i < document.all.length; i++) {
//     const element = document.all[i];
//     if (element.onmousedown) {
//       console.log("onmousedown", element.getAttribute("class"));
//     }
//     if (element.onkeydown) {
//       console.log("onkeydown", element.getAttribute("class"));
//     }
//     if (element.onclick) {
//       console.log("onclick", element.getAttribute("class"));
//     }
//   }
// });