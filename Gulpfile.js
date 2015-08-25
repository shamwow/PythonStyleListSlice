require('source-map-support').install();
require('babel/polyfill');

require('./tasks/source');

var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('run:tests', ['compile:source'], function () {
    gulp.src('./dist/tests/**/*')
        .pipe(mocha());
});

gulp.task('run:source', ['compile:source'], function () {
    require('./index.js');
});
