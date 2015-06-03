var Reflux = require('../src');

// Creating an Action
var textUpdate = Reflux.createAction();
var statusUpdate = Reflux.createAction();

// Invoking the action with arbitrary parameters
statusUpdate(true);
textUpdate("testing", 1337, { "test": 1337 });
statusUpdate(false);

/** Will output the following:
 *
 * status:  ONLINE
 * text:  testing
 * text:  1337
 * text:  { test: 1337 }
 * story:  Once upon a time the user did the following: testing, 1337, [object Object]
 * status:  OFFLINE
 */