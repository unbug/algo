const RouterConstants = {
  main: '/type=:type&query=:query?',
};

export function genPath(path, option) {
  let res = path;
  Object.keys(option).forEach(key => {
    res = res.replace(key, option[key]);
  });
  return res;
}

export default RouterConstants;
