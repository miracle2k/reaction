# ReAction

The action system from Reflux.JS is amazing. This library contains only it, with the stores ripped out.


## Installation

Currently not on any package manager.


## Creating actions

Create an action by calling `Reaction.createAction` with an optional options object.

```javascript
var statusUpdate = Reaction.createAction(options);
```

An action is a [function object](http://en.wikipedia.org/wiki/Function_object) that can be invoked like any function.

```javascript
statusUpdate(data); // Invokes the action statusUpdate
statusUpdate.triggerAsync(data); // same effect as above
```

If `options.sync` is true, the functor will instead call `action.trigger` which is a synchronous operation. You can change `action.sync` during the lifetime of the action, and the following calls will honour that change.

There is also a convenience function for creating multiple actions.

```javascript
var Actions = Reaction.createActions([
    "statusUpdate",
    "statusEdited",
    "statusAdded"
  ]);

// Actions object now contains the actions
// with the names given in the array above
// that may be invoked as usual

Actions.statusUpdate();
```

#### Asynchronous actions

For actions that represent asynchronous operations (e.g. API calls), a few separate dataflows result from the operation. In the most typical case, we consider completion and failure of the operation. To create related actions for these dataflows, which you can then access as attributes, use `options.children`.

```javascript
// this creates 'load', 'load.completed' and 'load.failed'
var Actions = Reaction.createActions({
    "load": {children: ["completed","failed"]}
});

// when 'load' is triggered, call async operation and trigger related actions
Actions.load.listen( function() {
    // By default, the listener is bound to the action
    // so we can access child actions using 'this'
    someAsyncOperation()
        .then( this.completed )
        .catch( this.failed );
});
```

There is a shorthand to define the `completed` and `failed` actions in the typical case: `options.asyncResult`. The following are equivalent:

```javascript
createAction({
    children: ["progressed","completed","failed"]
});

createAction({
    asyncResult: true,
    children: ["progressed"]
});
```

There are a couple of helper methods available to trigger the `completed` and `failed` actions:

* `promise` - Expects a promise object and binds the triggers of the `completed` and `failed` child actions to that promise, using `then()` and `catch()`.

* `listenAndPromise` - Expects a function that returns a promise object, which is called when the action is triggered, after which `promise` is called with the returned promise object. Essentially calls the function on trigger of the action, which then triggers the `completed` or `failed` child actions after the promise is fulfilled.

Therefore, the following are all equivalent:

```javascript
asyncResultAction.listen( function(arguments) {
    someAsyncOperation(arguments)
        .then(asyncResultAction.completed)
        .catch(asyncResultAction.failed);
});

asyncResultAction.listen( function(arguments) {
    asyncResultAction.promise( someAsyncOperation(arguments) );
});

asyncResultAction.listenAndPromise( someAsyncOperation );
```

##### Asynchronous actions as Promises

Asynchronous actions can be used as promises, which is particularly useful for server-side rendering when you must await the successful (or failed) completion of an action before rendering.

Suppose you had an action + store to make an API request:

```javascript
// Create async action with `completed` & `failed` children
var makeRequest = Reaction.createAction({ asyncResult: true });

makeRequest.listen(function(url) {
    // Assume `request` is some HTTP library (e.g. superagent)
    request(url, function(response) {
        if (response.ok) {
            makeRequest.completed(response.body);
        } else {
            makeRequest.failed(response.error);
        }
    })
});
```

Then, on the server, you could use promises to make the request and either render or serve an error:

```javascript
makeRequest.triggerPromise('/api/something').then(function(body) {
    // Render the response body
}).catch(function(err) {
    // Handle the API error object
});
```

#### Action hooks

There are a couple of hooks available for each action.

* `preEmit` - Is called before the action emits an event. It receives the arguments from the action invocation. If it returns something other than undefined, that will be used as arguments for `shouldEmit` and subsequent emission.

* `shouldEmit` - Is called after `preEmit` and before the action emits an event. By default it returns `true` which will let the action emit the event. You may override this if you need to check the arguments that the action receives and see if it needs to emit the event.

Example usage:

```javascript
Actions.statusUpdate.preEmit = function() { console.log(arguments); };
Actions.statusUpdate.shouldEmit = function(value) {
    return value > 0;
};

Actions.statusUpdate(0);
Actions.statusUpdate(1);
// Should output: 1
```

You can also set the hooks by sending them in a definition object as you create the action:

```javascript
var action = Reaction.createAction({
    preEmit: function(){...},
    shouldEmit: function(){...}
});
```

#### Reaction.ActionMethods

If you would like to have a common set of methods available to all actions you can extend the `Reaction.ActionMethods` object, which is mixed into the actions when they are created.

Example usage:

```javascript
Reaction.ActionMethods.exampleMethod = function() { console.log(arguments); };

Actions.statusUpdate.exampleMethod('arg1');
// Should output: 'arg1'
```

[Back to top](#content)

## Advanced usage

### Switching EventEmitter

Don't like to use the EventEmitter provided? You can switch to another one, such as NodeJS's own like this:

```javascript
// Do this before creating actions or stores

Reflux.setEventEmitter(require('events').EventEmitter);
```

### Switching Promise library

Don't like to use the Promise library provided? You can switch to another one, such as [Bluebird](https://github.com/petkaantonov/bluebird/) like this:

```javascript
// Do this before triggering actions

Reflux.setPromise(require('bluebird'));
```

*Note that promises are constructed with `new Promise(...)`.  If your Promise library uses factories (e.g. `Q`), then use `Reflux.setPromiseFactory` instead.*

### Switching Promise factory

Since most Promise libraries use constructors (e.g. `new Promise(...)`), this is the default behavior.

However, if you use `Q` or another library that uses a factory method, you can use `Reflux.setPromiseFactory` for it.

```javascript
// Do this before triggering actions

Reflux.setPromiseFactory(require('Q').Promise);
```

### Switching nextTick

Whenever action functors are called, they return immediately through the use of `setTimeout` (`nextTick` function) internally.

You may switch out for your favorite `setTimeout`, `nextTick`, `setImmediate`, et al implementation:

```javascript

// node.js env
Reflux.nextTick(process.nextTick);
```

For better alternative to `setTimeout`, you may opt to use the [`setImmediate` polyfill](https://github.com/YuzuJS/setImmediate), [`setImmediate2`](https://github.com/Katochimoto/setImmediate) or [`macrotask`](https://github.com/calvinmetcalf/macrotask).
