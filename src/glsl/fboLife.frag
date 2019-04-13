uniform vec2 resolution;
uniform sampler2D lastFrameLife;
uniform sampler2D velocity;

const float EPS = 0.01;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    float lastLife = texture2D(lastFrameLife, uv).x;
    float isActive = texture2D(velocity, uv).a;

    vec4 color = vec4(0.0);
    if (lastLife > 1.0) {
        color = vec4(0.0);
    } else {
        // gl_FragColor = vec4(lastLife + 0.005, 0.0, 0.0, 0.0);
        color = vec4(lastLife + 0.005 * isActive, 0.0, 0.0, 0.0);
    }
    gl_FragColor = color;
}