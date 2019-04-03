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
    private building: Building;

    constructor() {
        this.renderer = this.setRenderer();
        this.globalState = this.initializeGlobalState();
        this.scene = new Scene();
        this.setBuilding();
        this.setLights();
        this.setCamera();
        this.ray = new Ray();
        this.bind2this();
        this.registerEvents();
    }

    public start() {
        this.loop();
    }

    private setRenderer(): WebGLRenderer {
        const renderer = new WebGLRenderer({ antialias: true });
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    private initializeGlobalState(): GlobalState {
        const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
        const globalState: GlobalState = new GlobalState(left, top, width, height);
        return globalState;
    }

    private setBuilding() {
        const offScreenFbo: OffScreenFbo = new OffScreenFbo(this.renderer);
        this.building = new Building(offScreenFbo);
        this.scene.add(this.building.mesh);
    }

    private bind2this() {
        this.renderFrame = this.renderFrame.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    private updateSpherePos() {
        const currentMousePos2D: Vector2 = this.globalState.getMousePos2D();
        const ray: Ray = this.ray;
        ray.origin.setFromMatrixPosition(this.camera.matrixWorld);
        ray.direction.set(currentMousePos2D.x, currentMousePos2D.y, 0.5).unproject(this.camera).sub(ray.origin).normalize();
        const distance: number = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
        ray.origin.add(new Vector3().copy(ray.direction).multiplyScalar(distance));
        this.globalState.setSpherePos3D(ray.origin);
    }

    private registerEvents() {
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove, false);
    }

    private onMouseMove(e: MouseEvent) {
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