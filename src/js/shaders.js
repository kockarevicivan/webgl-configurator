export const getVertexShader = (gl) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertexShader, `
        precision mediump float;

        attribute vec3 position;

        attribute vec3 normal;
        varying vec3 vNormal;

        attribute vec3 color;
        varying vec3 vColor;

        attribute vec2 uv;
        varying vec2 vUV;

        uniform mat4 matrix;

        void main() {
            vNormal = (matrix * vec4(normal, 0.0)).xyz;
            vColor = color;
            vUV = uv;
            gl_Position = matrix * vec4(position, 1);
        }
    `);

    gl.compileShader(vertexShader);

    return vertexShader;
}

export const getColorFragmentShader = (gl) => {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying vec3 vNormal;
        varying vec3 vColor;
        varying vec2 vUV;

        uniform sampler2D textureID;

        void main() {
            vec3 ambientLightIntensity = vec3(0.1, 0.1, 0.1);
            vec3 sunlightIntensity = vec3(0.7, 0.6, 0.4);
            vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 0.0));

            vec4 texel = texture2D(textureID, vUV);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(vNormal, sunlightDirection), 0.0);

            gl_FragColor = vec4(vColor + lightIntensity, texel.a);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}

export const getTextureFragmentShader = (gl) => {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying vec3 vNormal;
        varying vec3 vColor;
        varying vec2 vUV;

        uniform sampler2D textureID;

        void main() {
            vec3 ambientLightIntensity = vec3(0.1, 0.1, 0.1);
            vec3 sunlightIntensity = vec3(0.7, 0.6, 0.4);
            vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 0.0));

            vec4 texel = texture2D(textureID, vUV);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(vNormal, sunlightDirection), 0.0);

            gl_FragColor = vec4(texel.rgb + lightIntensity, texel.a);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}