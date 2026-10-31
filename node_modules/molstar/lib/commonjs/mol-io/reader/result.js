"use strict";
/*
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReaderResult = void 0;
var ReaderResult;
(function (ReaderResult) {
    function error(message, line = -1) {
        return new Error(message, line);
    }
    ReaderResult.error = error;
    function success(result, warnings = []) {
        return new Success(result, warnings);
    }
    ReaderResult.success = success;
    class Error {
        toString() {
            if (this.line >= 0) {
                return `[Line ${this.line}] ${this.message}`;
            }
            return this.message;
        }
        constructor(message, line) {
            this.message = message;
            this.line = line;
            this.isError = true;
        }
    }
    ReaderResult.Error = Error;
    class Success {
        constructor(result, warnings) {
            this.result = result;
            this.warnings = warnings;
            this.isError = false;
        }
    }
    ReaderResult.Success = Success;
})(ReaderResult || (exports.ReaderResult = ReaderResult = {}));
