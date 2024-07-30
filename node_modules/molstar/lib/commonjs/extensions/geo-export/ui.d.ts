/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
import { CollapsableControls, CollapsableState } from '../../mol-plugin-ui/base';
import { GeometryControls } from './controls';
interface State {
    busy?: boolean;
}
export declare class GeometryExporterUI extends CollapsableControls<{}, State> {
    private _controls;
    private isARSupported;
    get controls(): GeometryControls;
    protected defaultState(): State & CollapsableState;
    protected renderControls(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    save: () => Promise<void>;
    viewInAR: () => Promise<void>;
}
export {};
