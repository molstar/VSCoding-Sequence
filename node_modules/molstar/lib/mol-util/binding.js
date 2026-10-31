/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ButtonsType, ModifiersKeys } from './input/input-observer';
import { camelCaseToWords, interpolate, stringToWords } from './string';
export { Binding };
function Binding(triggers, action = '', description = '') {
    return Binding.create(triggers, action, description);
}
(function (Binding) {
    function create(triggers, action = '', description = '') {
        return { triggers, action, description };
    }
    Binding.create = create;
    function isBinding(x) {
        return !!x && Array.isArray(x.triggers) && typeof x.action === 'string';
    }
    Binding.isBinding = isBinding;
    Binding.Empty = { triggers: [], action: '', description: '' };
    function isEmpty(binding) {
        return binding.triggers.length === 0 ||
            binding.triggers.every(t => t.buttons === undefined && t.modifiers === undefined && !t.code);
    }
    Binding.isEmpty = isEmpty;
    function match(binding, buttons, modifiers) {
        return binding.triggers.some(t => Trigger.match(t, buttons, modifiers));
    }
    Binding.match = match;
    function matchKey(binding, code, modifiers, key) {
        return binding.triggers.some(t => Trigger.matchKey(t, code, modifiers, key));
    }
    Binding.matchKey = matchKey;
    function formatTriggers(binding) {
        return binding.triggers.map(Trigger.format).join(' or ');
    }
    Binding.formatTriggers = formatTriggers;
    function format(binding, name = '') {
        const help = binding.description || stringToWords(name);
        return interpolate(help, { triggers: '<i>' + formatTriggers(binding) + '</i>' });
    }
    Binding.format = format;
    function Trigger(buttons, modifiers) {
        return Trigger.create(buttons, modifiers);
    }
    Binding.Trigger = Trigger;
    function TriggerKey(code, modifiers) {
        return Trigger.create(undefined, modifiers, code);
    }
    Binding.TriggerKey = TriggerKey;
    (function (Trigger) {
        function create(buttons, modifiers, code) {
            return { buttons, modifiers, code };
        }
        Trigger.create = create;
        Trigger.Empty = {};
        function match(trigger, buttons, modifiers) {
            const { buttons: b, modifiers: m } = trigger;
            return b !== undefined &&
                (b === buttons || ButtonsType.has(b, buttons)) &&
                (!m || ModifiersKeys.areEqual(m, modifiers));
        }
        Trigger.match = match;
        function matchKey(trigger, code, modifiers, key) {
            const { modifiers: m, code: c } = trigger;
            return c !== undefined &&
                (c === code || (c.length === 1 &&
                    code.length === 4 &&
                    code.startsWith('Key') &&
                    !!key && key.length === 1 &&
                    key.toUpperCase() === c.toUpperCase())) &&
                (!m || ModifiersKeys.areEqual(m, modifiers));
        }
        Trigger.matchKey = matchKey;
        function format(trigger) {
            const s = [];
            const b = formatButtons(trigger.buttons, trigger.code);
            if (b)
                s.push(b);
            const c = formatCode(trigger.code);
            if (c)
                s.push(c);
            const m = formatModifiers(trigger.modifiers);
            if (m)
                s.push(m);
            return s.join(' + ');
        }
        Trigger.format = format;
    })(Trigger = Binding.Trigger || (Binding.Trigger = {}));
})(Binding || (Binding = {}));
const B = ButtonsType;
function formatButtons(buttons, code) {
    const s = [];
    if (buttons === undefined && !code) {
        s.push('any mouse button');
    }
    else if (buttons === 0) {
        s.push('mouse hover');
    }
    else if (buttons !== undefined) {
        if (B.has(buttons, B.Flag.Primary))
            s.push('left mouse button');
        if (B.has(buttons, B.Flag.Secondary))
            s.push('right mouse button');
        if (B.has(buttons, B.Flag.Auxilary))
            s.push('wheel/middle mouse button');
        if (B.has(buttons, B.Flag.Forth))
            s.push('three fingers');
    }
    return s.join(' + ');
}
function formatModifiers(modifiers, verbose) {
    const s = [];
    if (modifiers) {
        if (modifiers.alt)
            s.push('alt key');
        if (modifiers.control)
            s.push('control key');
        if (modifiers.meta)
            s.push('meta/command key');
        if (modifiers.shift)
            s.push('shift key');
        if (verbose && s.length === 0)
            s.push('no key');
    }
    else {
        if (verbose)
            s.push('any key');
    }
    return s.join(' + ');
}
function formatCode(code) {
    if (code === null || code === void 0 ? void 0 : code.startsWith('Key'))
        code = code.substring(3);
    return code && camelCaseToWords(code).toLowerCase();
}
