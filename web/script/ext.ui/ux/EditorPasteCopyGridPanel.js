/**
 * @class Ext.grid.EditorPasteCopyGridPanel Version: 1.4 Author: Surinder singh
 *        http://www.sencha.com/forum/member.php?75710-Surinder-singh,
 *        surinder83singh@gmail.com changes: 1) added the block fill feature. 2)
 *        support for auto editing on any non-navigation key press (feature
 *        demanded by jackpan
 *        http://www.sencha.com/forum/member.php?181839-jackpan).
 * 
 */
Ext.grid.RowNumberer.prototype.renderer = function(v, p, record, rowIndex) {
	if (this.rowspan) {
		p.cellAttr = 'rowspan="' + this.rowspan + '"';
	}
	return '<div class="rownumberer" style="text-align:left;background-color:#efefef;cursor:pointer;">' + (rowIndex + 1) + '</div>';
};
Ext.grid.EditorPasteCopyGridPanel = Ext.extend(Ext.ui.XGridPanel, {

	/**
	 * @cfg {Number} clicksToEdit
	 *      <p>
	 *      The number of clicks on a cell required to display the cell's editor
	 *      (defaults to 2).
	 *      </p>
	 *      <p>
	 *      Setting this option to 'auto' means that mousedown <i>on the
	 *      selected cell</i> starts editing that cell.
	 *      </p>
	 */
	clicksToEdit : '2',
	hideRowNumberer : false,
	afterConfig : function(config) {
		/* make sure that selection modal is ExcelCellSelectionModel */
		config.sm = new Ext.grid.ExcelCellSelectionModel();
	},
	initComponent : function() {
		Ext.grid.EditorPasteCopyGridPanel.superclass.initComponent.call(this);
		this.addListener('render', this.addKeyMap, this);
		this.addListener('cellclick', this.onCellClick);
	},
	getView : function() {
		if (!this.view) {
			this.view = new Ext.grid.GridView(this.viewConfig);
		}
		return this.view;
	},
	// 点击一格选择一行
	onCellClick : function(grid, rowIndex, columnIndex, e) {
		var rn = e.getTarget(".rownumberer");
		var row = Ext.get(grid.getView().getRow(rowIndex));
		var record = grid.store.getAt(rowIndex);
		if (rn) {
			if (row.hasClass('x-grid3-row-selected')) {
				// remove current selection
				row.removeClass('x-grid3-row-selected');
				grid.smSelections.remove(record);
			} else {
				// add current selection
				row.addClass('x-grid3-row-selected');
				grid.smSelections.add(record);
			}
		} else {
			// clear all selection
			grid.getEl().select('.x-grid3-row').removeClass('x-grid3-row-selected');
			grid.smSelections.clear();
			// add current selection
			row.addClass('x-grid3-row-selected');
			grid.smSelections.add(record);
		}
	},
	addKeyMap : function() {
		var thisGrid = this;
		this.body.on("mouseover", this.onMouseOver, this);
		this.body.on("mouseup", this.onMouseUp, this);
		// Ext.DomQuery.selectNode('div[class*=x-grid3-scroller]',
		// this.getEl().dom).style.overflowX='hidden';
		// map multiple keys to multiple actions by strings and array of codes
		new Ext.KeyMap(Ext.DomQuery.selectNode('div[class*=x-grid3-scroller]', this.getEl().dom).id, [{
			key : "c",
			ctrl : true,
			fn : function() {
				thisGrid.copyToClipBoard(thisGrid.getSelectionModel().getSelectedCellRange());
			}
		}, {
			key : "v",
			ctrl : true,
			fn : function() {
				thisGrid.pasteFromClipBoard();
			}
		}]);
	},
	onMouseOver : function(e) {
		this.processEvent("mouseover", e);
	},
	onMouseUp : function(e) {
		this.processEvent("mouseup", e);
	},
	copyToClipBoard : function(rows) {
		this.collectGridData(rows);
		if (window.clipboardData && clipboardData.setData) {
			clipboardData.setData("text", this.tsvData);
		} else {
			var hiddentextarea = this.getHiddenTextArea(true);
			hiddentextarea.dom.value = this.tsvData;
			hiddentextarea.focus();
			hiddentextarea.dom.setSelectionRange(0, hiddentextarea.dom.value.length);
		}
	},
	collectGridData : function(cr) {
		var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2 = cr[3];
		this.tsvData = "";
		var rowTsv = "";
		var cmConfig = this.getDisplayColumnModelConfig();
		for (var r = row1; r <= row2; r++) {
			if (this.tsvData != "") {
				this.tsvData += "\n";
			}
			rowTsv = "";
			for (var c = col1; c <= col2; c++) {
				if (rowTsv != "") {
					rowTsv += "\t";
				}
				rowTsv += this.store.getAt(r).get(cmConfig[c].dataIndex);
			}
			this.tsvData += rowTsv;
		}
		return this.tsvData;
	},

	pasteFromClipBoard : function() {
		var hiddentextarea = this.getHiddenTextArea();
		hiddentextarea.dom.value = "";
		hiddentextarea.focus();

	},
	updateGridData : function() {
		var tsvData = this.hiddentextarea.getValue();
		tsvData = tsvData.split("\n");
		var column = [];
		var cr = this.getSelectionModel().getSelectedCellRange();
		var cmConfig = this.getDisplayColumnModelConfig();
		if (!this.canSetValue(cmConfig, cr[1])) {
			Ext.tip("提示", "该列不能编辑！");
			this.hiddentextarea.blur();
			return;
		}
		var nextIndex = cr[0];
		var modiRecord=[];
		if (tsvData[0].split("\t").length == 1 && ((tsvData.length == 1) || (tsvData.length == 2 && tsvData[1].trim() == ""))) {
			// if only one cell in clipboard data, block fill process (i.e. copy
			// a cell, then select a group of cells to paste)
			for (var rowIndex = cr[0]; rowIndex <= cr[2]; rowIndex++) {
				for (var columnIndex = cr[1]; columnIndex <= cr[3]; columnIndex++) {
					if (this.canSetValue(cmConfig, columnIndex)) {
						this.store.getAt(rowIndex).set(cmConfig[columnIndex].dataIndex, tsvData[0]);						
					}
				}
				modiRecord.push(this.store.getAt(rowIndex));
			}
		} else {
			var gridTotalRows = this.store.getCount(), pasteColumnIndex;
			for (var rowIndex = 0; rowIndex < tsvData.length; rowIndex++) {
				if (tsvData[rowIndex].trim() == "") {
					continue;
				}
				columns = tsvData[rowIndex].split("\t");
				if (nextIndex > gridTotalRows - 1) {
					this.stopEditing();
					var newRecord = this.insertAt({}, nextIndex);
				}
				pasteColumnIndex = cr[1];
				for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
					if (this.canSetValue(cmConfig, pasteColumnIndex)) {
						this.store.getAt(nextIndex).set(cmConfig[pasteColumnIndex].dataIndex, columns[columnIndex]);
					}
					pasteColumnIndex++;
				}
				modiRecord.push(this.store.getAt(nextIndex));
				nextIndex++;
			}
		}
		this.fireEvent("paste",modiRecord);
		//console.dir(modiRecord);
		this.hiddentextarea.blur();
	},
	canSetValue : function(config, i) {
		if (i < 0) {
			return false;
		}
		var cm = config[i];
		if (cm && (cm.editor || cm.paste !== false)) {
			return true
		} else {
			return false;
		}
	},
	getDisplayColumnModelConfig : function() {
		var config = [];
		this.getColumnModel().getColumnsBy(function(c) {
			if (c.hidden !== true) {
				config.push(c);
			}
		});
		return config;
	},
	getHiddenTextArea : function(isCopy) {
		this.isCopy = isCopy;
		if (!this.hiddentextarea) {
			this.hiddentextarea = new Ext.Element(document.createElement('textarea'));
			this.hiddentextarea.setStyle('left', '-1000px');
			// this.hiddentextarea.setStyle('border','2px solid #ff0000');
			this.hiddentextarea.setStyle('position', 'absolute');
			// this.hiddentextarea.setStyle('top','-0px');
			this.hiddentextarea.setStyle('z-index', '-1');
			this.hiddentextarea.setStyle('width', '100px');
			this.hiddentextarea.setStyle('height', '1px');
			this.hiddentextarea.addListener('keyup', function() {
				if (this.isCopy !== true) {
					this.updateGridData();
				}
			}, this);
			Ext.get(this.getEl().dom.firstChild).appendChild(this.hiddentextarea.dom);
		}
		return this.hiddentextarea;
	}

});
Ext.reg('editorPasteCopyGrid', Ext.grid.EditorPasteCopyGridPanel);