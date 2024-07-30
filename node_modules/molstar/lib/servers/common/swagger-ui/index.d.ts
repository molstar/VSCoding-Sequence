/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as express from 'express';
import { ServeStaticOptions } from 'serve-static';
import { Handler } from 'express-serve-static-core';
export declare function swaggerUiAssetsHandler(options?: ServeStaticOptions): Handler;
export interface SwaggerUIOptions {
    openapiJsonUrl: string;
    apiPrefix: string;
    title: string;
    shortcutIconLink: string;
}
export declare function swaggerUiIndexHandler(options: SwaggerUIOptions): express.Handler;
