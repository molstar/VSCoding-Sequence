"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperCase = exports.lowerCase = void 0;
exports.indentString = indentString;
exports.splitCamelCase = splitCamelCase;
exports.camelCaseToWords = camelCaseToWords;
exports.upperCaseAny = upperCaseAny;
exports.capitalize = capitalize;
exports.splitSnakeCase = splitSnakeCase;
exports.snakeCaseToWords = snakeCaseToWords;
exports.splitKebabCase = splitKebabCase;
exports.kebabCaseToWords = kebabCaseToWords;
exports.stringToWords = stringToWords;
exports.substringStartsWith = substringStartsWith;
exports.interpolate = interpolate;
exports.trimChar = trimChar;
exports.trimCharStart = trimCharStart;
exports.trimCharEnd = trimCharEnd;
exports.stripTags = stripTags;
exports.escapeRegExp = escapeRegExp;
const reLine = /^/mg;
function indentString(str, count, indent) {
    return count === 0 ? str : str.replace(reLine, indent.repeat(count));
}
/** Add space between camelCase text. */
function splitCamelCase(str, separator = ' ') {
    return str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, `$1${separator}$2`);
}
/** Split camelCase text and capitalize. */
function camelCaseToWords(str) {
    return capitalize(splitCamelCase(str));
}
const lowerCase = (str) => str.toLowerCase();
exports.lowerCase = lowerCase;
const upperCase = (str) => str.toUpperCase();
exports.upperCase = upperCase;
/** Return upper case if string, otherwise return empty string */
function upperCaseAny(value) {
    if (!value)
        return '';
    return typeof value === 'string' ? value.toUpperCase() : `${value}`.toUpperCase();
}
/** Uppercase the first character of each word. */
function capitalize(str) {
    return str.toLowerCase().replace(/^\w|\s\w/g, exports.upperCase);
}
function splitSnakeCase(str) {
    return str.replace(/_/g, ' ');
}
function snakeCaseToWords(str) {
    return capitalize(splitSnakeCase(str));
}
function splitKebabCase(str) {
    return str.replace(/-/g, ' ');
}
function kebabCaseToWords(str) {
    return capitalize(splitKebabCase(str));
}
function stringToWords(str) {
    return capitalize(splitCamelCase(splitSnakeCase(splitKebabCase(str))));
}
function substringStartsWith(str, start, end, target) {
    const len = target.length;
    if (len > end - start)
        return false;
    for (let i = 0; i < len; i++) {
        if (str.charCodeAt(start + i) !== target.charCodeAt(i))
            return false;
    }
    return true;
}
function interpolate(str, params) {
    const names = Object.keys(params);
    const values = Object.values(params);
    return new Function(...names, `return \`${str}\`;`)(...values);
}
function trimChar(str, char) {
    let start = 0;
    let end = str.length;
    while (start < end && str[start] === char)
        ++start;
    while (end > start && str[end - 1] === char)
        --end;
    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}
function trimCharStart(str, char) {
    let start = 0;
    const end = str.length;
    while (start < end && str[start] === char)
        ++start;
    return (start > 0) ? str.substring(start, end) : str;
}
function trimCharEnd(str, char) {
    let end = str.length;
    while (end > 0 && str[end - 1] === char)
        --end;
    return (end < str.length) ? str.substring(0, end) : str;
}
/** Simple function to strip tags from a string */
function stripTags(str) {
    return str.replace(/<\/?[^>]+>/g, '');
}
/**
 * Escape string for use in Javascript regex
 *
 * From https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex/6969486#6969486
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
