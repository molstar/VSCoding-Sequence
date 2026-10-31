"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointComponent = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const React = tslib_1.__importStar(require("react"));
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
class PointComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show: false };
        this.handleHover = this.handleHover.bind(this);
        this.handleHoverOff = this.handleHoverOff.bind(this);
        this.deletePoint = this.deletePoint.bind(this);
    }
    handleHover() {
        this.setState({ show: true });
        const point = linear_algebra_1.Vec2.create(this.props.nX, this.props.nY);
        this.props.onmouseover(point);
    }
    handleHoverOff() {
        this.setState({ show: false });
        this.props.onmouseover(undefined);
    }
    deletePoint() {
        this.props.delete(this.props.id);
    }
    render() {
        return ([
            (0, jsx_runtime_1.jsx)("circle", { r: "10", id: `${this.props.id}`, cx: this.props.x, cy: this.props.y, onClick: this.props.onclick, onDoubleClick: this.props.delete(this.props.id), onMouseEnter: this.handleHover, onMouseLeave: this.handleHoverOff, onMouseDown: this.props.onmousedown, fill: "black" }, `${this.props.id}circle`)
        ]);
    }
}
exports.PointComponent = PointComponent;
