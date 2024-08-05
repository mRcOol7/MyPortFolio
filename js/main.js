// Import necessary Three.js components
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('model-container').appendChild(renderer.domElement);

// Create loader
const loader = new GLTFLoader();

// Load the 3D model
loader.load(
  'models/tmptfwb2a29.gltf', // Adjust the path relative to your HTML file
  (gltf) => {
    // Called when the resource is loaded
    scene.add(gltf.scene);
    gltf.scene.scale.set(2, 2, 2); // Adjust scale as needed
    gltf.scene.position.set(0, -1, 0); // Adjust position as needed
    animate();
  },
  (xhr) => {
    // Called while loading is progressing
    console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
  },
  (error) => {
    // Called when loading has errors
    console.error('An error happened', error);
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
