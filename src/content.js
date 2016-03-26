
/**
 * Content pipeline manager
 * @class
 * @name ContentManager
 */

ContentManager = (function()
{
	'use strict';

	function ContentManager() { }

	/** Content request data and content loaded callback */

	var requestsCompleted = 0;
	var requestsToComplete = 0;
	var contentLoadedCallback = null;

	/** Storage for content */

	var contentCollection = { }

	/* General AJAX request function
	 *
	 * @function
	 * @memberOf ContentManager
	 * @param {string} file name of file to asynchronously load
	 * @return {Promise} a Promise object containing the XHR response
	 */

	var request = function(file)
	{
		return new Promise(function(resolve, reject)
		{
			var xhr = new XMLHttpRequest();

			xhr.open("GET", file, true);
			xhr.onload = function() {
				if (xhr.status == 200) {
					resolve(xhr.response);
				}
				else {
					reject(Error(xhr.statusText));
				}
			}
			xhr.onerror = reject;
			xhr.send(null);
		});
	}

	/**
	 * Error message when failing to load content
	 *
	 * @function
	 * @memberOf ContentManager
	 * @param {sring} response XMLHttpRequest string response
	 */	

	var loadError = function(response)
	{
		console.error("request failed!", response);	
	}

	/**
	 * Add total completed content load requests, and run callback
	 * when all requests are complete
	 *
	 * @function
	 * @memberOf ContentManager
	 */

	var requestComplete = function() 
	{
		requestsCompleted++;

		if (requestsCompleted == requestsToComplete) 
		{
			console.info("All content is ready")
			contentLoadedCallback(contentCollection);
		}
	};

	/**
	 * Load an OBJ model file via AJAX
	 *
	 * @function
	 * @memberOf ContentManager
	 * @param {String} file the model's file name
	 * @param {String} meshname handle for the mesh
	 * @return {Promise} Promise containing XHR response
	 */	

	var loadModelMesh = function(file, meshname)
	{
		requestsToComplete++;

		var success = function(response)
		{
			if (meshname == null)
			{
				console.error('A name for the mesh must be specified');
				return;
			}

			var mesh = new Mesh();
			var lines = response.split('\n');

			Mesh.parseOBJ(lines, mesh);
			
			contentCollection[meshname] = mesh;
			requestComplete();
		}

		return request(file).then(success, loadError);
	}

	/**
	 * Create a 2D texture from an image
	 *
	 * @function
	 * @memberOf ContentManager
	 * @param {String} file the image's file name
	 * @param {String} imgname handle for the texture
	 */	

	var loadTexture = function(file, imgname)
	{
		requestsToComplete++;

		if (imgname == null)
		{
			console.error('A name for the image must be specified');
			return;
		}

		// Asynchronously load an image
		var img = new Image();
		img.src = file;
		img.onload = function() 
		{
			contentCollection[imgname] = createTexture(img);
			requestComplete();
		}
	}

	/**
	 * Load a shader from an external script
	 *
	 * @function
	 * @memberOf ContentManager
	 * @param {String} file the shader's file name
	 * @param {String} type the type of shader
	 * @return {Promise} Promise containing XHR response
	 */	

	var loadShader = function(file, type)
	{
		requestsToComplete++;
		var e_notCompiled = "An error occurred compiling the shaders: ";

		var success = function(response)
		{
			contentCollection[type] = createShader(type, response, e_notCompiled);
			requestComplete();
		}

		return request(file).then(success, loadError);
	}

	/**
	 * General purpose loader for JavaScript files
	 *
	 * @function
	 * @memberOf ContentManager
	 * @param {String} file the script's file name
	 * @param {Object} callbacks functions called on file load/error
	 * @return {Promise} Promise containing XHR response
	 */	

	var loadScript = function(file, callbacks)
	{
		var scriptDOM = document.createElement('script');

		scriptDOM.type = "text\/javascript";
		scriptDOM.src  = file; 

        // Add it in the head tag
        document.head.appendChild(scriptDOM);

        // Call appropriate function
        scriptDOM.onload  = callbacks.load;
        scriptDOM.onerror = callbacks.error;

        return scriptDOM;
	}

	/** Entry point for loading content */

	ContentManager.prototype =
	{
		/**
		 * Public function to load a file based on type
		 *
	 	 * @function
	 	 * @memberOf ContentManager
		 * @param {string} cType asset type
		 * @param {string} file the file's name
		 * @param {string} name handle for the created asset
		 * @return {var} the created asset
		 */	

		load: function(cType)
		{
			var self = this;
			return function(file, name)
			{
				console.log("load", file);
				name = (typeof name !== 'undefined') ? name : null;

				var asset = 
					(cType == 'Shader-vs') ? loadShader    (file, cType) :
					(cType == 'Shader-fs') ? loadShader    (file, cType) :
					(cType == 'Model')     ? loadModelMesh (file, name)  :
					(cType == 'Texture')   ? loadTexture   (file, name)  :
					(cType == 'Script')    ? loadScript	   (file, name) :
					(cType == 'Content')   ? self.loadJSON (file, name)  :
					null;
				
				return asset;
			}
		},

		/**
		 * Load content of various types from a JSON file
		 *
		 * @function
		 * @memberOf ContentManager
		 * @param {String} file the JSON content file name
		 * @return {Promise} Promise containing XHR response
		 */	

		loadFromJSON: function(JSONfile)
		{			
			var self = this;
			var success = function(response)
			{
				var json = JSON.parse(response);
				var dir = json.dir || '';

				// Go through each asset by type
				for(var type in json.assets)
				{
					var assetsCopy = json.assets[type];
					var i = 0;

					// Load each file according to its type
					assetsCopy.files.forEach(function(file)
					{
						if (assetsCopy.handles)
							self.load(type)(dir + file, assetsCopy.handles[i++] || '');
						else
							self.load(type)(dir + file);
					});				
				}
			}

			return request(JSONfile).then(success, loadError);
		},

		/**
		 * Returns the collection of created assets/content
	 	 *
	 	 * @function
	 	 * @memberOf ContentManager
		 * @returns {Array} content list
		 */	

		collection: function()
		{
			return contentCollection;
		},

		/**
		 * Sets the callback to use when all content is loaded
	 	 *
	 	 * @function
	 	 * @memberOf ContentManager
		 * @param {function} callback function to call
		 */

		finishedLoading: function(callback) 
		{ 
			contentLoadedCallback = callback;
		}
	}

	return ContentManager;

})();