export const getVertexShader = (gl) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertexShader, `
        precision mediump float;

        attribute vec3 position;

        attribute vec3 color;
        varying vec3 vColor;

        attribute vec2 uv;
        varying vec2 vUV;

        uniform mat4 matrix;

        void main() {
            vColor = color;
            vUV = uv;
            gl_Position = matrix * vec4(position, 1);
        }
    `);

    gl.compileShader(vertexShader);

    return vertexShader;
}

export const getFragmentShader = (gl) => {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying vec3 vColor;

        varying vec2 vUV;

        uniform sampler2D textureID;

        void main() {
            gl_FragColor = vec4(vColor, 1);
            gl_FragColor = texture2D(textureID, vUV);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}