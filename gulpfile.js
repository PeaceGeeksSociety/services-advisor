var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    watchify = require('gulp-watchify'),
    buffer = require('vinyl-buffer');

gulp.task('default', ['watch']);

var isDist = true;

gulp.task('enable-dist-mode', function() { isDist = true; });

gulp.task('sass', function () {
    var result = gulp.src('src/scss/*.scss')
        .pipe(sass());
    if (isDist) {
      result = result.pipe(cssmin()).pipe(rev());
    }

    result.pipe(gulp.dest('./web/css'));

    if (isDist) {
        result
            .pipe(rev.manifest({ merge: true }))
            .pipe(gulp.dest('./'));
    }

    return result;
});

gulp.task('copy-images', function() {
    var result = gulp.src('src/images/**.*');
    return result.pipe(gulp.dest('./web/images'));
});

gulp.task('copy-html-index', ['browserify', 'sass'], function() {
    var index = gulp.src('src/index.html');
    var manifest = gulp.src('rev-manifest.json');

    if (isDist) {
        index.pipe(revReplace({ manifest: manifest }));
    }

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
});

gulp.task('browserify', watchify(function(watchify) {
    var result = gulp.src('src/angular/app.js')
        .pipe(watchify({watch:!isDist}));

    if (isDist) {
      result = result.pipe(buffer()).pipe(rev()).pipe(uglify());
    }

    result.pipe(gulp.dest('./web/js'));

    if (isDist) {
        result
            .pipe(rev.manifest({ merge: true }))
            .pipe(gulp.dest('./'));
    }

    return result;
}));

gulp.task('copy', ['copy-images', 'copy-html-views', 'copy-libs', 'copy-polygons',  'copy-html-index']);

gulp.task('watch', function() {
  runSequence(['browserify', 'sass'], 'copy'), 'watch-callback'
});

gulp.task('watch-callback', function(callback) {
  gulp.watch('src/scss/*.scss', ['sass']);
  gulp.watch('src/angular/Views/**/**.html', ['copy-html-views']);
  gulp.watch('src/index.html', ['copy-html-index']);
  callback();
});

//gulp.task('watch', ['browserify', 'sass', 'copy'], function() {
//gulp.task('dist', ['enable-dist-mode', 'browserify', 'sass', 'copy']);

gulp.task('dist', function (){
    runSequence('enable-dist-mode',
                ['browserify', 'sass'],
                'copy');
});


