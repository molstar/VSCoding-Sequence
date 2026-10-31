"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const mapping_1 = require("./mapping");
async function getMappings(id) {
    const data = await (0, node_fetch_1.default)(`https://www.ebi.ac.uk/pdbe/api/mappings/${id}`);
    const json = await data.json();
    return (0, mapping_1.createMapping)(json);
}
;
const PORT = process.env.port || 1338;
const app = (0, express_1.default)();
const PREFIX = '/';
app.get(`${PREFIX}/:id`, async (req, res) => {
    try {
        console.log('Requesting ' + req.params.id);
        const mapping = await getMappings(req.params.id);
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With'
        });
        res.end(mapping);
    }
    catch (_a) {
        console.log('Failed ' + req.params.id);
        res.writeHead(404, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'X-Requested-With' });
        res.end();
    }
});
app.get(`${PREFIX}`, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Usage: /pdb_id, e.g. /1tqn');
});
app.listen(PORT);
console.log('Running on port ' + PORT);
