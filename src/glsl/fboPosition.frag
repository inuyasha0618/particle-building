uniform vec2 resolution;
uniform sampler2D lastFramePos;
uniform sampler2D defaultPos;
uniform sampler2D velocity;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 lastPosition = texture2D(lastFramePos, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    vec3 v = texture2D(velocity, uv).xyz;
    vec3 position = lastPosition + v;
    gl_FragColor = vec4(position, 1.0);
}