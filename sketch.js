var world;
var sphere;
var plane;
var circle;

var main_bgm;
var sky;
var scoreBoard;
var bird;
var sensor;
var cone;

var score = 0;

var groundR = 138;
var groundG = 203;
var groundB = 136;

var cloudCount = 40;
var moutainCount = 7;
var treeCount = 20;
var pCount = 0;

var nextT = {};
var nextM = {};
var nextC = {};
var nextP = {};

var treeContainer;
var treeCont1;
var treeCont2;
var treeCont3;
var treeCont4;
var treeCont5;
var treesContainer;

var leavescolors=[[30,147,45],[58,88,8],[121,161,54],[87,124,24],[70,100,17],[99,134,40]];
// var leavescolors = [[214,249,221],[153,247,171],[138,203,136],[28,124,84],[96,105,92]];
var leavescolors_fall = [[254,186,2],[242,93,60],[205,209,0],[255,238,0],[255,117,38]];
var mountcolors = [[134,186,139],[158,209,187],[201,228,202],[214,232,153],[247,240,148]];
var mountcolors_fall = [[73,15,3],[219,44,12],[255,205,25],[247,98,23],[112,70,40]];
var cloudcolors = [[255,255,255],[239,255,250],[229,236,244]];
var pyramidcolors=[[248,188,130],[244,174,108],[224,172,130],[164,104,68]];
var skycolors = [[252, 249, 242],[254, 97, 81],[79, 184, 255],[255, 226, 103]];

var mountainCont1;
var mountainCont2;
var mountainCont3;
var mountainsContainer;

var cloudsContainer;

var pyramidCont1;
var pyramidCont2;

var changeScene = 0;

// questions to ask:
// how to display score in a fixed place?
// color distortion
// how to change color for the gradien sky entity


// TODO: progressivly generate scene ahead of the user by 100/150 point and splice the ones behind
// TODO: prevent the user from go too low or too high
// TODO: transparent clounds

function preload() {
  main_bgm = loadSound('./libraries/snowy.mp3');
}

function setup() {
  // no canvas needed
  noCanvas();
  main_bgm.loop();
  world = new World('VRScene');
  world.setUserPosition(0, 5, 10);
  world.setFlying(true);
  sensor = new OutFrontSensor();
  // sphere = new Sphere({x:0, y:2, z:0, red:0, green:255, blue:0});
  // world.add(sphere);
  // treeContainer = new Container3D({x:0,y:0,z:0});
  mountainCont1 = new Container3D({x:0,y:0,z:0});
  mountainCont2 = new Container3D({x:0,y:0,z:0});
  mountainCont3 = new Container3D({x:0,y:0,z:0});
  mountainsContainer = [mountainCont1, mountainCont2, mountainCont3];

  cloudCont1 = new Container3D({x:0,y:0,z:0});
  cloudCont2 = new Container3D({x:0,y:0,z:0});
  cloudsContainer = [cloudCont1, cloudCont2];

  treeCont1 = new Container3D({x:0,y:0,z:0});
  treeCont2 = new Container3D({x:0,y:0,z:0});
  treeCont3 = new Container3D({x:0,y:0,z:0});
  treeCont4 = new Container3D({x:0,y:0,z:0});
  treeCont5 = new Container3D({x:0,y:0,z:0});
  treesContainer = [treeCont1,treeCont2,treeCont3,treeCont4,treeCont5];

  pyramidCont1 = new Container3D({x:0,y:0,z:0});
  pyramidCont2 = new Container3D({x:0,y:0,z:0});

  setGround();

  bird = world.getUserPosition();
  nextT.z = bird.z - 30;
  nextT.i = 0;

  nextM.z = bird.z - 60;
  nextM.i = 0;

  nextC.z = bird.z - 5;
  nextC.i = 0;

  nextP.a = -950;
  nextP.b = -980;

  setTrees(treeCont1, bird.x, bird.z-10);
  setTrees(treeCont2, bird.x, bird.z-30);
  setTrees(treeCont3, bird.x, bird.z-50);
  setTrees(treeCont4, bird.x, bird.z-70);
  setTrees(treeCont5, bird.x, bird.z-90);

  setMountains(mountainCont1, bird.x, bird.z-40);
  setMountains(mountainCont2, bird.x, bird.z-80);
  setMountains(mountainCont3, bird.x, bird.z-120);

  setClouds(cloudCont1, bird.x, bird.z-40);

  world.add(cloudCont1);
  world.add(cloudCont2);
  world.add(treeCont1);
  world.add(treeCont2);
  world.add(treeCont3);
  world.add(treeCont4);
  world.add(treeCont5);

  world.add(mountainCont1);
  world.add(mountainCont2);
  world.add(mountainCont3);

  world.add(pyramidCont1);
  world.add(pyramidCont2);

  sky = document.getElementById("sky");
  scoreBoard = document.getElementById("score-board");
}

function draw() {
  movementCtrl();
}

function movementCtrl(){
  bird = world.getUserPosition();
  handleSky()

  // see what's in front of the user
  var distance = sensor.getDistanceToNearestObjectInFrontOfUser();
  // console.log(distance);

  // if we're close, stop moving!
  if (distance > 0.5) {
    // let the user move!
    // console.log("go");
    if(bird.y > 1)
      world.moveUserForward(0.5);
    else
      world.moveUserForward(0.3);
  }
  // world.moveUserForward(0.1);

  bird = world.getUserPosition();
  circle.setX(bird.x);
  circle.setZ(bird.z);
  score = bird.z*-1;
  // scene change
  if(score/480 >= 4){
    forestScene(bird, false);
  }else if(score/480 >= 2){
    desertScene(bird);
  }else if(score/500 >= 1){
    forestScene(bird, true);
  }else if(score/500 < 1){
    forestScene(bird, false);
  }

  // clouds generation
  if(bird.z < nextC.z) {
    nextC.z = bird.z - 1;
    makeCloud(cloudCont1, bird.x, bird.z-50);
  }
  handleBoard(bird);
}

function OutFrontSensor() {
  // raycaster - think of this like a "beam" that will fire out of the
  // front of the user's position to figure out what is below their avatar
  this.rayCaster = new THREE.Raycaster();
  this.cursorPosition = new THREE.Vector2(0,0);
  this.intersects = [];

  this.getDistanceToNearestObjectInFrontOfUser = function() {
    // fire off a beam
    this.rayCaster.setFromCamera( this.cursorPosition, world.camera.holder.object3D.children[1]);

    // see what's in front
    this.intersects = this.rayCaster.intersectObjects( world.threeSceneReference.children, true );
    if (this.intersects.length > 0) {
      return this.intersects[0].distance;
    }
    return 1000;
  }
}

function forestScene(bird, autumn) {
  if(autumn){
    if(groundR < 254)
      circle.setRed(++groundR);
    if(groundG > 209 )
      circle.setGreen(--groundG);
    if(groundB > 140)
      circle.setBlue(--groundB);
  }
  // trees generation
  if(bird.z < nextT.z){
    nextT.z = bird.z - 0.5;
    makeTree(treeCont1, bird.x, bird.z, autumn);
    // nextT.z = bird.z - 30;
    // setTrees(treesContainer[nextT.i], bird.x, bird.z-110, autumn);
    // nextT.i +=1;
    // if(nextT.i === 5){
    //   nextT.i = 0;
    // }
  }
  // mountains generation
  if(bird.z < nextM.z){
    nextM.z = bird.z - 60;
    setMountains(mountainsContainer[nextM.i], bird.x, bird.z-150, autumn);
    nextM.i +=1;
    if(nextM.i === 3){
      nextM.i = 0;
    }
  }

  if(score>700 && treeCont2.getChildren().length>0)
    emptyContainer(treeCont2)
  if(score>750 && treeCont3.getChildren().length>0)
    emptyContainer(treeCont3)
  if(score>850 && treeCont4.getChildren().length>0)
    emptyContainer(treeCont4)
  if(score>900 && treeCont5.getChildren().length>0)
    emptyContainer(treeCont5)
}

function desertScene(bird) {
  if(groundR < 254)
    circle.setRed(++groundR);
  if(groundG < 217 )
    circle.setGreen(++groundG);
  if(groundB < 155)
    circle.setBlue(++groundB);

  if(bird.z <= nextP.a){
    setPyramid1(pyramidCont1, bird.x, bird.z);
    nextP.a = bird.z - 20;
  }

  if(bird.z <= nextP.b){
    setPyramid2(pyramidCont2, bird.x, bird.z);
    nextP.b = bird.z - 30;
  }

}

function handleSky() {
  if(score/800 >= 1){
    let top = skycolors[2];
    let bottom = skycolors[0];
    if(top[0] < skycolors[1][0]){
      top[0] += 1;
    }
    if(top[1] > skycolors[1][1]){
      top[1] -= 1;
    }
    if(top[2] > skycolors[1][2]){
      top[2] -= 1;
    }
    if(bottom[0] < skycolors[3][0]){
      bottom[0] += 1;
    }
    if(bottom[1] > skycolors[3][1]){
      bottom[1] -= 1;
    }
    if(bottom[2] > skycolors[3][2]){
      bottom[2] -= 1;
    }
    let str1 = `${top[0]} ${top[1]} ${top[2]}`
    let str2 = `${bottom[0]} ${bottom[1]} ${bottom[2]}`;
    let base = `shader: gradient; topColor: ${str1}; bottomColor: ${str2}`;
    sky.setAttribute('material',base);
  }
}

function handleBoard(bird) {
  let result = `${bird.x - 30} ${40} ${bird.z - 40}`;
  scoreBoard.setAttribute("position", result);
  scoreBoard.setAttribute("value", Math.floor(score).toString()+" m");
}

function makeTree(container, xPos, zPos, autumn){
  let x = random(xPos-70,xPos+70);
  let height1 = random(5, 8);
  let height2 = random(5, 14);
  let z = random(zPos-90, zPos-120);
  var leavesrand = autumn ? leavescolors_fall[Math.floor(random(0,5))] : leavescolors[Math.floor(random(0,5))];
  var trunk = new Cylinder({
    x:x, y:1 , z:z,
    height:height1,
    radius: 0.25,
    red: 83, green: 53, blue:10,
  });
  let leaves =[new Cone({
    x:x, y:height1, z:z,
    height:height2,
    radiusBottom:2, radiusTop:0.01,
    red:leavesrand[0], green:leavesrand[1], blue: leavesrand[2]
  }), new Box({
    x:x, y:height1, z:z,
    width:random(2,4) , height: height2 , depth:random(2,4),
    red:leavesrand[0], green:leavesrand[1], blue: leavesrand[2]
  })]
  container.addChild(trunk);
  container.addChild(leaves[Math.floor(random(2))]);
  let children = container.getChildren();
  if(children.length > 300){
    container.removeChild(children[0]);
    container.removeChild(children[1]);
  }
}

function setTrees(container, xPos, zPos, autumn){
  emptyContainer(container);
  for(let i=0;i<treeCount;i++){
    let x = random(xPos-50,xPos+50);
    let height1 = random(5, 8);
    let height2 = random(5, 14);
    let z = random(zPos, zPos-20);
    var leavesrand = autumn ? leavescolors_fall[Math.floor(random(0,5))] : leavescolors[Math.floor(random(0,5))];
    var trunk = new Cylinder({
      x:x, y:1 , z:z,
      height:height1,
      radius: 0.25,
      red: 83, green: 53, blue:10,
    });
    let leaves =[new Cone({
      x:x, y:height1, z:z,
      height:height2,
      radiusBottom:2, radiusTop:0.01,
      red:leavesrand[0], green:leavesrand[1], blue: leavesrand[2]
    }), new Box({
      x:x, y:height1, z:z,
      width:random(2,4) , height: height2 , depth:random(2,4),
      red:leavesrand[0], green:leavesrand[1], blue: leavesrand[2]
    })]
    container.addChild(trunk);
    container.addChild(leaves[Math.floor(random(2))]);
  }
}

function setMountains(container, xPos, zPos, autumn){
  emptyContainer(container);
  for(let i=0;i<moutainCount;i++){
    var mountrand = autumn ? mountcolors_fall[Math.floor(random(5))] : mountcolors[Math.floor(random(5))];
    var x = random(xPos-100,xPos+100);
    var z = random(zPos-10, zPos-50);
    var height = random(30, 100);
    newCone = new Cone({
      x:x, y:4, z:z,
      red:mountrand[0], green:mountrand[1], blue:mountrand[2],
      height:height,
      radiusBottom:random(15,30), radiusTop:0.1,
    });
    container.addChild(newCone);
  }
}

function makeCloud(container, xPos, zPos){
  var cloudrand=cloudcolors[Math.floor(random(cloudcolors.length))];
  var x = random(xPos-55,xPos+55);
  var yPos = random(10,50);
  var z = random(zPos-10, zPos-60);
  // console.log(cloudrand);
  cloud1=new Sphere({
    x:x-2, y: yPos+random(-1,1), z:z,
    radius:random(1,1.5),
    red:cloudrand[0] , green: cloudrand[1] , blue:cloudrand[2],
  });
  cloud2=new Sphere({
    x:x, y: yPos, z:z,
    radius:random(1.5,3.0),
    red:cloudrand[0] , green: cloudrand[1] , blue:cloudrand[2],
  });
  cloud3=new Sphere({
    x:x+2, y: yPos+random(-1,1), z:z,
    radius: random(1,1.5),
    red:cloudrand[0] , green: cloudrand[1] , blue:cloudrand[2],
  });
  container.addChild(cloud1);
  container.addChild(cloud2);
  container.addChild(cloud3);

  let children = container.getChildren();
  if(children.length > 200){
    container.removeChild(children[0]);
    container.removeChild(children[1]);
    container.removeChild(children[2]);
  }


}

function setClouds(container, xPos, zPos){
  emptyContainer(container);
  for(let i=0;i<cloudCount;i++){
    var cloudrand=cloudcolors[Math.floor(random(cloudcolors.length))];
    var x = random(xPos-55,xPos+55);
    var yPos = random(10,50);
    var z = random(zPos-10, zPos-60);
    cloud1=new Sphere({
			x:x-2, y: yPos+random(-1,1), z:z,
			radius:random(1,1.5),
			red:cloudrand[0] , green: cloudrand[1] , blue:cloudrand[2],
		});
		cloud2=new Sphere({
			x:x, y: yPos, z:z,
			radius:random(1.5,3.0),
			red:cloudrand[0] , green: cloudrand[1] , blue:cloudrand[2],
		});
		cloud3=new Sphere({
			x:x+2, y: yPos+random(-1,1), z:z,
			radius: random(1,1.5),
			red:cloudrand[0] , green: cloudrand[1] , blue:cloudrand[2],
		});
		container.addChild(cloud1);
		container.addChild(cloud2);
		container.addChild(cloud3);
	}
}


function setGround() {
  circle = new Circle({x:0, y:-1, z:0, radius:150, red:groundR, green:groundG, blue:groundB, rotationX:-90});
  world.add(circle);
}

function setPyramid1(container, xPos, zPos){
  let x = random(xPos-100,xPos+100);
  let z = random(zPos-50,zPos-150);
  let h1 = random(5, 20);
  var pyramidrand=pyramidcolors[Math.floor(random(pyramidcolors.length))];
  pyramidbox1 = new Box({
    x: x,
    y: 0,
    z: z,
    width:20+h1 , height: h1 , depth:20,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
   pyramidbox2 = new Box({
     x: x,
     y: h1,
     z: z,
    width:15+h1 , height: h1 , depth:15,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
  pyramidbox3 = new Box({
    x: x,
    y: h1*2,
    z: z,
    width:10+h1 , height: h1 , depth:10,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
  pyramidbox4 = new Box({
    x: x,
    y: h1*3,
    z: z,
    width:5+h1 , height: h1 , depth:5,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
  pyramidcone = new Cone({
    x: x,
    y: h1*4+h1*0.6,
    z: z,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
    height:h1,
    radiusBottom:2.5, radiusTop:0.1,
  });

  container.addChild(pyramidbox1);
  container.addChild(pyramidbox2);
  container.addChild(pyramidbox3);
  container.addChild(pyramidbox4);
  container.addChild(pyramidcone);


  let children = container.getChildren();
  if(children.length > 100){
    container.removeChild(children[0]);
    container.removeChild(children[1]);
    container.removeChild(children[2]);
    container.removeChild(children[3]);
    container.removeChild(children[4]);
  }
}

function setPyramid2(container, xPos, zPos){
  let x = random(xPos-100,xPos+100);
  let z = random(zPos-50,zPos-150);
  let h1 = random(3, 15);
  var pyramidrand=pyramidcolors[Math.floor(random(pyramidcolors.length))];
  var pyramidbox1 = new Box({
    x: x,
    y: 0,
    z: z,
    width:20 , height: h1, depth:20,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
   var pyramidbox2 = new Box({
     x: x,
     y: h1,
     z: z,
    width:17 , height: h1, depth:17,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
  var pyramidbox3 = new Box({
    x: x,
    y: h1*2,
    z: z,
    width:14 , height: h1, depth:14,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
  var pyramidbox4 = new Box({
    x: x,
    y: h1*3,
    z: z,
    width:11 , height: h1, depth:11,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });
  var pyramidbox5 = new Box({
    x: x,
    y: h1*4,
    z: z,
    width:8 , height: h1, depth:8,
    green: pyramidrand[1] , blue:pyramidrand[2],
  });
  var pyramidbox6 = new Box({
    x: x,
    y: h1*5,
    z: z,
    width:5 , height: h1, depth:5,
    red:pyramidrand[0] , green: pyramidrand[1] , blue:pyramidrand[2],
  });

  container.addChild(pyramidbox1);
  container.addChild(pyramidbox2);
  container.addChild(pyramidbox3);
  container.addChild(pyramidbox4);
  container.addChild(pyramidbox5);
  container.addChild(pyramidbox6);

  let children = container.getChildren();
  if(children.length > 120){
    container.removeChild(children[0]);
    container.removeChild(children[1]);
    container.removeChild(children[2]);
    container.removeChild(children[3]);
    container.removeChild(children[4]);
    container.removeChild(children[5]);
  }
}

function emptyContainer(container){
  let entities = container.getChildren();
  entities.forEach((entity) => {
    container.removeChild(entity);
  });
}
