import { downloadMeshes, initMeshBuffers } from "webgl-obj-loader";
import { getRandomColor, loadTexture, repeat } from "./utils";
import { getVertexShader, getColorFragmentShader, getTextureFragmentShader } from "./shaders";

import main from "../scss/main.scss";
import ColorCube from "./models/ColorCube";

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
const modelCubeModelMatrix = mat4.create();
mat4.translate(modelCubeModelMatrix, modelCubeModelMatrix, [0, -2, 0]);

const vertexShader = getVertexShader(gl);
const colorFragmentShader = getColorFragmentShader(gl);
const textureFragmentShader = getTextureFragmentShader(gl);

const vertexData = [
    -1, -1, 1, //0
    1, -1, 1, //1
    -1, 1, 1, //2
    1, 1, 1, //3
    -1, -1, -1, //4
    1, -1, -1, //5
    -1, 1, -1, //6
    1, 1, -1  //7
];

const indices = [
    //Top
    2, 6, 7,
    2, 3, 7,

    //Bottom
    0, 4, 5,
    0, 1, 5,

    //Left
    0, 2, 6,
    0, 4, 6,

    //Right
    1, 3, 7,
    1, 5, 7,

    //Front
    0, 2, 3,
    0, 1, 3,

    //Back
    4, 6, 7,
    4, 5, 7
];

let colorData = [
    1.0, 1.0, 1.0, 1.0, // Front face: white
    1.0, 0.0, 0.0, 1.0, // Back face: red
    0.0, 1.0, 0.0, 1.0, // Top face: green
    0.0, 0.0, 1.0, 1.0, // Bottom face: blue
    1.0, 1.0, 0.0, 1.0, // Right face: yellow
    1.0, 0.0, 1.0, 1.0, // Left face: purple
];

const uvData = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
];


var app = {};
app.meshes = {};

downloadMeshes({
    'model': '/assets/models/statue.obj',
}, function (meshes) {
    app.meshes = meshes;
    console.log(meshes.model);
});


loadTexture(`/assets/models/pattern.png`, gl, function (brick) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, brick);
});

mat4.perspective(projectionMatrix,
    75 * Math.PI / 180, // Vertical FOV
    canvas.width / canvas.height, // Aspect ratio
    0.0001, // Near cull distance
    10000 // Far cull distance
);

gl.enable(gl.DEPTH_TEST);

function colorCube(vertexData, colorData, uvData, indices, modelMatrix) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, colorFragmentShader);

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

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        textureID: gl.getUniformLocation(program, 'textureID'),
    };

    gl.uniform1i(uniformLocations.textureID, 0);


    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / -180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);
    mat4.translate(modelMatrix, modelMatrix, [0, 0, -0.03]);


    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function textureCube(vertexData, colorData, uvData, indices, modelMatrix) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, textureFragmentShader);

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

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        textureID: gl.getUniformLocation(program, 'textureID'),
    };

    gl.uniform1i(uniformLocations.textureID, 0);


    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);


    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);


    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function modelCube(mesh, modelMatrix) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, textureFragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    let uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        textureID: gl.getUniformLocation(program, 'textureID'),
    };

    gl.uniform1i(uniformLocations.textureID, 0);

    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / -180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);
    mat4.translate(modelMatrix, modelMatrix, [0, 0, 0.03]);

    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

    function drawMesh(mesh, shaderProgram) {
        // make sure you have vertex, vertex normal, and texture coordinate
        // attributes located in your shaders and attach them to the shader program
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "normal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "uv");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        // create and initialize the vertex, vertex normal, and texture coordinate buffers
        // and save on to the mesh object
        initMeshBuffers(gl, mesh);

        // now to render the mesh
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // it's possible that the mesh doesn't contain
        // any texture coordinates (e.g. suzanne.obj in the development branch).
        // in this case, the texture vertexAttribArray will need to be disabled
        // before the call to drawElements
        if (!mesh.textures.length) {
            gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
        }
        else {
            // if the texture vertexAttribArray has been previously
            // disabled, then it needs to be re-enabled
            gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    drawMesh(mesh, program);
}



function animate() {
    requestAnimationFrame(animate);

    // Move camera (invert missing)
    mat4.translate(viewMatrix, viewMatrix, [0, 0, -0.02]);

    colorCube(vertexData, colorData, uvData, indices, colorCubeModelMatrix);
    textureCube(vertexData, colorData, uvData, indices, textureCubeModelMatrix);

    if (app.meshes.model) {
        modelCube(app.meshes.model, modelCubeModelMatrix);
    }
}

animate();