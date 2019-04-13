import * as THREE from 'three';
import {
    BufferGeometry,
    BufferAttribute,
    Points,
    Box3,
    Mesh,
    MeshPhongMaterial
} from 'three';
import OffScreenFbo from './offScreenFbo2';
import settings from '../settings';
import { BufferGeometryUtils } from '../libs/BufferGeometeryUtils';
import { GeometryUtils } from '../libs/GeometryUtils';
var glsl = require('glslify')

var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
const loader = new THREE.OBJLoader();
export default class Bulding {
    private offSceenFbo: OffScreenFbo;
    mesh: Points;
    bodyMesh: Mesh;
    boundingBox: Box3;

    constructor(offSceenFbo: OffScreenFbo ) {
        this.offSceenFbo = offSceenFbo;
        this.setMesh();
        this.loadModel();
    }

    getSpecifiedMaterial() {
        let newPointMaterial = new MeshPhongMaterial({
            color: new THREE.Color().setHex(0x777777),
            specular: new THREE.Color().setHex(0x222222),
            shininess: 12,
            reflectivity: 0.5,
            // blending: THREE.AdditiveBlending
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation, //default
            blendSrc: THREE.SrcAlphaFactor, //default
            blendDst: THREE.OneMinusSrcAlphaFactor, //default
        });

        var uniforms = THREE.UniformsUtils.merge( [THREE.ShaderLib.phong.uniforms] );
        uniforms.texturePosition = { value: undefined };
        newPointMaterial.uniforms = uniforms;
        newPointMaterial.type = 'ShaderMaterial';
        newPointMaterial.vertexShader = glsl.file('../glsl/meshphong.vert');
        newPointMaterial.fragmentShader = glsl.file('../glsl/meshphong.frag');

        return newPointMaterial;
    }

    setMesh() {
        this.mesh =  new Points(new BufferGeometry(), this.getSpecifiedMaterial());
        this.bodyMesh = new Mesh(new BufferGeometry(), new MeshPhongMaterial({
            color: new THREE.Color().setHex(0x555555),
            specular: new THREE.Color().setHex(0x222222),
            shininess: 12,
            reflectivity: 0.5,
            blending: THREE.NoBlending
        }))
    }

    loadModel() {
        let totalBufferGeometry: THREE.BufferGeometry = null;
        const { WIDTH, HEIGHT } = settings;
        const PARTICLE_AMOUNTS = WIDTH * HEIGHT;
        const vertices: Float32Array = new Float32Array(PARTICLE_AMOUNTS * 3);
        const normals: Float32Array = new Float32Array(PARTICLE_AMOUNTS * 3);
        const uvs: Float32Array = new Float32Array(PARTICLE_AMOUNTS * 2);
        // loader.load('../../models/o.obj', (object) => {
        loader.load('../../models/male02.obj', (object) => {
            totalBufferGeometry = BufferGeometryUtils.mergeBufferGeometries(object.children.map(child => child.geometry), false);
            const originalPositions = totalBufferGeometry.attributes.position.array;
            const originalNormals = totalBufferGeometry.attributes.normal.array;
            // const originalUvs = totalBufferGeometry.attributes.uv.array;
            const originalPtsCnts = totalBufferGeometry.attributes.position.count;
            // const remainder = PARTICLE_AMOUNTS - originalPtsCnts;
            const remainder = PARTICLE_AMOUNTS;
            const result = GeometryUtils.randomPointsInBufferGeometry(totalBufferGeometry, remainder)
            // let pointIndex = originalPtsCnts;
            let pointIndex = 0;
            this.computeBoundingBox(totalBufferGeometry);
            // vertices.set(originalPositions);
            // normals.set(originalNormals);
            for (let i = 0, len = result.length; i < len; ++i) {
                const { position, normal, uv }  = result[i];
                vertices[3 * pointIndex] = position.x;
                vertices[3 * pointIndex + 1] = position.y;
                vertices[3 * pointIndex + 2] = position.z;

                normals[3 * pointIndex] = normal.x;
                normals[3 * pointIndex + 1] = normal.y;
                normals[3 * pointIndex + 2] = normal.z;

                pointIndex++;
                // uvs[2 * pointIndex] = uv.x;
                // uvs[2 * pointIndex + 1] = uv.y;
            }
            const position = new Float32Array(PARTICLE_AMOUNTS * 3);

            for (let i = 0; i < PARTICLE_AMOUNTS; i++) {
                position[3 * i] = (i % WIDTH) / WIDTH;
                position[3 * i + 1] = ~~(i / WIDTH) / HEIGHT;
                position[3 * i + 2] = Math.random();
            }

            const normalBufferAttribute: BufferAttribute = new BufferAttribute(normals, 3, false);

            (<THREE.BufferGeometry>this.mesh.geometry).addAttribute('position', new THREE.BufferAttribute(position, 3, false));
            (<THREE.BufferGeometry>this.mesh.geometry).addAttribute('normal', normalBufferAttribute);
            // pointGeometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2, false));

            this.offSceenFbo.initDefaultPositions(vertices);
            this.mesh.material.uniforms.texturePosition.value = this.offSceenFbo.currentFramePosRenderTarget.texture;
            // this.mesh.material.uniforms.textureLife.value = this.offSceenFbo.currentFrameLifeRenderTarget.texture;

            (<THREE.BufferGeometry>this.bodyMesh.geometry).addAttribute('position', new THREE.BufferAttribute(originalPositions, 3, false));
            (<THREE.BufferGeometry>this.bodyMesh.geometry).addAttribute('normal',  new THREE.BufferAttribute(originalNormals, 3, false));
        });
    }

    computeBoundingBox(bufferGeometry: BufferGeometry) {
        bufferGeometry.computeBoundingBox();
        this.boundingBox = bufferGeometry.boundingBox;
    }
}