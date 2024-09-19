import locales from '../locales/en';
import { formatStartEndTimes, formatTime } from './timeutils';

function getHourMinInts(time, delimiter = ':') {
  return time.split(delimiter).map((x) => Number.parseInt(x));
}

function time1IsGreater(time1, time2) {
  const [hours1, minutes1] = time1;
  const [hours2, minutes2] = time2;

  if (hours1 > hours2) return true;
  if (hours1 === hours2) return minutes1 > minutes2;
  return false;
}

function padTime(time) {
  time = typeof time === 'number' ? time.toString() : time;
  return time.padStart(2, '0');
}

function getHour12Time(hour, minute) {
  if (minute >= 60) {
    minute = 0;
    hour += 1;
  }

  let amPm = hour < 12 ? 'am' : 'pm';
  let hour12 = hour % 12 || 12;
  let minuteStr = minute.toString().padStart(2, '0');
  return `${hour12}:${minuteStr} ${amPm}`;
}

function getHour24Time(hour, minute) {
  if (minute >= 60) {
    minute = 0;
    hour += 1;
  }

  let hour24 = hour % 24;
  let minuteStr = minute.toString().padStart(2, '0');
  return `${hour24}:${minuteStr}`;
}

function getNextQuarterHour(startHour, startMinute) {
  if (startMinute >= 60) {
    startMinute = 0;
    startHour += 1;
  } else if (startMinute % 15 !== 0) {
    startMinute = Math.ceil(startMinute / 15) * 15;
  }
  let nextMinute = (startMinute + 15) % 60;
  let nextHour = (startHour + Math.floor((startMinute + 15) / 60)) % 24;
  const time12 = getHour12Time(nextHour, nextMinute);
  const time24 = [nextHour, padTime(nextMinute)];
  return [time12, time24];
}

function toCustomISO(date) {
  const pad = (num) => { return num < 10 ? `0${num}` : num; };
  return date.getFullYear()
    + '-' + pad(date.getMonth() + 1)
    + '-' + pad(date.getDate())
    + 'T' + pad(date.getHours())
    + ':' + pad(date.getMinutes())
    + ':' + pad(date.getSeconds())
    + '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5)
    + 'Z';
}

export default function createDate(year, month, day) {
  if (!year && !month && !day) {
    return toCustomISO(new Date());
  } else {
    return toCustomISO(new Date(year, month, day, 0, 0, 0, 0)).slice(0, 10);
  }
}

function testDate(date) {
  return date instanceof Date && !Number.isNaN(date) ? date : new Date(date);
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

function compareDates(date1, date2) {
  [date1, date2] = [testDate(date1), testDate(date2)];
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function formatDuration(seconds) {
  const time = { year: 31_536_000, day: 86_400, hour: 3600 };
  const res = [];
  if (seconds === 0) return 'now';
  for (const key in time) {
    if (seconds >= time[key]) {
      let val = Math.floor(seconds / time[key]);
      res.push(val += val > 1 ? ' ' + key + 's' : ' ' + key);
      seconds %= time[key];
    }
  }
  return res.length > 1 ? res.join(', ').replace(/,([^,]*)$/, ' &$1') : res[0];
}

function formatDurationHourMin(seconds) {
  const time = { hour: 3600, minute: 60 };
  const res = [];
  if (seconds === 0) return 'now';
  for (const key in time) {
    if (seconds >= time[key]) {
      let val = Math.floor(seconds / time[key]);
      res.push(val += val > 1 ? ' ' + key + 's' : ' ' + key);
      seconds %= time[key];
    }
  }
  return res.length > 1 ? res.join(', ').replace(/,([^,]*)$/, ' &$1') : res[0];
}

function formatStartEndDate(start, end, flag) {
  const { monthsShort: monthNames } = locales.labels;
  [start, end] = [testDate(start), testDate(end)];

  const [startday, startmonth, startyear] = [
    start.getDate(),
    monthNames[start.getMonth()],
    start.getFullYear(),
  ];

  const [endday, endmonth, endyear] = [
    end.getDate(),
    monthNames[end.getMonth()],
    end.getFullYear(),
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
  const endtime = formatTime(end.getHours(), endmin);
  if (starttime.slice(-2) === endtime.slice(-2)) {
    starttime = starttime.slice(0, -2);
  }
  return `${starttime} – ${endtime}`;
}

function getDuration(start, end) {
  [start, end] = [new Date(start), new Date(end)];
  const duration = formatDuration((Math.floor(end.getTime() / 1000)) - (Math.floor(start.getTime() / 1000)));
  if (duration === undefined) {
    return 'completed';
  } else {
    return duration;
  }
}

function createDateFromFormattedString(dateString) {
  const dateArray = dateString.split('-');
  return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
}

function isBeforeDate(date1, date2) {
  [date1, date2] = [new Date(date1), new Date(date2)];
  return date1.getTime() < date2.getTime();
}

function isDate(value) {
  return value instanceof Date && !Number.isNaN(value);
}

function getDateFromAttribute(target, attribute, view) {
  return target.getAttribute(attribute).split('-').map((x, i) => {
    if (view === 'month') {
      return i === 1 ? Number.parseInt(x) - 1 : Number.parseInt(x);
    } else {
      return Number.parseInt(x);
    }
  });
}

function getDateFromArray(arr) {
  return new Date(arr.map((x) => Number.parseInt(x)));
}

function getDateTimeFormatted(date, hour, minute) {
  date = testDate(date);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number.parseInt(hour),
    Number.parseInt(minute),
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
  const tempdate = new Date();

  const [year, month, day] = data;
  const startDate = new Date(year, month, day);
  startDate.setHours(tempdate.getHours());
  startDate.setMinutes(0);

  const endDate = new Date(startDate);
  endDate.setHours(tempdate.getHours());
  endDate.setMinutes(30);

  return [startDate, endDate];
}

function getFormDateObject(start, end) {
  [start, end] = [testDate(start), testDate(end)];
  const setmin = (min) => {
    const minval = min.getMinutes();
    if (minval === 0) return '00';
    return minval;
  };

  // console.log([getDateForStore(start), getDateForStore(end)]);
  return {
    dateObj: [start, end],
    minutes: [setmin(start), setmin(end)],
    formatted: [getDateForStore(start), getDateForStore(end)],
  };
}

function sortDates(dates, dir) {
  return dates.sort((a, b) => {
    const [date1, date2] = [new Date(a), new Date(b)];
    if (dir === 'asc') {
      return date1 - date2;
    } else {
      return date2 - date1;
    }
  });
}

function sortEndDateValues(vals) {
  if (vals.length <= 1) return vals;
  return vals.sort((a, b) => {
    if ('end' in a && 'end' in b) {
      return new Date(a.end) - new Date(b.end) || new Date(a.start) - new Date(b.start);
    }
    return a - b;
  });
}

function getDurationSeconds(date1, date2) {
  return (Math.floor(date2.getTime() / 1000)) - (Math.floor(date1.getTime() / 1000));
}

function formatEntryOptionsDate(date1, date2) {
  const { labels } = locales;
  const [y1, y2] = [date1.getFullYear(), date2.getFullYear()];
  const [m1, m2] = [date1.getMonth(), date2.getMonth()];
  const [d1, d2] = [date1.getDate(), date2.getDate()];
  const [h1, h2] = [date1.getHours(), date2.getHours()];
  const [min1, min2] = [date1.getMinutes(), date2.getMinutes()];

  let useTempDate = false;
  const tempdateone = new Date();
  if (isBeforeDate(date1, tempdateone)) {
    useTempDate = true;
  }
  // if same day, month, & year -- return time as start-end
  // otherwise, return time as duration between start & end
  if (y1 === y2) {
    if (m1 === m2) {
      if (d1 === d2) {
        // === year, month, day
        const duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
        const durationTime = formatDurationHourMin(duration);
        return {
          date: `${labels.monthsLong[m1]} ${d1}, ${y1} (${formatStartEndTimes([h1, h2], [min1, min2])})`,
          time: durationTime,
        };
      } else {
        // === year, month
        const duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
        const durationTime = formatDuration(duration);
        return {
          date: `${labels.monthsLong[m1]} ${d1} – ${d2}, ${y1}`,
          time: durationTime,
        };
      }
    } else {
      // === year
      const duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
      const durationTime = formatDuration(duration);
      return {
        date: `${labels.monthsShort[m1]} ${d1} – ${labels.monthsShort[m2]} ${d2}, ${y2}`,
        time: durationTime,
      };
    }
  } else {
    // different year --- return full date
    const duration = getDurationSeconds(useTempDate ? tempdateone : date1, date2);
    const durationTime = formatDuration(duration);
    return {
      date: `${labels.monthsShort[m1]} ${d1}, ${y1} – ${labels.monthsShort[m2]} ${d2}, ${y2}`,
      time: durationTime,
    };
  }
}

function createTimestamp() {
  const date = new Date();
  const day = Number.parseInt(date.getDate());
  return `${day}`;
}

function longerThanDay(date1, date2) {
  return getDurationSeconds(date1, date2) > 86_400;
}

function getDayOrdinal(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: {
      return 'st';
    }
    case 2: {
      return 'nd';
    }
    case 3: {
      return 'rd';
    }
    default: {
      return 'th';
    }
  }
}

export {
  compareDates,
  createDateFromFormattedString,
  createTimestamp,
  formatDuration,
  formatEntryOptionsDate,
  formatStartEndDate,
  formatStartEndTime,
  generateTempStartEnd,
  getdatearray,
  getDateFormatted,
  getDateForStore,
  getDateFromArray,
  getDateFromAttribute,
  getDateTimeFormatted,
  getDayOrdinal,
  getDuration,
  getDurationSeconds,
  getFormDateObject,
  getHour12Time,
  getHour24Time,
  getHourMinInts,
  getNextQuarterHour,
  getTempDates,
  isBeforeDate,
  isDate,
  longerThanDay,
  padTime,
  sortDates,
  sortEndDateValues,
  testDate,
  time1IsGreater,
};
