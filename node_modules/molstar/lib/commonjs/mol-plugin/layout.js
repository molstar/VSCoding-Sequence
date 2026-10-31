"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLayout = exports.PluginLayoutStateParams = void 0;
const param_definition_1 = require("../mol-util/param-definition");
const component_1 = require("../mol-plugin-state/component");
const commands_1 = require("./commands");
const regionStateOptions = [
    ['full', 'Full'],
    ['collapsed', 'Collapsed'],
    ['hidden', 'Hidden'],
];
const simpleRegionStateOptions = [
    ['full', 'Full'],
    ['hidden', 'Hidden'],
];
exports.PluginLayoutStateParams = {
    isExpanded: param_definition_1.ParamDefinition.Boolean(false),
    showControls: param_definition_1.ParamDefinition.Boolean(true),
    regionState: param_definition_1.ParamDefinition.Group({
        left: param_definition_1.ParamDefinition.Select('full', regionStateOptions),
        top: param_definition_1.ParamDefinition.Select('full', simpleRegionStateOptions),
        right: param_definition_1.ParamDefinition.Select('full', simpleRegionStateOptions),
        bottom: param_definition_1.ParamDefinition.Select('full', simpleRegionStateOptions),
    }),
    controlsDisplay: param_definition_1.ParamDefinition.Value('outside', { isHidden: true })
};
class PluginLayout extends component_1.StatefulPluginComponent {
    updateProps(state) {
        const prevExpanded = !!this.state.isExpanded;
        this.updateState(state);
        if (this.root && typeof state.isExpanded === 'boolean' && state.isExpanded !== prevExpanded)
            this.handleExpand();
        this.events.updated.next(void 0);
    }
    setProps(props) {
        this.updateState(props);
    }
    setRoot(root) {
        this.root = root;
        if (this.state.isExpanded)
            this.handleExpand();
    }
    getScrollElement() {
        if (document.scrollingElement)
            return document.scrollingElement;
        if (document.documentElement)
            return document.documentElement;
        return document.body;
    }
    handleExpand() {
        try {
            const body = document.getElementsByTagName('body')[0];
            const head = document.getElementsByTagName('head')[0];
            if (!body || !head || !this.root)
                return;
            if (this.state.isExpanded) {
                const children = head.children;
                const viewports = [];
                let hasExp = false;
                for (let i = 0; i < children.length; i++) {
                    if (children[i] === this.expandedViewport) {
                        hasExp = true;
                    }
                    else if ((children[i].name || '').toLowerCase() === 'viewport') {
                        viewports.push(children[i]);
                    }
                }
                for (const v of viewports) {
                    head.removeChild(v);
                }
                if (!hasExp)
                    head.appendChild(this.expandedViewport);
                const s = body.style;
                const doc = this.getScrollElement();
                const scrollLeft = doc.scrollLeft;
                const scrollTop = doc.scrollTop;
                this.rootState = {
                    top: s.top, bottom: s.bottom, right: s.right, left: s.left, scrollTop, scrollLeft, position: s.position, overflow: s.overflow, viewports, zIndex: this.root.style.zIndex,
                    width: s.width, height: s.height,
                    maxWidth: s.maxWidth, maxHeight: s.maxHeight,
                    margin: s.margin, marginLeft: s.marginLeft, marginRight: s.marginRight, marginTop: s.marginTop, marginBottom: s.marginBottom
                };
                s.overflow = 'hidden';
                s.position = 'fixed';
                s.top = '0';
                s.bottom = '0';
                s.right = '0';
                s.left = '0';
                s.width = '100%';
                s.height = '100%';
                s.maxWidth = '100%';
                s.maxHeight = '100%';
                s.margin = '0';
                s.marginLeft = '0';
                s.marginRight = '0';
                s.marginTop = '0';
                s.marginBottom = '0';
                // TODO: setting this breaks viewport controls for some reason. Is there a fix?
                // this.root.style.zIndex = '100000';
            }
            else {
                const children = head.children;
                for (let i = 0; i < children.length; i++) {
                    if (children[i] === this.expandedViewport) {
                        head.removeChild(this.expandedViewport);
                        break;
                    }
                }
                if (this.rootState) {
                    const t = this.rootState;
                    for (const v of t.viewports) {
                        head.appendChild(v);
                    }
                    const s = body.style;
                    s.top = t.top;
                    s.bottom = t.bottom;
                    s.left = t.left;
                    s.right = t.right;
                    s.width = t.width;
                    s.height = t.height;
                    s.maxWidth = t.maxWidth;
                    s.maxHeight = t.maxHeight;
                    s.margin = t.margin;
                    s.marginLeft = t.marginLeft;
                    s.marginRight = t.marginRight;
                    s.marginTop = t.marginTop;
                    s.marginBottom = t.marginBottom;
                    s.position = t.position;
                    s.overflow = t.overflow || '';
                    const doc = this.getScrollElement();
                    doc.scrollTop = t.scrollTop;
                    doc.scrollLeft = t.scrollLeft;
                    this.rootState = void 0;
                    this.root.style.zIndex = t.zIndex;
                }
            }
        }
        catch (e) {
            const msg = 'Layout change error, you might have to reload the page.';
            this.context.log.error(msg);
            console.error(msg, e);
        }
    }
    constructor(context) {
        super({ ...param_definition_1.ParamDefinition.getDefaultValues(exports.PluginLayoutStateParams), ...(context.spec.layout && context.spec.layout.initial) });
        this.context = context;
        this.events = {
            updated: this.ev()
        };
        this.rootState = void 0;
        commands_1.PluginCommands.Layout.Update.subscribe(context, e => this.updateProps(e.state));
        // TODO how best make sure it runs on node.js as well as in the browser?
        if (typeof document !== 'undefined') {
            // <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' />
            this.expandedViewport = document.createElement('meta');
            this.expandedViewport.name = 'viewport';
            this.expandedViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
        }
    }
}
exports.PluginLayout = PluginLayout;
