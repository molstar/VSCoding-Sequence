import * as React from 'react';
import { Vec2 } from '../../../mol-math/linear-algebra';
interface LineGraphComponentState {
    points: Vec2[];
    copyPoint: any;
    canSelectMultiple: boolean;
}
export declare class LineGraphComponent extends React.Component<any, LineGraphComponentState> {
    private myRef;
    private height;
    private width;
    private padding;
    private updatedX;
    private updatedY;
    private selected?;
    private ghostPoints;
    private gElement;
    private namespace;
    constructor(props: any);
    render(): import("react/jsx-runtime").JSX.Element[];
    componentDidMount(): void;
    private change;
    private handleKeyDown;
    private handleKeyUp;
    private handleClick;
    private handleMouseDown;
    private handleDrag;
    private handleMultipleDrag;
    private handlePointUpdate;
    private handleDoubleClick;
    private deletePoint;
    private handleLeave;
    private handleEnter;
    private normalizePoint;
    private unNormalizePoint;
    private refCallBack;
    private renderHistogram;
    private renderPoints;
    private renderLines;
}
export {};
