import { downloadMeshes, initMeshBuffers } from "webgl-obj-loader";
import { initProgram, loadTexture } from "./utils";
import { getVertexShader, getColorFragmentShader, getTextureFragmentShader, getTextureFragmentShaderPhong } from "./shaders";
import { vertexData, normals, indices, colorData, uvData } from "./constants";

import main from "../scss/main.scss";

const canvas = document.getElementById("webgl-canvas");

canvas.width = window.innerWidth;
canvas.height = canvas.width;

const gl = canvas.getContext("webgl");

if (!gl) throw new Error("WebGL not supported!");

const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

const vertexShader = getVertexShader(gl);
const colorFragmentShader = getColorFragmentShader(gl);
const textureFragmentShader = getTextureFragmentShader(gl);
const textureFragmentShaderPhong = getTextureFragmentShaderPhong(gl);

// State
const state = {
    verticalFov: 75 * Math.PI / 180,
    aspectRatio: canvas.width / canvas.height,
    nearCullDistance: 0.0001,
    farCullDistance: 10000,

    cameraPosition: [0, -3.5, -7],
    pointLightLocation: [1, 5, -3],
    specularColor: [0, 0, 0],
    specularAmount: 0.5,
    specularShininess: 50,
    ambientLightIntensity: [0.6, 0.6, 0.6],
    sunlightIntensity: [1, 1, 1],
    sunlightDirection: [0.0, 0.0, 0.0],

    meshes: {},

    matrices: {
        statueModelMatrix: mat4.create(),

        lowerTileModelMatrix: mat4.create(),
        middleTileModelMatrix: mat4.create(),
        upperTileModelMatrix: mat4.create(),
    }
};

downloadMeshes({
    'model': '/assets/models/statue.obj',
}, function (meshes) {
    state.meshes = meshes;
    console.log(meshes.model);
});


loadTexture(`/assets/models/pattern.png`, gl, function (brick) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, brick);
});

mat4.perspective(projectionMatrix,
    state.verticalFov,
    state.aspectRatio,
    state.nearCullDistance,
    state.farCullDistance
);

gl.enable(gl.DEPTH_TEST);

function cube(vertexData, colorData, uvData, indices, normals, modelMatrix, vertexShader, fragmentShader) {
    const program = initProgram(gl, vertexData, colorData, uvData, indices, normals, vertexShader, fragmentShader);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
        textureID: gl.getUniformLocation(program, "textureID"),
        cameraPosition: gl.getUniformLocation(program, "cameraPosition"),
        specularAmount: gl.getUniformLocation(program, "specularAmount"),
        specularShininess: gl.getUniformLocation(program, "specularShininess"),
        ambientLightIntensity: gl.getUniformLocation(program, "ambientLightIntensity"),
        sunlightIntensity: gl.getUniformLocation(program, "sunlightIntensity"),
        sunlightDirection: gl.getUniformLocation(program, "sunlightDirection"),
        pointLightLocation: gl.getUniformLocation(program, "pointLightLocation"),
        specularColor: gl.getUniformLocation(program, "specularColor"),
    };

    gl.uniform1i(uniformLocations.textureID, 0);

    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);
    gl.uniform3fv(uniformLocations.cameraPosition, state.cameraPosition);
    gl.uniform1f(uniformLocations.specularAmount, state.specularAmount);
    gl.uniform1f(uniformLocations.specularShininess, state.specularShininess);
    gl.uniform3fv(uniformLocations.ambientLightIntensity, state.ambientLightIntensity);
    gl.uniform3fv(uniformLocations.sunlightIntensity, state.sunlightIntensity);
    gl.uniform3fv(uniformLocations.sunlightDirection, state.sunlightDirection);
    gl.uniform3fv(uniformLocations.pointLightLocation, state.pointLightLocation);
    gl.uniform3fv(uniformLocations.specularColor, state.specularColor);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function model(mesh, modelMatrix, vertexShader, fragmentShader) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, "matrix"),
        model: gl.getUniformLocation(program, "model"),
        view: gl.getUniformLocation(program, "view"),
        projection: gl.getUniformLocation(program, "projection"),
        textureID: gl.getUniformLocation(program, "textureID"),
        cameraPosition: gl.getUniformLocation(program, "cameraPosition"),
        specularAmount: gl.getUniformLocation(program, "specularAmount"),
        specularShininess: gl.getUniformLocation(program, "specularShininess"),
        ambientLightIntensity: gl.getUniformLocation(program, "ambientLightIntensity"),
        sunlightIntensity: gl.getUniformLocation(program, "sunlightIntensity"),
        sunlightDirection: gl.getUniformLocation(program, "sunlightDirection"),
        pointLightLocation: gl.getUniformLocation(program, "pointLightLocation"),
        specularColor: gl.getUniformLocation(program, "specularColor"),
    };

    gl.uniform1i(uniformLocations.textureID, 0);

    // M+V
    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // M+V+P
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.uniformMatrix4fv(uniformLocations.model, false, modelMatrix);
    gl.uniformMatrix4fv(uniformLocations.view, false, viewMatrix);
    gl.uniformMatrix4fv(uniformLocations.projection, false, projectionMatrix);
    gl.uniform3fv(uniformLocations.cameraPosition, state.cameraPosition);
    gl.uniform1f(uniformLocations.specularAmount, state.specularAmount);
    gl.uniform1f(uniformLocations.specularShininess, state.specularShininess);
    gl.uniform3fv(uniformLocations.ambientLightIntensity, state.ambientLightIntensity);
    gl.uniform3fv(uniformLocations.sunlightIntensity, state.sunlightIntensity);
    gl.uniform3fv(uniformLocations.sunlightDirection, state.sunlightDirection);
    gl.uniform3fv(uniformLocations.pointLightLocation, state.pointLightLocation);
    gl.uniform3fv(uniformLocations.specularColor, state.specularColor);

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

const keyMap = {};
document.onkeydown = e => { keyMap[e.keyCode] = true; console.log(e.keyCode) }
document.onkeyup = e => keyMap[e.keyCode] = false;

// Move camera (invert missing)
mat4.translate(viewMatrix, viewMatrix, state.cameraPosition);

// Move each tile in it's own place.
mat4.translate(state.matrices.lowerTileModelMatrix, state.matrices.lowerTileModelMatrix, [0, 0, 0]);
mat4.translate(state.matrices.middleTileModelMatrix, state.matrices.middleTileModelMatrix, [0, 0.5, 0]);
mat4.translate(state.matrices.upperTileModelMatrix, state.matrices.upperTileModelMatrix, [0, 1, 0]);

// Scale them
mat4.scale(state.matrices.lowerTileModelMatrix, state.matrices.lowerTileModelMatrix, [1, 0.25, 1]);
mat4.scale(state.matrices.middleTileModelMatrix, state.matrices.middleTileModelMatrix, [0.75, 0.25, 0.75]);
mat4.scale(state.matrices.upperTileModelMatrix, state.matrices.upperTileModelMatrix, [0.5, 0.25, 0.5]);

// Set the statue
mat4.translate(state.matrices.statueModelMatrix, state.matrices.statueModelMatrix, [0, 1.5, -0.2]);

function animate() {
    requestAnimationFrame(animate);

    if (keyMap['38']) {
        // Up
        mat4.translate(viewMatrix, viewMatrix, [0, 0, 0.3]);
    }
    else if (keyMap['40']) {
        // Down
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -0.3]);
    }
    else if (keyMap['37']) {
        // Left
        mat4.translate(viewMatrix, viewMatrix, [-0.3, 0, 0]);
    }
    else if (keyMap['39']) {
        // Right
        mat4.translate(viewMatrix, viewMatrix, [0.3, 0, 0]);
    }
    else if (keyMap['81']) {
        // Q
        mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 50);
    }
    else if (keyMap['69']) {
        // E
        mat4.rotateY(viewMatrix, viewMatrix, Math.PI / -50);
    }
    else if (keyMap['87']) {
        // W
        mat4.translate(viewMatrix, viewMatrix, [0, 0.3, 0]);
    }
    else if (keyMap['83']) {
        // S
        mat4.translate(viewMatrix, viewMatrix, [0, -0.3, 0]);
    }
    else if (keyMap['107']) {
        // +
        state.pointLightLocation[0] += 0.3;
    }
    else if (keyMap['109']) {
        // -
        state.pointLightLocation[0] -= 0.3;
    }

    cube(vertexData, colorData, uvData, indices, normals, state.matrices.lowerTileModelMatrix, vertexShader, colorFragmentShader);
    cube(vertexData, colorData, uvData, indices, normals, state.matrices.middleTileModelMatrix, vertexShader, textureFragmentShader);
    cube(vertexData, colorData, uvData, indices, normals, state.matrices.upperTileModelMatrix, vertexShader, textureFragmentShaderPhong);

    if (state.meshes.model) {
        model(state.meshes.model, state.matrices.statueModelMatrix, vertexShader, textureFragmentShaderPhong);
    }

    // cube(vertexData, colorData, uvData, indices, normals, colorCubeModelMatrix, vertexShader, colorFragmentShader);
    // mat4.rotateX(colorCubeModelMatrix, colorCubeModelMatrix, Math.PI / -180);
    // mat4.rotateY(colorCubeModelMatrix, colorCubeModelMatrix, Math.PI / -90);
    // mat4.rotateZ(colorCubeModelMatrix, colorCubeModelMatrix, Math.PI / 270);
    // mat4.translate(colorCubeModelMatrix, colorCubeModelMatrix, [0, 0, -0.03]);

    // cube(vertexData, colorData, uvData, indices, normals, textureCubeModelMatrix, vertexShader, textureFragmentShader);
    // mat4.rotateX(textureCubeModelMatrix, textureCubeModelMatrix, Math.PI / 180);
    // mat4.rotateY(textureCubeModelMatrix, textureCubeModelMatrix, Math.PI / 90);
    // mat4.rotateZ(textureCubeModelMatrix, textureCubeModelMatrix, Math.PI / 270);

    // cube(vertexData, colorData, uvData, indices, normals, textureCubePhongModelMatrix, vertexShader, textureFragmentShaderPhong);
    // mat4.rotateX(textureCubePhongModelMatrix, textureCubePhongModelMatrix, Math.PI / 180);
    // mat4.rotateY(textureCubePhongModelMatrix, textureCubePhongModelMatrix, Math.PI / 40);
    // mat4.rotateZ(textureCubePhongModelMatrix, textureCubePhongModelMatrix, Math.PI / 20);

}

animate();