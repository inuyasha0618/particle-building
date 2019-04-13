uniform vec2 resolution;
uniform sampler2D lastFrameVelocity;
uniform sampler2D defaultPos;
uniform sampler2D currentPos;
uniform vec3 sphere3dPos;
uniform vec3 sphereVelocity;
uniform float gravity;
uniform float friction;
uniform float radius;
uniform float resetAnimation;

const float EPS = 0.0001;
#pragma glslify: random = require(glsl-random)

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 velocity = texture2D(lastFrameVelocity, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    vec4 posInfo = texture2D(currentPos, uv).xyzw;
    vec3 currentPosition = posInfo.xyz;
    // float currentLife = texture2D(life, uv).x;
    float currentLife = posInfo.w;
    float isActive = texture2D(lastFrameVelocity, uv).w;
    // 判断粒子是否调落到水平面以下
    // float isAboveGround = step(0.0, currentPosition.y);

    // 粒子是否在sphere作用半径内
    // float distance = length(currentPosition - sphere3dPos);
    float isInSphere = 1.0 - step(radius, distance(currentPosition, sphere3dPos));

    // 粒子偏移出原来位置的偏移量
    float positionOffset = distance(currentPosition, defaultPosition);

    // 计算空气阻力及重力 / 反弹 对速度的影响
    if (currentPosition.y > -200.0) {
        velocity += step(EPS, positionOffset) * vec3(0.0, -gravity * ((1.0 - defaultPosition.y * 0.001) + random(defaultPosition.xy)), 0.0);
        velocity.xz *= 1.0 - friction;
    } else {
        float strength = abs(velocity.y) * 0.2;
        velocity.y *= -0.4 - random(uv + 2.0) * 0.2;
        velocity.x += (random(currentPosition.xy + strength) - 0.5);
        velocity.z += (random(currentPosition.zy) - 0.5);
        velocity.xz *= strength;
    }

    vec3 repulsive = normalize(currentPosition - sphere3dPos) * random(defaultPosition.xy);
    vec3 tagent = sphereVelocity * 0.08;

    velocity += (repulsive + tagent) * (1.0 + random(vec2(currentPosition.x + currentPosition.y, currentPosition.z)) * 0.3) * isInSphere;

    // velocity *= step(-EPS, -resetAnimation);
    isActive = step(1.0 - EPS, isActive + isInSphere);
    float isDead = step(1.0, currentLife);
    velocity *= 1.0 - isDead;
    isActive *= 1.0 - isDead;

    gl_FragColor = vec4(velocity, isActive);
}