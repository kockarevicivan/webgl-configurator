const canvas = document.getElementById("webgl-canvas");

canvas.width = window.innerWidth;
canvas.height = canvas.width;

const gl = canvas.getContext("webgl");

if (!gl) throw new Error("WebGL not supported!");

const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

const colorCubeModelMatrix = mat4.create();
const textureCubeModelMatrix = mat4.create();

const vertexData = [

    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];

let colorData = repeat(12, [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]);

const uvData = repeat(6, [
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left

    0, 1, // top left
    1, 0, // bottom right
    0, 0  // bottom left
]);



loadTexture(`/src/images/brick.png`, gl, function (brick) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, brick);
});

mat4.perspective(projectionMatrix,
    75 * Math.PI / 180, // Vertical FOV
    canvas.width / canvas.height, // Aspect ratio
    0.0001, // Near cull distance
    10000 // Far cull distance
);


function colorCube(vertexData, colorData, uvData, modelMatrix) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

    let uniformLocations;
    (function shaderProgram() {
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

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying vec3 vColor;

        varying vec2 vUV;

        uniform sampler2D textureID;

        void main() {
            gl_FragColor = vec4(vColor, 1);
        }
    `);
        gl.compileShader(fragmentShader);


        const program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);


        const positionlocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionlocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionlocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(program, "color");
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        const uvLocation = gl.getAttribLocation(program, `uv`);
        gl.enableVertexAttribArray(uvLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);


        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST);

        uniformLocations = {
            matrix: gl.getUniformLocation(program, "matrix"),
            textureID: gl.getUniformLocation(program, 'textureID'),
        };

        gl.uniform1i(uniformLocations.textureID, 0);
    })();


    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / -90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);
    mat4.translate(modelMatrix, modelMatrix, [0, 0, -0.04]);


    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

function textureCube(vertexData, colorData, uvData, modelMatrix) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

    let uniformLocations;
    (function shaderProgram() {
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


        const program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);


        const positionlocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionlocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionlocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(program, "color");
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        const uvLocation = gl.getAttribLocation(program, `uv`);
        gl.enableVertexAttribArray(uvLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);


        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST);

        uniformLocations = {
            matrix: gl.getUniformLocation(program, "matrix"),
            textureID: gl.getUniformLocation(program, 'textureID'),
        };

        gl.uniform1i(uniformLocations.textureID, 0);
    })();


    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);


    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

function animate() {
    requestAnimationFrame(animate);

    // Move camera (invert missing)
    mat4.translate(viewMatrix, viewMatrix, [0, 0, -0.04]);

    colorCube(vertexData, colorData, uvData, colorCubeModelMatrix);
    textureCube(vertexData, colorData, uvData, textureCubeModelMatrix);
}

animate();