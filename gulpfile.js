// Gulp and plugins
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var deporder = require('gulp-deporder');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();

// source and build folders
const dir = {
	src: 'src/',
	build: './dist/'
};


/* ============
   CSS SETTINGS
   ============ */
const css = {
	src: dir.src + 'scss/*.scss',
	watch: dir.src + 'scss/**/*',
	build: dir.build + 'css',
	sassOpts: {
		outputStyle: 'nested',
		precision: 3,
		errLogToConsole: true
	},
	processors: [
		require('autoprefixer')({
			browsers: ['last 2 versions', '> 2%']
		}),
		require('css-mqpacker'),
		require('cssnano')
	]
};

// CSS processing
gulp.task('css', [], () => {
	return gulp.src(css.src)
		.pipe(sourcemaps.init())
		.pipe(sass(css.sassOpts))
		.pipe(postcss(css.processors))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(css.build));
});


/* ===================
   JAVASCRIPT SETTINGS
   =================== */
const js = {
	src: dir.src + 'js/*',
	build: dir.build + 'js',
};

// JavaScript processing
gulp.task('js', () => {
	return gulp.src(js.src)
		.pipe(deporder())
		.pipe(uglify())
		.pipe(gulp.dest(js.build));

});


/* ============
   BROWSER SYNC
   ============ */
gulp.task('browsersync', () => {
	browserSync.init({
		server: "./",
		files: [
			dir.build + '**/*',
			'./**/*.php',
			'./**/*.html',
			dir.src + 'vendor/custom-map.js'
		],
		notify: false,
		ghostMode: false,
		ui: {
			port: 8181
		}
	});
});

// watch for file changes
gulp.task('watch', ['default', 'browsersync'], () => {
	// CSS changes
	gulp.watch(css.watch, ['css']);

	// JavaScript main changes
	gulp.watch(js.src, ['js']);
});


gulp.task('default', ['css', 'js']);
