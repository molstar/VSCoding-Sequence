"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
function createImmediateActions() {
    const thisGlobal = (function () {
        const _window = typeof window !== 'undefined' && window;
        const _self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope && self;
        const _global = typeof global !== 'undefined' && global;
        return _window || _global || _self;
    })();
    const tasksByHandle = {};
    const doc = typeof document !== 'undefined' ? document : void 0;
    let nextHandle = 1; // Spec says greater than zero
    let registerImmediate;
    function setImmediate(callback, ...args) {
        // Callback can either be a function or a string
        if (typeof callback !== 'function') {
            callback = new Function('' + callback);
        }
        // Store and register the task
        const task = { callback: callback, args: args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
    }
    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }
    function run(task) {
        const callback = task.callback;
        const args = task.args;
        switch (args.length) {
            case 0:
                callback();
                break;
            case 1:
                callback(args[0]);
                break;
            case 2:
                callback(args[0], args[1]);
                break;
            case 3:
                callback(args[0], args[1], args[2]);
                break;
            default:
                callback.apply(undefined, args);
                break;
        }
    }
    function runIfPresent(handle) {
        const task = tasksByHandle[handle];
        clearImmediate(handle);
        run(task);
    }
    function installNextTickImplementation() {
        registerImmediate = function (handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }
    function canUsePostMessage() {
        if (thisGlobal && thisGlobal.postMessage && !thisGlobal.importScripts) {
            let postMessageIsAsynchronous = true;
            const oldOnMessage = thisGlobal.onmessage;
            thisGlobal.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            thisGlobal.postMessage('', '*');
            thisGlobal.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }
    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
        const messagePrefix = 'setImmediate$' + Math.random() + '$';
        const onGlobalMessage = function (event) {
            if (event.source === thisGlobal &&
                typeof event.data === 'string' &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };
        if (window.addEventListener) {
            window.addEventListener('message', onGlobalMessage, false);
        }
        else {
            window.attachEvent('onmessage', onGlobalMessage);
        }
        registerImmediate = function (handle) {
            window.postMessage(messagePrefix + handle, '*');
        };
    }
    function installMessageChannelImplementation() {
        const channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            const handle = event.data;
            runIfPresent(handle);
        };
        registerImmediate = function (handle) {
            channel.port2.postMessage(handle);
        };
    }
    function installReadyStateChangeImplementation() {
        const html = doc.documentElement;
        registerImmediate = function (handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            let script = doc.createElement('script');
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }
    function installSetTimeoutImplementation() {
        registerImmediate = function (handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }
    // Don't get fooled by e.g. browserify environments.
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        // For Node.js before 0.9
        installNextTickImplementation();
    }
    else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();
    }
    else if (typeof MessageChannel !== 'undefined') {
        // For web workers, where supported
        installMessageChannelImplementation();
    }
    else if (doc && 'onreadystatechange' in doc.createElement('script')) {
        // For IE 6–8
        installReadyStateChangeImplementation();
    }
    else {
        // For older browsers
        installSetTimeoutImplementation();
    }
    return {
        setImmediate,
        clearImmediate
    };
}
const immediateActions = (function () {
    if (typeof setImmediate !== 'undefined') {
        if (typeof window !== 'undefined') {
            return {
                setImmediate: (handler, ...args) => window.setImmediate(handler, ...args),
                clearImmediate: (handle) => window.clearImmediate(handle)
            };
        }
        else {
            return { setImmediate, clearImmediate };
        }
    }
    return createImmediateActions();
}());
function resolveImmediate(res) {
    immediateActions.setImmediate(res);
}
const Scheduler = {
    setImmediate: immediateActions.setImmediate,
    clearImmediate: immediateActions.clearImmediate,
    immediatePromise() { return new Promise(resolveImmediate); },
    delay(timeout, value = void 0) { return new Promise(r => setTimeout(r, timeout, value)); }
};
exports.Scheduler = Scheduler;
