/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from https://github.com/prisma/graphql-request, Copyright (c) 2017 Graphcool, MIT
 */
import { Asset } from './assets';
export class ClientError extends Error {
    constructor(response, request) {
        const message = `${ClientError.extractMessage(response)}: ${JSON.stringify({ response, request })}`;
        super(message);
        this.response = response;
        this.request = request;
        // this is needed as Safari doesn't support .captureStackTrace
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ClientError);
        }
    }
    static extractMessage(response) {
        return response.errors ? response.errors[0].message : `GraphQL Error (Code: ${response.status})`;
    }
}
export class GraphQLClient {
    constructor(url, assetManager) {
        this.url = url;
        this.assetManager = assetManager;
    }
    async request(ctx, query, variables) {
        const body = JSON.stringify({ query, variables }, null, 2);
        const url = Asset.getUrlAsset(this.assetManager, this.url, body);
        const result = await this.assetManager.resolve(url, 'json').runInContext(ctx);
        if (!result.data.errors && result.data.data) {
            return {
                data: result.data.data,
                dispose: result.dispose
            };
        }
        else {
            const errorResult = typeof result.data === 'string' ? { error: result.data } : result.data;
            throw new ClientError({ ...errorResult }, { query, variables });
        }
    }
}
