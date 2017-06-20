
/**
 * cellActios:{ className:fn }
 * 
 */

Ext.ns('Ext.ui.grid');
Ext.ui.grid.CellActions = Ext.extend(Ext.util.Observable, {
	init : function(grid) {
		this.cellActions = grid.cellActions || {};
		this.grid = grid;
		grid.on('click', this.onClick, this);
	},
	onClick : function(e) {
		var row = e.getTarget('.x-grid3-row');
		var cell = e.getTarget('.x-grid3-cell');
		var grid = this.grid;
		var view = grid.view;
		var rowIndex = view.findRowIndex(row);
		var colIndex = view.findCellIndex(cell);
		var c = grid.getColumnModel().config[colIndex] || {
			dataIndex : ''
		};// incase no found
		var record, dataIndex, value, fn, t, p;
		if (cell && rowIndex >= 0) {
			record = grid.store.getAt(rowIndex);
			if (typeof record == 'undefined') {
				return;
			}
			dataIndex = c.dataIndex;
			value = record.get(dataIndex);
			for (p in this.cellActions) {
				t = e.getTarget("." + p);
				fn = this.cellActions[p];
				if (t) {
					if (typeof fn == 'function') {
						fn.call(grid, value, record, rowIndex, colIndex, t);
					}
				}
			}
		}
	}

});

// register xtype
Ext.reg('cellactions', Ext.ui.grid.CellActions);

// eof
