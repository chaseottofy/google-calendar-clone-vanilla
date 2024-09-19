function formatTime(hours, minutes) {
  let md;
  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }
  if (+hours === 0) {
    hours = 12;
    md = 'am';
  } else if (hours < 12) {
    md = 'am';
  } else if (hours === 12) {
    md = 'pm';
  } else if (hours === 24) {
    md = 'am';
    hours -= 12;
  } else {
    hours -= 12;
    md = 'pm';
  }

  if (+minutes === 0) {
    return `${hours}${md}`;
  } else {
    return `${hours}:${minutes}${md}`;
  }
}

function formatStartEndTimes(hours, minutes) {
  const [startHours, endHours] = hours;
  const [startMinutes, endMinutes] = minutes;
  let start = formatTime(startHours, startMinutes);
  const end = formatTime(endHours, endMinutes);
  if (start.slice(-2) === end.slice(-2)) {
    start = start.slice(0, -2);
  }
  return `${start} – ${end}`;
}

function calcTime(start, length) {
  const startHours = Math.floor(+start / 4);
  const startMinutes = (+start * 15) % 60;

  const endHours = Math.floor((start + length) / 4);
  const endMinutes = ((start + length) * 15) % 60;

  let startingtime = formatTime(startHours, startMinutes);
  const endingtime = formatTime(endHours, endMinutes);

  if (startingtime.slice(-2) === endingtime.slice(-2)) {
    startingtime = startingtime.slice(0, -2);
  }

  const boxtime = `${startingtime} – ${endingtime}`;
  return boxtime;
}

export default calcTime;
export {
  formatStartEndTimes,
  formatTime,
};
