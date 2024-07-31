/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from https://github.com/prisma/graphql-request, Copyright (c) 2017 Graphcool, MIT
 */
import { RuntimeContext } from '../mol-task';
import { AssetManager, Asset } from './assets';
type Variables = {
    [key: string]: any;
};
interface GraphQLError {
    message: string;
    locations: {
        line: number;
        column: number;
    }[];
    path: string[];
}
interface GraphQLResponse {
    data?: any;
    errors?: GraphQLError[];
    extensions?: any;
    status: number;
    [key: string]: any;
}
interface GraphQLRequestContext {
    query: string;
    variables?: Variables;
}
export declare class ClientError extends Error {
    response: GraphQLResponse;
    request: GraphQLRequestContext;
    constructor(response: GraphQLResponse, request: GraphQLRequestContext);
    private static extractMessage;
}
export declare class GraphQLClient {
    private url;
    private assetManager;
    constructor(url: string, assetManager: AssetManager);
    request(ctx: RuntimeContext, query: string, variables?: Variables): Promise<Asset.Wrapper<'json'>>;
}
export {};
