Ext.grid.LockingGridPanel = Ext.extend(Ext.ui.XGridPanel, {
			afterConfig : function(config) {
				var columns = config.columns;
				delete config.columns;
				config.colModel = new Ext.ux.grid.LockingColumnModel(columns);
			},
			getView : function() {
				if (!this.view) {
					this.view = new Ext.ux.grid.LockingGridView();
				}
				return this.view;
			}
		});
Ext.ns("Ext.ui");
Ext.ui.LockingGridPanel = Ext.grid.LockingGridPanel;