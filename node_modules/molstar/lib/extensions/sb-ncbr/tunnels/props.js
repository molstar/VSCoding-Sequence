import { PluginConfigItem } from '../../../mol-plugin/config';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export var TunnelsData;
(function (TunnelsData) {
    TunnelsData.DefaultServerUrl = 'https://channelsdb2.biodata.ceitec.cz/api';
    TunnelsData.DefaultServerType = 'pdb';
})(TunnelsData || (TunnelsData = {}));
export const TunnelsDataParams = {
    serverType: PD.Select('pdb', [['pdb', 'pdb']]),
    serverUrl: PD.Text(TunnelsData.DefaultServerUrl)
};
export const TunnelsServerConfig = {
    DefaultServerUrl: new PluginConfigItem('channelsdb-server', 'https://channelsdb2.biodata.ceitec.cz/api'),
    DefaultServerType: new PluginConfigItem('serverType', 'pdb')
};
export function getTunnelsConfig(plugin) {
    var _a, _b, _c, _d;
    return {
        DefaultServerUrl: (_b = (_a = plugin.config.get(TunnelsServerConfig.DefaultServerUrl)) !== null && _a !== void 0 ? _a : TunnelsServerConfig.DefaultServerUrl.defaultValue) !== null && _b !== void 0 ? _b : TunnelsData.DefaultServerUrl,
        DefaultServerType: (_d = (_c = plugin.config.get(TunnelsServerConfig.DefaultServerType)) !== null && _c !== void 0 ? _c : TunnelsServerConfig.DefaultServerType.defaultValue) !== null && _d !== void 0 ? _d : TunnelsData.DefaultServerType,
    };
}
