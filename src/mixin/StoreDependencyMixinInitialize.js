/**
 * @flow
 */

import invariant from '../invariant.js';
import {
  dependencies,
  storeFields,
  stores
} from './StoreDependencyMixinFields.js';
import StoreFacade from '../store/StoreFacade.js';

function defaultDeref(
  props,
  state,
  storeInstances: Array<StoreFacade>
): any {
  return storeInstances[0].get();
}

export function applyDependencies(
  component: Object,
  dependencyMap: Object
): void {
  var componentDependencies = dependencies(component);
  var componentStoreFields = storeFields(component);
  var componentStores = stores(component);
  Object.keys(dependencyMap).forEach(field => {
    var dependency = dependencyMap[field];
    var dependencyStores;
    if (dependency instanceof StoreFacade) {
      dependencyStores = [dependency];
      invariant(
        !componentDependencies.hasOwnProperty(field),
        'StoreDependencyMixin: field "%s" is already defined',
        field
      );
      componentDependencies[field] = {
        deref: defaultDeref,
        stores: dependencyStores,
      };
    } else {
      dependencyStores = dependency.stores;
      componentDependencies[field] = dependency;
    }
    // update the store-to-field map
    dependencyStores.forEach(store => {
      var storeId = store.getID();
      if (!componentStoreFields.hasOwnProperty(storeId)) {
        componentStoreFields[storeId] = [];
        // if we haven't seen this store bind a change handler
        componentStores.push(store);
      }
      componentStoreFields[storeId].push(field);
    });
  });
}
