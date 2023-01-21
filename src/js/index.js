import { downloadMeshes, initMeshBuffers } from "webgl-obj-loader";
import { getRandomColor, loadTexture, repeat } from "./utils";
import { getVertexShader, getColorFragmentShader, getTextureFragmentShader, getTextureFragmentShaderPhong } from "./shaders";

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
const modelCubeModelPhongMatrix = mat4.create();

mat4.translate(modelCubeModelMatrix, modelCubeModelMatrix, [0, -2, 0]);

const vertexShader = getVertexShader(gl);
const colorFragmentShader = getColorFragmentShader(gl);
const textureFragmentShader = getTextureFragmentShader(gl);
const textureFragmentShaderPhong = getTextureFragmentShaderPhong(gl);

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
const vertexData = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL
const normals = [
    // Front
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

    // Top
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

    // Right
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
];

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
];

const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
    [1.0, 0.0, 1.0, 1.0], // Left face: purple
];

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
var colorData = [];

for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colorData = colorData.concat(c, c, c, c);
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
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



function colorCube(vertexData, colorData, uvData, indices, normals, modelMatrix) {
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

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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

    const normalLocation = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);


    gl.useProgram(program);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
        textureID: gl.getUniformLocation(program, 'textureID'),
    };

    gl.uniform1i(uniformLocations.textureID, 0);

    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / -180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / -90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);
    mat4.translate(modelMatrix, modelMatrix, [0, 0, -0.03]);

    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function textureCube(vertexData, colorData, uvData, indices, normals, modelMatrix) {
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

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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

    const normalLocation = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);


    gl.useProgram(program);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
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
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);


    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function textureCubePhong(vertexData, colorData, uvData, indices, normals, modelMatrix) {
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

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, textureFragmentShaderPhong);

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

    const normalLocation = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);


    gl.useProgram(program);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
        textureID: gl.getUniformLocation(program, "textureID"),
        cameraPosition: gl.getUniformLocation(program, "cameraPosition"),
        light: gl.getUniformLocation(program, "light"),
        specularAmount: gl.getUniformLocation(program, "specularAmount"),
        specularShininess: gl.getUniformLocation(program, "specularShininess"),
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
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);
    // Update the uniform values
    gl.uniform3fv(uniformLocations.cameraPosition, [0, 0, -10]);
    gl.uniform3fv(uniformLocations.light, [0, -2, 2]);
    gl.uniform1f(uniformLocations.specularAmount, 1);
    gl.uniform1f(uniformLocations.specularShininess, 1);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function modelCube(mesh, modelMatrix) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, textureFragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
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
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);

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

function modelCubePhong(mesh, modelMatrix) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, textureFragmentShaderPhong);

    gl.linkProgram(program);
    gl.useProgram(program);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
        textureID: gl.getUniformLocation(program, "textureID"),
        cameraPosition: gl.getUniformLocation(program, "cameraPosition"),
        light: gl.getUniformLocation(program, "light"),
        specularAmount: gl.getUniformLocation(program, "specularAmount"),
        specularShininess: gl.getUniformLocation(program, "specularShininess"),
    };

    gl.uniform1i(uniformLocations.textureID, 0);

    // Move box
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / -180);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 90);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 270);

    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);
    // Update the uniform values
    gl.uniform3fv(uniformLocations.cameraPosition, [0, 0, -10]);
    gl.uniform3fv(uniformLocations.light, [0, 10, 10]);
    gl.uniform1f(uniformLocations.specularAmount, 10);
    gl.uniform1f(uniformLocations.specularShininess, 5);

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


// Move camera (invert missing)
mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);


function animate() {
    requestAnimationFrame(animate);

    

    // colorCube(vertexData, colorData, uvData, indices, normals, colorCubeModelMatrix);
    // textureCube(vertexData, colorData, uvData, indices, normals, textureCubeModelMatrix);
    // textureCubePhong(vertexData, colorData, uvData, indices, normals, textureCubeModelMatrix);

    if (app.meshes.model) {
        modelCube(app.meshes.model, modelCubeModelMatrix);
        modelCubePhong(app.meshes.model, modelCubeModelPhongMatrix);
    }
}

animate();