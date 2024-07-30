"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineGraphComponent = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Paul Luna <paulluna0215@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const point_component_1 = require("./point-component");
const React = tslib_1.__importStar(require("react"));
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const volume_1 = require("../../../mol-model/volume");
const array_1 = require("../../../mol-util/array");
class LineGraphComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = (event) => {
            // TODO: set canSelectMultiple = true
        };
        this.handleKeyUp = (event) => {
            // TODO: SET canSelectMultiple = fasle
        };
        this.handleClick = (id) => (event) => {
            // TODO: add point to selected array
        };
        this.handleMouseDown = (id) => (event) => {
            if (id === 0 || id === this.state.points.length - 1) {
                return;
            }
            if (this.state.canSelectMultiple) {
                return;
            }
            const copyPoint = this.normalizePoint(linear_algebra_1.Vec2.create(this.state.points[id][0], this.state.points[id][1]));
            this.ghostPoints.push(document.createElementNS(this.namespace, 'circle'));
            this.ghostPoints[0].setAttribute('r', '10');
            this.ghostPoints[0].setAttribute('fill', 'orange');
            this.ghostPoints[0].setAttribute('cx', `${copyPoint[0]}`);
            this.ghostPoints[0].setAttribute('cy', `${copyPoint[1]}`);
            this.ghostPoints[0].setAttribute('style', 'display: none');
            this.gElement.appendChild(this.ghostPoints[0]);
            this.updatedX = copyPoint[0];
            this.updatedY = copyPoint[1];
            this.selected = [id];
        };
        this.deletePoint = (i) => (event) => {
            if (i === 0 || i === this.state.points.length - 1) {
                return;
            }
            const points = this.state.points.filter((_, j) => j !== i);
            points.sort((a, b) => {
                if (a[0] === b[0]) {
                    if (a[0] === 0) {
                        return a[1] - b[1];
                    }
                    if (a[1] === 1) {
                        return b[1] - a[1];
                    }
                    return a[1] - b[1];
                }
                return a[0] - b[0];
            });
            this.setState({ points });
            this.change(points);
            event.stopPropagation();
        };
        this.myRef = React.createRef();
        this.state = {
            points: [
                linear_algebra_1.Vec2.create(0, 0),
                linear_algebra_1.Vec2.create(1, 0)
            ],
            copyPoint: undefined,
            canSelectMultiple: false,
        };
        this.height = 400;
        this.width = 600;
        this.padding = 70;
        this.selected = undefined;
        this.ghostPoints = [];
        this.namespace = 'http://www.w3.org/2000/svg';
        for (const point of this.props.data) {
            this.state.points.push(point);
        }
        this.state.points.sort((a, b) => {
            if (a[0] === b[0]) {
                if (a[0] === 0) {
                    return a[1] - b[1];
                }
                if (a[1] === 1) {
                    return b[1] - a[1];
                }
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        this.handleDrag = this.handleDrag.bind(this);
        this.handleMultipleDrag = this.handleMultipleDrag.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.refCallBack = this.refCallBack.bind(this);
        this.handlePointUpdate = this.handlePointUpdate.bind(this);
        this.change = this.change.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }
    render() {
        const points = this.renderPoints();
        const lines = this.renderLines();
        const histogram = this.renderHistogram();
        return ([
            (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("svg", { className: "msp-canvas", ref: this.refCallBack, viewBox: `0 0 ${this.width + this.padding} ${this.height + this.padding}`, onMouseMove: this.handleDrag, onMouseUp: this.handlePointUpdate, onMouseLeave: this.handleLeave, onMouseEnter: this.handleEnter, tabIndex: 0, onKeyDown: this.handleKeyDown, onKeyUp: this.handleKeyUp, onDoubleClick: this.handleDoubleClick, children: [(0, jsx_runtime_1.jsxs)("g", { stroke: "black", fill: "black", children: [histogram, lines, points] }), (0, jsx_runtime_1.jsx)("g", { className: "ghost-points", stroke: "black", fill: "black" })] }) }, "LineGraph"),
            (0, jsx_runtime_1.jsx)("div", { id: "modal-root" }, "modal")
        ]);
    }
    componentDidMount() {
        this.gElement = document.getElementsByClassName('ghost-points')[0];
    }
    change(points) {
        const copyPoints = points.slice();
        copyPoints.shift();
        copyPoints.pop();
        this.props.onChange(copyPoints);
    }
    handleDrag(event) {
        if (this.selected === undefined) {
            return;
        }
        const pt = this.myRef.createSVGPoint();
        let updatedCopyPoint;
        const padding = this.padding / 2;
        pt.x = event.clientX;
        pt.y = event.clientY;
        const svgP = pt.matrixTransform(this.myRef.getScreenCTM().inverse());
        updatedCopyPoint = linear_algebra_1.Vec2.create(svgP.x, svgP.y);
        if ((svgP.x < (padding) || svgP.x > (this.width + (padding))) && (svgP.y > (this.height + (padding)) || svgP.y < (padding))) {
            updatedCopyPoint = linear_algebra_1.Vec2.create(this.updatedX, this.updatedY);
        }
        else if (svgP.x < padding) {
            updatedCopyPoint = linear_algebra_1.Vec2.create(padding, svgP.y);
        }
        else if (svgP.x > (this.width + (padding))) {
            updatedCopyPoint = linear_algebra_1.Vec2.create(this.width + padding, svgP.y);
        }
        else if (svgP.y > (this.height + (padding))) {
            updatedCopyPoint = linear_algebra_1.Vec2.create(svgP.x, this.height + padding);
        }
        else if (svgP.y < (padding)) {
            updatedCopyPoint = linear_algebra_1.Vec2.create(svgP.x, padding);
        }
        else {
            updatedCopyPoint = linear_algebra_1.Vec2.create(svgP.x, svgP.y);
        }
        this.updatedX = updatedCopyPoint[0];
        this.updatedY = updatedCopyPoint[1];
        const unNormalizePoint = this.unNormalizePoint(updatedCopyPoint);
        this.ghostPoints[0].setAttribute('style', 'display: visible');
        this.ghostPoints[0].setAttribute('cx', `${updatedCopyPoint[0]}`);
        this.ghostPoints[0].setAttribute('cy', `${updatedCopyPoint[1]}`);
        this.props.onDrag(unNormalizePoint);
    }
    handleMultipleDrag() {
        // TODO
    }
    handlePointUpdate(event) {
        const selected = this.selected;
        if (this.state.canSelectMultiple) {
            return;
        }
        if (selected === undefined || selected[0] === 0 || selected[0] === this.state.points.length - 1) {
            this.setState({
                copyPoint: undefined,
            });
            return;
        }
        this.selected = undefined;
        const updatedPoint = this.unNormalizePoint(linear_algebra_1.Vec2.create(this.updatedX, this.updatedY));
        const points = this.state.points.filter((_, i) => i !== selected[0]);
        points.push(updatedPoint);
        points.sort((a, b) => {
            if (a[0] === b[0]) {
                if (a[0] === 0) {
                    return a[1] - b[1];
                }
                if (a[1] === 1) {
                    return b[1] - a[1];
                }
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        this.setState({
            points,
        });
        this.change(points);
        this.gElement.innerHTML = '';
        this.ghostPoints = [];
        document.removeEventListener('mousemove', this.handleDrag, true);
        document.removeEventListener('mouseup', this.handlePointUpdate, true);
    }
    handleDoubleClick(event) {
        const pt = this.myRef.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const svgP = pt.matrixTransform(this.myRef.getScreenCTM().inverse());
        const points = this.state.points;
        const padding = this.padding / 2;
        if (svgP.x < (padding) ||
            svgP.x > (this.width + (padding)) ||
            svgP.y > (this.height + (padding)) ||
            svgP.y < (this.padding / 2)) {
            return;
        }
        const newPoint = this.unNormalizePoint(linear_algebra_1.Vec2.create(svgP.x, svgP.y));
        points.push(newPoint);
        points.sort((a, b) => {
            if (a[0] === b[0]) {
                if (a[0] === 0) {
                    return a[1] - b[1];
                }
                if (a[1] === 1) {
                    return b[1] - a[1];
                }
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        this.setState({ points });
        this.change(points);
    }
    handleLeave() {
        if (this.selected === undefined) {
            return;
        }
        document.addEventListener('mousemove', this.handleDrag, true);
        document.addEventListener('mouseup', this.handlePointUpdate, true);
    }
    handleEnter() {
        document.removeEventListener('mousemove', this.handleDrag, true);
        document.removeEventListener('mouseup', this.handlePointUpdate, true);
    }
    normalizePoint(point) {
        const offset = this.padding / 2;
        const maxX = this.width + offset;
        const maxY = this.height + offset;
        const normalizedX = (point[0] * (maxX - offset)) + offset;
        const normalizedY = (point[1] * (maxY - offset)) + offset;
        const reverseY = (this.height + this.padding) - normalizedY;
        const newPoint = linear_algebra_1.Vec2.create(normalizedX, reverseY);
        return newPoint;
    }
    unNormalizePoint(point) {
        const min = this.padding / 2;
        const maxX = this.width + min;
        const maxY = this.height + min;
        const unNormalizedX = (point[0] - min) / (maxX - min);
        // we have to take into account that we reversed y when we first normalized it.
        const unNormalizedY = ((this.height + this.padding) - point[1] - min) / (maxY - min);
        return linear_algebra_1.Vec2.create(unNormalizedX, unNormalizedY);
    }
    refCallBack(element) {
        if (element) {
            this.myRef = element;
        }
    }
    renderHistogram() {
        if (!this.props.volume)
            return null;
        const histogram = volume_1.Grid.getHistogram(this.props.volume.grid, 40);
        const bars = [];
        const N = histogram.counts.length;
        const w = this.width / N;
        const offset = this.padding / 2;
        const max = (0, array_1.arrayMax)(histogram.counts) || 1;
        for (let i = 0; i < N; i++) {
            const x = this.width * i / (N - 1) + offset;
            const y1 = this.height + offset;
            const y2 = this.height * (1 - histogram.counts[i] / max) + offset;
            bars.push((0, jsx_runtime_1.jsx)("line", { x1: x, x2: x, y1: y1, y2: y2, stroke: "#ded9ca", strokeWidth: w }, `histogram${i}`));
        }
        return bars;
    }
    renderPoints() {
        const points = [];
        let point;
        for (let i = 0; i < this.state.points.length; i++) {
            if (i !== 0 && i !== this.state.points.length - 1) {
                point = this.normalizePoint(this.state.points[i]);
                points.push((0, jsx_runtime_1.jsx)(point_component_1.PointComponent, { id: i, x: point[0], y: point[1], nX: this.state.points[i][0], nY: this.state.points[i][1], selected: false, delete: this.deletePoint, onmouseover: this.props.onHover, onmousedown: this.handleMouseDown(i), onclick: this.handleClick(i) }, i));
            }
        }
        return points;
    }
    renderLines() {
        const points = [];
        const lines = [];
        let maxX;
        let maxY;
        let normalizedX;
        let normalizedY;
        let reverseY;
        const o = this.padding / 2;
        for (const point of this.state.points) {
            maxX = this.width + o;
            maxY = this.height + this.padding;
            normalizedX = (point[0] * (maxX - o)) + o;
            normalizedY = (point[1] * (maxY - o)) + o;
            reverseY = this.height + this.padding - normalizedY;
            points.push(linear_algebra_1.Vec2.create(normalizedX, reverseY));
        }
        const data = points;
        const size = data.length;
        for (let i = 0; i < size - 1; i++) {
            const x1 = data[i][0];
            const y1 = data[i][1];
            const x2 = data[i + 1][0];
            const y2 = data[i + 1][1];
            lines.push((0, jsx_runtime_1.jsx)("line", { x1: x1, x2: x2, y1: y1, y2: y2, stroke: "#cec9ba", strokeWidth: "5" }, `lineOf${i}`));
        }
        return lines;
    }
}
exports.LineGraphComponent = LineGraphComponent;
