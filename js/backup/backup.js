var options = {enableGesures:true};      //定义options,允许使用手势控制
var output = document.getElementById("output");
var processTime = null;
var gesture1PositionX=0,                    //第一个触碰X坐标
    gesture1PositionY=0,                    //第一个触碰Y坐标
    gesture2PositionX=0,                    //第二个触碰X坐标
    gesture2PositionY=0;                    //第二个触碰Y坐标
var gestureRotateScale = 0.01;

var controller = new Leap.Controller(options);  //初始化leap controller
controller.connect();

var swipeStart = function(frame,hands,){
  if(hands.length<=0||hands.length>2)
    return;
  if(timeout>0)
    clearTimeout(timeout);
  isHandDetected = true;
  //确保是单手swipe
  if(hands.length===1){
  
  }
};

var swiping = function(frame,hands){
  if(hands.length<=0||hands.length>2)
    return;
  if(timeout>0)
    clearTimeout(timeout);
  //确保一次只处理一个手势
  if(hands.length===1){
    
  }
};

var swipStop = function(frame,hands){
  if(hands.length===1){
    
  }
  
  //恢复touchDown = false
  timeout = setTimeout(function () {

    isHandDetected = false;  
    processTime = null;
  }, 3000);
}

var resetData = function(){
  data={
    frame_id:0,
    hands_detected:isHandDetected,
    hands_complete:isHandComplete,
    num_hands:0
  };
};

//leap controller 获取每一帧事件
controller.on('frame',function(frame){  
  if(frame.hands.length>0){
    console.log("abd");
    isHandDetected = true;
    isHandComplete = false;
    if(timeout>0)
      clearTimeout(timeout);
  }else{
    if(isHandDetected){
      isHandDetected=!isHandDetected;
      timeout = setTimeout(function() {
        isHandComplete = true;
      }, 3000);
    }
  }
  data.frame_id = frame.id;
  data.hands_detected = isHandDetected;
  data.hands_complete = isHandComplete;
  data.num_hands = frame.hands.length;
});

var handsTranslate = function(frame){
  if(frame.hands.length>0){
    console.log("abd");
    isHandDetected = true;
    isHandComplete = false;
    if(timeout>0)
      clearTimeout(timeout);
  }else{
    if(isHandDetected){
      isHandDetected=!isHandDetected;
      timeout = setTimeout(function() {
        isHandComplete = true;
      }, 3000);
    }
  }
  data.frame_id = frame.id;
  data.hands_detected = isHandDetected;
  data.hands_complete = isHandComplete;
  data.num_hands = frame.hands.length;
}

//leap controller 检测到手势事件。
//controller.on('gesture',function(gesture,frame){
//  var hands = frame.hands;
//  //确保当前手势是swipe手势
//  if(gesture.type === "swipe"){
//    data.gestureState = gesture.state;
//    if(gesture.state === "start"){
//      processTime = new Date();
//      swipeStart(frame,hands,gesture);
//    }
//    else if (gesture.state === "update"){
//      processTime = new Date();
//      swiping(frame,hands,gesture);
//    }
//    else if(gesture.state ==="stop"){
//      swipStop(frame,hands,gesture);
//    }
//    else{
//      return;
//    }
//  }
//});
