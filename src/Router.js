class Router {
  constructor(changedCallback) {
    this._changedCallback = changedCallback;
    window.addEventListener('popstate', this._onPopState.bind(this), false);
    if (window.location.hash !== '#')
      this._onPopState();
  }

  _onPopState() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    this._changedCallback.call(null, params);
  }

  setRoute(route) {
    window.location.hash = route;
  }

  static createRoute(apiVersion, viewId) {
    return `#?v=${apiVersion}&show=${viewId}`;
  }
}

