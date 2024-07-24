import { transformTS } from "../transform";

const { src, watch, dest } = require('gulp');
const eslint = require('gulp-eslint');
const change = require('gulp-change');
const header = require('gulp-header');
const { SRC_PATH, BUILD_PATH, WATCHED_TS_TYPES } = require('../consts');

export const dev = (done) => {
  console.log(`\n-------------------------------------------------------------`);
  WATCHED_TS_TYPES.forEach(x => {
    watch(x).on("change", (path) => {
      console.log(`\n🚀 Build start...`);
      src(path, { base: SRC_PATH })
        .pipe(eslint())
        .on('end', () => {
          console.log(`\n-------------------------------------------------------------`);
        })
        .pipe(eslint.format());
      transformTS(path)
        .pipe(change((content) => `<%\n${content}\n%>\n`))
        .pipe(header("\ufeff"))
        .pipe(dest(BUILD_PATH))
        .on('end', () => {
          console.log(`\n🚀 Build end.`);
        });
    });

    console.log(`☑️   Watcher on "${x}" have started [change event]`);
  });
  console.log(`-------------------------------------------------------------\n`);
  done();
};