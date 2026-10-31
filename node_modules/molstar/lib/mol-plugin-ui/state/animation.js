import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from '../base';
import { ParameterControls } from '../controls/parameters';
import { Button } from '../controls/common';
import { PlayArrowSvg } from '../controls/icons';
export class AnimationControls extends PluginUIComponent {
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
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: anim.getParams(), values: anim.state.params, onChange: this.updateParams, isDisabled: isDisabled }), _jsx(ParameterControls, { params: anim.current.params, values: anim.current.paramValues, onChange: this.updateCurrentParams, isDisabled: isDisabled }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { icon: anim.state.animationState !== 'playing' ? void 0 : PlayArrowSvg, onClick: this.startOrStop, disabled: canApply !== void 0 && canApply.canApply === false, children: anim.state.animationState === 'playing' ? 'Stop' : canApply === void 0 || canApply.canApply ? 'Start' : canApply.reason || 'Start' }) })] });
    }
}
