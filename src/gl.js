
// Shader identifier

var s = 'Shader';

/**
 * Initialize the WebGL context
 *
 * @param {Canvas} canvas element
 * @param {string} err user-defined message to show if no GL context is returned
 * @return {RenderingContext} the drawing context, or null if WebGL is not supported
 */

var initGL = function(canvas, err) 
{
	gl = null;

	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch(e) {}

	// If we don't have a GL context, give up now
	if (!gl) alert(err);

	return gl;
}

/**
 * Load and attach GL shaders
 *
 * @param {Content} content to find shaders to link from
 * @param {string} err user-defined message to show on link error
 * @return {WebGLProgram} the shader program
 */

var loadShaders = function(content, err) 
{
	var vs = content[s+'-vs'];
	var fs = content[s+'-fs'];

	// Create the shader program

	shp = gl.createProgram();
	gl.attachShader(shp, vs);
	gl.attachShader(shp, fs);
	gl.linkProgram(shp);

	// Handle link error

	if (!gl.getProgramParameter(shp, gl.LINK_STATUS))
		console.error(err);

	// Set the shader

	gl.useProgram(shp);
	return shp;
}

/**
 * Create a shader from source code
 *
 * @param {string} type shader type
 * @param {string} source source code
 * @param {string} err user-defined message to show on compile error
 * @return {WebGLShader} the resulting shader, or null
 */

var createShader = function(type, source, err)
{
	// create shader based on type
	var shader = 
		(type == s+'-vs') ? gl.createShader(gl.VERTEX_SHADER) :
		(type == s+'-fs') ? gl.createShader(gl.FRAGMENT_SHADER) :
		null;

	if (!shader) return null;

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	// Check for compile errors
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
	{  
		console.error(err + gl.getShaderInfoLog(shader));  
		return null;  
	}

	return shader;
}

/**
 * Create a 2D texture
 *
 * @param {Image} image the image to create the texture from
 * @return {WebGLTexture} 2D texture object
 */

var createTexture = function(image)
{
	// Create a texture.
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Fill the texture with a dummy image (1 blue pixel)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
		new Uint8Array([0, 0, 255, 255]));

	// Make a copy to the texture
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

	// Just assume it's a power of two and make mipmap
	gl.generateMipmap(gl.TEXTURE_2D);

	return texture;
} 

/**
 * Set up buffers for drawing
 *
 * @param {Canvas} mesh Mesh object create buffer from
 * @return {WebGLBuffer} buffer object
 */

var initBuffers = function(mesh) 
{
	var meshVertsVBO = gl.createBuffer();
	var total = mesh.faces.length;

	// Vertex array
	var verts = [];

	// Positions and normals are added as interleaved arrays

	for (var f = 0; f < total; f++)
	{
		for (var v = 0; v < 3; v++)
		{
			var vert = mesh.vert(f, v);

			var vs = vert[0];
			var vt = vert[1];
			var vn = vert[2];

			verts.push(vs[0], vs[1], vs[2]);
			verts.push(vn[0], vn[1], vn[2]);
			verts.push(vt[0], vt[1]);				
		}
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, meshVertsVBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	return meshVertsVBO;
}

/**
 * Resize the viewport to the canvas size
 *
 * @param {Canvas} canvas Canvas element
 */

var resize = function(canvas, uniformSetter) 
{
	var clWidth  = canvas.clientWidth;
	var clHeight = canvas.clientHeight;

	// Check if the canvas is not the same size.
	if (canvas.width  != clWidth || canvas.height != clHeight) 
	{
		// Make the canvas the same size
		canvas.width  = clWidth;
		canvas.height = clHeight;

		// Update viewport and res uniform
		gl.viewport(0, 0, canvas.width, canvas.height);
		uniformSetter([canvas.width, canvas.height]);
	}
}

/**
 * Create attribute setter functions from a shader program
 *
 * @param {WegGLProgram} shader the shader program
 * @return {object} container for the attribute setter functions
 */

var createAttribSetters = function(shader)
{
	var setters = {};
	var numAttribs = gl.getProgramParameter(shader, gl.ACTIVE_ATTRIBUTES);

	// Returns an attribute setter function which can be used at init or render time

	var attribSetter = function(index) 
	{
		return function(bInfo) 
		{
			gl.enableVertexAttribArray(index);
			gl.vertexAttribPointer(
				index, bInfo.size, 
				bInfo.type   || gl.FLOAT, false, 
				bInfo.stride || 0, 
				bInfo.offset || 0
			);
		};
	}

	// Go through all the attributes and create setter functions for each

	for (var i = 0; i < numAttribs; i++)
	{
		var attribInfo = gl.getActiveAttrib(shader, i);
		if (!attribInfo)
		{
			console.error('missing attribute data! Index: '+ i);
			break;
		}

		var idx = gl.getAttribLocation(shader, attribInfo.name);
		setters[attribInfo.name] = attribSetter(idx);
	}

	return setters;
}

// List of GL defined types

var glTypes = function(gl)
{
	return [
		gl.FLOAT,
		gl.FLOAT_VEC2,
		gl.FLOAT_VEC3,
		gl.FLOAT_VEC4,
		gl.INT,
		gl.INT_VEC2,
		gl.INT_VEC3,
		gl.INT_VEC4,
		gl.FLOAT_MAT2,
		gl.FLOAT_MAT3,
		gl.FLOAT_MAT4,
		gl.SAMPLER_2D,
		gl.SAMPLER_CUBE
	];
}

/**
 * Create uniform setter functions from a shader program
 *
 * @param {WegGLProgram} shader the shader program
 * @return {object} container for the uniform setter functions
 */

var createUniformSetters = function(shader)
{
	var setters = {};
	var numUniforms = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS);
	var texUnit = 0;

	// List of uniform function suffixes
	var sTypes = [
		'1f', '2fv', '3fv', '4fv', '1i', '2iv', '3iv', '4iv',
		'2fv', '3fv', '4fv', '1i'
	];

	// Returns a uniform setter function which can be used at init or render time

	var uniformSetter = function(program, uniformInfo) 
	{
		var idx  = gl.getUniformLocation(program, uniformInfo.name);
		var type = uniformInfo.type;
		
		// Check if this uniform is an array
		var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) == "[0]");
		var MATRIX_TYPE  = 8,
			SAMPLER_TYPE = 11,
			typeID 		 = glTypes(gl).indexOf(type); 

		// Very much an edge case, type unknown
		if (typeID == -1) return null;

		// Scalar, vector and matrix types return similar uniform setters
		if (typeID < SAMPLER_TYPE)
		{
			// Return the right uniform function based on type
			return function(v)
			{
				if (typeID < MATRIX_TYPE)
					return gl['uniform'+ sTypes[typeID]](idx, v);

				return gl['uniformMatrix'+ sTypes[typeID]](idx, false, v);
			}
		}
		// Sampler type setters are more complex, because texture units need to be bound
		else
		{
			// Texture binding function
			return function(bindPt, unit) 
			{
				return function(tex) {
					gl.uniform1i(idx, unit);
					gl.activeTexture(gl.TEXTURE0 + unit);
					gl.bindTexture(bindPt, tex);
				}

			}(type == gl.SAMPLER_2D ? gl.TEXTURE_2D : gl.TEXTURE_CUBE_MAP,
				texUnit++);
		}
	}

	// Go through all the uniforms and create setter functions for each

	for (var i = 0; i < numUniforms; ++i)
	{
		var uniformInfo = gl.getActiveUniform(shader, i);
		if (!uniformInfo) 
		{
			console.error('missing uniform data! Index: '+ i);
			break;
		}

		var name = uniformInfo.name;

		// remove the array suffix.
		if (name.substr(-3) == "[0]") 
			name = name.substr(0, name.length - 3);

		setters[name] = uniformSetter(shader, uniformInfo);
	}

	return setters;
}
