const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const browserSync = require('browser-sync');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');

// потребуется для оповещения о изменении live-reload сервера
const reload = browserSync.reload;

gulp.task('clean:dev', (done) => {
  if (fs.existsSync('./build/')) {
    return gulp
    .src('./build/', { read: false })
    .pipe(clean({ force: true }));
  }

  done();
});

const fileIncludeSetting = {
  prefix: '@@',
  basepath: '@file'
};

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false
    })
  }
}

gulp.task('html:dev', () => {
  return gulp
    .src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
    .pipe(changed('./build/', { hasChanged: changed.compareContents}))
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(fileInclude(fileIncludeSetting))
    .pipe(gulp.dest('./build/'))
    .pipe(reload({stream: true}));
});

gulp.task('sass:dev', () => {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(changed('./build/css/'))
    .pipe(plumber(plumberNotify('SCSS')))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./build/css/'))
    .pipe(reload({stream: true}))
});

gulp.task('images:dev', () => {
  return gulp
  .src('./src/img/**/*', { encoding: false })
  .pipe(changed('./build/img/'))
  // .pipe(imagemin({ verbose: true }))
  .pipe(gulp.dest('./build/img/'))
  .pipe(reload({stream: true}));
});

gulp.task('fonts:dev', () => {
  return gulp
  .src('./src/fonts/**/*')
  .pipe(changed('./build/fonts/'))
  .pipe(gulp.dest('./build/fonts/'))
  .pipe(reload({stream: true}));
});

gulp.task('files:dev', () => {
  return gulp
  .src('./src/files/**/*')
  .pipe(changed('./build/files/'))
  .pipe(gulp.dest('./build/files/'))
  .pipe(reload({stream: true}));
});

gulp.task('js:dev', () => {
  return gulp
  .src('./src/js/*.js')
  .pipe(changed('./build/js/'))
  .pipe(plumber(plumberNotify('JS')))
  // .pipe(babel())
  .pipe(webpack(require('../webpack.config.js')))
  .pipe(gulp.dest('./build/js'))
  .pipe(reload({stream: true}));
});

gulp.task('server:dev', () => {
  browserSync({
    server: {
        baseDir: './build'
    },
    open: false,
    notify: false
  })
});

gulp.task('watch:dev', () => {
  gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'))
  gulp.watch('./src/**/*.html', gulp.parallel('html:dev'))
  gulp.watch('./src/img/**/*', gulp.parallel('images:dev'))
  // gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'))
  gulp.watch('./src/js/*.js', gulp.parallel('js:dev'))
  gulp.watch('./src/files/**/*', gulp.parallel('files:dev'))

});


