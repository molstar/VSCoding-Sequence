import { Type } from './type';
import { Expression } from './expression';
export type Argument<T extends Type = Type> = {
    type: T;
    isOptional: boolean;
    isRest: boolean;
    defaultValue: T['@type'] | undefined;
    description: string | undefined;
};
export declare function Argument<T extends Type>(type: T, params?: {
    description?: string;
    defaultValue?: T['@type'];
    isOptional?: boolean;
    isRest?: boolean;
}): Argument<T>;
export type Arguments<T extends {
    [key: string]: any;
} = {}> = Arguments.List<T> | Arguments.Dictionary<T>;
export declare namespace Arguments {
    const None: Arguments;
    interface Dictionary<T extends {
        [key: string]: any;
    } = {}, Traits = {}> {
        kind: 'dictionary';
        map: {
            [P in keyof T]: Argument<T[P]>;
        };
        '@type': T;
    }
    type PropTypes<Map extends {
        [key: string]: Argument<any>;
    }> = {
        [P in keyof Map]: Map[P]['type']['@type'];
    };
    function Dictionary<Map extends {
        [key: string]: Argument<any>;
    }>(map: Map): Arguments<PropTypes<Map>>;
    interface List<T extends {
        [key: string]: any;
    } = {}, Traits = {}> {
        kind: 'list';
        type: Type;
        nonEmpty: boolean;
        '@type': T;
    }
    function List<T extends Type>(type: T, params?: {
        nonEmpty?: boolean;
    }): Arguments<{
        [key: string]: T['@type'];
    }>;
}
export type ExpressionArguments<T> = {
    [P in keyof T]?: Expression;
} | {
    [index: number]: Expression;
};
export interface MSymbol<A extends Arguments = Arguments, T extends Type = Type> {
    (args?: ExpressionArguments<A['@type']>): Expression;
    info: {
        namespace: string;
        name: string;
        description?: string;
    };
    args: A;
    type: T;
    id: string;
}
export declare function MSymbol<A extends Arguments, T extends Type>(name: string, args: A, type: T, description?: string): MSymbol<A, T>;
export declare function CustomPropSymbol<T extends Type>(namespace: string, name: string, type: T, description?: string): MSymbol<Arguments<{}>, T>;
export declare function isSymbol(x: any): x is MSymbol;
export type SymbolMap = {
    [id: string]: MSymbol | undefined;
};
