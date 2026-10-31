import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from '../../mol-plugin-ui/base';
export class CustomToastMessage extends PluginUIComponent {
    render() {
        return _jsxs(_Fragment, { children: ["Custom ", _jsx("i", { children: "Toast" }), " content. No timeout."] });
    }
}
