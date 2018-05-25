//定义4个画布的宽高
var width = 0, height = 0;
//定义是否触摸到屏幕，默认是false
var touchDown = false;
//定义是否检测到手势，默认是false
var isGestureProcessing = false;
//声明四个场景
var scene1,scene2,scene3,scene4;
//声明一台摄像机
var camera;
//声明四个渲染器
var renderer1,renderer2,renderer3,renderer4;
//初始化模型数组
var modelArr=[];
//初始化需要旋转和缩放的模型类数组
var rotateTypeArr=[],scaleTypeArr=[];
//定义全息棱镜变的数量，初始为4
var num = 4;
//初始化
var init = function(){
  initWidthAndHeight();
  initScene();
  initCamera();
  initRenderer();
};

//设置
var set = function(){
  setRendererPosition();
  setLights();
  setCamera();
};

//载入
var load = function(){
  if(filenameArr===null||filenameArr.length<=0)
    return;
  filenameArr.forEach(function(item){
    loadModel(item);
  });
};

//初始化输出窗口宽高
var initWidthAndHeight = function(){
  if(window.innerHeight<=window.innerWidth){
    width = window.innerHeight/3;
  }else{
    width = window.innerWidth/3;
  }
  height = width;
};

//初始化场景
var initScene = function(){
  scene1 = new THREE.Scene();    //前方
  scene2 = new THREE.Scene();    //右方
  scene3 = new THREE.Scene();    //后方
  scene4 = new THREE.Scene();    //左方
};

//初始化摄像机
var initCamera = function(){
  camera = new THREE.PerspectiveCamera(75,width/height,0.1,1000);
};

//初始化渲染器
var initRenderer = function(){
  renderer1 = new THREE.WebGLRenderer();     //前方
  renderer2 = new THREE.WebGLRenderer();     //左方
  renderer3 = new THREE.WebGLRenderer();     //后方
  renderer4 = new THREE.WebGLRenderer();     //右方
};

//设置渲染器的位置
var setRendererPosition = function(){
  //渲染器设置宽高,与绝对位置
  renderer1.setSize(width,height);
  renderer1.domElement.style.position="absolute";
  renderer2.setSize(width,height);
  renderer2.domElement.style.position="absolute";
  renderer3.setSize(width,height);
  renderer3.domElement.style.position="absolute";
  renderer4.setSize(width,height);
  renderer4.domElement.style.position="absolute";
  //根据window.innerWidth和window.innerHeight计算画布位置
  if(window.innerWidth>=window.innerHeight){
    renderer1.domElement.style.top=height*2+"px";
    renderer1.domElement.style.left=((window.innerWidth-window.innerHeight)/2+width)+"px";
    renderer2.domElement.style.top = height+"px";
    renderer2.domElement.style.left=(window.innerWidth-window.innerHeight)/2+"px";
    renderer3.domElement.style.top = "0px";
    renderer3.domElement.style.left=((window.innerWidth-window.innerHeight)/2+width)+"px";
    renderer4.domElement.style.top = height+"px";
    renderer4.domElement.style.left=((window.innerWidth-window.innerHeight)/2+2*width)+"px";
  }else{
    renderer1.domElement.style.top=((window.innerHeight-window.innerWidth)/2+height*2)+"px";
    renderer1.domElement.style.left=width+"px";
    renderer2.domElement.style.top =((window.innerHeight-window.innerWidth)/2+height)+"px";
    renderer2.domElement.style.left="0px";
    renderer3.domElement.style.top = (window.innerHeight-window.innerWidth)/2+"px";
    renderer3.domElement.style.left=width+"px";
    renderer4.domElement.style.top = ((window.innerHeight-window.innerWidth)/2+height)+"px";
    renderer4.domElement.style.left=(2*width)+"px";
  }

  //将渲染目标与相应div绑定
  document.body.appendChild(renderer1.domElement);
  document.body.appendChild(renderer2.domElement);
  document.body.appendChild(renderer3.domElement);
  document.body.appendChild(renderer4.domElement);
};

//设置光照
var setLights = function(){
  //定义光照
  var ambientLight = new THREE.AmbientLight(0xffffff,0.5);
  scene1.add(ambientLight.clone());
  scene2.add(ambientLight.clone());
  scene3.add(ambientLight.clone());
  scene4.add(ambientLight.clone());

  var lightBox = new THREE.Object3D();
  var pivot1 = new THREE.Object3D();
  var pivot2 = new THREE.Object3D();
  pivot1.rotation.y = -3*Math.PI/4;
  pivot2.rotation.y = Math.PI/4;
  lightBox.add(pivot1);
  lightBox.add(pivot2)
  //sun light
  var directionLight1 = new THREE.DirectionalLight(0xffffff,0.8);
  directionLight1.position.set(500,0,0);
  directionLight1.castShadow = true;
  directionLight1.mapSize = new THREE.Vector2(1024,1024);
  pivot1.add(directionLight1);
  //moon light
  var directionLight2 = new THREE.DirectionalLight(0x59888C,0.3);
  directionLight2.position.set(500,0,0);
  directionLight2.castShadow = true;
  directionLight2.mapSize = new THREE.Vector2(1024,1024);
  pivot2.add(directionLight2);
  var lightBox1 = lightBox.clone();
  var lightBox2 = lightBox.clone();
  var lightBox3 = lightBox.clone();
  var lightBox4 = lightBox.clone();
  scene1.add(lightBox1);
  scene2.add(lightBox2);
  scene3.add(lightBox3);
  scene4.add(lightBox4);
};

var setCamera = function(){
  camera.position.set(0,0,cameraZ);
  //设置摄像机镜头目标坐标
  camera.lookAt(0,0,0);
};

//载入模型
var loadModel = function(filename){
  if(num<=0)
    return;
  var rotation=new Array(num);
  var scale = new Array(num);
  var model = new Array(num);
  var fgxloader = new THREE.FBXLoader().
  load(filename,function(object){
    for(var i = 0; i< num; i++){
      var mesh = object.clone().rotateZ(Math.PI);
      mesh.receiveShadow = true;
      model[i] = mesh;
      rotation[i] = mesh.rotation;
      scale[i] = mesh.scale.x;
      switch(i){
        case 0:
          scene1.add(mesh);
          break;
        case 1:
          scene2.add(mesh);
          break;
        case 2:
          scene3.add(mesh);
          break;
        case 3:
          scene4.add(mesh);
          break;
        default:
          break;
      }
    }
    rotateTypeArr.push(rotation);
    scaleTypeArr.push(scale);
    modelArr.push(model);
  },function(xhr){
    //console.log("object "+(xhr.loaded/xhr.total*100)+"% loaded");
  },function(error){
    console.log(error);
  });
};

//转动物体方法
var ModelRotate = function(mesh,resetRotateSpeed,modelRotateSpeed){
  if(mesh===undefined)
    return;
  //保持物体的自转是仅仅围绕Y轴。
  if(mesh.rotation.x > 0){
    mesh.rotation.x -= Math.abs(resetRotateSpeed);
    if(mesh.rotation.x < 0)
      mesh.rotation.x = 0;
      mesh.rotation.y += modelRotateSpeed;
  }
  else if(mesh.rotation.x < 0){
    mesh.rotation.x += Math.abs(resetRotateSpeed);
    if(mesh.rotation.x > 0)
      mesh.rotation.x = 0;
      mesh.rotation.y += modelRotateSpeed;
  }else{
    mesh.rotation.y += modelRotateSpeed;
  }
};

//缩放物体方法
var ModelScale = function(mesh,resetScaleSpeed){
  if(mesh===undefined)
    return;
  if(mesh.scale.x > 1){
    mesh.scale.x -= resetScaleSpeed;
    mesh.scale.y -= resetScaleSpeed;
    mesh.scale.z -= resetScaleSpeed;
    if(mesh.scale.x <= 1){
      mesh.scale.x = 1;
      mesh.scale.y = 1;
      mesh.scale.z = 1;
    }
  }
  else if (mesh.scale.x < 1){
    mesh.scale.x += resetScaleSpeed;
    mesh.scale.y += resetScaleSpeed;
    mesh.scale.z += resetScaleSpeed;
    if(mesh.scale.x >= 1){
      mesh.scale.x = 1;
      mesh.scale.y = 1;
      mesh.scale.z = 1;
    }
  }
};

init();
set();
load();

var update = function(){
  if(touchDown||isGestureProcessing)
    return;
  if(modelArr.length<=0)
    return;
  modelArr.forEach(function(temp,index){
    if(temp===null||temp.length<=0)
      return;
      temp.forEach(function(mesh){
        ModelRotate(mesh,rotateSpeedArr[index],resetRotateSpeed);   //转动模型
        ModelScale(mesh,resetScaleSpeed);                           //缩放模型
      });
  });
};

//定义渲染函数，
var render = function(){
  renderer1.render(scene1,camera.clone());
  renderer2.render(scene2,camera.clone().translateX(-cameraZ).translateZ(-cameraZ).rotateY(-Math.PI/2).rotateZ(Math.PI/2));
  renderer3.render(scene3,camera.clone().translateZ(-cameraZ*2).rotateY(Math.PI).rotateZ(Math.PI));
  renderer4.render(scene4,camera.clone().translateX(cameraZ).translateZ(-cameraZ).rotateY(Math.PI/2).rotateZ(-Math.PI/2));
};

//定义循环执行函数
var loop = function(){
  try{
    Leap.loop(options,function(frame){
      update();
      render();
    });
  }
  catch(e){
    var GameLoop = function(){
      requestAnimationFrame(GameLoop);
      update();
      render();
    };

    GameLoop();
  }
};

loop();

renderer1.domElement.addEventListener("touchstart",touchstart);
renderer1.domElement.addEventListener("touchmove",touchmove);
renderer1.domElement.addEventListener("touchend",touchend);
