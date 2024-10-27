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
    
    void main() {
        gl_FragColor = u_color;
    }
`;