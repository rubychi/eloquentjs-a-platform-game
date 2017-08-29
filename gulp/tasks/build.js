var gulp = require('gulp'),
    del = require('del'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify');

gulp.task('delDistFolder', function() {
  return del('./docs');
});

gulp.task('useminTrigger', ['delDistFolder'], function() {
  gulp.start('usemin');
});

gulp.task('usemin', ['styles', 'scripts'], function() {
  return gulp.src('./index.html')
    .pipe(usemin({
      css: [rev(), cssnano()],
      js: [rev(), uglify()],
      jsVendor: [rev()],
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('copyGeneralFiles', ['usemin'], function() {
  var pathsToCopy = [
    './assets/**/*',
    '!./assets/scripts/*',
    '!./assets/styles/*',
  ];
  return gulp.src(pathsToCopy)
    .pipe(gulp.dest('./docs/assets'));
});

gulp.task('clearTemp', ['copyGeneralFiles'], function() {
  del('./temp');
});

gulp.task('build', ['delDistFolder', 'useminTrigger', 'copyGeneralFiles', 'clearTemp']);
