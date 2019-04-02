import * as THREE from 'three';
import { BufferAttribute } from 'three';
import RenderLooper from 'render-looper';
import * as building from './3dModules/building';

const OrbitControls = require('three-orbitcontrols')
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
// camera.position.setZ(200);
camera.position.set(0, 50, 500);
camera.lookAt(new THREE.Vector3(0, 50, 0));

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const ambient = new THREE.AmbientLight( 0xcccccc );

const spot = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
spot.position.x = 400;
spot.position.y = 700;
spot.position.z = 200;
spot.target.position.set( 0, 0, 0 );
spot.castShadow = true;

spot.shadowCameraNear = 100;
spot.shadowCameraFar = 2500;
spot.shadowCameraFov = 120;

spot.shadowBias = 0.0003;
spot.shadowMapWidth = 1024;
spot.shadowMapHeight = 2048;
scene.add(ambient);
scene.add( spot );

let looper = null;
function init() {
    building.init(scene, renderer);
    console.log('init done');
    looper = new RenderLooper(render).start();
}

function render() {
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
}

init();