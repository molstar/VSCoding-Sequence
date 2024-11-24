/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject } from '../objects';
import { DistanceData } from '../../mol-repr/shape/loci/distance';
import { LabelData } from '../../mol-repr/shape/loci/label';
import { OrientationData } from '../../mol-repr/shape/loci/orientation';
import { AngleData } from '../../mol-repr/shape/loci/angle';
import { DihedralData } from '../../mol-repr/shape/loci/dihedral';
import { PlaneData } from '../../mol-repr/shape/loci/plane';
export declare function getDistanceDataFromStructureSelections(s: ReadonlyArray<PluginStateObject.Molecule.Structure.SelectionEntry>): DistanceData;
export declare function getAngleDataFromStructureSelections(s: ReadonlyArray<PluginStateObject.Molecule.Structure.SelectionEntry>): AngleData;
export declare function getDihedralDataFromStructureSelections(s: ReadonlyArray<PluginStateObject.Molecule.Structure.SelectionEntry>): DihedralData;
export declare function getLabelDataFromStructureSelections(s: ReadonlyArray<PluginStateObject.Molecule.Structure.SelectionEntry>): LabelData;
export declare function getOrientationDataFromStructureSelections(s: ReadonlyArray<PluginStateObject.Molecule.Structure.SelectionEntry>): OrientationData;
export declare function getPlaneDataFromStructureSelections(s: ReadonlyArray<PluginStateObject.Molecule.Structure.SelectionEntry>): PlaneData;
