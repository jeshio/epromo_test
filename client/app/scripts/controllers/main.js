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
    var startDate='2016-05-01',
        offset = 10,
        limit = 10;

    var url = 'http://localhost:5000/api/table?startDate='+startDate+'&offset='+offset+'&limit='+limit;
    $scope.records = new Array();

    $http.get(url).then(function (response) {
      var groups = new Array();
      angular.forEach(response.data.data, function (record) {
        var temp = { phrase: record.phrase, shows: record.stat.shows,
          clicks: record.stat.clicks, sum: record.stat.sum };
        angular.forEach(record.campaign.groups, function (group) {
          if (groups[group.name] === undefined)
            groups[group.name] = new Array();

          if (groups[group.name][record.adgroup_name] === undefined)
            groups[group.name][record.adgroup_name] = new Array();

          groups[group.name][record.adgroup_name].push(temp);
        })
      });
      for (var groupName in groups) {
        var normaliseAds = new Array();
        for (var adName in groups[groupName]) {
          normaliseAds.push({adGroup: adName, results: groups[groupName][adName]});
        }
        var temp = { group: groupName, adGroups: normaliseAds };
        $scope.records.push(temp);
      };
      $scope.gridOptions.api.setRowData($scope.records);
    });

    // ad-grid параметры
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
      {headerName: "Ad Groups", cellRenderer: 'group', field: 'adGroups',
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
      {headerName: "Shows", field: "shows", width: 100},
      {headerName: "Clicks", field: "clicks", width: 100},
      {headerName: "Sum", field: "sum", width: 100},
    ];

    $scope.gridOptions = {
      columnDefs: columnDefs,
      rowData: $scope.records,
      enableColResize: true,
      enableSorting: true,
      getNodeChildDetails: getNodeChildDetails,
      onGridReady: function(params) {
          params.api.sizeColumnsToFit();
      }
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
});
