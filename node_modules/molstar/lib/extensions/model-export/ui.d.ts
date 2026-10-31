/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CollapsableControls, CollapsableState } from '../../mol-plugin-ui/base';
export declare class ModelExportUI extends CollapsableControls<{}, {}> {
    protected defaultState(): CollapsableState;
    protected renderControls(): JSX.Element | null;
}
