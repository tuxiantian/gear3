Ext.apply(Ext.form.VTypes, {
	daterange : function(val, field) {
		var date = field.parseDate(val);
		// We need to force the picker to update values to recaluate the
		// disabled dates display
		var dispUpd = function(picker) {
			var ad = picker.activeDate;
			picker.activeDate = null;
			picker.update(ad);
		};

		if (field.startDateField) {
			var sd = Ext.getCmp(field.startDateField);
			sd.maxValue = date;
			if (sd.menu && sd.menu.picker) {
				sd.menu.picker.maxDate = date;
				dispUpd(sd.menu.picker);
			}
		} else if (field.endDateField) {
			var ed = Ext.getCmp(field.endDateField);
			ed.minValue = date;
			if (ed.menu && ed.menu.picker) {
				ed.menu.picker.minDate = date;
				dispUpd(ed.menu.picker);
			}
		}
		return true;
	},

	password : function(val, field) {
		if (field.initialPassField) {
			var pwd = Ext.getCmp(field.initialPassField);
			return (val == pwd.getValue());
		}
		return true;
	},
	passwordText : '两次输入的密码不一致！',

	chinese : function(val, field) {
		var reg = /^[\u4e00-\u9fa5]+$/i;
		if (!reg.test(val)) {
			return false;
		}
		return true;
	},
	chineseText : '请输入中文',

	datecn : function(val, field) {
		try {
			var regex = /^(\d{4})-(\d{2})-(\d{2})$/;
			if (!regex.test(val))
				return false;
			var d = new Date(val.replace(regex, '$1/$2/$3'));
			return (parseInt(RegExp.$2, 10) == (1 + d.getMonth())) && (parseInt(RegExp.$3, 10) == d.getDate())
					&& (parseInt(RegExp.$1, 10) == d.getFullYear());
		} catch (e) {
			return false;
		}
	},
	datecnText : '请使用这样的日期格式: yyyy-mm-dd. 例如:2008-06-20.',

	ip : function(val, field) {
		try {
			if ((/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val)))
				return true;
			return false;
		} catch (e) {
			return false;
		}
	},
	ipText : '请输入正确的IP地址',

	phone : function(val, field) {
		try {
			if (/^(?:\d{3}-\d{8}|\d{4}-\d{7})$/.test(val))
				return true;
			return false;
		} catch (e) {
			return false;
		}
	},
	phoneText : '请输入正确的电话号码,如:027-29392929',

	mobilephone : function(val, field) {
		try {
			if (/^(?:13|15|18)\d{9}$/.test(val))
				return true;
			return false;
		} catch (e) {
			return false;
		}
	},
	mobilephoneText : '请输入正确的11位手机号码'
});
