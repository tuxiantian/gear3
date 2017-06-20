Ext.form.TreeField = Ext.extend(Ext.form.TriggerField, {
	readOnly : true,
	displayField : 'text',
	valueField : null,
	hiddenName : null,
	listWidth : null,
	minListWidth : 50,
	listHeight : 150,
	minListHeight : 50,
	tree : null,
	value : null,
	displayValue : null,
	initComponent : function() {
		Ext.form.TreeField.superclass.initComponent.call(this);
		this.addEvents('select', 'expand', 'collapse', 'beforeselect');

	},
	initList : function() {
		if (!this.list) {
			var cls = 'x-treefield-list';
			this.list = new Ext.Layer( {
				shadow : this.shadow,
				cls : [cls, this.listClass].join(' '),
				constrain : false
			});
			var lw = this.listWidth
					|| Math.max(this.wrap.getWidth(), this.minListWidth);
			this.list.setWidth(lw);
			this.list.swallowEvent('mousewheel');

			this.innerList = this.list.createChild( {
				cls : cls + '-inner'
			});
			this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));
			this.innerList.setHeight(this.listHeight || this.minListHeight);
			if (!this.tree) {
				this.tree = Lbx.util.ExtUtil.getTreePanel(Ext.applyIf(this.treeConfig,{width:lw,el:this.innerList}));
			}
			this.tree.on('click', this.select, this);
			this.tree.render();
		}
	},
	onRender : function(ct, position) {
		Ext.form.TreeField.superclass.onRender.call(this, ct, position);
		if (this.hiddenName) {
			this.hiddenField = this.el.insertSibling( {
				tag : 'input',
				type : 'hidden',
				name : this.hiddenName,
				id : (this.hiddenId || this.hiddenName)
			}, 'before', true);
			this.hiddenField.value = this.hiddenValue !== undefined
					? this.hiddenValue
					: this.value !== undefined ? this.value : '';
			//this.el.dom.removeAttribute('name');
		}
		if (Ext.isGecko) {
			this.el.dom.setAttribute('autocomplete', 'off');
		}

		this.initList();
	},
	select : function(node) {
		if (this.fireEvent('beforeselect', node, this) != false) {
			this.onSelect(node);
			this.fireEvent('select', this, node);
		}
	},
	onSelect : function(node) {
		this.setValue(node);
		this.collapse();
	},
	setValue : function(node,other) {
		// if(!node)return;
		var text, value;
		if (node && typeof node == 'object') {
			text = node.text;
			value = node.id;
		} else {
			text=node;
			value=other;
		}
		if (this.hiddenField) {
			this.hiddenField.value = value;
		}
		Ext.form.TreeField.superclass.setValue.call(this, text);
		this.lastSelectionText=text;
		this.value = value;
	},
	findNode : function(id){
		if(this.tree)return this.tree.getNodeById(id);else return null;
    },
	getValue:function(){
        return typeof this.value != 'undefined' ? this.value : '';
	},
	onResize : function(w, h) {
		Ext.form.TreeField.superclass.onResize.apply(this, arguments);
		if (this.list && this.listWidth == null) {
			var lw = Math.max(w, this.minListWidth);
			this.list.setWidth(lw);
			this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));
		}
	},
	validateBlur : function() {
		return !this.list || !this.list.isVisible();
	},
	onDestroy : function() {
		if (this.list) {
			this.list.destroy();
		}
		if (this.wrap) {
			this.wrap.remove();
		}
		Ext.form.TreeField.superclass.onDestroy.call(this);
	},
	collapseIf : function(e) {
		if (!e.within(this.wrap) && !e.within(this.list)) {
			this.collapse();
		}
	},

	collapse : function() {
		if (!this.isExpanded()) {
			return;
		}
		this.list.hide();
		Ext.getDoc().un('mousewheel', this.collapseIf, this);
		Ext.getDoc().un('mousedown', this.collapseIf, this);
		this.fireEvent('collapse', this);
	},
	expand : function() {
		if (this.isExpanded() || !this.hasFocus) {
			return;
		}
		this.onExpand();
		this.list.alignTo(this.wrap, this.listAlign);
		this.list.show();
		Ext.getDoc().on('mousewheel', this.collapseIf, this);
		Ext.getDoc().on('mousedown', this.collapseIf, this);
		this.fireEvent('expand', this);
	},
	onExpand : function() {
		var doc = Ext.getDoc();
		this.on('click', function() {
		}, this);
	},
	isExpanded : function() {
		return this.list && this.list.isVisible();
	},
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (this.isExpanded()) {
			this.collapse();
		} else {
			this.onFocus( {});
			this.expand();
		}
		this.el.focus();
	},
	alignErrorIcon : function(){
        this.errorIcon.alignTo(this.el, 'tl-tr', [20, 0]);
    }
});
Ext.reg('treefield', Ext.form.TreeField);