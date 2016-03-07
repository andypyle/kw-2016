var gulp 		= 	require('gulp'),
	assign 		= 	require('lodash.assign'),
	browserify 	= 	require('browserify'),
	watchify 	= 	require('watchify'),
	babelify 	= 	require('babelify'),
	fs 			= 	require('fs'),
	path 		= 	require('path'),
	argv 		= 	require('yargs').argv,
	source 		= 	require('vinyl-source-stream'),
	buffer 		= 	require('vinyl-buffer'),
	browserSync = 	require('browser-sync').create(),
	// GULP PLUGINS 
	sass 		= 	require('gulp-sass'),
	prefix 		= 	require('gulp-autoprefixer'),
	jade 		= 	require('gulp-jade'),
	template 	= 	require('gulp-template'),
	gutil 		= 	require('gulp-util'),
	uglify 		= 	require('gulp-uglify'),
	concat 		= 	require('gulp-concat'),
	minifyCSS 	= 	require('gulp-minify-css'),
	rename 		=	require('gulp-rename'),
	exit 		= 	require('gulp-exit');

var sources = {
	jade: './src/jade/**/!(_)*.jade',
	sass: path.resolve('src','sass'),
	js: path.resolve('src','js'),
	img: path.resolve('src','img')
};

var entryPoints = {
	sass: path.join(sources.sass, 'style.sass'),
	js: path.join(sources.js, 'index.js')
};

var output = {
	jade: {
		dev: path.resolve('dev'),
		build: path.resolve('build')
	},
	sass: {
		dev: path.resolve('dev','styles'),
		build: path.resolve('build','styles')
	},
	js: {
		dev: path.resolve('dev','js'),
		build: path.resolve('build','js')
	},
	img: {
		dev: path.resolve('dev','img'),
		build: path.resolve('build','img')
	}
};




// DEV SERVER
gulp.task('browsersync', function(){
    browserSync.init({
        server: './dev',
        notify: false,
        open: false
    });

    gulp.watch('./src/sass/**/*.sass', ['sass']);

    gulp.watch('./src/jade/**/*.jade', ['jade']);
    gulp.watch(['./dev/*.html','./src/jade/**/*.jade']).on('change', browserSync.reload);

    // gulp.watch('./dev/js/*.js').on('change', browserSync.reload);    
});




// JADE - DEV
gulp.task('jade', function(){
    gulp.src(sources.jade)
        .pipe(jade({
        	'locals': {},
      		'pretty': '\t'
      	}))
        .pipe(gulp.dest(output.jade.dev))
});


// JADE - BUILD
gulp.task('jadeBuild', function(){
	gulp.src(sources.jade)
        .pipe(jade({
        	'locals': {},
      		'pretty': '\t'
      	}))
        .pipe(gulp.dest(output.jade.build))
})




// SASS - DEV
gulp.task('sass', function(){
    gulp.src(entryPoints.sass)
    .pipe(sass({'outputStyle':'expanded'})
    .on('error', sass.logError))
    .pipe(prefix({
        browsers: [
            '> 1%',
            'last 2 versions',
            'firefox >= 4',
            'safari 7',
            'safari 8',
            'IE 8',
            'IE 9',
            'IE 10',
            'IE 11'
            ],
        cascade: true
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(output.sass.dev))
    .pipe(browserSync.stream());
});


// SASS - BUILD
gulp.task('sassBuild', ['sass'], function(){
	gulp.src(path.join(output.sass.dev, 'style.css'))
		.pipe(minifyCSS())
	    .pipe(concat('style.min.css'))
	    .pipe(gulp.dest(output.sass.build));
});




// JS
var jsOptions = {
    entries: [entryPoints.js],
    extensions: ['.js'],
    transform: [babelify.configure({
        presets: ["es2015"]
    })],
    debug: true,
    insertGlobals: false
};

var opts = assign({}, watchify.args, jsOptions);

var b = watchify(browserify(opts));

// 'gulp scripts' task to build scripts
gulp.task('scripts', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

// bundle() function for js bundling
function bundle(){
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify error.'))
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .on('error', gutil.log)   
        .pipe(gulp.dest(output.js.dev))
        .pipe(browserSync.reload({stream:true, once: true}));
};


// JS - BUILD
gulp.task('scriptsBuild', ['scripts'], function(){
	gulp.src(path.join(output.js.dev, 'scripts.js'))
		.pipe(uglify())
		.on('error', gutil.log)
		.pipe(rename('scripts.min.js'))
		.pipe(gulp.dest(output.js.build))
		.pipe(exit());
});




// BUILD
gulp.task('build', ['jadeBuild','sassBuild','scriptsBuild'], function(){
	console.log('---------- --------- BUILD COMPLETE!');
});


// DEFAULT
gulp.task('default', ['browsersync','sass','jade','scripts']);