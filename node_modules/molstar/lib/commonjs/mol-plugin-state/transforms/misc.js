"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroup = void 0;
const mol_state_1 = require("../../mol-state");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const objects_1 = require("../objects");
const CreateGroup = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-group',
    display: { name: 'Group' },
    from: [],
    to: objects_1.PluginStateObject.Group,
    params: {
        label: param_definition_1.ParamDefinition.Text('Group'),
        description: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(''))
    }
})({
    apply({ params }) {
        return new objects_1.PluginStateObject.Group({}, params);
    },
    update({ oldParams, newParams, b }) {
        if ((0, mol_util_1.shallowEqualObjects)(oldParams, newParams))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        b.label = newParams.label;
        b.description = newParams.description;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.CreateGroup = CreateGroup;
// export { ValueRefTest };
// type ValueRefTest = typeof ValueRefTest
// const ValueRefTest = PluginStateTransform.BuiltIn({
//     name: 'value-ref-test',
//     display: { name: 'ValueRef Test' },
//     from: SO.Root,
//     to: SO.Data.String,
//     params: (_, ctx: PluginContext) => {
//         const getOptions = () => ctx.state.data.selectQ(q => q.rootsOfType(SO.Molecule.Model)).map(m => [m.transform.ref, m.obj?.label || m.transform.ref] as [string, string]);
//         return {
//             ref: PD.ValueRef<SO.Molecule.Model>(getOptions, ctx.state.data.tryGetCellData, { defaultRef: getOptions()[0]?.[0] })
//         };
//     }
// })({
//     apply({ params }) {
//         const model = params.ref.getValue();
//         console.log(model);
//         return new SO.Data.String(`Model: ${model.label}`, { label: model.label });
//     }
// });
