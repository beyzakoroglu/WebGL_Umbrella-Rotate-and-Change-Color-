const vertexShaderSource = `
    attribute vec2 a_position;
    uniform float u_rotation;

    void main() {
        float cosTheta = cos(u_rotation);
        float sinTheta = sin(u_rotation);
        
        mat2 rotationMatrix = mat2 (
            cosTheta, - sinTheta,
            sinTheta, cosTheta
        );
    
        vec2 rotatedPosition = rotationMatrix * a_position;
        gl_Position = vec4(rotatedPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    uniform float u_time; 
    uniform bool u_isFabric; 

    void main() {
        vec4 color = u_color;

        if (u_isFabric && u_time != 0.0) {
            float r = abs(sin(u_time * 0.3));
            float g = abs(sin(u_time * 0.5 + 1.0));
            float b = abs(sin(u_time * 0.7 + 2.0));
            color = vec4(r, g, b, 1.0);
        }

        gl_FragColor = color;
    }
`;