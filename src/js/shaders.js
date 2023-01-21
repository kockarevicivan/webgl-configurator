export const getVertexShader = (gl) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertexShader, `
        precision mediump float;
        
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec3 color;
        attribute vec2 uv;

        uniform mat4 matrix;
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vColor;
        varying vec2 vUV;

        void main() {
            vNormal = (matrix * vec4(normal, 0.0)).xyz;
            
            // For Phong
            vPosition = (model * vec4(position, 1.0)).xyz;
            
            vColor = color;
            vUV = uv;
            gl_Position = projection * view * model * vec4(position, 1);
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
            vec3 ambientLightIntensity = vec3(-0.8, -0.8, -0.8);
            vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9);
            vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 0.0));
            vec3 surfaceNormal = normalize(vNormal);

            vec4 texel = texture2D(textureID, vUV);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(surfaceNormal, sunlightDirection), 0.0);

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
            vec3 ambientLightIntensity = vec3(-0.8, -0.8, -0.8);
            vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9);
            vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 0.0));
            vec3 surfaceNormal = normalize(vNormal);

            vec4 texel = texture2D(textureID, vUV);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(surfaceNormal, sunlightDirection), 0.0);

            gl_FragColor = vec4(texel.rgb + lightIntensity, texel.a);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}

export const getTextureFragmentShaderPhong = (gl) => {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vColor;
        varying vec2 vUV;

        uniform sampler2D textureID;

        uniform vec3 cameraPosition;
        uniform vec3 light;
        uniform float specularAmount;
        uniform float specularShininess;

        void main() {
            vec3 ambientLightIntensity = vec3(-0.8, -0.8, -0.8);
            vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9);
            vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 0.0));
            vec3 surfaceNormal = normalize(vNormal);

            vec4 texel = texture2D(textureID, vUV);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(surfaceNormal, sunlightDirection), 0.0);

            // Phong
            vec3 directionToCamera = normalize(cameraPosition - vPosition);
            vec3 halfwayVector = normalize(directionToCamera + light);
            
            float specularBrightness = (
                specularAmount * pow(
                    max(0.0, dot(vNormal, halfwayVector)), specularShininess
                )
            );

            float lightDotProduct = dot(normalize(vNormal), light);
            float surfaceBrightness = max(0.2, lightDotProduct);

            vec4 specularColor = vec4(1.0, 1.0, 1.0, 1.0);


            gl_FragColor = vec4((texel.rgb + lightIntensity) * surfaceBrightness, texel.a);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}