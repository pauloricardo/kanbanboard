import gulp from "gulp"
import connect from 'gulp-connect'
import notify from 'gulp-notify'
import livereload from 'gulp-livereload'
import changed from 'gulp-changed'
import del from 'del'
import util from 'gulp-util'
import concat from 'gulp-concat'
import plumber from 'gulp-plumber'
import imagemin from 'gulp-imagemin'
import minifyCss from 'gulp-minify-css'
import minifyHtml from 'gulp-minify-html'
import rev from 'gulp-rev'
import revCollector from 'gulp-rev-collector'
import uglify from 'gulp-uglify'
import sass from 'gulp-sass'
import babel from 'gulp-babel'
import mergeStrem from 'merge-stream'


const PATH = {
    htmlSrc: 'src/',
    sassSrc: 'src/styles/',
    imgSrc: 'src/images/',
    jsSrc: 'src/javascripts/',
    bootstrapDir: 'bower_components/bootstrap/dist/',
    jqueryDir: 'bower_components/jquery/dist/',
    buildDir : 'build/',
    rev: 'rev/',
    dist: 'dist/'
};

const onError = (error) => {
    util.beep();
    util.log(util.colors.red(error));
};

const igniteServer = () => {
    return connect.server({
       root : 'build',
       livereload:true
    });
};

gulp.task('b-html', () => {
    return gulp.src(PATH.htmlSrc.concat('**/*.html'))
        .pipe(gulp.dest(PATH.buildDir.concat('/')))
        .pipe(livereload())
});
gulp.task('b-css-bower', () => {
    return gulp.src(
        [
            PATH.bootstrapDir.concat('css/*.css')
        ]
    )        .pipe(gulp.dest(PATH.buildDir.concat('/css')))
        .pipe(livereload())
});
gulp.task('b-fonts', () => {
    return gulp.src(
        [
            PATH.bootstrapDir.concat('fonts/**')
        ]
    )   .pipe(gulp.dest(PATH.buildDir.concat('/fonts')))
        .pipe(livereload())
});
gulp.task('b-css', () => {
    return gulp.src(
        [
            PATH.sassSrc.concat('**/*.scss')
        ])
        .pipe(sass({
            includePaths: require('node-neat').includePaths,
            style: 'nested',
            onError : () => {
                console.log('ops! Something went wrong!')
            }
        }))
        .pipe(plumber({errorHandler: onError}))
        .pipe(gulp.dest(PATH.buildDir.concat('/css')))
        .pipe(livereload())
});
gulp.task('b-js', () => {
    return gulp.src(
        [
            PATH.jsSrc.concat('**/*.js'),
            PATH.bootstrapDir.concat('js/*.js'),
            PATH.jqueryDir.concat('jquery.min.js')
        ])
        .pipe(babel({
            presets : ['es2015']
        }))
        .pipe(plumber({errorHandler: onError}))
        .pipe(changed(PATH.buildDir.concat('/js')))
        .pipe(gulp.dest(PATH.buildDir.concat('/js')))
        .pipe(livereload())
});
gulp.task('b-img', () => {
    return gulp.src(PATH.imgSrc.concat('**/*.+(png|jpg|jpeg|gif|svg)'))
        .pipe(plumber({errorHandler: onError}))
        .pipe(changed(PATH.buildDir.concat('/images')))
        .pipe(gulp.dest(PATH.buildDir.concat('/images')))
        .pipe(livereload())
});
gulp.task('watch', () => {
    gulp.watch('src/*.html', ['b-html']);
    gulp.watch(PATH.sassSrc.concat('**/*.scss'), ['b-css']);
    gulp.watch(PATH.jsSrc.concat('**/*.js'), ['b-js']);
    gulp.watch(PATH.imgSrc.concat('**/*.+(png|jpg|jpeg|gif|svg)'), ['b-img']);
});
gulp.task('build',['b-html', 'b-css', 'b-js', 'b-img', 'b-css-bower', 'b-fonts'], () => {
    return igniteServer();
});

const ENV = process.env.SERVER_ENV || 'development';

if(ENV === 'development'){
    gulp.task('default', ['build', 'watch']);
}