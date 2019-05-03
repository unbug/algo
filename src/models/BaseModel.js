import EventEmitter from 'events';

class Mutation {
  constructor(data) {
    this._data = data;
    this._serialize();
    this.has = this.has.bind(this);
  }

  _serialize() {
    Object.keys(this._data).forEach(key => {
      this[key] = true;
    });
  }

  get() {
    return this._data;
  }

  /**
   * Determines whether mutation includes a certain field, returning true or false as appropriate.
   *
   * @param {String|Array} fields Field names. If string, multi names separate by ','.
   * @returns {Boolean}
   */
  has(fields) {
    if (/string/i.test(typeof fields)) {
      fields = fields.split(',');
    }
    if (Array.isArray(fields)) {
      return fields.every((key) => {
        key = key.trim();
        return this[key];
      });
    }
    return false;
  }
}

class BaseModel extends EventEmitter {
  constructor() {
    super();
    this.on('error', () => {});
    this.setMaxListeners(99);
    this._updateEventName = 'update';
    this._data = {};
  }

  /**
   * Set/reset a new data object for the model.
   *
   * It will auto notify all the model listeners after the data of the model has changed,
   * and a "isReset" field auto added to the mutation object.
   *
   * @param {Object} data New data for model, if its non-object then set the model data as empty object.
   */
  set(data) {
    let prevData = Object.assign({}, this._data);
    this._data = data || {};
    this.notify(prevData, Object.assign({}, prevData, data, {isReset: true}));
  }

  /**
   * Returns current data of the model.
   *
   * @returns {Object|{}|*}
   */
  get() {
    return this._data;
  }

  /**
   * Create a model instance by the given data.
   *
   * If you want to reuse a helper method of a model, the method returns value that base on the model's own data
   * but not the raw data itself, you can create a new model instance by its "create(data)" function.
   *
   * e.g. create a model instance with an old data.
   *
   * let oldModelInstance = UserModel.create(prev);
   * let isTom = oldModelInstance.aHelperMethodReturnsTureOrFalseBaseOnTheUserNameIsTomOrNot();
   *
   * @param {Object} data A data object from a model.
   * @returns {Object}
   */
  create(data) {
    let instance = Object.create(Object.getPrototypeOf(this));
    instance._data = data;
    return instance;
  }

  /**
   * Notify all the model listeners that the data of the model has changed.
   *
   * @param {Object} prevData The preview data of the model.
   * @param {Object} mutationData A object contains the fields that has mutated.
   */
  notify(prevData, mutationData) {
    let data = Object.assign({}, this._data);
    this.emit(this._updateEventName, data, prevData || data, new Mutation(mutationData));
  }

  /**
   * Update model data's fields.
   *
   * It will auto notify all the model listeners after the data of the model has changed.
   *
   * @param {Object} data An object includes the fields that need to be updated.
   */
  update(data) {
    let prevData = Object.assign({}, this._data);
    Object.assign(this._data, data);
    this.notify(prevData, data);
  }

  /**
   * Register a new listener to watch the models update.
   *
   * @param {Function} listener A function that will be execute whenever the model data has changed.
   */
  onUpdated(listener) {
    this.on(this._updateEventName, listener);
  }

  /**
   *  Remove the models update listener.
   *
   * @param {Function} listener A function that will be execute whenever the model data has changed.
   */
  offUpdated(listener) {
    this.removeListener(this._updateEventName, listener);
  }
}

export default BaseModel;
