'use strict';

System.register(['app/core/time_series2', 'app/plugins/sdk', 'moment', './bower_components/d3/d3.js', './bower_components/cal-heatmap/cal-heatmap.js'], function (_export, _context) {
  "use strict";

  var TimeSeries, MetricsPanelCtrl, moment, _createClass, CalHeatMapCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_bower_componentsD3D3Js) {}, function (_bower_componentsCalHeatmapCalHeatmapJs) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('CalHeatMapCtrl', CalHeatMapCtrl = function (_MetricsPanelCtrl) {
        _inherits(CalHeatMapCtrl, _MetricsPanelCtrl);

        function CalHeatMapCtrl($scope, $element, $injector) {
          _classCallCheck(this, CalHeatMapCtrl);

          var _this2 = _possibleConstructorReturn(this, (CalHeatMapCtrl.__proto__ || Object.getPrototypeOf(CalHeatMapCtrl)).call(this, $scope, $injector));

          var panelDefaults = {
            datasource: null,
            config: {
              animationDuration: 0,
              domain: 'auto',
              subDomain: 'auto',
              verticalOrientation: false,
              colLimit: null,
              rowLimit: null,
              cellSize: 10,
              cellPadding: 2,
              cellRadius: 0,
              domainGutter: 2,
              label: {
                position: 'bottom',
                rotate: 'null',
                width: 60
              },
              legendStr: '10,20,30,40',
              legendColors: {
                min: "#666",
                max: "steelblue",
                empty: "#222",
                base: "transparent"
              },
              displayLegend: true
            }
          };

          _.defaults(_this2.panel, angular.copy(panelDefaults));
          _this2.seriesList = [];

          _this2.element = $element;
          _this2.events.on('render', _this2.onRender.bind(_this2));
          _this2.events.on('data-received', _this2.onDataReceived.bind(_this2));
          _this2.events.on('data-error', _this2.onDataError.bind(_this2));
          _this2.events.on('data-snapshot-load', _this2.onDataSnapshotLoad.bind(_this2));
          _this2.events.on('init-edit-mode', _this2.onInitEditMode.bind(_this2));
          return _this2;
        }

        _createClass(CalHeatMapCtrl, [{
          key: 'seriesHandler',
          value: function seriesHandler(seriesData, index) {
            var datapoints = seriesData.datapoints;
            var alias = seriesData.target;

            var series = new TimeSeries({
              datapoints: datapoints,
              alias: alias,
              color: index,
              unit: false
            });

            if (datapoints && datapoints.length > 0) {
              var last = moment.utc(datapoints[datapoints.length - 1][1]);

              this.datapointsCount += datapoints.length;
            }

            return series;
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/neocat-cal-heatmap-panel/editor.html', 2);
          }
        }, {
          key: 'onDataSnapshotLoad',
          value: function onDataSnapshotLoad(snapshotData) {
            this.onDataReceived(snapshotData.data);
          }
        }, {
          key: 'onDataError',
          value: function onDataError(err) {
            this.seriesList = [];
            this.render([]);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.seriesList = dataList.map(this.seriesHandler.bind(this));
            this.render(this.seriesList);
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            if (!this.seriesList || !this.seriesList[0]) return;

            var subDomains = {
              'auto': ['auto'],
              'month': ['auto', 'week', 'x_week', 'day', 'x_day'],
              'day': ['auto', 'hour', 'x_hour'],
              'hour': ['auto', 'min', 'x_min']
            };
            console.log(this.panel.config.domain);
            var cand = subDomains[this.panel.config.domain];
            if (!cand || cand.indexOf(this.panel.config.subDomain) < 0) this.panel.config.subDomain = 'auto';
            console.log([this.panel.config.subDomain]);

            var elem = this.element.find(".cal-heatmap-panel")[0];
            var _this = this;
            var update = function update() {
              var data = {};
              var points = _this.seriesList[0].datapoints;
              for (var i = 0; i < points.length; i++) {
                data[points[i][1] / 1000] = points[i][0];
              }

              var from = moment.utc(_this.range.from);
              var to = moment.utc(_this.range.to);
              var days = to.diff(from, "days") + 1;
              var cal = _this.cal = new CalHeatMap();

              var config = angular.copy(_this.panel.config);
              config.itemSelector = elem;
              config.data = data;
              config.legend = config.legendStr ? config.legendStr.split(/\s*,\s*/).map(function (x) {
                return parseFloat(x);
              }) : null;
              config.label.position = config.verticalOrientation ? 'left' : 'bottom';

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
              } else if (config.domain == 'day') {
                config.range = days;
                config.domainLabelFormat = '%m/%d';
              } else if (config.domain == 'hour') {
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
        }]);

        return CalHeatMapCtrl;
      }(MetricsPanelCtrl));

      _export('CalHeatMapCtrl', CalHeatMapCtrl);

      CalHeatMapCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=cal_heatmap_ctrl.js.map
