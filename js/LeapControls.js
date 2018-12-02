var options = {enableGesures:true};      //定义options,允许使用手势控制

var processTime = null;
var hand1PositionX=0,                    //第一个感应手X坐标
    hand1PositionY=0,                    //第一个感应手Y坐标
    hand1PositionZ=0,                    //第一个感应手Z坐标
    hand2PositionX=0,                    //第二个感应手X坐标
    hand2PositionY=0,                    //第二个感应手Y坐标
    hand2PositionZ=0;                    //第二个感应手Z坐标

var isPinched = false;                   //是否捏住了
var rotateScale=2;                       //转动倍数
//定义是否监测到第一只手，是否监测到第二只手，默认是false
var isLeftHandDetected = false, isSecondHandDetected = false;
//定义是否完成手部指令
var isHandComplete = true;
//手和手指
var hand1,hand2,fingers;
//页面output的所需要参数
var data;
//初始缩放命令为放大
var action = "bigger";
//hand光标，pointer光标
var handCursor, pointerCursor;
//当前hand光标，pointer光标所用的图片
var handCursorPng, pointerCursorPng;
//Raycaster
var raycaster = new THREE.Raycaster();

var resetData = function(){
  data={
    IntersectX:0.0,
    IntersectY:0.0,
    IntersectZ:0.0
  };
};

var outputData = function(data){
  var output = document.getElementById('output');
  output.innerHTML = "Raycast intersect vector is X:"+data.IntersectX+" Y:"+data.IntersectY+" Z:"+data.IntersectZ;
}

var getLeftHandIndex = function(hands){
  var result = -1;
  for(var i = 0; i< hands.length; i++){
    if(hands[i].type === 'left')
      result = i;
  }
  return result;
};

var getRightHandIndex = function(hands){
  var result = -1;
  for(var i = 0; i < hands.length; i++){
    if(hands[i].type === 'right')
      result = i;
  }
  return result;
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

var HandCursor = function(hand,type){
  var handCursor = this;
  var img = document.createElement('img');
  img.src = "/img/LeftHand-5-Spread.png";
  handCursorPng = img.src;
  img.style.position = 'absolute';  
  img.onload = function(){
    document.body.appendChild(img);
    handCursor.setTransform(hand.screenPosition());
  };

  handCursor.setTransform = function(position){
    img.style.left = position[0] - img.width  / 2 + 'px';
    img.style.top  = position[1] - img.height / 2 + 'px';
    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
    img.style.OTransform = img.style.transform;
    img.style.display = 'block';
  };
}

var HideHandCursor = function(){
  handCursor = undefined;
  var childrenLength = document.body.children.length;
  var removeChildrenIndex=0;
  for (var i = 0 ;i<childrenLength;i++){
    if(document.body.children[i].tagName === 'IMG'){
      if(document.body.children[i].src === handCursorPng||document.body.children[i].src.indexOf(handCursorPng)>=0){
        removeChildrenIndex = i;
      }
    }
  }
  document.body.children[removeChildrenIndex].remove();
}

var PointerCursor = function(hand){
  var pointerCursor = this;
  var img = document.createElement('img');
  img.src = "/img/RightHand-1.png";
  pointerCursorPng = img.src;
  img.style.position = "absolute";
  img.onload = function(){
    document.body.appendChild(img);
    pointerCursor.setTransform(hand.screenPosition());
  };

  pointerCursor.setTransform = function(position){
    img.style.left = position[0] - img.width / 2 + 'px';
    img.style.top = position[1] - img.height / 2 + 'px';
    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
    img.style.OTransform = img.style.transform;
    img.style.display = 'block';
  };
};

var HidePointerCursor = function(){
  pointerCursor = undefined;
  var childrenLength = document.body.children.length;
  var removeChildrenIndex=0;
  for (var i = 0 ;i<childrenLength;i++){
    if(document.body.children[i].tagName === 'IMG'){
      if(document.body.children[i].src === pointerCursorPng||document.body.children[i].src.indexOf(pointerCursorPng)>=0){
        removeChildrenIndex = i;
      }
    }
  }
  document.body.children[removeChildrenIndex].remove();
}

var LeftHandDetectedFunction = function(frame){
  var leftHand,rightHand;
  //传感器探测到手，最多2只手
  if(frame.hands.length>0&&frame.hands.length<=2){
    var index = getLeftHandIndex(frame.hands);
    //传感器探测到左手 
    if(index>-1){
      isLeftHandDetected = true;                     
      if(isHandComplete){
        //如果isComplete为true,则说明刚开始感应到手，则将isHandComplete改为false，且停止倒计时
        isHandComplete = false;
        if(timeout>0)
          clearTimeout(timeout);
        //初始化感应开始时，手掌的位置值
        hand1 = frame.hands[index];        
        hand1PositionX = hand1.palmPosition[0];
        hand1PositionY = hand1.palmPosition[1];
        hand1PositionZ = hand1.palmPosition[2];
        //定义左手的光标的位置
        handCursor = !handCursor?new HandCursor(hand1,hand1.type):handCursor;
        handCursor.setTransform(hand1.screenPosition());
        //获取当前的围绕x轴y轴的角度
        for(var i = 0; i < rotateTypeArr.length; i++){
          for(var j = 0; j < rotateTypeArr[i].length; j++){
            rotateTypeArr[i][j] = modelArr[i][0].rotation;
          }
        }          
      }else{
        //如果isHandComplete为false，说明检测到的左手正在被追踪
        //获取左手的位置
        hand1 = frame.hands[index];
        //更新左手的光标的位置
        handCursor = !handCursor?new HandCursor(hand1):handCursor;
        handCursor.setTransform(hand1.screenPosition());
        //如果第一只手没有捏和动作，则可以进行移动手转动物体的动作
        if(hand1.pinchStrength!==1&&!isPinched){         
          //计算画布的宽和高
          var canvasWidth = window.outerWidth;
          var canvasHeight = window.outerHeight;
          //计算每次移动在x轴，y轴的角度差
          var deltaAngleX = (hand1.palmPosition[1] - hand1PositionY)/canvasHeight * Math.PI;
          var deltaAngleY = (hand1.palmPosition[0] - hand1PositionX)/canvasWidth * Math.PI;
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
          hand1PositionX = hand1.palmPosition[0];
          hand1PositionY = hand1.palmPosition[1];
        }
        else{
          //如果第一只手进行了捏合动作了，hand1.pinchStrength==1就会是true
          //判断是否是要放大，bigger代表要放大；smaller代表自动缩小
          action = modelArr[0][0].scale.x<=1.5?"bigger":"smaller";          
          if(action==="bigger"){
            //锁住转动物体逻辑
            isPinched = true;
            if(hand1.pinchStrength!==1){   
              //开始放大         
              modelArr.forEach(function(temp,i){
                if(temp===null||temp.length<=0)
                  return;
                temp.forEach(function(mesh,j){
                  mesh.scale.x+=0.01;
                  mesh.scale.y+=0.01;
                  mesh.scale.z+=0.01;
                });
              });    
            }                  
          }else{
            //完成放大，解锁转动物体逻辑
            isPinched = false;
            return;
          }          
        }             
      }
    }else{
      //监测不到左手了
      if(isLeftHandDetected){
        isLeftHandDetected = false;
        isPinched = false
        HideHandCursor();
        //倒计时3秒，手部时间彻底结束，物体恢复自转状态
        timeout = setTimeout(function() {
          isHandComplete = true;
          //resetData();
        }, 3000);    
      }    
    }        
  }else{
    if(isLeftHandDetected){
      //监测不到左手了
      isLeftHandDetected = false;
      isPinched = false
      HideHandCursor();
      //倒计时3秒，手部时间彻底结束，物体恢复自转状态
      timeout = setTimeout(function() {
        isHandComplete = true;
        //resetData();
      }, 3000);    
    }    
  }  
}

var RightHandDetectedFunction = function(frame){
  //传感器探测到手，最多2只手
  if(frame.hands.length>0&&frame.hands.length<=2){
    var index = getRightHandIndex(frame.hands);
    //传感器探测到右手
    if(index>-1){
      isSecondHandDetected = true;
      //初始化感应时，手的对象
      hand2 = frame.hands[index];
      //定义右手光标，以及光标位置
      pointerCursor = !pointerCursor?new PointerCursor(hand2):pointerCursor;
      pointerCursor.setTransform(hand2.screenPosition());
      //Raycast
      RaycastIntersect(hand2.screenPosition());
    }else{
      if(isSecondHandDetected){
        isSecondHandDetected = false;
        HidePointerCursor();
      }    
    }  
  }else{
    if(isSecondHandDetected){
      isSecondHandDetected = false;
      HidePointerCursor();
    }  
  }
}

var RaycastIntersect = function(handposition){
  var handcoords;
  //获取handposition转化为控件右手坐标系的二维坐标值
  var x = (handposition[0]/width)*2-1;
  var y = -(handposition[1]/height)*2+1;
  handcoords = new THREE.Vector3(x,y,0);
  raycaster.setFromCamera(handcoords,camera);
  
  var intersects = raycaster.intersectObjects(modelArr[0],true);

  if(intersects.length>0){
    data.IntersectX = intersects[0].point.x;
    data.IntersectY = intersects[0].point.y;
    data.IntersectZ = intersects[0].point.z;
    console.log(intersects[0].face);
  }else{
    resetData();
  }

}

