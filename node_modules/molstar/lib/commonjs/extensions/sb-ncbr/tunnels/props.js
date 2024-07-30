"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelsServerConfig = exports.TunnelsDataParams = exports.TunnelsData = void 0;
exports.getTunnelsConfig = getTunnelsConfig;
const config_1 = require("../../../mol-plugin/config");
const param_definition_1 = require("../../../mol-util/param-definition");
var TunnelsData;
(function (TunnelsData) {
    TunnelsData.DefaultServerUrl = 'https://channelsdb2.biodata.ceitec.cz/api';
    TunnelsData.DefaultServerType = 'pdb';
})(TunnelsData || (exports.TunnelsData = TunnelsData = {}));
exports.TunnelsDataParams = {
    serverType: param_definition_1.ParamDefinition.Select('pdb', [['pdb', 'pdb']]),
    serverUrl: param_definition_1.ParamDefinition.Text(TunnelsData.DefaultServerUrl)
};
exports.TunnelsServerConfig = {
    DefaultServerUrl: new config_1.PluginConfigItem('channelsdb-server', 'https://channelsdb2.biodata.ceitec.cz/api'),
    DefaultServerType: new config_1.PluginConfigItem('serverType', 'pdb')
};
function getTunnelsConfig(plugin) {
    var _a, _b, _c, _d;
    return {
        DefaultServerUrl: (_b = (_a = plugin.config.get(exports.TunnelsServerConfig.DefaultServerUrl)) !== null && _a !== void 0 ? _a : exports.TunnelsServerConfig.DefaultServerUrl.defaultValue) !== null && _b !== void 0 ? _b : TunnelsData.DefaultServerUrl,
        DefaultServerType: (_d = (_c = plugin.config.get(exports.TunnelsServerConfig.DefaultServerType)) !== null && _c !== void 0 ? _c : exports.TunnelsServerConfig.DefaultServerType.defaultValue) !== null && _d !== void 0 ? _d : TunnelsData.DefaultServerType,
    };
}
