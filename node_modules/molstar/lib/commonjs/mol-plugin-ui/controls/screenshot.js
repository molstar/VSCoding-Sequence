"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotPreview = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const React = tslib_1.__importStar(require("react"));
const react_1 = require("react");
const object_1 = require("../../mol-util/object");
const use_behavior_1 = require("../hooks/use-behavior");
const mol_task_1 = require("../../mol-task");
const _ScreenshotPreview = (props) => {
    const { plugin, cropFrameColor } = props;
    const helper = plugin.helpers.viewportScreenshot;
    const [currentCanvas, setCurrentCanvas] = (0, react_1.useState)(null);
    const canvasRef = (0, react_1.useRef)(null);
    const propsRef = (0, react_1.useRef)(props);
    (0, react_1.useEffect)(() => {
        propsRef.current = props;
    }, Object.values(props));
    (0, react_1.useEffect)(() => {
        if (currentCanvas !== canvasRef.current) {
            setCurrentCanvas(canvasRef.current);
        }
    });
    (0, react_1.useEffect)(() => {
        var _a;
        let isDirty = false;
        const subs = [];
        function subscribe(xs, f) {
            if (!xs)
                return;
            subs.push(xs.subscribe(f));
        }
        function preview() {
            const p = propsRef.current;
            if (!p.suspend && canvasRef.current) {
                drawPreview(plugin, helper, canvasRef.current, p.customBackground, p.borderColor, p.borderWidth);
            }
            if (!canvasRef.current)
                isDirty = true;
        }
        const interval = setInterval(() => {
            if (isDirty) {
                isDirty = false;
                preview();
            }
        }, 1000 / 8);
        subscribe(plugin.events.canvas3d.settingsUpdated, () => isDirty = true);
        subscribe((_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.didDraw, () => isDirty = true);
        subscribe(plugin.state.data.behaviors.isUpdating, v => {
            if (!v)
                isDirty = true;
        });
        subscribe(helper === null || helper === void 0 ? void 0 : helper.behaviors.values, () => isDirty = true);
        subscribe(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams, () => isDirty = true);
        let resizeObserver = void 0;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => isDirty = true);
        }
        const canvas = canvasRef.current;
        resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.observe(canvas);
        preview();
        return () => {
            clearInterval(interval);
            subs.forEach(s => s.unsubscribe());
            resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.unobserve(canvas);
        };
    }, [helper]);
    (0, react_1.useLayoutEffect)(() => {
        if (canvasRef.current) {
            drawPreview(plugin, helper, canvasRef.current, props.customBackground, props.borderColor, props.borderWidth);
        }
    }, [...Object.values(props)]);
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', width: '100%', height: '100%' }, children: [(0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef, onContextMenu: e => { e.preventDefault(); e.stopPropagation(); }, style: { display: 'block', width: '100%', height: '100%' } }), (0, jsx_runtime_1.jsx)(ViewportFrame, { plugin: plugin, canvas: currentCanvas, color: cropFrameColor })] }) });
};
exports.ScreenshotPreview = React.memo(_ScreenshotPreview, (prev, next) => (0, object_1.shallowEqual)(prev, next));
async function drawPreview(plugin, helper, target, customBackground, borderColor, borderWidth) {
    const task = mol_task_1.Task.create('Render Screenshot', async (runtime) => {
        if (!helper)
            return;
        const p = await helper.getPreview(runtime);
        if (!p)
            return;
        const ctx = target.getContext('2d');
        if (!ctx)
            return;
        const { canvas, width, height } = p;
        const w = target.clientWidth;
        const h = target.clientHeight;
        target.width = w;
        target.height = h;
        ctx.clearRect(0, 0, w, h);
        const frame = getViewportFrame(width, height, w, h);
        if (customBackground) {
            ctx.fillStyle = customBackground;
            ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
        }
        else if (helper.values.transparent) {
            // must be an odd number
            const s = 13;
            for (let i = 0; i < frame.width; i += s) {
                for (let j = 0; j < frame.height; j += s) {
                    ctx.fillStyle = (i + j) % 2 ? '#ffffff' : '#bfbfbf';
                    const x = frame.x + i, y = frame.y + j;
                    const w = i + s > frame.width ? frame.width - i : s;
                    const h = j + s > frame.height ? frame.height - j : s;
                    ctx.fillRect(x, y, w, h);
                }
            }
        }
        ctx.drawImage(canvas, frame.x, frame.y, frame.width, frame.height);
        if (borderColor && borderWidth) {
            const w = borderWidth;
            ctx.rect(frame.x, frame.y, frame.width, frame.height);
            ctx.rect(frame.x + w, frame.y + w, frame.width - 2 * w, frame.height - 2 * w);
            ctx.fillStyle = borderColor;
            ctx.fill('evenodd');
        }
    });
    return plugin.runTask(task, { useOverlay: true });
}
function ViewportFrame({ plugin, canvas, color = 'rgba(255, 87, 45, 0.75)' }) {
    var _a;
    const helper = plugin.helpers.viewportScreenshot;
    const params = (0, use_behavior_1.useBehavior)(helper === null || helper === void 0 ? void 0 : helper.behaviors.values);
    const cropParams = (0, use_behavior_1.useBehavior)(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams);
    const crop = (0, use_behavior_1.useBehavior)(helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop);
    const cropFrameRef = (0, react_1.useRef)({ x: 0, y: 0, width: 0, height: 0 });
    (0, use_behavior_1.useBehavior)((params === null || params === void 0 ? void 0 : params.resolution.name) === 'viewport' ? (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.resized : void 0);
    const [drag, setDrag] = React.useState('');
    const [start, setStart] = (0, react_1.useState)([0, 0]);
    const [current, setCurrent] = (0, react_1.useState)([0, 0]);
    if (!helper || !canvas || !crop)
        return null;
    const { width, height } = helper.getSizeAndViewport();
    const frame = getViewportFrame(width, height, canvas.clientWidth, canvas.clientHeight);
    const cropFrame = {
        x: frame.x + Math.floor(frame.width * crop.x),
        y: frame.y + Math.floor(frame.height * crop.y),
        width: Math.ceil(frame.width * crop.width),
        height: Math.ceil(frame.height * crop.height)
    };
    const rectCrop = toRect(cropFrame);
    const rectFrame = toRect(frame);
    if (drag === 'move') {
        rectCrop.l += current[0] - start[0];
        rectCrop.r += current[0] - start[0];
        rectCrop.t += current[1] - start[1];
        rectCrop.b += current[1] - start[1];
    }
    else if (drag) {
        if (drag.indexOf('left') >= 0) {
            rectCrop.l += current[0] - start[0];
        }
        else if (drag.indexOf('right') >= 0) {
            rectCrop.r += current[0] - start[0];
        }
        if (drag.indexOf('top') >= 0) {
            rectCrop.t += current[1] - start[1];
        }
        else if (drag.indexOf('bottom') >= 0) {
            rectCrop.b += current[1] - start[1];
        }
    }
    if (rectCrop.l > rectCrop.r) {
        const t = rectCrop.l;
        rectCrop.l = rectCrop.r;
        rectCrop.r = t;
    }
    if (rectCrop.t > rectCrop.b) {
        const t = rectCrop.t;
        rectCrop.t = rectCrop.b;
        rectCrop.b = t;
    }
    const pad = 40;
    rectCrop.l = Math.min(rectFrame.r - pad, Math.max(rectFrame.l, rectCrop.l));
    rectCrop.r = Math.max(rectFrame.l + pad, Math.min(rectFrame.r, rectCrop.r));
    rectCrop.t = Math.min(rectFrame.b - pad, Math.max(rectFrame.t, rectCrop.t));
    rectCrop.b = Math.max(rectFrame.t + pad, Math.min(rectFrame.b, rectCrop.b));
    cropFrame.x = rectCrop.l;
    cropFrame.y = rectCrop.t;
    cropFrame.width = rectCrop.r - rectCrop.l + 1;
    cropFrame.height = rectCrop.b - rectCrop.t + 1;
    cropFrameRef.current = cropFrame;
    const onMove = (e) => {
        e.preventDefault();
        setCurrent([e.pageX, e.pageY]);
    };
    const onTouchMove = (e) => {
        e.preventDefault();
        const t = e.touches[0];
        setCurrent([t.pageX, t.pageY]);
    };
    const onTouchStart = (e) => {
        e.preventDefault();
        setDrag(e.currentTarget.getAttribute('data-drag'));
        const t = e.touches[0];
        const p = [t.pageX, t.pageY];
        setStart(p);
        setCurrent(p);
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchmove', onTouchMove);
    };
    const onStart = (e) => {
        e.preventDefault();
        setDrag(e.currentTarget.getAttribute('data-drag'));
        const p = [e.pageX, e.pageY];
        setStart(p);
        setCurrent(p);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('mousemove', onMove);
    };
    const onEnd = () => {
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('mousemove', onMove);
        finish();
    };
    const onTouchEnd = () => {
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchmove', onTouchMove);
        finish();
    };
    function finish() {
        const cropFrame = cropFrameRef.current;
        if (cropParams === null || cropParams === void 0 ? void 0 : cropParams.auto) {
            helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams.next({ ...cropParams, auto: false });
        }
        helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop.next({
            x: (cropFrame.x - frame.x) / frame.width,
            y: (cropFrame.y - frame.y) / frame.height,
            width: cropFrame.width / frame.width,
            height: cropFrame.height / frame.height
        });
        setDrag('');
        const p = [0, 0];
        setStart(p);
        setCurrent(p);
    }
    const contextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const d = 4;
    const border = `3px solid ${color}`;
    const transparent = 'transparent';
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { "data-drag": 'move', style: { position: 'absolute', left: cropFrame.x, top: cropFrame.y, width: cropFrame.width, height: cropFrame.height, border, cursor: 'move' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'left', style: { position: 'absolute', left: cropFrame.x - d, top: cropFrame.y + d, width: 4 * d, height: cropFrame.height - d, background: transparent, cursor: 'w-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'right', style: { position: 'absolute', left: rectCrop.r - 2 * d, top: cropFrame.y, width: 4 * d, height: cropFrame.height - d, background: transparent, cursor: 'w-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'top', style: { position: 'absolute', left: cropFrame.x - d, top: cropFrame.y - d, width: cropFrame.width + 2 * d, height: 4 * d, background: transparent, cursor: 'n-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'bottom', style: { position: 'absolute', left: cropFrame.x - d, top: rectCrop.b - 2 * d, width: cropFrame.width + 2 * d, height: 4 * d, background: transparent, cursor: 'n-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'top, left', style: { position: 'absolute', left: rectCrop.l - d, top: rectCrop.t - d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'nw-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'bottom, right', style: { position: 'absolute', left: rectCrop.r - 2 * d, top: rectCrop.b - 2 * d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'nw-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'top, right', style: { position: 'absolute', left: rectCrop.r - 2 * d, top: rectCrop.t - d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'ne-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), (0, jsx_runtime_1.jsx)("div", { "data-drag": 'bottom, left', style: { position: 'absolute', left: rectCrop.l - d, top: rectCrop.b - 2 * d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'ne-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu })] });
}
function toRect(viewport) {
    return { l: viewport.x, t: viewport.y, r: viewport.x + viewport.width - 1, b: viewport.y + viewport.height - 1 };
}
function getViewportFrame(srcWidth, srcHeight, w, h) {
    const a0 = srcWidth / srcHeight;
    const a1 = w / h;
    if (a0 <= a1) {
        const t = h * a0;
        return { x: Math.round((w - t) / 2), y: 0, width: Math.round(t), height: h };
    }
    else {
        const t = w / a0;
        return { x: 0, y: Math.round((h - t) / 2), width: w, height: Math.round(t) };
    }
}
