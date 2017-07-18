var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    watchify = require('gulp-watchify'),
    buffer = require('vinyl-buffer');

gulp.task('default', ['watch']);

var isDist = false;

gulp.task('enable-dist-mode', function() { isDist = true; });

gulp.task('sass', function () {
    var result = gulp.src('src/scss/*.scss')
        .pipe(sass());
    if (isDist) {
      result = result.pipe(cssmin());
    }
    return result.pipe(gulp.dest('./web/css'));
});

gulp.task('copy-images', function() {
    var result = gulp.src('src/images/**.*');
    return result.pipe(gulp.dest('./web/images'));
});

gulp.task('copy-html-index', function() {
    var index = gulp.src('src/index.html');
    return index.pipe(gulp.dest('./web'));
});

gulp.task('copy-html-views', function() {
    var index = gulp.src('src/angular/Views/**');
    return index.pipe(gulp.dest('./web/views'));
});

gulp.task('copy-libs', function() {
    var result = gulp.src([
        'node_modules/angular-translate-loader-static-files/**',
        'node_modules/drmonty-leaflet-awesome-markers/**',
        'node_modules/Humanitarian-Font/**',
        'node_modules/leaflet.markercluster/**',
        'node_modules/mapbox.js/**',
        'node_modules/ngPrint/**',
    ], { base: './node_modules'});

    return result.pipe(gulp.dest('./web/libs'));
});

gulp.task('copy-polygons', function() {
    var result = gulp.src('src/polygons.json');
    return result.pipe(gulp.dest('./web'));
})

gulp.task('browserify', watchify(function(watchify) {
    var result = gulp.src('src/angular/app.js')
        .pipe(watchify({watch:!isDist}));
    if (isDist) {
      result = result.pipe(buffer()).pipe(uglify());
    }
    return result.pipe(gulp.dest('./web/js'));
}));

gulp.task('copy', ['copy-images', 'copy-html-index', 'copy-html-views', 'copy-libs', 'copy-polygons']);

gulp.task('watch', ['browserify', 'sass', 'copy'], function() {
  gulp.watch('src/scss/*.scss', ['sass']);
  gulp.watch('src/angular/Views/**/**.html', ['copy-html-views']);
  gulp.watch('src/index.html', ['copy-html-index']);
});

gulp.task('dist', ['enable-dist-mode', 'browserify', 'sass', 'copy']);