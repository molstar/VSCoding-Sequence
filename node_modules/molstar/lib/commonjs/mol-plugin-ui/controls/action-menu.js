"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMenu = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const React = tslib_1.__importStar(require("react"));
const common_1 = require("./common");
const icons_1 = require("./icons");
class ActionMenu extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.hide = () => this.props.onSelect(void 0);
    }
    render() {
        const cmd = this.props;
        const section = (0, jsx_runtime_1.jsx)(Section, { items: cmd.items, onSelect: cmd.onSelect, current: cmd.current, multiselect: this.props.multiselect, noOffset: this.props.noOffset, noAccent: this.props.noAccent });
        return (0, jsx_runtime_1.jsxs)("div", { className: `msp-action-menu-options${cmd.header ? '' : ' msp-action-menu-options-no-header'}`, children: [cmd.header && (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: cmd.header, title: cmd.title, initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.hide, topRightIcon: icons_1.CloseSvg, children: section }), !cmd.header && section] });
    }
}
exports.ActionMenu = ActionMenu;
(function (ActionMenu) {
    function Header(label, options) {
        return options ? { kind: 'header', label, ...options } : { kind: 'header', label };
    }
    ActionMenu.Header = Header;
    function Item(label, value, options) {
        return { kind: 'item', label, value, ...options };
    }
    ActionMenu.Item = Item;
    function createItems(xs, params) {
        const { label, value, category, selected, icon, addOn, description } = params || {};
        let cats = void 0;
        const items = [];
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            if ((params === null || params === void 0 ? void 0 : params.filter) && !params.filter(x))
                continue;
            const catName = category === null || category === void 0 ? void 0 : category(x);
            const l = label ? label(x) : '' + x;
            const v = value ? value(x) : x;
            const d = description ? description(x) :
                typeof x === 'string' ? x : undefined;
            let cat;
            if (!!catName) {
                if (!cats)
                    cats = new Map();
                cat = cats.get(catName);
                if (!cat) {
                    cat = [ActionMenu.Header(catName, { description: catName })];
                    cats.set(catName, cat);
                    items.push(cat);
                }
            }
            else {
                cat = items;
            }
            const ao = addOn === null || addOn === void 0 ? void 0 : addOn(x);
            cat.push({ kind: 'item', label: l, value: v, icon: icon ? icon(x) : void 0, selected: selected ? selected(x) : void 0, addOn: ao, description: d });
        }
        return items;
    }
    ActionMenu.createItems = createItems;
    const _selectOptions = { value: (o) => o[0], label: (o) => o[1], category: (o) => o[2] };
    function createItemsFromSelectOptions(options, params) {
        return createItems(options, params ? { ..._selectOptions, ...params } : _selectOptions);
    }
    ActionMenu.createItemsFromSelectOptions = createItemsFromSelectOptions;
    function hasSelectedItem(items) {
        if (isHeader(items))
            return false;
        if (isItem(items))
            return !!items.selected;
        for (const s of items) {
            const found = hasSelectedItem(s);
            if (found)
                return true;
        }
        return false;
    }
    ActionMenu.hasSelectedItem = hasSelectedItem;
    function findItem(items, value) {
        if (isHeader(items))
            return;
        if (isItem(items))
            return items.value === value ? items : void 0;
        for (const s of items) {
            const found = findItem(s, value);
            if (found)
                return found;
        }
    }
    ActionMenu.findItem = findItem;
    function getFirstItem(items) {
        if (isHeader(items))
            return;
        if (isItem(items))
            return items;
        for (const s of items) {
            const found = getFirstItem(s);
            if (found)
                return found;
        }
    }
    ActionMenu.getFirstItem = getFirstItem;
    // export type SelectProps<T> = {
    //     items: Items,
    //     onSelect: (item: Item) => void,
    //     disabled?: boolean,
    //     label?: string,
    //     current?: Item,
    //     style?: React.CSSProperties
    // }
    // export class Select<T> extends React.PureComponent<SelectProps<T>, { isExpanded: boolean }> {
    //     state = { isExpanded: false };
    //     toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded })
    //     onSelect: OnSelect = (item) => {
    //         this.setState({ isExpanded: false });
    //         if (!item) return;
    //         this.onSelect(item);
    //     }
    //     render() {
    //         const current = this.props.current;
    //         const label = this.props.label || current?.label || '';
    //         return <div className='msp-action-menu-select' style={this.props.style}>
    //             <ToggleButton disabled={this.props.disabled} style={{ textAlign: 'left' }} className='msp-no-overflow'
    //                 label={label} title={label as string} toggle={this.toggleExpanded} isSelected={this.state.isExpanded} />
    //             {this.state.isExpanded && <ActionMenu items={this.props.items} current={this.props.current} onSelect={this.onSelect} />}
    //         </div>
    //     }
    // }
})(ActionMenu || (exports.ActionMenu = ActionMenu = {}));
class Section extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = Section.createState(this.props);
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
        this.selectAll = () => {
            const items = collectItems(this.props.items, []).filter(i => !i.selected);
            this.props.onSelect(items);
        };
        this.selectNone = () => {
            const items = collectItems(this.props.items, []).filter(i => !!i.selected);
            this.props.onSelect(items);
        };
    }
    static createState(props, isExpanded) {
        const header = isItems(props.items) && isHeader(props.items[0]) ? props.items[0] : void 0;
        const hasCurrent = (header === null || header === void 0 ? void 0 : header.isIndependent)
            ? false
            : props.multiselect
                ? ActionMenu.hasSelectedItem(props.items)
                : (!!props.current && !!ActionMenu.findItem(props.items, props.current.value)) || ActionMenu.hasSelectedItem(props.items);
        return {
            header,
            hasCurrent,
            isExpanded: hasCurrent || (isExpanded !== null && isExpanded !== void 0 ? isExpanded : !!(header === null || header === void 0 ? void 0 : header.initiallyExpanded))
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.items !== prevProps.items || this.props.current !== prevProps.current) {
            // keep previously expanded section if the header label is the same
            const isExpanded = (isItems(this.props.items) && isItems(prevProps.items) &&
                isHeader(this.props.items[0]) && isHeader(prevProps.items[0]) &&
                this.props.items[0].label === prevProps.items[0].label) ? this.state.isExpanded : undefined;
            this.setState(Section.createState(this.props, isExpanded));
        }
    }
    get multiselectHeader() {
        const { header, hasCurrent } = this.state;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row msp-control-group-header', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { icon: this.state.isExpanded ? icons_1.ArrowDropDownSvg : icons_1.ArrowRightSvg, flex: true, noOverflow: true, onClick: this.toggleExpanded, title: `Click to ${this.state.isExpanded ? 'collapse' : 'expand'}.${(header === null || header === void 0 ? void 0 : header.description) ? ` ${header === null || header === void 0 ? void 0 : header.description}` : ''}`, children: hasCurrent ? (0, jsx_runtime_1.jsx)("b", { children: header === null || header === void 0 ? void 0 : header.label }) : header === null || header === void 0 ? void 0 : header.label }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CheckSvg, flex: true, onClick: this.selectAll, style: { flex: '0 0 50px', textAlign: 'right' }, children: "All" }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CloseSvg, flex: true, onClick: this.selectNone, style: { flex: '0 0 50px', textAlign: 'right' }, children: "None" })] });
    }
    get basicHeader() {
        const { header, hasCurrent } = this.state;
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-group-header', style: { marginTop: '1px' }, children: (0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, icon: this.state.isExpanded ? icons_1.ArrowDropDownSvg : icons_1.ArrowRightSvg, onClick: this.toggleExpanded, title: `Click to ${this.state.isExpanded ? 'collapse' : 'expand'}. ${(header === null || header === void 0 ? void 0 : header.description) ? header === null || header === void 0 ? void 0 : header.description : ''}`, children: hasCurrent ? (0, jsx_runtime_1.jsx)("b", { children: header === null || header === void 0 ? void 0 : header.label }) : header === null || header === void 0 ? void 0 : header.label }) });
    }
    render() {
        const { items, onSelect, current } = this.props;
        if (isHeader(items))
            return null;
        if (isItem(items))
            return (0, jsx_runtime_1.jsx)(Action, { item: items, onSelect: onSelect, current: current, multiselect: this.props.multiselect });
        const { header } = this.state;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [header && (this.props.multiselect && this.state.isExpanded ? this.multiselectHeader : this.basicHeader), (0, jsx_runtime_1.jsx)("div", { className: this.props.noOffset ? void 0 : this.props.noAccent ? 'msp-control-offset' : 'msp-accent-offset', children: (!header || this.state.isExpanded) && items.map((x, i) => {
                        if (isHeader(x))
                            return null;
                        if (isItem(x))
                            return (0, jsx_runtime_1.jsx)(Action, { item: x, onSelect: onSelect, current: current, multiselect: this.props.multiselect }, i);
                        return (0, jsx_runtime_1.jsx)(Section, { items: x, onSelect: onSelect, current: current, multiselect: this.props.multiselect, noAccent: true }, i);
                    }) })] });
    }
}
const Action = ({ item, onSelect, current, multiselect }) => {
    const isCurrent = current === item;
    const style = item.addOn ? { position: 'relative' } : void 0;
    return (0, jsx_runtime_1.jsxs)(common_1.Button, { icon: item.icon, noOverflow: true, className: 'msp-action-menu-button', onClick: e => onSelect(multiselect ? [item] : item, e), disabled: item.disabled, style: style, title: item.description, children: [isCurrent || item.selected ? (0, jsx_runtime_1.jsx)("b", { children: item.label }) : item.label, item.addOn] });
};
function isItems(x) {
    return !!x && Array.isArray(x);
}
function isItem(x) {
    const v = x;
    return v && v.kind === 'item';
}
function isHeader(x) {
    const v = x;
    return v && v.kind === 'header';
}
function collectItems(items, target) {
    if (isHeader(items))
        return target;
    if (isItem(items)) {
        target.push(items);
        return target;
    }
    for (const i of items) {
        collectItems(i, target);
    }
    return target;
}
