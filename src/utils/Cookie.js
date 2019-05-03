/**
 * Get cookie value
 * @param  {String} name Cookie name
 * @return {String}      Cookie value of given name
 */
export const getCookie = name => {
  if (name != null) {
    let segs = document.cookie.split(';');
    for (let i = 0; i < segs.length; i++) {
      let kv = segs[i].split('=');
      if (kv.length > 1 && name.toLowerCase() == decodeURIComponent(kv[0].toLowerCase().trim())) {
        return decodeURIComponent(kv[1].trim());
      }
    }
  }
  return null;
}

/**
 * Set cookie value
 * @param  {String} name    Cookie name to set value
 * @param  {String} value   Cookie value
 * @param  {Object} options Cookie options
 * @return {Boolean} Whether the cookie is set successfully
 */
export const setCookie = (name, value, options) => {
  if (!options) {
    options = {};
  }
  value = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  // Set expiration
  if (!options.sessionOnly) {
    let expires = new Date();
    if (options.seconds) {
      expires.setTime(expires.getTime() + (options.seconds * 1000));
    } else {
      expires.setMonth(expires.getMonth() + 1);
    }
    value += '; expires=' + expires.toUTCString();
  }

  // Set path
  let path = options.path;
  if (!path) {
    path = '/';
  }
  value += '; path=' + path;

  if (!options.domain) {
    value += '; domain=' + options.domain;
  }

  document.cookie = value;
  return true;
}
