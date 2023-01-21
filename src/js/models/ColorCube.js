
export default class ColorCube {
    constructor(vertexData, colorData, uvData, vertexShader, fragmentShader, gl) {
        this.modelMatrix = mat4.create();
        this.vertexData = vertexData;
        this.colorData = colorData;
        this.uvData = uvData;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

        
        // Shader program
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

        this.uniformLocations = {
            matrix: gl.getUniformLocation(program, "matrix"),
            textureID: gl.getUniformLocation(program, 'textureID'),
        };

        gl.uniform1i(this.uniformLocations.textureID, 0);
    }

    animate(viewMatrix, mvMatrix, projectionMatrix, mvpMatrix, gl) {
        // Move box
        mat4.rotateX(this.modelMatrix, this.modelMatrix, Math.PI / 180);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / -90);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, Math.PI / 270);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, -0.04]);


        // M+V
        mat4.multiply(mvMatrix, viewMatrix, this.modelMatrix);
        // M+V+P
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

        gl.uniformMatrix4fv(this.uniformLocations.matrix, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexData.length / 3);
    }
}