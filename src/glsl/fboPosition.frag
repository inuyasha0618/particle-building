uniform vec2 resolution;
uniform sampler2D lastFramePos;
uniform sampler2D defaultPos;
uniform sampler2D velocity;
uniform float resetAnimation;

const float EPS = 0.0001;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 lastPosition = texture2D(lastFramePos, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    vec3 v = texture2D(velocity, uv).xyz;
    vec3 position = lastPosition + v;
    position = mix(position, defaultPosition, pow(smoothstep(EPS, 1.0, resetAnimation), 0.5));
    gl_FragColor = vec4(position, 1.0);
}