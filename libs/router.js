const { htm } = require('@zeit/integration-utils');
const Route = require('route-parser');

module.exports = (ctx, defaultRoute = '/') => {
  const { payload, zeitClient } = ctx;
  const { clientState, action } = ctx.payload;

  const actionPrefix = '---ROUTER---';
  const routes = {};

  const routeName = name => actionPrefix + name;
  const filterRoute = name => name.replace(actionPrefix, '');

  const isMainRoute = action === 'view';
  const currentRoute = filterRoute(action);

  const navigate = name => {
    return routeName(name);
  };

  return {
    navigate,
    async register(name, view) {
      if (!routes[routeName(name)]) {
        routes[routeName(name)] = view;
      }
    },
    async Router() {
      if (!routes[routeName(defaultRoute)]) {
        throw Error('Route does not exist');
      }

      const Comp = Object.keys(routes)
        .map(path => {
          const params = new Route(filterRoute(path)).match(currentRoute);

          return params
            ? {
                view: routes[path],
                params
              }
            : false;
        })
        .filter(f => f)[0];

      if (Comp) {
        return Comp.view({
          ...ctx,
          htm,
          navigate,
          params: Comp.params
        });
      }

      return routes[
        isMainRoute || typeof routes[routeName(action)] === 'undefined'
          ? routeName(defaultRoute)
          : action
      ]({
        ...ctx,
        htm,
        navigate,
        params: {}
      });
    }
  };
};
