"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const bodyParser = tslib_1.__importStar(require("body-parser"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const swagger_ui_1 = require("../common/swagger-ui");
const make_dir_1 = require("../../mol-util/make-dir");
const config_1 = require("./config");
const mol_util_1 = require("../../mol-util");
const api_schema_1 = require("./api-schema");
const Config = (0, config_1.getConfig)();
const app = (0, express_1.default)();
app.use((0, compression_1.default)({ level: 6, memLevel: 9, chunkSize: 16 * 16384, filter: () => true }));
app.use((0, cors_1.default)({ methods: ['GET', 'PUT'] }));
app.use(bodyParser.json({ limit: '20mb' }));
function createIndex() {
    const fn = path.join(Config.working_folder, 'index.json');
    if (fs.existsSync(fn))
        return;
    if (!fs.existsSync(Config.working_folder))
        (0, make_dir_1.makeDir)(Config.working_folder);
    fs.writeFileSync(fn, '[]', 'utf-8');
}
function writeIndex(index) {
    const fn = path.join(Config.working_folder, 'index.json');
    if (!fs.existsSync(Config.working_folder))
        (0, make_dir_1.makeDir)(Config.working_folder);
    fs.writeFileSync(fn, JSON.stringify(index, null, 2), 'utf-8');
}
function readIndex() {
    const fn = path.join(Config.working_folder, 'index.json');
    if (!fs.existsSync(fn))
        return [];
    return JSON.parse(fs.readFileSync(fn, 'utf-8'));
}
function validateIndex(index) {
    if (index.length > Config.max_states) {
        const deletes = [], newIndex = [];
        const toDelete = index.length - Config.max_states;
        for (const e of index) {
            if (!e.isSticky && deletes.length < toDelete) {
                deletes.push(e);
            }
            else {
                newIndex.push(e);
            }
        }
        for (const d of deletes) {
            try {
                fs.unlinkSync(path.join(Config.working_folder, d.id + '.json'));
            }
            catch (_a) { }
        }
        return newIndex;
    }
    return index;
}
function remove(id) {
    const index = readIndex();
    let i = 0;
    for (const e of index) {
        if (e.id !== id) {
            i++;
            continue;
        }
        if (e.isSticky)
            return;
        try {
            for (let j = i + 1; j < index.length; j++) {
                index[j - 1] = index[j];
            }
            index.pop();
            writeIndex(index);
        }
        catch (_a) { }
        try {
            fs.unlinkSync(path.join(Config.working_folder, e.id + '.json'));
        }
        catch (_b) { }
        return;
    }
}
// function clear() {
//     let index = readIndex();
//     for (const e of index) {
//         try {
//             fs.unlinkSync(path.join(Config.working_folder, e.id + '.json'));
//         } catch { }
//     }
//     writeIndex([]);
// }
function mapPath(path) {
    if (!Config.api_prefix)
        return path;
    return `/${Config.api_prefix}/${path}`;
}
app.get(mapPath(`/get/:id`), (req, res) => {
    const id = req.params.id || '';
    console.log('Reading', id);
    if (id.length === 0 || id.indexOf('.') >= 0 || id.indexOf('/') >= 0 || id.indexOf('\\') >= 0) {
        res.status(404);
        res.end();
        return;
    }
    fs.readFile(path.join(Config.working_folder, id + '.json'), 'utf-8', (err, data) => {
        if (err) {
            res.status(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
        });
        res.write(data);
        res.end();
    });
});
// app.get(mapPath(`/clear`), (req, res) => {
//     clear();
//     res.status(200);
//     res.end();
// });
app.get(mapPath(`/remove/:id`), (req, res) => {
    remove((req.params.id || '').toLowerCase());
    res.status(200);
    res.end();
});
// app.get(mapPath(`/latest`), (req, res) => {
//     const index = readIndex();
//     const id: string = index.length > 0 ? index[index.length - 1].id : '';
//     console.log('Reading', id);
//     if (id.length === 0 || id.indexOf('.') >= 0 || id.indexOf('/') >= 0 || id.indexOf('\\') >= 0) {
//         res.status(404);
//         res.end();
//         return;
//     }
//     fs.readFile(path.join(Config.working_folder, id + '.json'), 'utf-8', (err, data) => {
//         if (err) {
//             res.status(404);
//             res.end();
//             return;
//         }
//         res.writeHead(200, {
//             'Content-Type': 'application/json; charset=utf-8',
//         });
//         res.write(data);
//         res.end();
//     });
// });
app.get(mapPath(`/list`), (req, res) => {
    const index = readIndex();
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
    });
    res.write(JSON.stringify(index, null, 2));
    res.end();
});
app.post(mapPath(`/set`), (req, res) => {
    console.log('SET', req.query.name, req.query.description);
    const index = readIndex();
    validateIndex(index);
    const name = (req.query.name || new Date().toUTCString()).substr(0, 50);
    const description = (req.query.description || '').substr(0, 100);
    index.push({ timestamp: +new Date(), id: mol_util_1.UUID.createv4(), name, description });
    const entry = index[index.length - 1];
    const data = JSON.stringify({
        id: entry.id,
        name,
        description,
        data: req.body
    });
    fs.writeFile(path.join(Config.working_folder, entry.id + '.json'), data, { encoding: 'utf8' }, () => res.end());
    writeIndex(index);
});
const schema = (0, api_schema_1.getSchema)(Config);
app.get(mapPath('/openapi.json'), (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With'
    });
    res.end(JSON.stringify(schema));
});
app.use(mapPath('/'), (0, swagger_ui_1.swaggerUiAssetsHandler)());
app.get(mapPath('/'), (0, swagger_ui_1.swaggerUiIndexHandler)({
    openapiJsonUrl: mapPath('/openapi.json'),
    apiPrefix: Config.api_prefix,
    title: 'PluginState Server API',
    shortcutIconLink: api_schema_1.shortcutIconLink
}));
createIndex();
app.listen(Config.port);
console.log(`Mol* PluginState Server`);
console.log('');
console.log(JSON.stringify(Config, null, 2));
