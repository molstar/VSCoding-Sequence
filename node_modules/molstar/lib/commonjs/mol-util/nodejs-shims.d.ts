/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author Russell Parker <russell@benchling.com>
 *
 * Implements some browser-only global variables for Node.js environment.
 * These workarounds will also work in browsers as usual.
 */
/** Determines whether the current code is running in Node.js */
export declare const RUNNING_IN_NODEJS: boolean;
/** Like `XMLHttpRequest` but works also in Node.js */
export declare const XMLHttpRequest_: {
    new (): XMLHttpRequest;
    prototype: XMLHttpRequest;
    readonly UNSENT: 0;
    readonly OPENED: 1;
    readonly HEADERS_RECEIVED: 2;
    readonly LOADING: 3;
    readonly DONE: 4;
};
/** Like `File` but works also in Node.js */
export declare const File_: {
    new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
    prototype: File;
};
