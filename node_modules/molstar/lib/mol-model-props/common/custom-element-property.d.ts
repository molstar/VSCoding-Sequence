/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementIndex, Model } from '../../mol-model/structure';
import { ColorTheme } from '../../mol-theme/color';
import { Color } from '../../mol-util/color';
import { CustomModelProperty } from './custom-model-property';
import { CustomProperty } from './custom-property';
import { LociLabelProvider } from '../../mol-plugin-state/manager/loci-label';
export { CustomElementProperty };
interface CustomElementProperty<T> {
    propertyProvider: CustomModelProperty.Provider<{}, CustomElementProperty.Value<T>>;
    colorThemeProvider?: ColorTheme.Provider<{}>;
    labelProvider?: LociLabelProvider;
}
declare namespace CustomElementProperty {
    type Value<T> = Map<ElementIndex, T>;
    type Data<T> = CustomProperty.Data<Value<T>>;
    interface Builder<T> {
        label: string;
        name: string;
        getData(model: Model, ctx?: CustomProperty.Context): Data<T> | Promise<Data<T>>;
        coloring?: {
            getColor: (p: T) => Color;
            defaultColor: Color;
        };
        getLabel?: (p: T) => string | undefined;
        isApplicable?: (data: Model) => boolean;
        type?: 'dynamic' | 'static';
    }
    function create<T>(builder: Builder<T>): CustomElementProperty<T>;
}
