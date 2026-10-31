/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Response } from 'node-fetch';
export declare function fetchRetry(url: string, timeout: number, retryCount: number, onRetry?: () => void): Promise<Response>;
