/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ButtonsType, KeyCode, ModifiersKeys } from './input/input-observer';
export { Binding };
interface Binding {
    triggers: Binding.Trigger[];
    action: string;
    description: string;
}
declare function Binding(triggers: Binding.Trigger[], action?: string, description?: string): Binding;
declare namespace Binding {
    function create(triggers: Trigger[], action?: string, description?: string): Binding;
    function isBinding(x: any): x is Binding;
    const Empty: Binding;
    function isEmpty(binding: Binding): boolean;
    function match(binding: Binding, buttons: ButtonsType, modifiers: ModifiersKeys): boolean;
    function matchKey(binding: Binding, code: KeyCode, modifiers: ModifiersKeys, key: string): boolean;
    function formatTriggers(binding: Binding): string;
    function format(binding: Binding, name?: string): any;
    interface Trigger {
        buttons?: ButtonsType;
        modifiers?: ModifiersKeys;
        code?: KeyCode;
    }
    function Trigger(buttons?: ButtonsType, modifiers?: ModifiersKeys): Trigger;
    function TriggerKey(code?: KeyCode, modifiers?: ModifiersKeys): Trigger;
    namespace Trigger {
        function create(buttons?: ButtonsType, modifiers?: ModifiersKeys, code?: KeyCode): Trigger;
        const Empty: Trigger;
        function match(trigger: Trigger, buttons: ButtonsType, modifiers: ModifiersKeys): boolean;
        function matchKey(trigger: Trigger, code: KeyCode, modifiers: ModifiersKeys, key: string): boolean;
        function format(trigger: Trigger): string;
    }
}
