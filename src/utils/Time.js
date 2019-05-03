export const secToStrTime = sec => {
  if (!sec) {
    return '00:00:00';
  }
  const date = new Date(null);
  date.setSeconds(parseInt(sec));
  return date.toISOString().substr(11, 8);
}

export const strTimeToSec = str => {
  if (!str) {
    return 0;
  }
  str = str.replace(/(;|\.).*$/, '');
  return str.split(':').reduce((acc, curr) => (60 * acc) + +curr, 0);
}
