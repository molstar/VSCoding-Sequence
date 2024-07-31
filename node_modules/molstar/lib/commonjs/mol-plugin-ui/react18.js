"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderReact18 = renderReact18;
const client_1 = require("react-dom/client");
function renderReact18(element, target) {
    (0, client_1.createRoot)(target).render(element);
}
