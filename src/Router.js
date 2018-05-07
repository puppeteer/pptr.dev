class Router {
  constructor(changedCallback) {
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      changedCallback.call(null, params);
    });
  }

  setRoute(route) {
    window.location.hash = route;
  }

  static createRoute(apiVersion, viewId) {
    return `?v=${apiVersion}&show=${viewId}`;
  }
}

