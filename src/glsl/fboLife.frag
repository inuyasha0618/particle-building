uniform vec2 resolution;
uniform sampler2D currentFramePos;
uniform sampler2D defaultPos;
uniform sampler2D lastFrameLife;
uniform sampler2D velocity;

const float EPS = 0.01;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 currentPosition = texture2D(currentFramePos, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    float lastLife = texture2D(lastFrameLife, uv).x;
    float isActive = texture2D(velocity, uv).a;
    // float life = lastLife + step(EPS, abs(distance(currentPosition, defaultPosition))) * 0.005;
    // life = mix(life, 0.0, step(1.0, life));
    // gl_FragColor = vec4(life, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(mix(lastLife + 0.005, 0.0, step(1.0, lastLife) * step(EPS, abs(distance(currentPosition, defaultPosition)))), 0.0, 0.0, 1.0);
    vec4 color = vec4(0.0);
    if (lastLife > 1.0) {
        color = vec4(0.0);
    } else {
        // gl_FragColor = vec4(lastLife + 0.005, 0.0, 0.0, 0.0);
        color = vec4(lastLife + 0.005 * isActive, 0.0, 0.0, 0.0);
    }
    gl_FragColor = color;
}