function getRandomColor() {
    return [Math.random(), Math.random(), Math.random()];
}

function loadTexture(url, gl, callback) {
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = e => {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.generateMipmap(gl.TEXTURE_2D);

        callback(texture);
    };

    image.src = url;

    return texture;
}

function repeat(n, pattern) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}