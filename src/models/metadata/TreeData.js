import ErrorModel from '../ErrorModel';
import URLs from '../../constants/URLsConstants';
import Store from '../Store';
import * as TreeHandler from '../../utils/TreeHandler';

class TreeData {
  constructor() {
    this._store = new Store(Infinity);
  }

  async requestTree(nocache = false) {
    const url = URLs.tree.getTree();
    const cacheId = 'requestTree';
    const cache = this._store.get(cacheId);
    if (!nocache && cache) {
      return cache;
    }
    try {
      let res = await fetch(url);
      res = await res.json();
      if (res) {
        const data = TreeHandler.sortTree(TreeHandler.serializeTree(res));
        !nocache && this._store.save(cacheId, data);
        return data;
      } else {
        throw new Error(`Request tree failed`);
      }
    } catch (err) {
      ErrorModel.error = err;
    }
  }
}

export default new TreeData();
