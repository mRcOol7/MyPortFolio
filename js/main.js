// Import necessary Three.js components from the CDN
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r117/three.min.js';
import { ARButton } from 'https://cdn.rawgit.com/mrdoob/three.js/r117/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://codepen.io/ollywoggy/pen/VwePmGX.js';
import Ammo from 'https://cdn.jsdelivr.net/npm/ammo.js@0.0.1/builds/ammo.wasm.js';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 3); // Adjust for AR view

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Enable WebXR
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('model-container').appendChild(renderer.domElement);

// Add ARButton to handle AR session
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

// Create loader
const loader = new GLTFLoader();
let model, mixer;

// Create physics world
let physicsWorld;
let rigidBodies = [];
let tmpTrans = new Ammo.btTransform();
let physicsInitialized = false;

Ammo().then(AmmoLib => {
  Ammo = AmmoLib;

  function initPhysics() {
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      new Ammo.btCollisionDispatcher(new Ammo.btDefaultCollisionConfiguration()),
      new Ammo.btDbvtBroadphase(),
      new Ammo.btSequentialImpulseConstraintSolver(),
      new Ammo.btDefaultCollisionConfiguration()
    );
    
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
    physicsInitialized = true;
  }
  
  initPhysics();

  loader.load(
    'models/advanced_model.glb', // Adjust the path
    (gltf) => {
      model = gltf.scene;
      model.scale.set(2, 2, 2);
      model.position.set(0, -1, 0);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.metalness = 0.8;
          child.material.roughness = 0.2;

          if (physicsInitialized) {
            addPhysics(child);
          }
        }
      });

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });

      scene.add(model);
      animate();
    },
    (xhr) => {
      console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    (error) => {
      console.error('An error happened', error);
    }
  );

  function addPhysics(mesh) {
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));
    shape.setMargin(0.05);
    const mass = 1;
    const localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
    transform.setRotation(new Ammo.btQuaternion(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z));

    const motionState = new Ammo.btDefaultMotionState(transform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);
    rigidBodies.push({ mesh: mesh, body: body });
  }

  function animate() {
    renderer.setAnimationLoop(() => {
      if (physicsInitialized) {
        updatePhysics();
      }
      if (mixer) mixer.update(0.01); // Update animations
      renderer.render(scene, camera);
    });
  }

  function updatePhysics() {
    physicsWorld.stepSimulation(1 / 60, 10);
    rigidBodies.forEach(({ mesh, body }) => {
      const transform = new Ammo.btTransform();
      body.getMotionState().getWorldTransform(transform);

      const pos = transform.getOrigin();
      const rot = transform.getRotation();
      
      mesh.position.set(pos.x(), pos.y(), pos.z());
      mesh.rotation.set(rot.x(), rot.y(), rot.z());
    });
  }
});

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5).normalize();
directionalLight.castShadow = true;
scene.add(directionalLight);

const spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set(10, 20, 10);
spotlight.castShadow = true;
scene.add(spotlight);

// Handle interactions
function handleInteraction(controller) {
  const intersects = controller.intersectObject(model, true);
  if (intersects.length > 0) {
    const intersection = intersects[0];
    model.position.copy(intersection.point);
  }
}

// Handle window resizing
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Add touch controls
const touchControls = new THREE.OrbitControls(camera, renderer.domElement);
touchControls.enableDamping = true;
touchControls.dampingFactor = 0.25;
touchControls.enableZoom = true;
touchControls.enablePan = true;

// UI Elements
const resetButton = document.createElement('button');
resetButton.innerText = 'Reset Model Position';
resetButton.style.position = 'absolute';
resetButton.style.top = '10px';
resetButton.style.left = '10px';
resetButton.style.zIndex = '1';
resetButton.addEventListener('click', () => {
  if (model) {
    model.position.set(0, -1, 0);
  }
});
document.body.appendChild(resetButton);

const toggleModeButton = document.createElement('button');
toggleModeButton.innerText = 'Toggle VR Mode';
toggleModeButton.style.position = 'absolute';
toggleModeButton.style.top = '50px';
toggleModeButton.style.left = '10px';
toggleModeButton.style.zIndex = '1';
toggleModeButton.addEventListener('click', () => {
  if (renderer.xr.isPresenting) {
    renderer.xr.getSession().end();
  } else {
    VRButton.createButton(renderer).click();
  }
});
document.body.appendChild(toggleModeButton);
