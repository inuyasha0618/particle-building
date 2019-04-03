import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { BufferAttribute } from 'three';
import RenderLooper from 'render-looper';
import * as building from './3dModules/building';
import GlobalState from './globalState';


const OrbitControls = require('three-orbitcontrols')
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
// camera.position.setZ(200);
camera.position.set(0, 50, 500);
camera.lookAt(new Vector3(0, 50, 0));

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

const { left, top, width, height } = renderer.domElement.getBoundingClientRect();
const globalState: GlobalState = new GlobalState(left, top, width, height);
let looper = null;
const ray: THREE.Ray = new THREE.Ray();
init();

function init() {
    registerEvents();
    building.init(scene, renderer);
    console.log('init done');
    looper = new RenderLooper(render).start();
}

function render() {
    updateSpherePos();
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
}

function updateSpherePos() {
    const currentMousePos2D: Vector2 = globalState.getMousePos2D();
    ray.origin.setFromMatrixPosition(camera.matrixWorld);
    ray.direction.set(currentMousePos2D.x, currentMousePos2D.y, 0.5).unproject(camera).sub(ray.origin).normalize();
    const distance: number = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
    ray.origin.add(new Vector3().copy(ray.direction).multiplyScalar(distance));
    globalState.setSpherePos3D(ray.origin);
}

function registerEvents() {
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
}

function onMouseMove(e: MouseEvent) {
    const { pageX, pageY } = e;
    globalState.setMousePos2D(
        2.0 * (pageX - globalState.canvasInfo.left) / globalState.canvasInfo.width - 1.0,
        2.0 * (globalState.canvasInfo.height - (pageY - globalState.canvasInfo.top)) / globalState.canvasInfo.height - 1.0
    );
}

// TODO: resize事件注册一下
function onResize() {

}