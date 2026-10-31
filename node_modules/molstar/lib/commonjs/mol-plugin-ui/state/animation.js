"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const base_1 = require("../base");
const parameters_1 = require("../controls/parameters");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
class AnimationControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.updateParams = p => {
            this.plugin.managers.animation.updateParams({ [p.name]: p.value });
        };
        this.updateCurrentParams = p => {
            this.plugin.managers.animation.updateCurrentParams({ [p.name]: p.value });
        };
        this.startOrStop = () => {
            const anim = this.plugin.managers.animation;
            if (anim.state.animationState === 'playing')
                anim.stop();
            else {
                if (this.props.onStart)
                    this.props.onStart();
                anim.start();
            }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.animation.events.updated, () => this.forceUpdate());
    }
    render() {
        var _a, _b;
        const anim = this.plugin.managers.animation;
        if (anim.isEmpty)
            return null;
        const isDisabled = anim.state.animationState === 'playing';
        const canApply = (_b = (_a = anim.current.anim).canApply) === null || _b === void 0 ? void 0 : _b.call(_a, this.plugin);
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: anim.getParams(), values: anim.state.params, onChange: this.updateParams, isDisabled: isDisabled }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: anim.current.params, values: anim.current.paramValues, onChange: this.updateCurrentParams, isDisabled: isDisabled }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { icon: anim.state.animationState !== 'playing' ? void 0 : icons_1.PlayArrowSvg, onClick: this.startOrStop, disabled: canApply !== void 0 && canApply.canApply === false, children: anim.state.animationState === 'playing' ? 'Stop' : canApply === void 0 || canApply.canApply ? 'Start' : canApply.reason || 'Start' }) })] });
    }
}
exports.AnimationControls = AnimationControls;
