"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpContent = exports.ViewportHelpContent = exports.HelpGroup = exports.HelpText = exports.BindingsHelp = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const React = tslib_1.__importStar(require("react"));
const binding_1 = require("../../mol-util/binding");
const base_1 = require("../base");
const mol_state_1 = require("../../mol-state");
const representation_1 = require("../../mol-plugin/behavior/dynamic/representation");
const representation_2 = require("../../mol-plugin/behavior/dynamic/representation");
const icons_1 = require("../controls/icons");
const common_1 = require("../controls/common");
const memoize_1 = require("../../mol-util/memoize");
function getBindingsList(bindings) {
    return Object.keys(bindings).map(k => [k, bindings[k]]).filter(b => binding_1.Binding.isBinding(b[1]));
}
class BindingsHelp extends React.PureComponent {
    getBindingComponents() {
        const bindingsList = getBindingsList(this.props.bindings);
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: bindingsList.map(value => {
                const [name, binding] = value;
                return !binding_1.Binding.isEmpty(binding)
                    ? (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '6px' }, children: [(0, jsx_runtime_1.jsx)("b", { children: binding.action }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("span", { dangerouslySetInnerHTML: { __html: binding_1.Binding.format(binding, name) } })] }, name)
                    : null;
            }) });
    }
    render() {
        return (0, jsx_runtime_1.jsx)(HelpText, { children: this.getBindingComponents() });
    }
}
exports.BindingsHelp = BindingsHelp;
class HelpText extends React.PureComponent {
    render() {
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-help-text', children: (0, jsx_runtime_1.jsx)("div", { children: this.props.children }) });
    }
}
exports.HelpText = HelpText;
class HelpGroup extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            header: this.props.header,
            isExpanded: !!this.props.initiallyExpanded
        };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-control-group-wrapper', children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-control-group-header', children: (0, jsx_runtime_1.jsxs)(common_1.Button, { onClick: this.toggleExpanded, children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: this.state.isExpanded ? icons_1.ArrowDropDownSvg : icons_1.ArrowRightSvg }), this.props.header] }) }), this.state.isExpanded && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', style: { display: this.state.isExpanded ? 'block' : 'none' }, children: this.props.children })] });
    }
}
exports.HelpGroup = HelpGroup;
function HelpSection(props) {
    return (0, jsx_runtime_1.jsx)("div", { className: 'msp-simple-help-section', children: props.header });
}
class ViewportHelpContent extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.getInteractionBindings = (0, memoize_1.memoizeLatest)((cells) => {
            let interactionBindings = void 0;
            cells.forEach(c => {
                var _a;
                const params = (_a = c.params) === null || _a === void 0 ? void 0 : _a.values;
                if ((params === null || params === void 0 ? void 0 : params.bindings) && Object.keys(params.bindings).length > 0) {
                    if (!interactionBindings)
                        interactionBindings = {};
                    Object.assign(interactionBindings, params.bindings);
                }
            });
            return interactionBindings;
        });
    }
    componentDidMount() {
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
    }
    render() {
        const interactionBindings = this.getInteractionBindings(this.plugin.state.behaviors.cells);
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(!this.props.selectOnly && this.plugin.canvas3d) && (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Moving in 3D', children: (0, jsx_runtime_1.jsx)(BindingsHelp, { bindings: this.plugin.canvas3d.props.trackball.bindings }) }, 'trackball'), !!interactionBindings && (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Mouse & Key Controls', children: (0, jsx_runtime_1.jsx)(BindingsHelp, { bindings: interactionBindings }) }, 'interactions')] });
    }
}
exports.ViewportHelpContent = ViewportHelpContent;
class HelpContent extends base_1.PluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
    }
    formatTriggers(binding) {
        return binding.triggers.map(t => binding_1.Binding.Trigger.format(t)).join(' or ');
    }
    getTriggerFor(transformer, name) {
        const state = this.plugin.state.behaviors;
        const selections = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transformer));
        const params = selections.length === 1 ? selections[0].params : undefined;
        const bindings = params ? params.values.bindings : {};
        const binding = name in bindings ? bindings[name] : binding_1.Binding.Empty;
        return this.formatTriggers(binding);
    }
    render() {
        const selectToggleTriggers = this.getTriggerFor(representation_1.SelectLoci, 'clickSelectToggle');
        const focusTriggers = this.getTriggerFor(representation_2.FocusLoci, 'clickFocus');
        // TODO: interactive help, for example for density
        return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(HelpSection, { header: 'Interface Controls' }), (0, jsx_runtime_1.jsxs)(HelpGroup, { header: 'Inline Help', children: [(0, jsx_runtime_1.jsx)(HelpText, { children: "Many user interface elements show a little questionmark icon when hovered over. Clicking the icon toggles the display of an inline help text." }), (0, jsx_runtime_1.jsx)(HelpText, { children: "Tooltips may provide additional information on a user interface element and are shown when hovering over it with the mouse." })] }), (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Selections', children: (0, jsx_runtime_1.jsxs)(HelpText, { children: ["The viewer allows changing colors and representations for selections of atoms, residues or chains. Selections can be created by", (0, jsx_runtime_1.jsxs)("ul", { style: { paddingLeft: '20px' }, children: [(0, jsx_runtime_1.jsxs)("li", { children: ["picking elements on the 3D canvas or the sequence view using the mouse, e.g. toggle selection using ", selectToggleTriggers, " (for more see help section on ", (0, jsx_runtime_1.jsx)("i", { children: "Mouse Controls" }), ")"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["using the ", (0, jsx_runtime_1.jsx)("i", { children: "Add" }), ", ", (0, jsx_runtime_1.jsx)("i", { children: "Remove" }), " and ", (0, jsx_runtime_1.jsx)("i", { children: "Only" }), " dropdown buttons in the ", (0, jsx_runtime_1.jsx)("i", { children: "Manage Selection" }), " panel which allow modifing the current selection by predefined sets"] })] })] }) }), (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Coloring', children: (0, jsx_runtime_1.jsxs)(HelpText, { children: ["There are two ways to color structures. Every representation (e.g. cartoon or spacefill) has a color theme which can be changed using the dropdown for each representation in the ", (0, jsx_runtime_1.jsx)("i", { children: "Structure Settings" }), " panel. Additionally any selection atoms, residues or chains can by given a custom color. For that, first select the parts of the structure to be colored (see help section on ", (0, jsx_runtime_1.jsx)("i", { children: "Selections" }), ") and, second, choose a color from the color dropdown botton in the ", (0, jsx_runtime_1.jsx)("i", { children: "Selection" }), " row of the ", (0, jsx_runtime_1.jsx)("i", { children: "Change Representation" }), " panel. The theme color can be seen as a base color that is overpainted by the custom color. Custom colors can be removed for a selection with the 'Clear' option in the color dropdown."] }) }), (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Representations', children: (0, jsx_runtime_1.jsxs)(HelpText, { children: ["Structures can be shown with many different representations (e.g. cartoon or spacefill). The ", (0, jsx_runtime_1.jsx)("i", { children: "Change Representation" }), " panel offers a collection of predefined styles which can be applied using the ", (0, jsx_runtime_1.jsx)("i", { children: "Preset" }), " dropdown button. Additionally any selection atoms, residues or chains can by shown with a custom representation. For that, first select the parts of the structure to be mofified (see help section on ", (0, jsx_runtime_1.jsx)("i", { children: "Selections" }), ") and, second, choose a representation to hide or show from the ", (0, jsx_runtime_1.jsx)("i", { children: "Show" }), " and ", (0, jsx_runtime_1.jsx)("i", { children: "Hide" }), " dropdown bottons in the ", (0, jsx_runtime_1.jsx)("i", { children: "Selection" }), " row of the ", (0, jsx_runtime_1.jsx)("i", { children: "Change Representation" }), " panel. The ", (0, jsx_runtime_1.jsx)("i", { children: "Everything" }), " row applies the action to the whole structure instead of the current selection."] }) }), (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Surroundings', children: (0, jsx_runtime_1.jsxs)(HelpText, { children: ["To show the surroundings of a residue or ligand, click it in the 3D scene or in the sequence widget using ", focusTriggers, "."] }) }), (0, jsx_runtime_1.jsx)(HelpSection, { header: 'How-to Guides' }), (0, jsx_runtime_1.jsx)(HelpGroup, { header: 'Create an Image', children: (0, jsx_runtime_1.jsxs)(HelpText, { children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Use the ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.CameraSvg }), " icon in the viewport to bring up the screenshot controls."] }), (0, jsx_runtime_1.jsxs)("p", { children: ["To adjust the size of the image, use the ", (0, jsx_runtime_1.jsx)("i", { children: "Resolution" }), " dropdown."] })] }) }), (0, jsx_runtime_1.jsx)(HelpSection, { header: 'Mouse Controls' }), (0, jsx_runtime_1.jsx)(ViewportHelpContent, {})] });
    }
}
exports.HelpContent = HelpContent;
