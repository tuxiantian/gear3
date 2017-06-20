Ext.ns('Ext.ui.grid');
Ext.ui.grid.GridPrinter = Ext.extend(Ext.util.Observable, {
	init : function(grid) {
		var printer = this;
		grid.print = function() {
			printer.print(this);
		}
		grid.excel = function(otherConfig) {
			printer.excel(this,otherConfig);
		};
	},
	getColumns : function(grid) {
		var columns = grid.getColumnModel().config;
		var cols = [], i = 0;
		for (i = 0; i < columns.length; i++) {
			 //console.log(columns[i].name+"->"+columns[i].exportable);
			if(columns[i].exportable===false){			
				continue;
			}
			if (columns[i].exportable===true ||( columns[i].display !== false && columns[i].print !== false && columns[i].hidden !== true && columns[i].id != 'checker' )) {
				// console.dir(columns[i]);
				cols.push(columns[i]);
			}
		}
		return cols;
	},
	excel : function(grid,otherConfig) {
		var config = otherConfig || {}
		columns = this.getColumns(grid);
		var headers = [], names = [];
		for (var i = 0; i < columns.length; i++) {
			headers.push(columns[i].header||columns[i].name);
			names.push(columns[i].name);
		}
		Ext.applyIf(config, {
			excelColIds : names.join(','),
			excelColTexts : headers.join(',').replace(/<\/?[^>]*>/g,''),
			fileName : 'excel导出',
			start : 0,
			limit : Ext.consts.maxRow
		});
		Ext.applyIf(config,grid.store.baseParams);		
		Ext.download(Ext.url(Ext.consts.exportUrl),config);
	},
	print : function(grid) {
		// We generate an XTemplate here by using 2 intermediary XTemplates
		// - one to create the header,
		// the other to create the body (see the escaped {} below)
		var columns = this.getColumns(grid);
		// console.dir(columns);
		// build a useable array of store data for the XTemplate
		var data = [];
		grid.store.data.each(function(item) {
			var convertedData = [];

			// apply renderers from column model
			for (var key in item.data) {
				var value = item.data[key];
				Ext.each(columns, function(column) {
					if (column.dataIndex == key) {
						convertedData[key] = column.renderer ? column.renderer(value) : value;
					}
				}, this);
			}

			data.push(convertedData);
		});

		// use the headerTpl and bodyTpl markups to create the main
		// XTemplate below
		var headings = new Ext.XTemplate(this.headerTpl).apply(columns);
		var body = new Ext.XTemplate(this.bodyTpl).apply(columns);

		var htmlMarkup = [
				'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
				'<html>', '<head>', '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
				'<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
				'<title>' + grid.title + 'print' + '</title>', '</head>', '<body>', '<table>', headings, '<tpl for=".">', body, '</tpl>', '</table>',
				'</body>', '</html>'];

		var html = new Ext.XTemplate(htmlMarkup).apply(data);

		// open up a new printing window, write to it, print it and close
		var win = window.open('', 'printgrid');

		win.document.write(html);

		if (this.printAutomatically) {
			win.print();
			win.close();
		}
	},

	/**
	 * @property stylesheetPath
	 * @type String The path at which the print stylesheet can be found
	 *       (defaults to 'ux/grid/gridPrinterCss/print.css')
	 */
	stylesheetPath : Ext.url('/style/print.css'),

	/**
	 * @property printAutomatically
	 * @type Boolean True to open the print dialog automatically and close the
	 *       window after printing. False to simply open the print version of
	 *       the grid (defaults to true)
	 */
	printAutomatically : false,

	/**
	 * @property headerTpl
	 * @type {Object/Array} values The markup used to create the headings row.
	 *       By default this just uses
	 *       <th> elements, override to provide your own
	 */
	headerTpl : ['<tr>', '<tpl for=".">', '<th>{header}</th>', '</tpl>', '</tr>'],

	/**
	 * @property bodyTpl
	 * @type {Object/Array} values The XTemplate used to create each row. This
	 *       is used inside the 'print' function to build another XTemplate, to
	 *       which the data are then applied (see the escaped dataIndex
	 *       attribute here - this ends up as "{dataIndex}")
	 */
	bodyTpl : ['<tr>', '<tpl for=".">', '<td>{{dataIndex}}</td>', '</tpl>', '</tr>']
}

);