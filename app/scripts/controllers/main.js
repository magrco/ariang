(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$scope', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $interval, aria2RpcService, ariaNgSettingService, utils) {
        var globalStatRefreshPromise = null;

        var processStatResult = function (stat) {
            var activeCount = parseInt(stat.numActive);
            var waitingCount = parseInt(stat.numWaiting);
            var totalRunningCount = activeCount + waitingCount;

            stat.totalRunningCount = totalRunningCount;
        };

        var refreshGlobalStat = function () {
            aria2RpcService.getGlobalStat({
                callback: function (result) {
                    if (result) {
                        processStatResult(result);
                    }

                    $scope.globalStat = result;
                }
            });
        };

        refreshGlobalStat();

        $scope.changeDisplayOrder = function (type, autoSetReverse) {
            var oldType = utils.parseOrderType(ariaNgSettingService.getDisplayOrder());
            var newType = utils.parseOrderType(type);

            if (autoSetReverse && newType.type == oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setDisplayOrder(newType.getValue());
        };

        $scope.isSetDisplayOrder = function (type, reverse) {
            var orderType = utils.parseOrderType(ariaNgSettingService.getDisplayOrder());

            if (angular.isUndefined(reverse)) {
                return orderType.type === type;
            } else {
                return orderType.type === type && orderType.reverse === reverse;
            }
        };

        $scope.showSidebar = function () {
            angular.element('body').removeClass('sidebar-collapse').addClass('sidebar-open');
        };

        $scope.hideSidebar = function () {
            angular.element('body').addClass('sidebar-collapse').removeClass('sidebar-open');
        };

        if (ariaNgSettingService.getGlobalStatRefreshInterval() > 0) {
            globalStatRefreshPromise = $interval(function () {
                refreshGlobalStat();
            }, ariaNgSettingService.getGlobalStatRefreshInterval());
        }

        $scope.$on('$destroy', function () {
            if (globalStatRefreshPromise) {
                $interval.cancel(globalStatRefreshPromise);
            }
        });
    }]);
})();