"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDefault = registerDefault;
exports.SyncRepresentationToCanvas = SyncRepresentationToCanvas;
exports.SyncStructureRepresentation3DState = SyncStructureRepresentation3DState;
exports.UpdateRepresentationVisibility = UpdateRepresentationVisibility;
const objects_1 = require("../../../mol-plugin-state/objects");
function registerDefault(ctx) {
    SyncRepresentationToCanvas(ctx);
    SyncStructureRepresentation3DState(ctx); // should be AFTER SyncRepresentationToCanvas
    UpdateRepresentationVisibility(ctx);
}
function SyncRepresentationToCanvas(ctx) {
    const events = ctx.state.data.events;
    events.object.created.subscribe(e => {
        var _a;
        if (!objects_1.PluginStateObject.isRepresentation3D(e.obj))
            return;
        updateVisibility(e.state.cells.get(e.ref), e.obj.data.repr);
        e.obj.data.repr.setState({ syncManually: true });
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.add(e.obj.data.repr);
    });
    events.object.updated.subscribe(e => {
        var _a, _b;
        if (e.oldObj && objects_1.PluginStateObject.isRepresentation3D(e.oldObj)) {
            (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.remove(e.oldObj.data.repr);
            e.oldObj.data.repr.destroy();
        }
        if (!objects_1.PluginStateObject.isRepresentation3D(e.obj)) {
            return;
        }
        updateVisibility(e.state.cells.get(e.ref), e.obj.data.repr);
        if (e.action === 'recreate') {
            e.obj.data.repr.setState({ syncManually: true });
        }
        (_b = ctx.canvas3d) === null || _b === void 0 ? void 0 : _b.add(e.obj.data.repr);
    });
    events.object.removed.subscribe(e => {
        var _a;
        if (!objects_1.PluginStateObject.isRepresentation3D(e.obj))
            return;
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.remove(e.obj.data.repr);
        e.obj.data.repr.destroy();
    });
}
function SyncStructureRepresentation3DState(ctx) {
    // TODO: figure out how to do transform composition here?
    const events = ctx.state.data.events;
    events.object.created.subscribe(e => {
        var _a;
        if (!objects_1.PluginStateObject.Molecule.Structure.Representation3DState.is(e.obj))
            return;
        const data = e.obj.data;
        data.repr.setState(data.state);
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.update(data.repr);
    });
    events.object.updated.subscribe(e => {
        var _a;
        if (!objects_1.PluginStateObject.Molecule.Structure.Representation3DState.is(e.obj))
            return;
        const data = e.obj.data;
        data.repr.setState(data.state);
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.update(data.repr);
    });
    events.object.removed.subscribe(e => {
        var _a;
        if (!objects_1.PluginStateObject.Molecule.Structure.Representation3DState.is(e.obj))
            return;
        const data = e.obj.data;
        data.repr.setState(data.initialState);
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.update(data.repr);
    });
}
function UpdateRepresentationVisibility(ctx) {
    ctx.state.data.events.cell.stateUpdated.subscribe(e => {
        var _a;
        const cell = e.state.cells.get(e.ref);
        if (!objects_1.PluginStateObject.isRepresentation3D(cell.obj))
            return;
        if (updateVisibility(cell, cell.obj.data.repr)) {
            (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.syncVisibility();
        }
    });
}
function updateVisibility(cell, r) {
    if (r.state.visible === !!cell.state.isHidden) {
        r.setState({ visible: !cell.state.isHidden });
        return true;
    }
    else {
        return false;
    }
}
