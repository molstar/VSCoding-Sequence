import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { createRoot } from 'react-dom/client';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { useBehavior } from '../../mol-plugin-ui/hooks/use-behavior';
import { PluginContextContainer } from '../../mol-plugin-ui/plugin';
export function mountControls(orbitals, parent) {
    createRoot(parent).render(_jsx(PluginContextContainer, { plugin: orbitals.plugin, children: _jsx(Controls, { orbitals: orbitals }) }));
}
function Controls({ orbitals }) {
    const params = useBehavior(orbitals.params);
    const values = useBehavior(orbitals.state);
    return _jsx(ParameterControls, { params: params, values: values, onChangeValues: (vs) => orbitals.state.next(vs) });
}
