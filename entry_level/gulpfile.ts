import { task } from "gulp";
import { build } from "./gulp/tasks/build.task";
import { dev } from "./gulp/tasks/dev.task";

task("dev", dev);

task("build", build);
