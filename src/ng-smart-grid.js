(function(angular, undefined){
  angular.module('smart-grid', [])
    .controller('SgController', function($scope, $parse, $attrs, $q){
      var list = $parse($attrs.sgGrid)($scope);
      var pageSize = $parse($attrs.sgPageSize)($scope) || list.length;
      var center = new DataCenter(list, pageSize, $q);
      var state;

      $scope.sgList = [];

      this.state = state = {
        pageNum: -1,
        totalPage: -1,
        keyword: '',
        predicate: ''
      };
      this.paginate = paginate;
      this.search = search;
      this.setDecision = setDecision;

      paginate(1);

      function paginate(pageNum){
        center.search({
            keyword: state.keyword,
            predicate: state.predicate,
            pageNum: pageNum
          })
          .then(onDataSuccess);
      }

      function search(keyword, predicate){
        center.search({
            keyword: keyword,
            predicate: predicate,
            pageNum: 1
          })
          .then(onDataSuccess)
          .then(function(){
            state.keyword = keyword;
            state.predicate = predicate;
          })
      }

      function setDecision(fn){
        center.setDecision(fn);
      }

      function onDataSuccess(result){
        $scope.sgList = result.data;
        state.pageNum = result.pageNum;
        state.totalPage = result.totalPage;
      }

    })
    .directive('sgGrid', function(){
      return {
        restrict: 'A',
        controller: 'SgController',
        link: function(scope, element, attrs, ctrl){
          var customDecision = scope.$eval(attrs.sgSetDecision);

          if (customDecision) {
            ctrl.setDecision(customDecision);
          }
        }
      }
    })
    .directive('sgPagination', function(){
      return {
        restrict: 'A',
        require: '^sgGrid',
        templateUrl: function(element, attrs){
          return attrs.sgPagesTemplate;
        },
        link: function(scope, element, attr, ctrl){
          var state = ctrl.state;

          scope.sgSelectPage = function(num){
            num = window.parseInt(num, 10);
            if(window.isNaN(num) || !num){ num = 1; }
            if(num === state.pageNum){ return; }
            ctrl.paginate(num);
          };

          scope.$watch(function(){
            return state;
          }, rePage, true);

          function rePage(){
            var i = 0, ln = state.totalPage;
            scope.sgTotalPage = state.totalPage;
            scope.sgPages = [];
            for(;i<ln;i++){
              scope.sgPages.push(i+1);
            }
            scope.currentPage = state.pageNum;
          }

        }
      }
    });



  function DataCenter(data, pageSize, $q){
    this.rawData = data;
    this.pageSize = pageSize;
    this.$q = $q;
    // 默认decision
    this.decision = function(row, cell, keyword, predicate){
      return cell.indexOf(keyword) > -1;
    };
    this.replaceFn = function(cell, keyword, replacement, predicate){
      if(cell.match(keyword)){
        cell.replace(keyword, replacement);
        return true;
      }
      return false;
    }
  }

  DataCenter.prototype.search = search;
  DataCenter.prototype.setDecision = setDecision;
  DataCenter.prototype.replaceByCol = replaceByCol;

  /**
   * 搜索数据
   * {
   *   pageNum
   *   keyword
   *   predicate
   * }
   * */
  function search(queries){
    var defer = this.$q.defer();
    var pageNum = queries.pageNum || 1;
    var keyword = queries.keyword || '';
    var predicate = queries.predicate || '';
    var start, end;
    var pageSize = this.pageSize;
    var rawData = this.rawData;
    var result;
    var inPageData;
    start = (pageNum - 1) * pageSize;
    end = start + pageSize;
    result = filter(rawData, keyword, predicate, this.decision);
    inPageData = result.slice(start, end);

    defer.resolve({
      data: inPageData,
      totalPage: Math.ceil(result.length / pageSize),
      pageNum: pageNum
    });
    return defer.promise;
  }

  /**按单元格过滤每一行*/
  function filter(list, keyword, predicate, decision){
    var res = [];
    if(predicate === '' || keyword === ''){
      return list;
    }
    list.forEach(function(row){
      var cell = row[predicate];
      if(typeof cell !== 'undefined' && decision(row, cell, keyword, predicate)){
        res.push(row);
      }
    });
    return res;
  }

  /**
   * 设置decision函数
   * decision在filter中使用，决定单元格内容是否符合过滤条件
   * decision(row, cell, keyword, predicate)
   * 该函数必须返回布尔值
   * */
  function setDecision(decision){
    this.decision = decision;
  }

  function replaceByCol(keyword, replacement, predicate){
    var count = 0;
    var rawData = this.rawData;
    var replaceFn = this.replaceFn;
    rawData.forEach(function(row){
      var cell = row[predicate];
      if(typeof cell === 'undefined'){ return; }
      if(replaceFn(cell, keyword, replacement, predicate)){
        count++;
      }
    });
    return count;
  }





})(angular);