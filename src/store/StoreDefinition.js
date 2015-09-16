/* @flow */

import invariant from '../invariant.js';
import StoreFacade from './StoreFacade.js';
import StoreFactory from './StoreFactory';

var HINT_LINK =
  'Learn more about defining stores:' +
  ' https://github.com/HubSpot/general-store#create-a-store';

function dropFirstArg(func) {
  return function(head, ...tail) {
    func(...tail);
  };
}

export default class StoreDefinition {

  _facade: ?StoreFacade;
  _factory: StoreFactory;
  _getter: ?Function;

  constructor() {
    this._facade = null;
    this._factory = new StoreFactory({
      getter: (state, ...args) => {
        if (typeof this._getter === 'function') {
          return this._getter(...args);
        }
      },
    });
    this._getter = null;
  }

  defineGet(
    getter: () => any
  ): StoreDefinition {
    invariant(
      !this.isRegistered(),
      'StoreDefinition.defineGet: this store definition cannot be modified' +
      ' because is has already been registered with a dispatcher. %s',
      HINT_LINK
    );
    invariant(
      typeof getter === 'function',
      'StoreDefinition.defineGet: expected getter to be a function but got' +
      ' "%s" instead. %s',
      getter,
      HINT_LINK
    );
    this._getter = getter;
    return this;
  }

  defineResponses(responses: Object): StoreDefinition {
    this._factory = this._factory.defineResponses(responses);
    return this;
  }

  defineResponseTo(
    actionTypes: Array<string> | string,
    response: (data: any) => void
  ): StoreDefinition {
    invariant(
      !this.isRegistered(),
      'StoreDefinition.defineResponseTo: this store definition cannot be' +
      ' modified because is has already been registered with a dispatcher. %s',
      HINT_LINK
    );
    this._factory = this._factory.defineResponseTo(actionTypes, response);
    return this;
  }

  isRegistered(): bool {
    return this._facade instanceof StoreFacade;
  }

  register(dispatcher: ?Dispatcher): StoreFacade {
    invariant(
      typeof this._getter === 'function',
      'StoreDefinition.register: a store cannot be registered without a' +
      ' getter. Use GeneralStore.define().defineGet(getter) to define a' +
      ' getter. %s',
      HINT_LINK
    );
    if (!this._facade) {
      this._facade = this._factory.register(dispatcher);
    }
    return this._facade;
  }
}
