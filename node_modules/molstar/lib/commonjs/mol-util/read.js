"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = readFile;
exports.readFileAsText = readFileAsText;
exports.readFileAsBuffer = readFileAsBuffer;
exports.readUrl = readUrl;
exports.readUrlAsText = readUrlAsText;
exports.readUrlAsBuffer = readUrlAsBuffer;
function readFile(file, isBinary = false) {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onerror = () => {
            fileReader.abort();
            reject(new DOMException('Error parsing file.'));
        };
        fileReader.onload = () => {
            resolve(isBinary ? new Uint8Array(fileReader.result) : fileReader.result);
        };
        if (isBinary) {
            fileReader.readAsArrayBuffer(file);
        }
        else {
            fileReader.readAsText(file);
        }
    });
}
function readFileAsText(file) {
    return readFile(file, false);
}
function readFileAsBuffer(file) {
    return readFile(file, true);
}
async function readUrl(url, isBinary) {
    const response = await fetch(url);
    return isBinary ? new Uint8Array(await response.arrayBuffer()) : await response.text();
}
function readUrlAsText(url) {
    return readUrl(url, false);
}
function readUrlAsBuffer(url) {
    return readUrl(url, true);
}
