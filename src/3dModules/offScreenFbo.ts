import * as THREE from 'three';
import settings from '../settings';
// 创建一个离线scene
const offScreenScene = new THREE.Scene();
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

function init(defaultPositions: Float32Array) {
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

    console.log('offScreenFbo init');
}


// 只需暴露当前帧的位置及初始位置
export { init, defaultPosRenderTarget, currentPosRenderTarget };