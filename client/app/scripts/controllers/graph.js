'use strict';

/**
 * @ngdoc function
 * @name epromoApp.controller:GraphCtrl
 * @description
 * # GraphCtrl
 * Controller of the epromoApp
 */
angular.module('epromoApp')
  .controller('GraphCtrl', function ($scope, $http) {
    // шкалы времени
    $scope.graph = {
      units: [
        {
          unit: 'День',
          value: 'day'
        },
        {
          unit: 'Неделя',
          value: 'week'
        },
        {
          unit: 'Месяц',
          value: 'month'
        }
      ]
    };
    $scope.graph.graphUnit = $scope.graph.units[0];

    // настройки графика
    $scope.labels = [];
    $scope.series = ['Clicks', 'Shows', 'CTR'];
    $scope.data = [];
    $scope.time = {
      format: 'YYYY-MM-DD',
      tooltipFormat: 'YYYY-MM-DD',
    };
    $scope.options = {
      responsive: true,
      scales: {
          xAxes: [{
            type: "time",
            time: $scope.time
          }]
      }
    };

    // объединение сгруппированных данных
    function reduceData(groupedData) {
      return _.keys(groupedData).map(function (key) {
        return { stat_date: groupedData[key][0].stat_date,
          shows: _(groupedData[key]).reduce(function(m,x) { return m + x.shows; }, 0),
          clicks: _(groupedData[key]).reduce(function(m,x) { return m + x.clicks; }, 0),
          CTR: _(groupedData[key]).reduce(function(m,x) { return m + x.CTR; }, 0),
        }
      });
    }

    // устанавливает шкалу времени
    $scope.setUnit = function () {
      switch ($scope.graph.graphUnit.value) {
        case "day":
          // формат данных
          $scope.time = {
            format: 'YYYY-MM-DD',
            tooltipFormat: 'YYYY-MM-DD',
          };
          $scope.groupedData = $scope.response;
          break;
        case "week":
          $scope.time = {
            format: 'YYYY-MM-DD',
            tooltipFormat: 'YYYY-MM-DD',
            unit: "week"
          };
          // группирование по неделе
          var groupedData = _.groupBy($scope.response, function(item) {
              return moment(item.stat_date,"YYYY-MM-DD").isoWeek();
          });
          $scope.groupedData = reduceData(groupedData);
          break;
        case "month":
          $scope.time = {
            format: 'YYYY-MM',
            tooltipFormat: 'YYYY-MM',
            unit: "month"
          };
          // группирование по месяцу
          var groupedData = _.groupBy($scope.response, function(item) {
              return moment(item.stat_date,"YYYY-MM-DD").month();
          });
          $scope.groupedData = reduceData(groupedData);
          break;
      }
      // применение изменений к графику
      $scope.options = {
        responsive: true,
        scales: {
            xAxes: [{
              type: "time",
              time: $scope.time
            }]
        }
      };
      $scope.setData();
    }

    // запрашиваемый скрипт
    var url = '/api/chart?startDate='+
      $scope.startDate+'&endDate='+
      $scope.endDate;

    // данные графика
    $scope.clicks = $scope.shows = $scope.CTR = [];
    // показываемые кривые, по-умолчанию показывать всё
    $scope.showClicks = $scope.showShows = $scope.showCTR = true;

    // данные с сервера
    $scope.response = [];
    // обработанные данные для вывода в график
    $scope.groupedData = [];

    // запрос данных
    $http.get(url).then(function (response) {
      $scope.groupedData = $scope.response = response.data.data;
      $scope.setData();
    });

    // применение данных к графику
    $scope.setData = function() {
      $scope.series = [];
      $scope.labels = $scope.groupedData.map(function (a) { return new Date(a.stat_date) });
      $scope.clicks = $scope.groupedData.map(function (a) { return a.clicks });
      $scope.shows = $scope.groupedData.map(function (a) { return a.shows });
      $scope.CTR = $scope.groupedData.map(function (a) { return a.CTR });

      $scope.data = [];
      if ($scope.showClicks) {
        $scope.data.push($scope.clicks);
        $scope.series.push("Clicks");
      }
      if ($scope.showShows) {
        $scope.data.push($scope.shows);
        $scope.series.push("Shows");
      }
      if ($scope.showCTR) {
        $scope.data.push($scope.CTR);
        $scope.series.push("CTR");
      }
    }
  });
