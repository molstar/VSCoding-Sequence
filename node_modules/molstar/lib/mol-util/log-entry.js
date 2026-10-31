/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export { LogEntry };
var LogEntry;
(function (LogEntry) {
    function message(msg) { return { type: 'message', timestamp: new Date(), message: msg }; }
    LogEntry.message = message;
    function error(msg) { return { type: 'error', timestamp: new Date(), message: msg }; }
    LogEntry.error = error;
    function warning(msg) { return { type: 'warning', timestamp: new Date(), message: msg }; }
    LogEntry.warning = warning;
    function info(msg) { return { type: 'info', timestamp: new Date(), message: msg }; }
    LogEntry.info = info;
})(LogEntry || (LogEntry = {}));
