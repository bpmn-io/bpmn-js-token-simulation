'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var path = require('path');

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'example',
      dist: 'dist',
      assets: 'assets'
    },

    browserify: {
      options: {
        browserifyOptions: {
          // strip unnecessary built-ins
          builtins: [ 'events' ],
          insertGlobalVars: {
            process: function () {
                return 'undefined';
            },
            Buffer: function () {
                return 'undefined';
            }
          }
        },
        transform: [ 'brfs' ]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/viewer.js': [ '<%= config.sources %>/viewer.js' ],
          '<%= config.dist %>/modeler.js': [ '<%= config.sources %>/modeler.js' ]
        }
      },
      app: {
        files: {
          '<%= config.dist %>/viewer.js': [ '<%= config.sources %>/viewer.js' ],
          '<%= config.dist %>/modeler.js': [ '<%= config.sources %>/modeler.js' ]
        }
      }
    },
    copy: {
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sources %>/',
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>'
          },
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'assets'),
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>/vendor'
          },
          {
            src: resolvePath('diagram-js', 'assets/diagram-js.css'),
            dest: '<%= config.dist %>/css/diagram-js.css'
          },
          {
            expand: true,
            cwd: '<%= config.assets %>/',
            src: ['**/*.*'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      samples: {
        files: [ 
          '<%= config.sources %>/**/*.*',
          '<%= config.assets %>/**/*.*'
        ],
        tasks: [ 'copy:app' ]
      },
    },
    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: 'localhost',
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    }
  });

  // tasks

  grunt.registerTask('build', [ 'browserify:app', 'copy:app' ]);

  grunt.registerTask('auto-build', [
    'copy',
    'browserify:watch',
    'connect',
    'watch'
  ]);

  grunt.registerTask('default', [ 'build' ]);
};
