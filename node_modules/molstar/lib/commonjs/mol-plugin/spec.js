"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPluginSpec = exports.PluginSpec = void 0;
const assembly_unwind_1 = require("../mol-plugin-state/animation/built-in/assembly-unwind");
const camera_spin_1 = require("../mol-plugin-state/animation/built-in/camera-spin");
const model_index_1 = require("../mol-plugin-state/animation/built-in/model-index");
const state_snapshots_1 = require("../mol-plugin-state/animation/built-in/state-snapshots");
const behavior_1 = require("./behavior");
const structure_focus_representation_1 = require("./behavior/dynamic/selection/structure-focus-representation");
const actions_1 = require("../mol-plugin-state/actions");
const volume_1 = require("../mol-plugin-state/actions/volume");
const transforms_1 = require("../mol-plugin-state/transforms");
const transformers_1 = require("../mol-plugin/behavior/dynamic/volume-streaming/transformers");
const state_interpolation_1 = require("../mol-plugin-state/animation/built-in/state-interpolation");
const spin_structure_1 = require("../mol-plugin-state/animation/built-in/spin-structure");
const camera_rock_1 = require("../mol-plugin-state/animation/built-in/camera-rock");
var PluginSpec;
(function (PluginSpec) {
    function Action(action, params) {
        return { action, customControl: params && params.customControl, autoUpdate: params && params.autoUpdate };
    }
    PluginSpec.Action = Action;
    function Behavior(transformer, defaultParams = {}) {
        return { transformer, defaultParams };
    }
    PluginSpec.Behavior = Behavior;
})(PluginSpec || (exports.PluginSpec = PluginSpec = {}));
const DefaultPluginSpec = () => ({
    actions: [
        PluginSpec.Action(actions_1.StateActions.Structure.DownloadStructure),
        PluginSpec.Action(actions_1.StateActions.Volume.DownloadDensity),
        PluginSpec.Action(actions_1.StateActions.DataFormat.DownloadFile),
        PluginSpec.Action(actions_1.StateActions.DataFormat.OpenFiles),
        PluginSpec.Action(actions_1.StateActions.Structure.LoadTrajectory),
        PluginSpec.Action(actions_1.StateActions.Structure.EnableModelCustomProps),
        PluginSpec.Action(actions_1.StateActions.Structure.EnableStructureCustomProps),
        // Volume streaming
        PluginSpec.Action(transformers_1.InitVolumeStreaming),
        PluginSpec.Action(transformers_1.BoxifyVolumeStreaming),
        PluginSpec.Action(transformers_1.CreateVolumeStreamingBehavior),
        PluginSpec.Action(transforms_1.StateTransforms.Data.Download),
        PluginSpec.Action(transforms_1.StateTransforms.Data.ParseCif),
        PluginSpec.Action(transforms_1.StateTransforms.Data.ParseCcp4),
        PluginSpec.Action(transforms_1.StateTransforms.Data.ParseDsn6),
        PluginSpec.Action(transforms_1.StateTransforms.Model.TrajectoryFromMmCif),
        PluginSpec.Action(transforms_1.StateTransforms.Model.TrajectoryFromCifCore),
        PluginSpec.Action(transforms_1.StateTransforms.Model.TrajectoryFromPDB),
        PluginSpec.Action(transforms_1.StateTransforms.Model.TransformStructureConformation),
        PluginSpec.Action(transforms_1.StateTransforms.Model.StructureFromModel),
        PluginSpec.Action(transforms_1.StateTransforms.Model.StructureFromTrajectory),
        PluginSpec.Action(transforms_1.StateTransforms.Model.ModelFromTrajectory),
        PluginSpec.Action(transforms_1.StateTransforms.Model.StructureSelectionFromScript),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureRepresentation3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureSelectionsDistance3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureSelectionsAngle3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureSelectionsDihedral3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureSelectionsLabel3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureSelectionsOrientation3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.ModelUnitcell3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.StructureBoundingBox3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.ExplodeStructureRepresentation3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.SpinStructureRepresentation3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.UnwindStructureAssemblyRepresentation3D),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.OverpaintStructureRepresentation3DFromScript),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.TransparencyStructureRepresentation3DFromScript),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.ClippingStructureRepresentation3DFromScript),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.SubstanceStructureRepresentation3DFromScript),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.ThemeStrengthRepresentation3D),
        PluginSpec.Action(volume_1.AssignColorVolume),
        PluginSpec.Action(transforms_1.StateTransforms.Volume.VolumeFromCcp4),
        PluginSpec.Action(transforms_1.StateTransforms.Volume.VolumeFromDsn6),
        PluginSpec.Action(transforms_1.StateTransforms.Volume.VolumeFromCube),
        PluginSpec.Action(transforms_1.StateTransforms.Volume.VolumeFromDx),
        PluginSpec.Action(transforms_1.StateTransforms.Representation.VolumeRepresentation3D),
    ],
    behaviors: [
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Representation.HighlightLoci),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Representation.SelectLoci),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Representation.DefaultLociLabelProvider),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Representation.FocusLoci),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Camera.FocusLoci),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Camera.CameraAxisHelper),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.Camera.CameraControls),
        PluginSpec.Behavior(structure_focus_representation_1.StructureFocusRepresentation),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.StructureInfo),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.AccessibleSurfaceArea),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.BestDatabaseSequenceMapping),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.Interactions),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.SecondaryStructure),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.ValenceModel),
        PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.CrossLinkRestraint),
    ],
    animations: [
        model_index_1.AnimateModelIndex,
        camera_spin_1.AnimateCameraSpin,
        camera_rock_1.AnimateCameraRock,
        state_snapshots_1.AnimateStateSnapshots,
        assembly_unwind_1.AnimateAssemblyUnwind,
        spin_structure_1.AnimateStructureSpin,
        state_interpolation_1.AnimateStateInterpolation
    ]
});
exports.DefaultPluginSpec = DefaultPluginSpec;
