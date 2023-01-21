import { initProgram } from "../utils";

export default class Cube {
    constructor(gl, vertexData, colorData, uvData, indices, normals, modelMatrix, vertexShader, fragmentShader) {
        this.gl = gl;
        this.vertexData = vertexData;
        this.colorData = colorData;
        this.uvData = uvData;
        this.indices = indices;
        this.normals = normals;
        this.modelMatrix = modelMatrix;

        this.program = initProgram(gl, vertexData, colorData, uvData, indices, normals, vertexShader, fragmentShader);

        
    }

    animate(viewMatrix, mvMatrix, projectionMatrix, mvpMatrix, transformationCallback) {
        // this.gl.useProgram(this.program);

        this.uniformLocations = {
            matrix: this.gl.getUniformLocation(this.program, "matrix"),
            model: this.gl.getUniformLocation(this.program, "model"),
            view: this.gl.getUniformLocation(this.program, "view"),
            projection: this.gl.getUniformLocation(this.program, "projection"),
            textureID: this.gl.getUniformLocation(this.program, 'textureID'),
        };

        this.gl.uniform1i(this.uniformLocations.textureID, 0);

        transformationCallback(this.modelMatrix);

        // M+V
        mat4.multiply(mvMatrix, viewMatrix, this.modelMatrix);
        // M+V+P
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

        this.gl.uniformMatrix4fv(this.uniformLocations.matrix, false, mvpMatrix);
        this.gl.uniformMatrix4fv(this.uniformLocations.model, false, this.modelMatrix);
        this.gl.uniformMatrix4fv(this.uniformLocations.view, false, viewMatrix);
        this.gl.uniformMatrix4fv(this.uniformLocations.projection, false, projectionMatrix);

        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}