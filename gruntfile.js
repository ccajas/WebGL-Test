
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
				files: { 'framework.js': [
					'src/gl.js',
					'src/ecs/*.js',
					'src/app.js'
				]}
			}
		},

		watchfiles: {
			first: {
				files: ['src/*.js', 'src/ecs/*.js'],
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