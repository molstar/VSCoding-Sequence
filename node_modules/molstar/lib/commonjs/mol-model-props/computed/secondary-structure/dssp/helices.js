"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignHelices = assignHelices;
const common_1 = require("./common");
/**
 * A minimal helix is defined by two consecutive n-turns.
 * For example, a 4-helix, of minimal length 4 from residues i to i + 3,
 * requires 4-turns at residues i - 1 and i,
 *
 *      3-helix(i,i + 2)=: [3-turn(i - 1) and 3-turn(i)]
 *      4-helix(i,i + 3)=: [4-turn(i - 1) and 4-turn(i)]
 *      5-helix(i,i + 4)=: [5-turn(i - 1) and 5-turn(i)]
 *
 * Type: G (n=3), H (n=4), I (n=5)
 */
function assignHelices(ctx) {
    const { proteinInfo, flags } = ctx;
    const residueCount = proteinInfo.residueIndices.length;
    const turnFlag = [1024 /* DSSPType.Flag.T3S */, 2048 /* DSSPType.Flag.T4S */, 4096 /* DSSPType.Flag.T5S */, 128 /* DSSPType.Flag.T3 */, 256 /* DSSPType.Flag.T4 */, 512 /* DSSPType.Flag.T5 */];
    const helixFlag = [0, 0, 0, 8 /* DSSPType.Flag.G */, 1 /* DSSPType.Flag.H */, 16 /* DSSPType.Flag.I */];
    const helixCheckOrder = ctx.params.oldOrdering ? [4, 3, 5] : [3, 4, 5];
    for (let ni = 0; ni < helixCheckOrder.length; ni++) {
        const n = helixCheckOrder[ni];
        for (let i = 1, il = residueCount - n; i < il; i++) {
            const fI = common_1.DSSPType.create(flags[i]);
            const fI1 = common_1.DSSPType.create(flags[i - 1]);
            const fI2 = common_1.DSSPType.create(flags[i + 1]);
            // TODO rework to elegant solution which will not break instantly
            if (ctx.params.oldOrdering) {
                if ((n === 3 && (common_1.DSSPType.is(fI, 1 /* DSSPType.Flag.H */) || common_1.DSSPType.is(fI2, 1 /* DSSPType.Flag.H */)) || // for 3-10 yield to alpha helix
                    (n === 5 && ((common_1.DSSPType.is(fI, 1 /* DSSPType.Flag.H */) || common_1.DSSPType.is(fI, 8 /* DSSPType.Flag.G */)) || (common_1.DSSPType.is(fI2, 1 /* DSSPType.Flag.H */) || common_1.DSSPType.is(fI2, 8 /* DSSPType.Flag.G */)))))) { // for pi yield to all other helices
                    continue;
                }
            }
            else {
                if ((n === 4 && (common_1.DSSPType.is(fI, 8 /* DSSPType.Flag.G */) || common_1.DSSPType.is(fI2, 8 /* DSSPType.Flag.G */)) || // for alpha helix yield to 3-10
                    (n === 5 && ((common_1.DSSPType.is(fI, 1 /* DSSPType.Flag.H */) || common_1.DSSPType.is(fI, 8 /* DSSPType.Flag.G */)) || (common_1.DSSPType.is(fI2, 1 /* DSSPType.Flag.H */) || common_1.DSSPType.is(fI2, 8 /* DSSPType.Flag.G */)))))) { // for pi yield to all other helices
                    continue;
                }
            }
            if (common_1.DSSPType.is(fI, turnFlag[n]) && common_1.DSSPType.is(fI, turnFlag[n - 3]) && // check fI for turn start of proper type
                common_1.DSSPType.is(fI1, turnFlag[n]) && common_1.DSSPType.is(fI1, turnFlag[n - 3])) { // check fI1 accordingly
                if (ctx.params.oldDefinition) {
                    for (let k = 0; k < n; k++) {
                        flags[i + k] |= helixFlag[n];
                    }
                }
                else {
                    for (let k = -1; k <= n; k++) {
                        flags[i + k] |= helixFlag[n];
                    }
                }
            }
        }
    }
}
