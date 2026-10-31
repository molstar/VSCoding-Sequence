/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Config } from './config';
export declare function getSchema(config: Config): {
    openapi: string;
    info: {
        version: string;
        title: string;
        description: string;
    };
    tags: {
        name: string;
    }[];
    paths: {
        [x: string]: {
            get: {
                tags: string[];
                summary: string;
                operationId: string;
                parameters: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                    style: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {};
                            'text/plain'?: undefined;
                        };
                    };
                };
            };
            post?: undefined;
        } | {
            get: {
                tags: string[];
                summary: string;
                operationId: string;
                parameters: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                    style: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'text/plain': {};
                            'application/json'?: undefined;
                        };
                    };
                };
            };
            post?: undefined;
        } | {
            post: {
                tags: string[];
                summary: string;
                operationId: string;
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                            };
                        };
                    };
                };
                parameters: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                    style: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'text/plain': {};
                        };
                    };
                };
            };
            get?: undefined;
        };
    };
};
export declare const shortcutIconLink = "<link rel='shortcut icon' href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURQAAAMIrHrspHr0oH7soILonHrwqH7onILsoHrsoH7soH7woILwpIKgVokoAAAAMdFJOUwAQHzNxWmBHS5XO6jdtAmoAAACZSURBVDjLxZNRCsQgDAVNXmwb9f7nXZEaLRgXloXOhwQdjMYYwpOLw55fBT46KhbOKhmRR2zLcFJQj8UR+HxFgArIF5BKJbEncC6NDEdI5SatBRSDJwGAoiFDONrEJXWYhGMIcRJGCrb1TOtDahfUuQXd10jkFYq0ViIrbUpNcVT6redeC1+b9tH2WLR93Sx2VCzkv/7NjfABxjQHksGB7lAAAAAASUVORK5CYII=' />";
