/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { WebGLContext } from '../../../mol-gl/webgl/context';
import { Shape } from '../../../mol-model/shape';
import { Color } from '../../../mol-util/color';
import { Tunnel } from './data-model';
export declare function createSpheresShape(options: {
    tunnel: Tunnel;
    color: Color;
    resolution: number;
    sampleRate: number;
    showRadii: boolean;
    prev?: Shape<Mesh>;
}): Promise<Shape<Mesh>>;
export declare function createTunnelShape(options: {
    tunnel: Tunnel;
    color: Color;
    resolution: number;
    sampleRate: number;
    webgl: WebGLContext | undefined;
    prev?: Shape<Mesh>;
}): Promise<Shape<Mesh>>;
