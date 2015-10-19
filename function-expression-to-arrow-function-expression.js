/**
 * Converts a FunctionExpression to an ArrowFunctionExpression when safe to do so.
 *
 * var a = function(a, b) {
 * 	return a + b;
 * }
 *
 * var b = function(a, b) {
 *  	var c = 0;
 *   	return a + b + c;
 * }
 *
 * var a = function(a, b) {
 *  	return a + b + this.c;
 * }
 **
 * var a = (a, b) => a + b
 *
 * var b = (a, b) => {
 *  	var c = 0;
 *   	return a + b + c;
 * }
 *
 * var a = function(a, b) {
 *  	return a + b + this.c;
 * }
 */

module.exports = function(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
  	.find(j.FunctionExpression)
    .filter(p => j(p).find(j.ThisExpression).size() == 0)
  	.replaceWith(p => {
    	var body = p.value.body;
    	var useExpression = body.type == 'BlockStatement' && body.body.length == 1 && body.body[0].type == "ReturnStatement";
        body = useExpression ? body.body[0].argument : body;
    	return j.arrowFunctionExpression(p.value.params, body, useExpression);
    })
    .toSource();
};
