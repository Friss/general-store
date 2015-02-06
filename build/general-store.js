!function(e) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
    var f;
    "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), 
    f.GeneralStore = e();
  }
}(function() {
  var define, module, exports;
  return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  }({
    1: [ function(_dereq_, module, exports) {
      /* @flow */
      var StoreDefinition = _dereq_("./store/StoreDefinition.js");
      var GeneralStore = {
        define: function() {
          return new StoreDefinition();
        },
        DispatcherInstance: _dereq_("./dispatcher/DispatcherInstance.js"),
        StoreDependencyMixin: _dereq_("./mixin/StoreDependencyMixin.js")
      };
      module.exports = GeneralStore;
    }, {
      "./dispatcher/DispatcherInstance.js": 2,
      "./mixin/StoreDependencyMixin.js": 7,
      "./store/StoreDefinition.js": 9
    } ],
    2: [ function(_dereq_, module, exports) {
      /**
 * I'm not sure if it's possible to express the runtime enforcement
 * of a dispatcher instance, so I'll use weak mode for now.
 * @flow weak
 **/
      var Hints = _dereq_("../hints/Hints.js");
      var invariant = _dereq_("../invariant.js");
      var instance = null;
      var DispatcherInstance = {
        get: function() {
          if ("development" !== "production") {
            invariant(instance !== null, "DispatcherInstance.get: you haven't provide a dispatcher instance." + " You can pass an instance to GeneralStore.define().register(dispatcher) " + " or use GeneralStore.DispatcherInstance.set(dispatcher) to set a global instance." + " https://github.com/HubSpot/general-store#default-dispatcher-instance");
          }
          return instance;
        },
        set: function(dispatcher) {
          if ("development" !== "production") {
            Hints.enforceDispatcherInterface("DispatcherInstance.set", dispatcher);
          }
          instance = dispatcher;
        }
      };
      module.exports = DispatcherInstance;
    }, {
      "../hints/Hints.js": 5,
      "../invariant.js": 6
    } ],
    3: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var EventHandler = _dereq_("./EventHandler.js");
      var uniqueID = _dereq_("../uniqueid/uniqueID.js");
      function Event() {
        "use strict";
        this.$Event_handlers = {};
      }
      /**
   * Add a subscription to this event
   *
   * @param  callback  run when the event is triggered.
   * @return this
   */
      Event.prototype.addHandler = function(callback) {
        "use strict";
        var key = uniqueID();
        this.$Event_handlers[key] = callback;
        return new EventHandler(this, key);
      };
      /**
   * Destroys this event. Removes all handlers.
   *
   * @return this
   */
      Event.prototype.remove = function() {
        "use strict";
        this.$Event_handlers = {};
        return this;
      };
      /**
   * Removes a subscription by key.
   *
   * @param  key   id of the subscription to remove
   * @return this
   */
      Event.prototype.removeHandler = function(key) {
        "use strict";
        delete this.$Event_handlers[key];
        return this;
      };
      /**
   * @protected
   * Run a handler by key if it exists
   *
   * @param  key  id of the handler to run
   */
      Event.prototype.$Event_runHandler = function(key) {
        "use strict";
        if (this.$Event_handlers.hasOwnProperty(key)) {
          this.$Event_handlers[key].call();
        }
      };
      /**
   * Run all subscribed handlers.
   *
   * @return this
   */
      Event.prototype.runHandlers = function() {
        "use strict";
        Object.keys(this.$Event_handlers).forEach(this.$Event_runHandler.bind(this));
        return this;
      };
      /**
 * Convenience method for running multiple events.
 *
 * @param  events  a list of events to run.
 */
      Event.runMultiple = function(events) {
        events.forEach(function(evt) {
          return evt.runHandlers();
        });
      };
      module.exports = Event;
    }, {
      "../uniqueid/uniqueID.js": 12,
      "./EventHandler.js": 4
    } ],
    4: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      function EventHandler(instance, key) {
        "use strict";
        this.$EventHandler_key = key;
        this.$EventHandler_instance = instance;
      }
      EventHandler.prototype.remove = function() {
        "use strict";
        if (this.$EventHandler_instance === null || this.$EventHandler_instance === undefined) {
          return;
        }
        this.$EventHandler_instance.removeHandler(this.$EventHandler_key);
        this.$EventHandler_instance = null;
      };
      module.exports = EventHandler;
    }, {} ],
    5: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var invariant = _dereq_("../invariant.js");
      var DISPATCHER_HINT_LINK = "Learn more about the dispatcher interface:" + " https://github.com/HubSpot/general-store#dispatcher-interface";
      if ("development" !== "production") {}
      var Hints = {
        enforceDispatcherInterface: function(scope, dispatcher) {
          invariant(typeof dispatcher === "object" && typeof dispatcher.register === "function" && typeof dispatcher.unregister === "function", "%s: Expected dispatcher to be an object with a register method," + ' and an unregister method but got "%s". %s', scope, dispatcher, DISPATCHER_HINT_LINK);
        },
        enforceDispatcherPayloadInterface: function(payload) {
          invariant(typeof payload === "object" && typeof payload.actionType === "string" && payload.hasOwnProperty("data"), "Dispatcher.dispatch: expected payload to be an object with a property" + ' "actionType" containing a string and a property "data" containing any value' + ' but got "%s" instead. %s', payload, DISPATCHER_HINT_LINK);
        }
      };
      module.exports = Hints;
    }, {
      "../invariant.js": 6
    } ],
    6: [ function(_dereq_, module, exports) {
      /**
 * BSD License
 *
 * For Flux software
 *
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @flow
 */
      "use strict";
      /**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */
      var invariant = function(condition, format, a, b, c, d, e, f) {
        if ("development" !== "production") {
          if (format === undefined) {
            throw new Error("invariant requires an error message argument");
          }
        }
        if (!condition) {
          var error;
          if (format === undefined) {
            error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");
          } else {
            var args = [ a, b, c, d, e, f ];
            var argIndex = 0;
            error = new Error("Invariant Violation: " + format.replace(/%s/g, function() {
              return args[argIndex++];
            }));
          }
          throw error;
        }
      };
      module.exports = invariant;
    }, {} ],
    7: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var EventHandler = _dereq_("../event/EventHandler.js");
      var StoreDependencyDefinition = _dereq_("../store/StoreDependencyDefinition.js");
      var StoreFacade = _dereq_("../store/StoreFacade.js");
      function havePropsChanged(oldProps, nextProps) {
        return Object.keys(nextProps).some(function(key) {
          return oldProps[key] !== nextProps[key];
        });
      }
      function hasStateChanged(stores, oldState, nextState) {
        return Object.keys(nextState).some(function(key) {
          return !stores.hasOwnProperty(key) && oldState[key] !== nextState[key];
        });
      }
      function storeChangeCallback(component, dependencies, key) {
        component.setState(dependencies.getStateField(key, component.props, component.state || {}));
      }
      function StoreDependencyMixin(dependencyMap) {
        var dependencies = new StoreDependencyDefinition(dependencyMap);
        var hasCustomDerefs = Object.keys(dependencyMap).some(function(key) {
          return dependencyMap[key].deref;
        });
        return {
          componentWillMount: function() {
            var i;
            var key;
            var store;
            var storeMap = dependencies.getStores();
            var stores;
            this._storeDependencyHandlers = [];
            for (key in storeMap) {
              stores = storeMap[key];
              for (i = 0; i < stores.length; i++) {
                this._storeDependencyHandlers.push(stores[i].addOnChange(storeChangeCallback.bind(null, this, dependencies, key)));
              }
            }
          },
          componentWillUnmount: function() {
            var handlers = this._storeDependencyHandlers;
            while (handlers.length) {
              handlers.pop().remove();
            }
          },
          componentWillUpdate: function(nextProps, nextState) {
            if (!hasCustomDerefs) {
              return;
            }
            if (!havePropsChanged(this.props, nextProps) && !hasStateChanged(dependencies.getStores(), this.state, nextState)) {
              return;
            }
            this.setState(dependencies.getState(nextProps, nextState || {}));
          },
          getInitialState: function() {
            return dependencies.getState(this.props, this.state || {});
          }
        };
      }
      module.exports = StoreDependencyMixin;
    }, {
      "../event/EventHandler.js": 4,
      "../store/StoreDependencyDefinition.js": 10,
      "../store/StoreFacade.js": 11
    } ],
    8: [ function(_dereq_, module, exports) {
      /* @flow */
      var StoreConstants = {
        DEFAULT_GETTER_KEY: "DEFAULT_GETTER_KEY"
      };
      module.exports = StoreConstants;
    }, {} ],
    9: [ function(_dereq_, module, exports) {
      /* @flow */
      var DispatcherInstance = _dereq_("../dispatcher/DispatcherInstance.js");
      var StoreConstants = _dereq_("./StoreConstants.js");
      var StoreFacade = _dereq_("./StoreFacade.js");
      var $__0 = _dereq_("../hints/Hints.js"), enforceDispatcherInterface = $__0.enforceDispatcherInterface;
      var invariant = _dereq_("../invariant.js");
      function emptyGetter() {
        return null;
      }
      var HINT_LINK = "Learn more about defining stores:" + " https://github.com/HubSpot/general-store#create-a-store";
      function enforceIsUnregistered(scope, facade) {
        invariant(!(facade instanceof StoreFacade), "%s: this store definition cannot be modified because is has already been" + " registered with a dispatcher. %s", scope, HINT_LINK);
      }
      function StoreDefinition() {
        "use strict";
        this.$StoreDefinition_facade = null;
        this.$StoreDefinition_getter = null;
        this.$StoreDefinition_responses = {};
      }
      StoreDefinition.prototype.defineGet = function(getter) {
        "use strict";
        if ("development" !== "production") {
          enforceIsUnregistered("StoreDefinition.defineGet", this.$StoreDefinition_facade);
          invariant(typeof getter === "function", 'StoreDefinition.defineGet: expected getter to be a function but got "%s" instead. %s' + getter, HINT_LINK);
        }
        this.$StoreDefinition_getter = getter;
        return this;
      };
      StoreDefinition.prototype.defineResponseTo = function(actionType, response) {
        "use strict";
        if ("development" !== "production") {
          enforceIsUnregistered("StoreDefinition.defineResponseTo", this.$StoreDefinition_facade);
          invariant(typeof actionType === "string", "StoreDefinition.defineResponseTo: expected actionType to be a string" + ' but got "%s" instead. %s', actionType, HINT_LINK);
          invariant(!this.$StoreDefinition_responses.hasOwnProperty(actionType), 'StoreDefinition.defineResponseTo: conflicting resposes for actionType "%s".' + " Only one response can be defined per actionType per Store. %s", actionType, HINT_LINK);
          invariant(typeof response === "function", "StoreDefinition.defineResponseTo: expected response to be a function" + ' but got "%s" instead. %s', response);
        }
        this.$StoreDefinition_responses[actionType] = response;
        return this;
      };
      StoreDefinition.prototype.register = function(dispatcher) {
        "use strict";
        if ("development" !== "production") {
          invariant(typeof this.$StoreDefinition_getter === "function", "StoreDefinition.register: a store cannot be registered without a getter." + " Use GeneralStore.define().defineGet(getter) to define a getter. %s", HINT_LINK);
          if (dispatcher) {
            enforceDispatcherInterface("StoreDefinition.register", dispatcher);
          }
        }
        var facade = this.$StoreDefinition_facade || new StoreFacade(this.$StoreDefinition_getter || emptyGetter, this.$StoreDefinition_responses, dispatcher || DispatcherInstance.get());
        if (this.$StoreDefinition_facade === null) {
          this.$StoreDefinition_facade = facade;
        }
        return facade;
      };
      module.exports = StoreDefinition;
    }, {
      "../dispatcher/DispatcherInstance.js": 2,
      "../hints/Hints.js": 5,
      "../invariant.js": 6,
      "./StoreConstants.js": 8,
      "./StoreFacade.js": 11
    } ],
    10: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var StoreFacade = _dereq_("./StoreFacade.js");
      function defaultDeref(_, _, stores) {
        return stores[0].get();
      }
      function extractDeref(dependencies, key) {
        var dependency = dependencies[key];
        if (dependency instanceof StoreFacade) {
          return defaultDeref;
        }
        if ("development" !== "production") {
          if (typeof dependency.deref !== "function") {
            throw new Error("StoreDependencyDefinition: you must specify a deref" + ' function for "' + key + '"');
          }
        }
        return dependency.deref;
      }
      function extractStores(dependencies, key) {
        var dependency = dependencies[key];
        if (dependency instanceof StoreFacade) {
          return [ dependency ];
        }
        if ("development" !== "production") {
          if (!Array.isArray(dependency.stores) || !dependency.stores.length) {
            throw new Error("StoreDependencyDefinition: you must specify a stores" + ' array with at least one store for "' + key + '"');
          }
        }
        return dependency.stores;
      }
      function StoreDependencyDefinition(dependencyMap) {
        "use strict";
        this.$StoreDependencyDefinition_derefs = {};
        this.$StoreDependencyDefinition_stores = {};
        var dependency;
        for (var key in dependencyMap) {
          dependency = dependencyMap[key];
          this.$StoreDependencyDefinition_derefs[key] = extractDeref(dependencyMap, key);
          this.$StoreDependencyDefinition_stores[key] = extractStores(dependencyMap, key);
        }
      }
      StoreDependencyDefinition.prototype.$StoreDependencyDefinition_derefStore = function(key, props, state) {
        "use strict";
        return this.$StoreDependencyDefinition_derefs[key](props, state, this.$StoreDependencyDefinition_stores[key]);
      };
      StoreDependencyDefinition.prototype.getState = function(props, state) {
        "use strict";
        var updates = {};
        for (var key in this.$StoreDependencyDefinition_stores) {
          updates[key] = this.$StoreDependencyDefinition_derefStore(key, props, state);
        }
        return updates;
      };
      StoreDependencyDefinition.prototype.getStateField = function(key, props, state) {
        "use strict";
        var update = {};
        update[key] = this.$StoreDependencyDefinition_derefStore(key, props, state);
        return update;
      };
      StoreDependencyDefinition.prototype.getStores = function() {
        "use strict";
        return this.$StoreDependencyDefinition_stores;
      };
      module.exports = StoreDependencyDefinition;
    }, {
      "./StoreFacade.js": 11
    } ],
    11: [ function(_dereq_, module, exports) {
      /* @flow */
      var Event = _dereq_("../event/Event.js");
      var EventHandler = _dereq_("../event/EventHandler.js");
      var Hints = _dereq_("../hints/Hints.js");
      var StoreConstants = _dereq_("./StoreConstants.js");
      var invariant = _dereq_("../invariant.js");
      var HINT_LINK = "Learn more about using the Store API:" + " https://github.com/HubSpot/general-store#using-the-store-api";
      function getNull() {
        return null;
      }
      function StoreFacade(getter, responses, dispatcher) {
        "use strict";
        this.$StoreFacade_dispatcher = dispatcher;
        this.$StoreFacade_getter = getter;
        this.$StoreFacade_responses = responses;
        this.$StoreFacade_event = new Event();
        this.$StoreFacade_dispatchToken = this.$StoreFacade_dispatcher.register(this.$StoreFacade_handleDispatch.bind(this));
      }
      /**
   * Subscribe to changes on this store.
   *
   * @param  callback  will run every time the store responds to a dispatcher
   * @return this
   */
      StoreFacade.prototype.addOnChange = function(callback) {
        "use strict";
        if ("development" !== "production") {
          invariant(typeof callback === "function", "StoreFacade.addOnChange: expected callback to be a function" + ' but got "%s" instead. %s', callback, HINT_LINK);
        }
        return this.$StoreFacade_event.addHandler(callback);
      };
      /**
   * Returns the store's referenced value
   *
   * @param  ...  accepts any number of params
   * @return any
   */
      StoreFacade.prototype.get = function() {
        "use strict";
        for (var args = [], $__0 = 0, $__1 = arguments.length; $__0 < $__1; $__0++) args.push(arguments[$__0]);
        return this.$StoreFacade_getter.apply(null, args);
      };
      /**
   * Exposes the store's dispatcher instance.
   *
   * @return Dispatcher
   */
      StoreFacade.prototype.getDispatcher = function() {
        "use strict";
        return this.$StoreFacade_dispatcher;
      };
      /**
   * Exposes the token assigned to the store by the dispatcher
   *
   * @return number
   */
      StoreFacade.prototype.getDispatchToken = function() {
        "use strict";
        return this.$StoreFacade_dispatchToken;
      };
      /**
   * @protected
   * Responds to incoming messages from the Dispatcher
   */
      StoreFacade.prototype.$StoreFacade_handleDispatch = function(payload) {
        "use strict";
        if ("development" !== "production") {
          Hints.enforceDispatcherPayloadInterface(payload);
        }
        if (!this.$StoreFacade_responses.hasOwnProperty(payload.actionType)) {
          return;
        }
        this.$StoreFacade_responses[payload.actionType](payload.data, payload.actionType);
        this.triggerChange();
      };
      /**
   * Destroys this instance of the store.
   * Dispatch callback is unregistered. Subscriptions are removed.
   */
      StoreFacade.prototype.remove = function() {
        "use strict";
        this.$StoreFacade_dispatcher.unregister(this.getDispatchToken());
        this.$StoreFacade_event.remove();
        this.$StoreFacade_getter = getNull;
        this.$StoreFacade_responses = {};
      };
      /**
   * Runs all of the store's subscription callbacks
   *
   * @return this
   */
      StoreFacade.prototype.triggerChange = function() {
        "use strict";
        this.$StoreFacade_event.runHandlers();
        return this;
      };
      module.exports = StoreFacade;
    }, {
      "../event/Event.js": 3,
      "../event/EventHandler.js": 4,
      "../hints/Hints.js": 5,
      "../invariant.js": 6,
      "./StoreConstants.js": 8
    } ],
    12: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var nextUid = 0;
      function uid() {
        return nextUid++;
      }
      module.exports = uid;
    }, {} ]
  }, {}, [ 1 ])(1);
});