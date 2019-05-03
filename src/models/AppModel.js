import BaseModel from './BaseModel';
import LocalStorage from '../utils/LocalStorage';
import * as Tools from '../utils/Tools';
import Config from '../constants/Config';

const APP_NANE = Config.appName;
const DEVICE_ID_KEY = `${APP_NANE}_device_id`;

class AppModel extends BaseModel {
  constructor() {
    super();
    this._data = {
      debug: Config.debug,
      appName: APP_NANE,
      deviceId: LocalStorage.getItem(DEVICE_ID_KEY),
    };
    if (!this._data.deviceId) {
      this._data.deviceId = Tools.uuid();
      LocalStorage.setItem(DEVICE_ID_KEY, this._data.deviceId)
    }
  }

  get debug() {
    return this._data.debug;
  }

  get appName() {
    return this._data.appName;
  }

  get deviceId() {
    return this._data.deviceId;
  }
}

export default new AppModel();
