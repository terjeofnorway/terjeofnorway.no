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
    gulpAutoPrefixer = require('gulp-autoprefixer'),
    gulpScssLint = require('gulp-scss-lint'),
    gulpMinifyCss = require('gulp-minify-css'),
    browserSync = require('browser-sync').create();


// Define directories for source, dist etc
var sourceBase = '',
    sourceImages = sourceBase + 'images/',
    sourceFonts = sourceBase + 'fonts/',
    sourceScripts = sourceBase + 'scripts/',
    sourceStyles = sourceBase + 'styles/';

var distBase = '../public/dist/',
    distImages = distBase + 'images/',
    distFonts = distBase + 'fonts/',
    distScripts = distBase + 'scripts/',
    distStyles = distBase + 'styles/'

var bowerBase = 'bower_components/';
var devHost = 'terjeofnorway.dev';


// JS files we'll be using. Make sure to find all other
// js files before adding app.js at the end of the array.
var scriptSelection = [
    sourceBase + 'js/**/*!(app)*.js',
    sourceBase + 'js/app.js'
];



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
    return gulpDel([distBase], {force: true})
});


/** Lint the SCSS files and throw error for any
 * issues arising.
 */
gulp.task('scss-lint', function () {

    return gulp.src(sourceStyles + '/**/*.scss')
        .pipe(gulpScssLint({
            'config': '.scsslint'
        }));
});


/** Compile, merge and minify scss and css style sheets
 */
gulp.task('styles', function () {
    gulp.src(sourceStyles + '/**/*.scss')
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
        .pipe(gulp.dest(distStyles));
});


/** Lint the source files to reveal any rule breaking. This does not
 * do any actual concatination, which is the 'scripts' tasks job.
 */
gulp.task("es-lint", function () {
    return gulp.src(scriptSelection)
        .pipe(gulpESLint())
        .pipe(gulpESLint.format())
        .pipe(gulpESLint.failAfterError());
});


/** Concatinate the JS files into one single file, uglifying
 * the file in the process.
 */
gulp.task("scripts", function () {
    gulp.src(scriptSelection)
        .pipe(sourcemaps.init())
        .pipe(gulpBabel({
            presets: ['es2015']
        }))
        .pipe(gulpConcat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(distScripts))
});


/** Minify the images
 */
gulp.task('images', function () {
    return gulp.src(sourceImages + '**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(distImages))
});


/** Add all custom fonts to the fonts dist folder
 * ------------------------------------------------------------------
 */
gulp.task('fonts', function () {
    gulp.src(sourceFonts + '**/*')
        .pipe(gulp.dest(distFonts));
});


/** Creates contact with browser-sync
 *
 */
gulp.task('browser-sync', function () {
    browserSync.init({
        proxy: devHost
    });
});


// ----------------------------------------------------
// -------------------- MAJOR GULP TASKS --------------
// ----------------------------------------------------


/** The default gulp task. This is the same as the build task
 *
 */
gulp.task('default', ['clean'], function () {
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
        .start('scss-lint')
        .start('styles')
        .start('es-lint')
        .start('scripts')
        .start('images')
        .start('fonts');
});


/** The watch task will clean out the dist to get a fresh start, set watchers on appropriate
 * assets and finally launch browser sync. After that, only changes will trigger
 * tasks, depending on which files were changes.
 */
gulp.task('watch', ['build'], function () {
    // As this task has a dependency to the 'clean' task, the
    // dist folder will be removed at this stage. Call a full re-build
    // before adding watchers and starting browser sync.

    gulp.watch(sourceStyles, ['sass-lint', 'styles']);

    // Watch .js files to lint and build
    gulp.watch(sourceScripts, ['es-lint', 'scripts']);

    // Watch image files
    gulp.watch(sourceImages, ['images']);

    // Watch font files to lint and build
    gulp.watch(sourceFonts, ['fonts']);
});