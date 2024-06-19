/**
 * Version: html 4.3
 */

import browserSyncPackage from "browser-sync";
const sync = browserSyncPackage.create();

import gulp from "gulp";
const {src, dest, watch, series, parallel} = gulp;
import gulpIf from "gulp-if";
import clean from "gulp-clean";
import newer from "gulp-newer";
import cache from 'gulp-cache';
import imagemin from "gulp-imagemin";
import imageminMozjpeg from 'imagemin-mozjpeg'; // 引入 imagemin-mozjpeg
import imageminPngquant from 'imagemin-pngquant'; // 引入 imagemin-pngquant
// import imageminSvgo from 'imagemin-svgo'; // 引入 imagemin-svgo
// import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';

import gulpSass from "gulp-sass";
import * as dartSass from "sass";
const sass = gulpSass(dartSass);
import sassGlob from "gulp-sass-glob";
import sassVars from "gulp-sass-vars";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import plumber from "gulp-plumber";
import nunjucksRender from "gulp-nunjucks-render";
import prettier from "gulp-prettier";

import config from "./gulp.config.js";
const {version, prodOutput, output} = config;

const args = process.argv.slice(2);
const isProduction = args.includes("--prod");
const isDevelopment = args.includes("--dev");
console.log(args, isProduction, isDevelopment, version);

// const env = isProduction ? 'production' : 'development';
const outputPath = isProduction ? prodOutput : output;
const assetsPath = isProduction ? "./assets" : "./assets";

// 自定義 Nunjucks 環境
function manageEnvironment(environment) {
    environment.opts.tags = {
        blockStart: "<%",
        blockEnd: "%>",
        variableStart: "[[",
        variableEnd: "]]",
        commentStart: "<#",
        commentEnd: "#>",
    };

    // 添加一個名為 "random" 的過濾器，用於生成隨機數字
    environment.addFilter("random", function (max) {
        return Math.floor(Math.random() * (max + 1));
    });
}

function generateCSS() {
    return (
        src(`${config.entryPath.sass}/**/*.scss`)
            .pipe(
                plumber(function (err) {
                    console.log("SASS Compile Error:", err.message);
                    this.emit("end");
                }),
            )
            .pipe(sassVars(config.sassVar, {verbose: true}))
            .pipe(sassGlob())
            .pipe(sourcemaps.init())
            .pipe(sass(config.sassOpt))
            // .pipe(sass.sync().on('error', sass.logError))
            .pipe(postcss([autoprefixer()]))
            .pipe(sourcemaps.write("."))
            .pipe(dest(`./public/assets/css`))
            .pipe(gulpIf(isDevelopment, sync.stream()))
            .on("end", () => {
                console.log("=================================");
                console.log(`generate CSS OK!`);
                console.log("=================================");
                // sync.reload();
            })
    );
}

function nunjucksTask() {
    // Gets .html and .nunjucks files in pages
    return (
        src(`${config.entry}/pages/**/*.+(html|nunjucks|njk)`)
            .pipe(
                plumber(function (err) {
                    console.log("nunjucks Error:", err.message);
                    this.emit("end");
                }),
            )
            // Renders template with nunjucks
            .pipe(
                nunjucksRender({
                    path: [`${config.entry}/pages_templates`],
                    manageEnv: manageEnvironment,
                    data: {
                        ...config.njkOpt,
                        // ENV: env,
                        IMG_PATH: `${assetsPath}/images/`,
                        CSS_PATH: `${assetsPath}/css/`,
                        JS_PATH: `${assetsPath}/js/`,
                        VERSION: isProduction ? version : "",
                    },
                }),
            )

            .pipe(
                prettier({
                    printWidth: 120,
                    tabWidth: 4,
                    bracketSameLine: true,
                    proseWrap: "preserve",
                }),
            )
            // output files in app folder
            .pipe(dest(`${outputPath}`))
            .on("end", () => {
                console.log("=================================");
                console.log(`generate HTML OK!`);
                console.log("=================================");
                if (isDevelopment) {
                    sync.reload();
                }
            })
    );
}

function copyAssets() {
    return src("public/assets/**/*", {encoding: false})
        .pipe(newer(`${prodOutput}/assets`))
        .pipe(cache(imagemin([
            imageminMozjpeg({ quality: 80, progressive: true }), // 壓縮 JPEG
            imageminPngquant({ optimizationLevel: 5 }) // 壓縮 PNG
        ], {
            verbose: true
        })))
        .pipe(dest(`${prodOutput}/assets`))
        .on("error", function(err) {
            console.log("Error copying assets:", err.message);
        })
        .on("end", () => {
            console.log("=================================");
            console.log(`Copy assets OK!`);
            console.log("=================================");
        });
}

function cleanProd() {
    return src([`${prodOutput}`, `!${prodOutput}/assets/images/**`], {read: false, allowEmpty: true})
        .pipe(clean())
        .on("end", () => {
            console.log("=================================");
            console.log(`Clean prod folder OK!`);
            console.log("=================================");
        });
}

function browserSync() {
    sync.init({
        ui: {
            port: config.port,
        },
        server: {
            baseDir: ["./dist", "./public"],
        },
        port: config.port,
    });

    console.log("=================================");
    console.log(config.project + " serving!!");
    console.log("=================================");

    global.isWatching = true;

    watch(config.entryPath.sass, generateCSS);
    watch([`${config.entry}/pages/**/*`, `${config.entry}/pages_templates/**/*`], nunjucksTask);
    watch([`./public/assets/js/**/*`], (cb) => {
        console.log("=================================");
        console.log(`JS files have changed. Reloading...`);
        console.log("=================================");
        sync.reload();
        cb();
    }).on("error", function (err) {
        console.log("Error watching JS files:", err);
    });

    watch([`./public/assets/images/**/*`], (cb) => {
        sync.reload();
        cb();
    }).on("error", function (err) {
        console.log("Error watching image files:", err);
    });
}

const build = series(cleanProd, parallel(generateCSS, nunjucksTask), copyAssets);

// 將默認任務導出為 ES 模塊
export default isProduction ? build : series(parallel(generateCSS, nunjucksTask), browserSync);
