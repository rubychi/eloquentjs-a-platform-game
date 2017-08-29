var gulp = require('gulp'),
    babel = require('gulp-babel');

gulp.task('scripts', function() {
  return gulp.src(['./assets/scripts/*.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./temp/scripts'));
});
