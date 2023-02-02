function formatTime(hours, minutes) {
  let md;
  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }
  if (+hours === 0) {
    hours = 12;
    md = "am";
  } else if (hours < 12) {
    md = "am";
  } else if (hours === 12) {
    md = "pm";
  } else if (hours === 24) {
    md = "am";
    hours -= 12;
  } else {
    hours -= 12;
    md = "pm";
  }

  if (+minutes === 0) {
    return `${hours}${md}`;
  } else {
    return `${hours}:${minutes}${md}`;
  }
}

function formatStartEndTimes(hours, minutes) {
  let [startHours, endHours] = hours;
  let [startMinutes, endMinutes] = minutes;

  let [start, end] = [
    formatTime(startHours, startMinutes),
    formatTime(endHours, endMinutes),
  ];

  if (start.slice(-2) === end.slice(-2)) {
    start = start.slice(0, -2);
  }

  return `${start} – ${end}`;
}

function configMinutesForStore(minutes) {
  return minutes === 0 ? "00" : minutes;
}

function calcTime(start, length) {
  let startHours = Math.floor(+start / 4);
  let startMinutes = (+start * 15) % 60;

  let endHours = Math.floor((start + length) / 4);
  let endMinutes = ((start + length) * 15) % 60;

  let startingtime = formatTime(startHours, startMinutes);
  let endingtime = formatTime(endHours, endMinutes);

  if (startingtime.slice(-2) == endingtime.slice(-2)) {
    startingtime = startingtime.slice(0, -2);
  }

  const boxtime = `${startingtime} – ${endingtime}`;
  return boxtime;
}

function compareTimes(time1, time2) {
  let [hours1, minutes1] = time1.split(":");
  let [hours2, minutes2] = time2.split(":");
  // get time difference in minutes
  let diff = (hours2 - hours1) * 60 + (minutes2 - minutes1);
  let closest;

  // if diff is negative, return the next closest time difference in 15 minute interval
  if (diff < 0) {
    closest = 15 * Math.ceil(diff / 15);
  } else {
    closest = true;
  }

  return [diff, closest];
}


export default calcTime;
export {
  configMinutesForStore,
  formatStartEndTimes,
  formatTime,
  compareTimes
};