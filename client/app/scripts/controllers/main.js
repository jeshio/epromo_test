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
    // промежуточные итоги
    var sumShows = 0, sumClicks = 0, sumSums = 0;

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
          loadTable();
      }
    };

    // запрос данных
    function formatData(data) {
      $scope.records = [];
      // группирование данных
      var groups = [];
      angular.forEach(data, function (record) {
        var temp = { adSearch: record.adgroup_name, phrase: record.phrase, shows: record.stat.shows,
          clicks: record.stat.clicks, sum: record.stat.sum };
        sumShows += record.stat.shows;
        sumClicks += record.stat.clicks;
        sumSums += record.stat.sum;
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
        var normaliseAds = [];
        for (var adName in groups[groupName]) {
          normaliseAds.push({adGroup: adName, results: groups[groupName][adName]});
        }
        var temp = { group: groupName, adGroups: normaliseAds };
        $scope.records.push(temp);
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
      loadTable();
    }

    function loadTable() {
      var dataSource = {
        pageSize: $scope.pageSize,
        rowCount: -1,
        getRows: function(params) {
          // параметры запроса
          var startDate='2016-05-01',
              offset = params.startRow,
              limit = params.endRow - params.startRow;

          // запрашиваемый скрипт
          var url = 'http://localhost:5000/api/table?startDate='+startDate+'&offset='+offset+'&limit='+limit;

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
