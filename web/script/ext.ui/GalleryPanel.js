Ext.define("Ext.ui.GalleryPanel", {
	extend : "Ext.Panel",
	layout : 'fit',
	initComponent : function() {
		this.storeConfig = this.storeConfig || {};
		this.viewConfig = this.viewConfig || {};
		this.store = this.store || new Ext.ui.CommonStore(this.storeConfig || {});
		this.viewConfig.store = this.store;
		this.view = this.view || new Ext.ui.GalleryView(this.viewConfig);
		this.items = [this.view];
		this.view.on("selectionchange", this.onViewSelectionChange, this);
		if(this.pagingConfig){
			this.bbar=this.createPagingToolbar(this.pagingConfig,this.store);
		}
		this.view.on("render", function() {
			if (this.store.getRange().length) {
				var me = this;
				setTimeout(function() {
					me.refresh();
				}, 0);
			}
		});
		return this.callParent(arguments);
	},
	getView : function() {
		return this.view;
	},
	toSearch : function(name, value, cb) {
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
		this.store.load({
			params : {
				start : 0
			},
			callback : cb || Ext.emptyFn
		});
	},
	createPagingToolbar : function(pagingConfig, store) {
		var bar = new Ext.ui.XPagingToolbar(Ext.apply({
			pageSize : 10,
			store : store,
			autoLoad : true,// 分页渲染后自动刷行
			displayInfo : true
		}, pagingConfig));
		return bar;
	},
	onViewSelectionChange : function(dv, nodes) {
		var l = nodes.length;
		this.setTitle('共选择了 (' + l + ' )张图片。');
	}
});

Ext.define("Ext.ui.GalleryView", {
	extend : "Ext.DataView",
	autoHeight : true,
	multiSelect : false,
	overClass : 'x-view-over',
	itemSelector : 'div.thumb-wrap',
	emptyText : '没有图片可以展示',
	cls:'images-view',
	singleSelect:true,
	removable:false,	
	defaultMapping:{name:'name',url:'url'},
	initComponent : function() {		
		var removableTag='<a class="tr-clear-trigger" href="#" style="{0}">X</a>';
		var removableTagStyle="display:none;";
		if(this.removable===true){
		    removableTagStyle="";
		}
		var temp=Ext.apply({},this.defaultMapping);		
	    this.mapping=Ext.apply(temp,this.mapping||{});
		var w=this.imgWidth||80;
		var h=this.imgHeight||60;
		removableTag=String.format(removableTag,removableTagStyle);
		if(!this.tpl){		
		  this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
		        '<div class="thumb-wrap">',
			    String.format('<div class="thumb"><img src="{url}" title="{name}" width="{0}px" height="{1}px">{2}</div>',w,h,removableTag),
			    '<span class="x-editable">{shortName}</span></div>',
		    '</tpl>',
		    '<div class="x-clear"></div>'
	      );	      
		}
		this.on("click",this.onClearClick,this);
		this.callParent(arguments);		
		this.addEvents(
            /**
             * @event beforeitemremove
             * Fires before a item remove  is processed. Returns false to cancel the default action.
             * @param {Ext.DataView} this
             * @param {Number} index The index of the target node
             * @param {HTMLElement} node The target node
             * @param {Ext.EventObject} e The raw event object
             */
            "beforeitemremove",
            /**
             * @event click
             * Fires when a item node is removed.
             * @param {Ext.DataView} this
             * @param {Number} index The index of the target node
             * @param {HTMLElement} node The target node
             * @param {Ext.EventObject} e The raw event object
             */
            "itemremove");
	},	
    onClearClick:function(me,index, item, e){
    	if(this.fireEvent("beforeitemremove", me, index, item, e) === false){
            return false;
        }
    	
        var trigger = e.getTarget(".tr-clear-trigger", item);
        if(trigger){           
        	me.store.removeAt(index);
        	this.fireEvent("itemremove", me, index, item, e);
        }
    },
	prepareData : function(data) {
		data.name=this.mappingData(data,this.mapping.name);
		data.url=this.mappingData(data,this.mapping.url);
		data.shortName = Ext.util.Format.ellipsis(data.name, 15);
		//data.sizeString = Ext.util.Format.fileSize(data.size);
		//data.dateString = data.lastmod.format("m/d/Y g:i a");
		return data;
	},
    mappingData:function(data,mapping){
    	 if(Ext.isFunction(mapping)){
    		 return mapping(data);   		 
    	 }    	 
    	 return data[mapping];    	
    }
});