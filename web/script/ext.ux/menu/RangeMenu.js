Ext.namespace("Ext.ux.menu");
Ext.ux.menu.RangeMenu = function() {
	Ext.ux.menu.RangeMenu.superclass.constructor.apply(this, arguments);
	this.updateTask = new Ext.util.DelayedTask(this.fireUpdate, this);

	var cfg = this.fieldCfg;
	var cls = this.fieldCls;

	// zlh 2008-07-23 屏蔽以下语句
	// 增加“按绝对值过滤”复选框，zlh 2008-07-09 增加
	/*
	 * var abs = this.abs = new Ext.menu.CheckItem({ //id:
	 * "col-"+cm.getColumnId(i), text: "按绝对值过滤", checked: false,
	 * hideOnClick:false //disabled: cm.config[i].hideable === false });
	 * this.add(abs);
	 */

	/**
	 * zlh 2008-11-12 修改 增加 “仅显示空值”，“仅显示非空值”过滤
	 */
	var rid="radio_nv"+Math.round(Math.random()*10000);
	var fields = this.fields = Ext.applyIf(this.fields || {}, {
		'gt' : new Ext.ux.menu.EditableItem({
			icon : this.icons.gt,
			editor : new cls(typeof cfg == "object" ? cfg.gt || '' : cfg)
		}),
		'lt' : new Ext.ux.menu.EditableItem({
			icon : this.icons.lt,
			editor : new cls(typeof cfg == "object" ? cfg.lt || '' : cfg)
		}),
		'ueq' : new Ext.ux.menu.EditableItem({
			icon : this.icons.ueq,
			editor : new cls(typeof cfg == "object" ? cfg.ueq || '' : cfg)
		}),// 不等于
		'gteq' : new Ext.ux.menu.EditableItem({
			icon : this.icons.gteq,
			editor : new cls(typeof cfg == "object" ? cfg.gteq || '' : cfg)
		}),// 大于等于
		'lteq' : new Ext.ux.menu.EditableItem({
			icon : this.icons.lteq,
			editor : new cls(typeof cfg == "object" ? cfg.lteq || '' : cfg)
		}),// 小于等于
		'eq' : new Ext.ux.menu.EditableItem({
			icon : this.icons.eq,
			editor : new cls(typeof cfg == "object" ? cfg.gt || '' : cfg)
		}),
		'nullvalue' : new Ext.ux.menu.RadioItem({
			icon : null,
			editor : new Ext.form.Radio({
				labelSeparator : '',
				name:rid,
				checked : false,
				boxLabel : '&nbsp;仅显示空值',
				value : '1'
			})
		}),
		'notnullvalue' : new Ext.ux.menu.RadioItem({
			icon : null,
			editor : new Ext.form.Radio({
				labelSeparator : '',
				name:rid,
				checked : false,
				boxLabel : '&nbsp;仅显示非空值',
				value : '0'
			})
		})
	});
	this.add(fields.gt, fields.lt, fields.ueq, fields.gteq, fields.lteq, '-',
			fields.eq, "-", fields.nullvalue, fields.notnullvalue);

	/*
	 * for(var key in fields) fields[key].on('keyup', function(event, input,
	 * notSure, field){ if(event.getKey() == event.ENTER && field.isValid()){
	 * this.hide(true); this.updateTask.delay(10); return; }else{ if(field ==
	 * fields.eq){ fields.gt.setValue(null); fields.lt.setValue(null);
	 * fields.ueq.setValue(null); fields.gteq.setValue(null);
	 * fields.lteq.setValue(null); } else { fields.eq.setValue(null); }
	 * this.updateTask.delay(this.updateBuffer); }
	 * //this.updateTask.delay(this.updateBuffer); }.createDelegate(this,
	 * [fields[key]], true));
	 */

	// 设置 gt,lt,ueq,gteq,lteq,eq 的按键事件
	var keys = new Array('gt', 'lt', 'ueq', 'gteq', 'lteq', 'eq');

	for (i = 0; i < keys.length; i++) {
		fields[keys[i]].on('keyup', function(event, input, notSure, field) {
			if (event.getKey() == event.ENTER && field.isValid()) {
				this.hide(true);
				this.updateTask.delay(10);
				return;
			} else {
				if (field == fields.eq) {
					fields.gt.setValue(null);
					fields.lt.setValue(null);
					fields.ueq.setValue(null);
					fields.gteq.setValue(null);
					fields.lteq.setValue(null);
				} else {
					fields.eq.setValue(null);
				}

				fields.nullvalue.setValue(null);// 清除'仅显示空值'的选中状态
				fields.notnullvalue.setValue(null);// 清除'仅显示非空值'的选中状态

				this.updateTask.delay(this.updateBuffer);
			}
				// this.updateTask.delay(this.updateBuffer);
			}.createDelegate(this, [fields[keys[i]]], true));
	}

	// 设置nullvalue 和 notnullvalue 的单击事件
	keys = new Array('nullvalue', 'notnullvalue');

	for (i = 0; i < keys.length; i++) {
		fields[keys[i]].editor.on('check', function(field, event) {
			if (field.getValue() == true && field.isValid()) {
				// zlh 2008-11-18 屏蔽以下一句，不隐藏菜单
				// this.hide(true);//选中单选框后隐藏填写过滤值的菜单
				this.updateTask.delay(5);

				fields.gt.setValue(null);// 清除gt的值
				fields.lt.setValue(null);// 清除lt的值
				fields.ueq.setValue(null);// 清除ueq的值
				fields.gteq.setValue(null);// 清除gteq的值
				fields.lteq.setValue(null);// 清除lteq的值
				fields.eq.setValue(null);// 清除eq的值
				return;
			} else {
				this.updateTask.delay(this.updateBuffer);// 选中“过滤”复选框(此处不需要取消选中“过滤”复选框，因为单选按钮总有一个被选中，而文本框可以内容为空值)
			}
				// this.updateTask.delay(this.updateBuffer);
				// }.createDelegate(this, [fields.nullvalue], true)//zlh
				// 2008-12-30 屏蔽
			}.createDelegate(this, [fields[keys[i]]], true)// zlh 2008-12-30 增加
				);
	}

	this.addEvents({
		'update' : true
	});
};
Ext.extend(Ext.ux.menu.RangeMenu, Ext.menu.Menu, {
	fieldCls : Ext.form.NumberField,
	fieldCfg : '',
	updateBuffer : 1000,
	icons : {
		gt : Lbx.consts.uxPath + '/img/greater_then.png',
		lt : Lbx.consts.uxPath + '/img/less_then.png',
		ueq : Lbx.consts.uxPath + '/img/unequalto.png',
		gteq : Lbx.consts.uxPath + '/img/greater_equals_then.png',
		lteq : Lbx.consts.uxPath + '/img/less_equals_then.png',
		eq : Lbx.consts.uxPath + '/img/equals.png'
	},

	fireUpdate : function() {
		this.fireEvent("update", this);
	},

	setValue : function(data) {
		for (var key in this.fields)
			this.fields[key].setValue(data[key] !== undefined ? data[key] : '');

		this.fireEvent("update", this);
	},

	getValue : function() {
		var result = {};
		for (var key in this.fields) {
			var field = this.fields[key];
			if (field.isValid() && String(field.getValue()).length > 0)
				result[key] = field.getValue();
		}

		return result;
	}/*
		 * ,
		 * 
		 * getAbsValue: function(){//获得“按绝对值过滤”复选框的值，zlh 2008-07-09 增加 return
		 * this.abs.checked; }
		 */// zlh 2008-07-23 屏蔽以上语句
});