var options = {enableGesures:true};      //定义options,允许使用手势控制
var output = document.getElementById("output");
var processTime = null;
var hand1PositionX=0,                    //第一个感应手X坐标
    hand1PositionY=0,                    //第一个感应手Y坐标
    hand1PositionZ=0;                    //第一个感应手Z坐标
var thumbTipPositionX=0,                 //拇指指尖位置X坐标
    thumbTipPositionY=0,                 //拇指指尖位置Y坐标
    thumbTipPositionZ=0;                 //拇指指尖位置Z坐标
var indexTipPositionX=0,                 //拇指指尖位置X坐标
    indexTipPositionY=0,                 //拇指指尖位置Y坐标
    indexTipPositionZ=0;                 //拇指指尖位置Z坐标
var fingerTipDistance=0;
var isPinched = false;                   //是否捏住了
var rotateScale=2;                       //转动倍数
//定义是否监测到手，默认是false
var isHandDetected = false;
//定义是否完成手部指令
var isHandComplete = true;
//手和手指
var hand,fingers;
//页面output的所需要参数
var data;

var resetData = function(){
  data={
    frame_id:0,
    hands_detected:isHandDetected,
    hands_complete:isHandComplete,
    num_hands:0,
    left_hand_confidence:0,
    left_hand_pinch_strength:0,
    left_hand_grab_strength:0,
    left_hand_palmPositionX:0,
    left_hand_palmPositionY:0,
    left_hand_palmPositionZ:0,
    left_hand_IsPinched:false,
    right_hand_confidence:0,
    right_hand_pinch_strength:0,
    right_hand_grab_strength:0,
    right_hand_palmPositionX:0,
    right_hand_palmPositionY:0,
    right_hand_palmPositionZ:0,
    right_hand_IsPinched:false,
  };
};



//自转物体方法
var rotateModels = function(model,startRotation,deltaAngleX,deltaAngleY,speed){
  //物体围绕x轴转动deltaAngleY/speed的角度
  model.rotation.x = startRotation.x + deltaAngleX*speed;
  //将物体的围绕X轴的转动角度限制在Math.PI/2和-Math.PI/2之间
  if(model.rotation.x >= Math.PI/2){
    model.rotation.x = Math.PI/2;
  }else if(model.rotation.x <= -Math.PI/2){
    model.rotation.x = -Math.PI/2;
  }
  //物体围绕y轴转动deltaAngleY/speed的角度
  model.rotation.y = startRotation.y + deltaAngleY*speed;
};

//缩放物体方法
var scaleModels = function(model,deltaScale){
  model.scale.x = deltaScale;
  model.scale.y = deltaScale;
  model.scale.z = deltaScale;
  if(model.scale.x <= 1.0){
    model.scale.x = 1.0;
    model.scale.y = 1.0;
    model.scale.z = 1.0;
  }else if(model.scale.x >= 1.5){
    model.scale.x = 1.5;
    model.scale.y = 1.5;
    model.scale.z = 1.5;
  }
}

var handsDetectedFunction = function(frame){
  var leftHand,rightHand;
  if(frame.hands.length>0){
    isHandDetected = true;                  //传感器探测到手    
    if(isHandComplete){
      //如果isComplete为true,则说明刚开始感应到手，则将isHandComplete改为false，且停止倒计时
      isHandComplete = false;
      if(timeout>0)
        clearTimeout(timeout);
      if(frame.hands.length===1){
        //初始化感应开始时，手掌的位置值
        hand = frame.hands[0];
        hand1PositionX = hand.palmPosition[0];
        hand1PositionY = hand.palmPosition[1];
        hand1PositionZ = hand.palmPosition[2];
        //获取当前的围绕x轴y轴的角度
        for(var i = 0; i < rotateTypeArr.length; i++){
          for(var j = 0; j < rotateTypeArr[i].length; j++){
            rotateTypeArr[i][j] = modelArr[i][0].rotation;
          }
        }    
      }
    }else{
      //如果isHandComplete为false，说明检测到的手正在被追踪
      if(frame.hands.length==1){
        hand = frame.hands[0];
        if(hand.pinchStrength!==1&&!isPinched){
          //计算画布的宽和高
          var canvasWidth = window.outerWidth;
          var canvasHeight = window.outerHeight;
          //计算每次移动在x轴，y轴的角度差
          var deltaAngleX = (hand.palmPosition[1] - hand1PositionY)/canvasHeight * Math.PI;
          var deltaAngleY = (hand.palmPosition[0] - hand1PositionX)/canvasWidth * Math.PI;
          //转动物体
          modelArr.forEach(function(temp,i){
            if(temp===null||temp.length<=0)
              return;
            temp.forEach(function(mesh,j){
              rotateModels(mesh,rotateTypeArr[i][j],deltaAngleX,deltaAngleY,rotateScale);
              rotateTypeArr[i][j] = mesh.rotation;
            });
          });
          //覆盖当前触碰位置X/Y坐标，以备计算下次角度差
          hand1PositionX = hand.palmPosition[0];
          hand1PositionY = hand.palmPosition[1];
        }
        else{
          //获取拇指与食指
          fingers = [hand.fingers[0],hand.fingers[1]];
          //如果isPinched为false，则是开始捏住
          if(!isPinched){
            isPinched=!isPinched;
            //初始化拇指与食指指尖的坐标值
            thumbTipPositionX = fingers[0].dipPosition[0];
            thumbTipPositionY = fingers[0].dipPosition[1];
            thumbTipPositionZ = fingers[0].dipPosition[2];
            indexTipPositionX = fingers[1].dipPosition[0];
            indexTipPositionY = fingers[1].dipPosition[1];
            indexTipPositionZ = fingers[1].dipPosition[2];
            fingerTipDistance = Math.sqrt(Math.pow(indexTipPositionX - thumbTipPositionX,2) 
              + Math.pow(indexTipPositionY - thumbTipPositionY,2)); 
            //获取当前的缩放比例
            for(var i = 0;i < scaleTypeArr.length; i++){
              for(var j = 0;j < scaleTypeArr[i].length; j++){
                scaleTypeArr[i][j] = modelArr[i][0].scale.x;
              }
            }
          }else{
            //如果isPinched为true，则是手指正在缩放
            //计算当前两个手指指尖的距离与缩放比
            var currentDistance = Math.sqrt(Math.pow(fingers[1].dipPosition[0] - fingers[0].dipPosition[0],2) +
                          Math.pow(fingers[1].dipPosition[1] - fingers[0].dipPosition[1],2));
            //缩放物体
            modelArr.forEach(function(temp,i){
              if(temp===null||temp.length<=0)
                return;
              var currentScale = currentDistance/fingerTipDistance*scaleTypeArr[i][0];
              temp.forEach(function(mesh,j){
                scaleModels(mesh,currentScale);
                scaleTypeArr[i][j]=currentScale;
              });
            });
            //重置触碰点的位置与之间的距离，以备下次计算
            fingerTipDistance = currentDistance;
            thumbTipPositionX = fingers[0].dipPosition[0];
            thumbTipPositionY = fingers[0].dipPosition[1];
            indexTipPositionX = fingers[1].dipPosition[0];
            indexTipPositionY = fingers[1].dipPosition[1];
          }
        }        
      }      
    }
    frame.hands.forEach(function(hand){
      if(hand.type==="left"){
        leftHand = hand;
        data.left_hand_confidence = leftHand.confidence;
        data.left_hand_pinch_strength = leftHand.pinchStrength;
        data.left_hand_grab_strength = leftHand.grabStrength;
        data.left_hand_palmPositionX = leftHand.palmPosition[0];
        data.left_hand_palmPositionY = leftHand.palmPosition[1];
        data.left_hand_palmPositionZ = leftHand.palmPosition[2];
        data.left_hand_IsPinched = isPinched;
      }else if(hand.type==="right"){
        rightHand = hand;
        data.right_hand_confidence = rightHand.confidence;
        data.right_hand_pinch_strength = rightHand.pinchStrength;
        data.right_hand_grab_strength = rightHand.grabStrength;
        data.right_hand_palmPositionX = rightHand.palmPosition[0];
        data.right_hand_palmPositionY = rightHand.palmPosition[1];
        data.right_hand_palmPositionZ = rightHand.palmPosition[2];
        data.right_hand_IsPinched = isPinched;
      }
    });
    data.frame_id = frame.id;
    data.hands_detected = isHandDetected;
    data.hands_complete = isHandComplete;
    data.num_hands = frame.hands.length;

  }else{
    if(isHandDetected){
      isHandDetected=!isHandDetected;
      if(isPinched)
        isPinched = !isPinched;
      timeout = setTimeout(function() {
        isHandComplete = true;
        resetData();
      }, 3000);
    }
  }  
}

