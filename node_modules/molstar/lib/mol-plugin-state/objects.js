/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateObject, StateTransformer } from '../mol-state';
export var PluginStateObject;
(function (PluginStateObject) {
    PluginStateObject.Create = StateObject.factory();
    function isRepresentation3D(o) {
        return !!o && o.type.typeClass === 'Representation3D';
    }
    PluginStateObject.isRepresentation3D = isRepresentation3D;
    function isBehavior(o) {
        return !!o && o.type.typeClass === 'Behavior';
    }
    PluginStateObject.isBehavior = isBehavior;
    function CreateRepresentation3D(type) {
        return PluginStateObject.Create({ ...type, typeClass: 'Representation3D' });
    }
    PluginStateObject.CreateRepresentation3D = CreateRepresentation3D;
    function CreateBehavior(type) {
        return PluginStateObject.Create({ ...type, typeClass: 'Behavior' });
    }
    PluginStateObject.CreateBehavior = CreateBehavior;
    class Root extends PluginStateObject.Create({ name: 'Root', typeClass: 'Root' }) {
    }
    PluginStateObject.Root = Root;
    class Group extends PluginStateObject.Create({ name: 'Group', typeClass: 'Group' }) {
    }
    PluginStateObject.Group = Group;
    let Data;
    (function (Data) {
        class String extends PluginStateObject.Create({ name: 'String Data', typeClass: 'Data', }) {
        }
        Data.String = String;
        class Binary extends PluginStateObject.Create({ name: 'Binary Data', typeClass: 'Data' }) {
        }
        Data.Binary = Binary;
        class Blob extends PluginStateObject.Create({ name: 'Data Blob', typeClass: 'Data' }) {
        }
        Data.Blob = Blob;
    })(Data = PluginStateObject.Data || (PluginStateObject.Data = {}));
    let Format;
    (function (Format) {
        class Json extends PluginStateObject.Create({ name: 'JSON Data', typeClass: 'Data' }) {
        }
        Format.Json = Json;
        class Cif extends PluginStateObject.Create({ name: 'CIF File', typeClass: 'Data' }) {
        }
        Format.Cif = Cif;
        class Cube extends PluginStateObject.Create({ name: 'Cube File', typeClass: 'Data' }) {
        }
        Format.Cube = Cube;
        class Psf extends PluginStateObject.Create({ name: 'PSF File', typeClass: 'Data' }) {
        }
        Format.Psf = Psf;
        class Prmtop extends PluginStateObject.Create({ name: 'PRMTOP File', typeClass: 'Data' }) {
        }
        Format.Prmtop = Prmtop;
        class Top extends PluginStateObject.Create({ name: 'TOP File', typeClass: 'Data' }) {
        }
        Format.Top = Top;
        class Ply extends PluginStateObject.Create({ name: 'PLY File', typeClass: 'Data' }) {
        }
        Format.Ply = Ply;
        class Ccp4 extends PluginStateObject.Create({ name: 'CCP4/MRC/MAP File', typeClass: 'Data' }) {
        }
        Format.Ccp4 = Ccp4;
        class Dsn6 extends PluginStateObject.Create({ name: 'DSN6/BRIX File', typeClass: 'Data' }) {
        }
        Format.Dsn6 = Dsn6;
        class Dx extends PluginStateObject.Create({ name: 'DX File', typeClass: 'Data' }) {
        }
        Format.Dx = Dx;
        class Blob extends PluginStateObject.Create({ name: 'Format Blob', typeClass: 'Data' }) {
        }
        Format.Blob = Blob;
    })(Format = PluginStateObject.Format || (PluginStateObject.Format = {}));
    let Molecule;
    (function (Molecule) {
        class Coordinates extends PluginStateObject.Create({ name: 'Coordinates', typeClass: 'Object' }) {
        }
        Molecule.Coordinates = Coordinates;
        class Topology extends PluginStateObject.Create({ name: 'Topology', typeClass: 'Object' }) {
        }
        Molecule.Topology = Topology;
        class Model extends PluginStateObject.Create({ name: 'Model', typeClass: 'Object' }) {
        }
        Molecule.Model = Model;
        class Trajectory extends PluginStateObject.Create({ name: 'Trajectory', typeClass: 'Object' }) {
        }
        Molecule.Trajectory = Trajectory;
        class Structure extends PluginStateObject.Create({ name: 'Structure', typeClass: 'Object' }) {
        }
        Molecule.Structure = Structure;
        (function (Structure) {
            class Representation3D extends CreateRepresentation3D({ name: 'Structure 3D' }) {
            }
            Structure.Representation3D = Representation3D;
            class Representation3DState extends PluginStateObject.Create({ name: 'Structure 3D State', typeClass: 'Object' }) {
            }
            Structure.Representation3DState = Representation3DState;
            class Selections extends PluginStateObject.Create({ name: 'Selections', typeClass: 'Object' }) {
            }
            Structure.Selections = Selections;
        })(Structure = Molecule.Structure || (Molecule.Structure = {}));
    })(Molecule = PluginStateObject.Molecule || (PluginStateObject.Molecule = {}));
    let Volume;
    (function (Volume) {
        class Data extends PluginStateObject.Create({ name: 'Volume', typeClass: 'Object' }) {
        }
        Volume.Data = Data;
        class Lazy extends PluginStateObject.Create({ name: 'Lazy Volume', typeClass: 'Object' }) {
        }
        Volume.Lazy = Lazy;
        class Representation3D extends CreateRepresentation3D({ name: 'Volume 3D' }) {
        }
        Volume.Representation3D = Representation3D;
    })(Volume = PluginStateObject.Volume || (PluginStateObject.Volume = {}));
    let Shape;
    (function (Shape) {
        class Provider extends PluginStateObject.Create({ name: 'Shape Provider', typeClass: 'Object' }) {
        }
        Shape.Provider = Provider;
        class Representation3D extends CreateRepresentation3D({ name: 'Shape 3D' }) {
        }
        Shape.Representation3D = Representation3D;
    })(Shape = PluginStateObject.Shape || (PluginStateObject.Shape = {}));
})(PluginStateObject || (PluginStateObject = {}));
export var PluginStateTransform;
(function (PluginStateTransform) {
    PluginStateTransform.CreateBuiltIn = StateTransformer.factory('ms-plugin');
    PluginStateTransform.BuiltIn = StateTransformer.builderFactory('ms-plugin');
})(PluginStateTransform || (PluginStateTransform = {}));
