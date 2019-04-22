/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
import * as THREE from 'three';

const GeometryUtils = {

	// Merge two geometries or geometry and geometry from object (using object's transform)

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( 'GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.' );

		var matrix;

		if ( geometry2 instanceof THREE.Mesh ) {

			geometry2.matrixAutoUpdate && geometry2.updateMatrix();

			matrix = geometry2.matrix;
			geometry2 = geometry2.geometry;

		}

		geometry1.merge( geometry2, matrix, materialIndexOffset );

	},

	// Get random point in triangle (via barycentric coordinates)
	// 	(uniform distribution)
	// 	http://www.cgafaq.info/wiki/Random_Point_In_Triangle

	// randomPointInTriangle: function () {


	// 	return function ( posA, posB, posC, normalA, normalB, normalC, uvA, uvB, uvC ) {

	// 		var a = Math.random();
	// 		var b = Math.random();

	// 		if ( ( a + b ) > 1 ) {

	// 			a = 1 - a;
	// 			b = 1 - b;

	// 		}

	// 		var c = 1 - a - b;

	// 		return {
	// 			position: GeometryUtils.calcuPtsByWeightCoord(posA, posB, posC, a, b, c),
	// 			normal: GeometryUtils.calcuPtsByWeightCoord(normalA, normalB, normalC, a, b, c),
	// 			uv: GeometryUtils.calcuPtsByWeightCoord(uvA, uvB, uvC, a, b, c),
	// 		}

	// 	};

	// }(),
	randomPointInTriangle: function () {


		return function ( posA, posB, posC, normalA, normalB, normalC, uvA, uvB, uvC ) {

			var a = Math.random();
			var b = Math.random();

			if ( ( a + b ) > 1 ) {

				a = 1 - a;
				b = 1 - b;

			}

			var c = 1 - a - b;

			return {
				position: GeometryUtils.calcuPtsByWeightCoord(posA, posB, posC, a, b, c),
				normal: GeometryUtils.calcuPtsByWeightCoord(normalA, normalB, normalC, a, b, c),
				uv: GeometryUtils.calcuPtsByWeightCoord(uvA, uvB, uvC, a, b, c),
			}

		};

	}(),

	calcuPtsByWeightCoord(vec1, vec2, vec3, a, b, c) {
		let result = null;
		if (vec1 instanceof THREE.Vector3 && vec2 instanceof THREE.Vector3 && vec2 instanceof THREE.Vector3) {
			result = new THREE.Vector3();
			result.add(vec1.clone().multiplyScalar(a));
			result.add(vec2.clone().multiplyScalar(b));
			result.add(vec3.clone().multiplyScalar(c));
		} else if (vec1 instanceof THREE.Vector2 && vec2 instanceof THREE.Vector2 && vec3 instanceof THREE.Vector2) {
			result = new THREE.Vector2();
			result.add(vec1.clone().multiplyScalar(a));
			result.add(vec2.clone().multiplyScalar(b));
			result.add(vec3.clone().multiplyScalar(c));
		} else {
			console.error('dimension mismatch');
		}
		return result;
	},

	randomPointsInBufferGeometry: function ( geometry, n ) {

		var i,
			vertices = geometry.attributes.position.array,
			normals = geometry.attributes.normal.array,
			uvs = geometry.attributes.uv.array,
			totalArea = 0,
			cumulativeAreas = [],
			vA, vB, vC,
			normalA, normalB, normalC,
			uvA, uvB, uvC;

		// precompute face areas
		vA = new THREE.Vector3();
		vB = new THREE.Vector3();
		vC = new THREE.Vector3();
		normalA = new THREE.Vector3();
		normalB = new THREE.Vector3();
		normalC = new THREE.Vector3();
		uvA = new THREE.Vector2();
		uvB = new THREE.Vector2();
		uvC = new THREE.Vector2();

		// geometry._areas = [];
		var il = vertices.length / 9;

		for ( i = 0; i < il; i ++ ) {

			vA.set( vertices[ i * 9 + 0 ], vertices[ i * 9 + 1 ], vertices[ i * 9 + 2 ] );
			vB.set( vertices[ i * 9 + 3 ], vertices[ i * 9 + 4 ], vertices[ i * 9 + 5 ] );
			vC.set( vertices[ i * 9 + 6 ], vertices[ i * 9 + 7 ], vertices[ i * 9 + 8 ] );

			totalArea += GeometryUtils.triangleArea( vA, vB, vC );

			cumulativeAreas.push( totalArea );

		}

		// binary search cumulative areas array

		function binarySearchIndices( value ) {

			function binarySearch( start, end ) {

				// return closest larger index
				// if exact number is not found

				if ( end < start )
					return start;

				var mid = start + Math.floor( ( end - start ) / 2 );

				if ( cumulativeAreas[ mid ] > value ) {

					return binarySearch( start, mid - 1 );

				} else if ( cumulativeAreas[ mid ] < value ) {

					return binarySearch( mid + 1, end );

				} else {

					return mid;

				}

			}

			var result = binarySearch( 0, cumulativeAreas.length - 1 );
			return result;

		}

		// pick random face weighted by face area

		var r, index,
			result = [];

		for ( i = 0; i < n; i ++ ) {

			r = Math.random() * totalArea;

			index = binarySearchIndices( r );

			// result[ i ] = GeometryUtils.randomPointInFace( faces[ index ], geometry, true );
			vA.set( vertices[ index * 9 + 0 ], vertices[ index * 9 + 1 ], vertices[ index * 9 + 2 ] );
			vB.set( vertices[ index * 9 + 3 ], vertices[ index * 9 + 4 ], vertices[ index * 9 + 5 ] );
			vC.set( vertices[ index * 9 + 6 ], vertices[ index * 9 + 7 ], vertices[ index * 9 + 8 ] );

			normalA.set( normals[ index * 9 + 0 ], normals[ index * 9 + 1 ], normals[ index * 9 + 2 ] );
			normalB.set( normals[ index * 9 + 3 ], normals[ index * 9 + 4 ], normals[ index * 9 + 5 ] );
			normalC.set( normals[ index * 9 + 6 ], normals[ index * 9 + 7 ], normals[ index * 9 + 8 ] );

			uvA.set( uvs[ index * 6 + 0 ], uvs[ index * 6 + 1 ] );
			uvB.set( uvs[ index * 6 + 2 ], uvs[ index * 6 + 3 ] );
			uvC.set( uvs[ index * 6 + 4 ], uvs[ index * 6 + 5 ] );

			result[ i ] = GeometryUtils.randomPointInTriangle( vA, vB, vC, normalA, normalB, normalC, uvA, uvB, uvC );
			// result[ i ] = GeometryUtils.randomPointInTriangle( vA, vB, vC, normalA, normalB, normalC );

		}

		return result;

	},

	// Get triangle area (half of parallelogram)
	// http://mathworld.wolfram.com/TriangleArea.html

	triangleArea: function () {

		var vector1 = new THREE.Vector3();
		var vector2 = new THREE.Vector3();

		return function ( vectorA, vectorB, vectorC ) {

			vector1.subVectors( vectorB, vectorA );
			vector2.subVectors( vectorC, vectorA );
			vector1.cross( vector2 );

			return 0.5 * vector1.length();

		};

	}(),

	center: function ( geometry ) {

		console.warn( 'GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead.' );
		return geometry.center();

	}

};

export { GeometryUtils };