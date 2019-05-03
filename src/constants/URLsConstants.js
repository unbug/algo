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
  getTree: () => `mocks/algo.json?${cacheId}`,
}

export default {
  updateCacheId,
  tree,
};
