// transform.ts
const { src } = require('gulp');
const include = require('gulp-include');
const change = require('gulp-change');
const createProject = require('gulp-typescript').createProject;
const stripImportExport = require('gulp-strip-import-export');
import { SRC_PATH, IMPORT_REGEXP, TS_CONFIG_PATH, EXPORT_REGEXP} from "./consts";

const dotenv = require('dotenv');
dotenv.config();

const removeImportsExports = (content: string) => content.replace(IMPORT_REGEXP, "").replace(EXPORT_REGEXP, "");
const replaceMultilinesForm = (content: string) => content.replace(/\\n/g, '\\\n').replace(/\\t/g, '\t');

export const transformTS = (path) => {
  return src(path, { base: SRC_PATH })
    .pipe(include({ extensions: 'ts' }))
    .pipe(change(removeImportsExports))
    .pipe(createProject(TS_CONFIG_PATH)())
    .pipe(change(replaceMultilinesForm))
    .pipe(stripImportExport())
    .on("error", (error) => console.log(`🛑 Transpilation error: ${error}`))
    .on("end", () => {
      console.log(`☑️   ESLint check completed for "${path}"`);
      console.log(`-------------------------------------------------------------\n`);
      console.log(`✅ File "${path}" transpiled successfully [${new Date().toLocaleTimeString()}] 🕙`)
    });
};

//module.exports = transformTS;
