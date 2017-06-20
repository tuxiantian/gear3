Ext.ns('Ext.ux.grid');
Ext.ux.grid.GridSummary = function(config) {
	Ext.apply(this, config);
};
Ext.extend(Ext.ux.grid.GridSummary, Ext.util.Observable, {
	init : function(grid) {
		this.grid = grid;
		this.cm = grid.getColumnModel();
		this.view = grid.getView();

		var v = this.view;

		// override GridView's onLayout() method
		v.onLayout = this.onLayout;
		v.afterMethod('render', this.refreshSummary, this);
		v.afterMethod('refresh', this.refreshSummary, this);
		// v.afterMethod('syncScroll', this.syncSummaryScroll, this);
		v.afterMethod('onColumnWidthUpdated', this.doWidth, this);
		v.afterMethod('onAllColumnWidthsUpdated', this.doAllWidths, this);
		v.afterMethod('onColumnHiddenUpdated', this.doHidden, this);

		// update summary row on store's add/remove/clear/update events
		grid.store.on({
			add : this.refreshSummary,
			remove : this.refreshSummary,
			clear : this.refreshSummary,
			update : this.refreshSummary,
			scope : this
		});

		if (!this.rowTpl) {
			this.rowTpl = new Ext.Template(
					'<div           style="overflow-x:hidden;"      class="x-grid3-summary-row ,x-grid3-gridsummary-row-offset" >',
					'<table class="x-grid3-summary-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
					'<tbody><tr>{cells}</tr></tbody>', '</table>', '</div>');
			this.rowTpl.disableFormats = true;
		}
		this.rowTpl.compile();
		if (!this.cellTpl) {
			this.cellTpl = new Ext.Template('<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}">',
					'<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>', "</td>");
			this.cellTpl.disableFormats = true;
		}
		this.cellTpl.compile();
	},

	calculate : function(rs, cm) {
		var data = {}, cfg = cm.config;
		// loop through all columns in ColumnModel
		for (var i = 0, len = cfg.length; i < len; i++) {
			var cf = cfg[i], // get column's configuration
			cname = cf.dataIndex; // get column dataIndex
			// initialise grid summary row data for the current column being
			// worked on
			data[cname] = 0;
			if (cf.summaryType) {
				for (var j = 0, jlen = rs.length; j < jlen; j++) {
					var r = rs[j]; // get a single Record

					data[cname] = Ext.ux.grid.GridSummary.Calculations[cf.summaryType](r.get(cname), r, cname, data, j);

				}
			}
		}
		return data;
	},

	onLayout : function(vw, vh) {
		if (Ext.type(vh) != 'number') { // handles grid's height:'auto' config
			return;
		}
		// note: this method is scoped to the GridView
		if (!this.grid.getGridEl().hasClass('x-grid-hide-gridsummary')) {
			// readjust gridview's height only if grid summary row is visible
			this.scroller.setHeight(vh - this.summary.getHeight());
		}
	},

	syncSummaryScroll : function() {

		var mb = this.view.scroller.dom;
		this.view.summaryWrap.dom.scrollLeft = mb.scrollLeft;
		// second time for IE (1/2 time first fails, other browsers ignore)
		this.view.summaryWrap.dom.scrollLeft = mb.scrollLeft;

		alert(this.view.summaryWrap.dom.scrollLeft);

	},

	doWidth : function(col, w, tw) {
		var s = this.view.summary.dom;
		s.firstChild.style.width = tw;
		s.firstChild.rows[0].childNodes[col].style.width = w;
	},

	doAllWidths : function(ws, tw) {
		var s = this.view.summary.dom, wlen = ws.length;
		s.firstChild.style.width = tw;
		var cells = s.firstChild.rows[0].childNodes;
		for (var j = 0; j < wlen; j++) {
			cells[j].style.width = ws[j];
		}
	},

	doHidden : function(col, hidden, tw) {
		var s = this.view.summary.dom, display = hidden ? 'none' : '';
		s.firstChild.style.width = tw;
		s.firstChild.rows[0].childNodes[col].style.display = display;
	},
	getColumnDataByName : function(name) {
		var rs = this.grid.store.getRange();
		var vs = [];
		for (var i = 0; i < rs.length; i++) {
			vs.push(rs[i].get(name));
		}
		return vs;
	},
	renderSummary : function(rs, cs, cm) {
		cs = cs || this.view.getColumnData();
		var cfg = cm.config, buf = [], last = cs.length - 1;

		for (var i = 0, len = cs.length; i < len; i++) {
			var c = cs[i], cf = cfg[i], p = {};
			p.id = c.id;
			p.style = c.style;
			p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
			var ds = this.grid.store;
			var summaryRenderer = cf.summaryRenderer;
			//debugger;
			if (summaryRenderer && ds.getTotalCount() > 0) {
				if (Ext.type(summaryRenderer) == "string") {
					summaryRenderer = Ext.ux.grid.GridSummary.Calculations[summaryRenderer];
				}
				if (Ext.type(summaryRenderer) == "function") {
					p.value = summaryRenderer(this.getColumnDataByName(c.name), rs, p);
				} else {
					p.value = '';
				}

			} else {
				p.value = '';
			}
			if (p.value == undefined || p.value === "")
				p.value = "&#160;";
			buf[buf.length] = this.cellTpl.apply(p);
		}
		return this.rowTpl.apply({
			tstyle : 'width:' + this.view.getTotalWidth() + ';',
			cells : buf.join('')
		});
	},

	refreshSummary : function() {
		var g = this.grid, ds = g.store, cs = this.view.getColumnData(), cm = this.cm, rs = ds.getRange(), buf = this.renderSummary(rs, cs, cm);

		if (!this.view.summaryWrap) {

			this.view.summaryWrap = Ext.DomHelper.insertAfter(this.view.scroller, {
				tag : 'div',
				cls : 'x-grid3-gridsummary-row-inner'
			}, true);

		}

		this.view.summary = this.view.summaryWrap.update(buf).first();

		this.view.scroller.setStyle('overflow-x', 'hidden');
		var view2 = this.view;
		this.view.summary.setStyle('overflow-x', 'auto');
		this.view.summary.on("scroll", function() {
			view2.scroller.dom.scrollLeft = view2.summary.dom.scrollLeft
		});
	},

	toggleSummary : function(visible) { // true to display summary row
		var el = this.grid.getGridEl();

		if (el) {
			if (visible === undefined) {
				visible = el.hasClass('x-grid-hide-gridsummary');
			}
			el[visible ? 'removeClass' : 'addClass']('x-grid-hide-gridsummary');

			this.view.layout(); // readjust gridview height
		}
	},

	getSummaryNode : function() {
		return this.view.summary
	}
});
Ext.reg('gridsummary', Ext.ux.grid.GridSummary);

/*
 * all Calculation methods are called on each Record in the Store with the
 * following 5 parameters:
 * 
 * v - cell value record - reference to the current Record colName - column name
 * (i.e. the ColumnModel's dataIndex) data - the cumulative data for the current
 * column + summaryType up to the current Record rowIdx - current row index
 */
Ext.ux.grid.GridSummary.Calculations = {
	sum : function(vs, rs, p) {
		var v = 0;
		for (var i = 0; i < vs.length; i++) {
			v = v + Ext.num(vs[i], 0);
		}
		return v;
	},

	count : function(vs, rs, p) {
		return vs.length;
	},

	max : function(vs, rs, p) {
		var v = 0;
		for (var i = 0; i < vs.length; i++) {
			v = Math.max(v, Ext.num(vs[i], 0));
		}
		return v;
	},

	min : function(vs, rs, p) {
		var v = 0;
		for (var i = 0; i < vs.length; i++) {
			v = Math.min(v, Ext.num(vs[i], 0));
		}
		return v;
	},

	average : function(vs, rs, p) {
		var v = Ext.ux.grid.GridSummary.Calculations.sum.apply(this, arguments);
		return v / vs.length;
	}

};

if (Ext.ui) {
	Ext.ui.GridSummary = Ext.ux.grid.GridSummary;
}
