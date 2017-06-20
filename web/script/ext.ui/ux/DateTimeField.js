// 不能单据使用，必先引用 Ext.ux.form.Spinner
Ext.ns('Ext.ux.form');
Ext.ns('Ext.ui');
Ext.ux.form.DateTimePicker = function(config) {
	Ext.ux.form.DateTimePicker.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.form.DateTimePicker, Ext.DatePicker, {
	hourText : '时',
	minuteText : '分',
	spinnerCfg : {
		width : 50
	},
	initComponent : function() {
		Ext.DatePicker.superclass.initComponent.call(this);
		this.value = this.value ? this.value : new Date();
		this.addEvents('select');
		if (this.handler) {
			this.on("select", this.handler, this.scope || this);
		}
		this.initDisabledDays();
	},
	selectToday : function() {
		this.getHourAndMinuteValue();
		this.setValue(new Date());
		this.value.setHours(this.theHours);
		this.value.setMinutes(this.theMinutes);
		this.fireEvent("select", this, this.value);
	},
	handleDateClick : function(e, t) {
		e.stopEvent();
		if (t.dateValue && !Ext.fly(t.parentNode).hasClass("x-date-disabled")) {
			this.getHourAndMinuteValue();
			this.value = new Date(t.dateValue);
			this.value.setHours(this.theHours);
			this.value.setMinutes(this.theMinutes);
			this.setValue(this.value);
			this.fireEvent("select", this, this.value);
		}
	},
	onRender : function(container, position) {
		var m = ['<table cellspacing="0" width="200px">',
				'<tr><td colspan="3"><table cellspacing="0" width="100%"><tr><td class="x-date-left"><a href="#" title="', this.prevText,
				'">&#160;</a></td><td class="x-date-middle" align="center"></td><td class="x-date-right"><a href="#" title="', this.nextText,
				'">&#160;</a></td></tr></table></td></tr>', '<tr><td colspan="3"><table class="x-date-inner" cellspacing="0"><thead><tr>'];
		var dn = this.dayNames;
		for (var i = 0; i < 7; i++) {
			var d = this.startDay + i;
			if (d > 6) {
				d = d - 7;
			}
			m.push("<th><span>", dn[d].substr(0, 1), "</span></th>");
		}
		m[m.length] = "</tr></thead><tbody><tr>";
		for (i = 0; i < 42; i++) {
			if (i % 7 === 0 && i !== 0) {
				m[m.length] = "</tr><tr>";
			}
			m[m.length] = '<td><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span></span></em></a></td>';
		}

		m[m.length] = '</tr></tbody></table></td></tr><tr><td class="minutecss" colspan="3" align="center"><table cellspacing="0" ><tr>';
		m[m.length] = '<td class="x-hour"></td><td> &nbsp; ' + this.hourText + '</td><td width ="5px"></td><td class="x-minute"></td><td>&nbsp;'
				+ this.minuteText + '</td>';
		m[m.length] = '</tr></table></td></tr><tr><td width="50%"  colspan="2" class="x-date-bottom" align="right"></td><td width="50%" class="x-date-bottom" align="left"></td></tr></table><div class="x-date-mp"></div>';

		var el = document.createElement("div");
		el.className = "x-date-picker";
		el.innerHTML = m.join("");

		container.dom.insertBefore(el, position);

		this.el = Ext.get(el);
		this.eventEl = Ext.get(el.firstChild);

		this.leftClickRpt = new Ext.util.ClickRepeater(this.el.child("td.x-date-left a"), {
			handler : this.showPrevMonth,
			scope : this,
			preventDefault : true,
			stopDefault : true
		});

		this.rightClickRpt = new Ext.util.ClickRepeater(this.el.child("td.x-date-right a"), {
			handler : this.showNextMonth,
			scope : this,
			preventDefault : true,
			stopDefault : true
		});

		var cfg = Ext.apply({}, this.spinnerCfg, {
			readOnly : this.readOnly,
			disabled : this.disabled,
			align : 'right',
			selectOnFocus : true,
			listeners : {
				spinup : {
					fn : this.onSpinnerChange,
					scope : this
				},
				spindown : {
					fn : this.onSpinnerChange,
					scope : this
				},
				change : {
					fn : this.onSpinnerChange,
					scope : this
				}
			}
		});
		this.hoursSpinner = new Ext.form.SpinnerField(Ext.apply({}, cfg, {
			renderTo : this.el.child("td.x-hour", true),
			minValue : 0,
			maxValue : 23,
			cls : 'first',
			value : this.theHours
		}));
		this.minutesSpinner = new Ext.form.SpinnerField(Ext.apply({}, cfg, {
			renderTo : this.el.child("td.x-minute", true),
			minValue : 0,
			maxValue : 59,
			value : this.theMinutes
		}));

		this.eventEl.on("mousewheel", this.handleMouseWheel, this);

		this.monthPicker = this.el.down('div.x-date-mp');
		this.monthPicker.enableDisplayMode('block');

		var kn = new Ext.KeyNav(this.eventEl, {
			"left" : function(e) {
				e.ctrlKey ? this.showPrevMonth() : this.update(this.activeDate.add("d", -1));
			},

			"right" : function(e) {
				e.ctrlKey ? this.showNextMonth() : this.update(this.activeDate.add("d", 1));
			},

			"up" : function(e) {
				e.ctrlKey ? this.showNextYear() : this.update(this.activeDate.add("d", -7));
			},

			"down" : function(e) {
				e.ctrlKey ? this.showPrevYear() : this.update(this.activeDate.add("d", 7));
			},

			"pageUp" : function(e) {
				this.showNextMonth();
			},

			"pageDown" : function(e) {
				this.showPrevMonth();
			},

			"enter" : function(e) {
				e.stopPropagation();
				return true;
			},

			scope : this
		});

		this.eventEl.on("click", this.handleDateClick, this, {
			delegate : "a.x-date-date"
		});

		this.todayKeyListener = this.eventEl.addKeyListener(Ext.EventObject.SPACE, this.selectToday, this);

		this.el.unselectable();

		this.cells = this.el.select("table.x-date-inner tbody td");
		this.textNodes = this.el.query("table.x-date-inner tbody span");

		this.mbtn = new Ext.Button({
			text : "&#160;",
			tooltip : this.monthYearText,
			renderTo : this.el.child("td.x-date-middle", true)
		});
        this.mbtn.el.child('em').addClass('x-btn-arrow');
		this.mbtn.on('click', this.showMonthPicker, this);
		this.mbtn.el.child(this.mbtn.menuClassTarget).addClass("x-btn-with-menu");

		var dt1 = new Date();
		var txt = '';
		this.theHours = dt1.getHours();
		if (this.theHours < 10) {
			txt = '0' + this.theHours;
		} else {
			txt = this.theHours;
		}
		this.hoursSpinner.setValue(txt);

		this.theMinutes = dt1.getMinutes();
		if (this.theMinutes < 10) {
			txt = '0' + this.theMinutes;
		} else {
			txt = this.theMinutes;
		}
		this.minutesSpinner.setValue(txt);

		var today = (new Date()).dateFormat(this.format);
		this.todayBtn = new Ext.Button({
			renderTo : this.el.child("td.x-date-bottom:nth(1)", true),
			text : String.format(this.todayText, today),
			tooltip : String.format(this.todayTip, today),
			handler : this.selectToday,
			scope : this
		});

		this.okBtn = new Ext.Button({
			renderTo : this.el.child("td.x-date-bottom:nth(2)", true),
			text : this.okText,
			handler : this.toSelect,
			scope : this
		});
		if (Ext.isIE) {
			this.el.repaint();
		}
		this.update(this.value);
	},
	toSelect : function() {	
		this.getHourAndMinuteValue();
		this.value = this.getValue() || new Date();
		this.value.setHours(this.theHours);
		this.value.setMinutes(this.theMinutes);
		this.setValue(this.value);
		this.fireEvent("select", this, this.value);
	},

	onSpinnerChange : function() {
		if (!this.rendered) {
			return;
		}
		this.fireEvent('change', this, this.getHourAndMinuteValue());
	},
	getHourAndMinuteValue : function() {
		this.theHours = this.hoursSpinner.getValue();
		this.theMinutes = this.minutesSpinner.getValue();
	},
	setHourAndMinute : function(dt1) {
		var txt = '';
		this.theHours = dt1.getHours();
		if (this.theHours < 10) {
			txt = '0' + this.theHours;
		} else {
			txt = this.theHours;
		}
		this.hoursSpinner.setValue(txt);

		this.theMinutes = dt1.getMinutes();
		if (this.theMinutes < 10) {
			txt = '0' + this.theMinutes;
		} else {
			txt = this.theMinutes;
		}
		this.minutesSpinner.setValue(txt);
	},
	setValue : function(value) {
		var bak = new Date(value.getTime());
		this.value = value;
		if (this.el) {
			this.update(new Date(this.value.getTime()));
		}
		var me = this;
		setTimeout(function() {
			me.setHourAndMinute(bak);
		}, 51);
	},
	// private
	update : function(date, forceRefresh) {
		var vd = this.activeDate, vis = this.isVisible();
		this.activeDate = date;
		if (!forceRefresh && vd && this.el) {
			var t = new Date(date.getTime()).clearTime().getTime();
			if (vd.getMonth() == date.getMonth() && vd.getFullYear() == date.getFullYear()) {
				this.cells.removeClass("x-date-selected");
				this.cells.each(function(c) {
					if (c.dom.firstChild.dateValue == t) {
						c.addClass("x-date-selected");
						if (vis) {
							setTimeout(function() {
								try {
									c.dom.firstChild.focus();
								} catch (e) {
								}
							}, 50);
						}
						return false;
					}
				});
				return;
			}
		}
		var days = date.getDaysInMonth();
		var firstOfMonth = date.getFirstDateOfMonth();
		var startingPos = firstOfMonth.getDay() - this.startDay;

		if (startingPos < 0) {
			startingPos += 7;
		}

		var pm = date.add("mo", -1);
		var prevStart = pm.getDaysInMonth() - startingPos;

		var cells = this.cells.elements;
		var textEls = this.textNodes;
		days += startingPos;

		// convert everything to numbers so it's fast
		var day = 86400000;
		var d = (new Date(pm.getFullYear(), pm.getMonth(), prevStart)).clearTime();
		var today = new Date().clearTime().getTime();
		var sel = date.clearTime().getTime();
		var min = this.minDate ? this.minDate.clearTime() : Number.NEGATIVE_INFINITY;
		var max = this.maxDate ? this.maxDate.clearTime() : Number.POSITIVE_INFINITY;
		var ddMatch = this.disabledDatesRE;
		var ddText = this.disabledDatesText;
		var ddays = this.disabledDays ? this.disabledDays.join("") : false;
		var ddaysText = this.disabledDaysText;
		var format = this.format;

		if (this.showToday) {
			var td = new Date().clearTime();
			var disable = (td < min || td > max || (ddMatch && format && ddMatch.test(td.dateFormat(format))) || (ddays && ddays.indexOf(td.getDay()) != -1));

			if (!this.disabled) {
				this.todayBtn.setDisabled(disable);
				this.todayKeyListener[disable ? 'disable' : 'enable']();
			}
		}

		var setCellClass = function(cal, cell) {
			cell.title = "";
			var t = d.getTime();
			cell.firstChild.dateValue = t;
			if (t == today) {
				cell.className += " x-date-today";
				cell.title = cal.todayText;
			}
			if (t == sel) {
				cell.className += " x-date-selected";
				if (vis) {
					setTimeout(function() {
						try {
							cell.firstChild.focus();
						} catch (e) {
						}
					}, 50);
				}
			}
			// disabling
			if (t < min) {
				cell.className = " x-date-disabled";
				cell.title = cal.minText;
				return;
			}
			if (t > max) {
				cell.className = " x-date-disabled";
				cell.title = cal.maxText;
				return;
			}
			if (ddays) {
				if (ddays.indexOf(d.getDay()) != -1) {
					cell.title = ddaysText;
					cell.className = " x-date-disabled";
				}
			}
			if (ddMatch && format) {
				var fvalue = d.dateFormat(format);
				if (ddMatch.test(fvalue)) {
					cell.title = ddText.replace("%0", fvalue);
					cell.className = " x-date-disabled";
				}
			}
		};

		var i = 0;
		for (; i < startingPos; i++) {
			textEls[i].innerHTML = (++prevStart);
			d.setDate(d.getDate() + 1);
			cells[i].className = "x-date-prevday";
			setCellClass(this, cells[i]);
		}
		for (; i < days; i++) {
			var intDay = i - startingPos + 1;
			textEls[i].innerHTML = (intDay);
			d.setDate(d.getDate() + 1);
			cells[i].className = "x-date-active";
			setCellClass(this, cells[i]);
		}
		var extraDays = 0;
		for (; i < 42; i++) {
			textEls[i].innerHTML = (++extraDays);
			d.setDate(d.getDate() + 1);
			cells[i].className = "x-date-nextday";
			setCellClass(this, cells[i]);
		}

		this.mbtn.setText(this.monthNames[date.getMonth()] + " " + date.getFullYear());

		if (!this.internalRender) {
			var main = this.el.dom.firstChild;
			var w = main.offsetWidth;
			this.el.setWidth(w + this.el.getBorderWidth("lr"));
			Ext.fly(main).setWidth(w);
			this.internalRender = true;
			// opera does not respect the auto grow header center column
			// then, after it gets a width opera refuses to recalculate
			// without a second pass
			if (Ext.isOpera && !this.secondPass) {
				main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth + main.rows[0].cells[2].offsetWidth)) + "px";
				this.secondPass = true;
				this.update.defer(10, this, [date]);
			}
		}
	}
});




Ext.ux.form.DateTimeMenu=Ext.extend(Ext.menu.DateMenu,{
    initComponent : function(){
        this.on('beforeshow', this.onBeforeShow, this);
        if(this.strict = (Ext.isIE7 && Ext.isStrict)){
            this.on('show', this.onShow, this, {single: true, delay: 20});
        }
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: this.picker = new Ext.ux.form.DateTimePicker(Ext.applyIf({
                internalRender: this.strict || !Ext.isIE9m,
                ctCls: 'x-menu-date-item',
                id: this.pickerId
            }, this.initialConfig))
        });
        this.picker.purgeListeners();
        Ext.menu.DateMenu.superclass.initComponent.call(this);
        /**
         * @event select
         * Fires when a date is selected from the {@link #picker Ext.DatePicker}
         * @param {DatePicker} picker The {@link #picker Ext.DatePicker}
         * @param {Date} date The selected date
         */
        this.relayEvents(this.picker, ['select']);
        this.on('show', this.picker.focus, this.picker);
        this.on('select', this.menuHide, this);
        if(this.handler){
            this.on('select', this.handler, this.scope || this);
        }
    }
});

Ext.ui.DateTimeField = Ext.extend(Ext.form.DateField, {
	constructor : function(config) {
		config = config || {};
		Ext.applyIf(config, {
			menu : new Ext.ux.form.DateTimeMenu()
		});
		Ext.ui.DateTimeField.superclass.constructor.call(this, config);
	}
});

Ext.reg('datetimefield', Ext.ui.DateTimeField);