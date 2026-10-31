/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Vec3 } from '../../mol-math/linear-algebra';
import { RuntimeContext } from '../../mol-task';
import { PluginContext } from '../../mol-plugin/context';
import { PluginStateObject as SO } from '../objects';
export declare namespace RootStructureDefinition {
    function getParams(model?: Model, defaultValue?: 'auto' | 'model' | 'assembly' | 'symmetry' | 'symmetry-mates' | 'symmetry-assembly'): {
        type: PD.Mapped<PD.NamedParams<PD.Normalize<{
            dynamicBonds: boolean | undefined;
        }>, "auto"> | PD.NamedParams<PD.Normalize<{
            dynamicBonds: boolean | undefined;
            id: string | undefined;
        }>, "assembly"> | PD.NamedParams<PD.Normalize<{
            dynamicBonds: boolean | undefined;
            ijkMin: Vec3;
            ijkMax: Vec3;
        }>, "symmetry"> | PD.NamedParams<PD.Normalize<{
            dynamicBonds: boolean | undefined;
        }>, "model"> | PD.NamedParams<PD.Normalize<{
            dynamicBonds: boolean | undefined;
            radius: number;
        }>, "symmetry-mates"> | PD.NamedParams<PD.Normalize<{
            dynamicBonds: boolean | undefined;
            generators: PD.Normalize<{
                operators: {
                    index: number;
                    shift: Vec3;
                }[];
                asymIds: string[];
            }>[];
        }>, "symmetry-assembly">>;
    };
    type Params = PD.Values<ReturnType<typeof getParams>>['type'];
    function canAutoUpdate(oldParams: Params, newParams: Params): boolean;
    function create(plugin: PluginContext, ctx: RuntimeContext, model: Model, params?: Params): Promise<SO.Molecule.Structure>;
}
