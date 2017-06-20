Ext.ns("Ext.ui");

Ext.data.WeekDataProxy = Ext.extend(Ext.data.DataProxy, {
	load : function(params, reader, callback, scope, arg) {
		var result;
		try {
			var startDay = params['start'] || new Date();
			var limit = params['limit'] || 10;

			var offset = 1 - startDay.format('N');
			startDay = startDay.add(Date.DAY, offset); // 所在周第一天

			var weeks = new Array();
			for (var i = 0; i < limit; i++) {
				var start = startDay;
				var end = startDay.add(Date.DAY, 6);

				var week = new Array();
				week.push(startDay.format('o'));
				week.push(startDay.format('W'));
				week.push(startDay.format('oW'));
				week.push(startDay.format('o') + '年' + startDay.format('W') + '周');
				week.push(start.format('Y-m-d'));
				week.push(end.format('Y-m-d'));

				weeks.push(week);

				startDay = end.add(Date.DAY, 1);
			}

			result = reader.readRecords(weeks);
		} catch (e) {
			this.fireEvent("loadexception", this, arg, null, e);
			callback.call(scope, null, arg, false);
			return;
		}
		callback.call(scope, result, arg, true);
	}
});

Ext.data.WeekStore = function(config) {
	this.reader = new Ext.data.ArrayReader({}, Ext.data.Record.create(['y', 'w', 'yw', 'ywt', 's', 'e']));
	this.proxy = new Ext.data.WeekDataProxy();
	Ext.apply(this, config);

	Ext.data.WeekStore.superclass.constructor.call(this, config);

};
Ext.extend(Ext.data.WeekStore, Ext.data.Store, {
	load : function(options) {
		options = options || {};
		this.storeOptions(options);
		var p = Ext.apply(options.params || {}, this.baseParams);
		this.proxy.load(p, this.reader, this.loadRecords, this, options);
		return true;
	},
	loadRecords : function(o, options, success) {
		if (!o || success === false) {
			if (success !== false) {
				this.fireEvent("load", this, [], options);
			}
			if (options.callback) {
				options.callback.call(options.scope || this, [], options, false);
			}
			return;
		}
		var r = o.records, t = o.totalRecords || r.length;
		if (!options || options.add !== true) {
			this.data.clear();
			this.data.addAll(r);
			this.totalLength = t;
			this.applySort();
			this.fireEvent("datachanged", this);
		} else {
			this.totalLength = Math.max(t, this.data.length + r.length);
			this.add(r);
		}
		this.fireEvent("load", this, r, options);
		if (options.callback) {
			options.callback.call(options.scope || this, r, options, true);
		}
	}
});

/**
 * @class Ext.ui.WeekField
 * @extend Ext.form.ComboBox
 *         <p>
 *         周选择组件
 *         </p>
 * @author 王晓明
 */
Ext.ui.WeekField = Ext.extend(Ext.form.ComboBox, {
	listWidth : 160,
	hiddenName : 'WEEK',
	valueField : 'yw',
	displayField : 'ywt',
	/**
	 * @cfg 每页显示周数
	 */
	pageSize : 6,
	/**
	 * @cfg {Number} 下拉周列表中当前周的所在位置
	 */
	weekOffset : 2,
	/**
	 * @cfg {Date} 周列表的开始天
	 */
	startDay : null,
	initComponent : function() {
		this.store = new Ext.data.WeekStore();
		this.mode = 'local';
		Ext.ui.WeekField.superclass.initComponent.call(this);
	},
	initValue : function() {
		if (this.startDay) {
			var text = this.startDay.format('o') + '年' + this.startDay.format('W') + '周';
			this.value = text;
		}
		Ext.form.ComboBox.superclass.initValue.call(this);

		if (this.startDay) {
			this.value = this.startDay.format('oW');
		}

		if (this.hiddenField) {
			this.hiddenField.value = this.hiddenValue !== undefined ? this.hiddenValue : this.value !== undefined
					? this.value
					: '';
		}
	},
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (this.isExpanded()) {
			this.collapse();
			this.el.focus();
		} else {
			this.onFocus({});
			if (this.startDay) {
				this.doQuery(this.startDay.add(Date.DAY, this.weekOffset * -7), true);
			} else {
				this.doQuery(new Date(), true);
			}
			this.el.focus();
		}
	},
	onSelect : function(record, index) {
		if (this.fireEvent('beforeselect', this, record, index) !== false) {
			this.setValue(record.data[this.valueField || this.displayField]);
			this.selectWeek = record.data;
			this.startDay = Date.parseDate(record.get('s'), 'Y-m-d');
			this.collapse();
			this.fireEvent('select', this, record, index);
		}
	},
	onLoad : function() {
		if (this.store.getCount() > 0) {
			this.pageStartDay = Date.parseDate(this.store.getAt(0).get('s'), 'Y-m-d');
			this.expand();
			this.restrictHeight();
			if (this.editable) {
				this.el.dom.select();
			}
			if (!this.selectByValue(this.value, true)) {
				this.select(0, true);
			}
		} else {
			this.onEmptyResults();
		}
	},
	initList : function() {
		if (!this.list) {
			var cls = 'x-combo-list';

			this.list = new Ext.Layer({
				shadow : this.shadow,
				cls : [cls, this.listClass].join(' '),
				constrain : false
			});

			var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
			this.list.setWidth(lw);
			this.list.swallowEvent('mousewheel');
			this.assetHeight = 0;

			if (this.title) {
				this.header = this.list.createChild({
					cls : cls + '-hd',
					html : this.title
				});
				this.assetHeight += this.header.getHeight();
			}

			this.innerList = this.list.createChild({
				cls : cls + '-inner'
			});
			this.innerList.on('mouseover', this.onViewOver, this);
			this.innerList.on('mousemove', this.onViewMove, this);
			this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));

			this.footer = this.list.createChild({
				cls : cls + '-ft'
			});
			this.pageTb = new Ext.Toolbar({
				items : ['->', {
					tooltip : '上' + this.pageSize + '周',
					cls : 'x-btn-icon',
					icon : _base + '/style/ex-icon/resultset_previous.gif',
					handler : function() {
						this.store.load({
							params : {
								start : this.pageStartDay.add(Date.DAY, this.pageSize * -7),
								limit : this.pageSize
							}
						});
					},
					scope : this
				}, {
					tooltip : '下' + this.pageSize + '周',
					cls : 'x-btn-icon',
					icon : _base + '/style/ex-icon/resultset_next.gif',
					handler : function() {
						this.store.load({
							params : {
								start : this.pageStartDay.add(Date.DAY, this.pageSize * 7),
								limit : this.pageSize
							}
						});
					},
					scope : this
				}],
				renderTo : this.footer
			});
			this.assetHeight += this.footer.getHeight();

			if (!this.tpl) {
				this.tpl = new Ext.XTemplate('<tpl for="."><div  class="' + cls + '-item">',
						'<b>{ywt}</b><br/> {s}/{e}', '</div></tpl>');
			}

			this.view = new Ext.DataView({
				applyTo : this.innerList,
				tpl : this.tpl,
				singleSelect : true,
				selectedClass : this.selectedClass,
				itemSelector : this.itemSelector || '.' + cls + '-item'
			});

			this.view.on('click', this.onViewClick, this);

			this.bindStore(this.store, true);

			if (this.resizable) {
				this.resizer = new Ext.Resizable(this.list, {
					pinned : true,
					handles : 'se'
				});
				this.resizer.on('resize', function(r, w, h) {
					this.maxHeight = h - this.handleHeight - this.list.getFrameWidth('tb') - this.assetHeight;
					this.listWidth = w;
					this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
					this.restrictHeight();
				}, this);
				this[this.pageSize ? 'footer' : 'innerList'].setStyle('margin-bottom', this.handleHeight + 'px');
			}
		}
	},
	doQuery : function(q, forceAll) {
		if (q === undefined || q === null) {
			q = new Date();
		}
		var qe = {
			query : q,
			forceAll : forceAll,
			combo : this,
			cancel : false
		};
		if (this.fireEvent('beforequery', qe) === false || qe.cancel) {
			return false;
		}
		q = qe.query;
		forceAll = qe.forceAll;
		if (forceAll === true) {
			if (this.lastQuery !== q) {
				this.lastQuery = q;
				this.store.baseParams[this.queryParam] = q;
				this.store.load({
					params : this.getParams(q)
				});
				this.expand();
			} else {
				this.selectedIndex = -1;
				this.onLoad();
			}
		}
	},
	getParams : function(q) {
		var p = {};
		// p[this.queryParam] = q;
		if (this.pageSize) {
			p.start = q;
			p.limit = this.pageSize;
		}
		return p;
	},
	findRecord : function(prop, value) {
		var record;
		if (this.store.getCount() > 0) {
			this.store.each(function(r) {
				if (r.data[prop] == value) {
					record = r;
					return false;
				}
			});
		}
		return record;
	}
});
Ext.reg('weekfield', Ext.ui.WeekField);
