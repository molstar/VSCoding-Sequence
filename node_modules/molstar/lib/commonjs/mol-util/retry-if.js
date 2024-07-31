"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryIf = retryIf;
async function retryIf(promiseProvider, params) {
    var _a;
    let count = 0;
    while (count <= params.retryCount) {
        try {
            if (count > 0)
                (_a = params.onRetry) === null || _a === void 0 ? void 0 : _a.call(params);
            const result = await promiseProvider();
            if (params.retryThenIf && params.retryThenIf(result)) {
                count++;
                continue;
            }
            return result;
        }
        catch (e) {
            if (!params.retryCatchIf || params.retryCatchIf(e)) {
                count++;
                continue;
            }
            throw e;
        }
    }
    throw new Error('Maximum retry count exceeded.');
}
