
module.exports = {
    /**
     * Wrap a promise within before and after callbacks.
     *
     * @param p
     * @param before
     * @param afterResolve
     * @param afterReject
     * @returns Promise
     */
    $wrapPromise(p, before, afterResolve, afterReject) {
        validateCallbacks(before, afterResolve, afterReject);

        before();
        return getPromise(p)
            .then((value) => {
                afterResolve({ value });
                return value;
            })
            .catch((reason) => {
                if (typeof afterReject === 'function') {
                    return afterReject({ reason });
                }
                afterResolve({ reason });
                throw reason;
            });
    },
};

// ---

function validateCallbacks(before, afterResolve, afterReject) {
    if (typeof before !== 'function') {
        throw new Error('Expected a callback (before)');
    }
    if (typeof afterResolve !== 'function') {
        throw new Error('Expected a callback (afterResolve)');
    }
    if (typeof afterReject !== 'function' && typeof afterReject !== 'undefined') {
        throw new Error('Expected a callback or nothing (afterReject)');
    }    
}

function isThenable(p) {
    if (typeof p !== 'object') {
        return false;
    }
    if (typeof p.then !== 'function') {
        return false;
    }
    return true;
}

function getPromise(p) {
    // p must be a function
    if (typeof p !== 'function') {
        throw new Error('Expected a function returning a thenable object (promise)');
    }
    // p() must be a thenable object (promise)
    const promise = p();
    if (!isThenable(promise)) {
        throw new Error('Expected a function returning a thenable object (promise)');        
    }
    return promise;
}
