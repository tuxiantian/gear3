/**
 * 超级表格
 * 
 * @require Ext.ui.CommonStore,Ext.ui.XPagingToolbar
 * @class Ext.ui.XGridPanel
 * @extends Ext.grid.EditorGridPanel
 * @cfg {string}metaTable元信息表名称 可以配置store.fields 和gird.columns
 * @cfg {object}fields 该字段是store.fields 配置项和gird.columns 混合配置 该字段优先级高于metaTable
 *      如果metaTable 和fields 都配置那么同name 的会合并
 * @cfg {object} storeConfig store 配置选项
 * @cfg {object} smConfig 选择模式{singleSelect:false}
 * @cfg {object}pagingConfig 设置分页选项
 * @cfg {Ext.form.Field/string}formField 值绑定字段,动态把表格编辑值同步到form field(very
 *      useful)
 * @cfg {boolean} keepSelection 翻页保持选中
 * @event recordchage
 * @argument {Ext.ui.XGridPanel} grid,@argument {Ext.data.Record} record
 * 
 */
Ext.ns('Ext.ui');
Ext.ui.CheckboxColumn = Ext.extend(Ext.grid.Column, {
	header : '<div class="x-grid3-hd-checker">&#160;</div>',
	isColumn : true, // So that ColumnModel doesn't feed this
	// Column constructor
	renderer : function(v, p, record) {
		return '<div class="x-grid3-row-checker">&#160;</div>';
	},
	processEvent : function(name, e, grid, rowIndex, colIndex) {
		var sm = grid.getSelectionModel();
		if (name == 'mousedown') {
			this.onMouseDown(e, e.getTarget(), grid);
			return false;
		} else {
			return Ext.grid.Column.prototype.processEvent.apply(sm, arguments);
		}
	},
	// private
	onMouseDown : function(e, t, grid) {
		if (e.button === 0 && t.className == 'x-grid3-row-checker') {
			e.stopEvent();
			var row = e.getTarget('.x-grid3-row');
			var sm = grid.getSelectionModel();
			if (row) {
				var index = row.rowIndex;
				if (sm.isSelected(index)) {
					sm.deselectRow(index);
				} else {
					sm.selectRow(index, true);
					grid.getView().focusRow(index);
				}
			}
		}
	},
	constructor : function(config) {
		config = config || {};
		Ext.apply(config, {
			sortable : false,
			width : 20,
			menuDisabled : true,
			fixed : true,
			hideable : false,
			dataIndex : '',
			id : 'checker',
			locked : true
		});
		Ext.ui.CheckboxColumn.superclass.constructor.call(this, config);

	}

});
Ext.grid.Column.types['checkboxcolumn'] = Ext.ui.CheckboxColumn;

Ext.ui.CheckboxSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {
	constructor : function() {
		Ext.grid.CheckboxSelectionModel.superclass.constructor.apply(this, arguments);
		if (this.checkOnly) {
			this.handleMouseDown = Ext.emptyFn;
		}
	},
	// private
	initEvents : function() {
		Ext.grid.CheckboxSelectionModel.superclass.initEvents.call(this);

		this.grid.on('render', function() {
			Ext.fly(this.grid.getView().innerHd).on('mousedown', this.onHdMouseDown, this);
			if (this.grid.getView().lockedHd) {
				Ext.fly(this.grid.getView().lockedHd).on('mousedown', this.onHdMouseDown, this);
			}
		}, this);
	},

	// private
	onHdMouseDown : function(e) {
		var t = e.getTarget();
		if (t.className == 'x-grid3-hd-checker') {
			e.stopEvent();
			var hd = Ext.fly(t.parentNode);
			var isChecked = hd.hasClass('x-grid3-hd-checker-on');
			if (isChecked) {
				hd.removeClass('x-grid3-hd-checker-on');
				this.clearSelections();
			} else {
				hd.addClass('x-grid3-hd-checker-on');
				this.selectAll();
			}
		}
	},

	onEditorSelect : function(row, lastRow) {
		if (lastRow != row && !this.checkOnly) {
			this.selectRow(row); // *** highlight newly-selected cell
			// and update selection
		}
	}
});

Ext.ui.XGridPanel = function(config) {
	var metaRe = [], fieldRe = [];
	if (typeof config.metaTable == 'string') {
		if (Ext.isEmpty(window.Metas) || Ext.isEmpty(window.Metas[config.metaTable])) {
			throw new Error('请初始化表格' + config.metaTable + "元信息");
			return;
		}
		metaRe = this.parseMeta(window.Metas[config.metaTable]);
	}

	if (metaRe.length == 0 && Ext.isEmpty(config.fields)) {
		throw new Error("请配置fields");
	}
	var fieldRe = this.paseFields(config.fields || []);
	config.fields = this.mergeColumns(metaRe, fieldRe); // merge meta and fields
	// configuration
	if (config.fields.length == 0) {
		throw new Error("fields 长度为0");
	}
	// console.dir(config.fields); 设置store
	config.storeConfig = Ext.applyAll({
		fields : config.fields,
		autoLoad : false
	}, config.storeConfig || {});
	if (!config.store) {
		config.store = this.createStore(config.storeConfig);
	}
	// 复制fields 并过滤display=false 的配置
	config.columns = Ext.applyAll({}, {
		fields : this.filterNoDisplayColumn(config.fields)
	}).fields;

	// 设置columns
	var rn = new Ext.grid.RowNumberer({
		locked : true,
		print : false,
		paste : false
	}), columns = [];// row number
	if (config.hideRowNumberer === false) {// 设置是否显示行号
		columns.push(rn);
	}
	var sm = config.sm || new Ext.grid.RowSelectionModel({
		singleSelect : true
	});
	if (config.smConfig) {
		config.smConfig = Ext.apply({
			singleSelect : true
		}, config.smConfig);
		sm = new Ext.ui.CheckboxSelectionModel(config.smConfig);
		columns.push({
			xtype : 'checkboxcolumn'
		});
	}
	config.sm = sm;
	config.columns = columns.concat(config.columns);
	// 设置编辑数据
	config.store.on("update", this.onUpdate.createDelegate(this));
	config.store.on("load", this.onStoreReload.createDelegate(this));
	this.reset();
	// 设置分页
	if (config.pagingConfig) {
		if (config.pagingConfig === true) {
			config.pagingConfig = {};
		}
		config.bbar = this.createPagingToolbar(config.pagingConfig, config.store);
	}
	// plugins 插件
	var plugins = config.plugins || [];
	plugins.push(new Ext.ui.grid.CellActions());
	plugins.push(new Ext.ui.grid.GridPrinter());
	config.plugins = plugins;
	this.addEvents('recordchage');
	this.afterConfig(config);

	Ext.ui.XGridPanel.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ui.XGridPanel, Ext.grid.EditorGridPanel, {
	keepSelection : false,
	loadMask : true,
	clicksToEdit : 1,
	stripeRows : true,
	pageSize : 50,
	autoWidth : true,
	createPagingToolbar : function(pagingConfig, store) {
		var bar = new Ext.ui.XPagingToolbar(Ext.apply({
			pageSize : this.pageSize,
			store : store,
			autoLoad : true,// 分页渲染后自动刷行
			displayInfo : true
		}, pagingConfig));
		return bar;
	},
	createStore : function(storeConfig) {
		if (storeConfig.group) {
			return new Ext.ui.GroupingStore(storeConfig);
		} else {
			return new Ext.ui.CommonStore(storeConfig);
		}
	},
	afterConfig : function(config) {

	},
	/**
	 * some events must init in initComponent
	 */
	initComponent : function() {

		if (this.summary === true) {
			this.plugins.push(new Ext.ui.GridSummary());
		}
		Ext.ui.XGridPanel.superclass.initComponent.apply(this, arguments);// for
		// event
		// register;event
		var sm = this.getSelectionModel();
		sm.on("rowselect", this.onRowselect.createDelegate(this));
		sm.on("rowdeselect", this.onRowdeselect.createDelegate(this));
		this.smSelections = new Ext.util.MixedCollection(false);
		this.on("render", function(grid) {
			grid.getView().on("refresh", grid.onViewRefresh, grid);
		});
		if (this.formField) {
			this.bindField(this.formField);
		}
		// this for cell qtip
		this.on('mouseover', function(e) {
			var cell = e.getTarget(".x-grid3-cell", 3);
			if (cell) {
				var colIndex = this.view.findCellIndex(cell);
				var c = this.getColumnModel().config[colIndex];
				var rowIndex = this.getView().findRowIndex(cell);
				if (rowIndex === false)
					return;// hd return;
				var record = this.store.getAt(rowIndex);
				var cellValue = record.get(c.name);
				if (c.qtip && Ext.QuickTips.getQuickTip()) {
					Ext.QuickTips.getQuickTip().show(); // incase
					// no
					// rendered;
					if (Ext.isFunction(c.qtip)) {
						cellValue = c.qtip(cellValue, record, rowIndex) || cellValue;
					}					
					Ext.QuickTips.getQuickTip().show();
					Ext.QuickTips.getQuickTip().body.update(cellValue);
					setTimeout(function(){
					   Ext.QuickTips.getQuickTip().show();
					},100);
				}
			}
		});
		if(this.restoreScroll===true){
			this.getView().on('beforerefresh', function(view) {
				  view.scrollTop = view.scroller.dom.scrollTop;
				  view.scrollLeft = view.scroller.dom.scrollLeft;
				});
	
			this.getView().on('refresh', function(view) {		 
				    setTimeout(function () {
				        view.scroller.dom.scrollTop = view.scrollTop ;
				        view.scroller.dom.scrollLeft = view.scrollLeft ;
				    }, 200);
			});
	    }
		this.on('beforeedit', this.onBeforEdit, this);
	},
	setEditable : function(editable) {
		this._editable = editable;
	},
	onBeforEdit : function(e) {
		if (this._editable === false) {
			e.cancel = true;
			return false;
		} else {
			return true;
		}
	},
	/**
	 * 
	 * @param {Ext.formField/string}
	 *            field or id of field
	 */
	bindField : function(formField) {
		this.on('recordchage', function(grid, record) {
			// in case field is not rendered ,so lazy fetching
			// code here
			var field = Ext.getCmp(formField);
			if (field) {

				field.setValue(Ext.encode(grid.getValue()));
			}
		});
	},
	/**
	 * 
	 * @param {array}
	 *            meta meta data represent info of table columns
	 * @return{object} return tow fields: fs{array} represent fields of
	 *                 gridpanel; <br/> the meta data format like below
	 * 
	 * <pre>
	 * [{
	 * 	name : 'colomnName',
	 * 	header : '表格名称'
	 * }]
	 * </pre>
	 */
	parseMeta : function(meta) {
		var fs = [], i;
		for (i = 0; i < meta.length; i++) {
			fs.push(Ext.apply({
				dataIndex : meta[i].name
			}, meta[i]));
		}
		return fs;
	},
	filterNoDisplayColumn : function(cols) {
		var tmp = [];
		for (var i = 0; i < cols.length; i++) {
			if (cols[i].display === false) {
				delete cols[i].display;
			} else {
				tmp.push(cols[i]);
			}
		}
		return tmp;
	},
	paseFields : function(fields) {
		var i = 0, fs = [];
		for (i = 0; i < fields.length; i++) {
			if (typeof fields[i] == 'string') {
				fs.push({
					name : fields[i],
					header : fields[i],
					dataIndex : fields[i]
				});
			} else if (typeof fields[i] == 'object') {
				fs.push(Ext.apply({
					header : fields[i].name,
					dataIndex : fields[i].name
				}, fields[i]));
			}
		}
		return fs;
	},
	/**
	 * CheckboxSelectionModel 取消选中事件
	 */
	onRowdeselect : function(sm, i, record) {
		this.smSelections.removeKey(record.id);
	},
	/**
	 * CheckboxSelectionModel 选中事件
	 */
	onRowselect : function(sm, i, record) {
		if (sm.singleSelect === true) {
			this.smSelections.clear();
		}
		this.smSelections.add(record);
	},
	/**
	 * @event grid is refreshed
	 */
	onViewRefresh : function() {
		var sm = this.getSelectionModel(), smSelections = this.smSelections;
		// reject Modified records On view Refreshing
		// 再次选中
		if (this.keepSelection) {
			var currrentSelection = [], store = this.store, fr;
			smSelections.each(function(record) {
				if (fr = store.getById(record.id)) {
					currrentSelection.push(store.indexOf(fr));
					smSelections.add(fr);// update the
					// record;
				}
			});
			if (currrentSelection.length > 0) {
				sm.selectRows(currrentSelection, true);
			}
		} else {
			smSelections.clear();// 清除,当只有一条数据时候修改会触发refresh
			// 事件所以有了下面的代码
			if (sm instanceof Ext.grid.RowSelectionModel) {
				var rs = sm.getSelections();
				for (var i = 0; i < rs.length; i++) {
					smSelections.add(rs[i]);
				}
			}
		}

	},
	/**
	 * 
	 * @param {array}
	 *            dest 接受者
	 * @param {array}
	 *            src 源值
	 */
	mergeColumns : function(dest, src) {
		var srcMap = this.mappingArray(src, this.columnKeyFn), destMap = this.mappingArray(dest, this.columnKeyFn), mergeMap, merge = [];
		mergeMap = Ext.applyAll(destMap, srcMap);
		for (p in mergeMap) {
			merge.push(mergeMap[p]);
		}
		return merge;
	},
	columnKeyFn : function(obj, i) {
		return obj.name;
	},
	mappingArray : function(array, keyFn) {
		var map = {}, i;
		for (i = 0; i < array.length; i++) {
			map[keyFn(array[i], i)] = array[i];
		}
		return map;
	},
	insertFirst : function(data) {
		return this.insertAt(data, 0);
	},
	insertBefore : function(data, beforeRecord) {
		beforeRecord = beforeRecord || this.getSelected();
		var i = this.store.indexOf(beforeRecord);
		if (i < 0) {
			throw new Error("找不到前面的记录");
			return;
		}
		this.insertAt(data, i);
	},
	insertAfter : function(data, afterRecord) {
		afterRecord = afterRecord || this.getSelected();
		var i = this.store.indexOf(afterRecord);
		if (i < 0) {
			throw new Error("找不到后面的记录");
			return;
		}
		i = i + 1;
		this.insertAt(data, i);
	},
	insertLast : function(data) {
		return this.insertAt(data, this.store.getCount());
	},
	insertAt : function(data, i) {
		var r = this.createRecord(data);
		r.isNew = true;
		this.stopEditing();
		this.store.insert(i, r);
		this.dataMap.inserted.push(r);
		// this.startEditing(i, 0);
		this.fireEvent('recordchage', this, r);
	},
	createRecord : function(data) {
		data = data || {};
		if (data instanceof Ext.data.Record) {
			return data;
		} else {
			return new this.store.reader.recordType(data);
		}
	},
	deleteRow : function(record) {
		this.stopEditing();
		record = record || this.getSelected();
		if (!record.isNew) {
			this.dataMap.deleted.push(record);
			this.dataMap.updated.remove(record);// delete updated
			// record;
		} else {
			this.dataMap.inserted.remove(record);// delete add
		}
		this.smSelections.remove(record);
		this.store.remove(record);
		this.fireEvent('recordchage', this, record);
	},
	getValue : function() {
		this.stopEditing();
		var data = {
			"insert" : [],
			"update" : [],
			"delete" : []
		}, dataMap = this.dataMap, me = this;
		Ext.each(dataMap.inserted, function(v) {
			data["insert"].push(me.parseRecord(v));
		});
		Ext.each(dataMap.updated, function(v) {
			data["update"].push(me.parseRecord(v));
		});
		Ext.each(dataMap.deleted, function(v) {
			data["delete"].push(me.parseRecord(v));
		});
		data.insertLength = data["insert"].length;
		data.updateLength = data["update"].length;
		data.deleteLength = data["delete"].length;
		data.length = data.insertLength + data.updateLength + data.deleteLength;
		return data;
	},
	reset : function() {
		delete this.dataMap;
		delete this.updateCache;
		this.dataMap = {
			inserted : [],
			updated : [],
			deleted : []
		};
	},
	parseRecord : function(record) {
		var v = {}, fs = record.fields.items, f, i;
		for (i = 0; i < fs.length; i++) {
			f = fs[i];
			v[f.name] = f.convert((record.get(f.name) !== undefined) ? record.get(f.name) : f.defaultValue);
		}
		return v;
	},
	onStoreReload : function(store, rs, options) {
		if (options.add !== true) {
			this.reset();
		}
	},
	onUpdate : function(Store, record, operation) {
		var updateCache = this.updateCache || {};
		if (Ext.data.Record.EDIT == operation) {
			if (!record.isNew && !updateCache[record.id]) {
				this.dataMap.updated.push(record);
				updateCache[record.id] = true;
				this.fireEvent('recordchage', this, record);
			}
		}
		this.updateCache = updateCache;
	},
	getSelections : function() {
		return this.smSelections.items;
	},
	getSelected : function() {
		return this.smSelections.items.length > 0 ? this.smSelections.items[0] : undefined;
	},
	hasSelection : function() {
		return this.smSelections.items.length > 0;
	},
	clearSelections : function() {
		this.getSelectionModel().clearSelections();
		this.smSelections.clear();
	},
	viewConfig : {
		emptyText : '没有可显示的数据'
	},
	// 验证模块
	isModifiedRecordsValid : function() {
		var dataMap = this.dataMap;
		return this.isValid([].concat(dataMap.inserted).concat(dataMap.updated));
	},
	isValid : function(records) {
		var config = this.colModel.config, cfg = [], i = 0, ok = true, ed;
		for (i = 0; i < config.length; i++) {
			ed = config[i].getEditor();
			if (ed) {
				cfg.push({
					field : ed,
					dataIndex : config[i].dataIndex,
					id : config[i].id
				});
			}
		}
		var v = this.getValue(), msg, me = this, cell, div, tmpValue;
		records = records || this.store.getRange();
		Ext.each(records, function(record, j) {
			for (i = 0; i < cfg.length; i++) {
				tmpValue = record.get(cfg[i].dataIndex);
				if (tmpValue == undefined || tmpValue == null) {
					tmpValue = '';
				} else {
					tmpValue = tmpValue;
				}
				cfg[i].field.fireEvent("before_record_validate", record);
				if (!cfg[i].field.validateValue(tmpValue)) {
					msg = cfg[i].field.errorMsg;
					// console.log(cfg[i].dataIndex);
					// console.log(record.get(cfg[i].dataIndex));
					cell = me.getView().getCell(j, me.colModel.getIndexById(cfg[i].id));
					div = cell.firstChild;
					cell.qtip = msg;
					cell.qclass = 'x-form-invalid-tip';
					if (div) {
						div.qtip = msg;
						div.qclass = 'x-form-invalid-tip';
					}
					Ext.fly(cell).addClass('x-form-invalid');
					ok = false;
				}
			}
		});
		return ok;
	},
	setParam : function(name, value) {
		var params = this.store.baseParams;
		if (value !== false && value !== null && value !== undefined && value !== '') {
			params[name] = value;
		} else {
			if (Ext.type(name) == 'object') {
				Ext.apply(this.store.baseParams, name);
			}
		}
	},
	toSearch : function(name, value, cb) {
		var me=this;
		var params = this.store.baseParams;
		if ( value !== null && value !== undefined && value !== '') {
			params[name] = String(value);
		} else {
			if (Ext.type(name) == 'object') {
				this.store.baseParams = name;
			} else if (Ext.type(name) == 'string') {
				delete params[name];
			}
		}
		// fix not display loading msg
		setTimeout(function(){
			me.store.load({
				params : {
					start : 0,
					limit:me.pageSize
				},
				callback : cb || Ext.emptyFn
			});				
		},0);
	},
	toSearchToolbar : function(toolbar) {
		var v = {};
		var findValue = function(tb, value) {
			if (tb.items) {
				tb.items.each(function(item) {
					if (Ext.type(item.getValue) == 'function') {
						value[item.name || item.id || Ext.id()] = item.getValue();
					} else if (item instanceof Ext.Container) {
						findValue(item, value);
					}

				});
			}
		};
		findValue(toolbar, v);
		this.toSearch(v);
	},
	getView : function() {
		if (!this.view) {
			this.view = new Ext.ui.XGridView(this.viewConfig);
		}
		return this.view;
	}
});


Ext.reg('xgrid', Ext.ui.XGridPanel);
// make the cell selectable

Ext.grid.GridView.prototype.cellTpl = new Ext.Template('<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} x-selectable {css}" style="{style}" tabIndex="0" {cellAttr}>',
		'<div class="x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>', '</td>');

Ext.ui.XGridView = Ext.extend(Ext.grid.GridView, {
	
});

// 解决 focusEl 导致grid view 自动滚动
Ext.override(Ext.grid.RowSelectionModel, {
	handleMouseDown : function(g, rowIndex, e) {
		if (e.button !== 0 || this.isLocked()) {
			return;
		};
		var view = this.grid.getView();
		if (e.shiftKey && !this.singleSelect && this.last !== false) {
			var last = this.last;
			this.selectRange(last, rowIndex, e.ctrlKey);
			this.last = last; // reset the last
			view.focusRow(rowIndex);
		} else {
			var isSelected = this.isSelected(rowIndex);
			if (e.ctrlKey && isSelected) {
				this.deselectRow(rowIndex);
			} else if (!isSelected || this.getCount() > 1) {
				this.selectRow(rowIndex, e.ctrlKey || e.shiftKey);
				// view.focusRow(rowIndex); // 这个导致grid SB滚动
			}
		}
	}
});

// 解决编辑字段blur bug 问题
(function() {
	var onRender = Ext.Editor.prototype.onRender;
	var beforeDestroy = Ext.Editor.prototype.beforeDestroy;

	// differ form ext2.3 ; here use missingBlur to flag the state
	Ext.override(Ext.Editor, {
		missingBlur : false,
		onBlur : function() {
			if (this.allowBlur === true && this.editing && this.selectSameEditor !== true) {
				var event = Ext.EventObject;
				if (!event.within(this.el) && !(this.field.list && event.within(this.field.list))) {
					this.completeEdit();
					this.missingBlur = false;
				} else {
					this.missingBlur = true;
				}
			}
		},
		onRender : function() {
			onRender.apply(this, arguments);
			Ext.getBody().on("click", this.docBodyClick, this);
		},
		docBodyClick : function(event) {
			if (this.missingBlur === true) {
				this.onBlur();
			}
		},
		beforeDestroy : function() {
			beforeDestroy.apply(this, arguments);
			Ext.getBody().removeListener("click", this.docBodyClick, this);

		}
	});

})();

Ext.override(Ext.grid.EditorGridPanel, {
	onEditComplete : function(ed, value, startValue) {
		this.editing = false;
		this.lastActiveEditor = this.activeEditor;
		this.activeEditor = null;

		var r = ed.record, field = this.colModel.getDataIndex(ed.col);
		value = this.postEditValue(value, startValue, r, field);
		if (this.forceValidation === true || String(value) !== String(startValue)) {
			var e = {
				grid : this,
				record : r,
				field : field,
				originalValue : startValue,
				value : value,
				row : ed.row,
				column : ed.col,
				cancel : false
			};
			if (this.fireEvent("validateedit", e) !== false && !e.cancel && String(value) !== String(startValue)) {
				r.set(field, e.value);
				delete e.cancel;
				ed.field.fireEvent('afteredit', ed.field, r);
				// ed.field.reset();
				this.fireEvent("afteredit", e);
			}
		}
		this.view.focusCell(ed.row, ed.col);

	}
});
