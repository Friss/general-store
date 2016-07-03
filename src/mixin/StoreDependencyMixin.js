/**
 * @flow
 */
import DispatcherInstance from '../dispatcher/DispatcherInstance';
import Store from '../store/Store';

type ActionIndex = {
  [key:string]: {
    dispatchTokens: Array<string>;
    fields: Array<string>;
  }
}

function getPropTypes(dependencyMap: Object): {[key:string]: Function} {
  return Object.keys(dependencyMap).reduce((types, dependencyName) => {
    let {propTypes} = dependencyMap[dependencyName];
    if (propTypes && typeof propTypes === 'object') {
      Object.keys(propTypes).forEach(propName => {
        types[propName] = propTypes[propName];
      });
    }
    return types
  }, {});
}

function calculate(dependency, props, state) {
  let {deref, stores} = dependency;
  if (stores instanceof Store) {
    return stores.get();
  }
  if (deref.length === 0) {
    return deref();
  }
  if (deref.length === 1) {
    return deref(props);
  }
  return deref(props, state, stores);
}

function calculateInitial(dependencyMap, props, state) {
  const updates = {};
  for (let field in dependencyMap) {
    updates[field] = calculate(dependencyMap[field], props, state);
  }
  return updates;
}

function calculateForPropsChange(dependencyMap, props) {
  const updates = {};
  for (let field in dependencyMap) {
    const dep = dependencyMap[field];
    if (dep.deref && dep.deref.length > 0) {
      updates[field] = calculate(dep, props);
    }
  }
  return updates;
}

function calculateForStateChange(dependencyMap, props, state) {
  const updates = {};
  for (let field in dependencyMap) {
    const dep = dependencyMap[field];
    if (dep.deref && dep.deref.length > 1) {
      updates[field] = calculate(dep, props, state);
    }
  }
  return updates;
}

function getActionIndex(dependencyMap) {
  const index: ActionIndex = {};
  for (let field in dependencyMap) {
    const dep = dependencyMap[field];
    const stores = dep instanceof Store ? [dep] : dep.stores;
    stores.forEach((store) => {
      store.getActionTypes().forEach((actionType) => {
        let entry = index[actionType];
        if (!entry) {
          entry = index[actionType] = {
            fields: [],
            dispatchTokens: [],
          };
        }
        const token = store.getDispatchToken();
        if (entry.dispatchTokens.indexOf(token) === -1) {
          entry.dispatchTokens.push(token);
        }
        if (entry.fields.indexOf(field) === -1) {
          entry.fields.push(field);
        }
      });
    });
  }
  return index;
}

function getUsesState(dependencyMap) {
  for (let field in dependencyMap) {
    const dep = dependencyMap[field];
    if (!(dep instanceof Store) && dep.deref.length > 1) {
      return true;
    }
  }
  return false;
}

function waitForStores(dispatcher, tokens) {
  if (dispatcher) {
    dispatcher.waitFor(tokens);
  }
}

export default function StoreDependencyMixin(
  dependencyMap: Object,
  overrideDispatcher: ?Object
): Object {

  const actionIndex = getActionIndex(dependencyMap);
  const dispatcher = overrideDispatcher || DispatcherInstance.get();

  let mixinToken;

  const mixin = {
    propTypes: {},

    componentWillMount(): void {
      if (dispatcher) {
        mixinToken = dispatcher.register((payload) => {
          const actionType = payload.actionType || payload.type;
          if (!actionIndex[actionType]) {
            return;
          }
          const entry = actionIndex[actionType];
          waitForStores(dispatcher, entry.dispatchTokens);
          this.setState(
            entry.fields.reduce((updates, field) => {
              updates[field] = calculate(
                dependencyMap[field],
                this.props,
                this.state
              );
              return updates;
            }, {})
          );
        });
      }
      this.setState(
        calculateInitial(dependencyMap, this.props, this.state)
      );
    },

    componentDidUpdate: () => {},

    componentWillReceiveProps(nextProps): void {
      this.setState(
        calculateForPropsChange(dependencyMap, nextProps)
      );
    },

    componentWillUnmount(): void {
      if (dispatcher && mixinToken) {
        dispatcher.unregister(mixinToken);
      }
    },

    getInitialState(): Object {
      return {};
    },
  };

  if (getUsesState(dependencyMap)) {
    mixin.componentDidUpdate = () => {
      this.setState(
        calculateForStateChange(dependencyMap, this.props, this.state)
      );
    };
  }

  if (process.env.NODE_ENV !== 'production') {
    mixin.propTypes = getPropTypes(dependencyMap);
  }

  return mixin;
}
