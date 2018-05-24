var options = {enableGesures:true};      //定义options,允许使用手势控制
var palm1PositionX=0,                    //第一个触碰X坐标
    palm1PositionY=0,                    //第一个触碰Y坐标
    palm2PositionX=0,                    //第二个触碰X坐标
    palm2PositionY=0;                    //第二个触碰Y坐标

var controller = new Leap.Controller(options);  //初始化leap controller
controller.connect();

var swipeStart = function(hands){
  if(isGestureProcessing)
    return;
  isGestureProcessing = true;
  //确保是单手swipe
  if(hands.length===1){
    palm1PositionX = hands[0].palmPosition[0];
    palm1PositionY = hands[0].palmPosition[1];
    console.log("start palm1PositionX is "+palm1PositionX+", palm1PositionY is "+palm1PositionY);
    //获取当前的围绕x轴y轴的角度
    rotateTypeArr.forEach(function(temp,i){
      if(temp===null||temp.length<=0)
        return;
      temp.forEach(function(rotate){
        rotate = modelArr[i][0].rotation;
      });
    });
  }
};

var swiping = function(hands){
  //确保一次只处理一个手势
  if(!isGestureProcessing)
    return;
  if(hands.length===1){
    palm1PositionX = hands[0].palmPosition[0];
    palm1PositionY = hands[0].palmPosition[1];
    console.log("palm1PositionX is "+palm1PositionX+", palm1PositionY is "+palm1PositionY);
  }
};

var swipStop = function(hands){
  //gestureString += "Swipe stop at x: "+gesture.position[0]+" y: "+gesture.position[1]+" z: "+gesture.position[2]+"<br>";
  if(!isGestureProcessing)
    return;
  if(hands.length===1){
    palm1PositionX = hands[0].palmPosition[0];
    palm1PositionY = hands[0].palmPosition[1];
    console.log("stop palm1PositionX is "+palm1PositionX+", palm1PositionY is "+palm1PositionY);
  }
  //恢复touchDown = false
  timeout = setTimeout(function () {
    isGestureProcessing = false;
  }, 3000);
}

//leap controller 检测到手势事件。
controller.on('gesture',function(gesture,frame){
  //确保该帧是正常存在的
  if(frame.valid&&frame.gestures.length>0){
    //遍历该帧中每一个手势
    frame.gestures.forEach(function(gesture){
      var hands = frame.hands;
      //确保当前手势是swipe手势
      if(gesture.type === "swipe"){
        if(gesture.state === "start"){
          swipeStart(hands);
        }
        else if (gesture.state === "update"){
          swiping(hands);
        }
        else if(gesture.state ==="stop"){
          swipStop(hands);
        }
        else{
          return;
        }
      }

    });
  }
});
