# HubSpot Store

```javascript
define('AwesomeStore', [
  'dispatcher',
  'hs-store.js'
], function(
  Dispatcher,
  HSStore
) {

  // data is stored privately inside the store module's closure
  var awesomeStoreData = {
    everythingIsAwesome: true
  };

  var AwesomeStore = HSStore.define()
    // the stores getter should return the public subset of the store's data
    .defineGet(function() {
      return awesomeStoreData;
    })
    // handle actions received from the dispatcher
    .defineResponseTo('SOMETHING_BAD_HAPPENED', function() {
      awesomeStoreData.everythingIsAwesome = false;
    })
    .defineResponseTo('SOMETHING_GREAT_HAPPENED', function() {
      awesomeStoreData.everythingIsAwesome = true;
    })
    // after a store is "registered" it's action handlers are bound
    // to the dispatcher
    .register();

});
```

## Dispatcher Interface

At HubSpot we use the [Facebook Dispatcher](https://github.com/facebook/flux), but any object that conforms to the following interface should work just fine.

```
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
