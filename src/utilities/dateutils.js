import { formatTime, formatStartEndTimes } from "./timeutils";
import locales from "../locales/en";
const labels = locales.labels;
const monthNames = labels.monthsShort;

export default function createDate(year, month, day) {
  const pad = (num) => { return num < 10 ? `0${num}` : num; };
  Date.prototype.toCustomISO = function () {
    return this.getFullYear() +
      '-' + pad(this.getMonth() + 1) +
      '-' + pad(this.getDate()) +
      'T' + pad(this.getHours()) +
      ':' + pad(this.getMinutes()) +
      ':' + pad(this.getSeconds()) +
      '.' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z';
  };
  if (!year && !month && !day) {
    return new Date().toCustomISO();
  } else {
    return new Date(year, month, day, 0, 0, 0, 0).toCustomISO().slice(0, 10);
  }
}

function testDate(date) {
  return date instanceof Date && !isNaN(date) ? date : new Date(date);
}

function getDateFormatted(date) {
  date = testDate(date);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getDateForStore(date) {
  date = testDate(date);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getdatearray(date) {
  return [+date.getFullYear(), +date.getMonth() + 1, +date.getDate()];
}

function formatDateForDisplay(date) {
  date = testDate(date);
  const month = locales.labels.monthsShort[date.getMonth()];
  const day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  let hm = `${hours}:${minutes}`;
  return `${month} ${day} ${date.getFullYear()}, (${hm}) `;
}

function compareDates(date1, date2) {
  [date1, date2] = [testDate(date1), testDate(date2)];
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function formatDuration(seconds) {
  let time = { year: 31536000, day: 86400, hour: 3600 },
    res = [];
  if (seconds === 0) return 'now';
  for (let key in time) {
    if (seconds >= time[key]) {
      let val = Math.floor(seconds / time[key]);
      res.push(val += val > 1 ? ' ' + key + 's' : ' ' + key);
      seconds = seconds % time[key];
    }
  }
  return res.length > 1 ? res.join(', ').replace(/,([^,]*)$/, ' &' + '$1') : res[0];
}

function formatDurationHourMin(seconds) {
  let time = { hour: 3600, minute: 60 },
    res = [];
  if (seconds === 0) return 'now';
  for (let key in time) {
    if (seconds >= time[key]) {
      let val = Math.floor(seconds / time[key]);
      res.push(val += val > 1 ? ' ' + key + 's' : ' ' + key);
      seconds = seconds % time[key];
    }
  }
  return res.length > 1 ? res.join(', ').replace(/,([^,]*)$/, ' &' + '$1') : res[0];
}

function formatStartEndDate(start, end, flag) {
  [start, end] = [testDate(start), testDate(end)];

  const [startday, startmonth, startyear] = [
    start.getDate(),
    monthNames[start.getMonth()],
    start.getFullYear()
  ];

  const [endday, endmonth, endyear] = [
    end.getDate(),
    monthNames[end.getMonth()],
    end.getFullYear()
  ];

  let tempstartyear = startyear;
  let tempendyear = endyear;
  if (flag) {
    tempstartyear = startyear.toString().slice(2, 4);
    tempendyear = endyear.toString().slice(2, 4);
  }

  if (startyear === endyear) {
    if (startmonth === endmonth) {
      if (startday === endday) {
        // same : day, month, year
        return `${startmonth} ${startday} ${startyear}`;
      } else {
        // same : month, year
        return `${startmonth} ${startday} – ${endday}, ${startyear}`;
      }
    } else {
      // same : year
      return `${startmonth} ${startday} – ${endmonth} ${endday}, ${startyear}`;
    }
  } else {
    // same : nothing
    return `${startmonth} ${startday}, ${tempstartyear} – ${endmonth} ${endday}, ${tempendyear}`;
  }
}

function formatStartEndTime(start, end) {
  [start, end] = [new Date(start), new Date(end)];
  let startmin = start.getMinutes();
  let endmin = end.getMinutes();
  endmin = endmin % 15 === 0 ? endmin : endmin + (15 - (endmin % 15));
  startmin = startmin % 15 === 0 ? startmin : startmin + (15 - (startmin % 15));
  let starttime = formatTime(start.getHours(), startmin);
  let endtime = formatTime(end.getHours(), endmin);
  if (starttime.slice(-2) === endtime.slice(-2)) {
    starttime = starttime.slice(0, -2);
  }
  return `${starttime} – ${endtime}`;
}

function getDuration(start, end) {
  [start, end] = [new Date(start), new Date(end)];
  const duration = formatDuration((Math.floor(end.getTime() / 1000)) - (Math.floor(start.getTime() / 1000)));
  if (duration === undefined) {
    return "completed";
  } else {
    return duration;
  }
}

function createDateFromFormattedString(dateString) {
  const dateArray = dateString.split("-");
  return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
}

function isBeforeDate(date1, date2) {
  [date1, date2] = [new Date(date1), new Date(date2)];
  return date1.getTime() < date2.getTime();
}

function isDate(value) {
  return value instanceof Date && !isNaN(value);
}

function getDateFromAttribute(target, attribute, view) {
  return target.getAttribute(attribute).split("-").map((x, i) => {
    if (view === "month") {
      return i === 1 ? parseInt(x) - 1 : parseInt(x);
    } else {
      return parseInt(x);
    }
  });
}

function getTimeFromAttribute(target, attribute) {
  return target.getAttribute(attribute).split(":").map((x) => {
    return parseInt(x);
  });
}

function getDateTimeFormatted(date, hour, minute) {
  date = testDate(date);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parseInt(hour),
    parseInt(minute),
    1,
    1,
  );
}

function getTempDates(tempdate, hours, minutes) {
  tempdate = testDate(tempdate);
  return [
    getDateTimeFormatted(tempdate, hours[0], minutes[0]),
    getDateTimeFormatted(tempdate, hours[1], minutes[1]),
  ];
}

function generateTempStartEnd(data) {
  let tempdate = new Date();

  const [year, month, day] = data;
  let startDate = new Date(year, month, day);
  startDate.setHours(tempdate.getHours());
  startDate.setMinutes(0);

  let endDate = new Date(startDate);
  endDate.setHours(tempdate.getHours());
  endDate.setMinutes(30);

  return [startDate, endDate];
}

function getFormDateObject(start, end) {
  [start, end] = [testDate(start), testDate(end)];

  const setmin = min => min === 0 ? "00" : min;
  return {
    dateObj: [start, end],
    minutes: [setmin(start.getMinutes()), setmin(end.getMinutes())],
    formatted: [getDateForStore(start), getDateForStore(end)],
  };
}

function sortDates(dates, dir) {
  return dates.sort((a, b) => {
    let [date1, date2] = [new Date(a), new Date(b)];
    if (dir === "asc") {
      return date1 - date2;
    } else {
      return date2 - date1;
    }
  });
}

function getDurationSeconds(date1, date2) {
  return (Math.floor(date2.getTime() / 1000)) - (Math.floor(date1.getTime() / 1000));
}

function formatEntryOptionsDate(date1, date2) {
  let [y1, y2] = [date1.getFullYear(), date2.getFullYear()];
  let [m1, m2] = [date1.getMonth(), date2.getMonth()];
  let [d1, d2] = [date1.getDate(), date2.getDate()];
  let [h1, h2] = [date1.getHours(), date2.getHours()];
  let [min1, min2] = [date1.getMinutes(), date2.getMinutes()];

  let useTempDate = false;
  let tempdateone = new Date();
  if (isBeforeDate(date1, tempdateone)) {
    useTempDate = true;
  }
  // if same day, month, & year -- return time as start-end
  // otherwise, return time as duration between start & end
  if (y1 === y2) {
    if (m1 === m2) {
      if (d1 === d2) {
        // === year, month, day
        let duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
        let durationTime = formatDurationHourMin(duration);
        return {
          date: `${labels.monthsLong[m1]} ${d1}, ${y1} (${formatStartEndTimes([h1, h2], [min1, min2])})`,
          time: durationTime,
        };
      } else {
        // === year, month
        let duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
        let durationTime = formatDuration(duration);
        return {
          date: `${labels.monthsLong[m1]} ${d1} – ${d2}, ${y1}`,
          time: durationTime,
        };
      }
    } else {
      // === year
      let duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
      let durationTime = formatDuration(duration);
      return {
        date: `${labels.monthsShort[m1]} ${d1} – ${labels.monthsShort[m2]} ${d2}, ${y2}`,
        time: durationTime,
      };
    }
  } else {
    // different year --- return full date
    let duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
    let durationTime = formatDuration(duration);
    return {
      date: `${labels.monthsShort[m1]} ${d1}, ${y1} – ${labels.monthsShort[m2]} ${d2}, ${y2}`,
      time: durationTime,
    };
  }
}

function createTimestamp() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = monthNames[date.getMonth()].toUpperCase();
  const day = parseInt(date.getDate());
  return `${month}${day}`;
}

function longerThanDay(date1, date2) {
  return getDurationSeconds(date1, date2) > 86400;
}

function getDayOrdinal(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export {
  testDate,
  getDateFormatted,
  getDateForStore,
  getdatearray,
  formatDateForDisplay,
  formatDuration,
  compareDates,
  createDateFromFormattedString,
  formatStartEndDate,
  formatStartEndTime,
  getDuration,
  isBeforeDate,
  isDate,
  getDateFromAttribute,
  getTimeFromAttribute,
  getDateTimeFormatted,
  getTempDates,
  generateTempStartEnd,
  getFormDateObject,
  sortDates,
  formatEntryOptionsDate,
  getDurationSeconds,
  createTimestamp,
  longerThanDay,
  getDayOrdinal,
};