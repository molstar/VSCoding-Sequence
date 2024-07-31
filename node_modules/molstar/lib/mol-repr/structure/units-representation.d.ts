/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureRepresentation } from './representation';
import { Visual } from '../visual';
import { RepresentationContext, RepresentationParamsGetter } from '../representation';
import { Structure } from '../../mol-model/structure';
import { StructureParams } from './params';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { StructureGroup } from './visual/util/common';
export interface UnitsVisual<P extends StructureParams> extends Visual<StructureGroup, P> {
}
export declare function UnitsRepresentation<P extends StructureParams>(label: string, ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, P>, visualCtor: (materialId: number, structure: Structure, props: PD.Values<P>, webgl?: WebGLContext) => UnitsVisual<P>): StructureRepresentation<P>;
