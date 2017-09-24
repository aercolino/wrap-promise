# Wrap Promise [![Build Status](https://travis-ci.org/aercolino/wrap-promise.svg?branch=master)](https://travis-ci.org/aercolino/wrap-promise) [![Coverage Status](https://coveralls.io/repos/github/aercolino/wrap-promise/badge.svg?branch=master)](https://coveralls.io/github/aercolino/wrap-promise?branch=master)


Wrap a promise within before and after callbacks.




## Installation

```bash
$ npm install wrap-promise
```




## Usage

```js
const { $wrapPromise } = require('wrap-promise');

const regular = $wrapPromise($promise, before, after);

const special = $wrapPromise($promise, before, afterFulfillment, afterRejection);
```

+ `$promise` and `before` are called with no arguments.

+ In the **regular** case:

    + `after` is called with the fulfillment `{ value }` or the rejection `{ reason }`.
    
    + no matter whether executing the fulfillment line or the rejection line, `after` is called in both cases, without changing line, without changing the fulfillment value nor the rejection reason. (i.e. `after` return value is discarded)

+ In the **special** case:

    + `afterFulfillment` is called with the fulfillment `{ value }`.
    
    + `afterRejection` is called with the rejection `{ reason }`.
    
    + `afterFulfillment` is called only if executing the fulfillment line, without changing line, without changing the fulfillment value.
    
    + `afterRejection` is called only if executing the rejection line, *by default* changing to the fulfillment line (i.e. swallowing the rejection) and making `afterRejection` return value the new fullfilment value.
    
        If you prefer to stay on the rejection line, just `throw` from inside `afterRejection`, as usual.


### Example

```js
// test.js
require('console.mute');
const { $wrapPromise } = require('wrap-promise');

function muted($fn, ...args) {
    return $wrapPromise(
        () => $fn(...args),
        () => {
            console.mute();
        },
        () => {
            console.resume();
        },
    );
}

...
it('should be quiet when calling this'
    ...
it('should quietly run that noisy function too', function() {
    return muted(noisy, 'bye bye', 'clutter')
        .then(() => {
            expect(that).to.have.been.called;
        });
});
it('should be quiet when calling that'
    ...
...
```
```
// console
$ npm test

    ...
    ✓ should be quiet when calling this
    ✓ should quietly run that noisy function too
    ✓ should be quiet when calling that
    ...

5 passing (64ms)
```




## Tests

```
$ npm test
```
