import BaseModel from './BaseModel';
import TreeData from './metadata/TreeData';
import LocalStorage from '../utils/LocalStorage';
import FileSaver from 'file-saver';
import AppModel from './AppModel';
import * as TreeHandler from '../utils/TreeHandler';

const TREE_KEY = `${AppModel.appName}_tree_store_key`;

class MainModel extends BaseModel {
  constructor() {
    super();
    this._data = {
      tree: null,
      loadedFromLocal: false,
      localAvailable: LocalStorage.getItem(TREE_KEY) || false,
      selectedNode: null,
    };
  }

  async requestTree() {
    const data = await TreeData.requestTree(true /*no cache*/);
    if (data) {
      this.update({
        tree: data
      });
    }
  }

  loadFromLocal() {
    const data = LocalStorage.getItem(TREE_KEY);
    if (data) {
      this.update({
        loadedFromLocal: true,
        tree: data
      });
    }
  }

  saveToLocal() {
    if (this.tree) {
      LocalStorage.setItem(TREE_KEY, this.tree);
      this.update({
        tree: this.tree,
        localAvailable: true
      });
    }
  }

  download() {
    let blob = new Blob([JSON.stringify(TreeHandler.standardizeTree(this.tree))], {
      type: 'application/json;charset=utf-8'
    });
    FileSaver.saveAs(blob, 'algo.json');
  }

  downloadCSV() {
    let blob = new Blob([TreeHandler.treeToTable(this.tree).map(dt => {
      return dt.join(',');
    }).join('\n')], {
        type: 'data:text/csv;charset=utf-8'
      });
    FileSaver.saveAs(blob, 'algo.csv');
  }

  get selectedNode() {
    return this._data.selectedNode;
  }

  get tree() {
    return this._data.tree;
  }

  get loadedFromLocal() {
    return this._data.loadedFromLocal;
  }

  get localAvailable() {
    return this._data.localAvailable;
  }

  getStandardTree(len) {
    return this.tree && TreeHandler.standardizeTree(this.tree, len);
  }

  getArrayTree(len) {
    len = len ? parseInt(len) : null;
    return this.tree ? TreeHandler.treeToArray(this.tree, [], len) : [];
  }
}

export default new MainModel();
