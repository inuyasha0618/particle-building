uniform vec2 resolution;
uniform sampler2D lastFramePos;
uniform sampler2D defaultPos;
uniform sampler2D velocity;


const float EPS = 0.0001;
#pragma glslify: random = require(glsl-random)

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 lastPosTex = texture2D(lastFramePos, uv).xyzw;
    vec3 lastPosition = lastPosTex.xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    float lastLife = lastPosTex.w;

    vec4 lastVelocityTex = texture2D(velocity, uv).xyzw;
    vec3 v = lastVelocityTex.xyz;
    float isActive = lastVelocityTex.w;
    vec3 position = lastPosition + v;
    float life = 0.0;

    lastLife = mix(lastLife + 0.005 * (0.3 + 0.7 * random(uv)) * isActive, 0.0, step(1.0, lastLife));

    position = mix(position, defaultPosition, step(1.0, lastLife));
    gl_FragColor = vec4(position, lastLife);
}