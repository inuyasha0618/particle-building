import * as THREE from 'three';
import {
    Scene,
    Mesh,
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
    private mesh: Mesh;

    constructor(scene: Scene, offSceenFbo: OffScreenFbo ) {
        this.offSceenFbo = offSceenFbo;
        const { WIDTH, HEIGHT } = settings;
        const PARTICLE_AMOUNTS = WIDTH * HEIGHT;
        const vertices: Float32Array = new Float32Array(PARTICLE_AMOUNTS * 3);
        const normals: Float32Array = new Float32Array(PARTICLE_AMOUNTS * 3);
        const uvs: Float32Array = new Float32Array(PARTICLE_AMOUNTS * 2);

        let totalBufferGeometry: THREE.BufferGeometry = null;
        loader.load('../../models/o.obj', function(object) {
            totalBufferGeometry = BufferGeometryUtils.mergeBufferGeometries(object.children.map(child => child.geometry), false);
            const originalPositions = totalBufferGeometry.attributes.position.array;
            const originalNormals = totalBufferGeometry.attributes.normal.array;
            // const originalUvs = totalBufferGeometry.attributes.uv.array;
            const originalPtsCnts = totalBufferGeometry.attributes.position.count;
            const remainder = PARTICLE_AMOUNTS - originalPtsCnts;
            console.log(totalBufferGeometry);
            const result = GeometryUtils.randomPointsInBufferGeometry(totalBufferGeometry, remainder)
            let pointIndex = originalPtsCnts;

            vertices.set(originalPositions);
            normals.set(originalNormals);
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

            console.timeEnd('process');
            const pointGeometry = new THREE.BufferGeometry();
            pointGeometry.center();
            // pointGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3, false));
            pointGeometry.addAttribute('position', new THREE.BufferAttribute(position, 3, false));
            pointGeometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3, false));
            // pointGeometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2, false));
            // mesh = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: 0x888888, size: 0.1 }))

            let newPointMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHex(0x777777),
                specular: new THREE.Color().setHex(0x222222),
                shininess: 12,
                reflectivity: 0.5,
                blending: THREE.NoBlending
            });

            var uniforms = THREE.UniformsUtils.merge( [THREE.ShaderLib.phong.uniforms] );
            uniforms.texturePosition = { value: undefined };
            newPointMaterial.uniforms = uniforms;
            newPointMaterial.type = 'ShaderMaterial';
            newPointMaterial.vertexShader = glsl.file('../glsl/meshphong.vert');
            newPointMaterial.fragmentShader = glsl.file('../glsl/meshphong.frag');

            this.mesh = new THREE.Points(pointGeometry, newPointMaterial);
            // scene.add(new THREE.Mesh(totalBufferGeometry, new THREE.MeshPhongMaterial({
            //     color: new THREE.Color().setHex(0x777777),
            //     specular: new THREE.Color().setHex(0x222222),
            //     shininess: 12,
            //     reflectivity: 0.5,
            //     blending: THREE.NoBlending,
            // })));
            offSceenFbo.initDefaultPositions(vertices);
            this.mesh.material.uniforms.texturePosition.value = offSceenFbo.defaultPosRenderTarget.texture;
            scene.add(this.mesh);
        });
    }
}