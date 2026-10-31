import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { Vec2 } from '../../../mol-math/linear-algebra';
export class PointComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show: false };
        this.handleHover = this.handleHover.bind(this);
        this.handleHoverOff = this.handleHoverOff.bind(this);
        this.deletePoint = this.deletePoint.bind(this);
    }
    handleHover() {
        this.setState({ show: true });
        const point = Vec2.create(this.props.nX, this.props.nY);
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
            _jsx("circle", { r: "10", id: `${this.props.id}`, cx: this.props.x, cy: this.props.y, onClick: this.props.onclick, onDoubleClick: this.props.delete(this.props.id), onMouseEnter: this.handleHover, onMouseLeave: this.handleHoverOff, onMouseDown: this.props.onmousedown, fill: "black" }, `${this.props.id}circle`)
        ]);
    }
}
