var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cssmin = require('gulp-cssmin'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    watchify = require('gulp-watchify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

gulp.task('default', ['watch']);

var isDist = false;
gulp.task('enable-dist-mode', function() { isDist = true; });

gulp.task('watch', ['browserify', 'sass'], function() {
  gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('dist', ['enable-dist-mode', 'browserify', 'sass']);

gulp.task('sass', function () {
    var result = gulp.src('scss/*.scss')
        .pipe(sass());
    if (isDist) {
      result = result.pipe(cssmin());
    }
    return result.pipe(gulp.dest('./css'));
});

gulp.task('browserify', watchify(function(watchify) {
    var result = gulp.src('src/angular/app.js')
        .pipe(watchify({watch:!isDist}));
    if (isDist) {
      result = result.pipe(buffer()).pipe(uglify());
    }
    return result.pipe(gulp.dest('./js'));
}));
