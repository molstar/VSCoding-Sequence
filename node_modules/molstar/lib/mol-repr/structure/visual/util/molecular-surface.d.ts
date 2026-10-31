/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, Structure } from '../../../../mol-model/structure';
import { Task } from '../../../../mol-task';
import { CommonSurfaceProps } from './common';
import { DensityData } from '../../../../mol-math/geometry';
import { MolecularSurfaceCalculationProps } from '../../../../mol-math/geometry/molecular-surface';
import { SizeTheme } from '../../../../mol-theme/size';
export type MolecularSurfaceProps = MolecularSurfaceCalculationProps & CommonSurfaceProps;
export declare function computeUnitMolecularSurface(structure: Structure, unit: Unit, sizeTheme: SizeTheme<any>, props: MolecularSurfaceProps): Task<DensityData>;
export declare function computeStructureMolecularSurface(structure: Structure, sizeTheme: SizeTheme<any>, props: MolecularSurfaceProps): Task<DensityData>;
