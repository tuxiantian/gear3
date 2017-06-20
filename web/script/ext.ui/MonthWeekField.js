Ext.ns("Ext.ui");

Ext.data.MonthWeekDataProxy = Ext.extend(Ext.data.DataProxy, {
	load : function(params, reader, callback, scope, arg) {
		var result;
		try {
			var month = params['month'] || new Date().format('Ym');

			var startDate = Date.parseDate(month + '01', 'Ymd');
			var endDate = startDate.getLastDateOfMonth();
			var d = startDate;
			var monthWeekArray = new Array();
			var dateArray = new Array();
			while (d <= endDate) {
				if (d.format('N') == 7) {
					if (dateArray.length != 0) {
						monthWeekArray.push(dateArray);
						dateArray = new Array();
					}
					d = d.add(Date.DAY, 1);
					continue;
				} else if (d.format('Y-m-d') == endDate.format('Y-m-d')) {
					dateArray.push(d);
					monthWeekArray.push(dateArray);
					d = d.add(Date.DAY, 1);
				} else {
					dateArray.push(d);
					d = d.add(Date.DAY, 1);
				}
			}

			if (monthWeekArray[0].length < 4) {
				monthWeekArray[1] = monthWeekArray[0].concat(monthWeekArray[1]);
				monthWeekArray.shift();
			}
			if (monthWeekArray[monthWeekArray.length - 1].length < 4) {
				monthWeekArray[monthWeekArray.length - 2] = monthWeekArray[monthWeekArray.length - 2]
						.concat(monthWeekArray[monthWeekArray.length - 1]);
				monthWeekArray.pop();
			}

			var monthWeeks = new Array();
			for (var i = 0; i < monthWeekArray.length; i++) {
				var weekArray = monthWeekArray[i];
				var monthWeek = [i + 1, weekArray[0].format('Ym') + (i + 1),
						String.format('{0}年{1}月第{2}周', weekArray[0].format('Y'), weekArray[0].format('m'), i + 1),
						weekArray[0].format('Y-m-d'), weekArray[weekArray.length - 1].format('Y-m-d')];
				monthWeeks[i] = monthWeek;
			}

			result = reader.readRecords(monthWeeks);
		} catch (e) {
			this.fireEvent("loadexception", this, arg, null, e);
			callback.call(scope, null, arg, false);
			return;
		}
		callback.call(scope, result, arg, true);
	}
});

Ext.data.MonthWeekStore = function(config) {
	this.reader = new Ext.data.ArrayReader({}, Ext.data.Record.create(['w', 'ymw', 't', 's', 'e']));
	this.proxy = new Ext.data.MonthWeekDataProxy();
	Ext.apply(this, config);

	Ext.data.MonthWeekStore.superclass.constructor.call(this, config);

};
Ext.extend(Ext.data.MonthWeekStore, Ext.data.Store, {
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
 * @class Ext.ui.MonthWeekField
 * @extend Ext.form.ComboBox
 *         <p>
 *         月周选择组件
 *         </p>
 * @author 王晓明
 */
Ext.ui.MonthWeekField = Ext.extend(Ext.form.ComboBox, {
	listWidth : 160,
	hiddenName : 'MONTH_WEEK',
	valueField : 'ymw',
	displayField : 't',
	/**
	 * @cfg {Date} 周列表的开始天
	 */
	startDay : null,
	initComponent : function() {
		this.store = new Ext.data.MonthWeekStore();
		this.mode = 'local';
		if (this.startDay) {
			this.startValue = this.getWeek(this.startDay);
		}
		Ext.ui.MonthWeekField.superclass.initComponent.call(this);
	},
	initValue : function() {
        if(this.startValue) {
		var text = String.format('{0}年{1}月第{2}周', this.startValue.substring(0, 4), this.startValue.substring(4, 6),
				this.startValue.substring(6));
		this.value = text;
        }
		Ext.form.ComboBox.superclass.initValue.call(this);

        if (this.startValue) {
            this.value = this.startValue;
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
			this.doQuery(this.startDay, true);
			this.el.focus();
		}
	},
	onSelect : function(record, index) {
		if (this.fireEvent('beforeselect', this, record, index) !== false) {
			this.setValue(record.data[this.valueField || this.displayField]);
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
					tooltip : '上月',
					cls : 'x-btn-icon',
					icon : _base + '/style/ex-icon/resultset_previous.gif',
					handler : function() {
						this.store.load({
							params : {
								month : this.pageStartDay.add(Date.MONTH, -1).format('Ym')
							}
						});
					},
					scope : this
				}, {
					tooltip : '下月',
					cls : 'x-btn-icon',
					icon : _base + '/style/ex-icon/resultset_next.gif',
					handler : function() {
						this.store.load({
							params : {
								month : this.pageStartDay.add(Date.MONTH, 1).format('Ym')
							}
						});
					},
					scope : this
				}],
				renderTo : this.footer
			});
			this.assetHeight += this.footer.getHeight();

			if (!this.tpl) {
				this.tpl = new Ext.XTemplate('<tpl for="."><div  class="' + cls + '-item">', '<b>{t}</b><br/> {s}/{e}',
						'</div></tpl>');
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
			q = '';
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
		q = q || new Date();
		return {
			month : q.format('Ym')
		};
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
	},
	getWeek : function(date) {
		var month = date.format('Ym');

		var startDate = Date.parseDate(month + '01', 'Ymd');
		var endDate = startDate.getLastDateOfMonth();
		var d = startDate;
		var monthWeekArray = new Array();
		var dateArray = new Array();
		while (d <= endDate) {
			if (d.format('N') == 7) {
				if (dateArray.length != 0) {
					monthWeekArray.push(dateArray);
					dateArray = new Array();
				}
				d = d.add(Date.DAY, 1);
				continue;
			} else if (d.format('Y-m-d') == endDate.format('Y-m-d')) {
				dateArray.push(d);
				monthWeekArray.push(dateArray);
				d = d.add(Date.DAY, 1);
			} else {
				dateArray.push(d);
				d = d.add(Date.DAY, 1);
			}
		}

		if (monthWeekArray[0].length < 4) {
			monthWeekArray[1] = monthWeekArray[0].concat(monthWeekArray[1]);
			monthWeekArray.shift();
		}
		if (monthWeekArray[monthWeekArray.length - 1].length < 4) {
			monthWeekArray[monthWeekArray.length - 2] = monthWeekArray[monthWeekArray.length - 2]
					.concat(monthWeekArray[monthWeekArray.length - 1]);
			monthWeekArray.pop();
		}

		var week = 1;
		a : for (var i = 0; i < monthWeekArray.length; i++) {
			b : for (var j = 0; j < monthWeekArray[i].length; j++) {
				if (date.format('Y-m-d') === monthWeekArray[i][j].format('Y-m-d')) {
					week = i+1;
					break a;
				}
			}
		}
		return date.format('Ym') + week;
	}
});
Ext.reg('monthweekfield', Ext.ui.MonthWeekField);
