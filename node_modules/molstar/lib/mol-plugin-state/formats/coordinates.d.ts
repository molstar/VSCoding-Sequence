/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const CoordinatesFormatCategory = "Coordinates";
export { DcdProvider };
declare const DcdProvider: {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
};
type DcdProvider = typeof DcdProvider;
export { XtcProvider };
declare const XtcProvider: {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
};
type XtcProvider = typeof XtcProvider;
export { TrrProvider };
declare const TrrProvider: {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
};
type TrrProvider = typeof TrrProvider;
export { NctrajProvider };
declare const NctrajProvider: {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
};
type NctrajProvider = typeof NctrajProvider;
export type CoordinatesProvider = DcdProvider | XtcProvider | TrrProvider;
export declare const BuiltInCoordinatesFormats: readonly [readonly ["dcd", {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
}], readonly ["xtc", {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
}], readonly ["trr", {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
}], readonly ["nctraj", {
    label: string;
    description: string;
    category: string;
    binaryExtensions: string[];
    parse: (plugin: import("../../mol-plugin/context").PluginContext, data: import("../../mol-state").StateObjectRef<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary>) => Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Molecule.Coordinates, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
}]];
export type BuiltInCoordinatesFormat = (typeof BuiltInCoordinatesFormats)[number][0];
