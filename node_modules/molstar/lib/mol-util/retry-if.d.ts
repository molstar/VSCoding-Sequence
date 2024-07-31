/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare function retryIf<T>(promiseProvider: () => Promise<T>, params: {
    retryThenIf?: (result: T) => boolean;
    retryCatchIf?: (error: any) => boolean;
    onRetry?: () => void;
    retryCount: number;
}): Promise<T>;
