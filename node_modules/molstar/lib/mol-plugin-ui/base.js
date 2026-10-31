import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Button } from './controls/common';
import { Icon, ArrowRightSvg, ArrowDropDownSvg } from './controls/icons';
export const PluginReactContext = React.createContext(void 0);
export class PluginUIComponent extends React.Component {
    subscribe(obs, action) {
        if (typeof this.subs === 'undefined')
            this.subs = [];
        this.subs.push(obs.subscribe(action));
    }
    componentWillUnmount() {
        if (!this.subs)
            return;
        for (const s of this.subs)
            s.unsubscribe();
        this.subs = void 0;
    }
    constructor(props, context) {
        super(props);
        this.subs = void 0;
        this.plugin = context;
        if (this.init)
            this.init();
    }
}
PluginUIComponent.contextType = PluginReactContext;
export class PurePluginUIComponent extends React.PureComponent {
    subscribe(obs, action) {
        if (typeof this.subs === 'undefined')
            this.subs = [];
        this.subs.push(obs.subscribe(action));
    }
    componentWillUnmount() {
        if (!this.subs)
            return;
        for (const s of this.subs)
            s.unsubscribe();
        this.subs = void 0;
    }
    constructor(props, context) {
        super(props, context);
        this.subs = void 0;
        this.plugin = context;
        if (this.init)
            this.init();
    }
}
PurePluginUIComponent.contextType = PluginReactContext;
export class CollapsableControls extends PluginUIComponent {
    toggleCollapsed() {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }
    ;
    componentDidUpdate(prevProps) {
        if (this.props.initiallyCollapsed !== undefined && prevProps.initiallyCollapsed !== this.props.initiallyCollapsed) {
            this.setState({ isCollapsed: this.props.initiallyCollapsed });
        }
    }
    render() {
        var _a;
        if (this.state.isHidden)
            return null;
        const divid = this.state.header.toLowerCase().replace(/\s/g, '');
        const wrapClass = this.state.isCollapsed
            ? 'msp-transform-wrapper msp-transform-wrapper-collapsed'
            : 'msp-transform-wrapper';
        return _jsxs("div", { className: wrapClass, children: [_jsx("div", { id: divid, className: 'msp-transform-header', children: _jsxs(Button, { icon: this.state.brand ? void 0 : this.state.isCollapsed ? ArrowRightSvg : ArrowDropDownSvg, noOverflow: true, onClick: () => this.toggleCollapsed(), className: this.state.brand ? `msp-transform-header-brand msp-transform-header-brand-${this.state.brand.accent}` : void 0, title: `Click to ${this.state.isCollapsed ? 'expand' : 'collapse'}`, children: [_jsx(Icon, { svg: (_a = this.state.brand) === null || _a === void 0 ? void 0 : _a.svg, inline: true }), this.state.header, _jsx("small", { style: { margin: '0 6px' }, children: this.state.isCollapsed ? '' : this.state.description })] }) }), !this.state.isCollapsed && this.renderControls()] });
    }
    constructor(props, context) {
        super(props, context);
        const state = this.defaultState();
        if (props.initiallyCollapsed !== undefined)
            state.isCollapsed = props.initiallyCollapsed;
        if (props.header !== undefined)
            state.header = props.header;
        this.state = state;
    }
}
