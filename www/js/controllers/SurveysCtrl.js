angular.module('starter.controllers')

.controller('SurveysCtrl', function($scope, $rootScope, $state, Survey, $ionicLoading){
  $scope.surveys = [];

  $scope.init = function(){
    $ionicLoading.show();
    Survey.get().then(function(s){
      $scope.surveys = $rootScope.objToArr(s);
      console.log($scope.surveys);
      $ionicLoading.hide();
    }, function(e){
      console.log(e);
      $ionicLoading.hide();
    }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.openSurvey = function(survey){
    if(survey.status == 'active'){
      $state.go('menu.survey', {id:survey.id});
    }
  }


  $scope.init();
})

.controller('SurveyDetailCtrl', function($scope, $rootScope, survey, Survey, $ionicHistory, $timeout, Members){
  $scope.survey = survey;
  $scope.data = [];

  $scope.back = function(){
      $timeout(function(){
        $ionicHistory.goBack();
          // $state.go('app.tab.events')
      });

  };

  $scope.checkBoxClick = function(answer, q){
    if(angular.isUndefined(q.answerT)){
      q.answerT = [];
    }
    if(q.answer_arr[answer.id]){
      q.answerT.push(answer);
    }
    else {
      q.answerT.splice(q.answerT.indexOf(answer), 1);
    }
    console.log(q.answerT);
  }

  $scope.checkBoxRequired = function(values){

    if(angular.isUndefined(values)){
      return true;
    }
    var res = Object.keys(values).some(function(key){
      return values[key];
    });
    return !res;
  }

  $scope.submit = function(mySurvey){
    $scope.survey.questions.map(function(q){
      if(q.multiple_choice){
        q.answer = JSON.stringify(q.answerT);
      }
      return q;
    });
    // console.log(mySurvey);
    Survey.submit(JSON.stringify($scope.survey)).then(function(s){
      console.log(s);
      var options = {
          title:"Survey Submit Successfully.",
          cssClass:'thx-msg',
          tpl:'',
          okText:'OK',
          okType: 'button-magenta',
          callBack: function(){
            $scope.back();
            $rootScope.$broadcast('RewardPoint', {point:parseInt(s.point_reward)});
            Members.getMember().then(function(member){
                $rootScope.member = member.data.data;
            });
          }
      }
      $rootScope.createAlertPopup(options);
    }, function(e){
      var options = {
          title:"Opps! Something went wrong, please try again",
          cssClass:'thx-msg',
          tpl:'',
          okText:'OK',
          okType: 'button-magenta',
          callBack: function(){

          }
      }
      $rootScope.createAlertPopup(options);
    });
  }

  $scope.orderByQuestionOrder = function(q1){
    return q1.pivot.question_order;
  }


  $timeout(function(){
    console.log('Surveys');
    window.ga.trackView('Surveys','', true);
  });
});
