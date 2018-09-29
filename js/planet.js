//声明画布的宽高
var width,height;
//定义是否触摸到屏幕，默认是false
var touchDown = false;
//定义是否监测到手，默认是false
var isHandDetected = false;
//定义是否完成手部指令
var isHandComplete = true;
//声明一个场景,一个摄像机，一个渲染器
var scene, camera, renderer;
//初始化模型数组
var modelArr=[];
//初始化需要旋转和缩放的模型类数组
var rotateTypeArr=[],scaleTypeArr=[];
//倒计时
var timeout;

//初始化
var init = function(){
	initWidthAndHeight();
	initScene();
	initCamera();
	initRenderer();
};
//初始化画布宽高
var initWidthAndHeight = function(){
  width = window.innerWidth;
  height = window.innerHeight;
};
//初始化场景
var initScene = function(){
	scene = new THREE.Scene();
};
//初始化摄像机
var initCamera = function(){
	camera = new THREE.PerspectiveCamera(75,width/height,0.1,1000);
};
//初始化渲染器
var initRenderer = function(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width,height);
	document.body.appendChild(renderer.domElement);
};
//设置
var set = function(){
  setLights();
  setCamera();
};
//设置光照
var setLights = function(){
	//定义光照
  	var ambientLight = new THREE.AmbientLight(0xffffff,0.5);
  	scene.add(ambientLight);
  	//定义日光和月光
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
  	scene.add(lightBox);
}
//设置摄像机
var setCamera = function(){
  camera.position.set(0,0,cameraZ);
  //设置摄像机镜头目标坐标
  camera.lookAt(0,0,0);
};

//载入
var load = function(){
  if(filenameArr===null||filenameArr.length<=0)
    return;
  filenameArr.forEach(function(item){
    loadModel(item);
  });
};
//载入模型
var loadModel = function(filename){
  var rotation=new Array(1);
  var scale = new Array(1);
  var model = new Array(1);
  var fgxloader = new THREE.FBXLoader().
  load(filename,function(object){
  	var mesh = object.rotateZ(Math.PI);
  	model[0] = mesh;
  	rotation[0] = mesh.rotation;
  	scale[0] = mesh.scale.x;
  	scene.add(mesh);    
    rotateTypeArr.push(rotation);
    scaleTypeArr.push(scale);
    modelArr.push(model);
  },function(xhr){
    //console.log("object "+(xhr.loaded/xhr.total*100)+"% loaded");
  },function(error){
    console.log(error);
  });
};

init();
set();
load();

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

//每一帧的修改方法
var update = function(){
  if(!isHandComplete)
    return;
  if(modelArr.length<=0)
    return;
  modelArr.forEach(function(temp,index){
    if(temp===null||temp.length<=0)
      return;
      temp.forEach(function(mesh,j){
        ModelRotate(mesh,rotateSpeedArr[index],resetRotateSpeed);   //转动模型
        ModelScale(mesh,resetScaleSpeed);                           //缩放模型        
      });
  });
};
//每一帧的渲染方法
var render = function(){
  renderer.render(scene,camera);
};
//定义循环执行函数
var loop = function(){
  try{
    Leap.loop(options,function(frame){
      update();
      render();
      handsDetectedFunction(frame);
    });
    //var GameLoop = function(){
    //  requestAnimationFrame(GameLoop);
    //  update();
    //  render();
    //};
    //GameLoop();
  }
  catch(e){
    throw e;
  }
};

loop();