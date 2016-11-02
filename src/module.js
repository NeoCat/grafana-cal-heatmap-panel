import {loadPluginCss} from 'app/plugins/sdk';
import {CalHeatMapCtrl} from './cal_heatmap_ctrl';

loadPluginCss({
  dark: 'plugins/neocat-cal-heatmap-panel/bower_components/cal-heatmap/cal-heatmap.css',
  light: 'plugins/neocat-cal-heatmap-panel/bower_components/cal-heatmap/cal-heatmap.css'
});

export {
  CalHeatMapCtrl as PanelCtrl
};
