/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorList } from './color';
export declare const ColorLists: {
    /**
     * Brewer Color Lists
     *
     * Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The Pennsylvania State University.
     * Licensed under the Apache License, Version 2.0 (the "License");
     */
    'orange-red': ColorList;
    'purple-blue': ColorList;
    'blue-purple': ColorList;
    oranges: ColorList;
    'blue-green': ColorList;
    'yellow-orange-brown': ColorList;
    'yellow-green': ColorList;
    reds: ColorList;
    'red-purple': ColorList;
    greens: ColorList;
    'yellow-green-blue': ColorList;
    purples: ColorList;
    'green-blue': ColorList;
    greys: ColorList;
    'yellow-orange-red': ColorList;
    'purple-red': ColorList;
    blues: ColorList;
    'purple-blue-green': ColorList;
    spectral: ColorList;
    'red-yellow-green': ColorList;
    'red-blue': ColorList;
    'pink-yellow-green': ColorList;
    'purple-green': ColorList;
    'red-yellow-blue': ColorList;
    'brown-white-green': ColorList;
    'red-grey': ColorList;
    'orange-purple': ColorList;
    'set-2': ColorList;
    accent: ColorList;
    'set-1': ColorList;
    'set-3': ColorList;
    'dark-2': ColorList;
    paired: ColorList;
    'pastel-2': ColorList;
    'pastel-1': ColorList;
    'many-distinct': ColorList;
    /**
     * Matplotlib colormaps, including various perceptually uniform shades, see https://bids.github.io/colormap/
     */
    magma: ColorList;
    inferno: ColorList;
    plasma: ColorList;
    viridis: ColorList;
    cividis: ColorList;
    twilight: ColorList;
    /**
     * https://ai.googleblog.com/2019/08/turbo-improved-rainbow-colormap-for.html
     */
    turbo: ColorList;
    /**
     * Other
     */
    rainbow: ColorList;
    'red-white-blue': ColorList;
};
export type ColorListName = keyof typeof ColorLists;
export declare const ColorListNames: string[];
export declare const ColorListOptions: ["orange-red" | "purple-blue" | "blue-purple" | "oranges" | "blue-green" | "yellow-orange-brown" | "yellow-green" | "reds" | "red-purple" | "greens" | "yellow-green-blue" | "purples" | "green-blue" | "greys" | "yellow-orange-red" | "purple-red" | "blues" | "purple-blue-green" | "spectral" | "red-yellow-green" | "red-blue" | "pink-yellow-green" | "purple-green" | "red-yellow-blue" | "brown-white-green" | "red-grey" | "orange-purple" | "set-2" | "accent" | "set-1" | "set-3" | "dark-2" | "paired" | "pastel-2" | "pastel-1" | "many-distinct" | "magma" | "inferno" | "plasma" | "viridis" | "cividis" | "twilight" | "turbo" | "rainbow" | "red-white-blue", string, string][];
export declare const ColorListOptionsScale: ["orange-red" | "purple-blue" | "blue-purple" | "oranges" | "blue-green" | "yellow-orange-brown" | "yellow-green" | "reds" | "red-purple" | "greens" | "yellow-green-blue" | "purples" | "green-blue" | "greys" | "yellow-orange-red" | "purple-red" | "blues" | "purple-blue-green" | "spectral" | "red-yellow-green" | "red-blue" | "pink-yellow-green" | "purple-green" | "red-yellow-blue" | "brown-white-green" | "red-grey" | "orange-purple" | "set-2" | "accent" | "set-1" | "set-3" | "dark-2" | "paired" | "pastel-2" | "pastel-1" | "many-distinct" | "magma" | "inferno" | "plasma" | "viridis" | "cividis" | "twilight" | "turbo" | "rainbow" | "red-white-blue", string, string][];
export declare const ColorListOptionsSet: ["orange-red" | "purple-blue" | "blue-purple" | "oranges" | "blue-green" | "yellow-orange-brown" | "yellow-green" | "reds" | "red-purple" | "greens" | "yellow-green-blue" | "purples" | "green-blue" | "greys" | "yellow-orange-red" | "purple-red" | "blues" | "purple-blue-green" | "spectral" | "red-yellow-green" | "red-blue" | "pink-yellow-green" | "purple-green" | "red-yellow-blue" | "brown-white-green" | "red-grey" | "orange-purple" | "set-2" | "accent" | "set-1" | "set-3" | "dark-2" | "paired" | "pastel-2" | "pastel-1" | "many-distinct" | "magma" | "inferno" | "plasma" | "viridis" | "cividis" | "twilight" | "turbo" | "rainbow" | "red-white-blue", string, string][];
export declare function getColorListFromName(name: ColorListName): ColorList;
