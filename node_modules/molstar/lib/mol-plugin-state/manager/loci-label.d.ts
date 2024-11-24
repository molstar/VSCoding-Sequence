/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginContext } from '../../mol-plugin/context';
import { Loci } from '../../mol-model/loci';
import { Representation } from '../../mol-repr/representation';
export type LociLabel = string | any;
export type LociLabelProvider = {
    label: (loci: Loci, repr?: Representation<any>) => LociLabel | undefined;
    group?: (entry: LociLabel) => string;
    /** Labels from providers with higher priority are shown first */
    priority?: number;
};
export declare class LociLabelManager {
    ctx: PluginContext;
    providers: LociLabelProvider[];
    clearProviders(): void;
    addProvider(provider: LociLabelProvider): void;
    removeProvider(provider: LociLabelProvider): void;
    private locis;
    private mark;
    private isDirty;
    private labels;
    private groupedLabels;
    private showLabels;
    private getLabels;
    constructor(ctx: PluginContext);
}
