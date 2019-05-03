import Config from './Config';
import LocalStorage from '../utils/LocalStorage';

const CACHE_ID_KEY = `${Config.appName}_cache_id`;
let cacheId = LocalStorage.getItem(CACHE_ID_KEY);
if (!cacheId) {
  updateCacheId();
}

function updateCacheId() {
  cacheId = Date.now();
  LocalStorage.setItem(CACHE_ID_KEY, cacheId);
}

// tree APIs
const tree = {
  // mocks/algo.json
  // request from a GitHub gist
  getTree: () => `https://gist.githubusercontent.com/unbug/1c8e9965f4ae1daeb710096bb007d260/raw/146f60a89c83e11b80d3c5d277d8ee2797b12f02/algo.json?${cacheId}`,
}

export default {
  updateCacheId,
  tree,
};
