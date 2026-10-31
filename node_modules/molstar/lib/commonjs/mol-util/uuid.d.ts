/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/** A UUID, either standard 36 characters or 22 characters base64 encoded. */
type UUID = string & {
    '@type': 'uuid';
};
declare namespace UUID {
    /** Creates a 22 characters 'base64' encoded UUID */
    function create22(): UUID;
    function createv4(): UUID;
    function is(x: any): x is UUID;
}
export { UUID };
