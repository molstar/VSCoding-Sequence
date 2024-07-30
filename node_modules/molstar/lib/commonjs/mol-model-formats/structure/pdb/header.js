"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHeader = addHeader;
function addHeader(data, s, e, header) {
    //     COLUMNS       DATA  TYPE     FIELD             DEFINITION
    // ------------------------------------------------------------------------------------
    //  1 -  6       Record name    "HEADER"
    // 11 - 50       String(40)     classification    Classifies the molecule(s).
    // 51 - 59       Date           depDate           Deposition date. This is the date the
    //                                                coordinates  were received at the PDB.
    // 63 - 66       IDcode         idCode            This identifier is unique within the PDB.
    // PDB to PDBx/mmCIF Data Item Correspondences
    // classification  	  _struct_keywords.pdbx_keywords
    // depDate  	      _pdbx_database_status.recvd_initial_deposition_date
    // idCode  	          _entry.id
    const line = data.substring(s, e);
    header.id_code = line.substring(62, 66).trim() || undefined;
    header.dep_date = line.substring(50, 59).trim() || undefined;
    header.classification = line.substring(10, 50).trim() || undefined;
}
