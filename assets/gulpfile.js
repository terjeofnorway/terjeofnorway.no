/* Gulp requirements */
var gulp = require('gulp'),
    gulpDel = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    chalk = require('chalk'),
    gulpUtil = require('gulp-util'),
    gulpFilter = require('gulp-filter'),
    gulpRename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),

    gulpBabel = require('gulp-babel'),
    gulpConcat = require('gulp-concat'),
    gulpESLint = require('gulp-eslint'),
//uglify = require('gulp-uglify'),
//gulpJSHint = require('gulp-jshint'),
//map = require('map-stream'),
    gulpAutoPrefixer = require('gulp-autoprefixer'),
    gulpScssLint = require('gulp-scsslint'),
    gulpMinifyCss = require('gulp-minify-css'),
    mainBowerFiles = require('main-bower-files'),
    browserSync = require('browser-sync').create();


// Define directories for source, dist etc
var SRC =       '',
    DIST =      '../public/dist/',
    DIST_JS =   DIST + 'scripts',
    BOWER_DIR = 'bower_components',
    HOST =      'terjeofnorway.dev';


// JS files we'll be using. Make sure to find all other
// js files before adding app.js at the end of the array.
var jsArray = [
    SRC + 'js/**/*!(app)*.js',
    SRC + 'js/app.js'
];


// ----------------------------------------------------
// -------------------- REPORTERS ---------------------
// ----------------------------------------------------

/** Custom reporter for sass hinting
 *
 * @param file
 * @param stream
 * @returns {boolean}
 */
var scssHintReporter = function (file, stream) {
    gulpUtil.log(stream);

    return true;
};


/** Custom reporter for js hinting. Chalk marks the terminal window
 * with more legible info by coloring certain kinds of text.
 *
 */
var jsHintReporter = function (file, c) {
    if (!file.jshint.success) {
        gulpUtil.beep();
        notify().write({message: file.jshint.errorCount + ' error in js'});

        // Loop through the warnings/errors and print them out
        file.jshint.results.forEach(function (errorObject) {

            if (errorObject) {
                var msg =
                    chalk.cyan(errorObject.file) + ': ' +
                    chalk.red('Line ' + errorObject.error.line) + ' ' +
                    errorObject.error.reason;
                gulpUtil.log(msg);
            }
        });
    }
};


// ----------------------------------------------------
// -------------------- GULP TASK ---------------------
// ----------------------------------------------------


/** Micro task that clears the entire dist folder.
 * This task must be run as a asynchronous dependency, meaning it needs
 * to finish up before any subsequent tasks are started.
 *
 * @return Gulp pipe
 */
gulp.task('clean', function () {
    return gulpDel([DIST], {force: true})
});


/** Lint the SCSS files and throw error for any
 * issues arising.
 */
gulp.task('sass-lint', function () {

    return gulp.src(SRC + '/styles/app.scss')
        .pipe(gulpScssLint({
            customReport: scssHintReporter
        }));
});


/** Compile, merge and minify scss and css style sheets
 */
gulp.task('styles', function () {
    gulp.src(SRC + 'styles/app.scss')
        .pipe(
            sass({
                outputStyle: 'compressed',
                onSuccess: function () {
                    notify().write({message: "SCSS Compiled successfully!"});
                },
                onError: function (err) {
                    gulpUtil.beep();
                    notify().write(err);
                }
            })
        )
        .pipe(gulpAutoPrefixer('last 2 version', 'safari 5', 'ie 10', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulpRename({suffix: '.min'}))
        .pipe(gulpMinifyCss())
        .pipe(gulp.dest(DIST + '/styles'));
});


/** Lint the source files to reveal any rule breaking. This does not
 * do any actual concatination, which is the 'scripts' tasks job.
 */
gulp.task("eslint", function () {
    return gulp.src(jsArray)
        .pipe(gulpESLint())
        .pipe(gulpESLint.format())
        .pipe(gulpESLint.failAfterError());
});


/** Concatinate the JS files into one single file, uglifying
 * the file in the process.
 */
gulp.task("scripts", function () {
    gulp.src(jsArray)
        .pipe(sourcemaps.init())
        .pipe(gulpBabel({
            presets: ['es2015']
        }))
        .pipe(gulpConcat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_JS))
});


/** Minify the images
 */
gulp.task('images', function () {
    return gulp.src(SRC + 'images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(DIST + '/images'))
});


/** Add all custom fonts to the fonts dist folder
 * ------------------------------------------------------------------
 */
gulp.task('fonts', function () {
    gulp.src(SRC + 'fonts/**/*')
        .pipe(gulp.dest(DIST + 'fonts'));
});


/** Creates contact with browser-sync
 *
 */
gulp.task('browser-sync', function () {
    browserSync.init({
        proxy: HOST
    });
});


// ----------------------------------------------------
// -------------------- MAJOR GULP TASKS --------------
// ----------------------------------------------------


/** The default gulp task. This is the same as the build task
 *
 */
gulp.task('default', ['clean'], function () {
    gulpUtil.log(chalk.red('This task (default) will default to the \'build\' task. Feel free to use either, though for greater control and consitency, use the \'build\' task.'));
    gulp.start('build');
});


/** The build task runs through all the task making the
 * application ready to be deployed to prod. The
 * 'clean' task is added as an async dependency to ensure that
 * it finishes before running linting and other tasks.
 *
 */
gulp.task('build', ['clean'], function () {
    gulp
        .start('sass-lint')
        .start('sass-lint')
        .start('styles')
        .start('js-lint')
        .start('scripts')
        .start('image-min')
        .start('bower')
        .start('fonts');
});


/** The watch task will clean out the dist, set watchers on appropriate
 * assets and finally launch browser sync.
 */
gulp.task('watch', ['build'], function () {

    // As this task has a dependency to the 'clean' task, the
    // dist folder will be removed at this stage. Call a full re-build
    // before adding watchers and starting browser sync.

    //

    gulp.watch(SRC + '/styles/app.scss', ['sass-lint', 'styles']);

    // Watch .js files to lint and build
    gulp.watch(SRC + '/js/*.js', ['js-lint', 'scripts']);

    // Watch image files
    gulp.watch(SRC + '/images/**/*', ['image-min']);

});