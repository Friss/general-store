jest
  .dontMock('../StoreListenerMixin.js')
  .mock('../../store/StoreFacade.js');

describe('StoreListenerMixin', () => {

  var StoreListenerMixin;
  var StoreFacade;

  var mockComponent;
  var mockStore;
  var mockValue;

  function mixin(mockComponent) {
    for(var key in StoreListenerMixin) {
      mockComponent[key] = StoreListenerMixin[key];
    }
    mockComponent.setState = jest.genMockFn();
    return mockComponent;
  }

  beforeEach(() => {
    StoreListenerMixin = require('../StoreListenerMixin.js');
    StoreFacade = require('../../store/StoreFacade.js');

    mockValue = [];
    mockStore = new StoreFacade();
    mockStore.get.mockReturnValue(mockValue);
    mockComponent = mixin({
      getStoreDependencies() {
        return {
          mock: {
            store: mockStore,
            deref: store => store.get()
          }
        };
      }
    });
  });

  it('processes dependencies on mockComponentWillMount', () => {
    mockComponent.componentWillMount();
    expect(typeof mockComponent._storeDependencies).toBe('object');
    expect(Array.isArray(mockComponent._storeDependencyHandlers)).toBe(true);
    expect(mockComponent._storeDependencyHandlers.length).toBe(1);
    expect(mockComponent.setState.mock.calls.length).toBe(1);
  });

  it('removes all event handlers on componentWillUnmount', () => {
    var EventHandler = require('../../event/EventHandler.js');
    var mockHandler = new EventHandler();
    mockStore.addOnChange.mockReturnValue(mockHandler);
    mockComponent.componentWillMount();
    mockComponent.componentWillUnmount();
    expect(mockHandler.remove.mock.calls.length).toBe(1);
  });

});
