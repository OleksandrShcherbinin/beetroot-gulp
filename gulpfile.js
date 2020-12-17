let projectFolder = require("path").basename(__dirname);
let sourceFolder = '#src';

let path = {
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/css/',
        js: projectFolder + '/js/',
        img: projectFolder + '/img/',
        fonts: projectFolder + '/fonts/',
    },
    src: {
        html: [
            sourceFolder + '/*.html',
            '!' + sourceFolder + '/_*.html',
        ],
        css: sourceFolder + '/scss/style.scss',
        js: sourceFolder + '/js/main.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,ico,webp,gif}',
        fonts: sourceFolder + '/fonts/**/*.{ttf,woff,woff2}',
    },
    watch: {
        html: sourceFolder + '/**/*.html',
        css: sourceFolder + '/scss/**/*.scss',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,ico,webp,gif}',
    },
    clean: './' + projectFolder + '/',
}

let {src, dest} = require('gulp');
let gulp = require('gulp');
let browserSync = require('browser-sync').create();
let fileInclude = require('gulp-file-include');
let del = require('del');
let scss = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let group_media = require('gulp-group-css-media-queries');
let clean_css = require('gulp-clean-css');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;
let imagemin = require('gulp-imagemin');
let webp = require('gulp-webp');
let webpHtml = require('gulp-webp-in-html');
let webpCss = require('gulp-webpcss');
let svgSprite = require('gulp-svg-sprite');
let ttf2woff = require('gulp-ttf2woff');
let ttf2woff2 = require('gulp-ttf2woff2');

function browserSynchronize() {
    browserSync.init({
        server: {
            baseDir: './' + projectFolder + '/'
        },
        port: 3000,
        notify: false,
    });
}

function html() {
    return src(path.src.html)
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function css() {
    return src(path.src.css)
        .pipe(scss({
                outputStyle: 'expanded',
            },
        ))
        .pipe(group_media())
        .pipe(autoprefixer({
            cascade: true,
            overrideBrowserslist: ['last 5 versions'],
        }))
        .pipe(webpCss({
            webpClass: '.webp',
            noWebpClass: '.no-webp'
        }))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
            suffix: '.min'
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream())
}

function js() {
  return src(path.src.js)
      .pipe(fileInclude())
      .pipe(dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({ extname: '.min.js' }))
      .pipe(dest(path.build.js))
      .pipe(browserSync.stream());
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin(
            {
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationLevel: 3,
            }
        ))
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream());
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

gulp.task('svgSprite', function () {
    return gulp.src([sourceFolder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: '../icons/icons.svg',
                // example:true // если нужно постмотреть файл пример
            }
        },
    }
    ))
        .pipe(dest(path.build.img))
});

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(css, html, js, images, fonts));

let watch = gulp.parallel(build, watchFiles, browserSynchronize);

exports.js = js;
exports.css = css;
exports.html = html;
exports.fonts = fonts;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;
