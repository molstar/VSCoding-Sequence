"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliderBase = exports.Handle = exports.Slider2 = exports.Slider = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const React = tslib_1.__importStar(require("react"));
const common_1 = require("./common");
const mol_util_1 = require("../../mol-util");
class Slider extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { isChanging: false, current: 0 };
        this.begin = () => {
            this.setState({ isChanging: true });
        };
        this.end = (v) => {
            this.setState({ isChanging: false });
            this.props.onChange(v);
        };
        this.updateCurrent = (current) => {
            var _a, _b;
            this.setState({ current });
            (_b = (_a = this.props).onChangeImmediate) === null || _b === void 0 ? void 0 : _b.call(_a, current);
        };
        this.updateManually = (v) => {
            this.setState({ isChanging: true });
            let n = v;
            if (this.props.step === 1)
                n = Math.round(n);
            if (n < this.props.min)
                n = this.props.min;
            if (n > this.props.max)
                n = this.props.max;
            this.setState({ current: n, isChanging: true });
        };
        this.onManualBlur = () => {
            this.setState({ isChanging: false });
            this.props.onChange(this.state.current);
        };
    }
    static getDerivedStateFromProps(props, state) {
        if (state.isChanging || props.value === state.current)
            return null;
        return { current: props.value };
    }
    render() {
        let step = this.props.step;
        if (step === void 0)
            step = 1;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-slider', children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(SliderBase, { min: this.props.min, max: this.props.max, step: step, value: this.state.current, disabled: this.props.disabled, onBeforeChange: this.begin, onChange: this.updateCurrent, onAfterChange: this.end }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(common_1.TextInput, { numeric: true, delayMs: 50, value: this.state.current, blurOnEnter: true, onBlur: this.onManualBlur, isDisabled: this.props.disabled, onChange: this.updateManually }) })] });
    }
}
exports.Slider = Slider;
class Slider2 extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { isChanging: false, current: [0, 1] };
        this.begin = () => {
            this.setState({ isChanging: true });
        };
        this.end = (v) => {
            this.setState({ isChanging: false });
            this.props.onChange(v);
        };
        this.updateCurrent = (current) => {
            this.setState({ current });
        };
        this.updateMax = (v) => {
            let n = v;
            if (this.props.step === 1)
                n = Math.round(n);
            if (n < this.state.current[0])
                n = this.state.current[0];
            else if (n < this.props.min)
                n = this.props.min;
            if (n > this.props.max)
                n = this.props.max;
            this.props.onChange([this.state.current[0], n]);
        };
        this.updateMin = (v) => {
            let n = v;
            if (this.props.step === 1)
                n = Math.round(n);
            if (n < this.props.min)
                n = this.props.min;
            if (n > this.state.current[1])
                n = this.state.current[1];
            else if (n > this.props.max)
                n = this.props.max;
            this.props.onChange([n, this.state.current[1]]);
        };
    }
    static getDerivedStateFromProps(props, state) {
        if (state.isChanging || (props.value[0] === state.current[0] && props.value[1] === state.current[1]))
            return null;
        return { current: props.value };
    }
    render() {
        let step = this.props.step;
        if (step === void 0)
            step = 1;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-slider2', children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(common_1.TextInput, { numeric: true, delayMs: 50, value: this.state.current[0], onEnter: this.props.onEnter, blurOnEnter: true, isDisabled: this.props.disabled, onChange: this.updateMin }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(SliderBase, { min: this.props.min, max: this.props.max, step: step, value: this.state.current, disabled: this.props.disabled, onBeforeChange: this.begin, onChange: this.updateCurrent, onAfterChange: this.end, range: true, allowCross: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(common_1.TextInput, { numeric: true, delayMs: 50, value: this.state.current[1], onEnter: this.props.onEnter, blurOnEnter: true, isDisabled: this.props.disabled, onChange: this.updateMax }) })] });
    }
}
exports.Slider2 = Slider2;
/**
 * The following code was adapted from react-components/slider library.
 *
 * The MIT License (MIT)
 * Copyright (c) 2015-present Alipay.com, https://www.alipay.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function classNames(_classes) {
    const classes = [];
    const hasOwn = {}.hasOwnProperty;
    for (let i = 0; i < arguments.length; i++) {
        const arg = arguments[i];
        if (!arg)
            continue;
        const argType = typeof arg;
        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        }
        else if (Array.isArray(arg)) {
            classes.push(classNames.apply(null, arg));
        }
        else if (argType === 'object') {
            for (const key in arg) {
                if (hasOwn.call(arg, key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }
    return classes.join(' ');
}
function isNotTouchEvent(e) {
    return e.touches.length > 1 || (e.type.toLowerCase() === 'touchend' && e.touches.length > 0);
}
function getTouchPosition(vertical, e) {
    return vertical ? e.touches[0].clientY : e.touches[0].pageX;
}
function getMousePosition(vertical, e) {
    return vertical ? e.clientY : e.pageX;
}
function getHandleCenterPosition(vertical, handle) {
    const coords = handle.getBoundingClientRect();
    return vertical ?
        coords.top + (coords.height * 0.5) :
        coords.left + (coords.width * 0.5);
}
function pauseEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}
class Handle extends React.Component {
    render() {
        const { className, tipFormatter, vertical, offset, value, index, } = this.props;
        const style = vertical ? { bottom: `${offset}%` } : { left: `${offset}%` };
        return ((0, jsx_runtime_1.jsx)("div", { className: className, style: style, title: tipFormatter(value, index) }));
    }
}
exports.Handle = Handle;
class SliderBase extends React.Component {
    constructor(props) {
        super(props);
        this.sliderElement = React.createRef();
        this.handleElements = [];
        this.dragOffset = 0;
        this.startPosition = 0;
        this.startValue = 0;
        this._getPointsCache = void 0;
        this.onMouseDown = (e) => {
            if (e.button !== 0) {
                return;
            }
            let position = getMousePosition(this.props.vertical, e);
            if (!this.isEventFromHandle(e)) {
                this.dragOffset = 0;
            }
            else {
                const handlePosition = getHandleCenterPosition(this.props.vertical, e.target);
                this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            this.onStart(position);
            this.addDocumentEvents('mouse');
            pauseEvent(e);
        };
        this.onTouchMove = (e) => {
            if (isNotTouchEvent(e)) {
                this.end('touch');
                return;
            }
            const position = getTouchPosition(this.props.vertical, e);
            this.onMove(e, position - this.dragOffset);
        };
        this.onTouchStart = (e) => {
            if (isNotTouchEvent(e))
                return;
            let position = getTouchPosition(this.props.vertical, e);
            if (!this.isEventFromHandle(e)) {
                this.dragOffset = 0;
            }
            else {
                const handlePosition = getHandleCenterPosition(this.props.vertical, e.target);
                this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            this.onStart(position);
            this.addDocumentEvents('touch');
            pauseEvent(e);
        };
        this.eventHandlers = {
            'touchmove': (e) => this.onTouchMove(e),
            'touchend': (e) => this.end('touch'),
            'mousemove': (e) => this.onMouseMove(e),
            'mouseup': (e) => this.end('mouse'),
        };
        this.calcOffset = (value) => {
            const { min, max } = this.props;
            const ratio = (value - min) / (max - min);
            return ratio * 100;
        };
        const { range, min, max } = props;
        const initialValue = range ? Array.apply(null, Array(+range + 1)).map(() => min) : min;
        const defaultValue = ('defaultValue' in props ? props.defaultValue : initialValue);
        const value = (props.value !== undefined ? props.value : defaultValue);
        const bounds = (range ? value : [min, value]).map((v) => this.trimAlignValue(v));
        let recent;
        if (range && bounds[0] === bounds[bounds.length - 1] && bounds[0] === max) {
            recent = 0;
        }
        else {
            recent = bounds.length - 1;
        }
        this.state = {
            handle: null,
            recent,
            bounds,
        };
    }
    componentDidUpdate(prevProps) {
        if (!('value' in this.props || 'min' in this.props || 'max' in this.props))
            return;
        const { bounds } = this.state;
        if (prevProps.range) {
            const value = this.props.value || bounds;
            const nextBounds = value.map((v) => this.trimAlignValue(v, this.props));
            if (nextBounds.every((v, i) => v === bounds[i]))
                return;
            this.setState({ bounds: nextBounds });
            if (bounds.some(v => this.isValueOutOfBounds(v, this.props))) {
                this.props.onChange(nextBounds);
            }
        }
        else {
            const value = this.props.value !== undefined ? this.props.value : bounds[1];
            const nextValue = this.trimAlignValue(value, this.props);
            if (nextValue === bounds[1] && bounds[0] === prevProps.min)
                return;
            this.setState({ bounds: [prevProps.min, nextValue] });
            if (this.isValueOutOfBounds(bounds[1], this.props)) {
                this.props.onChange(nextValue);
            }
        }
    }
    onChange(state) {
        const props = this.props;
        const isNotControlled = !('value' in props);
        if (isNotControlled) {
            this.setState(state);
        }
        else if (state.handle !== undefined) {
            this.setState({ handle: state.handle });
        }
        const data = { ...this.state, ...state };
        const changedValue = props.range ? data.bounds : data.bounds[1];
        props.onChange(changedValue);
    }
    onMouseMove(e) {
        const position = getMousePosition(this.props.vertical, e);
        this.onMove(e, position - this.dragOffset);
    }
    onMove(e, position) {
        pauseEvent(e);
        const props = this.props;
        const state = this.state;
        let diffPosition = position - this.startPosition;
        diffPosition = this.props.vertical ? -diffPosition : diffPosition;
        const diffValue = diffPosition / this.getSliderLength() * (props.max - props.min);
        const value = this.trimAlignValue(this.startValue + diffValue);
        const oldValue = state.bounds[state.handle];
        if (value === oldValue)
            return;
        const nextBounds = [...state.bounds];
        nextBounds[state.handle] = value;
        let nextHandle = state.handle;
        if (!!props.pushable) {
            const originalValue = state.bounds[nextHandle];
            this.pushSurroundingHandles(nextBounds, nextHandle, originalValue);
        }
        else if (props.allowCross) {
            nextBounds.sort((a, b) => a - b);
            nextHandle = nextBounds.indexOf(value);
        }
        this.onChange({
            handle: nextHandle,
            bounds: nextBounds,
        });
    }
    onStart(position) {
        const props = this.props;
        props.onBeforeChange(this.getValue());
        const value = this.calcValueByPos(position);
        this.startValue = value;
        this.startPosition = position;
        const state = this.state;
        const { bounds } = state;
        let valueNeedChanging = 1;
        if (this.props.range) {
            let closestBound = 0;
            for (let i = 1; i < bounds.length - 1; ++i) {
                if (value > bounds[i]) {
                    closestBound = i;
                }
            }
            if (Math.abs(bounds[closestBound + 1] - value) < Math.abs(bounds[closestBound] - value)) {
                closestBound = closestBound + 1;
            }
            valueNeedChanging = closestBound;
            const isAtTheSamePoint = (bounds[closestBound + 1] === bounds[closestBound]);
            if (isAtTheSamePoint) {
                valueNeedChanging = state.recent;
            }
            if (isAtTheSamePoint && (value !== bounds[closestBound + 1])) {
                valueNeedChanging = value < bounds[closestBound + 1] ? closestBound : closestBound + 1;
            }
        }
        this.setState({
            handle: valueNeedChanging,
            recent: valueNeedChanging,
        });
        const oldValue = state.bounds[valueNeedChanging];
        if (value === oldValue)
            return;
        const nextBounds = [...state.bounds];
        nextBounds[valueNeedChanging] = value;
        this.onChange({ bounds: nextBounds });
    }
    /**
     * Returns an array of possible slider points, taking into account both
     * `marks` and `step`. The result is cached.
     */
    getPoints() {
        const { marks, step, min, max } = this.props;
        const cache = this._getPointsCache;
        if (!cache || cache.marks !== marks || cache.step !== step) {
            const pointsObject = { ...marks };
            if (step !== null) {
                for (let point = min; point <= max; point += step) {
                    pointsObject[point] = point;
                }
            }
            const points = Object.keys(pointsObject).map(parseFloat);
            points.sort((a, b) => a - b);
            this._getPointsCache = { marks, step, points };
        }
        return this._getPointsCache.points;
    }
    getPrecision(step) {
        const stepString = step.toString();
        let precision = 0;
        if (stepString.indexOf('.') >= 0) {
            precision = stepString.length - stepString.indexOf('.') - 1;
        }
        return precision;
    }
    getSliderLength() {
        const slider = this.sliderElement.current;
        if (!slider) {
            return 0;
        }
        return this.props.vertical ? slider.clientHeight : slider.clientWidth;
    }
    getSliderStart() {
        const slider = this.sliderElement.current;
        const rect = slider.getBoundingClientRect();
        return this.props.vertical ? rect.top : rect.left;
    }
    getValue() {
        const { bounds } = this.state;
        return (this.props.range ? bounds : bounds[1]);
    }
    addDocumentEvents(type) {
        if (type === 'touch') {
            document.addEventListener('touchmove', this.eventHandlers.touchmove);
            document.addEventListener('touchend', this.eventHandlers.touchend);
        }
        else if (type === 'mouse') {
            document.addEventListener('mousemove', this.eventHandlers.mousemove);
            document.addEventListener('mouseup', this.eventHandlers.mouseup);
        }
    }
    calcValue(offset) {
        const { vertical, min, max } = this.props;
        const ratio = Math.abs(offset / this.getSliderLength());
        const value = vertical ? (1 - ratio) * (max - min) + min : ratio * (max - min) + min;
        return value;
    }
    calcValueByPos(position) {
        const pixelOffset = position - this.getSliderStart();
        const nextValue = this.trimAlignValue(this.calcValue(pixelOffset));
        return nextValue;
    }
    end(type) {
        this.removeEvents(type);
        this.props.onAfterChange(this.getValue());
        this.setState({ handle: null });
    }
    isEventFromHandle(e) {
        for (const h of this.handleElements) {
            if (h.current === e.target)
                return true;
        }
        return false;
    }
    isValueOutOfBounds(value, props) {
        return value < props.min || value > props.max;
    }
    pushHandle(bounds, handle, direction, amount) {
        const originalValue = bounds[handle];
        let currentValue = bounds[handle];
        while (direction * (currentValue - originalValue) < amount) {
            if (!this.pushHandleOnePoint(bounds, handle, direction)) {
                // can't push handle enough to create the needed `amount` gap, so we
                // revert its position to the original value
                bounds[handle] = originalValue;
                return false;
            }
            currentValue = bounds[handle];
        }
        // the handle was pushed enough to create the needed `amount` gap
        return true;
    }
    pushHandleOnePoint(bounds, handle, direction) {
        const points = this.getPoints();
        const pointIndex = points.indexOf(bounds[handle]);
        const nextPointIndex = pointIndex + direction;
        if (nextPointIndex >= points.length || nextPointIndex < 0) {
            // reached the minimum or maximum available point, can't push anymore
            return false;
        }
        const nextHandle = handle + direction;
        const nextValue = points[nextPointIndex];
        const { pushable: threshold } = this.props;
        const diffToNext = direction * (bounds[nextHandle] - nextValue);
        if (!this.pushHandle(bounds, nextHandle, direction, +threshold - diffToNext)) {
            // couldn't push next handle, so we won't push this one either
            return false;
        }
        // push the handle
        bounds[handle] = nextValue;
        return true;
    }
    pushSurroundingHandles(bounds, handle, originalValue) {
        const { pushable: threshold } = this.props;
        const value = bounds[handle];
        let direction = 0;
        if (bounds[handle + 1] - value < +threshold) {
            direction = +1;
        }
        else if (value - bounds[handle - 1] < +threshold) {
            direction = -1;
        }
        if (direction === 0) {
            return;
        }
        const nextHandle = handle + direction;
        const diffToNext = direction * (bounds[nextHandle] - value);
        if (!this.pushHandle(bounds, nextHandle, direction, +threshold - diffToNext)) {
            // revert to original value if pushing is impossible
            bounds[handle] = originalValue;
        }
    }
    removeEvents(type) {
        if (type === 'touch') {
            document.removeEventListener('touchmove', this.eventHandlers.touchmove);
            document.removeEventListener('touchend', this.eventHandlers.touchend);
        }
        else if (type === 'mouse') {
            document.removeEventListener('mousemove', this.eventHandlers.mousemove);
            document.removeEventListener('mouseup', this.eventHandlers.mouseup);
        }
    }
    trimAlignValue(v, props) {
        const { handle, bounds } = (this.state || {});
        const { marks, step, min, max, allowCross } = { ...this.props, ...(props || {}) };
        let val = v;
        if (val <= min) {
            val = min;
        }
        if (val >= max) {
            val = max;
        }
        /* eslint-disable eqeqeq */
        if (!allowCross && handle != null && handle > 0 && val <= bounds[handle - 1]) {
            val = bounds[handle - 1];
        }
        if (!allowCross && handle != null && handle < bounds.length - 1 && val >= bounds[handle + 1]) {
            val = bounds[handle + 1];
        }
        /* eslint-enable eqeqeq */
        const points = Object.keys(marks).map(parseFloat);
        if (step !== null) {
            const closestStep = (Math.round((val - min) / step) * step) + min;
            points.push(closestStep);
        }
        const diffs = points.map((point) => Math.abs(val - point));
        const closestPoint = points[diffs.indexOf(Math.min.apply(Math, diffs))];
        return step !== null ? parseFloat(closestPoint.toFixed(this.getPrecision(step))) : closestPoint;
    }
    render() {
        const { handle, bounds, } = this.state;
        const { className, prefixCls, disabled, vertical, range, step, marks, tipFormatter } = this.props;
        const customHandle = this.props.handle;
        const offsets = bounds.map(this.calcOffset);
        const handleClassName = `${prefixCls}-handle`;
        const handlesClassNames = bounds.map((v, i) => classNames({
            [handleClassName]: true,
            [`${handleClassName}-${i + 1}`]: true,
            [`${handleClassName}-lower`]: i === 0,
            [`${handleClassName}-upper`]: i === bounds.length - 1,
        }));
        const isNoTip = (step === null) || (tipFormatter === null);
        const commonHandleProps = {
            prefixCls,
            noTip: isNoTip,
            tipFormatter,
            vertical,
        };
        if (this.handleElements.length !== bounds.length) {
            this.handleElements = []; // = [];
            for (let i = 0; i < bounds.length; i++)
                this.handleElements.push(React.createRef());
        }
        const handles = bounds.map((v, i) => React.cloneElement(customHandle, {
            ...commonHandleProps,
            className: handlesClassNames[i],
            value: v,
            offset: offsets[i],
            dragging: handle === i,
            index: i,
            key: i,
            ref: this.handleElements[i]
        }));
        if (!range) {
            handles.shift();
        }
        const sliderClassName = classNames({
            [prefixCls]: true,
            [`${prefixCls}-with-marks`]: Object.keys(marks).length,
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-vertical`]: this.props.vertical,
            [className]: !!className,
        });
        return ((0, jsx_runtime_1.jsxs)("div", { ref: this.sliderElement, className: sliderClassName, onTouchStart: disabled ? mol_util_1.noop : this.onTouchStart, onMouseDown: disabled ? mol_util_1.noop : this.onMouseDown, children: [(0, jsx_runtime_1.jsx)("div", { className: `${prefixCls}-rail` }), handles] }));
    }
}
exports.SliderBase = SliderBase;
SliderBase.defaultProps = {
    prefixCls: 'msp-slider-base',
    className: '',
    min: 0,
    max: 100,
    step: 1,
    marks: {},
    handle: (0, jsx_runtime_1.jsx)(Handle, { className: '', vertical: false, offset: 0, tipFormatter: v => v, value: 0, index: 0 }),
    onBeforeChange: mol_util_1.noop,
    onChange: mol_util_1.noop,
    onAfterChange: mol_util_1.noop,
    tipFormatter: (value, index) => value,
    disabled: false,
    range: false,
    vertical: false,
    allowCross: true,
    pushable: false,
};
