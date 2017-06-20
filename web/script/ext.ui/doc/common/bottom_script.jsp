<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<script type="text/javascript">
	SyntaxHighlighter.config.clipboardSwf = '${base}/script/ext.ui/doc/syntax_highlighter/scripts/clipboard.swf';
	var pres = Ext.select('pre[code]'), runs = Ext.select('.run'), codes = [];
	pres.each(function() {
		codes.push(this.dom.innerHTML);
	});
	runs.on('click', function() {
		var code = codes[runs.indexOf(this)];
		code = code.replace(/&ge;/gm, '>=');
		code = code.replace(/&gt;/gm, '>');
		code = code.replace(/&le;/gm, '<=');
		code = code.replace(/&lt;/gm, '<');
		eval(code);
	})
	SyntaxHighlighter.all();
</script>