type Type<T = any> = Type.Any | Type.AnyValue | Type.Variable<T> | Type.Value<T> | Type.Container<T> | Type.Union<T> | Type.OneOf<T>;
declare namespace Type {
    interface Any {
        kind: 'any';
        '@type': any;
    }
    interface Variable<T> {
        kind: 'variable';
        name: string;
        type: Type;
        isConstraint: boolean;
        '@type': any;
    }
    interface AnyValue {
        kind: 'any-value';
        '@type': any;
    }
    interface Value<T> {
        kind: 'value';
        namespace: string;
        name: string;
        parent?: Value<any>;
        '@type': T;
    }
    interface Container<T> {
        kind: 'container';
        namespace: string;
        name: string;
        alias?: string;
        child: Type;
        '@type': T;
    }
    interface Union<T> {
        kind: 'union';
        types: Type[];
        '@type': T;
    }
    interface OneOf<T> {
        kind: 'oneof';
        type: Value<T>;
        namespace: string;
        name: string;
        values: {
            [v: string]: boolean | undefined;
        };
        '@type': T;
    }
    function Variable<T = any>(name: string, type: Type, isConstraint?: boolean): Variable<T>;
    function Value<T>(namespace: string, name: string, parent?: Value<any>): Value<T>;
    function Container<T = any>(namespace: string, name: string, child: Type, alias?: string): Container<T>;
    function Union<T = any>(types: Type[]): Union<T>;
    function OneOf<T = any>(namespace: string, name: string, type: Value<T>, values: any[]): OneOf<T>;
    const Any: Any;
    const AnyValue: AnyValue;
    const Num: Value<number>;
    const Str: Value<string>;
    const Bool: OneOf<boolean>;
    function oneOfValues({ values }: OneOf<any>): string[];
}
export { Type };
