/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
// import { BitFlags } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { StructureProperties } from '../../../mol-model/structure';
import { assignRadiusForHeavyAtoms } from './shrake-rupley/radii';
import { VdWLookup, MaxAsa, DefaultMaxAsa } from './shrake-rupley/common';
import { computeArea } from './shrake-rupley/area';
import { SortedArray } from '../../../mol-data/int';
export const ShrakeRupleyComputationParams = {
    numberOfSpherePoints: PD.Numeric(92, { min: 12, max: 360, step: 1 }, { description: 'Number of sphere points to sample per atom: 92 (original paper), 960 (BioJava), 3000 (EPPIC) - see Shrake A, Rupley JA: Environment and exposure to solvent of protein atoms. Lysozyme and insulin. J Mol Biol 1973.' }),
    probeSize: PD.Numeric(1.4, { min: 0.1, max: 4, step: 0.01 }, { description: 'Corresponds to the size of a water molecule: 1.4 (original paper), 1.5 (occassionally used)' }),
    // buriedRasaThreshold: PD.Numeric(0.16, { min: 0.0, max: 1.0 }, { description: 'below this cutoff of relative accessible surface area a residue will be considered buried - see: Rost B, Sander C: Conservation and prediction of solvent accessibility in protein families. Proteins 1994.' }),
    nonPolymer: PD.Boolean(false, { description: 'Include non-polymer atoms as occluders.' }),
    traceOnly: PD.Boolean(false, { description: 'Compute only using alpha-carbons, if true increase probeSize accordingly (e.g., 4 A). Considers only canonical amino acids.' })
};
// TODO
// - add back buried and relative asa
export { AccessibleSurfaceArea };
var AccessibleSurfaceArea;
(function (AccessibleSurfaceArea) {
    /**
     * Adapts the BioJava implementation by Jose Duarte. That implementation is based on the publication by Shrake, A., and
     * J. A. Rupley. "Environment and Exposure to Solvent of Protein Atoms. Lysozyme and Insulin." JMB (1973).
     */
    function compute(structure, props = {}) {
        const p = { ...PD.getDefaultValues(ShrakeRupleyComputationParams), ...props };
        return Task.create('Compute Accessible Surface Area', async (runtime) => {
            return await calculate(runtime, structure, p);
        });
    }
    AccessibleSurfaceArea.compute = compute;
    async function calculate(runtime, structure, props) {
        const ctx = initialize(structure, props);
        assignRadiusForHeavyAtoms(ctx);
        await computeArea(runtime, ctx);
        const { area, serialResidueIndex } = ctx;
        return { area, serialResidueIndex };
    }
    function initialize(structure, props) {
        const { elementCount, atomicResidueCount } = structure;
        const { probeSize, nonPolymer, traceOnly, numberOfSpherePoints } = props;
        return {
            structure,
            probeSize,
            nonPolymer,
            traceOnly,
            spherePoints: generateSpherePoints(numberOfSpherePoints),
            scalingConstant: 4.0 * Math.PI / numberOfSpherePoints,
            maxLookupRadius: 2 * props.probeSize + 2 * VdWLookup[2], // 2x probe size + 2x largest VdW
            atomRadiusType: new Int8Array(elementCount),
            serialResidueIndex: new Int32Array(elementCount),
            area: new Float32Array(atomicResidueCount)
        };
    }
    /** Creates a collection of points on a sphere by the Golden Section Spiral algorithm. */
    function generateSpherePoints(numberOfSpherePoints) {
        const points = [];
        const inc = Math.PI * (3.0 - Math.sqrt(5.0));
        const offset = 2.0 / numberOfSpherePoints;
        for (let k = 0; k < numberOfSpherePoints; ++k) {
            const y = k * offset - 1.0 + (offset / 2.0);
            const r = Math.sqrt(1.0 - y * y);
            const phi = k * inc;
            points[points.length] = Vec3.create(Math.cos(phi) * r, y, Math.sin(phi) * r);
        }
        return points;
    }
    AccessibleSurfaceArea.Flag = {
        NA: 0 /* Flags.NA */,
        Buried: 1 /* Flags.Buried */,
        Accessible: 2 /* Flags.Accessible */
    };
    /** Get relative area for a given component id */
    function normalize(compId, asa) {
        const maxAsa = MaxAsa[compId] || DefaultMaxAsa;
        return asa / maxAsa;
    }
    AccessibleSurfaceArea.normalize = normalize;
    function getValue(location, accessibleSurfaceArea) {
        const { area, serialResidueIndex } = accessibleSurfaceArea;
        const rSI = serialResidueIndex[SortedArray.indexOf(SortedArray.ofSortedArray(location.structure.root.serialMapping.elementIndices), location.element)];
        if (rSI === -1)
            return -1;
        return area[rSI];
    }
    AccessibleSurfaceArea.getValue = getValue;
    function getNormalizedValue(location, accessibleSurfaceArea) {
        const value = getValue(location, accessibleSurfaceArea);
        return value === -1 ? -1 : normalize(StructureProperties.atom.label_comp_id(location), value);
    }
    AccessibleSurfaceArea.getNormalizedValue = getNormalizedValue;
    function getFlag(location, accessibleSurfaceArea) {
        const value = getNormalizedValue(location, accessibleSurfaceArea);
        return value === -1 ? 0 /* Flags.NA */ :
            value < 0.16 ? 1 /* Flags.Buried */ :
                2 /* Flags.Accessible */;
    }
    AccessibleSurfaceArea.getFlag = getFlag;
})(AccessibleSurfaceArea || (AccessibleSurfaceArea = {}));
