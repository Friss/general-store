jest.dontMock('../StoreDependencyMixinState.js');

describe('StoreDependencyMixinState', () => {

  var Store;

  var dependencies;
  var getDependencyState;

  var mockComponent;
  var mockProps;
  var mockState;
  var mockStore;
  var mockValue;

  beforeEach(() => {
    Store = require('../../store/Store.js');
    getDependencyState =
      require('../StoreDependencyMixinState.js').getDependencyState;

    dependencies = require('../StoreDependencyMixinFields.js').dependencies;

    mockValue = 'test';
    mockProps = {name: 'test'};
    mockState = {random: 'blah'};
    mockComponent = {
      props: mockProps,
      state: mockState,
    };
    mockStore = new Store();
    dependencies(mockComponent).test = {
      stores: [mockStore],
      deref: jest.genMockFn().mockReturnValue(mockValue),
    };
    dependencies(mockComponent).other = {
      stores: [mockStore],
      deref: jest.genMockFn().mockReturnValue('something'),
    };
  });

  it('properly dereferences all dependencies', () => {
    expect(
      getDependencyState(mockComponent, mockProps, mockState, null)
    ).toEqual({
      test: mockValue,
      other: 'something',
    });
    expect(dependencies(mockComponent).test.deref.mock.calls.length).toBe(1);
    expect(
      dependencies(mockComponent).test.deref.mock.calls[0]
    ).toEqual([
      mockProps,
      mockState,
      [mockStore],
    ]);

  });

  it('properly dereferences select fields', () => {
    expect(
      getDependencyState(mockComponent, mockProps, mockState, ['test'])
    ).toEqual({
      test: mockValue,
    });
    expect(
      getDependencyState(mockComponent, mockProps, mockState, ['other'])
    ).toEqual({
      other: 'something',
    });
  });

});
