/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as express from 'express';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import { interpolate } from '../../../mol-util/string';
import { indexTemplate } from './indexTemplate';
export function swaggerUiAssetsHandler(options) {
    const opts = options || {};
    opts.index = false;
    return express.static(getAbsoluteFSPath(), opts);
}
function createHTML(options) {
    return interpolate(indexTemplate, options);
}
export function swaggerUiIndexHandler(options) {
    const html = createHTML(options);
    return (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    };
}
