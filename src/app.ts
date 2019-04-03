import {
    WebGLRenderer,
    Scene,
    Vector3,
    Vector2,
    PerspectiveCamera,
    AmbientLight,
    SpotLight,
    Ray,
} from 'three';
const OrbitControls = require('three-orbitcontrols')
import RenderLooper from 'render-looper';

import OffScreenFbo from './3dModules/offScreenFbo2';
import Building from './3dModules/building2';
import GlobalState from './globalState';

class MainScene {

    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private globalState: GlobalState;
    private ray: Ray;

    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
        this.globalState = new GlobalState(left, top, width, height);

        this.scene = new Scene();

        const offScreenFbo: OffScreenFbo = new OffScreenFbo(this.renderer);
        const building = new Building(this.scene, offScreenFbo);

        this.setLights();
        this.setCamera();
        this.renderFrame = this.renderFrame.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        this.ray = new Ray();
        this.registerEvents();
    }

    start() {
        this.loop();
    }

    updateSpherePos() {
        const currentMousePos2D: Vector2 = this.globalState.getMousePos2D();
        const ray: Ray = this.ray;
        ray.origin.setFromMatrixPosition(this.camera.matrixWorld);
        ray.direction.set(currentMousePos2D.x, currentMousePos2D.y, 0.5).unproject(this.camera).sub(ray.origin).normalize();
        const distance: number = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
        ray.origin.add(new Vector3().copy(ray.direction).multiplyScalar(distance));
        this.globalState.setSpherePos3D(ray.origin);
    }

    registerEvents() {
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove, false);
    }

    onMouseMove(e: MouseEvent) {
        const { pageX, pageY } = e;
        const globalState = this.globalState;
        globalState.setMousePos2D(
            2.0 * (pageX - globalState.canvasInfo.left) / globalState.canvasInfo.width - 1.0,
            2.0 * (globalState.canvasInfo.height - (pageY - globalState.canvasInfo.top)) / globalState.canvasInfo.height - 1.0
        );
    }

    private setLights() {
        const ambient = new AmbientLight( 0xcccccc );
        const spot = new SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
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
        this.scene.add(ambient);
        this.scene.add( spot );
    }

    private setCamera() {
        const { width, height } = this.renderer.domElement.getBoundingClientRect();
        this.camera = new PerspectiveCamera(75, width / height, 0.1, 2000);
        this.camera.position.set(0, 50, 500);
        this.camera.lookAt(new Vector3(0, 50, 0));
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    private loop() {
        new RenderLooper(this.renderFrame).start();
    }

    private renderFrame() {
        this.updateSpherePos();
        this.renderer.render(this.scene, this.camera);
    }
}

new MainScene().start();