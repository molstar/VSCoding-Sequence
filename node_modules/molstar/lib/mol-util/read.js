/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function readFile(file, isBinary = false) {
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
export function readFileAsText(file) {
    return readFile(file, false);
}
export function readFileAsBuffer(file) {
    return readFile(file, true);
}
export async function readUrl(url, isBinary) {
    const response = await fetch(url);
    return isBinary ? new Uint8Array(await response.arrayBuffer()) : await response.text();
}
export function readUrlAsText(url) {
    return readUrl(url, false);
}
export function readUrlAsBuffer(url) {
    return readUrl(url, true);
}
