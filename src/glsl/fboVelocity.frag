uniform vec2 resolution;
uniform sampler2D lastFrameVelocity;
uniform sampler2D defaultPos;
uniform sampler2D currentPos;
uniform vec3 sphere3dPos;
uniform vec3 sphereVelocity;
uniform float gravity;
uniform float friction;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 lastVelocity = texture2D(lastFrameVelocity, uv).xyz;
    vec3 defaultPosition = texture2D(defaultPos, uv).xyz;
    vec3 currentPosition = texture2D(currentPos, uv).xyz;

    vec3 repulsive = (currentPosition - sphere3dPos) * 0.5;
    vec3 g = vec3(0.0, -gravity, 0.0);
    vec3 frict = vec3(-lastVelocity.x * friction, 0.0, -lastVelocity.z * friction);
    vec3 tagent = sphereVelocity * 0.6;

    // vec3 velocity = lastVelocity + repulsive + g + frict + tagent;
    // vec3 velocity = lastVelocity + repulsive + g + frict;
    vec3 velocity = vec3(0.0);

    gl_FragColor = vec4(velocity, 1.0);
}