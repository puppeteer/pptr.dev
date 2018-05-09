class Router {
  constructor(defaultRoute, changedCallback) {
    this._changedCallback = changedCallback;
    window.addEventListener('popstate', this._onPopState.bind(this), false);
    if (window.location.hash.length > 1)
      this._onPopState();
    else
      Router.setRoute(defaultRoute);
  }

  _onPopState() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    this._changedCallback.call(null, params);
  }

  static setRoute(route) {
    window.location.hash = route;
  }

  static createRoute(apiVersion, viewId, searchQuery = null) {
    return `#?v=${apiVersion}&show=${viewId}${searchQuery !== null ? '&q=' + searchQuery : ''}`;
  }
}

