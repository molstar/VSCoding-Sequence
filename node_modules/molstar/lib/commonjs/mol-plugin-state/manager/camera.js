"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ke Ma <mark.ma@rcsb.org>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraManager = void 0;
const boundary_helper_1 = require("../../mol-math/geometry/boundary-helper");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const loci_1 = require("../../mol-model/loci");
const structure_1 = require("../../mol-model/structure");
const objects_1 = require("../objects");
const focus_first_residue_1 = require("./focus-camera/focus-first-residue");
const orient_axes_1 = require("./focus-camera/orient-axes");
// TODO: make this customizable somewhere?
const DefaultCameraFocusOptions = {
    minRadius: 5,
    extraRadius: 4,
    durationMs: 250,
};
class CameraManager {
    transformedLoci(loci) {
        var _a, _b;
        if (structure_1.StructureElement.Loci.is(loci)) {
            // use decorated (including 3d transforms) parent structure
            const parent = (_b = (_a = this.plugin.helpers.substructureParent.get(loci.structure)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (parent)
                loci = structure_1.StructureElement.Loci.remap(loci, parent);
        }
        return loci;
    }
    focusRenderObjects(objects, options) {
        if (!objects)
            return;
        const spheres = [];
        for (const o of objects) {
            const s = o.values.boundingSphere.ref.value;
            if (s.radius === 0)
                continue;
            spheres.push(s);
        }
        this.focusSpheres(spheres, s => s, options);
    }
    focusLoci(loci, options) {
        // TODO: allow computation of principal axes here?
        // perhaps have an optimized function, that does exact axes small Loci and approximate/sampled from big ones?
        let sphere;
        if (Array.isArray(loci) && loci.length > 1) {
            const spheres = [];
            for (const l of loci) {
                const s = loci_1.Loci.getBoundingSphere(this.transformedLoci(l));
                if (s)
                    spheres.push(s);
            }
            if (spheres.length === 0)
                return;
            this.boundaryHelper.reset();
            for (const s of spheres) {
                this.boundaryHelper.includeSphere(s);
            }
            this.boundaryHelper.finishedIncludeStep();
            for (const s of spheres) {
                this.boundaryHelper.radiusSphere(s);
            }
            sphere = this.boundaryHelper.getSphere();
        }
        else if (Array.isArray(loci)) {
            if (loci.length === 0)
                return;
            sphere = loci_1.Loci.getBoundingSphere(this.transformedLoci(loci[0]));
        }
        else {
            sphere = loci_1.Loci.getBoundingSphere(this.transformedLoci(loci));
        }
        if (sphere) {
            this.focusSphere(sphere, options);
        }
    }
    focusSpheres(xs, sphere, options) {
        const spheres = [];
        for (const x of xs) {
            const s = sphere(x);
            if (s)
                spheres.push(s);
        }
        if (spheres.length === 0)
            return;
        if (spheres.length === 1)
            return this.focusSphere(spheres[0], options);
        this.boundaryHelper.reset();
        for (const s of spheres) {
            this.boundaryHelper.includeSphere(s);
        }
        this.boundaryHelper.finishedIncludeStep();
        for (const s of spheres) {
            this.boundaryHelper.radiusSphere(s);
        }
        this.focusSphere(this.boundaryHelper.getSphere(), options);
    }
    focusSphere(sphere, options) {
        var _a;
        const { canvas3d } = this.plugin;
        if (!canvas3d)
            return;
        const { extraRadius, minRadius, durationMs } = { ...DefaultCameraFocusOptions, ...options };
        const radius = Math.max(sphere.radius + extraRadius, minRadius);
        if (options === null || options === void 0 ? void 0 : options.principalAxes) {
            const snapshot = (0, focus_first_residue_1.pcaFocus)(this.plugin, radius, options);
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ durationMs, snapshot });
        }
        else {
            const snapshot = canvas3d.camera.getFocus(sphere.center, radius);
            canvas3d.requestCameraReset({ durationMs, snapshot });
        }
    }
    /** Align PCA axes of `structures` (default: all loaded structures) to the screen axes. */
    orientAxes(structures, durationMs) {
        if (!this.plugin.canvas3d)
            return;
        if (!structures) {
            const structCells = this.plugin.state.data.selectQ(q => q.ofType(objects_1.PluginStateObject.Molecule.Structure));
            const rootStructCells = structCells.filter(cell => cell.obj && !cell.transform.transformer.definition.isDecorator && !cell.obj.data.parent);
            structures = rootStructCells.map(cell => { var _a; return (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data; }).filter(struct => !!struct);
        }
        const { rotation } = (0, orient_axes_1.structureLayingTransform)(structures);
        const newSnapshot = (0, orient_axes_1.changeCameraRotation)(this.plugin.canvas3d.camera.getSnapshot(), rotation);
        this.setSnapshot(newSnapshot, durationMs);
    }
    /** Align Cartesian axes to the screen axes (X right, Y up). */
    resetAxes(durationMs) {
        if (!this.plugin.canvas3d)
            return;
        const newSnapshot = (0, orient_axes_1.changeCameraRotation)(this.plugin.canvas3d.camera.getSnapshot(), linear_algebra_1.Mat3.Identity);
        this.setSnapshot(newSnapshot, durationMs);
    }
    setSnapshot(snapshot, durationMs) {
        var _a;
        // TODO: setState and requestCameraReset are very similar now: unify them?
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ snapshot, durationMs });
    }
    reset(snapshot, durationMs) {
        var _a;
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ snapshot, durationMs });
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.boundaryHelper = new boundary_helper_1.BoundaryHelper('98');
    }
}
exports.CameraManager = CameraManager;
