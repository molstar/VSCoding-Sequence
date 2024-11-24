"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mp4Controls = exports.Mp4AnimationParams = void 0;
const operators_1 = require("rxjs/operators");
const component_1 = require("../../mol-plugin-state/component");
const mol_task_1 = require("../../mol-task");
const param_definition_1 = require("../../mol-util/param-definition");
const encoder_1 = require("./encoder");
exports.Mp4AnimationParams = {
    quantization: param_definition_1.ParamDefinition.Numeric(18, { min: 10, max: 51 }, { description: 'Lower is better, but slower.' })
};
class Mp4Controls extends component_1.PluginComponent {
    setCurrent(name) {
        var _a, _b;
        const anim = this.animations.find(a => a.name === name);
        if (!anim) {
            this.behaviors.current.next(anim);
            return;
        }
        const params = anim.params(this.plugin);
        const values = param_definition_1.ParamDefinition.getDefaultValues(params);
        this.behaviors.current.next({ anim, params, values });
        this.behaviors.canApply.next((_b = (_a = anim.canApply) === null || _a === void 0 ? void 0 : _a.call(anim, this.plugin)) !== null && _b !== void 0 ? _b : { canApply: true });
    }
    setCurrentParams(values) {
        this.behaviors.current.next({ ...this.behaviors.current.value, values });
    }
    get current() {
        return this.behaviors.current.value;
    }
    render() {
        const task = mol_task_1.Task.create('Export Animation', async (ctx) => {
            var _a, _b, _c;
            try {
                const resolution = (_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.getSizeAndViewport();
                const anim = this.current;
                const movie = await (0, encoder_1.encodeMp4Animation)(this.plugin, ctx, {
                    animation: {
                        definition: anim.anim,
                        params: anim.values,
                    },
                    ...resolution,
                    quantizationParameter: this.behaviors.params.value.quantization,
                    pass: (_b = this.plugin.helpers.viewportScreenshot) === null || _b === void 0 ? void 0 : _b.imagePass,
                });
                const filename = anim.anim.display.name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9_\-]/g, '');
                return { movie, filename: `${(_c = this.plugin.helpers.viewportScreenshot) === null || _c === void 0 ? void 0 : _c.getFilename('')}_${filename}.mp4` };
            }
            catch (e) {
                this.plugin.log.error('Error during animation export');
                throw e;
            }
        });
        return this.plugin.runTask(task, { useOverlay: true });
    }
    get manager() {
        return this.plugin.managers.animation;
    }
    syncInfo() {
        const helper = this.plugin.helpers.viewportScreenshot;
        const size = helper === null || helper === void 0 ? void 0 : helper.getSizeAndViewport();
        if (!size)
            return;
        this.behaviors.info.next({ width: size.viewport.width, height: size.viewport.height });
    }
    sync() {
        var _a, _b;
        const animations = this.manager.animations.filter(a => a.isExportable);
        const hasAll = animations.every(a => this.currentNames.has(a.name));
        if (hasAll && this.currentNames.size === animations.length) {
            return;
        }
        const params = {
            current: param_definition_1.ParamDefinition.Select((_a = animations[0]) === null || _a === void 0 ? void 0 : _a.name, animations.map(a => [a.name, a.display.name]), { label: 'Animation' })
        };
        const current = this.behaviors.current.value;
        const hasCurrent = !!animations.find(a => a.name === (current === null || current === void 0 ? void 0 : current.anim.name));
        this.animations = animations;
        if (!hasCurrent) {
            this.setCurrent((_b = animations[0]) === null || _b === void 0 ? void 0 : _b.name);
        }
        this.behaviors.animations.next(params);
    }
    init() {
        var _a;
        if (!this.plugin.canvas3d)
            return;
        this.subscribe(this.plugin.managers.animation.events.updated.pipe((0, operators_1.debounceTime)(16)), () => {
            this.sync();
        });
        this.subscribe(this.plugin.canvas3d.resized, () => this.syncInfo());
        this.subscribe((_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.events.previewed, () => this.syncInfo());
        this.subscribe(this.plugin.behaviors.state.isBusy, b => this.updateCanApply(b));
        this.subscribe(this.plugin.managers.snapshot.events.changed, b => this.updateCanApply(b));
        this.sync();
        this.syncInfo();
    }
    updateCanApply(b) {
        var _a, _b, _c;
        const anim = this.current;
        if (!b && anim) {
            this.behaviors.canApply.next((_c = (_b = (_a = anim.anim).canApply) === null || _b === void 0 ? void 0 : _b.call(_a, this.plugin)) !== null && _c !== void 0 ? _c : { canApply: true });
        }
    }
    constructor(plugin) {
        super();
        this.plugin = plugin;
        this.currentNames = new Set();
        this.animations = [];
        this.behaviors = {
            animations: this.ev.behavior({}),
            current: this.ev.behavior(void 0),
            canApply: this.ev.behavior({ canApply: false }),
            info: this.ev.behavior({ width: 0, height: 0 }),
            params: this.ev.behavior(param_definition_1.ParamDefinition.getDefaultValues(exports.Mp4AnimationParams))
        };
        this.init();
    }
}
exports.Mp4Controls = Mp4Controls;
