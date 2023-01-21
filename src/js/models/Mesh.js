import { drawMesh } from "../utils";

export default class Mesh {
    constructor(gl, mesh, modelMatrix, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.mesh = mesh;
        this.modelMatrix = modelMatrix;

        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);

        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        this.uniformLocations = {
            matrix: gl.getUniformLocation(this.program, "matrix"),
            model: gl.getUniformLocation(this.program, "model"),
            view: gl.getUniformLocation(this.program, "view"),
            projection: gl.getUniformLocation(this.program, "projection"),
            textureID: gl.getUniformLocation(this.program, "textureID"),
            cameraPosition: gl.getUniformLocation(this.program, "cameraPosition"),
            light: gl.getUniformLocation(this.program, "light"),
            specularAmount: gl.getUniformLocation(this.program, "specularAmount"),
            specularShininess: gl.getUniformLocation(this.program, "specularShininess"),
        };

        gl.uniform1i(this.uniformLocations.textureID, 0);
    }

    animate(viewMatrix, mvMatrix, projectionMatrix, mvpMatrix, transformationCallback) {
        this.gl.useProgram(this.program);

        transformationCallback(this.modelMatrix);

        // M+V
        mat4.multiply(mvMatrix, viewMatrix, this.modelMatrix);
        // M+V+P
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

        this.gl.uniformMatrix4fv(this.uniformLocations.matrix, false, mvpMatrix);
        this.gl.uniformMatrix4fv(this.uniformLocations.model, false, this.modelMatrix);
        this.gl.uniformMatrix4fv(this.uniformLocations.view, false, viewMatrix);
        this.gl.uniformMatrix4fv(this.uniformLocations.projection, false, projectionMatrix);
        // Update the uniform values
        this.gl.uniform3fv(this.uniformLocations.cameraPosition, [0, 0, -10]);
        this.gl.uniform3fv(this.uniformLocations.light, [10, 0, 0]);
        this.gl.uniform1f(this.uniformLocations.specularAmount, 0.5);
        this.gl.uniform1f(this.uniformLocations.specularShininess, 50);

        drawMesh(this.gl, this.mesh, this.program);
    }
}