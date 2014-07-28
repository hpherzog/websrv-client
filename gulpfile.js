
var gulp = require('gulp');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap');

gulp.task('default', function() {

    var wrapTemplate = '(function(){<%= contents %>})();';

    gulp.src('./src/index.js')
        .pipe(browserify())
        .pipe(uglify())
        .pipe(wrap(wrapTemplate))
        .pipe(rename('websrv.min.js'))
        .pipe(gulp.dest('.'));
});