# GeneralStore (for Flux)

It's descriptive *and* punny!

### TODOs

- [ ] make `StoreListenerMixin` simpler (e.g. lets not have `getStoreState` and the `stores` array)
- [ ] clean up the runtime type checks (easier to read + maintain the same execution flow in the minified build)
- [ ] readme and/or other docs

# Create a store

```javascript
define('UsersStore', [
  'dispatcher',
  'hs-store.js'
], function(
  Dispatcher,
  GeneralStore
) {

  // data is stored privately inside the store module's closure
  var users = {
    123: {
      id: 123,
      name: 'Mary'
    }
  };

  var UsersStore = GeneralStore.define()
    // the stores getter should return the public subset of the store's data
    .defineGet(function() {
      return users;
    })
    // handle actions received from the dispatcher
    .defineResponseTo('ADD_USER', function(user) {
      users[user.id] = user;
    })
    .defineResponseTo('REMOVE_USER', function(user) {
      delete users[user.id];
    })
    // after a store is "registered" it's action handlers are bound
    // to the dispatcher
    .register(dispatcher);

    return UsersStore;
});
```

## React

GeneralStore provides a convenient mixin for binding stores to React components:

```javascript
var UsersComponent = React.createClass({
  mixins: [
    GeneralStore.StoreListenerMixin
  ],

  // the component will re-render each time one of these stores
  // triggers its change listeners
  stores: [
    UsersStore
  ],

  getStoreState: function() {
    return {
      users: UsersStore.get()
    };
  },

  render: function() {
    var users = this.state.users;
    return (
      <ul>
        {Object.keys(users).map(id => <li>{users[id].name}</li>)}
      </ul>
    );
  }
});
```

## Dispatcher Interface

At HubSpot we use the [Facebook Dispatcher](https://github.com/facebook/flux), but any object that conforms to the same interface (i.e. has register and unregister methods) should work just fine.

```javascript
type DispatcherPayload = {
  actionType: string;
  data: any;
};

type Dispatcher = {
  register: (
    handleAction: (payload: DispatcherPayload) => void
  ) => number;
  unregister: (dispatchToken: number) => void;
};
```

## Build and test

**Install Dependencies**

```
npm install
brew install flow
```

**Run the build**
```
# if all tests pass, runs the dev and prod build
npm run build-and-test
# if all tests pass, runs the dev and prod build, commits and changes
npm run deploy
```
