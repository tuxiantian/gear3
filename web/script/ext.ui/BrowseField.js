Ext.ns('Ext.ui');
Ext.ui.BrowseField = Ext.extend(Ext.form.TriggerField, {
	initComponent : function() {
		Ext.ui.BrowseField.superclass.initComponent.call(this);
		this.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				this.fireEvent("pop", this);
			}
		}, this);
		this.addEvents("pop");

	},
	triggerClass : 'x-form-pop-trigger',
	onTriggerClick : function() {
		this.fireEvent("pop", this);
	}
});
Ext.reg('browsefield', Ext.ui.BrowseField);