"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiAssetsHandler = swaggerUiAssetsHandler;
exports.swaggerUiIndexHandler = swaggerUiIndexHandler;
const tslib_1 = require("tslib");
const express = tslib_1.__importStar(require("express"));
const swagger_ui_dist_1 = require("swagger-ui-dist");
const string_1 = require("../../../mol-util/string");
const indexTemplate_1 = require("./indexTemplate");
function swaggerUiAssetsHandler(options) {
    const opts = options || {};
    opts.index = false;
    return express.static((0, swagger_ui_dist_1.getAbsoluteFSPath)(), opts);
}
function createHTML(options) {
    return (0, string_1.interpolate)(indexTemplate_1.indexTemplate, options);
}
function swaggerUiIndexHandler(options) {
    const html = createHTML(options);
    return (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    };
}
