/* eslint-disable no-console, global-require, import/no-dynamic-require */
const fs = require("fs")
const path = require("path")

/**
 * Recursively looks for JavaScript unit test files (ending in `*.test.js`) and
 * imports/requires them in the current NodeJs process.
 *
 * @function
 * @name requireTestFiles
 * @param {string} dir The directory to search for unit test files at
 */
function requireTestFiles(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`\nNo unit test files found in:\n ${dir}`)
      process.exit(1)
    }

    for (const file of files) {
      if (/\.test\.js$/i.test(file)) {
        require(path.join(dir, file))
      } else if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        requireTestFiles(file)
      }
    }
  })
}

requireTestFiles(__dirname)
