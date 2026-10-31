/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Expression } from './expression';
const { isLiteral, isSymbol, isArgumentsArray } = Expression;
class Writer {
    constructor() {
        this.value = [];
        this.currentLineLength = 0;
        this.prefixLength = 0;
        this._prefix = '';
        this.localPrefix = '';
    }
    setLocal() {
        this.localPrefix = '  ';
    }
    newline() {
        this.value.push(`\n${this._prefix}${this.localPrefix}`);
        this.currentLineLength = 0;
    }
    push() {
        this.value.push('(');
        this.currentLineLength = 0;
        this.localPrefix = '';
        this.prefixLength += 2;
        this._prefix = new Array(this.prefixLength + 1).join(' ');
    }
    pop() {
        this.value.push(')');
        this.prefixLength -= 2;
        this._prefix = new Array(this.prefixLength + 1).join(' ');
    }
    append(str) {
        if (!this.currentLineLength) {
            this.value.push(str);
            this.currentLineLength = str.length;
        }
        else if (this.currentLineLength + this.prefixLength + this.localPrefix.length + str.length < 80) {
            this.value.push(str);
            this.currentLineLength += str.length;
        }
        else {
            this.setLocal();
            this.newline();
            this.value.push(str);
            this.currentLineLength = str.length;
        }
    }
    whitespace() {
        if (this.currentLineLength + this.prefixLength + this.localPrefix.length + 1 < 80) {
            this.value.push(' ');
        }
    }
    getStr() {
        return this.value.join('');
    }
}
function _format(e, writer) {
    if (isLiteral(e)) {
        if (typeof e === 'string' && (/\s/.test(e) || !e.length))
            writer.append(`\`${e}\``);
        else
            writer.append(`${e}`);
        return;
    }
    if (isSymbol(e)) {
        writer.append(`${e.name}`);
        return;
    }
    writer.push();
    _format(e.head, writer);
    if (!e.args) {
        writer.pop();
        return;
    }
    if (isArgumentsArray(e.args)) {
        let prevLiteral = true;
        for (const a of e.args) {
            if (isLiteral(a)) {
                if (prevLiteral)
                    writer.whitespace();
                else
                    writer.newline();
                prevLiteral = true;
            }
            else {
                prevLiteral = false;
                writer.newline();
            }
            _format(a, writer);
        }
        writer.pop();
        return;
    }
    const keys = Object.keys(e.args);
    if (!keys.length) {
        writer.pop();
        return;
    }
    if (keys.length === 1 && isLiteral(e.args[keys[0]])) {
        writer.whitespace();
        writer.append(`:${keys[0]}`);
        writer.whitespace();
        _format(e.args[keys[0]], writer);
        writer.pop();
        return;
    }
    for (const a of keys) {
        writer.newline();
        writer.append(`:${a}`);
        writer.whitespace();
        _format(e.args[a], writer);
    }
    writer.pop();
}
export function formatMolScript(e) {
    const writer = new Writer();
    _format(e, writer);
    return writer.getStr();
}
