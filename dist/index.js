'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = gulpSassGlob;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var IMPORT_RE = /^([ \t]*(?:\/\*.*)?)@import\s+["']([^"']+\*[^"']*(?:\.scss|\.sass)?)["'];?([ \t]*(?:\/[\/\*].*)?)$/gm;

function gulpSassGlob() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _through2.default.obj(function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        transform.apply(undefined, args.concat([options]));
    });
}

function transform(file, env, callback) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var includePaths = options.includePaths || [];
    for (var _i = 0; _i < includePaths.length; _i++) {
        includePaths[_i] = _path2.default.join(_path2.default.normalize(includePaths[_i]), '/');
    }

    var isSass = _path2.default.extname(file.path) === '.sass';
    var base = _path2.default.normalize(_path2.default.join(_path2.default.dirname(file.path), '/'));

    var searchBases = [base].concat(_toConsumableArray(includePaths));
    var contents = file.contents.toString('utf-8');
    var contentsCount = contents.split('\n').length;

    var result = void 0;

    for (var i = 0; i < contentsCount; i++) {
        result = IMPORT_RE.exec(contents);

        if (result !== null) {
            var files;

            var _base_path;

            (function () {
                var _result = result,
                    _result2 = _slicedToArray(_result, 4),
                    importRule = _result2[0],
                    startComment = _result2[1],
                    globPattern = _result2[2],
                    endComment = _result2[3];

                files = [];

                for (var _i2 = 0; _i2 < searchBases.length; _i2++) {
                    _base_path = searchBases[_i2];

                    files = _glob2.default.sync(_path2.default.join(_base_path, globPattern), {
                        cwd: _base_path
                    });
                    if (files.length > 0) {
                        break;
                    }
                }

                var imports = [];

                files.forEach(function (filename) {
                    if (filename !== file.path && isSassOrScss(filename)) {
                        // remove parent base path
                        filename = _path2.default.normalize(filename).replace(_base_path, '');
                        imports.push('@import "' + (0, _slash2.default)(filename) + '"' + (isSass ? '' : ';'));
                    }
                });

                if (startComment) {
                    imports.unshift(startComment);
                }

                if (endComment) {
                    imports.push(endComment);
                }

                var replaceString = imports.join('\n');
                contents = contents.replace(importRule, replaceString);
                file.contents = new Buffer(contents);
            })();
        }
    }

    callback(null, file);
}

function isSassOrScss(filename) {
    return !_fs2.default.statSync(filename).isDirectory() && _path2.default.extname(filename).match(/\.sass|\.scss/i);
}
module.exports = exports['default'];