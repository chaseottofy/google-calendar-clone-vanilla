// import mocktwo from "../mocktwo.json"
// import mockthree from "../mockthree.json"
// import mockfour from "../mockfour.json"


// let randomTitles = 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will'
// https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex



let randomTitles = 'homework school work personal family health other misc walk workout breakfast lunch dinner sleep'
let randomDescription = 'this is a description of the event'
let categoryNames = [
  'default',
  'school',
  'misc',
]

const getRandomNum = () => {
  return Math.floor(Math.random() * 6)
}

randomTitles = randomTitles.replace(/,/g, '').split(" ")

const getWord = () => randomTitles[Math.floor(Math.random() * randomTitles.length)]

let endYears = [2023, 2023]
function generateStart() {
  let year = endYears[Math.floor(Math.random() * 1)];
  let month = Math.floor(Math.random() * 12);
  let day = Math.floor(Math.random() * 26);
  let hour = Math.floor(Math.random() * 4) + 8;
  let minute = Math.round((Math.floor(Math.random() * 46) / 15)
  ) * 15;

  return new Date(
    year,
    month,
    day,
    hour,
    minute,
    0,
    0,
  )
}

function generateEnd(start) {
  let endDay = Math.floor(Math.random() * 1)
  let endHour = Math.floor(Math.random() * 4) + 12

  return new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + endDay,
    endHour,
    start.getMinutes(),
    0,
    0,
  )
}

let fakeEntries = Array.from({ length: 500 }, () => ({
  category: categoryNames[Math.floor(Math.random() * categoryNames.length)],
  completed: getRandomNum() === 3 ? true : false,
  description: randomDescription,
  start: generateStart(),
  title: getWord(),
}))
fakeEntries.forEach((entry) => {
  entry.end = generateEnd(entry.start)
})

export default fakeEntries




// add the following to the bottom of "./store.js" before the export default to create some fake entries
/*
function createFakeCategories() {
  let fakeCategories = [
    'really really really really really long category name',
    'category2', 'category3', 'category4',
    'category5', 'category6', 'category7',
  ]
  fakeCategories.forEach((category, idx) => {
    store.addNewCtg(category, colors.blue[idx + 1])
  })
}

function createFakeEntries(amount) {
  for (let i = 0; i < amount; i++) {
    let entry = mockfour[i]
    store.addEntry(new Entry(
      entry.category,
      entry.completed,
      entry.description,
      new Date(entry.end),
      new Date(entry.start),
      entry.title
    ))
  }
}
store.addEntry(new Entry(
  "default",
  true,
  "hello",
  new Date(2023, 1, 1, 8, 8, 8, 8),
  new Date(2023, 1, 1, 4, 4, 4, 4),
  "hello again"
))
store.addEntry(new Entry(
  "default",
  true,
  "hello",
  new Date(2023, 0, 1, 6, 6, 6, 6),
  new Date(2023, 0, 1, 5, 5, 5, 5),
  "hello again"
))

console.log(localStorage.getItem("store"))
createFakeEntries(100)
store.addEntry(new Entry(
  "default",
  true,
  "hello",
  new Date(2023, 1, 25, 8, 8, 8, 8),
  new Date(2023, 1, 23, 8, 8, 8, 8),
  "hello again"
))

store.addEntry(new Entry(
  "default",
  true,
  "hello there",
  new Date(2023, 1, 27, 4, 4, 4, 4),
  new Date(2023, 1, 23, 5, 5, 5, 5),
  "hello again"
))

store.addEntry(new Entry(
  "default",
  true,
  "hello there fried",
  new Date(2023, 1, 23, 8, 8, 8, 8),
  new Date(2023, 1, 23, 5, 5, 5, 5),
  "hello again fried"
))

createFakeCategories()
*/
