uniform vec2 resolution;
uniform sampler2D lastFramePos;
uniform sampler2D defaultPos;
uniform sampler2D velocity;
uniform sampler2D life;

uniform float resetAnimation;

const float EPS = 0.0001;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 lastPosition = texture2D(lastFramePos, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    float currentLife = texture2D(life, uv).x;

    vec3 v = texture2D(velocity, uv).xyz;
    vec3 position = lastPosition + v;
    float positionOffset = distance(position, defaultPosition);

    // position = mix(position, defaultPosition, pow(smoothstep(EPS, 1.0, resetAnimation), 0.5));
    position = mix(position, defaultPosition, step(1.0, currentLife));
    gl_FragColor = vec4(position, 1.0);
}