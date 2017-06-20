Ext.grid.ExcelCellSelectionModel = function(config) {
	Ext.apply(this, config);
	this.selection = null;
	this.mouseSelectionEnable = false;
	this.firstSelectedCell = [0, 0];
	this.selectedCellRange = [0, 0, 0, 0];
	this.addEvents(
			/**
			 * @event beforecellselect Fires before a cell is selected.
			 * @param {SelectionModel}
			 *            this
			 * @param {Number}
			 *            rowIndex The selected row index
			 * @param {Number}
			 *            colIndex The selected cell index
			 */
			"beforecellselect",
			/**
			 * @event cellselect Fires when a cell is selected.
			 * @param {SelectionModel}
			 *            this
			 * @param {Number}
			 *            rowIndex The selected row index
			 * @param {Number}
			 *            colIndex The selected cell index
			 */
			"cellselect",
			/**
			 * @event selectionchange Fires when the active selection changes.
			 * @param {SelectionModel}
			 *            this
			 * @param {Object}
			 *            selection null for no selection or an object (o) with
			 *            two properties
			 *            <ul>
			 *            <li>o.record: the record object for the row the
			 *            selection is in</li>
			 *            <li>o.cell: An array of [rowIndex, columnIndex]</li>
			 *            </ul>
			 */
			"selectionchange");

	Ext.grid.ExcelCellSelectionModel.superclass.constructor.call(this);
};

Ext.extend(Ext.grid.ExcelCellSelectionModel, Ext.grid.CellSelectionModel, {

	/** @ignore */
	initEvents : function() {
		this.grid.on("cellmouseover", this.handleMouseOver, this);
		this.grid.on("mouseup", this.handleMouseUp, this);
		this.grid.on("cellmousedown", this.handleMouseDown, this);
		this.grid.getGridEl().on(Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.handleKeyDown, this);
		var view = this.grid.view;
		view.on("refresh", this.onViewChange, this);
		view.on("rowupdated", this.onRowUpdated, this);
		view.on("beforerowremoved", this.clearSelections, this);
		view.on("beforerowsinserted", this.clearSelections, this);
		if (this.grid.isEditor) {
			this.grid.on("beforeedit", this.beforeEdit, this);
		}
	},

	/**
	 * Clears all selections.
	 * 
	 * @param {Boolean}
	 *            true to prevent the gridview from being notified about the
	 *            change.
	 */
	clearSelections : function(preventNotify) {
		var s = this.selection;
		if (s) {
			// this.deSelectCellRange();
			if (preventNotify !== true) {
				this.deSelectCellRange();
				// this.grid.view.onCellDeselect(s.cell[0], s.cell[1]);
			}
			this.selection = null;
			this.fireEvent("selectionchange", this, null);
		}
	},
	handleMouseOver : function(g, row, cell, e) {
		if (this.mouseSelectionEnable) {
			this.clearSelections();
			this.select(row, cell);
			this.makeCellRange(row, cell, this.firstSelectedCell[0], this.firstSelectedCell[1]);
			this.selectCellRange();
		}
	},
	handleMouseUp : function(g, row, cell, e) {
		this.mouseSelectionEnable = false;
	},
	/** @ignore */
	handleMouseDown : function(g, row, cell, e) {
		if (e.button !== 0 || this.isLocked()) {
			return;
		};
		this.mouseSelectionEnable = true;
		this.clearSelections();
		this.select(row, cell);
		if (!e.shiftKey) {
			this.firstSelectedCell = [row, cell];
		}
		this.makeCellRange(row, cell, this.firstSelectedCell[0], this.firstSelectedCell[1]);
		this.selectCellRange();
	},

	/**
	 * Selects a cell.
	 * 
	 * @param {Number}
	 *            rowIndex
	 * @param {Number}
	 *            collIndex
	 */
	select : function(rowIndex, colIndex, preventViewNotify, preventFocus, /* internal */r) {
		if (this.fireEvent("beforecellselect", this, rowIndex, colIndex) !== false) {
			r = r || this.grid.store.getAt(rowIndex);
			this.selection = {
				record : r,
				cell : [rowIndex, colIndex]
			};
			if (!preventViewNotify) {
				var v = this.grid.getView();
				v.onCellSelect(rowIndex, colIndex);
				if (preventFocus !== true) {
					v.focusCell(rowIndex, colIndex);
				}
			}
			this.fireEvent("cellselect", this, rowIndex, colIndex);
			this.fireEvent("selectionchange", this, this.selection);
		}
	},

	/** @ignore */
	handleKeyDown : function(e) {
		if (!e.isNavKeyPress()) {
			return;
		}
		var g = this.grid, s = this.selection;
		if (!s) {
			e.stopEvent();
			var cell = g.walkCells(0, 0, 1, this.isSelectable, this);
			if (cell) {
				this.select(cell[0], cell[1]);
			}
			return;
		}
		var sm = this;
		var walk = function(row, col, step) {
			return g.walkCells(row, col, step, sm.isSelectable, sm);
		};
		var k = e.getKey(), r = s.cell[0], c = s.cell[1];
		var newCell;

		switch (k) {
			case e.TAB :
				if (e.shiftKey) {
					newCell = walk(r, c - 1, -1);
				} else {
					newCell = walk(r, c + 1, 1);
				}
				break;
			case e.DOWN :
				newCell = walk(r + 1, c, 1);
				break;
			case e.UP :
				newCell = walk(r - 1, c, -1);
				break;
			case e.RIGHT :
				newCell = walk(r, c + 1, 1);
				break;
			case e.LEFT :
				newCell = walk(r, c - 1, -1);
				break;
			case e.ENTER :
				if (g.isEditor && !g.editing) {
					g.startEditing(r, c);
					e.stopEvent();
					return;
				}
				break;
		};
		if (newCell) {
			this.clearSelections();
			this.select(newCell[0], newCell[1]);
			/* Ext.example.msg('',newCell[0]+":::"+newCell[1]+","+this.firstSelectedCell[0]+":::"+this.firstSelectedCell[1]); */
			if (!e.shiftKey) {
				this.firstSelectedCell = newCell;
			}
			this.makeCellRange(newCell[0], newCell[1], this.firstSelectedCell[0], this.firstSelectedCell[1]);
			this.selectCellRange();
			e.stopEvent();
		}
	},
	makeCellRange : function(row1, col1, row2, col2) {
		if (row1 > row2) {
			temp_row = row1;
			row1 = row2;
			row2 = temp_row;
		}
		if (col1 > col2) {
			temp_col = col1;
			col1 = col2;
			col2 = temp_col;
		}
		this.selectedCellRange = [row1, col1, row2, col2];
	},

	selectCellRange : function() {
		var cr = this.selectedCellRange;
		var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2 = cr[3];
		for (var r = row1; r <= row2; r++) {
			for (var c = col1; c <= col2; c++) {
				this.grid.view.onCellSelect(r, c);
			}
		}
	},
	getSelectedCellRange : function() {
		return this.selectedCellRange;
	},
	deSelectCellRange : function() {
		var cr = this.selectedCellRange;
		var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2 = cr[3];
		for (var r = row1; r <= row2; r++) {
			for (var c = col1; c <= col2; c++) {
				this.grid.view.onCellDeselect(r, c);
			}
		}
	}
});