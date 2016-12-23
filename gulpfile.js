'use strict';

var path = require('path');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var semverRegex = require('semver-regex');

var resolve = path.resolve;

gulp.task('clean-dist', function() {
    return require('rimraf').sync(resolve(__dirname, 'dist'));
});

gulp.task('dist', ['clean-dist'], function() {

    var electron = require('gulp-electron');
    var packageJson = require('./package.json');
    var matches = packageJson.devDependencies['electron-prebuilt'].match(semverRegex());
    return gulp.src('')
        .pipe(electron({
            src: './src/',
            packageJson: packageJson,
            release: './dist',
            cache: './cache',
            version: 'v' + matches[0],
            packaging: true,
            asar: true,
            platforms: [
                'darwin-x64'
            ],
            platformResources: {
                darwin: {
                    CFBundleDisplayName: packageJson.name,
                    CFBundleIdentifier: packageJson.name,
                    CFBundleName: packageJson.name,
                    CFBundleVersion: packageJson.version
                },
                win: {
                    'version-string': packageJson.version,
                    'file-version': packageJson.version,
                    'product-version': packageJson.version
                }
            }
        }))
        .pipe(gulp.dest(''));
});

gulp.task('dev', function(cb) {

    livereload.listen({port: 35729});

    gulp.watch('src/*', function(event) {
        gulp.src('src/*').pipe(livereload());
    });

    var isWin = /^win/.test(process.platform);
    require('child_process')
        .exec((isWin ? 'sh' : 'node') + ' ./node_modules/.bin/electron ./src/', {
            cwd: __dirname,
            env: {
                NODE_ENV: 'dev'
            }
        }, cb);
});
