uniform vec2 resolution;
uniform sampler2D lastFrameVelocity;
uniform sampler2D defaultPos;
uniform sampler2D currentPos;
uniform vec3 sphere3dPos;
uniform vec3 sphereVelocity;
uniform float gravity;
uniform float friction;
uniform float radius;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 lastVelocity = texture2D(lastFrameVelocity, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    vec3 currentPosition = texture2D(currentPos, uv).xyz;

    // 判断粒子是否调落到水平面以下
    float isAboveGround = step(0.0, currentPosition.y);

    // 粒子是否在sphere作用半径内
    float distance = length(currentPosition - sphere3dPos);
    float isInSphere = 1.0 - step(radius, distance);

    vec3 repulsive = (currentPosition - sphere3dPos) * 0.001 * isInSphere;
    vec3 g = vec3(0.0, -gravity * (1000.0 - defaultPosition.y) * 0.0001, 0.0);
    vec3 frict = vec3(-lastVelocity.x * friction, 0.0, -lastVelocity.z * friction);
    vec3 tagent = sphereVelocity * 0.0;

    // vec3 velocity = mix(vec3(lastVelocity.x, -0.8 * lastVelocity.y, lastVelocity.z), lastVelocity + repulsive + g + frict + tagent, isAboveGround);
    vec3 velocity = lastVelocity + repulsive + frict + tagent;
    // vec3 velocity = mix(vec3(lastVelocity.x, -0.8 * lastVelocity.y, lastVelocity.z), lastVelocity + repulsive + frict + tagent, isAboveGround);

    gl_FragColor = vec4(velocity, 1.0);
}