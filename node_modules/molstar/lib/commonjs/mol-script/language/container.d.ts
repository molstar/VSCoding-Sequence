import { Expression } from './expression';
export interface Container {
    source?: string;
    version: string;
    expression: Expression;
}
