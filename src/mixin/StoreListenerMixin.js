/**
 * @flow
 */

var EventHandler = require('../event/EventHandler.js');
var StoreFacade = require('../store/StoreFacade.js');

type StoreDependencies = {
  [key:string]: {
    store: StoreFacade;
    deref: ?(store: StoreFacade) => any;
  };
};

function bindStoreHandlers(
  component: Object,
  dependencies: StoreDependencies
): Array<EventHandler> {
  return Object.keys(dependencies)
    .map(key => {
      var handler = dependencies[key].store.addOnChange(
        component.setStoreState.bind(component, key)
      );
      return handler;
    });
}

function defaultDeref(
  store: StoreFacade
): any {
  return store.get();
}

function derefStore(
  component: Object,
  key: string
): any {
  var definition = component._storeDependencies[key];
  var deref = definition.deref || defaultDeref;
  return deref(definition.store);
}

function unbindStoreHandlers(
  component: Object
): void {
  if (!component._storeDependencyHandlers) {
    return;
  }
  while (component._storeDependencyHandlers.length) {
    component._storeDependencyHandlers.pop().remove();
  }
  delete component._storeDependencyHandlers;
}

var StoreListenerMixin = {

  componentWillMount(): void {
    this._storeDependencies = this.getStoreDependencies();
    this._storeDependencyHandlers = bindStoreHandlers(this, this._storeDependencies);
    this.replaceStoreState();
  },

  componentWillUpdate(): void {
    this.replaceStoreState();
  },

  componentWillUnmount(): void {
    unbindStoreHandlers(this);
  },

/**
 * getStoreDependencies(): StoreDependencies {
 *   return {
 *     example: {
 *       store: ExampleStore
 *       deref: store => store.get('some-key')
 *     }
 *   };
 * },
 *
 * render(): React {
 *   return (
 *     <h1>{this.state.example.name}<h1>
 *   );
 * }
 */

  /**
   * Forces the mixin to update ALL store dependencies.
   * Uses this.setState().
   */
  replaceStoreState(): void {
    var updates = {};
    for(var key in this._storeDependencies) {
      updates[key] = derefStore(this, key);
    }
    this.setState(updates);
  },

  /**
   * Forces the mixin to update the dependency defined in `key`
   * Uses this.setState().
   */
  setStoreState(key: string): void {
    var stateUpdate = {};
    stateUpdate[key] = derefStore(this, key);
    this.setState(stateUpdate);
  }

};

module.exports = StoreListenerMixin;
