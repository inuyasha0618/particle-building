uniform sampler2D inputTex;
uniform vec2 resolution;
uniform mat4 modelMx;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 color = modelMx * vec4(texture2D(inputTex, uv).rgb, 1.0);
    gl_FragColor = vec4(color.xyz, 0.0);
}