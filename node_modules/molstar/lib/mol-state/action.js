/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UUID } from '../mol-util';
import { ParamDefinition as PD } from '../mol-util/param-definition';
export { StateAction };
var StateAction;
(function (StateAction) {
    function create(definition) {
        const action = {
            create(params) { return { action, params }; },
            id: UUID.create22(),
            definition,
            createDefaultParams(a, globalCtx) { return definition.params ? PD.getDefaultValues(definition.params(a, globalCtx)) : {}; }
        };
        return action;
    }
    StateAction.create = create;
    function fromTransformer(transformer) {
        const def = transformer.definition;
        return create({
            from: def.from,
            display: def.display,
            params: def.params,
            isApplicable: transformer.definition.isApplicable
                ? (a, t, ctx) => transformer.definition.isApplicable(a, ctx)
                : void 0,
            run({ cell, state, params }) {
                const tree = state.build().to(cell.transform.ref).apply(transformer, params);
                return state.updateTree(tree);
            }
        });
    }
    StateAction.fromTransformer = fromTransformer;
    let Builder;
    (function (Builder) {
        function root(info) {
            return def => create({
                from: info.from instanceof Array
                    ? info.from
                    : !!info.from ? [info.from] : [],
                display: typeof info.display === 'string'
                    ? { name: info.display }
                    : !!info.display
                        ? info.display
                        : { name: 'Unnamed State Action' },
                params: typeof info.params === 'object'
                    ? () => info.params
                    : !!info.params
                        ? info.params
                        : void 0,
                isApplicable: info.isApplicable,
                ...(typeof def === 'function'
                    ? { run: def }
                    : def)
            });
        }
        Builder.build = (info) => root(info);
    })(Builder = StateAction.Builder || (StateAction.Builder = {}));
    StateAction.build = Builder.build;
})(StateAction || (StateAction = {}));
