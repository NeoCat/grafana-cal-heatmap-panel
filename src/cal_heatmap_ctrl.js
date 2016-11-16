import TimeSeries from 'app/core/time_series2';
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import './bower_components/d3/d3.js';
import './bower_components/cal-heatmap/cal-heatmap.js';

export class CalHeatMapCtrl extends MetricsPanelCtrl {
  constructor($scope, $element, $injector) {
    super($scope, $injector);

    var subDomains = {
      'auto':  ['auto'],
      'month': ['auto', 'week', 'x_week', 'day', 'x_day'],
      'day':   ['auto', 'hour', 'x_hour'],
      'hour':  ['auto', 'min', 'x_min']
    };
    var panelDefaults = {
      datasource: null,
      subDomains: subDomains,
      domains: Object.keys(subDomains),
      config: {
	animationDuration: 0,
        domain: 'auto',
        subDomain: 'auto',
        colLimit: null,
        rowLimit: null,
        cellSize: 10,
        cellPadding: 2,
        cellRadius: 0,
        domainGutter: 2,
        label: {
          position: 'bottom',
          rotate: 'null',
          width: 60,
        },
        legendStr: '10,20,30,40',
        legendColors: {
          min: "#666",
          max: "steelblue",
          empty: "#222",
          base: "transparent",
        },
        displayLegend: true,
      },
    };

    _.defaults(this.panel, angular.copy(panelDefaults));
    this.seriesList = [];

    this.element = $element;
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  seriesHandler(seriesData, index) {
    var datapoints = seriesData.datapoints;
    var alias = seriesData.target;

    var series = new TimeSeries({
      datapoints: datapoints,
      alias: alias,
      color: index,
      unit: false,
    });

    if (datapoints && datapoints.length > 0) {
      var last = moment.utc(datapoints[datapoints.length - 1][1]);

      this.datapointsCount += datapoints.length;
    }

    return series;
  }

  onInitEditMode() {
    this.addEditorTab('Options',
                      'public/plugins/neocat-cal-heatmap-panel/editor.html',
                      2);
  }

  onDataSnapshotLoad(snapshotData) {
    this.onDataReceived(snapshotData.data);
  }

  onDataError(err) {
    this.seriesList = [];
    this.render([]);
  }

  onDataReceived(dataList) {
    this.seriesList = dataList.map(this.seriesHandler.bind(this));
    this.render(this.seriesList);
  }

  onRender() {
    if (!this.seriesList || !this.seriesList[0])
      return;

    var subDomains = this.panel.subDomains[this.panel.config.domain];
    if (subDomains.indexOf(this.panel.config.subDomain) < 0)
      this.panel.config.subDomain = 'auto';

    var elem = this.element.find(".cal-heatmap-panel")[0];
    var _this = this;
    var update = function() {
      var data = {};
      var points = _this.seriesList[0].datapoints;
      for (var i = 0; i < points.length; i++) {
        data[points[i][1] / 1000] = points[i][0];
      }

      var from = moment.utc(_this.range.from);
      var to = moment.utc(_this.range.to);
      var days = to.diff(from, "days") + 1;
      var cal = _this.cal = new CalHeatMap();

      var config = angular.copy(_this.panel.config)
      config.itemSelector = elem;
      config.data = data;
      config.legend = config.legendStr ?
        config.legendStr.split(/\s*,\s*/).map(x => parseFloat(x)) : null

      if (config.domain == 'auto') {
        config.domain = days > 31 ? "month" : days > 3 ? "day" : "hour";
      }
      if (config.subDomain == 'auto') {
        delete config.subDomain;
      }
      config.start = moment.utc(_this.range.from).toDate();
      if (config.domain == 'month') {
        config.range = to.diff(from, "months") + 1;
        config.domainLabelFormat = '%y/%m';
      }
      else if (config.domain == 'day') {
        config.range = days;
        config.domainLabelFormat = '%m/%d';
      }
      else if (config.domain == 'hour') {
        config.range = to.diff(from, "hours") + 1;;
        config.domainLabelFormat = '%d %H:%M';
      }
      config.range = Math.min(config.range, 60); // avoid browser hang

      _this.cal.init(config);
    };

    if (this.cal) {
      try {
        this.cal.destroy(update);
      } catch (e) {
        console.log("Destroy failed: " + e);
        elem.innerHTML = '';
        update();
      }
    } else {
      update();
    }
  }

}

CalHeatMapCtrl.templateUrl = 'module.html';
