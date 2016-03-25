
module.exports = function(grunt) 
{
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jsdoc');
	
	grunt.initConfig(
	{
		cwd: process.cwd(),
		pkg: grunt.file.readJSON('package.json'),

		jsdoc : 
		{
			dist : {
				src: ['src/*'],
				options: {
					destination: 'doc',
					recurse: true
				}
			}
		},

		uglify: 
		{
			options: {
				banner: '/*! <%= pkg.name %> - ver. <%= pkg.version %> */\r\n'
				//compress: { drop_console: true }
			},

			js: {
				files: { 
					'framework.js': [
						'src/gl.js',
						'src/ecs/*.js',
						'src/screen/*.js',
						'src/content.js',
						'src/app.js'
					],
					'editor.js': [
						'src/editor/lib/*.js',
						'src/editor/listitems.js',
						'src/editor/main.js'
					]
				}
			}
		},

		watchfiles: {
			first: {
				files: [
					'src/*.js', 
					'src/ecs/*.js',
					'src/app.js',
					'src/content.js',
					'src/screen/*.js',
					'src/editor/*.js'
				],
				tasks: ['uglify']
			}/*,
			second: {
				files: ['src/*.js', 'src/ecs/*.js'],
				tasks: ['jsdoc']
			}*/
		}
	});

	grunt.renameTask('watch', 'watchfiles');
	grunt.registerTask('watch', ['watchfiles']); 
};