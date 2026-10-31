/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from './param-definition';
export function Material(values) {
    return { ...Material.Zero, ...values };
}
(function (Material) {
    Material.Zero = { metalness: 0, roughness: 0, bumpiness: 0 };
    function toArray(material, array, offset) {
        array[offset] = material.metalness * 255;
        array[offset + 1] = material.roughness * 255;
        array[offset + 2] = material.bumpiness * 255;
        return array;
    }
    Material.toArray = toArray;
    function toString({ metalness, roughness, bumpiness }) {
        return `M ${metalness.toFixed(2)} | R ${roughness.toFixed(2)} | B ${bumpiness.toFixed(2)}`;
    }
    Material.toString = toString;
    function getParam(info) {
        return PD.Group({
            metalness: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }),
            roughness: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
            bumpiness: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }),
        }, {
            ...info,
            presets: [
                [{ metalness: 0, roughness: 1, bumpiness: 0 }, 'Matte'],
                [{ metalness: 0, roughness: 0.2, bumpiness: 0 }, 'Plastic'],
                [{ metalness: 0, roughness: 0.6, bumpiness: 0 }, 'Glossy'],
                [{ metalness: 1.0, roughness: 0.6, bumpiness: 0 }, 'Metallic'],
            ]
        });
    }
    Material.getParam = getParam;
})(Material || (Material = {}));
