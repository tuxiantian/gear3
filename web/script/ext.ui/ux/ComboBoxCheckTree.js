Ext.ux.ComboBoxCheckTree = function() {
	this.treeId = Ext.id() + '-tree';
	this.maxHeight = arguments[0].maxHeight || arguments[0].height
			|| this.maxHeight;
	this.store = new Ext.data.SimpleStore({
		fields : [],
		data : [[]]
	});
	this.selectedClass = '';
	this.mode = 'local';
	this.triggerAction = 'all';
	this.onSelect = Ext.emptyFn;
	this.editable = false;
	Ext.ux.ComboBoxCheckTree.superclass.constructor.apply(this, arguments);
};

Ext.extend(Ext.ux.ComboBoxCheckTree, Ext.form.ComboBox, {
	checkField : 'checked',
	separator : ',',	
	initEvents : function() {
		Ext.ux.ComboBoxCheckTree.superclass.initEvents.apply(this, arguments);
		this.keyNav.tab = false;

	},

	initComponent : function() {
		this.on({
			scope : this
		});

	},
	initList:function(){
        if(!this.list){
            var cls = 'x-combo-list';

            this.list = new Ext.Layer({
                shadow: this.shadow, cls: [cls, this.listClass].join(' '), constrain:false
            });

            var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
            this.list.setWidth(lw);
            this.list.swallowEvent('mousewheel');
            this.assetHeight = 0;

            if(this.title){
                this.header = this.list.createChild({cls:cls+'-hd', html: this.title});
                this.assetHeight += this.header.getHeight();
            }

            this.innerList = this.list.createChild({cls:cls+'-inner'});	
 		    if (!this.tree.rendered) {
 		    	this.tree.width=lw;
				this.tree.height = this.maxHeight;
				this.tree.border = false;
				this.tree.autoScroll = true;
				if (this.tree.xtype) {
					this.tree = Ext.ComponentMgr.create(this.tree, this.tree.xtype);
				}
				this.tree.render(this.innerList);
				var combox = this;
				this.tree.on('check', function(node, checked) {
					combox.onTreeCheck();
				});   					
 		   }
 		 if(this.resizable){
                this.resizer = new Ext.Resizable(this.list,  {
                   pinned:true, handles:'se'
                });
                this.resizer.on('resize', function(r, w, h){
                    this.maxHeight = h-this.handleHeight-this.list.getFrameWidth('tb')-this.assetHeight;
                    this.listWidth = w;
                    this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
                    this.restrictHeight();
                }, this);                
            }            
	    }
           	    
	},	
	expand : function() {
		Ext.ux.ComboBoxCheckTree.superclass.expand.call(this);
			var root = this.tree.getRootNode();
			if (!root.isLoaded())
				root.reload();
		
	},	
	select:function(){},
	setValue:function(value,text){	   
	   var arg=arguments;
	   if(arg.length==1){
	     this.setRawValue(value);
	   }
	   if(arg.length==2){
	     this.setRawValue(text);
	   }	   
	   
	   if (this.hiddenField) {		 
		 this.hiddenField.value =value;
	   }
	   this.value=value;
	},
	beforeBlur:function(){},
	onTreeCheck : function() {
		var values = [];
		var texts = [];
		var root = this.tree.getRootNode();
		var checkedNodes = this.tree.getChecked();
		for (var i = 0; i < checkedNodes.length; i++) {
			var node = checkedNodes[i];
			if (this.selectValueModel == 'all'
					|| (this.selectValueModel == 'leaf' && node.isLeaf())
					|| (this.selectValueModel == 'folder' && !node.isLeaf())) {
				values.push(node.id);
				texts.push(node.text);
			}
		}

		this.value = values.join(this.separator);
		this.setRawValue(texts.join(this.separator));
		if (this.hiddenField) {
			this.hiddenField.value = this.value;
		}

	},
	getValue : function() {
		return this.value || '';
	},
	clearChecked:function(){
	  if(!this.tree.rendered){
	    return;
	  }
	  var checkedNodes = this.tree.getChecked();
	  Ext.each(checkedNodes,function(node){
	    if(node.attributes.checked){
	       node.attributes.checked=false;
	       if(node.rendered){
	          node.ui.checkbox.checked=false;
	       }
	    }	  
	  });
	},
	reset:function(){
	  Ext.ux.ComboBoxCheckTree.superclass.reset.apply(this,arguments); 
      this.clearChecked();
	},
	clearValue : function() {
		this.value = '';
		this.setRawValue(this.value);
		if (this.hiddenField) {
			this.hiddenField.value = '';
		}

		this.tree.getSelectionModel().clearSelections();
	}
});

Ext.reg('combochecktree', Ext.ux.ComboBoxCheckTree);