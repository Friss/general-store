/* @flow */
import type { DependencyMap } from './DependencyMap';
import type { Dispatcher } from 'flux';
import {
  calculateInitial,
  calculateForDispatch,
  calculateForPropsChange,
  calculateForStateChange,
  dependencyPropTypes,
  dependenciesUseState,
  makeDependencyIndex,
} from '../dependencies/DependencyMap';
import { handleDispatch } from './Dispatch';
import * as DispatcherInstance from '../dispatcher/DispatcherInstance';

type ReactMixin = {
  __dispatchToken?: string;
  propTypes?: Object;
  componentWillMount: Function;
  componentWillReceiveProps: Function;
  componentDidUpdate?: Function;
  componentWillUnmount: Function;
}

function onlyStoreStateChanged(dependencies, state, prevState): bool {
  for (const field in state) {
    if (
      !dependencies.hasOwnProperty(field) &&
      state[field] !== prevState[field]
    ) {
      return false;
    }
  }
  return true;
}

export default function StoreDependencyMixin(
  dependencies: DependencyMap,
  dispatcher: ?Dispatcher = DispatcherInstance.get()
): ReactMixin {
  const dependencyIndex = makeDependencyIndex(dependencies);

  const mixin: ReactMixin = {
    getInitialState(): Object {
      return {};
    },

    componentWillMount(): void {
      if (dispatcher) {
        this.__dispatchToken = dispatcher.register(
          handleDispatch.bind(
            null,
            dispatcher,
            dependencyIndex,
            (entry) => {
              this.setState(
                calculateForDispatch(dependencies, entry, this.props, this.state)
              );
            }
          )
        );
      }
      this.setState(
        calculateInitial(dependencies, this.props, this.state)
      );
    },

    componentWillReceiveProps(nextProps): void {
      this.setState(
        calculateForPropsChange(dependencies, nextProps)
      );
    },

    componentWillUnmount(): void {
      if (dispatcher && this.__dispatchToken) {
        dispatcher.unregister(this.__dispatchToken);
      }
    },

  };

  if (dependenciesUseState(dependencies)) {
    mixin.componentDidUpdate = function componentDidUpdate(_, prevState) {
      if (onlyStoreStateChanged(dependencies, this.state, prevState)) {
        return;
      }
      this.setState(
        calculateForStateChange(dependencies, this.props, this.state)
      );
    };
  }

  if (process.env.NODE_ENV !== 'production') {
    mixin.propTypes = dependencyPropTypes(dependencies);
  }

  return mixin;
}
