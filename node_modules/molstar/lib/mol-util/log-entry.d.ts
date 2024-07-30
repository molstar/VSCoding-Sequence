/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export { LogEntry };
interface LogEntry {
    type: LogEntry.Type;
    timestamp: Date;
    message: string;
}
declare namespace LogEntry {
    type Type = 'message' | 'error' | 'warning' | 'info';
    function message(msg: string): LogEntry;
    function error(msg: string): LogEntry;
    function warning(msg: string): LogEntry;
    function info(msg: string): LogEntry;
}
