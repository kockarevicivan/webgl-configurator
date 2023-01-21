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

        varying vec3 vertPos;

        void main() {
            vNormal = (matrix * vec4(normal, 0.0)).xyz;
            
            // For Phong
            vPosition = (model * vec4(position, 1.0)).xyz;
            vec4 vertPos4 = model * view * vec4(position, 1.0);
            vertPos = vec3(vertPos4) / vertPos4.w;
            
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
        uniform vec3 ambientLightIntensity;
        uniform vec3 sunlightIntensity;
        uniform vec3 sunlightDirection;

        void main() {
            vec3 surfaceNormal = normalize(vNormal);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(surfaceNormal, normalize(sunlightDirection)), 0.0);

            gl_FragColor = vec4(vColor + lightIntensity, 1);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}

export const getVariableColorFragmentShader = (gl) => {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vColor;
        varying vec2 vUV;

        varying vec3 vertPos;

        uniform sampler2D textureID;
        uniform vec3 ambientLightIntensity;
        uniform vec3 sunlightIntensity;
        uniform vec3 sunlightDirection;
        uniform vec3 pointLightLocation;
        uniform vec3 cameraPosition;
        uniform float specularAmount;
        uniform float specularShininess;
        uniform vec3 specularColor;
        uniform vec3 customColor;

        void main() {
            vec3 N = normalize(vNormal);
            vec3 L = normalize(pointLightLocation - vPosition);

            // Lambert's cosine law
            float lambertian = max(dot(N, L), 0.0);
            float specular = 0.0;

            if(lambertian > 0.0) {
                vec3 R = reflect(-L, N);      // Reflected light vector
                vec3 V = normalize(-vertPos); // Vector to viewer
                
                float specAngle = max(dot(R, V), 0.0);
                specular = pow(specAngle, specularShininess);
            }

            gl_FragColor = vec4(customColor + 1.0 * ambientLightIntensity +
                                1.0 * lambertian * sunlightIntensity +
                                1.0 * specular * specularColor, 1.0);
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
        uniform vec3 ambientLightIntensity;
        uniform vec3 sunlightIntensity;
        uniform vec3 sunlightDirection;

        void main() {
            vec3 surfaceNormal = normalize(vNormal);

            vec4 texel = texture2D(textureID, vUV);

            vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(surfaceNormal, normalize(sunlightDirection)), 0.0);

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
        uniform vec3 ambientLightIntensity;
        uniform vec3 sunlightIntensity;
        uniform vec3 sunlightDirection;
        uniform vec3 pointLightLocation;
        uniform vec3 cameraPosition;
        uniform float specularAmount;
        uniform float specularShininess;
        uniform vec3 specularColor;

        

        void main() {
            vec4 texel = texture2D(textureID, vUV);

            vec3 surfaceNormal = normalize(vNormal);

            // Point
            vec3 pointLightDirection = normalize(pointLightLocation - vec3(vPosition));
            float pointLightDot = max(dot(pointLightDirection, surfaceNormal), 0.0);

            vec3 diffuse = sunlightIntensity * texel.rgb * pointLightDot;
            vec3 ambient = ambientLightIntensity * texel.rgb;


            // Phong
            vec3 directionToCamera = normalize(cameraPosition - vPosition);
            vec3 halfwayVector = normalize(directionToCamera + normalize(pointLightLocation));
            
            float specularBrightness = (
                specularAmount * pow(
                    max(0.0, dot(vNormal, halfwayVector)), specularShininess
                )
            );

            float lightDotProduct = dot(normalize(vNormal), pointLightDirection);
            float surfaceBrightness = max(0.0, lightDotProduct);
            
            gl_FragColor = vec4((diffuse + ambient) + surfaceBrightness * specularColor, texel.a);
        }
    `);

    gl.compileShader(fragmentShader);

    return fragmentShader;
}
