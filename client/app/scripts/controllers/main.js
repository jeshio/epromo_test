'use strict';

/**
 * @ngdoc function
 * @name epromoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the epromoApp
 */
angular.module('epromoApp')
  .controller('MainCtrl', function($scope, $http) {
    // количество значений на странице
    $scope.pageSize = 10;
    // обработанные записи для вывода в таблицу
    $scope.records = [];

    $scope.startDate = "2016-07-01";
    $scope.endDate = "";

    // ad-grid параметры колонок
    var columnDefs = [
      {headerName: "Group", cellRenderer: 'group', field: 'group',
      cellRendererParams: {
        // убирает количество детей
        innerRenderer: function (params) {
          if (params.data.group) {
            return params.data.group;
          } else {
            return null;
          }
        }
        }
      },
      {headerName: "Ad Groups", cellRenderer: 'group', field: 'adGroup',
      cellRendererParams: {
          // убирает количество детей
          innerRenderer: function (params) {
            if (params.data.adGroup) {
              return params.data.adGroup;
            } else {
              return null;
            }
          }
        }
      },
      {headerName: "Phrase", field: "phrase"},
      {headerName: "Shows", field: "shows", width: 100, filter: 'number'},
      {headerName: "Clicks", field: "clicks", width: 100, filter: 'number'},
      {headerName: "Sum", field: "sum", width: 100, filter: 'number'},
      // скрытые колонки для поиска
      {headerName: "", field: "groupSearch", hide: true},
      {headerName: "", field: "adSearch", hide: true},
    ];

    // параметры таблицы
    $scope.gridOptions = {
      columnDefs: columnDefs,
      // rowData: null,
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      rowModelType: 'pagination',
      getNodeChildDetails: getNodeChildDetails,
      onGridReady: function(params) {
          params.api.sizeColumnsToFit();
          $scope.loadTable();
      }
    };

    // запрос данных
    function formatData(data) {
      // промежуточные итоги
      var sumShows = 0, sumClicks = 0, sumSums = 0;
      $scope.records = [];
      // группирование данных
      var groups = [];
      var groupClicks, groupShows, groupSum, clicks, shows, sum;
      angular.forEach(data, function (record) {
        var temp = { adSearch: record.adgroup_name, phrase: record.phrase, shows: record.stat.shows,
          clicks: record.stat.clicks, sum: record.stat.sum };

        // создание ассоциативного двухмерного массива - группа->группа реклам->фраза
        angular.forEach(record.campaign.groups, function (group) {
          if (groups[group.name] === undefined)
            groups[group.name] = [];

          if (groups[group.name][record.adgroup_name] === undefined)
            groups[group.name][record.adgroup_name] = [];

          groups[group.name][record.adgroup_name].push(Object.assign(temp, {groupSearch:group.name}));
        });
      });
      // преобразование массива в формат ad-grid
      for (var groupName in groups) {
        groupClicks = groupShows = groupSum = 0;
        var normaliseAds = [];
        for (var adName in groups[groupName]) {
          clicks = shows = sum = 0;
          for (var phrase in groups[groupName][adName]) {
            clicks += groups[groupName][adName][phrase].clicks;
            shows += groups[groupName][adName][phrase].shows;
            sum += groups[groupName][adName][phrase].sum;
          }
          groupClicks += clicks;
          groupShows += shows;
          groupSum += sum;
          normaliseAds.push({adGroup: adName, shows: shows, clicks: clicks, sum: sum, results: groups[groupName][adName]});
        }
        var temp = { group: groupName, shows: groupShows, clicks: groupClicks, sum: groupSum, adGroups: normaliseAds };
        $scope.records.push(temp);
        sumShows += groupShows;
        sumClicks += groupClicks;
        sumSums += groupSum;
      }

      // добавление сумм к таблице
      $scope.records.unshift({shows: sumShows, clicks: sumClicks, sum: sumSums});
    }

    // фильтр по всем столбцам
    $scope.onFilterChanged = function (value) {
        $scope.gridOptions.api.setQuickFilter(value);
    };

    function getNodeChildDetails(rowItem) {
        if (rowItem.group) {
          return {
            // содержит детей
            group: true,
            // раскрытый спсиок - условие
            expanded: rowItem.open,

            children: rowItem.adGroups,
            field: 'group',
            key: rowItem.group
          };
        } else if (rowItem.adGroup) {
          return {
              group: true,
              children: rowItem.results,
              expanded: rowItem.open,
              field: 'adGroup',
              key: rowItem.adGroup
          };
        } else {
            return null;
        }
    }

    $scope.onPageSizeChange = function () {
      $scope.loadTable();
    }

    $scope.loadTable = function() {
      var dataSource = {
        pageSize: $scope.pageSize,
        rowCount: -1,
        getRows: function(params) {
          // параметры запроса
          var offset = params.startRow,
              limit = params.endRow - params.startRow;

          // запрашиваемый скрипт
          var url = 'http://localhost:3000/api/table?startDate='+$scope.startDate+
          '&endDate='+$scope.endDate+'&offset='+offset+'&limit='+limit;

          $http.get(url).then(function (response) {
            formatData(response.data.data);
            params.successCallback($scope.records);
          });
        }
      };
      $scope.gridOptions.api.setDatasource(dataSource);
    }

    $scope.shows = $scope.clicks = $scope.sum = true;
    // показ/скрытие колонок
    $scope.setShows = function (value) {
      $scope.gridOptions.columnApi.setColumnVisible('shows', value);
    }
    $scope.setClicks = function (value) {
      $scope.gridOptions.columnApi.setColumnVisible('clicks', value);
    }
    $scope.setSum = function (value) {
      $scope.gridOptions.columnApi.setColumnVisible('sum', value);
    }
});
