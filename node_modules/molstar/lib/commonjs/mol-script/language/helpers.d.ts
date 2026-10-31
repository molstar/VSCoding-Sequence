import { Type } from './type';
import { MSymbol, Arguments } from './symbol';
export declare function symbol<A extends Arguments, T extends Type<S>, S>(args: A, type: T, description?: string): MSymbol<A, T>;
export declare function normalizeTable(table: any): void;
export declare function symbolList(table: any): MSymbol[];
