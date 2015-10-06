// Originally taken from pillarjs/path-to-regexp package:
// https://github.com/pillarjs/path-to-regexp
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

module.exports = function (path, params) {
  var buf = null

  while ((buf = PATH_REGEXP.exec(path)) != null) {
    var param = buf[3]
    if (param && !params[param]) {
      throw new Error('Missing path param: ' + param)
    }
    path = path.replace(':' + param, params[param])
  }

  return path
}
