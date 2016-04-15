import path from 'path'
import fs from 'fs'
import through from 'through2'
import glob from 'glob'
import slash from 'slash'

export default function gulpSassGlob () {
  return through.obj(transform)
}

function transform (file, env, callback) {
  const reg = /^\s*@import\s+["']([^"']+\*(\.scss|\.sass)?)["'];?$/gm
  const isSass = path.extname(file.path) === '.sass'
  const base = path.normalize(path.join(path.dirname(file.path), '/'))

  let contents = file.contents.toString('utf-8')

  let result

  while ((result = reg.exec(contents)) !== null) {
    const importRule = result[0]
    const globPattern = result[1]

    const files = glob.sync(path.join(base, globPattern), {
      cwd: base
    })

    let imports = []

    files.forEach((filename) => {
      if (filename !== file.path && isSassOrScss(filename)) {
        // remove parent base path
        filename = path.normalize(filename).replace(base, '')
        imports.push('@import "' + slash(filename) + '"' + (isSass ? '' : ';'))
      }
    })

    const replaceString = imports.join('\n')
    contents = contents.replace(importRule, replaceString)
    file.contents = new Buffer(contents)
    // Since we change a part of the `contents` being matched and some parts
    // previously matched are not already there we have to reset the regular
    // expression state. It would be better to split a file into lines and
    // match each one with a stateless (non-global) expression
    reg.lastIndex = 0;
  }

  callback(null, file)
}

function isSassOrScss (filename) {
  return (!fs.statSync(filename).isDirectory() && path.extname(filename).match(/\.sass|\.scss/i))
}
