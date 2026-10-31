/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { StringBuilder } from '../../mol-util';
import { Writer } from './writer';
import { Encoder, Category } from './cif/encoder';
import { ComponentAtom } from '../../mol-model-formats/structure/property/atoms/chem_comp';
import { ComponentBond } from '../../mol-model-formats/structure/property/bonds/chem_comp';
import { ElementSymbol } from '../../mol-model/structure/model/types';
interface Atom {
    Cartn_x: number;
    Cartn_y: number;
    Cartn_z: number;
    type_symbol: ElementSymbol;
    index: number;
}
declare function Atom(partial: any): Atom;
export declare abstract class LigandEncoder implements Encoder<string> {
    readonly encoder: string;
    readonly metaInformation: boolean;
    readonly hydrogens: boolean;
    protected builder: StringBuilder;
    protected meta: StringBuilder;
    protected componentAtomData: ComponentAtom;
    protected componentBondData: ComponentBond;
    protected error: boolean;
    protected encoded: boolean;
    readonly isBinary = false;
    binaryEncodingProvider: undefined;
    abstract encode(): void;
    protected abstract _writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx): void;
    protected abstract writeFullCategory<Ctx>(sb: StringBuilder, category: Category<Ctx>, context?: Ctx): void;
    writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx): void;
    setComponentAtomData(componentAtomData: ComponentAtom): void;
    setComponentBondData(componentBondData: ComponentBond): void;
    writeTo(stream: Writer): void;
    getSize(): number;
    getData(): string;
    protected getAtoms<Ctx>(instance: Category.Instance<Ctx>, source: any, ccdAtoms: ComponentAtom.Entry['map']): Map<string, Atom>;
    private _getAtoms;
    protected skipHydrogen(type_symbol: ElementSymbol): boolean;
    protected isHydrogen(type_symbol: ElementSymbol): boolean;
    private getSortedFields;
    private getField;
    protected getName<Ctx>(instance: Category.Instance<Ctx>, source: any): string;
    startDataBlock(): void;
    setFilter(): void;
    setFormatter(): void;
    isCategoryIncluded(): boolean;
    constructor(encoder: string, metaInformation: boolean, hydrogens: boolean);
}
export {};
