/**
 * @ author faylai new Ext.ui.XPagingToolbar({ pageSize: 10, store:ds,
 *   displayInfo: true })
 * 
 */
Ext.ns('Ext.ui');
Ext.ui.XPagingToolbar = Ext.extend(Ext.PagingToolbar, {

	/**
	 * 
	 * @cfg {String} beforeText
	 * 
	 * Text to display before the comboBox
	 * 
	 */

	beforeText : '每页显示',
	/**
	 * 
	 * @cfg {String} afterText
	 * 
	 * Text to display after the comboBox
	 * 
	 */

	afterText : '条',

	/**
	 * 
	 * @cfg {Mixed} addBefore
	 * 
	 * Toolbar item(s) to add before the PageSizer
	 * 
	 */

	addBefore : '-',

	/**
	 * 
	 * @cfg {Mixed} addAfter
	 * 
	 * Toolbar item(s) to be added after the PageSizer
	 * 
	 */

	addAfter : null,

	/**
	 * 
	 * @cfg {Bool} dynamic
	 * 
	 * True for dynamic variations, false for static ones
	 * 
	 */

	dynamic : false,
	displayInfo : true,
	displayPageSize : true,

	/**
	 * 
	 * @cfg {Array} variations
	 * 
	 * Variations used for determining pageSize options
	 * 
	 */

	variations : [5, 10, 20, 50, 100, 200, 500, 1000],

	/**
	 * 
	 * @cfg {Object} comboCfg
	 * 
	 * Combo config object that overrides the defaults
	 * 
	 */

	comboCfg : undefined,

	getPageSize : function() {
		return this.pageSize;

	},
	// private
	addSize : function(value) {

		if (value > 0) {

			this.sizes.push([value]);

		}

	},

	// private

	updateStore : function() {

		if (this.dynamic) {

			var middleValue = this.pageSize, start;

			middleValue = (middleValue > 0) ? middleValue : 1;

			this.sizes = [];

			var v = this.variations;

			for (var i = 0, len = v.length; i < len; i++) {

				this.addSize(middleValue - v[v.length - 1 - i]);

			}

			this.addToStore(middleValue);

			for (var i = 0, len = v.length; i < len; i++) {

				this.addSize(middleValue + v[i]);

			}

		} else {

			if (!this.staticSizes) {

				this.sizes = [];

				var v = this.variations;

				var middleValue = 0;

				for (var i = 0, len = v.length; i < len; i++) {

					this.addSize(middleValue + v[i]);

				}

				this.staticSizes = this.sizes.slice(0);

			} else {

				this.sizes = this.staticSizes.slice(0);

			}

		}

		this.combo.store.loadData(this.sizes);

		this.combo.collapse();

		this.combo.setValue(this.pageSize);

	},
	refresh : function() {
		this.onClick('refresh');
	},
	setPageSize : function(value, forced) {

		var pt = this;

		this.combo.collapse();

		value = parseInt(value) || parseInt(this.combo.getValue());

		value = (value > 0) ? value : 1;

		if (value == pt.pageSize) {

			return;

		} else if (value < pt.pageSize) {

			pt.pageSize = value;

			var ap = Math.round(pt.cursor / value) + 1;

			var cursor = (ap - 1) * value;

			var store = pt.store;

			if (cursor > store.getTotalCount()) {
				pt.pageSize = value;
				pt.doLoad(cursor - value);

			} else {

				store.suspendEvents();

				for (var i = 0, len = cursor - pt.cursor; i < len; i++) {

					store.remove(store.getAt(0));

				}

				while (store.getCount() > value) {

					store.remove(store.getAt(store.getCount() - 1));

				}

				store.resumeEvents();

				store.fireEvent('datachanged', store);

				pt.cursor = cursor;

				var d = pt.getPageData();

				this.afterTextItem.setText( String.format(pt.afterPageText, d.pages));

				pt.inputItem.setValue(ap) ;

				pt.first.setDisabled(ap == 1);

				pt.prev.setDisabled(ap == 1);

				pt.next.setDisabled(ap == d.pages);

				pt.last.setDisabled(ap == d.pages);

				pt.updateInfo();

			}

		} else {

			this.pageSize = value;
			this.doLoad(Math.floor(this.cursor / this.pageSize) * this.pageSize);

		}

		this.updateStore();

	},
	// private
	onRender : function() {
		Ext.ui.XPagingToolbar.superclass.onRender.apply(this, arguments);
		this.combo = Ext.ComponentMgr.create(Ext.applyIf(this.comboCfg || {}, {

			store : new Ext.data.SimpleStore({

				fields : ['pageSize'],

				data : []

			}),

			displayField : 'pageSize',

			valueField : 'pageSize',

			mode : 'local',

			triggerAction : 'all',

			width : 50,

			xtype : 'combo'

		}));

		this.combo.on('select', this.setPageSize, this);
		var mine = this;
		mine.store.on("beforeload", function(st, opt) {
			if (opt.params.limit != mine.pageSize) {
				opt.params.limit = mine.pageSize;
				mine.setPageSize();
			}
		});

		this.updateStore();

		if (this.addBefore && this.displayPageSize) {

			this.add(this.addBefore);

		}

		if (this.beforeText && this.displayPageSize) {

			this.add(this.beforeText);

		}
		if (this.displayPageSize) {
			this.add(this.combo);
		}

		if (this.afterText && this.displayPageSize) {

			this.add(this.afterText);

		}

		if (this.addAfter && this.displayPageSize) {

			this.add(this.addAfter);

		}

		if (this.autoLoad) {
			this.on("render", function() {
				var me=this;
				setTimeout(function(){
                   me.doRefresh();			
				},10);
				
			});
		}
	}

});
