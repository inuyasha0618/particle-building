import {
    ClampToEdgeWrapping,
    NearestFilter,
    Scene,
    Mesh,
    Camera,
    WebGLRenderTarget,
    ShaderMaterial,
    WebGLRenderer,
    RGBFormat,
    RGBAFormat,
    FloatType,
    PlaneBufferGeometry,
    Vector2,
    DataTexture,
    Vector3,
    Matrix4
} from 'three';
import settings from '../settings';
const glsl = require('glslify');
import GlobalState from '../globalState';

export default class OffScreenFbo {

    // 场景基础元素
    private offScreenScene: Scene;
    private camera: Camera;
    private renderer: WebGLRenderer;
    private mesh: Mesh;
    public testBoard: Mesh;
    
    // render targets:
    public defaultPosRenderTarget: WebGLRenderTarget;
    private lastFramePosRenderTarget: WebGLRenderTarget;
    public currentFramePosRenderTarget: WebGLRenderTarget;
    private lastFrameVelocityRenderTarget: WebGLRenderTarget;
    public currentFrameVelocityRenderTarget: WebGLRenderTarget;
    private lastFrameLifeRenderTarget: WebGLRenderTarget;
    public currentFrameLifeRenderTarget: WebGLRenderTarget;

    // shader materials:
    private copyShader: ShaderMaterial;
    private velocityShader: ShaderMaterial;
    private positionShader: ShaderMaterial;
    private lifeShader: ShaderMaterial;
    private initPositionShader: ShaderMaterial;
    private setActiveShader: ShaderMaterial;

    constructor(renderer: WebGLRenderer) {
        this.initRenderTargets();
        this.initShaderMaterials();
        this.camera = new Camera();
        this.renderer = renderer;
        this.offScreenScene = new Scene();
        this.mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.copyShader);
        this.offScreenScene.add(this.mesh);

        var gl = renderer.getContext();
        if ( !gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) ) {
            alert( 'No support for vertex shader textures!' );
            return;
        }
        if ( !gl.getExtension( 'OES_texture_float' )) {
            alert( 'No OES_texture_float support for float textures!' );
            return;
        }

        document.addEventListener('keydown', e => {
            if (e.keyCode == 32) {
                this.setActive();
            }
        })
    }

    public update(globalState: GlobalState) {
        this.updateVelocity(globalState);
        this.updatePosition(globalState);
    }

    private setActive() {
        this.mesh.material = this.setActiveShader;

        this.renderer.setRenderTarget(this.currentFrameVelocityRenderTarget);
        this.renderer.render(this.offScreenScene, this.camera);
        this.renderer.setRenderTarget(null);
    }

    private updateVelocity(globalState: GlobalState) {
        const spherePos: Vector3 = globalState.getSpherePos3D();
        const sphereVelocity: Vector3 = globalState.getSephereVelocity();
        this.mesh.material = this.velocityShader;

        let tmp: WebGLRenderTarget = this.lastFrameVelocityRenderTarget;
        this.lastFrameVelocityRenderTarget = this.currentFrameVelocityRenderTarget;
        this.currentFrameVelocityRenderTarget = tmp;

        this.velocityShader.uniforms.lastFrameVelocity.value = this.lastFrameVelocityRenderTarget.texture;
        this.velocityShader.uniforms.defaultPos.value = this.defaultPosRenderTarget.texture;
        this.velocityShader.uniforms.currentPos.value = this.currentFramePosRenderTarget.texture;
        this.velocityShader.uniforms.sphere3dPos.value = spherePos;
        this.velocityShader.uniforms.sphereVelocity.value = sphereVelocity;

        this.renderer.setRenderTarget(this.currentFrameVelocityRenderTarget);
        this.renderer.render(this.offScreenScene, this.camera);
        this.renderer.setRenderTarget(null);
    }

    private updatePosition(globalState: GlobalState) {

        let tmp: WebGLRenderTarget = this.lastFramePosRenderTarget;
        this.lastFramePosRenderTarget = this.currentFramePosRenderTarget;
        this.currentFramePosRenderTarget = tmp;

        this.mesh.material = this.positionShader;

        this.positionShader.uniforms.lastFramePos.value = this.lastFramePosRenderTarget.texture;
        this.positionShader.uniforms.defaultPos.value = this.defaultPosRenderTarget.texture;
        this.positionShader.uniforms.velocity.value = this.currentFrameVelocityRenderTarget.texture;

        this.renderer.setRenderTarget(this.currentFramePosRenderTarget);
        this.renderer.render(this.offScreenScene, this.camera);
        this.renderer.setRenderTarget(null);

    }

    public initDefaultPositions(defaultPositions: Float32Array) {
        const defaultPosTexture = new DataTexture(
            defaultPositions,
            settings.WIDTH,
            settings.HEIGHT,
            RGBFormat,
            FloatType
        )
        defaultPosTexture.wrapS = ClampToEdgeWrapping;
        defaultPosTexture.wrapT = ClampToEdgeWrapping;
        defaultPosTexture.minFilter = NearestFilter;
        defaultPosTexture.magFilter = NearestFilter;
        defaultPosTexture.needsUpdate = true;
        defaultPosTexture.flipY = false;
    
        this.createDefaultPosition(defaultPosTexture, this.defaultPosRenderTarget);
        this.copy2RenderTarget(this.defaultPosRenderTarget.texture, this.lastFramePosRenderTarget);
        this.copy2RenderTarget(this.defaultPosRenderTarget.texture, this.currentFramePosRenderTarget);

        const velocityTexture = new DataTexture(
            new Float32Array(defaultPositions.length),
            settings.WIDTH,
            settings.HEIGHT,
            RGBAFormat,
            FloatType
        )
        velocityTexture.wrapS = ClampToEdgeWrapping;
        velocityTexture.wrapT = ClampToEdgeWrapping;
        velocityTexture.minFilter = NearestFilter;
        velocityTexture.magFilter = NearestFilter;
        velocityTexture.needsUpdate = true;
        velocityTexture.flipY = false;

        this.copy2RenderTarget(velocityTexture, this.lastFrameVelocityRenderTarget);
        this.copy2RenderTarget(velocityTexture, this.currentFrameVelocityRenderTarget);

        const lifeTexture = new DataTexture(
            new Float32Array(defaultPositions.length),
            settings.WIDTH,
            settings.HEIGHT,
            RGBFormat,
            FloatType
        )
        lifeTexture.wrapS = ClampToEdgeWrapping;
        lifeTexture.wrapT = ClampToEdgeWrapping;
        lifeTexture.minFilter = NearestFilter;
        lifeTexture.magFilter = NearestFilter;
        lifeTexture.needsUpdate = true;
        lifeTexture.flipY = false;

        this.copy2RenderTarget(lifeTexture, this.lastFrameLifeRenderTarget);
        this.copy2RenderTarget(lifeTexture, this.currentFrameLifeRenderTarget);
    }

    private initRenderTargets() {
        const { WIDTH, HEIGHT } = settings;
        this.defaultPosRenderTarget = new WebGLRenderTarget(WIDTH, HEIGHT, {
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            type: FloatType,
            depthBuffer: false,
            stencilBuffer: false
        });

        this.lastFramePosRenderTarget = this.defaultPosRenderTarget.clone();
        this.currentFramePosRenderTarget = this.defaultPosRenderTarget.clone();
        this.lastFrameVelocityRenderTarget = this.defaultPosRenderTarget.clone();
        this.currentFrameVelocityRenderTarget = this.defaultPosRenderTarget.clone();
        this.lastFrameLifeRenderTarget = this.defaultPosRenderTarget.clone();
        this.currentFrameLifeRenderTarget = this.defaultPosRenderTarget.clone();
    }

    private initShaderMaterials() {
        const { WIDTH, HEIGHT } = settings;
        const modelMx: Matrix4 = new Matrix4();
        // modelMx.set(3.0, 0.0, 0.0, 0.0,
        //             0.0, 3.0, 0.0, -250.0,
        //             0.0, 0.0, 3.0, 0.0,
        //             0.0, 0.0, 0.0, 1.0);
        modelMx.set(-3.0, 0.0, 0.0, 0.0,
                    0.0, 3.0, 0.0, -250.0,
                    0.0, 0.0, -3.0, 0.0,
                    0.0, 0.0, 0.0, 1.0);

        this.initPositionShader = new ShaderMaterial({
            vertexShader: glsl.file('../glsl/fbo.vert'),
            fragmentShader: glsl.file('../glsl/fboInitPosition.frag'),
            uniforms: {
                resolution: { value: new Vector2(WIDTH, HEIGHT) },
                inputTex: { value: undefined },
                modelMx: { value: modelMx}
            }
        });

        this.copyShader = new ShaderMaterial({
            vertexShader: glsl.file('../glsl/fbo.vert'),
            fragmentShader: glsl.file('../glsl/fboThrough.frag'),
            uniforms: {
                resolution: { value: new Vector2(WIDTH, HEIGHT) },
                inputTex: { value: undefined }
            }
        });

        this.setActiveShader = new ShaderMaterial({
            vertexShader: glsl.file('../glsl/fbo.vert'),
            fragmentShader: glsl.file('../glsl/setActive.frag'),
        });

        this.velocityShader = new ShaderMaterial({
            vertexShader: glsl.file('../glsl/fbo.vert'),
            fragmentShader: glsl.file('../glsl/fboVelocity.frag'),
            uniforms: {
                resolution: { value: new Vector2(WIDTH, HEIGHT) },
                lastFrameVelocity: { value: undefined },
                defaultPos: { value: undefined },
                currentPos: { value: undefined },
                sphere3dPos: { value: undefined},
                sphereVelocity: { value: undefined },
                gravity: { value: 0.15 },
                friction: { value: 0.01 },
                radius: { value: settings.RADIUS},
                // life: { value: undefined }
            },
            transparent: false,
            depthWrite: false,
            depthTest: false
        });

        this.positionShader = new ShaderMaterial({
            vertexShader: glsl.file('../glsl/fbo.vert'),
            fragmentShader: glsl.file('../glsl/fboPosition.frag'),
            uniforms: {
                resolution: { value: new Vector2(WIDTH, HEIGHT) },
                lastFramePos: { value: undefined },
                defaultPos: { value: undefined },
                velocity: { value: undefined },
                // life: { value: undefined }
            },
            transparent: false,
            depthWrite: false,
            depthTest: false
        });
    }

    private copy2RenderTarget(input, output) {
        this.mesh.material = this.copyShader;
        this.mesh.material.uniforms.inputTex.value = input;
        this.renderer.setRenderTarget(output);
        this.renderer.render(this.offScreenScene, this.camera);
        this.renderer.setRenderTarget(null);
    }

    private createDefaultPosition(input, output) {
        this.mesh.material = this.initPositionShader;
        this.mesh.material.uniforms.inputTex.value = input;
        this.renderer.setRenderTarget(output);
        this.renderer.render(this.offScreenScene, this.camera);
        this.renderer.setRenderTarget(null);
    }
}