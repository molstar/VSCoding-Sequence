/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL src/transpile.ts
 */
import { Expression } from './language/expression';
import { Script } from './script';
export declare function parse(lang: Script.Language, str: string): Expression;
