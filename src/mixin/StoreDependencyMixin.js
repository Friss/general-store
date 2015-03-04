/**
 * @flow
 */

var StoreFacade = require('../store/StoreFacade.js');

var {dependencies, stores} = require('./StoreDependencyMixinFields.js');
var {cleanupHandlers, setupHandlers} = require('./StoreDependencyMixinHandlers.js');
var {applyDependencies} = require('./StoreDependencyMixinInitialize.js');
var {getDependencyState} = require('./StoreDependencyMixinState.js');
var {hasPropsChanged, hasStateChanged, mergeState} = require('./StoreDependencyMixinTransitions.js');

function StoreDependencyMixin(
  dependencyMap: Object
): Object {
  var fieldNames = Object.keys(dependencyMap);
  var isFirstMixin = false;

  return {
    componentWillMount(): void {
      if (!isFirstMixin) {
        return;
      }
      setupHandlers(this);
    },

    componentWillReceiveProps(nextProps): void {
      if (!isFirstMixin || !hasPropsChanged(this.props, nextProps)) {
        return;
      }
      this.setState(
        getDependencyState(this, nextProps, this.state, null)
      );
    },

    componentWillUnmount(): void {
      if (!isFirstMixin) {
        return;
      }
      cleanupHandlers(this);
    },

    componentDidUpdate(oldProps, oldState): void {
      if (
        !isFirstMixin ||
        !hasStateChanged(dependencies(this), oldState, this.state)
      ) {
        return;
      }
      this.setState(
        getDependencyState(this, this.props, this.state, null)
      );
    },

    getInitialState(): Object {
      isFirstMixin = !stores(this).length;
      applyDependencies(this, dependencyMap);
      return getDependencyState(
        this,
        this.props,
        this.state,
        Object.keys(dependencyMap)
      );
    }
  };

}

module.exports = StoreDependencyMixin;
