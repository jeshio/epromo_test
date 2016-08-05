'use strict';

/**
 * @ngdoc overview
 * @name epromoApp
 * @description
 * # epromoApp
 *
 * Main module of the application.
 */
agGrid.initialiseAgGridWithAngular1(angular);
angular
  .module('epromoApp', [
    'ngResource',
    'ngRoute',
    'agGrid'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
