uniform sampler2D inputTex;
uniform vec2 resolution;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 color = texture2D(inputTex, uv).rgb;
    gl_FragColor = vec4(color, 1.0);
}