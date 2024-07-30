/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Model, Structure, StructureElement } from '../../../mol-model/structure';
import { MVSAnnotationRow } from './schemas';
/** Properties describing position, size, etc. of a text in 3D */
export interface TextProps {
    /** Anchor point for the text (i.e. the center of the text will appear in front of `center`) */
    center: Vec3;
    /** Depth of the text wrt anchor point (i.e. the text will appear in distance `radius` in front of the anchor point) */
    depth: number;
    /** Relative text size */
    scale: number;
    /** Index of the first atom within structure, to which this text is bound (for coloring and similar purposes) */
    group: number;
}
/** Return `TextProps` (position, size, etc.) for a text that is to be bound to a substructure of `structure` defined by union of `rows`.
 * Derives `center` and `depth` from the boundary sphere of the substructure, `scale` from the number of heavy atoms in the substructure. */
export declare function textPropsForSelection(structure: Structure, sizeFunction: (location: StructureElement.Location) => number, rows: MVSAnnotationRow | MVSAnnotationRow[], onlyInModel?: Model): TextProps | undefined;
