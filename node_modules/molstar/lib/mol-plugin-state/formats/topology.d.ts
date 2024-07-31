/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const TopologyFormatCategory = "Topology";
export { PsfProvider };
declare const PsfProvider: {
    label: string;
    description: string;
    category: string;
    stringExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<{
        format: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Format.Psf, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Data.String, import("../objects").PluginStateObject.Format.Psf, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
        topology: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Format.Psf, import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
    }>;
};
type PsfProvider = typeof PsfProvider;
export { PrmtopProvider };
declare const PrmtopProvider: {
    label: string;
    description: string;
    category: string;
    stringExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<{
        format: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Format.Prmtop, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Data.String, import("../objects").PluginStateObject.Format.Prmtop, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
        topology: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Format.Prmtop, import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
    }>;
};
type PrmtopProvider = typeof PrmtopProvider;
export { TopProvider };
declare const TopProvider: {
    label: string;
    description: string;
    category: string;
    stringExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<{
        format: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Format.Top, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Data.String, import("../objects").PluginStateObject.Format.Top, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
        topology: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Format.Top, import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
    }>;
};
type TopProvider = typeof TopProvider;
export type TopologyProvider = PsfProvider;
export declare const BuiltInTopologyFormats: readonly [readonly ["psf", {
    label: string;
    description: string;
    category: string;
    stringExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<{
        format: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Format.Psf, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Data.String, import("../objects").PluginStateObject.Format.Psf, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
        topology: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Format.Psf, import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
    }>;
}], readonly ["prmtop", {
    label: string;
    description: string;
    category: string;
    stringExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<{
        format: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Format.Prmtop, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Data.String, import("../objects").PluginStateObject.Format.Prmtop, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
        topology: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Format.Prmtop, import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
    }>;
}], readonly ["top", {
    label: string;
    description: string;
    category: string;
    stringExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<{
        format: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Format.Top, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Data.String, import("../objects").PluginStateObject.Format.Top, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
        topology: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-state").StateTransformer<import("../objects").PluginStateObject.Format.Top, import("../objects").PluginStateObject.Molecule.Topology, import("../../mol-util/param-definition").ParamDefinition.Normalize<{}>>>;
    }>;
}]];
export type BuiltInTopologyFormat = (typeof BuiltInTopologyFormats)[number][0];
