/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare function getSchema(): {
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
                    $ref: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                            'text/plain'?: undefined;
                            'application/octet-stream'?: undefined;
                        };
                    };
                };
            };
        } | {
            get: {
                tags: string[];
                summary: string;
                operationId: string;
                parameters: ({
                    $ref: string;
                    name?: undefined;
                    in?: undefined;
                    description?: undefined;
                    required?: undefined;
                    schema?: undefined;
                    style?: undefined;
                } | {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                        items: {
                            type: string;
                        };
                        enum?: undefined;
                    };
                    style: string;
                    $ref?: undefined;
                } | {
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        enum: string[];
                        items?: undefined;
                    };
                    style: string;
                    $ref?: undefined;
                    required?: undefined;
                })[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'text/plain': {};
                            'application/octet-stream': {};
                            'application/json'?: undefined;
                        };
                    };
                };
            };
        };
    };
    components: {
        schemas: {
            info: {
                properties: {
                    formatVersion: {
                        type: string;
                        description: string;
                    };
                    axisOrder: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                    origin: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                    dimensions: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                    spacegroup: {
                        properties: {
                            number: {
                                type: string;
                            };
                            size: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            angles: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            isPeriodic: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                    channels: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    valueType: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    blockSize: {
                        type: string;
                        description: string;
                    };
                    sampling: {
                        type: string;
                        items: {
                            properties: {
                                byteOffset: {
                                    type: string;
                                };
                                rate: {
                                    type: string;
                                    description: string;
                                };
                                valuesInfo: {
                                    properties: {
                                        mean: {
                                            type: string;
                                        };
                                        sigma: {
                                            type: string;
                                        };
                                        min: {
                                            type: string;
                                        };
                                        max: {
                                            type: string;
                                        };
                                    };
                                };
                                sampleCount: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    description: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        parameters: {
            source: {
                name: string;
                in: string;
                description: string;
                required: boolean;
                schema: {
                    type: string;
                    enum: string[];
                };
                style: string;
            };
            id: {
                name: string;
                in: string;
                description: string;
                required: boolean;
                schema: {
                    type: string;
                };
                style: string;
            };
            encoding: {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    enum: string[];
                };
                style: string;
            };
            detail: {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                };
                style: string;
            };
        };
    };
};
export declare const shortcutIconLink = "<link rel='shortcut icon' href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURQAAAMIrHrspHr0oH7soILonHrwqH7onILsoHrsoH7soH7woILwpIKgVokoAAAAMdFJOUwAQHzNxWmBHS5XO6jdtAmoAAACZSURBVDjLxZNRCsQgDAVNXmwb9f7nXZEaLRgXloXOhwQdjMYYwpOLw55fBT46KhbOKhmRR2zLcFJQj8UR+HxFgArIF5BKJbEncC6NDEdI5SatBRSDJwGAoiFDONrEJXWYhGMIcRJGCrb1TOtDahfUuQXd10jkFYq0ViIrbUpNcVT6redeC1+b9tH2WLR93Sx2VCzkv/7NjfABxjQHksGB7lAAAAAASUVORK5CYII=' />";
