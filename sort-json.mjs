#!/usr/bin/env node

import fs from "fs/promises";

const args = process.argv.slice(2);

const options = [];
const rawPaths = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith("--")) {
    options.push(arg);
  } else {
    rawPaths.push(arg);
  }
}

const paths = [];

const checkIfFile = async (oldPath) => {
  const stats = await fs.lstat(oldPath);

  if (stats.isFile()) {
    if (oldPath.endsWith(".json")) {
      paths.push(oldPath);
    }
  } else if (stats.isDirectory()) {
    const paths = await fs.readdir(oldPath);
    for (const path of paths) {
      await checkIfFile(oldPath + "/" + path);
    }
  }
};

for (const path of rawPaths) {
  await checkIfFile(path);
}

let hasError = false;

for (const path of paths) {
  const file = await fs.readFile(path, "utf-8");
  const parsedFile = JSON.parse(file);
  const sortedFile = Object.keys(parsedFile)
    .sort()
    .reduce((res, key) => ({ ...res, [key]: parsedFile[key] }), {});
  if (JSON.stringify(sortedFile) !== JSON.stringify(parsedFile)) {
    if (options.includes("--fix")) {
      await fs.writeFile(path, `${JSON.stringify(sortedFile, null, 2)}\n`);
      console.log(`Sorted file: ${path}`);
    } else {
      console.error(`Unsorted file: ${path}`);
      hasError = true;
    }
  }
}

if (hasError) {
  process.exit(1);
}

/* 
const localesFiles = await Promise.all(
  paths.map((path) => fs.readFile(path, "utf8"))
);
const localesParsed = localesFiles.map((localesFile) =>
  JSON.parse(localesFile)
);
const sortedLocales = localesParsed.map((localeParsed) =>
  Object.keys(localeParsed)
    .sort()
    .reduce((res, key) => ({ ...res, [key]: localeParsed[key] }), {})
);

if (JSON.stringify(localesParsed) === JSON.stringify(sortedLocales)) {
  console.log("Locales sorted! 🤖");
  process.exit();
} else {
  if (args !== "--fix") {
    console.error(`⚠ Locales not sorted! 🤖\nCheck: ${paths}!`);
    process.exit(1);
  }
}

if (args === "--fix") {
  await Promise.all(
    paths.map((path, i) =>
      fs.writeFile(
        path,
        `${JSON.stringify(sortedLocales[i], null, 2)}\n`,
        null,
        2
      )
    )
  );
  console.log("Locales sorted! 🤖");
}
 */
