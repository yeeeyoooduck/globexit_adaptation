import { transformTS } from "../transform";

const { dest } = require('gulp');
const del = require('del');
const change = require('gulp-change');
const header = require('gulp-header');
const { BUILD_PATH, WATCHED_TS_TYPES } = require('../consts');

export const build = async (done) => {
  await del(BUILD_PATH);
  console.log(process.env.WORK_MODE);
  WATCHED_TS_TYPES.forEach(x => {
    transformTS(x)
      .pipe(change((content) => {
        return (process.env.WORK_MODE === 'template' ? `<%\n${content}\n%>\n` : content);
      }))
      .pipe(header("\ufeff"))
      .pipe(dest(BUILD_PATH));
  });

  done();
};