/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../task';
interface Progress {
    root: Progress.Node;
    canAbort: boolean;
    requestAbort: (reason?: string) => void;
}
declare namespace Progress {
    interface Node {
        readonly progress: Task.Progress;
        readonly children: ReadonlyArray<Node>;
    }
    interface Observer {
        (progress: Progress): void;
    }
    function format(p: Progress): string;
}
export { Progress };
