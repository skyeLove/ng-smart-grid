angular.module('app', ['smart-grid'])
  .controller('Main', function($scope){
    var list = [];
    var names = ['foo', 'bar', 'jake', 'lint', 'inject', 'fish', 'Allen', 'barry', 'merlin'];
    var namesln = names.length;
    for(var i=0; i<1200; i++){
      var j = window.parseInt(Math.random()*namesln, 10);
      var err = [];
      if(j > namesln/2){
        err.push('err1');
      }else{
        err.push('err2');
      }
      list.push({
        index: i,
        id: i+1,
        name: names[j],
        age: 1,
        error: err
      });
    }
    $scope.list = list;


    $scope.customDecision = function(row, cell, keyword, predicate){
      if(predicate === 'error'){
        if(keyword == '-1'){ return true; }
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

        scope.errRule = '-1';
        scope.$watch('errRule', function(v){
          if(v){
            ctrl.search(v, predicate || '');
          }
        });
      }
    }
  });