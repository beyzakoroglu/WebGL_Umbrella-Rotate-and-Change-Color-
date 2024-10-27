let rotationAngle = 0.0;  // starting angle
let isRotating = false;  // to control animation mode
let lastMouseX = null;
const sensitivity = 0.02;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(1.0, 1.0, 1.0, 1.0);
//gl.clear(gl.COLOR_BUFFER_BIT);

// Create the shader program
const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

if (!program) {
    console.error('Shader program failed to initialize.');
}

console.log('Shader program initialized successfully.');

const uRotation = gl.getUniformLocation(program, 'u_rotation');

// for listening the mouse movements
canvas.addEventListener('mousemove', (event) => {
    if(isRotating) {
        if(lastMouseX !== null) {
            const deltaX = event.clientX - lastMouseX;
            rotationAngle += deltaX * sensitivity;
        }
        //const normalizedX = (event.clientX / canvas.width) * 2 - 1;
        //rotationAngle = normalizedX * Math.PI;
        lastMouseX = event.clientX;
    }
});

document.addEventListener('keydown', (event) => {
    if(event.key === 'r') {
        rotationAngle = 0.0;
        isRotating = false;
    } else if (event.key === 'm') {
        isRotating = true;
    }
});

gl.useProgram(program);

function drawUmbrella() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    //send the rotation angle to the shader
    gl.uniform1f(uRotation, rotationAngle);

    //draw the umbrella
    drawHandle();
    drawFabric();

    requestAnimationFrame(drawUmbrella);

}

drawUmbrella();

// Draw and triangulate the handle
function drawHandle() {

    const upperBodyCurve = calculateBezierCurve(
        { x: -0.04, y: 0.7 }, { x: 0.0, y: 0.75 }, { x: 0.04, y: 0.7 }
    );

    const handleCurve = calculateBezierCurve(
        {x: 0.04, y: -0.50001}, { x: -0.13, y: -0.8 }, { x: -0.3, y: -0.5 }
    );

    const handleInnerCurve = calculateBezierCurve(
        {x: -0.23, y: -0.5}, { x: -0.13, y: -0.65 }, { x: -0.042, y: -0.5 }
    );

    const handleVertices = [];
    handleVertices.push(...upperBodyCurve, ...handleCurve, ...handleInnerCurve);

    // Perform polygon triangulation
    const result = triangulate(handleVertices);
    if (!result || !result.success) {
        console.error(result?.errorMessage || 'Triangulation failed.');
        return;
    }
    const triangles = result.triangles;

    // Flatten the triangulated handleVertices for WebGL
    const positions = new Float32Array(triangles.length * 2);
    let posIndex = 0;
    for (const index of triangles) {
        positions[posIndex++] = handleVertices[index].x;
        positions[posIndex++] = handleVertices[index].y;
    }

    // Initialize the buffer with triangle data
    const positionBuffer = initBuffer(gl, positions);
    // Bind the buffer to the attribute
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // Set the color for the triangles
    const uColor = gl.getUniformLocation(program, 'u_color');
    if (uColor === -1) {
        console.error('Failed to get the uniform location of u_color.');
        return;
    }
    gl.uniform4f(uColor, 0.3, 0.2, 0.6, 1.0); // Dark purple color

    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

// Call the draw function
//drawHandle();


// Draw and triangulate the handle
function drawFabric() {
    const fabricVertices = [];

    const fabricUpperCurve = calculateBezierCurve(
        {x: -0.7, y: 0.3}, { x: 0.0, y: 1 }, { x: 0.7, y: 0.3 }
    );

    const fabricInnerCurve1 = calculateBezierCurve(
        {x: 0.7, y: 0.299}, { x: 0.468, y: 0.45 }, { x: 0.237, y: 0.3 }
    );

    const fabricInnerCurve2 = calculateBezierCurve(
        {x: 0.238, y: 0.301}, { x: -0.005, y: 0.45 }, { x: -0.227, y: 0.3 }
    );

    const fabricInnerCurve3 = calculateBezierCurve(
        {x: -0.228, y: 0.301}, { x: -0.458, y: 0.45 }, { x: -0.69, y: 0.3 }
    );

    fabricVertices.push(...fabricUpperCurve, ...fabricInnerCurve1, ...fabricInnerCurve2, ...fabricInnerCurve3);

    // Perform polygon triangulation
    const result = triangulate(fabricVertices);
    if (!result || !result.success) {
        console.error(result?.errorMessage || 'Triangulation failed.');
        return;
    }
    const triangles = result.triangles;

    // Flatten the triangulated fabricVertices for WebGL
    const positions = new Float32Array(triangles.length * 2);
    let posIndex = 0;
    for (const index of triangles) {
        positions[posIndex++] = fabricVertices[index].x;
        positions[posIndex++] = fabricVertices[index].y;
    }

    // Initialize the buffer with triangle data
    const positionBuffer2 = initBuffer(gl, positions);
    // Bind the buffer to the attribute
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // Set the color for the triangles
    const uColor = gl.getUniformLocation(program, 'u_color');
    if (uColor === -1) {
        console.error('Failed to get the uniform location of u_color.');
        return;
    }
    gl.uniform4f(uColor, 0.9, 0.65, 0.9, 1.0); // Lilac color

    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

//drawFabric();

// Bézier Curve calculation
function calculateBezierCurve(p0, p1, p2, numPoints = 30) {
    const vertices = [];
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        vertices.push({ x, y });
    }
    return vertices;
}