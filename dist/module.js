'use strict';

System.register(['app/plugins/sdk', './cal_heatmap_ctrl'], function (_export, _context) {
  "use strict";

  var loadPluginCss, CalHeatMapCtrl;
  return {
    setters: [function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }, function (_cal_heatmap_ctrl) {
      CalHeatMapCtrl = _cal_heatmap_ctrl.CalHeatMapCtrl;
    }],
    execute: function () {

      loadPluginCss({
        dark: 'plugins/neocat-cal-heatmap-panel/bower_components/cal-heatmap/cal-heatmap.css',
        light: 'plugins/neocat-cal-heatmap-panel/bower_components/cal-heatmap/cal-heatmap.css'
      });

      _export('PanelCtrl', CalHeatMapCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
