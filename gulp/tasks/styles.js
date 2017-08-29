var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer');

gulp.task('styles', function() {
  return gulp.src('./assets/styles/*.css')
    .pipe(postcss([autoprefixer]))
    .on('error', function(errorInfo) {
      console.log(errorInfo.toString());
      this.emit('end');
    })
    .pipe(gulp.dest('./temp/styles/'));
});
