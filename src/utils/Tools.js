import platform from 'platform';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

export const getRandomFrames = (start, end, len) => {
  let frames = [];
  len = Math.min(len, end - start);
  while (frames.length < len) {
    const idx = getRandomIntInclusive(start, end);
    if (frames.indexOf(idx) == -1) {
      frames.push(idx);
    }
  }
  return frames;
}

export const getColorByScore = score => {
  let color = 'green';
  if (score < 0.1) {
    color = 'grey';
  } else if (score < 0.6) {
    color = 'red';
  } else if (score < 0.8) {
    color = 'orange';
  } else if (score < 0.9) {
    color = 'olive';
  }
  return color;
}

/**
 * Generate a new uuid v4
 * @param {number} Length.
 * @return {String} A new uuid string
 */
export const uuid = len => {
  let res = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
    let num = Math.random() * 16 | 0, v = c === 'x' ? num : (num & 0x3 | 0x8);
    return v.toString(16);
  });
  return len ? res.substr(0, len) : res;
}

export const fullscreen = container => {
  const requestFullscreen = container.requestFullscreen || container.mozRequestFullScreen ||
    container.webkitRequestFullscreen || container.msRequestFullscreen;
  if (requestFullscreen) {
    requestFullscreen.apply(container, [container.webkitRequestFullscreen ? Element.ALLOW_KEYBOARD_INPUT : null]);
  }
}

platform.isBrowser = str => {
  return new RegExp(str, 'i').test(platform.name);
};

platform.isOS = str => {
  return new RegExp(str, 'i').test(platform.os);
};

export { platform };
