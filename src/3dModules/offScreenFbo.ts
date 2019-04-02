import * as THREE from 'three';
import settings from '../settings';
const glsl = require('glslify');
// 创建一个离线scene
const offScreenScene = new THREE.Scene();
const fboCamera = new THREE.Camera();
// 创建出几个texture，作为这个离线帧缓冲的renderTarget，并将他们暴露到外部，供building模块使用
const { WIDTH, HEIGHT } = settings;
const defaultPosRenderTarget = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBFormat,
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false
});

// 保存所有粒子点的位置texture
// 用两个是因为不能用自己做输入同时做输出
const currentPosRenderTarget = defaultPosRenderTarget.clone();
const lastPosRenderTarget = defaultPosRenderTarget.clone();

// 保存所有粒子点的速度texture
const currentVelocityRenderTarget = defaultPosRenderTarget.clone();
const lastVelocityRenderTarget = defaultPosRenderTarget.clone();

const copyShader: THREE.ShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: glsl.file('../glsl/fbo.vert'),
    fragmentShader: glsl.file('../glsl/fboThrough.frag'),
    uniforms: {
        resolution: { value: new THREE.Vector2(WIDTH, HEIGHT) },
        inputTex: { value: undefined }
    }
})

const _mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), copyShader)
offScreenScene.add(_mesh);

function init(defaultPositions: Float32Array, renderer: THREE.WebGLRenderer) {
    const defaultPosTexture = new THREE.DataTexture(
        defaultPositions,
        WIDTH,
        HEIGHT,
        THREE.RGBFormat,
        THREE.FloatType
    )
    defaultPosTexture.wrapS = THREE.ClampToEdgeWrapping;
    defaultPosTexture.wrapT = THREE.ClampToEdgeWrapping;
    defaultPosTexture.minFilter = THREE.NearestFilter;
    defaultPosTexture.magFilter = THREE.NearestFilter;
    defaultPosTexture.needsUpdate = true;
    defaultPosTexture.flipY = false;

    draw2RenderTarget(defaultPosTexture, defaultPosRenderTarget, renderer);
    draw2RenderTarget(defaultPosTexture, lastPosRenderTarget, renderer);
    draw2RenderTarget(defaultPosTexture, currentPosRenderTarget, renderer);

    console.log('offScreenFbo init');
}

function draw2RenderTarget(input, output, renderer: THREE.WebGLRenderer) {
    _mesh.material = copyShader;
    _mesh.material.uniforms.inputTex.value = input;
    renderer.setRenderTarget(output);
    renderer.render(offScreenScene, fboCamera);
}

// 只需暴露当前帧的位置及初始位置
export { init, defaultPosRenderTarget, currentPosRenderTarget };