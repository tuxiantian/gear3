(function(TB) {
	Ext.ns('Ext.ui');
	Ext.reg("tb", TB);
	Ext.ui.XTollbar = Ext.extend(Ext.Container, {				
				constructor : function(config) {
					var tbitems = [], i = 0, items, spitems = [], tbconfig = {};
					if (Ext.isArray(config)) {
						config = {
							items : config
						};
					} else {
						config = config || {};
					}
					items = config.items || [];
					config.items = [];
					for (i = 0; i < items.length; i++) {
						if (items[i] == "|") {
							spitems.push(this.createToolbar(config, tbitems));
							tbitems = [];
						} else if (items[i] == '!') {
							// do nothing just ignore
						} else {
							tbitems.push(items[i]);
						}
					}
					if (tbitems.length) {
						spitems.push(this.createToolbar(config, tbitems));
					}
					config.items = spitems;
					Ext.Container.superclass.constructor.call(this, config);

				},
				createToolbar : function(config, items) {					
					var enableOverflow=config.ownerCt && config.ownerCt.enableOverflow;
					var defaults={};
					if(typeof config.defaults=='function'){
					   defaults=config.defaults(this);
					   config.defaults=defaults;
					}
					var tbconfig = Ext.apply({
						        'enableOverflow':enableOverflow===true,
								buttonAlign : this.buttonAlign
							}, config);
					tbconfig.items = items;				
					return this.createComponent(tbconfig, 'tb');
				},
				add : function(comp) {
					if (Ext.isArray(comp)) {
						return Ext.ui.XTollbar.superclass.add.apply(this, arguments);
					}
					var xtype = null;
					if (comp.getXType) {
						xtype = comp.getXType();
					}
					if (comp.xtype) {
						xtype = comp.xtype;
					}
					if (xtype == 'tb') {
						return Ext.ui.XTollbar.superclass.add.apply(this, arguments);
					}
					if (xtype == null && comp == '|') {
						return this.add(this.createToolbar({}, []));
					} else {
						var tb = this.items.itemAt(this.items.getCount() - 1);
						if (!tb) {
							var tb = this.add(this.createToolbar({}, []));
						}
						return tb.add(comp);
					}

				}
			});

	Ext.reg("toolbar", Ext.ui.XTollbar);

})(Ext.Toolbar);

Ext.Panel.prototype.createToolbar= function(tb, options){
    var result;    
    if(Ext.isArray(tb)){
        tb = {
            items: tb
        };
    }
    result = tb.events ? Ext.apply(tb, options) : this.createComponent(Ext.apply({ownerCt:this}, tb, options), 'toolbar');
    this.toolbars.push(result);    
    return result;
};


