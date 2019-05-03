function fn (str, reg) {
  if (str) {
    let data = {};
    str.replace(reg, function ($0, $1, $2, $3) {
      if ($3 === 'null') {
        $3 = null;
      }
      if ($3 === 'undefined') {
        $3 = undefined;
      }
      data[$1] = $3;
    });
    return data;
  }
}

export function searchParams(search) {
  search = search || window.location.search;
  return fn(search, new RegExp("([^?=&]+)(=([^&]*))?", "g")) || {};
}

export function hashParams(hash) {
  hash = hash || window.location.hash;
  return fn(hash, new RegExp("([^#=&]+)(=([^&]*))?", "g")) || {};
}

export function params(search, hash) {
  return {
    search: searchParams(search),
    hash: hashParams(hash)
  }
}

export function simpleSerialize(data) {
  if (data === undefined || data === null || typeof data != 'object') {
    return '';
  }
  let keys = Object.keys(data);
  return keys.reduce((res, key) => {
    if (data[key] === undefined || data[key] === null) {
      return res;
    }
    return [...res, `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`];
  }, []).join('&');
}
