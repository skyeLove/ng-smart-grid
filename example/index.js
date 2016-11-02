angular.module('app', ['smart-grid'])
  .controller('Main', function($scope){
    var list = [];
    var names = ['foo', 'bar', 'jake', 'lint', 'inject', 'fish'];
    var namesln = names.length;
    for(var i=0; i<12000; i++){
      var j = window.parseInt(Math.random()*namesln - 1, 10);
      list.push({
        index: i,
        id: i+1,
        name: names[j],
        age: 1,
        error: ['err1', 'err2']
      });
    }
    $scope.list = list;


    $scope.customDecision = function(row, cell, keyword, predicate){
      if(predicate === 'error'){
        return cell.includes(keyword);
      }else{
        return cell.indexOf(keyword) > -1;
      }
    };
  })

  .directive('appSelectPage', function(){
    return {
      restrict: 'E',
      require: '^sgGrid',
      replace: true,
      template: '<select ng-init="inputPage = 1"\
          ng-model="inputPage"\
          ng-options="page for page in sgPages"></select>',
      link: function(scope, element, attrs, ctrl){

        scope.$watch('currentPage', function(v){
          scope.inputPage = v;
        });

        scope.$watch('inputPage', function(num){
          if(!num){scope.inputPage=1;}
          scope.sgSelectPage(num);
        });

      }
    }
  })

  .directive('searchInput', function(){
    return {
      restrict: 'A',
      require: '^sgGrid',
      link: function(scope, element, attrs, ctrl){
        var predicate = attrs.searchInput;

        element.bind('keydown', function(e){
          e = e.originalEvent || e;
          if(e.which === 13){
            ctrl.search(e.target.value, predicate || '');
          }
        });
      }
    }
  })

  .directive('searchSelect', function(){
    return {
      restrict: 'A',
      require: '^sgGrid',

      link: function(scope, element, attrs, ctrl){
        var predicate = attrs.searchSelect;
        scope.$watch('errRule', function(v){
          if(v){
            ctrl.search(v, predicate || '');
          }
        });
      }
    }
  });