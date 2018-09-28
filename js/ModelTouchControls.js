var touch1PositionX=0,                    //第一个触碰X坐标
    touch1PositionY=0,                    //第一个触碰Y坐标
    touch2PositionX=0,                    //第二个触碰X坐标
    touch2PositionY=0,                    //第二个触碰Y坐标
    touchDistance=0;                     //两个触碰点间的距离
    rotateScale=0.5;                            //转动倍数
var timeout;

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

//在屏幕上输出参数
var showParameters = function(str,val){
  var res = str+" : "+val;
  var span = document.createElement("span");
  span.innerHTML=res;
  var info = document.getElementById("info");
  info.innerHTML="";
  info.append(span);
};

//触碰开始方法
var touchstart = function(event){
  event.preventDefault();
  //如果结束触碰后5秒之内，再次触碰，则清空倒计时
  if(timeout>0)
    clearTimeout(timeout);
  touchDown = true;    //开始触碰
  var targetTouches = event.targetTouches;
  //排除无接触与三只手指以上接触的。
  if(targetTouches === null|| targetTouches.length<=0||targetTouches.length>2)
    return;
  //单手指触碰，旋转物体
  if(targetTouches.length==1){
    //获取当前的触碰的位置x/y坐标
    touch1PositionX = targetTouches[0].pageX;
    touch1PositionY = targetTouches[0].pageY;
    //获取当前的围绕x轴y轴的角度
    for(var i = 0; i < rotateTypeArr.length; i++){
      for(var j = 0; j < rotateTypeArr[i].length; j++){
        rotateTypeArr[i][j] = modelArr[i][0].rotation;
      }
    }
  }
  //两个手指触碰，缩放物体
  else{
    //获取当前的触碰的位置x/y坐标
    touch1PositionX = targetTouches[0].pageX;
    touch1PositionY = targetTouches[0].pageY;
    touch2PositionX = targetTouches[1].pageX;
    touch2PositionY = targetTouches[1].pageY;
    touchDistance = Math.sqrt(Math.pow(touch2PositionX - touch1PositionX,2) + Math.pow(touch2PositionY - touch1PositionY,2));    
    //获取当前的缩放比例
    for(var i = 0;i < scaleTypeArr.length; i++){
      for(var j = 0;j < scaleTypeArr[i].length; j++){
        scaleTypeArr[i][j] = modelArr[i][0].scale.x;
      }
    }
  }
};

//移动拖动手指
var touchmove = function(event){
  event.preventDefault();
  //如果物体在运动中，则touchmove事件不作任何事情。
  if(!touchDown)
    return;
  var targetTouches = event.targetTouches;
  //排除无接触与三只手指以上接触的。
  if(targetTouches === null || targetTouches.length<=0 || targetTouches.length>2)
    return;
  //单手指触碰，旋转物体
  if(targetTouches.length==1){
    //计算画布的宽和高
    var canvasWidth = targetTouches[0].target.width;
    var canvasHeight = targetTouches[0].target.height;
    //计算每次移动在x轴，y轴的角度差
    var deltaAngleX = (targetTouches[0].pageY - touch1PositionY)/canvasHeight * Math.PI;
    var deltaAngleY = (targetTouches[0].pageX - touch1PositionX)/canvasWidth * Math.PI;
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
    touch1PositionX = targetTouches[0].pageX;
    touch1PositionY = targetTouches[0].pageY;
  }
  //两个手指触碰，缩放物体
  else{
    //计算当前两个触碰点间的距离与缩放比
    var currentDistance = Math.sqrt(Math.pow(targetTouches[0].pageX - targetTouches[1].pageX,2) +
                          Math.pow(targetTouches[0].pageY - targetTouches[1].pageY,2));
    //缩放物体
    modelArr.forEach(function(temp,i){
      if(temp===null||temp.length<=0)
        return;
      var currentScale = currentDistance/touchDistance*scaleTypeArr[i][0];
      temp.forEach(function(mesh,j){
        scaleModels(mesh,currentScale);
        scaleTypeArr[i][j]=currentScale;
      });
    });
    //重置触碰点的位置与之间的距离，以备下次计算
    touchDistance = currentDistance;
    touch1PositionX = targetTouches[0].pageX;
    touch1PositionY = targetTouches[0].pageY;
    touch2PositionX = targetTouches[1].pageX;
    touch2PositionY = targetTouches[1].pageY;
  }

};

//完成触碰，手指离开
var touchend = function(event){
  event.preventDefault();
  var touches = event.touches;
  //排除无接触与三只手指以上接触的。
  if(touches === null || touches.length<0 || touches.length>1)
    return;
  if(touches.length === 1){
    touch1PositionX = touches[0].pageX;
    touch1PositionY = touches[0].pageY;
    return;
  }
  //恢复touchDown = false
  timeout = setTimeout(function () {
    touchDown = false;
  }, 3000);
}

renderer1.domElement.addEventListener("touchstart",touchstart);
renderer1.domElement.addEventListener("touchmove",touchmove);
renderer1.domElement.addEventListener("touchend",touchend);
