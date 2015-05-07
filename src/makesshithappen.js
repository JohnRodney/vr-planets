//Setup three.js WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

// Create a three.js scene.
var scene = new THREE.Scene();

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000);

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Create a VR manager helper to enter and exit VR mode.
var manager = new WebVRManager(renderer, effect, {hideButton: false});

// a light that spreads in all directions
var light = new THREE.PointLight( 0xffffff, 1, 100);
light.position.set( 0, 0, 0 );

var starTexture = createAndInsertBackDrop('images/starfield.jpg', {x: 5, y: 5});
var earthMesh = addEarth({x: 1, y: 0, z: -1});
var mercury = addPlanet('mercury', {x: -10, y: 0, z: -3});

addToScene(scene, [light, earthMesh, mercury]);

var back;

// Request animation frame loop function
function animate() {
  moveEverything();
  // Update VR headset position and apply to camera.
  controls.update();

  // Render the scene through the manager.
  manager.render(scene, camera);

  requestAnimationFrame(animate);
}

// Kick off animation loop
animate();

// Reset the position sensor when 'z' pressed.
function onKey(event) {
  if (event.keyCode == 90) { // z
    controls.resetSensor();
  }
};

window.addEventListener('keydown', onKey, true);

function moveEverything(){
  var rspeed = 0.01;
  var speed = 0.01;

  earthMesh.rotation.y += rspeed;
  mercury.rotation.y += rspeed;
  if(back){
    earthMesh.position.z -= speed;
    earthMesh.position.x -= speed;
    mercury.position.z -= speed;
    mercury.position.x -= speed;

  } else {
    earthMesh.position.z += speed;
    earthMesh.position.x += speed;
    mercury.position.z += speed;
    mercury.position.x += speed;

  }

  if(earthMesh.position.z < -5){
    back = false;
  } else if(earthMesh.position.z > 5){
    back = true;
  }


}

// Handle window resizes
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', onWindowResize, false);


function addEarth(pos){
  var geometry   = new THREE.SphereGeometry(0.5, 32, 32),
      material  = new THREE.MeshPhongMaterial(),
      earthMesh = new THREE.Mesh(geometry, material);

  scene.add(earthMesh);
  material.map    = THREE.ImageUtils.loadTexture('images/earthmap1k.jpg');
  material.bumpMap    = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
  material.bumpScale = 0.03;
  material.specularMap    = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg');
  material.specular  = new THREE.Color('grey');

  var canvasCloud = THREE.ImageUtils.loadTexture('images/earthcloudmap.jpg'),
      geometry   = new THREE.SphereGeometry(0.5, 32, 32),
      material  = new THREE.MeshPhongMaterial({
                    map     : THREE.ImageUtils.loadTexture('images/earthcloudmap.png'),
                    side        : THREE.DoubleSide,
                    opacity     : 0.8,
                    transparent : true,
                    depthWrite  : false,
                  });

  var cloudMesh = new THREE.Mesh(geometry, material);

  earthMesh.add(cloudMesh);

  return setPlanet(earthMesh, pos);
}


function addPlanet(planetName, pos){
  var geometry   = new THREE.SphereGeometry(0.5, 32, 32),
      material  = new THREE.MeshPhongMaterial(),
      planet = new THREE.Mesh(geometry, material);

  scene.add(planet);
  material.map    = THREE.ImageUtils.loadTexture('images/'+ planetName +'map.jpg');
  material.bumpMap    = THREE.ImageUtils.loadTexture('images/'+ planetName +'bump.jpg');
  material.bumpScale = 0.005;
  material.specularMap    = THREE.ImageUtils.loadTexture('images/'+ planetName +'spec.jpg');
  material.specular  = new THREE.Color('grey');

  return setPlanet(planet, pos);
}

function createAndInsertBackDrop(filename, repeat){

  var geometry  = new THREE.SphereGeometry(1000, 32, 32),
      Texture = THREE.ImageUtils.loadTexture(filename),
      material  = new THREE.MeshBasicMaterial(),
      mesh  = new THREE.Mesh(geometry, material);

  Texture.wrapS = Texture.wrapT = THREE.RepeatWrapping;
  Texture.repeat.set( repeat.x, repeat.y );
  material.map   = Texture;
  material.side  = THREE.BackSide;
  scene.add(mesh);
  mesh.position.z = 0;

  return Texture;
}

function setPlanet(obj, pos){
  obj.position.x = pos.x;
  obj.position.y = pos.y;
  obj.position.z = pos.z;

  return obj;
}

function addToScene(scene, arr){
  arr.forEach(function(mesh){
    scene.add(mesh);
  });
}
