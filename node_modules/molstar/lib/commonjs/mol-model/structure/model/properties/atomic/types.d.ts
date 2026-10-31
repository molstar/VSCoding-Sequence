/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementSymbol } from '../../types';
/**
 * Enum of element symbols
 */
export declare const enum Elements {
    H = "H",
    D = "D",
    T = "T",
    HE = "HE",
    LI = "LI",
    BE = "BE",
    B = "B",
    C = "C",
    N = "N",
    O = "O",
    F = "F",
    NE = "NE",
    NA = "NA",
    MG = "MG",
    AL = "AL",
    SI = "SI",
    P = "P",
    S = "S",
    CL = "CL",
    AR = "AR",
    K = "K",
    CA = "CA",
    SC = "SC",
    TI = "TI",
    V = "V",
    CR = "CR",
    MN = "MN",
    FE = "FE",
    CO = "CO",
    NI = "NI",
    CU = "CU",
    ZN = "ZN",
    GA = "GA",
    GE = "GE",
    AS = "AS",
    SE = "SE",
    BR = "BR",
    KR = "KR",
    RB = "RB",
    SR = "SR",
    Y = "Y",
    ZR = "ZR",
    NB = "NB",
    MO = "MO",
    TC = "TC",
    RU = "RU",
    RH = "RH",
    PD = "PD",
    AG = "AG",
    CD = "CD",
    IN = "IN",
    SN = "SN",
    SB = "SB",
    TE = "TE",
    I = "I",
    XE = "XE",
    CS = "CS",
    BA = "BA",
    LA = "LA",
    CE = "CE",
    PR = "PR",
    ND = "ND",
    PM = "PM",
    SM = "SM",
    EU = "EU",
    GD = "GD",
    TB = "TB",
    DY = "DY",
    HO = "HO",
    ER = "ER",
    TM = "TM",
    YB = "YB",
    LU = "LU",
    HF = "HF",
    TA = "TA",
    W = "W",
    RE = "RE",
    OS = "OS",
    IR = "IR",
    PT = "PT",
    AU = "AU",
    HG = "HG",
    TL = "TL",
    PB = "PB",
    BI = "BI",
    PO = "PO",
    AT = "AT",
    RN = "RN",
    FR = "FR",
    RA = "RA",
    AC = "AC",
    TH = "TH",
    PA = "PA",
    U = "U",
    NP = "NP",
    PU = "PU",
    AM = "AM",
    CM = "CM",
    BK = "BK",
    CF = "CF",
    ES = "ES",
    FM = "FM",
    MD = "MD",
    NO = "NO",
    LR = "LR",
    RF = "RF",
    DB = "DB",
    SG = "SG",
    BH = "BH",
    HS = "HS",
    MT = "MT",
    DS = "DS",
    RG = "RG",
    CN = "CN",
    NH = "NH",
    FL = "FL",
    MC = "MC",
    LV = "LV",
    TS = "TS",
    OG = "OG"
}
export declare const ElementNames: {
    [k: string]: string;
};
export declare const AlkaliMetals: Set<ElementSymbol>;
export declare function isAlkaliMetal(element: ElementSymbol): boolean;
export declare const AlkalineEarthMetals: Set<ElementSymbol>;
export declare function isAlkalineEarthMetal(element: ElementSymbol): boolean;
export declare const PolyatomicNonmetals: Set<ElementSymbol>;
export declare function isPolyatomicNonmetal(element: ElementSymbol): boolean;
export declare const DiatomicNonmetals: Set<ElementSymbol>;
export declare function isDiatomicNonmetal(element: ElementSymbol): boolean;
export declare const NobleGases: Set<ElementSymbol>;
export declare function isNobleGas(element: ElementSymbol): boolean;
export declare const PostTransitionMetals: Set<ElementSymbol>;
export declare function isPostTransitionMetal(element: ElementSymbol): boolean;
export declare const Metalloids: Set<ElementSymbol>;
export declare function isMetalloid(element: ElementSymbol): boolean;
export declare const Halogens: Set<ElementSymbol>;
export declare function isHalogen(element: ElementSymbol): boolean;
export declare function isTransitionMetal(element: ElementSymbol): boolean;
export declare function isLanthanide(element: ElementSymbol): boolean;
export declare function isActinide(element: ElementSymbol): boolean;
export declare function isMetal(element: ElementSymbol): boolean;
export declare function isNonmetal(element: ElementSymbol): boolean;
