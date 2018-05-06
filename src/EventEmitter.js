class EventEmitter {
  constructor() {
    /** @type {!Map<string, !Set<function(*)>>} */
    this._eventListeners = new Map();
  }

  /**
   * @param {string} eventName
   * @param {function(*)} listener
   * @return {!{emitter: EventEmitter, eventName: string, listener: function(*)}}
   */
  on(eventName, listener) {
    let listeners = this._eventListeners.get(eventName);
    if (!listeners) {
      listeners = new Set();
      this._eventListeners.set(eventName, listeners);
    }
    listeners.add(listener);
    return {
      emitter: this,
      eventName,
      listener
    };
  }

  /**
   * @param {string} eventName
   * @param {function(*)} listener
   */
  removeListener(eventName, listener) {
    let listeners = this._eventListeners.get(eventName);
    if (!listeners || !listeners.size)
      return;
    listeners.delete(listener);
  }

  /**
   * @param {string} eventName
   * @param {...*} args
   */
  emit(eventName, ...args) {
    let listeners = this._eventListeners.get(eventName);
    if (!listeners || !listeners.size)
      return;
    listeners = new Set(listeners);
    for (const listener of listeners)
      listener.call(null, ...args);
  }

  /**
   * @param {!Array<!{emitter: EventEmitter, eventName: string, listener: function(*)}>} descriptors
   */
  static removeEventListeners(descriptors) {
    for (const descriptor of descriptors)
      descriptor.emitter.removeListener(descriptor.eventName, descriptor.listener);
    descriptors.splice(0, descriptors.length);
  }
}
