import { Vec3 } from '../../..//mol-math/linear-algebra/3d/vec3';
import { PluginContext } from '../../../mol-plugin/context';
import { PrincipalAxes } from '../../../mol-math/linear-algebra/matrix/principal-axes';
import { StructureComponentRef } from '../structure/hierarchy-state';
import { Camera } from '../../../mol-canvas3d/camera';
export declare function pcaFocus(plugin: PluginContext, radius: number, options: {
    principalAxes: PrincipalAxes;
    positionToFlip?: Vec3;
}): Partial<Camera.Snapshot> | undefined;
interface PcaTransformData {
    principalAxes: PrincipalAxes;
    positionToFlip: Vec3;
}
export declare function getPcaTransform(group: StructureComponentRef[]): PcaTransformData | undefined;
export {};
