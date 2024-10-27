function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
            `An error occurred while compiling the ${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: `,
            gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createShaderProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    if(!vertexShader || !fragmentShader) {
        console.error('Shader creation failed.');
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);  // Delete the program
        return null;
    }
    return program;
}

function initBuffer(gl, positions) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}