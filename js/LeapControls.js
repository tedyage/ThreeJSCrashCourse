var options = {enableGesures:true};      //定义options,允许使用手势控制
var output = document.getElementById("output");
var processTime = null;
var gesture1PositionX=0,                    //第一个触碰X坐标
    gesture1PositionY=0,                    //第一个触碰Y坐标
    gesture2PositionX=0,                    //第二个触碰X坐标
    gesture2PositionY=0;                    //第二个触碰Y坐标
var gestureRotateScale = 0.01;
var data={
  gestureid:0,
  gestureState:"",
  startPositionX:0,
  startPositionY:0,
  startPositionZ:0,
  positionX:0,
  positionY:0,
  positionZ:0,
  endPositionX:0,
  endPositionY:0,
  endPositionZ:0,
  direction:""
};

var template = document.getElementById("template").innerHTML.trim();
Mustache.parse(template);

var controller = new Leap.Controller(options);  //初始化leap controller
controller.connect();

var swipeStart = function(frame,hands,gesture){
  if(hands.length<=0||hands.length>2)
    return;
  if(timeout>0)
    clearTimeout(timeout);
  isGestureProcessing = true;
  //确保是单手swipe
  if(hands.length===1){
    data.gestureid=gesture.id;
    data.startPositionX=gesture.startPosition[0];
    data.startPositionY=gesture.startPosition[1];
    data.startPositionZ=gesture.startPosition[2];
    gesture1PositionX = data.startPositionX;
    gesture1PositionY = data.startPositionY;
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

var swiping = function(frame,hands,gesture){
  if(hands.length<=0||hands.length>2)
    return;
  if(timeout>0)
    clearTimeout(timeout);
  //确保一次只处理一个手势
  if(hands.length===1){
    if(gesture.direction[0]>0){
      data.direction = "right";
    }else{
      data.direction = "left";
    }
    data.positionX=gesture.position[0];
    data.positionY=gesture.position[1];
    data.positionZ=gesture.position[2];
    //计算手势交互区域的宽和高
    var width = frame.interactionBox.width;
    var height = frame.interactionBox.height;
    //计算每次移动在x轴，y轴的角度差
    var deltaAngleX = (gesture.position[1] - gesture1PositionY)/height * Math.PI;
    var deltaAngleY = (gesture.position[0] - gesture1PositionX)/width * Math.PI;
    //转动物体
    modelArr.forEach(function(temp,i){
      if(temp===null||temp.length<=0)
        return;
      temp.forEach(function(mesh,j){
        rotateModels(mesh,rotateTypeArr[i][j],deltaAngleX,deltaAngleY,gestureRotateScale);
        rotateTypeArr[i][j] = mesh.rotation;
      });
    });
    //覆盖当前手势位置X/Y坐标，以备计算下次角度差
    gesture1PositionX = data.startPositionX;
    gesture1PositionY = data.startPositionY;
  }
};

var swipStop = function(frame,hands,gesture){
  if(hands.length===1){
    data.endPositionX=gesture.position[0];
    data.endPositionY=gesture.position[1];
    data.endPositionZ=gesture.position[2];
    gesture1PositionX = data.startPositionX;
    gesture1PositionY = data.startPositionY;
  }
  //恢复touchDown = false
  timeout = setTimeout(function () {
    console.log("stop");
    isGestureProcessing = false;
    processTime = null;
  }, 3000);
}

var resetData = function(){
  data={
    gestureid:0,
    gestureState:"",
    startPositionX:0,
    startPositionY:0,
    startPositionZ:0,
    positionX:0,
    positionY:0,
    positionZ:0,
    endPositionX:0,
    endPositionY:0,
    endPositionZ:0,
    direction:""
  };
};

//leap controller 获取每一帧事件
controller.on('frame',function(frame){
  output.innerHTML = Mustache.render(template,data);
  //var current = new Date();
  //if(processTime!==null){
  //  var diff = Math.abs(current-processTime);
    //应对没有stop情况的手势
  //  if(diff>=3000&&frame.hands.length<=0){
  //    console.log("diff");
  //    isGestureProcessing = false;
  //    processTime = null;
  //    resetData();
  //  }
  //}
});

//leap controller 检测到手势事件。
controller.on('gesture',function(gesture,frame){
  var hands = frame.hands;
  //确保当前手势是swipe手势
  if(gesture.type === "swipe"){
    data.gestureState = gesture.state;
    if(gesture.state === "start"){
      processTime = new Date();
      swipeStart(frame,hands,gesture);
    }
    else if (gesture.state === "update"){
      processTime = new Date();
      swiping(frame,hands,gesture);
    }
    else if(gesture.state ==="stop"){
      swipStop(frame,hands,gesture);
    }
    else{
      return;
    }
  }
});
