Ext.ns('Ext.ui');
/*******************************************************************************
 * 支持json 和数据格式数据不支持xml 数据
 * 
 * @param {object}config
 *            is object
 * @cfg{object} readerConfig detail cogfiguration of Ext.data.JsonReader
 * @cfg{object} proxyConfig detail cogfiguration of Ext.data.HttpProxy *
 */
Ext.ui.CommonStore = function(config) {
	var readerConfig, proxyConfig, data, i = 0, row, rows = [];
	config = Ext.apply(Ext.apply({}, this.defaultConfig), config);// copy
	readerConfig = Ext.applyAll(config, config.readerConfig);
	proxyConfig = Ext.applyAll(config, config.proxyConfig);
	config.proxy = config.proxy || (!config.data ? new Ext.data.HttpProxy(proxyConfig) : undefined);
	config.reader = config.reader || new Ext.data.JsonReader(readerConfig);
	if (config.proxy == undefined) {
		config.data = config.data || [];
		data = config.data;
		for (i = 0; i < data.length; i++) {
			row = data[i];
			if (Ext.isArray(row)) {
				rows.push(this.convertArrayToObject(row, config.fields));
			} else {
				rows.push(row);
			}
		}
		config.data = {};
		config.data[config.root] = rows;
		config.data[config.totalProperty] = rows.length;
	}
	
	if(config.id){
	   config.idProperty=config.id;
	   delete config.id
	}
	Ext.ui.CommonStore.superclass.constructor.apply(this, arguments);	
};
Ext.extend(Ext.ui.CommonStore, Ext.data.Store, {
	defaultConfig : {
		autoLoad : true,
		remoteSort : false,
		totalProperty : 'total',
		root : 'rows',
		fields : ['ID', 'TEXT']
	},
	convertArrayToObject : function(row, fields) {
		var obj = {}, mapping, i = 0;
		for (i; i < fields.length; i++) {
			if (typeof fields[i] == 'string') {
				obj[fields[i]] = row[i];
			} else if (typeof fields[i] == 'object') {
				obj[fields[i].name] = row[(typeof fields[i].mapping == undefined) ? i : fields[i].mapping];
			}
		}
		obj.data = row;
		return obj;
	}
});





Ext.ui.GroupingStore = Ext.extend(Ext.ui.CommonStore, {

    //inherit docs
    constructor: function(config) {
        config = config || {};

        //We do some preprocessing here to massage the grouping + sorting options into a single
        //multi sort array. If grouping and sorting options are both presented to the constructor,
        //the sorters array consists of the grouping sorter object followed by the sorting sorter object
        //see Ext.data.Store's sorting functions for details about how multi sorting works
        this.hasMultiSort  = true;
        this.multiSortInfo = this.multiSortInfo || {sorters: []};

        var sorters    = this.multiSortInfo.sorters,
            groupField = config.groupField || this.groupField,
            sortInfo   = config.sortInfo || this.sortInfo,
            groupDir   = config.groupDir || this.groupDir;

        //add the grouping sorter object first
        if(groupField){
            sorters.push({
                field    : groupField,
                direction: groupDir
            });
        }

        //add the sorting sorter object if it is present
        if (sortInfo) {
            sorters.push(sortInfo);
        }

        Ext.ui.GroupingStore.superclass.constructor.call(this, config);

        this.addEvents(
          /**
           * @event groupchange
           * Fired whenever a call to store.groupBy successfully changes the grouping on the store
           * @param {Ext.ui.GroupingStore} store The grouping store
           * @param {String} groupField The field that the store is now grouped by
           */
          'groupchange'
        );

        this.applyGroupField();
    },

    /**
     * @cfg {String} groupField
     * The field name by which to sort the store's data (defaults to '').
     */
    /**
     * @cfg {Boolean} remoteGroup
     * True if the grouping should apply on the server side, false if it is local only (defaults to false).  If the
     * grouping is local, it can be applied immediately to the data.  If it is remote, then it will simply act as a
     * helper, automatically sending the grouping field name as the 'groupBy' param with each XHR call.
     */
    remoteGroup : false,
    /**
     * @cfg {Boolean} groupOnSort
     * True to sort the data on the grouping field when a grouping operation occurs, false to sort based on the
     * existing sort info (defaults to false).
     */
    groupOnSort:false,

    /**
     * @cfg {String} groupDir
     * The direction to sort the groups. Defaults to <tt>'ASC'</tt>.
     */
    groupDir : 'ASC',

    /**
     * Clears any existing grouping and refreshes the data using the default sort.
     */
    clearGrouping : function(){
        this.groupField = false;

        if(this.remoteGroup){
            if(this.baseParams){
                delete this.baseParams.groupBy;
                delete this.baseParams.groupDir;
            }
            var lo = this.lastOptions;
            if(lo && lo.params){
                delete lo.params.groupBy;
                delete lo.params.groupDir;
            }

            this.reload();
        }else{
            this.sort();
            this.fireEvent('datachanged', this);
        }
    },

    /**
     * Groups the data by the specified field.
     * @param {String} field The field name by which to sort the store's data
     * @param {Boolean} forceRegroup (optional) True to force the group to be refreshed even if the field passed
     * in is the same as the current grouping field, false to skip grouping on the same field (defaults to false)
     */
    groupBy : function(field, forceRegroup, direction) {
        direction = direction ? (String(direction).toUpperCase() == 'DESC' ? 'DESC' : 'ASC') : this.groupDir;

        if (this.groupField == field && this.groupDir == direction && !forceRegroup) {
            return; // already grouped by this field
        }

        //check the contents of the first sorter. If the field matches the CURRENT groupField (before it is set to the new one),
        //remove the sorter as it is actually the grouper. The new grouper is added back in by this.sort
        var sorters = this.multiSortInfo.sorters;
        if (sorters.length > 0 && sorters[0].field == this.groupField) {
            sorters.shift();
        }

        this.groupField = field;
        this.groupDir = direction;
        this.applyGroupField();

        var fireGroupEvent = function() {
            this.fireEvent('groupchange', this, this.getGroupState());
        };

        if (this.groupOnSort) {
            this.sort(field, direction);
            fireGroupEvent.call(this);
            return;
        }

        if (this.remoteGroup) {
            this.on('load', fireGroupEvent, this, {single: true});
            this.reload();
        } else {
            this.sort(sorters);
            fireGroupEvent.call(this);
        }
    },

    //GroupingStore always uses multisorting so we intercept calls to sort here to make sure that our grouping sorter object
    //is always injected first.
    sort : function(fieldName, dir) {
        if (this.remoteSort) {
            return Ext.ui.GroupingStore.superclass.sort.call(this, fieldName, dir);
        }

        var sorters = [];

        //cater for any existing valid arguments to this.sort, massage them into an array of sorter objects
        if (Ext.isArray(arguments[0])) {
            sorters = arguments[0];
        } else if (fieldName == undefined) {
            //we preserve the existing sortInfo here because this.sort is called after
            //clearGrouping and there may be existing sorting
            sorters = this.sortInfo ? [this.sortInfo] : [];
        } else {
            //TODO: this is lifted straight from Ext.data.Store's singleSort function. It should instead be
            //refactored into a common method if possible
            var field = this.fields.get(fieldName);
            if (!field) return false;

            var name       = field.name,
                sortInfo   = this.sortInfo || null,
                sortToggle = this.sortToggle ? this.sortToggle[name] : null;

            if (!dir) {
                if (sortInfo && sortInfo.field == name) { // toggle sort dir
                    dir = (this.sortToggle[name] || 'ASC').toggle('ASC', 'DESC');
                } else {
                    dir = field.sortDir;
                }
            }

            this.sortToggle[name] = dir;
            this.sortInfo = {field: name, direction: dir};

            sorters = [this.sortInfo];
        }

        //add the grouping sorter object as the first multisort sorter
        if (this.groupField) {
            sorters.unshift({direction: this.groupDir, field: this.groupField});
        }

        return this.multiSort.call(this, sorters, dir);
    },

    /**
     * @private
     * Saves the current grouping field and direction to this.baseParams and this.lastOptions.params
     * if we're using remote grouping. Does not actually perform any grouping - just stores values
     */
    applyGroupField: function(){
        if (this.remoteGroup) {
            if(!this.baseParams){
                this.baseParams = {};
            }

            Ext.apply(this.baseParams, {
                groupBy : this.groupField,
                groupDir: this.groupDir
            });

            var lo = this.lastOptions;
            if (lo && lo.params) {
                lo.params.groupDir = this.groupDir;

                //this is deleted because of a bug reported at http://www.extjs.com/forum/showthread.php?t=82907
                delete lo.params.groupBy;
            }
        }
    },

    /**
     * @private
     * TODO: This function is apparently never invoked anywhere in the framework. It has no documentation
     * and should be considered for deletion
     */
    applyGrouping : function(alwaysFireChange){
        if(this.groupField !== false){
            this.groupBy(this.groupField, true, this.groupDir);
            return true;
        }else{
            if(alwaysFireChange === true){
                this.fireEvent('datachanged', this);
            }
            return false;
        }
    },

    /**
     * @private
     * Returns the grouping field that should be used. If groupOnSort is used this will be sortInfo's field,
     * otherwise it will be this.groupField
     * @return {String} The group field
     */
    getGroupState : function(){
        return this.groupOnSort && this.groupField !== false ?
               (this.sortInfo ? this.sortInfo.field : undefined) : this.groupField;
    }
});
Ext.reg('jgroupingstore', Ext.ui.GroupingStore);

Ext.ns("Ext.ui");
Ext.ui.MappingTreeLoader=Ext.extend(Ext.tree.TreeLoader,{	
	defaultMapping:{
		  id:'id',
		  text:'text',	
		  leaf:'leaf',
		  href:'href',
		  nodes:'nodes'// tree root 
	},	
	constructor:function(config){			
		   config=config||{};		
		   config.mapping=Ext.applyIf(config.mapping||{},this.defaultMapping);		
		   Ext.ui.MappingTreeLoader.superclass.constructor.call(this,config);		   
	},	
	doPreload : function(node){
		if(this.forceLoading===true){
			return false;
		}				
		return Ext.ui.MappingTreeLoader.superclass.doPreload.call(this,node);		
	},
    createNode : function(attr){
        // apply baseAttrs, nice idea Corey!
        if(this.baseAttrs){
        	var baseAttrs=this.baseAttrs;
        	if(Ext.isFunction(baseAttrs)){
        		baseAttrs=baseAttrs(attr);
        	}
            Ext.applyIf(attr, baseAttrs);
        }
        if(this.applyLoader !== false && !attr.loader){
            attr.loader = this;
        }
        if(Ext.isString(attr.uiProvider)){
           attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
        }
        if(attr.nodeType){
            return new Ext.tree.TreePanel.nodeTypes[attr.nodeType](attr);
        }else{
            return attr.leaf ?
                        new Ext.tree.TreeNode(attr) :
                        new Ext.tree.AsyncTreeNode(attr);
        }
    },
    isCascaded:function( obj){    	
    	return this.mapping.hasOwnProperty("parent") ;
    },
    getMappingValue:function(obj,valueName){
    	   return Ext.isFunction(this.mapping[valueName])?this.mapping[valueName](obj):obj[this.mapping[valueName]];    	
    },
    wrapNode:function(obj){
    	 obj.id=this.getMappingValue(obj,"id");
    	 obj.text=this.getMappingValue(obj,"text");
    	 obj.leaf=this.getMappingValue(obj,"leaf");
    	 obj.href=this.getMappingValue(obj,"href");
    	 if(this.isCascaded()){
    	    obj.parent=obj[this.mapping.parent];    		 
    	    obj.children=[];
         }
    	 return obj;
    },    
    sortTree:function(obj){    
    	var ar=Ext.isArray(obj)?obj:[obj];
    	if( Ext.isDefined(this.mapping.sort)){    		
    		ar=this.sortArray(ar);
    		 for(var i=0;i<ar.length;i++){
    	           if(ar[i].children){    	        	   
    	        	   ar[i].children=this.sortTree(ar[i].children);
    	           } 
    		 }	    		   
    	}    	
    	return ar;
    },
    sortArray:function(ar){    	 
    	var me=this;
    	return ar.sort(function(a,b){
    		    return a[me.mapping.sort]-b[me.mapping.sort];	
    	});    	
    },
    plainWrap:function(data){
		for(var i=0;i<data.length;i++){
			data[i]=this.wrapNode(data[i]);
		}		
		return data;
    },
    tryFormNodeStructFromData:function(data,root){    	    
    	if(!this.isCascaded()){
    		return this.plainWrap(data);
    	}else{    		 
    		var dict={};
    		dict[root.id]=this.wrapNode({id:root.id,text:root.text});
    		for(var i=0;i<data.length;i++){
    		      var n=this.wrapNode(data[i]);
    		      var parent=dict[n.parent];    		
    		      if(!parent){
    		    	  parent=this.wrapNode({id:n.parent});
    		    	  dict[parent.id]=parent;
    		      } 
    		      // 合并
    		      dict[n.id]=Ext.applyAll(dict[n.id]||{},n);
    		      parent.children.push(dict[n.id]);
    		}
    		// set leaf
    		for(obj in dict){
    			var n=dict[obj];
    			if(n.children.length>0){
    				n.leaf=false;    				
    			}else{
    				n.leaf=true;
    				delete n.children;    			   	
    			}		
    		}
    		return this.sortTree( dict[root.id].children);    		
    	}
    },
    processResponse : function(response, node, callback, scope){
        var json = response.responseText;
        try {
            var o = response.responseData || Ext.decode(json);
            o=Ext.isArray(o)?o:o[this.mapping.nodes]||[];             
            o=this.tryFormNodeStructFromData(o,node);
            node.beginUpdate();
            for(var i = 0, len = o.length; i < len; i++){
                var n = this.createNode(o[i]);
                if(n){
                    node.appendChild(n);
                }
            }
            node.endUpdate();
            this.runCallback(callback, scope || node, [node]);
        }catch(e){
            this.handleFailure(response);        
        }
    },
    processDirectResponse: function(result, response, args){
        if(response.status){
            this.handleResponse({
                responseData: Ext.isArray(result) ? result : result[this.mapping.nodes]||[],
                responseText: result,
                argument: args
            });
        }else{
            this.handleFailure({
                argument: args
            });
        }
    }
});

Ext.ui.AsyncTreePanel = function(config) {
	config = config || {};
	var rootConfig = Ext.applyAll(this.rootConfig, config.rootConfig || {});
	config.root = this.root || new Ext.tree.AsyncTreeNode(rootConfig);
	var Loader=config.mapping?Ext.ui.MappingTreeLoader: Ext.tree.TreeLoader;
	config.loader = this.loader || new Loader(Ext.applyAll({
		dataUrl : config.url,
		mapping:config.mapping,
		baseAttrs : {
			uiProvider : (config.checkbox ? Ext.ux.TreeCheckNodeUI : false)
		}
	}, config.loaderConfig || {}));
	Ext.ui.AsyncTreePanel.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ui.AsyncTreePanel, Ext.tree.TreePanel, {
	autoScroll : true,
	rootConfig : {
		id : '0',
		text : 'root'
	},
	beginForceLoading:function( ){
		 this.getLoader( ).forceLoading=true;
	},
	endForceLoading:function( ){
		 this.getLoader( ).forceLoading=false;		
	},
    reloadSelectNode:function(aNode){
    	var tree=this;
		var node =aNode|| tree.getSelectionModel().getSelectedNode();
		if (node) {
			if (node.isLeaf()) {								
				var parentNode = node.parentNode;
				parentNode.reload(function() {
							var newNode = parentNode.findChild("id", node.id);
							tree.getSelectionModel().select(parentNode.findChild("id", node.id));
							newNode.expand();
						});
			} else {
				tree.beginForceLoading();
				node.reload(function(){
					 tree.endForceLoading();					
				});
			}
		}    	
    }
});
Ext.reg('asynctreepanel', Ext.ui.AsyncTreePanel);Ext.ns('Ext.ui');
Ext.ui.BrowseField = Ext.extend(Ext.form.TriggerField, {
	initComponent : function() {
		Ext.ui.BrowseField.superclass.initComponent.call(this);
		this.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				this.fireEvent("pop", this);
			}
		}, this);
		this.addEvents("pop");

	},
	triggerClass : 'x-form-pop-trigger',
	onTriggerClick : function() {
		this.fireEvent("pop", this);
	}
});
Ext.reg('browsefield', Ext.ui.BrowseField);/**
 * @class Ext.ux.TreeCheckNodeUI
 * @extends Ext.tree.TreeNodeUI
 * 
 * 对 Ext.tree.TreeNodeUI 进行checkbox功能的扩展,后台返回的结点信息不用非要包含checked属性
 * 
 * 扩展的功能点有：
 * 一、支持只对树的叶子进行选择
 *    只有当返回的树结点属性leaf = true 时，结点才有checkbox可选
 * 	  使用时，只需在声明树时，加上属性 onlyLeafCheckable: true 既可，默认是false
 * 
 * 二、支持对树的单选
 *    只允许选择一个结点
 * 	  使用时，只需在声明树时，加上属性 checkModel: "single" 既可
 * 
 * 二、支持对树的级联多选 
 *    当选择结点时，自动选择该结点下的所有子结点，或该结点的所有父结点（根结点除外），特别是支持异步，当子结点还没显示时，会从后台取得子结点，然后将其选中/取消选中
 *    使用时，只需在声明树时，加上属性 checkModel: "cascade" 或"parentCascade"或"childCascade" 或free 即可
 * 
 * 三、添加"check"事件
 *    该事件会在树结点的checkbox发生改变时触发
 *    使用时，只需给树注册事件,如：
 *    tree.on("check",function(node,checked){...});
 * 
 * 默认情况下，checkModel为'multiple'，也就是多选，onlyLeafCheckable为false，所有结点都可选
 * 
 * 使用方法：在loader里加上 baseAttrs:{uiProvider:Ext.ux.TreeCheckNodeUI} 既可.
 * 例如：
 *   var tree = new Ext.tree.TreePanel({
 *		el:'tree-ct',
 *		width:568,
 *		height:300,
 *		checkModel: 'cascade',   //对树的级联多选
 *		onlyLeafCheckable: false,//对树所有结点都可选
 *		animate: false,
 *		rootVisible: false,
 *		autoScroll:true,
 *		loader: new Ext.tree.DWRTreeLoader({
 *			dwrCall:Tmplt.getTmpltTree,
 *			baseAttrs: { uiProvider: Ext.ux.TreeCheckNodeUI } //添加 uiProvider 属性
 *		}),
 *		root: new Ext.tree.AsyncTreeNode({ id:'0' })
 *	});
 *	tree.on("check",function(node,checked){alert(node.text+" = "+checked)}); //注册"check"事件
 *	tree.render();
 * 
 */

Ext.ux.TreeCheckNodeUI = function() {
	//多选: 'multiple'(默认)free 自由选择
	//单选: 'single'
	//级联多选: 'cascade'(同时选父和子);'parentCascade'(选父);'childCascade'(选子)
	
	this.checkModel = 'multiple';
	
	//only leaf can checked
	this.onlyLeafCheckable = false;
	
	Ext.ux.TreeCheckNodeUI.superclass.constructor.apply(this, arguments);
};

Ext.extend(Ext.ux.TreeCheckNodeUI, Ext.tree.TreeNodeUI, {

    renderElements : function(n, a, targetNode, bulkRender){
    	var tree = n.getOwnerTree();
		this.checkModel = tree.checkModel || this.checkModel;
		this.onlyLeafCheckable = tree.onlyLeafCheckable || false;
    	
        // add some indent caching, this helps performance when rendering a large tree
        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        //var cb = typeof a.checked == 'boolean';
		var cb = (!this.onlyLeafCheckable || a.leaf);
        var href = a.href ? a.href : Ext.isGecko ? "" : "#";
        var buf = ['<li class="x-tree-node"><div ext:tree-node-id="',n.id,'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">',
            '<span class="x-tree-node-indent">',this.indentMarkup,"</span>",
            '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
            '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',(a.icon ? " x-tree-node-inline-icon" : ""),(a.iconCls ? " "+a.iconCls : ""),'" unselectable="on" />',
            cb ? ('<input class="x-tree-node-cb" type="checkbox" ' + (a.checked ? 'checked="checked" />' : '/>')) : '',
            '<a hidefocus="on" class="x-tree-node-anchor" href="',href,'" tabIndex="1" ',
             a.hrefTarget ? ' target="'+a.hrefTarget+'"' : "", '><span unselectable="on">',n.text,"</span></a></div>",
            '<ul class="x-tree-node-ct" style="display:none;"></ul>',
            "</li>"].join('');

        var nel;
        if(bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())){
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
        }else{
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
        }
        
        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var cs = this.elNode.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        var index = 3;
        if(cb){
            this.checkbox = cs[3];
            Ext.fly(this.checkbox).on('click', this.check.createDelegate(this,[null]));
            index++;
        }
        this.anchor = cs[index];
        this.textNode = cs[index].firstChild;
    },
    
    // private
    check : function(checked){
        var n = this.node;
		var tree = n.getOwnerTree();
		this.checkModel = tree.checkModel || this.checkModel;
		
		if( checked === null ) {
			checked = this.checkbox.checked;
		} else {
			this.checkbox.checked = checked;
		}
		
		n.attributes.checked = checked;
		tree.fireEvent('check', n, checked);
		
		if(this.checkModel == 'single'){
			var checkedNodes = tree.getChecked();
			for(var i=0;i<checkedNodes.length;i++){
				var node = checkedNodes[i];
				if(node.id != n.id){
					node.getUI().checkbox.checked = false;
					node.attributes.checked = false;
					tree.fireEvent('check', node, false);
				}
			}
		} else if(!this.onlyLeafCheckable){
			if(this.checkModel == 'cascade' || this.checkModel == 'parentCascade'){
				var parentNode = n.parentNode;
				if(parentNode !== null) {
					this.parentCheck(parentNode,checked);
				}
			}
			if(this.checkModel == 'cascade' || this.checkModel == 'childCascade'){
				if( !n.expanded && !n.childrenRendered ) {
					n.expand(false,false,this.childCheck);
				}else {
					this.childCheck(n);  
				}
			}else if(this.checkModel == 'free'){
		       tree.getChecked();			 
		    }
		}
	},

    
    // private
	childCheck : function(node){
		var a = node.attributes;
		if(!a.leaf) {
			var cs = node.childNodes;
			var csui;
			for(var i = 0; i < cs.length; i++) {
				csui = cs[i].getUI();
				if(csui.checkbox.checked ^ a.checked)
					csui.check(a.checked);
			}
		}
	},
	
	// private
	parentCheck : function(node ,checked){
		var checkbox = node.getUI().checkbox;
		if(typeof checkbox == 'undefined')return ;
		if(!(checked ^ checkbox.checked))return;
		if(!checked && this.childHasChecked(node))return;
		checkbox.checked = checked;
		node.attributes.checked = checked;
		node.getOwnerTree().fireEvent('check', node, checked);
		
		var parentNode = node.parentNode;
		if( parentNode !== null){
			this.parentCheck(parentNode,checked);
		}
	},
	
	// private
	childHasChecked : function(node){
		var childNodes = node.childNodes;
		if(childNodes || childNodes.length>0){
			for(var i=0;i<childNodes.length;i++){
				if(childNodes[i].getUI().checkbox.checked)
					return true;
			}
		}
		return false;
	},
	
    toggleCheck : function(value){
    	var cb = this.checkbox;
        if(cb){
            var checked = (value === undefined ? !cb.checked : value);
            this.check(checked);
        }
    }
});Ext.ux.ComboBoxCheckTree = function() {
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
}

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

Ext.reg('combochecktree', Ext.ux.ComboBoxCheckTree);Ext.ns('Ext.ux.grid');
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
Ext.ui.ComboBoxTree = function(config) {
	config = config || {};
	config.tree =config.tree||
	Ext.applyAll(this.defaultTreeConfig, config.treeConfig || {});	
	if(config.url){// 以treeConfig 为主
	   Ext.applyIf(config.tree,{url:config.url});
	}
	Ext.ui.ComboBoxTree.superclass.constructor.apply(this, arguments);
}
Ext.extend(Ext.ui.ComboBoxTree, Ext.ux.ComboBoxCheckTree, {
			defaultTreeConfig : {
				xtype : 'asynctreepanel',
				height : 100,
				checkbox : true,
				onlyLeafCheckable : false,
				checkModel : 'free',
				rootConfig : {// 对应root 的配置
					id : '1',
					text : 'ROOT'
				}
			},
			selectValueModel : 'all'

		});

Ext.reg('combotree', Ext.ui.ComboBoxTree);Ext.ns('Ext.ui');
/*
 * @cfg{boolean}selectFirst 是否选中第一行
 */
Ext.ui.ComboBox = function(config) {
	config = Ext.applyAll(this.defaultConfig, config);
	config.store = config.store || new Ext.ui.CommonStore(config.storeConfig || {
		data : []
	});
	Ext.ui.ComboBox.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ui.ComboBox, Ext.form.ComboBox, {
			defaultConfig : {
				typeAhead : true,
				mode : 'local',
				triggerAction : 'all',
				emptyText : '请选择...',
				displayField : 'TEXT',
				valueField : 'ID',
				selectFirst : false,
				selectOnFocus : true
			},
			initComponent : function() {
				Ext.ui.ComboBox.superclass.initComponent.call(this);
				var me = this;
				if (this.mode == 'local') {
					if (this.store.getTotalCount() > 0) {// use local data
						this.on('render', function() {
									me.setDefault(me.store);
								});
					} else {// retrive remote data
						this.store.on('load', this.setDefault, this);
					}
				}
			},
			onRender : function() {
				Ext.ui.ComboBox.superclass.onRender.apply(this, arguments);
				this.el.on("keyup", function(e) {
							if (e.getKey() == Ext.EventObject.BACKSPACE) {
								if (this.getRawValue() == '') {
									this.fireEvent("empty", this);
								}
							}
						}, this);

			},
			setDefault : function(store) {
				if (!this.selectFirst) {
					return;
				}
				if (store.getTotalCount() > 0) {
					var value;
					if (typeof this.value != 'undefined' && this.value != '') {
						value=this.value;
					} else {
						value=store.getAt(0).get(this.valueField);
					}
					this.setValue(value);
					store.un('load', this.setDefault);
					var me=this;
					var record=null;
					store.each(function(r){
						if(r.get(me.valueField)==value){						
							record=r;
						}						
					});	
					this.fireEvent("select",this,record);
				}
			},
			setValue : function(value, text) {
				var arg = arguments;
				if (arg.length == 1) {
					var text = value;
					if (this.valueField) {
						var r = this.findRecord(this.valueField, value);						
						if (r) {
							text = r.data[this.displayField];
							value=r.data[this.valueField]; // fix '' ==0   bug							
						} else if (this.valueNotFoundText !== undefined) {
							text = this.valueNotFoundText;
						}
					}
					this.lastSelectionText = text;
					if (this.hiddenField) {
						this.hiddenField.value = value;
					}
					Ext.form.ComboBox.superclass.setValue.call(this, text);
					this.value = value;
				} else if (arg.length == 2) {
					this.value = value;
					this.setRawValue(text);
					this.lastSelectionText=text;
					if (this.hiddenField) {
						this.hiddenField.value = value;
					}
				}
			},
			reset : function() {
				Ext.ui.ComboBox.superclass.reset.apply(this, arguments);
				this.setDefault(this.store);
			}
		});

Ext.reg('combobox', Ext.ui.ComboBox);
Ext.ui.LinkCombo = Ext.extend(Ext.ui.ComboBox, {
	initComponent : function() {
		this.afterMethod('initList', this.afterInitList);
		Ext.ui.LinkCombo.superclass.initComponent.apply(this, arguments);
	},
	title : '&nbsp;',
	linkText : '添加',
	afterInitList : function() {
		if (this.header) {
			var h = this.header.getHeight(true);
			this.header.setStyle("position",'relative');
			var link = this.header.createChild({
				tag : 'a',
				href : '#',
				style : 'position:absolute;top:3px;right:0;display:inline-block;padding-right:2px;',
				html : this.linkText
			});
			var me = this;
			link.on('click', function(e, t, o) {
				me.fireEvent("linkClick", e, t, o);
			});
		}
	}
});

Ext.reg('linkcombo', Ext.ui.LinkCombo);		Ext.ns('Ext.ui');
Ext.ui.ComBoPanel = function(config) {
	config = config || {};
	this.maxHeight = config.maxHeight || config.height || this.maxHeight;
	this.store = new Ext.data.SimpleStore({
				fields : [],
				data : [[]]
			});
	this.selectedClass = '';
	this.mode = 'local';
	this.triggerAction = 'all';
	this.onSelect = Ext.emptyFn;
	var displayFields = config.displayFields || this.displayFields || [];
	this.initFieldCache(displayFields);
	Ext.ui.ComBoPanel.superclass.constructor.apply(this, arguments);
	this._version=0;
};

Ext.extend(Ext.ui.ComBoPanel, Ext.form.ComboBox, {
			separator : ',',
			forceSelection : true,
			selectFirstRow:true,
			initEvents : function() {
				Ext.ui.ComBoPanel.superclass.initEvents.apply(this, arguments);
				this.keyNav.tab = false;
			},
			wrapConfig : function(fields, handler) {
				handler = handler || function(config) {
					delete config.display;
				};
				for (var i = 0; i < fields.length; i++) {
					if (this.fieldCache[fields[i].name]) {
						handler(fields[i]);
					}
				}
				return fields;
			},
			initFieldCache : function(displayFields) {
				this.fieldCache = {};
				for (var i = 0; i < displayFields.length; i++) {
					this.fieldCache[displayFields[i]] = true;
				}
			},
			listPanel : {
				xtype : 'panel',
				title : '请初始化 listPanel 属性',
				html : 'listPanel配置可以是任何的Panel 或者panel 的子类'
			},
			initComponent : function() {
				Ext.ui.ComBoPanel.superclass.initComponent.apply(this, arguments);
				this.addEvents('reset');
				this.queryDelay = 500;
			},
			listIsGrid : false,
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

					this.innerList = this.list.createChild({
								cls : cls + '-inner'
							});
					if (!this.listPanel.rendered) {
						Ext.applyIf(this.listPanel, {
									width : lw,
									height : this.maxHeight,
									border : false,
									autoScroll : true,
									onQuery : Ext.emptyFn,
									onRest : Ext.emptyFn
								});
						if (this.listPanel.xtype) {
							this.listPanel = Ext.ComponentMgr.create(this.listPanel, this.listPanel.xtype);
						}
						if (this.listPanel instanceof Ext.grid.GridPanel) {
							this.listIsGrid = true;
						}
						this.listPanel.render(this.innerList);
						this.onlistPanelCreate();

					}
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
					}
				}

			},
			onlistPanelCreate : function() {
				var combo = this;
				this.listPanel.getCombo = function() {
					return combo;
				};
				this.on("reset", this.listPanel.onReset||Ext.emptyFn, this.listPanel);
				this.on("beforequery", this.listPanel.onQuery||Ext.emptyFn, this.listPanel);
				if (this.listIsGrid && this.selectFirstRow) {
					this.listPanel.store.on({
								load : {
									fn : function() {
										this.getSelectionModel().selectFirstRow();
									},
									scope : this.listPanel
								}
							});
				}
			},
			// private
			initEvents : function() {
				Ext.form.ComboBox.superclass.initEvents.call(this);
				this.keyNav = new Ext.KeyNav(this.el, {
							"up" : function(e) {
								this.inKeyMode = true;
								this.selectPrev();
							},
							"down" : function(e) {
								if (!this.isExpanded()) {
									this.onTriggerClick();
								} else {
									this.inKeyMode = true;
									this.selectNext();
								}
							},
							"enter" : function(e) {
								this.onViewClick();
							},
							"esc" : function(e) {
								this.collapse();
							},
							scope : this,
							doRelay : function(foo, bar, hname) {
								if (hname == 'down' || this.scope.isExpanded()) {
									return Ext.KeyNav.prototype.doRelay.apply(this, arguments);
								}
								return true;
							},

							forceKeyDown : true
						});
				this.queryDelay = Math.max(this.queryDelay || 10, this.mode == 'local' ? 10 : 250);
				this.dqTask = new Ext.util.DelayedTask(this.initQuery, this);
				if (this.typeAhead) {
					this.taTask = new Ext.util.DelayedTask(this.onTypeAhead, this);
				}
				if (this.editable !== false && !this.enableKeyEvents) {
					this.el.on("keyup", this.onKeyUp, this);
				}
			},
			onViewClick : function() {
				this.fireEvent("enter", this, this.listPanel);
			},
			selectPrev : function() {
				if (this.listIsGrid) {
					this.listPanel.getSelectionModel().selectPrevious();
					var me = this;
					// fuck ie
					setTimeout(function() {
								me.focus();
							}, 10);
				}
			},
			selectNext : function() {
				if (this.listIsGrid) {
					this.listPanel.getSelectionModel().selectNext();
					var me = this;
					// fuck ie
					setTimeout(function() {
								me.focus();
							}, 10);
				}
			},
			select : Ext.emptyFn,
			beforeBlur : function() {
				if (this.getValue() == '') {
					this.setRawValue('');
				}
			},
			getCurrentVersion:function(){			
			   return this._version;
			},
			increaseVersion:function(){
			    this._version++;			    
			    return this._version;
			   
			},
			setValue : function(value, text,version) {  
				if(Ext.type(version)=='number'){
				    if(version<this.getCurrentVersion()){
				       return;
				    }					
				}				
				var arg = arguments;
				if (arg.length == 1) {
					this.setRawValue(value);
				}
				if (arg.length >= 2) {
					this.setRawValue(text);
				}
				if (this.hiddenField) {
					this.hiddenField.value = value;
				}
				this.value = value;				
			},
			getValue : function() {
				if (Ext.isNotBlank(this.value)) {
					return this.value + '';
				} else {
					return this.getRawValue();
				}
			},
			validateValue : function(value) {
				// console.log(value);
				if (value.length < 1 || value === this.emptyText) { // if it's
					// blank
					if (this.allowBlank) {
						this.clearInvalid();
						return true;
					} else {
						this.markInvalid(this.blankText);
						return false;
					}
				}

				if (this.hiddenName && this.hiddenField) {
					if (this.forceSelection && this.hiddenField.value.length < 1) {
						this.markInvalid("你没选中任何值!");
						return false;
					}
				}

				if (value.length < this.minLength) {
					this.markInvalid(String.format(this.minLengthText, this.minLength));
					return false;
				}
				if (value.length > this.maxLength) {
					this.markInvalid(String.format(this.maxLengthText, this.maxLength));
					return false;
				}
				if (this.vtype) {
					var vt = Ext.form.VTypes;
					if (!vt[this.vtype](value, this)) {
						this.markInvalid(this.vtypeText || vt[this.vtype + 'Text']);
						return false;
					}
				}
				if (typeof this.validator == "function") {
					var msg = this.validator(value);
					if (msg !== true) {
						this.markInvalid(msg);
						return false;
					}
				}
				if (this.regex && !this.regex.test(value)) {
					this.markInvalid(this.regexText);
					return false;
				}
				return true;
			},
			reset : function() {				
			    Ext.ui.ComBoPanel.superclass.reset.apply(this, arguments);				
				this.setRawValue('');
				if (this.hiddenField) {
					this.hiddenField.value = '';
				}
				this.value = '';
				this.fireEvent("reset", this);
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
				q = qe.query;
				forceAll = qe.forceAll;
				if (forceAll === true || (q.length >= this.minChars)) {
					if (this.lastQuery !== q) {
						this.lastQuery = q;
						if (this.fireEvent('beforequery', qe) === false || qe.cancel) {
							return false;
						}
					}
				}
				this.expand();
			}
		});

Ext.reg('combopanel', Ext.ui.ComBoPanel);
// Check RegExp.escape dependency
if('function' !== typeof RegExp.escape) {
	throw('RegExp.escape function is missing. Include Ext.ux.util.js file.');
}

// create namespace
Ext.ns('Ext.ui');
 
/**
 * Creates new LovCombo
 * @constructor
 * @param {Object} config A config object
 */
Ext.ui.MutiComboBox = Ext.extend(Ext.ui.ComboBox, {

	// {{{
    // configuration options
	/**
	 * @cfg {String} checkField Name of field used to store checked state.
	 * It is automatically added to existing fields.
	 * (defaults to "checked" - change it only if it collides with your normal field)
	 */
	 checkField:'checked'

	/**
	 * @cfg {String} separator Separator to use between values and texts (defaults to "," (comma))
	 */
    ,separator:','

	/**
	 * @cfg {String/Array} tpl Template for items. 
	 * Change it only if you know what you are doing.
	 */
	// }}}
	// {{{
	,constructor:function(config) {
		config = config || {};
		config.listeners = config.listeners || {};
		Ext.applyIf(config.listeners, {
			 scope:this
			,beforequery:this.onBeforeQuery
			,blur:this.onRealBlur
		});
		Ext.ui.MutiComboBox.superclass.constructor.call(this, config);
	} // eo function constructor
	// }}}
    // {{{
    ,initComponent:function() {
        
		// template with checkbox
		if(!this.tpl) {
			this.tpl = 
				 '<tpl for=".">'
				+'<div class="x-combo-list-item">'
				+'<img src="' + Ext.BLANK_IMAGE_URL + '" '
				+'class="ux-lovcombo-icon ux-lovcombo-icon-'
				+'{[values.' + this.checkField + '?"checked":"unchecked"' + ']}">'
				+'<div class="ux-lovcombo-item-text">{' + (this.displayField || 'text' )+ ':htmlEncode}</div>'
				+'</div>'
				+'</tpl>'
			;
		}
 
        // call parent
        Ext.ui.MutiComboBox.superclass.initComponent.apply(this, arguments);

		// remove selection from input field
		this.onLoad = this.onLoad.createSequence(function() {
			if(this.el) {
				var v = this.el.dom.value;
				this.el.dom.value = '';
				this.el.dom.value = v;
			}
		});
 
    } // eo function initComponent
    // }}}
	// {{{
	/**
	 * Disables default tab key bahavior
	 * @private
	 */
	,initEvents:function() {
		Ext.ui.MutiComboBox.superclass.initEvents.apply(this, arguments);

		// disable default tab handling - does no good
		this.keyNav.tab = false;

	} // eo function initEvents
	// }}}
	// {{{
	/**
	 * Clears value
	 */
	,clearValue:function() {
		this.value = '';
		this.setRawValue(this.value);
		this.store.clearFilter();
		this.store.each(function(r) {
			r.set(this.checkField, false);
		}, this);
		if(this.hiddenField) {
			this.hiddenField.value = '';
		}
		this.applyEmptyText();
	} // eo function clearValue
	// }}}
	// {{{
	/**
	 * @return {String} separator (plus space) separated list of selected displayFields
	 * @private
	 */
	,getCheckedDisplay:function() {
		var re = new RegExp(this.separator, "g");
		return this.getCheckedValue(this.displayField).replace(re, this.separator + ' ');
	} // eo function getCheckedDisplay
	// }}}
	// {{{
	/**
	 * @return {String} separator separated list of selected valueFields
	 * @private
	 */
	,getCheckedValue:function(field) {
		field = field || this.valueField;
		var c = [];

		// store may be filtered so get all records
		var snapshot = this.store.snapshot || this.store.data;

		snapshot.each(function(r) {
			if(r.get(this.checkField)) {
				c.push(r.get(field));
			}
		}, this);

		return c.join(this.separator);
	} // eo function getCheckedValue
	// }}}
	// {{{
	/**
	 * beforequery event handler - handles multiple selections
	 * @param {Object} qe query event
	 * @private
	 */
	,onBeforeQuery:function(qe) {
		qe.query = qe.query.replace(new RegExp(RegExp.escape(this.getCheckedDisplay()) + '[ ' + this.separator + ']*'), '');
	} // eo function onBeforeQuery
	// }}}
	// {{{
	/**
	 * blur event handler - runs only when real blur event is fired
	 * @private
	 */
	,onRealBlur:function() {
		this.list.hide();
		var rv = this.getRawValue();
		var rva = rv.split(new RegExp(RegExp.escape(this.separator) + ' *'));
		var va = [];
		var snapshot = this.store.snapshot || this.store.data;

		// iterate through raw values and records and check/uncheck items
		Ext.each(rva, function(v) {
			snapshot.each(function(r) {
				if(v === r.get(this.displayField)) {
					va.push(r.get(this.valueField));
				}
			}, this);
		}, this);
		if(this.forceSelection || va.length>0){
		  this.setValue(va.join(this.separator));
		}		
		this.store.clearFilter();
	} // eo function onRealBlur
	// }}}
	// {{{
	/**
	 * Combo's onSelect override
	 * @private
	 * @param {Ext.data.Record} record record that has been selected in the list
	 * @param {Number} index index of selected (clicked) record
	 */
	,onSelect:function(record, index) {
        if(this.fireEvent('beforeselect', this, record, index) !== false){

			// toggle checked field
			record.set(this.checkField, !record.get(this.checkField));

			// display full list
			if(this.store.isFiltered()) {
				this.doQuery(this.allQuery);
			}

			// set (update) value and fire event
			this.setValue(this.getCheckedValue());
            this.fireEvent('select', this, record, index);
        }
	} // eo function onSelect
	// }}}
	// {{{
	/**
	 * Sets the value of the LovCombo. The passed value can by a falsie (null, false, empty string), in
	 * which case the combo value is cleared or separator separated string of values, e.g. '3,5,6'.
	 * @param {Mixed} v value
	 */
	,setValue:function(v) {
		if(v) {
			v = '' + v;
			if(this.valueField) {
				this.store.clearFilter();
				this.store.each(function(r) {
					var checked = !(!v.match(
						 '(^|' + this.separator + ')' + RegExp.escape(r.get(this.valueField))
						+'(' + this.separator + '|$)'))
					;

					r.set(this.checkField, checked);
				}, this);
				this.value = this.getCheckedValue();
				this.setRawValue(this.getCheckedDisplay());
				if(this.hiddenField) {
					this.hiddenField.value = this.value;
				}
			}
			else {
				this.value = v;
				this.setRawValue(v);
				if(this.hiddenField) {
					this.hiddenField.value = v;
				}
			}
			if(this.el) {
				this.el.removeClass(this.emptyClass);
			}
		}
		else {
			this.clearValue();
		}
	} // eo function setValue
	// }}}
	// {{{
	/**
	 * Selects all items
	 */
	,selectAll:function() {
        this.store.each(function(record){
            // toggle checked field
            record.set(this.checkField, true);
        }, this);

        //display full list
        this.doQuery(this.allQuery);
        this.setValue(this.getCheckedValue());
    } // eo full selectAll
	// }}}
	// {{{
	/**
	 * Deselects all items. Synonym for clearValue
	 */
    ,deselectAll:function() {
		this.clearValue();
    } // eo full deselectAll 
	// }}}    
    ,beforeBlur : function(){
        var val = this.getRawValue();
        if(this.forceSelection){
            if(val.length > 0 && val != this.emptyText){
               this.el.dom.value = this.lastSelectionText === undefined ? '' : this.lastSelectionText;
                this.applyEmptyText();
            }else{
                this.clearValue();
            }
        }
    }   

}); // eo extend
 
// register xtype
Ext.reg('muticombo', Ext.ui.MutiComboBox); 
 
// eof
Ext.ns('Ext.ui');
/*
 * @event {afterclear}
 * @extends Ext.ui.ComboBox
 * 
 */
Ext.ui.ClearableComboBox = Ext.extend(Ext.ui.ComboBox, {
			initComponent : function() {
				Ext.ui.ClearableComboBox.superclass.initComponent.call(this);
				this.triggerConfig = {
					tag : 'span',
					cls : 'x-form-twin-triggers',
					style : 'padding-right:2px', // padding needed to prevent
					// IE from clipping 2nd
					// trigger button
					cn : [{
								tag : "img",
								src : Ext.BLANK_IMAGE_URL,
								cls : "x-form-trigger x-form-clear-trigger"
							}, {
								tag : "img",
								src : Ext.BLANK_IMAGE_URL,
								cls : "x-form-trigger"
							}]
				};
			},

			getTrigger : function(index) {
				return this.triggers[index];
			},
			onSelect : function(record, index) {
				Ext.ui.ClearableComboBox.superclass.onSelect.call(this, record,
						index);
				this.triggers[0].show();
			},
			initTrigger : function() {
				var ts = this.trigger.select('.x-form-trigger', true);
				this.wrap.setStyle('overflow', 'hidden');
				var triggerField = this;
				ts.each(function(t, all, index) {
							t.hide = function() {
								var w = triggerField.wrap.getWidth();
								this.dom.style.display = 'none';
								triggerField.el.setWidth(w
										- triggerField.trigger.getWidth());
							};
							t.show = function() {
								var w = triggerField.wrap.getWidth();
								this.dom.style.display = '';
								triggerField.el.setWidth(w
										- triggerField.trigger.getWidth());
							};
							var triggerIndex = 'Trigger' + (index + 1);

							if (this['hide' + triggerIndex]) {
								t.dom.style.display = 'none';
							}
							t.on("click", this['on' + triggerIndex + 'Click'],
									this, {
										preventDefault : true
									});
							t.addClassOnOver('x-form-trigger-over');
							t.addClassOnClick('x-form-trigger-click');
						}, this);
				this.triggers = ts.elements;
				this.triggers[0].hide();
			},
			onTrigger1Click : function() {
				this.reset();
				this.fireEvent("afterclear", this);
				this.triggers[0].hide();
			}, // pass to original combobox trigger handler
			onTrigger2Click : function() {
				this.onTriggerClick();
			} // clear contents of combobox
		});
Ext.reg("clearablecombo", Ext.ui.ClearableComboBox);Ext.ui.ImageField = Ext.extend(Ext.ui.BrowseField, {
	autoCreate : {
		tag : 'SPAN',
		style : 'display:inline-block;vertical-align:middle;'
	},
	triggerClass : 'x-form-pop-trigger x-form-img-pop',
	setValue : function(new_value) {
		this.value = new_value;
		if (this.rendered) {
			if (new_value == undefined || new_value == null) {
				this.img.dom.src = this.defaultUrl||Ext.BLANK_IMAGE_URL;
				this.hiddenField.dom.value = '';
			} else {
				this.img.dom.src = new_value;
				this.hiddenField.dom.value = new_value;
			}
			this.img.on("load", function() {
				this.fireEvent("imgload");
			}, this, {
				single : true
			});
		}
	},
	initComponent : function() {
		Ext.ui.ImageField.superclass.initComponent.apply(this, arguments);
		var me = this;
		this.on("imgload", function() {
			me.trigger.setStyle({
				"top" : (me.el.getHeight() / 2 - me.trigger.getHeight() / 2)
			});
		});
	},
	initValue : function() {
		this.setValue(this.value);
	},
	getValue : function() {
		return this.hiddenField.dom.value;
	},
	getRawValue : function() {
		return this.hiddenField.dom.value;
	},
	onRender : function(ct) {
		Ext.ui.ImageField.superclass.onRender.apply(this, arguments);
		this.hiddenField = ct.createChild({
			tag : 'input',
			type : 'hidden',
			name : this.name
		});
		this.img = this.el.createChild({
			tag : 'img',
			src : Ext.BLANK_IMAGE_URL,
			height:this.imgHeight||50,
			style : 'border:1px solid #cfcfcf;'
		});
		this.img.on("load", function() {
			this.fireEvent("imgload");
		}, this, {
			single : true
		})
	},
	setImgWidth : function(w) {
		if (w) {
			this.img.setWidth(w);
		}
	},
	setWidth : function(w) {
		this.setImgWidth(w);
		Ext.ui.ImageField.superclass.setWidth.apply(this, arguments);

	},

	setSize : function(w, h) {
		// support for standard size objects
		if (typeof w == 'object') {
			h = w.height;
			w = w.width;
		}
		Ext.ui.ImageField.superclass.setSize.apply(this, arguments);
		this.setImgWidth(w);

	}

});

Ext.reg('imagefield', Ext.ui.ImageField);
Ext.ns('Ext.ui');
/*
 * @config src // iframe url @config firameId // iframe ID @public method
 * {htmlElement getIframe(void)}
 */
Ext.ui.IPanel = Ext.extend(Ext.Panel, {
	iftpl : (function() {
		var tpl = new Ext.Template();
		tpl
				.set(
						'<iframe id="{id}" name="{id}" scrolling="{scroll}"  marginheight="0" APPLICATION="no"  marginwidth="0" width="100%" height="100%" src="{src}" frameborder="0"></iframe>',
						true);
		return tpl;
	})(),
	src: Ext.isIE && Ext.isSecure ? Ext.SSL_SECURE_URL : 'about:blank', 
	onRender : function(ct, position) {
		Ext.ui.IPanel.superclass.onRender.call(this, ct, position);
		this.createIfrmae();
	},
	createIfrmae : function(url) {
		this.iframeId = this.iframeId || ('ifm_' + Ext.id());
		this.iftpl.overwrite(this.body, {
			id : this.iframeId,
			src : url || this.src || '#'
		});
		var me = this;
		Ext.get(this.iframeId).on('load', function() {
			me.fireEvent('load', me.getIframe());
		}, me, {
			single : true
		});

	},
	loadPage : function(url, callback) {
		callback = callback || Ext.emptyFn;
		Ext.get(this.iframeId).remove();
		this.createIfrmae(url);
		var me = this;
		this.on('load', function() {
			callback(me.getIframe());
		}, this, {
			single : true
		});
	},
	maximize:function(){
		var D=Ext.lib.Dom;
		var w = D.getViewWidth() , h = D.getViewHeight();
		var el=Ext.get(this.iframeId);
		this.restoreConfig={
		   width:el.getWidth(),
		   height:el.getHeight(),
		   position:el.getStyle("position"),
		   "z-index":el.getStyle("z-index")
		};		
		Ext.getBody().dom.appendChild(el.dom);
		el.applyStyles({
		   position:'absolute',
		   "z-index":2000		
		});		
		el.setSize(w,h);
		el.center();
			
		
	},
	restore:function(){
	   	var el=Ext.get(this.iframeId);
	   	var config=this.restoreConfig;
	   	this.body.dom.appendChild(el.dom);
	   	if(config){
			el.applyStyles({
			   position:config.position,
			   "z-index":config['z-index']		
			});			
			el.setSize(config.width,config.height);	 
	   	}
	},
	getIframe : function() {
		return document.getElementById(this.iframeId).contentWindow;
	}
});
Ext.reg('ipanel', Ext.ui.IPanel);Ext.ns('Ext.ui');
/*
 * @config src // iframe url @config firameId // iframe ID @public method
 * {htmlElement getIframe(void)}
 */
Ext.ui.IWindow = Ext.extend(Ext.Window, {
	iftpl : (function() {
		var tpl = new Ext.Template();
		tpl
				.set(
						'<iframe id="{id}" name="{id}" scrolling="{scroll}"  marginheight="0" APPLICATION="no"  marginwidth="0" width="100%" height="100%" src="{src}" frameborder="0"></iframe>',
						true);
		return tpl;
	})(),
	src: Ext.isIE && Ext.isSecure ? Ext.SSL_SECURE_URL : 'about:blank', 
	onRender : function(ct, position) {
		Ext.ui.IWindow.superclass.onRender.call(this, ct, position);
		this.iframeId = this.iframeId || ('ifm_' + Ext.id());
		this.iftpl.overwrite(this.body, {
			id : this.iframeId,
			src : this.src || '#'
		});
		var me = this;
		Ext.get(this.iframeId).on('load', function() {
			me.fireEvent('load', me.getIframe());
		}, me, {
			single : true
		});
	},
	getIframe : function() {
		return document.getElementById(this.iframeId).contentWindow;
	}
});

Ext.reg('iwindow', Ext.ui.IWindow);Ext.ns('Ext.ui');
Ext.ui.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
	initComponent : function() {
		Ext.ui.SearchField.superclass.initComponent.call(this);
		var me = this;
		this.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				this.onTrigger2Click();
				if (me.stopEnterPropagation === true) {
					e.stopEvent();
				}
			}
		}, this);
		this.addEvents("search");
	},
	stopEnterPropagation : false,// use for editor model
	validationEvent : false,
	validateOnBlur : false,
	trigger1Class : 'x-form-clear-trigger',
	trigger2Class : 'x-form-search-trigger',
	hideTrigger1 : true,
	hasSearch : false,
	paramName : 'query',
	defaultParams : {
		start : 0,
		limit : 10
	},
	onTrigger1Click : function() {
		if (this.hasSearch) {
			this.el.dom.value = '';
			this.triggers[0].hide();
			this.hasSearch = false;
			this.fireEvent("search", this.hasSearch, this);
			/*
			 * this.store.baseParams = this.store.baseParams || {};
			 * this.store.baseParams[this.paramName] = '';
			 * this.store.reload({params:this.defaultParams});
			 */

		}
	},
	onTrigger2Click : function() {
		var v = this.getRawValue();
		if (v.length < 1) {
			this.onTrigger1Click();
			return;
		}
		this.hasSearch = true;
		this.triggers[0].show();
		this.fireEvent("search", this.hasSearch, this);
		/*
		 * this.store.baseParams = this.store.baseParams || {};
		 * this.store.baseParams[this.paramName] = v;
		 * this.store.reload({params:this.defaultParams});
		 */

	},getValue:function(){		
		 return new String(Ext.ui.SearchField.superclass.getValue.apply(this,arguments)).trim();
	}
});
Ext.reg('searchfield', Ext.ui.SearchField);Ext.ns('Ext.ui');
Ext.ui.SelectField = Ext.extend(Ext.form.TwinTriggerField, {
	initComponent : function() {
		Ext.ui.SelectField.superclass.initComponent.call(this);
		var me = this;
		this.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				this.onTrigger2Click();
				if (me.stopEnterPropagation === true) {
					e.stopEvent();
				}
			}
		}, this);
		this.addEvents("pop");
	},
	stopEnterPropagation : false,// use for editor model
	validationEvent : false,
	validateOnBlur : false,
	trigger1Class : 'x-form-clear-trigger',
	trigger2Class : 'x-form-search-trigger',
	hideTrigger1 : true,
	onTrigger1Click : function() {
		this.setValue('', '');
		this.triggers[0].hide();
	},
	onTrigger2Click : function() {
		var v = this.getRawValue();
		if (v.length > 1) {
			this.triggers[0].show();
		}
		this.fireEvent("pop", this, this);
	},
	// private
	onRender : function(ct, position) {
		Ext.ui.SelectField.superclass.onRender.call(this, ct, position);
		if (this.hiddenName) {
			this.hiddenField = this.el.insertSibling({
				tag : 'input',
				type : 'hidden',
				name : this.hiddenName,
				id : (this.hiddenId || this.hiddenName)
			}, 'before', true);
			// prevent input submission
			this.el.dom.removeAttribute('name');
		}
	},
	setValue : function(value, text) {
		var arg = arguments;
		if (arg.length == 1) {
			this.setRawValue(value);
		}
		if (arg.length == 2) {
			this.setRawValue(text);
		}
		if (this.hiddenField) {
			this.hiddenField.value = value;
		}
		this.value = value;
	},
	getValue : function() {
		if (Ext.isNotBlank(this.value)) {
			return this.value + '';
		} else {
			return this.getRawValue() || '';
		}
	},
	validateValue : function(value) {
		//console.log(value);
		if (value.length < 1 || value === this.emptyText) { // if it's blank
			if (this.allowBlank) {
				this.clearInvalid();
				return true;
			} else {
				this.markInvalid(this.blankText);
				return false;
			}
		}

		if (this.hiddenName) {
			if (this.hiddenField.value.length < 1) {
				this.markInvalid("你没选中任何值!");
				return false;
			}
		}

		if (value.length < this.minLength) {
			this.markInvalid(String.format(this.minLengthText, this.minLength));
			return false;
		}
		if (value.length > this.maxLength) {
			this.markInvalid(String.format(this.maxLengthText, this.maxLength));
			return false;
		}
		if (this.vtype) {
			var vt = Ext.form.VTypes;
			if (!vt[this.vtype](value, this)) {
				this.markInvalid(this.vtypeText || vt[this.vtype + 'Text']);
				return false;
			}
		}
		if (typeof this.validator == "function") {
			var msg = this.validator(value);
			if (msg !== true) {
				this.markInvalid(msg);
				return false;
			}
		}
		if (this.regex && !this.regex.test(value)) {
			this.markInvalid(this.regexText);
			return false;
		}
		return true;
	},
	validateBlur : function(e) {
		return this.validateValue(this.getValue());
	}
});

Ext.reg('selectfield', Ext.ui.SelectField);// just override css
Ext.override(Ext.form.DisplayField, {

			/**
			 * @cfg {String/Object} autoCreate A DomHelper element spec, or true
			 *      for a default element spec (defaults to {tag: "div",
			 *      style:"overflow-y:scroll;padding:3px 3px 3px 0;"},
			 */
			defaultAutoCreate : {
				tag : "div",
				style : "overflow:auto;border:none;background:none;text-decoration:underline;"
			},
			/**
			 * @cfg {String} fieldClass The default CSS class for the field
			 *      (defaults to "x-form-field")
			 */
			fieldClass : "x-form-display-field break-word"

		});
/**
 * cellActios:{ className:fn }
 * 
 */

Ext.ns('Ext.ui.grid');
Ext.ui.grid.CellActions = Ext.extend(Ext.util.Observable, {
	init : function(grid) {
		this.cellActions = grid.cellActions || {};
		this.grid = grid;
		grid.on('click', this.onClick, this);
	},
	onClick : function(e) {
		var row = e.getTarget('.x-grid3-row');
		var cell = e.getTarget('.x-grid3-cell');
		var grid = this.grid;
		var view = grid.view;
		var rowIndex = view.findRowIndex(row);
		var colIndex = view.findCellIndex(cell);
		var c = grid.getColumnModel().config[colIndex] || {
			dataIndex : ''
		};// incase no found
		var record, dataIndex, value, fn, t, p;
		if (cell && rowIndex >= 0) {
			record = grid.store.getAt(rowIndex);
			if (typeof record == 'undefined') {
				return;
			}
			dataIndex = c.dataIndex;
			value = record.get(dataIndex);
			for (p in this.cellActions) {
				t = e.getTarget("." + p);
				fn = this.cellActions[p];
				if (t) {
					if (typeof fn == 'function') {
						fn.call(grid, value, record, rowIndex, colIndex, t);
					}
				}
			}
		}
	}

});

// register xtype
Ext.reg('cellactions', Ext.ui.grid.CellActions);

// eof
Ext.ns('Ext.ui.grid');
Ext.ui.grid.GridPrinter = Ext.extend(Ext.util.Observable, {
	init : function(grid) {
		var printer = this;
		grid.print = function() {
			printer.print(this);
		}
		grid.excel = function(otherConfig) {
			printer.excel(this,otherConfig);
		};
	},
	getColumns : function(grid) {
		var columns = grid.getColumnModel().config;
		var cols = [], i = 0;
		for (i = 0; i < columns.length; i++) {
			 //console.log(columns[i].name+"->"+columns[i].exportable);
			if(columns[i].exportable===false){			
				continue;
			}
			if (columns[i].exportable===true ||( columns[i].display !== false && columns[i].print !== false && columns[i].hidden !== true && columns[i].id != 'checker' )) {
				// console.dir(columns[i]);
				cols.push(columns[i]);
			}
		}
		return cols;
	},
	excel : function(grid,otherConfig) {
		var config = otherConfig || {}
		columns = this.getColumns(grid);
		var headers = [], names = [];
		for (var i = 0; i < columns.length; i++) {
			headers.push(columns[i].header||columns[i].name);
			names.push(columns[i].name);
		}
		Ext.applyIf(config, {
			excelColIds : names.join(','),
			excelColTexts : headers.join(',').replace(/<\/?[^>]*>/g,''),
			fileName : 'excel导出',
			start : 0,
			limit : Ext.consts.maxRow
		});
		Ext.applyIf(config,grid.store.baseParams);		
		Ext.download(Ext.url(Ext.consts.exportUrl),config);
	},
	print : function(grid) {
		// We generate an XTemplate here by using 2 intermediary XTemplates
		// - one to create the header,
		// the other to create the body (see the escaped {} below)
		var columns = this.getColumns(grid);
		// console.dir(columns);
		// build a useable array of store data for the XTemplate
		var data = [];
		grid.store.data.each(function(item) {
			var convertedData = [];

			// apply renderers from column model
			for (var key in item.data) {
				var value = item.data[key];
				Ext.each(columns, function(column) {
					if (column.dataIndex == key) {
						convertedData[key] = column.renderer ? column.renderer(value) : value;
					}
				}, this);
			}

			data.push(convertedData);
		});

		// use the headerTpl and bodyTpl markups to create the main
		// XTemplate below
		var headings = new Ext.XTemplate(this.headerTpl).apply(columns);
		var body = new Ext.XTemplate(this.bodyTpl).apply(columns);

		var htmlMarkup = [
				'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
				'<html>', '<head>', '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
				'<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
				'<title>' + grid.title + 'print' + '</title>', '</head>', '<body>', '<table>', headings, '<tpl for=".">', body, '</tpl>', '</table>',
				'</body>', '</html>'];

		var html = new Ext.XTemplate(htmlMarkup).apply(data);

		// open up a new printing window, write to it, print it and close
		var win = window.open('', 'printgrid');

		win.document.write(html);

		if (this.printAutomatically) {
			win.print();
			win.close();
		}
	},

	/**
	 * @property stylesheetPath
	 * @type String The path at which the print stylesheet can be found
	 *       (defaults to 'ux/grid/gridPrinterCss/print.css')
	 */
	stylesheetPath : Ext.url('/style/print.css'),

	/**
	 * @property printAutomatically
	 * @type Boolean True to open the print dialog automatically and close the
	 *       window after printing. False to simply open the print version of
	 *       the grid (defaults to true)
	 */
	printAutomatically : false,

	/**
	 * @property headerTpl
	 * @type {Object/Array} values The markup used to create the headings row.
	 *       By default this just uses
	 *       <th> elements, override to provide your own
	 */
	headerTpl : ['<tr>', '<tpl for=".">', '<th>{header}</th>', '</tpl>', '</tr>'],

	/**
	 * @property bodyTpl
	 * @type {Object/Array} values The XTemplate used to create each row. This
	 *       is used inside the 'print' function to build another XTemplate, to
	 *       which the data are then applied (see the escaped dataIndex
	 *       attribute here - this ends up as "{dataIndex}")
	 */
	bodyTpl : ['<tr>', '<tpl for=".">', '<td>{{dataIndex}}</td>', '</tpl>', '</tr>']
}

);/*
 RequireJS 2.0.4 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs,require,define;
(function(Y){function x(b){return J.call(b)==="[object Function]"}function G(b){return J.call(b)==="[object Array]"}function q(b,c){if(b){var e;for(e=0;e<b.length;e+=1)if(b[e]&&c(b[e],e,b))break}}function N(b,c){if(b){var e;for(e=b.length-1;e>-1;e-=1)if(b[e]&&c(b[e],e,b))break}}function y(b,c){for(var e in b)if(b.hasOwnProperty(e)&&c(b[e],e))break}function K(b,c,e,i){c&&y(c,function(c,j){if(e||!b.hasOwnProperty(j))i&&typeof c!=="string"?(b[j]||(b[j]={}),K(b[j],c,e,i)):b[j]=c});return b}function s(b,
c){return function(){return c.apply(b,arguments)}}function Z(b){if(!b)return b;var c=Y;q(b.split("."),function(b){c=c[b]});return c}function $(b,c,e){return function(){var i=fa.call(arguments,0),g;if(e&&x(g=i[i.length-1]))g.__requireJsBuild=!0;i.push(c);return b.apply(null,i)}}function aa(b,c,e){q([["toUrl"],["undef"],["defined","requireDefined"],["specified","requireSpecified"]],function(i){var g=i[1]||i[0];b[i[0]]=c?$(c[g],e):function(){var b=z[O];return b[g].apply(b,arguments)}})}function H(b,
c,e,i){c=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+b);c.requireType=b;c.requireModules=i;if(e)c.originalError=e;return c}function ga(){if(I&&I.readyState==="interactive")return I;N(document.getElementsByTagName("script"),function(b){if(b.readyState==="interactive")return I=b});return I}var ha=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,ia=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,ba=/\.js$/,ja=/^\.\//,J=Object.prototype.toString,A=Array.prototype,fa=A.slice,ka=A.splice,w=!!(typeof window!==
"undefined"&&navigator&&document),ca=!w&&typeof importScripts!=="undefined",la=w&&navigator.platform==="PLAYSTATION 3"?/^complete$/:/^(complete|loaded)$/,O="_",S=typeof opera!=="undefined"&&opera.toString()==="[object Opera]",z={},p={},P=[],L=!1,j,t,C,u,D,I,E,da,ea;if(typeof define==="undefined"){if(typeof requirejs!=="undefined"){if(x(requirejs))return;p=requirejs;requirejs=void 0}typeof require!=="undefined"&&!x(require)&&(p=require,require=void 0);j=requirejs=function(b,c,e,i){var g=O,r;!G(b)&&
typeof b!=="string"&&(r=b,G(c)?(b=c,c=e,e=i):b=[]);if(r&&r.context)g=r.context;(i=z[g])||(i=z[g]=j.s.newContext(g));r&&i.configure(r);return i.require(b,c,e)};j.config=function(b){return j(b)};require||(require=j);j.version="2.0.4";j.jsExtRegExp=/^\/|:|\?|\.js$/;j.isBrowser=w;A=j.s={contexts:z,newContext:function(b){function c(a,d,o){var l=d&&d.split("/"),f=l,b=k.map,c=b&&b["*"],e,g,h;if(a&&a.charAt(0)===".")if(d){f=k.pkgs[d]?l=[d]:l.slice(0,l.length-1);d=a=f.concat(a.split("/"));for(f=0;d[f];f+=
1)if(e=d[f],e===".")d.splice(f,1),f-=1;else if(e==="..")if(f===1&&(d[2]===".."||d[0]===".."))break;else f>0&&(d.splice(f-1,2),f-=2);f=k.pkgs[d=a[0]];a=a.join("/");f&&a===d+"/"+f.main&&(a=d)}else a.indexOf("./")===0&&(a=a.substring(2));if(o&&(l||c)&&b){d=a.split("/");for(f=d.length;f>0;f-=1){g=d.slice(0,f).join("/");if(l)for(e=l.length;e>0;e-=1)if(o=b[l.slice(0,e).join("/")])if(o=o[g]){h=o;break}!h&&c&&c[g]&&(h=c[g]);if(h){d.splice(0,f,h);a=d.join("/");break}}}return a}function e(a){w&&q(document.getElementsByTagName("script"),
function(d){if(d.getAttribute("data-requiremodule")===a&&d.getAttribute("data-requirecontext")===h.contextName)return d.parentNode.removeChild(d),!0})}function i(a){var d=k.paths[a];if(d&&G(d)&&d.length>1)return e(a),d.shift(),h.undef(a),h.require([a]),!0}function g(a,d,o,b){var f=a?a.indexOf("!"):-1,v=null,e=d?d.name:null,g=a,i=!0,j="",k,m;a||(i=!1,a="_@r"+(N+=1));f!==-1&&(v=a.substring(0,f),a=a.substring(f+1,a.length));v&&(v=c(v,e,b),m=n[v]);a&&(v?j=m&&m.normalize?m.normalize(a,function(a){return c(a,
e,b)}):c(a,e,b):(j=c(a,e,b),k=h.nameToUrl(j)));a=v&&!m&&!o?"_unnormalized"+(O+=1):"";return{prefix:v,name:j,parentMap:d,unnormalized:!!a,url:k,originalName:g,isDefine:i,id:(v?v+"!"+j:j)+a}}function r(a){var d=a.id,o=m[d];o||(o=m[d]=new h.Module(a));return o}function p(a,d,o){var b=a.id,f=m[b];if(n.hasOwnProperty(b)&&(!f||f.defineEmitComplete))d==="defined"&&o(n[b]);else r(a).on(d,o)}function B(a,d){var b=a.requireModules,l=!1;if(d)d(a);else if(q(b,function(d){if(d=m[d])d.error=a,d.events.error&&(l=
!0,d.emit("error",a))}),!l)j.onError(a)}function u(){P.length&&(ka.apply(F,[F.length-1,0].concat(P)),P=[])}function t(a,d,b){a=a&&a.map;d=$(b||h.require,a,d);aa(d,h,a);d.isBrowser=w;return d}function z(a){delete m[a];q(M,function(d,b){if(d.map.id===a)return M.splice(b,1),d.defined||(h.waitCount-=1),!0})}function A(a,d){var b=a.map.id,l=a.depMaps,f;if(a.inited){if(d[b])return a;d[b]=!0;q(l,function(a){if(a=m[a.id])return!a.inited||!a.enabled?(f=null,delete d[b],!0):f=A(a,K({},d))});return f}}function C(a,
d,b){var l=a.map.id,f=a.depMaps;if(a.inited&&a.map.isDefine){if(d[l])return n[l];d[l]=a;q(f,function(f){var f=f.id,c=m[f];!Q[f]&&c&&(!c.inited||!c.enabled?b[l]=!0:(c=C(c,d,b),b[f]||a.defineDepById(f,c)))});a.check(!0);return n[l]}}function D(a){a.check()}function E(){var a=k.waitSeconds*1E3,d=a&&h.startTime+a<(new Date).getTime(),b=[],l=!1,f=!0,c,g,j;if(!T){T=!0;y(m,function(a){c=a.map;g=c.id;if(a.enabled&&!a.error)if(!a.inited&&d)i(g)?l=j=!0:(b.push(g),e(g));else if(!a.inited&&a.fetched&&c.isDefine&&
(l=!0,!c.prefix))return f=!1});if(d&&b.length)return a=H("timeout","Load timeout for modules: "+b,null,b),a.contextName=h.contextName,B(a);f&&(q(M,function(a){if(!a.defined){var a=A(a,{}),d={};a&&(C(a,d,{}),y(d,D))}}),y(m,D));if((!d||j)&&l)if((w||ca)&&!U)U=setTimeout(function(){U=0;E()},50);T=!1}}function V(a){r(g(a[0],null,!0)).init(a[1],a[2])}function J(a){var a=a.currentTarget||a.srcElement,d=h.onScriptLoad;a.detachEvent&&!S?a.detachEvent("onreadystatechange",d):a.removeEventListener("load",d,
!1);d=h.onScriptError;a.detachEvent&&!S||a.removeEventListener("error",d,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}var k={waitSeconds:7,baseUrl:"./",paths:{},pkgs:{},shim:{}},m={},W={},F=[],n={},R={},N=1,O=1,M=[],T,X,h,Q,U;Q={require:function(a){return t(a)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports=n[a.map.id]={}},module:function(a){return a.module={id:a.map.id,uri:a.map.url,config:function(){return k.config&&k.config[a.map.id]||{}},exports:n[a.map.id]}}};
X=function(a){this.events=W[a.id]||{};this.map=a;this.shim=k.shim[a.id];this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};X.prototype={init:function(a,d,b,l){l=l||{};if(!this.inited){this.factory=d;if(b)this.on("error",b);else this.events.error&&(b=s(this,function(a){this.emit("error",a)}));this.depMaps=a&&a.slice(0);this.depMaps.rjsSkipMap=a.rjsSkipMap;this.errback=b;this.inited=!0;this.ignore=l.ignore;l.enabled||this.enabled?this.enable():this.check()}},defineDepById:function(a,
d){var b;q(this.depMaps,function(d,f){if(d.id===a)return b=f,!0});return this.defineDep(b,d)},defineDep:function(a,d){this.depMatched[a]||(this.depMatched[a]=!0,this.depCount-=1,this.depExports[a]=d)},fetch:function(){if(!this.fetched){this.fetched=!0;h.startTime=(new Date).getTime();var a=this.map;if(this.shim)t(this,!0)(this.shim.deps||[],s(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?this.callPlugin():this.load()}},load:function(){var a=this.map.url;R[a]||
(R[a]=!0,h.load(this.map.id,a))},check:function(a){if(this.enabled&&!this.enabling){var d=this.map.id,b=this.depExports,c=this.exports,f=this.factory,e;if(this.inited)if(this.error)this.emit("error",this.error);else{if(!this.defining){this.defining=!0;if(this.depCount<1&&!this.defined){if(x(f)){if(this.events.error)try{c=h.execCb(d,f,b,c)}catch(g){e=g}else c=h.execCb(d,f,b,c);if(this.map.isDefine)if((b=this.module)&&b.exports!==void 0&&b.exports!==this.exports)c=b.exports;else if(c===void 0&&this.usingExports)c=
this.exports;if(e)return e.requireMap=this.map,e.requireModules=[this.map.id],e.requireType="define",B(this.error=e)}else c=f;this.exports=c;if(this.map.isDefine&&!this.ignore&&(n[d]=c,j.onResourceLoad))j.onResourceLoad(h,this.map,this.depMaps);delete m[d];this.defined=!0;h.waitCount-=1;h.waitCount===0&&(M=[])}this.defining=!1;if(!a&&this.defined&&!this.defineEmitted)this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0}}else this.fetch()}},callPlugin:function(){var a=
this.map,d=a.id,b=g(a.prefix,null,!1,!0);p(b,"defined",s(this,function(b){var f=this.map.name,e=this.map.parentMap?this.map.parentMap.name:null;if(this.map.unnormalized){if(b.normalize&&(f=b.normalize(f,function(a){return c(a,e,!0)})||""),b=g(a.prefix+"!"+f,this.map.parentMap,!1,!0),p(b,"defined",s(this,function(a){this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),b=m[b.id]){if(this.events.error)b.on("error",s(this,function(a){this.emit("error",a)}));b.enable()}}else f=s(this,function(a){this.init([],
function(){return a},null,{enabled:!0})}),f.error=s(this,function(a){this.inited=!0;this.error=a;a.requireModules=[d];y(m,function(a){a.map.id.indexOf(d+"_unnormalized")===0&&z(a.map.id)});B(a)}),f.fromText=function(a,d){var b=L;b&&(L=!1);r(g(a));j.exec(d);b&&(L=!0);h.completeLoad(a)},b.load(a.name,t(a.parentMap,!0,function(a,d){a.rjsSkipMap=!0;return h.require(a,d)}),f,k)}));h.enable(b,this);this.pluginMaps[b.id]=b},enable:function(){this.enabled=!0;if(!this.waitPushed)M.push(this),h.waitCount+=
1,this.waitPushed=!0;this.enabling=!0;q(this.depMaps,s(this,function(a,d){var b,c;if(typeof a==="string"){a=g(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.depMaps.rjsSkipMap);this.depMaps[d]=a;if(b=Q[a.id]){this.depExports[d]=b(this);return}this.depCount+=1;p(a,"defined",s(this,function(a){this.defineDep(d,a);this.check()}));this.errback&&p(a,"error",this.errback)}b=a.id;c=m[b];!Q[b]&&c&&!c.enabled&&h.enable(a,this)}));y(this.pluginMaps,s(this,function(a){var b=m[a.id];b&&!b.enabled&&
h.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){q(this.events[a],function(a){a(b)});a==="error"&&delete this.events[a]}};return h={config:k,contextName:b,registry:m,defined:n,urlFetched:R,waitCount:0,defQueue:F,Module:X,makeModuleMap:g,configure:function(a){a.baseUrl&&a.baseUrl.charAt(a.baseUrl.length-1)!=="/"&&(a.baseUrl+="/");var b=k.pkgs,c=k.shim,e=k.paths,f=k.map;K(k,a,!0);k.paths=K(e,a.paths,!0);if(a.map)k.map=
K(f||{},a.map,!0,!0);if(a.shim)y(a.shim,function(a,b){G(a)&&(a={deps:a});if(a.exports&&!a.exports.__buildReady)a.exports=h.makeShimExports(a.exports);c[b]=a}),k.shim=c;if(a.packages)q(a.packages,function(a){a=typeof a==="string"?{name:a}:a;b[a.name]={name:a.name,location:a.location||a.name,main:(a.main||"main").replace(ja,"").replace(ba,"")}}),k.pkgs=b;y(m,function(a,b){a.map=g(b)});if(a.deps||a.callback)h.require(a.deps||[],a.callback)},makeShimExports:function(a){var b;return typeof a==="string"?
(b=function(){return Z(a)},b.exports=a,b):function(){return a.apply(Y,arguments)}},requireDefined:function(a,b){var c=g(a,b,!1,!0).id;return n.hasOwnProperty(c)},requireSpecified:function(a,b){a=g(a,b,!1,!0).id;return n.hasOwnProperty(a)||m.hasOwnProperty(a)},require:function(a,d,c,e){var f;if(typeof a==="string"){if(x(d))return B(H("requireargs","Invalid require call"),c);if(j.get)return j.get(h,a,d);a=g(a,d,!1,!0);a=a.id;return!n.hasOwnProperty(a)?B(H("notloaded",'Module name "'+a+'" has not been loaded yet for context: '+
b)):n[a]}c&&!x(c)&&(e=c,c=void 0);d&&!x(d)&&(e=d,d=void 0);for(u();F.length;)if(f=F.shift(),f[0]===null)return B(H("mismatch","Mismatched anonymous define() module: "+f[f.length-1]));else V(f);r(g(null,e)).init(a,d,c,{enabled:!0});E();return h.require},undef:function(a){var b=g(a,null,!0),c=m[a];delete n[a];delete R[b.url];delete W[a];if(c){if(c.events.defined)W[a]=c.events;z(a)}},enable:function(a){m[a.id]&&r(a).enable()},completeLoad:function(a){var b=k.shim[a]||{},c=b.exports&&b.exports.exports,
e,f;for(u();F.length;){f=F.shift();if(f[0]===null){f[0]=a;if(e)break;e=!0}else f[0]===a&&(e=!0);V(f)}f=m[a];if(!e&&!n[a]&&f&&!f.inited)if(k.enforceDefine&&(!c||!Z(c)))if(i(a))return;else return B(H("nodefine","No define call for "+a,null,[a]));else V([a,b.deps||[],b.exports]);E()},toUrl:function(a,b){var e=a.lastIndexOf("."),g=null;e!==-1&&(g=a.substring(e,a.length),a=a.substring(0,e));return h.nameToUrl(c(a,b&&b.id,!0),g)},nameToUrl:function(a,b){var c,e,f,g,h,i;if(j.jsExtRegExp.test(a))g=a+(b||
"");else{c=k.paths;e=k.pkgs;g=a.split("/");for(h=g.length;h>0;h-=1)if(i=g.slice(0,h).join("/"),f=e[i],i=c[i]){G(i)&&(i=i[0]);g.splice(0,h,i);break}else if(f){c=a===f.name?f.location+"/"+f.main:f.location;g.splice(0,h,c);break}g=g.join("/")+(b||".js");g=(g.charAt(0)==="/"||g.match(/^[\w\+\.\-]+:/)?"":k.baseUrl)+g}return k.urlArgs?g+((g.indexOf("?")===-1?"?":"&")+k.urlArgs):g},load:function(a,b){j.load(h,a,b)},execCb:function(a,b,c,e){return b.apply(e,c)},onScriptLoad:function(a){if(a.type==="load"||
la.test((a.currentTarget||a.srcElement).readyState))I=null,a=J(a),h.completeLoad(a.id)},onScriptError:function(a){var b=J(a);if(!i(b.id))return B(H("scripterror","Script error",a,[b.id]))}}}};j({});aa(j);if(w&&(t=A.head=document.getElementsByTagName("head")[0],C=document.getElementsByTagName("base")[0]))t=A.head=C.parentNode;j.onError=function(b){throw b;};j.load=function(b,c,e){var i=b&&b.config||{},g;if(w)return g=i.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script"),
g.type=i.scriptType||"text/javascript",g.charset="utf-8",g.async=!0,g.setAttribute("data-requirecontext",b.contextName),g.setAttribute("data-requiremodule",c),g.attachEvent&&!(g.attachEvent.toString&&g.attachEvent.toString().indexOf("[native code")<0)&&!S?(L=!0,g.attachEvent("onreadystatechange",b.onScriptLoad)):(g.addEventListener("load",b.onScriptLoad,!1),g.addEventListener("error",b.onScriptError,!1)),g.src=e,E=g,C?t.insertBefore(g,C):t.appendChild(g),E=null,g;else ca&&(importScripts(e),b.completeLoad(c))};
w&&N(document.getElementsByTagName("script"),function(b){if(!t)t=b.parentNode;if(u=b.getAttribute("data-main")){if(!p.baseUrl)D=u.split("/"),da=D.pop(),ea=D.length?D.join("/")+"/":"./",p.baseUrl=ea,u=da;u=u.replace(ba,"");p.deps=p.deps?p.deps.concat(u):[u];return!0}});define=function(b,c,e){var i,g;typeof b!=="string"&&(e=c,c=b,b=null);G(c)||(e=c,c=[]);!c.length&&x(e)&&e.length&&(e.toString().replace(ha,"").replace(ia,function(b,e){c.push(e)}),c=(e.length===1?["require"]:["require","exports","module"]).concat(c));
if(L&&(i=E||ga()))b||(b=i.getAttribute("data-requiremodule")),g=z[i.getAttribute("data-requirecontext")];(g?g.defQueue:P).push([b,c,e])};define.amd={jQuery:!0};j.exec=function(b){return eval(b)};j(p)}})(this);
(function(TB) {
	Ext.ns('Ext.ui');
	Ext.reg("tb", TB);
	Ext.ui.XTollbar = Ext.extend(Ext.Container, {				
				constructor : function(config) {
					var tbitems = [], i = 0, items, spitems = [], tbconfig = {};
					if (Ext.isArray(config)) {
						config = {
							items : config
						};
					} else {
						config = config || {};
					}
					items = config.items || [];
					config.items = [];
					for (i = 0; i < items.length; i++) {
						if (items[i] == "|") {
							spitems.push(this.createToolbar(config, tbitems));
							tbitems = [];
						} else if (items[i] == '!') {
							// do nothing just ignore
						} else {
							tbitems.push(items[i]);
						}
					}
					if (tbitems.length) {
						spitems.push(this.createToolbar(config, tbitems));
					}
					config.items = spitems;
					Ext.Container.superclass.constructor.call(this, config);

				},
				createToolbar : function(config, items) {					
					var enableOverflow=config.ownerCt && config.ownerCt.enableOverflow;
					var defaults={};
					if(typeof config.defaults=='function'){
					   defaults=config.defaults(this);
					   config.defaults=defaults;
					}
					var tbconfig = Ext.apply({
						        'enableOverflow':enableOverflow===true,
								buttonAlign : this.buttonAlign
							}, config);
					tbconfig.items = items;				
					return this.createComponent(tbconfig, 'tb');
				},
				add : function(comp) {
					if (Ext.isArray(comp)) {
						return Ext.ui.XTollbar.superclass.add.apply(this, arguments);
					}
					var xtype = null;
					if (comp.getXType) {
						xtype = comp.getXType();
					}
					if (comp.xtype) {
						xtype = comp.xtype;
					}
					if (xtype == 'tb') {
						return Ext.ui.XTollbar.superclass.add.apply(this, arguments);
					}
					if (xtype == null && comp == '|') {
						return this.add(this.createToolbar({}, []));
					} else {
						var tb = this.items.itemAt(this.items.getCount() - 1);
						if (!tb) {
							var tb = this.add(this.createToolbar({}, []));
						}
						return tb.add(comp);
					}

				}
			});

	Ext.reg("toolbar", Ext.ui.XTollbar);

})(Ext.Toolbar);

Ext.Panel.prototype.createToolbar= function(tb, options){
    var result;    
    if(Ext.isArray(tb)){
        tb = {
            items: tb
        };
    }
    result = tb.events ? Ext.apply(tb, options) : this.createComponent(Ext.apply({ownerCt:this}, tb, options), 'toolbar');
    this.toolbars.push(result);    
    return result;
};


﻿/**
 * @ author faylai new Ext.ui.XPagingToolbar({ pageSize: 10, store:ds,
 *   displayInfo: true })
 * 
 */
Ext.ns('Ext.ui');
Ext.ui.XPagingToolbar = Ext.extend(Ext.PagingToolbar, {

	/**
	 * 
	 * @cfg {String} beforeText
	 * 
	 * Text to display before the comboBox
	 * 
	 */

	beforeText : '每页显示',
	/**
	 * 
	 * @cfg {String} afterText
	 * 
	 * Text to display after the comboBox
	 * 
	 */

	afterText : '条',

	/**
	 * 
	 * @cfg {Mixed} addBefore
	 * 
	 * Toolbar item(s) to add before the PageSizer
	 * 
	 */

	addBefore : '-',

	/**
	 * 
	 * @cfg {Mixed} addAfter
	 * 
	 * Toolbar item(s) to be added after the PageSizer
	 * 
	 */

	addAfter : null,

	/**
	 * 
	 * @cfg {Bool} dynamic
	 * 
	 * True for dynamic variations, false for static ones
	 * 
	 */

	dynamic : false,
	displayInfo : true,
	displayPageSize : true,

	/**
	 * 
	 * @cfg {Array} variations
	 * 
	 * Variations used for determining pageSize options
	 * 
	 */

	variations : [5, 10, 20, 50, 100, 200, 500, 1000],

	/**
	 * 
	 * @cfg {Object} comboCfg
	 * 
	 * Combo config object that overrides the defaults
	 * 
	 */

	comboCfg : undefined,

	getPageSize : function() {
		return this.pageSize;

	},
	// private
	addSize : function(value) {

		if (value > 0) {

			this.sizes.push([value]);

		}

	},

	// private

	updateStore : function() {

		if (this.dynamic) {

			var middleValue = this.pageSize, start;

			middleValue = (middleValue > 0) ? middleValue : 1;

			this.sizes = [];

			var v = this.variations;

			for (var i = 0, len = v.length; i < len; i++) {

				this.addSize(middleValue - v[v.length - 1 - i]);

			}

			this.addToStore(middleValue);

			for (var i = 0, len = v.length; i < len; i++) {

				this.addSize(middleValue + v[i]);

			}

		} else {

			if (!this.staticSizes) {

				this.sizes = [];

				var v = this.variations;

				var middleValue = 0;

				for (var i = 0, len = v.length; i < len; i++) {

					this.addSize(middleValue + v[i]);

				}

				this.staticSizes = this.sizes.slice(0);

			} else {

				this.sizes = this.staticSizes.slice(0);

			}

		}

		this.combo.store.loadData(this.sizes);

		this.combo.collapse();

		this.combo.setValue(this.pageSize);

	},
	refresh : function() {
		this.onClick('refresh');
	},
	setPageSize : function(value, forced) {

		var pt = this;

		this.combo.collapse();

		value = parseInt(value) || parseInt(this.combo.getValue());

		value = (value > 0) ? value : 1;

		if (value == pt.pageSize) {

			return;

		} else if (value < pt.pageSize) {

			pt.pageSize = value;

			var ap = Math.round(pt.cursor / value) + 1;

			var cursor = (ap - 1) * value;

			var store = pt.store;

			if (cursor > store.getTotalCount()) {
				pt.pageSize = value;
				pt.doLoad(cursor - value);

			} else {

				store.suspendEvents();

				for (var i = 0, len = cursor - pt.cursor; i < len; i++) {

					store.remove(store.getAt(0));

				}

				while (store.getCount() > value) {

					store.remove(store.getAt(store.getCount() - 1));

				}

				store.resumeEvents();

				store.fireEvent('datachanged', store);

				pt.cursor = cursor;

				var d = pt.getPageData();

				this.afterTextItem.setText( String.format(pt.afterPageText, d.pages));

				pt.inputItem.setValue(ap) ;

				pt.first.setDisabled(ap == 1);

				pt.prev.setDisabled(ap == 1);

				pt.next.setDisabled(ap == d.pages);

				pt.last.setDisabled(ap == d.pages);

				pt.updateInfo();

			}

		} else {

			this.pageSize = value;
			this.doLoad(Math.floor(this.cursor / this.pageSize) * this.pageSize);

		}

		this.updateStore();

	},
	// private
	onRender : function() {
		Ext.ui.XPagingToolbar.superclass.onRender.apply(this, arguments);
		this.combo = Ext.ComponentMgr.create(Ext.applyIf(this.comboCfg || {}, {

			store : new Ext.data.SimpleStore({

				fields : ['pageSize'],

				data : []

			}),

			displayField : 'pageSize',

			valueField : 'pageSize',

			mode : 'local',

			triggerAction : 'all',

			width : 50,

			xtype : 'combo'

		}));

		this.combo.on('select', this.setPageSize, this);
		var mine = this;
		mine.store.on("beforeload", function(st, opt) {
			if (opt.params.limit != mine.pageSize) {
				opt.params.limit = mine.pageSize;
				mine.setPageSize();
			}
		});

		this.updateStore();

		if (this.addBefore && this.displayPageSize) {

			this.add(this.addBefore);

		}

		if (this.beforeText && this.displayPageSize) {

			this.add(this.beforeText);

		}
		if (this.displayPageSize) {
			this.add(this.combo);
		}

		if (this.afterText && this.displayPageSize) {

			this.add(this.afterText);

		}

		if (this.addAfter && this.displayPageSize) {

			this.add(this.addAfter);

		}

		if (this.autoLoad) {
			this.on("render", function() {
				var me=this;
				setTimeout(function(){
                   me.doRefresh();			
				},10);
				
			});
		}
	}

});
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
Ext.grid.LockingGridPanel = Ext.extend(Ext.ui.XGridPanel, {
			afterConfig : function(config) {
				var columns = config.columns;
				delete config.columns;
				config.colModel = new Ext.ux.grid.LockingColumnModel(columns);
			},
			getView : function() {
				if (!this.view) {
					this.view = new Ext.ux.grid.LockingGridView();
				}
				return this.view;
			}
		});
Ext.ns("Ext.ui");
Ext.ui.LockingGridPanel = Ext.grid.LockingGridPanel;Ext.grid.ExcelCellSelectionModel = function(config) {
	Ext.apply(this, config);
	this.selection = null;
	this.mouseSelectionEnable = false;
	this.firstSelectedCell = [0, 0];
	this.selectedCellRange = [0, 0, 0, 0];
	this.addEvents(
			/**
			 * @event beforecellselect Fires before a cell is selected.
			 * @param {SelectionModel}
			 *            this
			 * @param {Number}
			 *            rowIndex The selected row index
			 * @param {Number}
			 *            colIndex The selected cell index
			 */
			"beforecellselect",
			/**
			 * @event cellselect Fires when a cell is selected.
			 * @param {SelectionModel}
			 *            this
			 * @param {Number}
			 *            rowIndex The selected row index
			 * @param {Number}
			 *            colIndex The selected cell index
			 */
			"cellselect",
			/**
			 * @event selectionchange Fires when the active selection changes.
			 * @param {SelectionModel}
			 *            this
			 * @param {Object}
			 *            selection null for no selection or an object (o) with
			 *            two properties
			 *            <ul>
			 *            <li>o.record: the record object for the row the
			 *            selection is in</li>
			 *            <li>o.cell: An array of [rowIndex, columnIndex]</li>
			 *            </ul>
			 */
			"selectionchange");

	Ext.grid.ExcelCellSelectionModel.superclass.constructor.call(this);
};

Ext.extend(Ext.grid.ExcelCellSelectionModel, Ext.grid.CellSelectionModel, {

	/** @ignore */
	initEvents : function() {
		this.grid.on("cellmouseover", this.handleMouseOver, this);
		this.grid.on("mouseup", this.handleMouseUp, this);
		this.grid.on("cellmousedown", this.handleMouseDown, this);
		this.grid.getGridEl().on(Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.handleKeyDown, this);
		var view = this.grid.view;
		view.on("refresh", this.onViewChange, this);
		view.on("rowupdated", this.onRowUpdated, this);
		view.on("beforerowremoved", this.clearSelections, this);
		view.on("beforerowsinserted", this.clearSelections, this);
		if (this.grid.isEditor) {
			this.grid.on("beforeedit", this.beforeEdit, this);
		}
	},

	/**
	 * Clears all selections.
	 * 
	 * @param {Boolean}
	 *            true to prevent the gridview from being notified about the
	 *            change.
	 */
	clearSelections : function(preventNotify) {
		var s = this.selection;
		if (s) {
			// this.deSelectCellRange();
			if (preventNotify !== true) {
				this.deSelectCellRange();
				// this.grid.view.onCellDeselect(s.cell[0], s.cell[1]);
			}
			this.selection = null;
			this.fireEvent("selectionchange", this, null);
		}
	},
	handleMouseOver : function(g, row, cell, e) {
		if (this.mouseSelectionEnable) {
			this.clearSelections();
			this.select(row, cell);
			this.makeCellRange(row, cell, this.firstSelectedCell[0], this.firstSelectedCell[1]);
			this.selectCellRange();
		}
	},
	handleMouseUp : function(g, row, cell, e) {
		this.mouseSelectionEnable = false;
	},
	/** @ignore */
	handleMouseDown : function(g, row, cell, e) {
		if (e.button !== 0 || this.isLocked()) {
			return;
		};
		this.mouseSelectionEnable = true;
		this.clearSelections();
		this.select(row, cell);
		if (!e.shiftKey) {
			this.firstSelectedCell = [row, cell];
		}
		this.makeCellRange(row, cell, this.firstSelectedCell[0], this.firstSelectedCell[1]);
		this.selectCellRange();
	},

	/**
	 * Selects a cell.
	 * 
	 * @param {Number}
	 *            rowIndex
	 * @param {Number}
	 *            collIndex
	 */
	select : function(rowIndex, colIndex, preventViewNotify, preventFocus, /* internal */r) {
		if (this.fireEvent("beforecellselect", this, rowIndex, colIndex) !== false) {
			r = r || this.grid.store.getAt(rowIndex);
			this.selection = {
				record : r,
				cell : [rowIndex, colIndex]
			};
			if (!preventViewNotify) {
				var v = this.grid.getView();
				v.onCellSelect(rowIndex, colIndex);
				if (preventFocus !== true) {
					v.focusCell(rowIndex, colIndex);
				}
			}
			this.fireEvent("cellselect", this, rowIndex, colIndex);
			this.fireEvent("selectionchange", this, this.selection);
		}
	},

	/** @ignore */
	handleKeyDown : function(e) {
		if (!e.isNavKeyPress()) {
			return;
		}
		var g = this.grid, s = this.selection;
		if (!s) {
			e.stopEvent();
			var cell = g.walkCells(0, 0, 1, this.isSelectable, this);
			if (cell) {
				this.select(cell[0], cell[1]);
			}
			return;
		}
		var sm = this;
		var walk = function(row, col, step) {
			return g.walkCells(row, col, step, sm.isSelectable, sm);
		};
		var k = e.getKey(), r = s.cell[0], c = s.cell[1];
		var newCell;

		switch (k) {
			case e.TAB :
				if (e.shiftKey) {
					newCell = walk(r, c - 1, -1);
				} else {
					newCell = walk(r, c + 1, 1);
				}
				break;
			case e.DOWN :
				newCell = walk(r + 1, c, 1);
				break;
			case e.UP :
				newCell = walk(r - 1, c, -1);
				break;
			case e.RIGHT :
				newCell = walk(r, c + 1, 1);
				break;
			case e.LEFT :
				newCell = walk(r, c - 1, -1);
				break;
			case e.ENTER :
				if (g.isEditor && !g.editing) {
					g.startEditing(r, c);
					e.stopEvent();
					return;
				}
				break;
		};
		if (newCell) {
			this.clearSelections();
			this.select(newCell[0], newCell[1]);
			/* Ext.example.msg('',newCell[0]+":::"+newCell[1]+","+this.firstSelectedCell[0]+":::"+this.firstSelectedCell[1]); */
			if (!e.shiftKey) {
				this.firstSelectedCell = newCell;
			}
			this.makeCellRange(newCell[0], newCell[1], this.firstSelectedCell[0], this.firstSelectedCell[1]);
			this.selectCellRange();
			e.stopEvent();
		}
	},
	makeCellRange : function(row1, col1, row2, col2) {
		if (row1 > row2) {
			temp_row = row1;
			row1 = row2;
			row2 = temp_row;
		}
		if (col1 > col2) {
			temp_col = col1;
			col1 = col2;
			col2 = temp_col;
		}
		this.selectedCellRange = [row1, col1, row2, col2];
	},

	selectCellRange : function() {
		var cr = this.selectedCellRange;
		var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2 = cr[3];
		for (var r = row1; r <= row2; r++) {
			for (var c = col1; c <= col2; c++) {
				this.grid.view.onCellSelect(r, c);
			}
		}
	},
	getSelectedCellRange : function() {
		return this.selectedCellRange;
	},
	deSelectCellRange : function() {
		var cr = this.selectedCellRange;
		var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2 = cr[3];
		for (var r = row1; r <= row2; r++) {
			for (var c = col1; c <= col2; c++) {
				this.grid.view.onCellDeselect(r, c);
			}
		}
	}
});/**
 * @class Ext.grid.EditorPasteCopyGridPanel Version: 1.4 Author: Surinder singh
 *        http://www.sencha.com/forum/member.php?75710-Surinder-singh,
 *        surinder83singh@gmail.com changes: 1) added the block fill feature. 2)
 *        support for auto editing on any non-navigation key press (feature
 *        demanded by jackpan
 *        http://www.sencha.com/forum/member.php?181839-jackpan).
 * 
 */
Ext.grid.RowNumberer.prototype.renderer = function(v, p, record, rowIndex) {
	if (this.rowspan) {
		p.cellAttr = 'rowspan="' + this.rowspan + '"';
	}
	return '<div class="rownumberer" style="text-align:left;background-color:#efefef;cursor:pointer;">' + (rowIndex + 1) + '</div>';
};
Ext.grid.EditorPasteCopyGridPanel = Ext.extend(Ext.ui.XGridPanel, {

	/**
	 * @cfg {Number} clicksToEdit
	 *      <p>
	 *      The number of clicks on a cell required to display the cell's editor
	 *      (defaults to 2).
	 *      </p>
	 *      <p>
	 *      Setting this option to 'auto' means that mousedown <i>on the
	 *      selected cell</i> starts editing that cell.
	 *      </p>
	 */
	clicksToEdit : '2',
	hideRowNumberer : false,
	afterConfig : function(config) {
		/* make sure that selection modal is ExcelCellSelectionModel */
		config.sm = new Ext.grid.ExcelCellSelectionModel();
	},
	initComponent : function() {
		Ext.grid.EditorPasteCopyGridPanel.superclass.initComponent.call(this);
		this.addListener('render', this.addKeyMap, this);
		this.addListener('cellclick', this.onCellClick);
	},
	getView : function() {
		if (!this.view) {
			this.view = new Ext.grid.GridView(this.viewConfig);
		}
		return this.view;
	},
	// 点击一格选择一行
	onCellClick : function(grid, rowIndex, columnIndex, e) {
		var rn = e.getTarget(".rownumberer");
		var row = Ext.get(grid.getView().getRow(rowIndex));
		var record = grid.store.getAt(rowIndex);
		if (rn) {
			if (row.hasClass('x-grid3-row-selected')) {
				// remove current selection
				row.removeClass('x-grid3-row-selected');
				grid.smSelections.remove(record);
			} else {
				// add current selection
				row.addClass('x-grid3-row-selected');
				grid.smSelections.add(record);
			}
		} else {
			// clear all selection
			grid.getEl().select('.x-grid3-row').removeClass('x-grid3-row-selected');
			grid.smSelections.clear();
			// add current selection
			row.addClass('x-grid3-row-selected');
			grid.smSelections.add(record);
		}
	},
	addKeyMap : function() {
		var thisGrid = this;
		this.body.on("mouseover", this.onMouseOver, this);
		this.body.on("mouseup", this.onMouseUp, this);
		// Ext.DomQuery.selectNode('div[class*=x-grid3-scroller]',
		// this.getEl().dom).style.overflowX='hidden';
		// map multiple keys to multiple actions by strings and array of codes
		new Ext.KeyMap(Ext.DomQuery.selectNode('div[class*=x-grid3-scroller]', this.getEl().dom).id, [{
			key : "c",
			ctrl : true,
			fn : function() {
				thisGrid.copyToClipBoard(thisGrid.getSelectionModel().getSelectedCellRange());
			}
		}, {
			key : "v",
			ctrl : true,
			fn : function() {
				thisGrid.pasteFromClipBoard();
			}
		}]);
	},
	onMouseOver : function(e) {
		this.processEvent("mouseover", e);
	},
	onMouseUp : function(e) {
		this.processEvent("mouseup", e);
	},
	copyToClipBoard : function(rows) {
		this.collectGridData(rows);
		if (window.clipboardData && clipboardData.setData) {
			clipboardData.setData("text", this.tsvData);
		} else {
			var hiddentextarea = this.getHiddenTextArea(true);
			hiddentextarea.dom.value = this.tsvData;
			hiddentextarea.focus();
			hiddentextarea.dom.setSelectionRange(0, hiddentextarea.dom.value.length);
		}
	},
	collectGridData : function(cr) {
		var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2 = cr[3];
		this.tsvData = "";
		var rowTsv = "";
		var cmConfig = this.getDisplayColumnModelConfig();
		for (var r = row1; r <= row2; r++) {
			if (this.tsvData != "") {
				this.tsvData += "\n";
			}
			rowTsv = "";
			for (var c = col1; c <= col2; c++) {
				if (rowTsv != "") {
					rowTsv += "\t";
				}
				rowTsv += this.store.getAt(r).get(cmConfig[c].dataIndex);
			}
			this.tsvData += rowTsv;
		}
		return this.tsvData;
	},

	pasteFromClipBoard : function() {
		var hiddentextarea = this.getHiddenTextArea();
		hiddentextarea.dom.value = "";
		hiddentextarea.focus();

	},
	updateGridData : function() {
		var tsvData = this.hiddentextarea.getValue();
		tsvData = tsvData.split("\n");
		var column = [];
		var cr = this.getSelectionModel().getSelectedCellRange();
		var cmConfig = this.getDisplayColumnModelConfig();
		if (!this.canSetValue(cmConfig, cr[1])) {
			Ext.tip("提示", "该列不能编辑！");
			this.hiddentextarea.blur();
			return;
		}
		var nextIndex = cr[0];
		var modiRecord=[];
		if (tsvData[0].split("\t").length == 1 && ((tsvData.length == 1) || (tsvData.length == 2 && tsvData[1].trim() == ""))) {
			// if only one cell in clipboard data, block fill process (i.e. copy
			// a cell, then select a group of cells to paste)
			for (var rowIndex = cr[0]; rowIndex <= cr[2]; rowIndex++) {
				for (var columnIndex = cr[1]; columnIndex <= cr[3]; columnIndex++) {
					if (this.canSetValue(cmConfig, columnIndex)) {
						this.store.getAt(rowIndex).set(cmConfig[columnIndex].dataIndex, tsvData[0]);						
					}
				}
				modiRecord.push(this.store.getAt(rowIndex));
			}
		} else {
			var gridTotalRows = this.store.getCount(), pasteColumnIndex;
			for (var rowIndex = 0; rowIndex < tsvData.length; rowIndex++) {
				if (tsvData[rowIndex].trim() == "") {
					continue;
				}
				columns = tsvData[rowIndex].split("\t");
				if (nextIndex > gridTotalRows - 1) {
					this.stopEditing();
					var newRecord = this.insertAt({}, nextIndex);
				}
				pasteColumnIndex = cr[1];
				for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
					if (this.canSetValue(cmConfig, pasteColumnIndex)) {
						this.store.getAt(nextIndex).set(cmConfig[pasteColumnIndex].dataIndex, columns[columnIndex]);
					}
					pasteColumnIndex++;
				}
				modiRecord.push(this.store.getAt(nextIndex));
				nextIndex++;
			}
		}
		this.fireEvent("paste",modiRecord);
		//console.dir(modiRecord);
		this.hiddentextarea.blur();
	},
	canSetValue : function(config, i) {
		if (i < 0) {
			return false;
		}
		var cm = config[i];
		if (cm && (cm.editor || cm.paste !== false)) {
			return true
		} else {
			return false;
		}
	},
	getDisplayColumnModelConfig : function() {
		var config = [];
		this.getColumnModel().getColumnsBy(function(c) {
			if (c.hidden !== true) {
				config.push(c);
			}
		});
		return config;
	},
	getHiddenTextArea : function(isCopy) {
		this.isCopy = isCopy;
		if (!this.hiddentextarea) {
			this.hiddentextarea = new Ext.Element(document.createElement('textarea'));
			this.hiddentextarea.setStyle('left', '-1000px');
			// this.hiddentextarea.setStyle('border','2px solid #ff0000');
			this.hiddentextarea.setStyle('position', 'absolute');
			// this.hiddentextarea.setStyle('top','-0px');
			this.hiddentextarea.setStyle('z-index', '-1');
			this.hiddentextarea.setStyle('width', '100px');
			this.hiddentextarea.setStyle('height', '1px');
			this.hiddentextarea.addListener('keyup', function() {
				if (this.isCopy !== true) {
					this.updateGridData();
				}
			}, this);
			Ext.get(this.getEl().dom.firstChild).appendChild(this.hiddentextarea.dom);
		}
		return this.hiddentextarea;
	}

});
Ext.reg('editorPasteCopyGrid', Ext.grid.EditorPasteCopyGridPanel);Ext.namespace('Ext.ux.layout'); 

/** 
 * @class Ext.ux.layout.RowFitLayout 
 * @extends Ext.layout.ContainerLayout 
 * <p>Layout that distributes heights of elements so they take 100% of the 
 * container height.</p> 
 * <p>Height of the child element can be given in pixels (as an integer) or 
 * in percent. All elements with absolute height (i.e. in pixels) always will 
 * have the given height. All "free" space (that is not filled with elements 
 * with 'absolute' height) will be distributed among other elements in 
 * proportion of their height percentage. Elements without 'height' in the 
 * config will take equal portions of the "unallocated" height.</p> 
 * <p>Supports panel collapsing, hiding, removal/addition. The adapter is provided 
 * to use with Ext.SplitBar: <b>Ext.ux.layout.RowFitLayout.SplitAdapter</b>.</p> 
 * <p>Example usage:</p> 
 * <pre><code> 
 var vp = new Ext.Viewport({ 
   layout: 'rowfit', 
   items: [ 
     { xtype: 'panel', height: 100, title: 'Height in pixels', html: 'panel height = 100px' }, 
     { xtype: 'panel', height: "50%", title: '1/2', html: 'Will take half of remaining height' }, 
     { xtype: 'panel', title: 'No height 1', html: 'Panel without given height' }, 
     { xtype: 'panel', title: 'No height 2', html: 'Another panel' } 
   ] 
 }); 
 * </code></pre> 
 * Usage of the split bar adapter: 
 * <pre><code> 
 var split = new Ext.SplitBar("elementToDrag", "elementToSize", Ext.SplitBar.VERTICAL, Ext.SplitBar.TOP); 
 // note the Ext.SplitBar object is passed to the adapter constructor to set 
 // correct minSize and maxSize: 
 split.setAdapter(new Ext.ux.layout.RowFitLayout.SplitAdapter(split)); 
 * </code></pre> 
 */ 

Ext.ux.layout.RowFitLayout = Ext.extend(Ext.layout.ContainerLayout, { 
  // private 
  monitorResize: true, 

  // private 
  trackChildEvents: ['collapse', 'expand', 'hide', 'show'], 

  // private 
  renderAll: function(ct, target) { 
    Ext.ux.layout.RowFitLayout.superclass.renderAll.apply(this, arguments); 
    // add event listeners on addition/removal of children 
    ct.on('add', this.containerListener); 
    ct.on('remove', this.containerListener); 
  }, 

  // private 
  renderItem: function(c, position, target) { 
    Ext.ux.layout.RowFitLayout.superclass.renderItem.apply(this, arguments); 

    // add event listeners 
    for (var i=0, n = this.trackChildEvents.length; i < n; i++) { 
      c.on(this.trackChildEvents[i], this.itemListener); 
    } 
    c.animCollapse = false; // looks ugly together with rowfit layout 

    // store some layout-specific calculations 
    c.rowFit = { 
      hasAbsHeight: false, // whether the component has absolute height (in pixels) 
      relHeight: 0, // relative height, in pixels (if applicable) 
      calcRelHeight: 0, // calculated relative height (used when element is resized)
      calcAbsHeight: 0 // calculated absolute height 
    }; 

    // process height config option 
    if (c.height) { 
      // store relative (given in percent) height 
      if (typeof c.height == "string" && c.height.indexOf("%")) { 
        c.rowFit.relHeight = parseInt(c.height); 
      } 
      else { // set absolute height 
        c.setHeight(c.height-c.getEl().getMargins('tb')); 
        c.rowFit.hasAbsHeight = true; 
      } 
    } 
  }, 

  // private 
  onLayout: function(ct, target) { 
    Ext.ux.layout.RowFitLayout.superclass.onLayout.call(this, ct, target); 

    if (this.container.collapsed || !ct.items || !ct.items.length) { return; } 

    // first loop: determine how many elements with relative height are there, 
    // sums of absolute and relative heights etc. 
    var absHeightSum = 0, // sum of elements' absolute heights 
        relHeightSum = 0, // sum of all percent heights given in children configs 
        relHeightRatio = 1, // "scale" ratio used in case sum <> 100% 
        relHeightElements = [], // array of elements with 'relative' height for the second loop 
        noHeightCount = 0; // number of elements with no height given 

    for (var i=0, n = ct.items.length; i < n; i++) { 
      var c = ct.items.itemAt(i); 

      if (!c.isVisible()) { continue; } 
      // collapsed panel is treated as an element with absolute height 
      if (c.collapsed) { absHeightSum += c.getFrameHeight()+c.getEl().getMargins('tb'); } 
      // element that has an absolute height 
      else if (c.rowFit.hasAbsHeight) { 
        absHeightSum += c.height; 
      } 
      // 'relative-heighted' 
      else { 
        if (!c.rowFit.relHeight) { noHeightCount++; } // element with no height given 
        else { relHeightSum += c.rowFit.relHeight; } 
        relHeightElements.push(c); 
      } 
    }     
    

    // if sum of relative heights <> 100% (e.g. error in config or consequence 
    // of collapsing/removing panels), scale 'em so it becomes 100% 
    if (noHeightCount == 0 && relHeightSum != 100) { 
      relHeightRatio = 100 / relHeightSum; 
    } 

    var freeHeight = target.getStyleSize().height - absHeightSum, // "unallocated" height we have 
        absHeightLeft = freeHeight; // track how much free space we have 
   
    while (relHeightElements.length) {     	 
      var c = relHeightElements.shift(), // element we're working with 
          relH = c.rowFit.relHeight * relHeightRatio, // height of this element in percent 
          absH = 0; // height in pixels 

      // no height in config 
      if (!relH) { 
        relH = (100 - relHeightSum) / noHeightCount; 
      } 

      // last element takes all remaining space 
      if (!relHeightElements.length) { absH = absHeightLeft; } 
      else { absH = Math.round(freeHeight * relH / 100); } 
      // anyway, height can't be negative 
      if (absH < 0) { absH = 0; }           
      absH=absH-c.getEl().getMargins('tb');
      c.rowFit.calcAbsHeight = absH; 
      c.rowFit.calcRelHeight = relH;
      c.setHeight(absH);      
      absHeightLeft -= absH; 
    }
    
    var sz = (Ext.isIE6 && Ext.isStrict && target.dom == document.body) ? target.getViewSize() : target.getStyleSize();
    for (var i=0, n = ct.items.length; i < n; i++) { 
       var c = ct.items.itemAt(i); 
       if (!c.isVisible()) { continue; } 
       c.setWidth(sz.width);      
    }

  },

  /** 
   * Event listener for container's children 
   * @private 
   */ 
  itemListener: function(item) { 
    item.ownerCt.doLayout(); 
  }, 


  /** 
   * Event listener for the container (on add, remove) 
   * @private 
   */ 
  containerListener: function(ct) { 
    ct.doLayout(); 
  } 

}); 

// Split adapter 
if (Ext.SplitBar.BasicLayoutAdapter) { 

  /** 
   * @param {Ext.SplitBar} splitbar to which adapter is applied. 
   *   If supplied, will set correct minSize and maxSize. 
   */ 
  Ext.ux.layout.RowFitLayout.SplitAdapter = function(splitbar) { 
    if (splitbar && splitbar.el.dom.nextSibling) { 
      var next = Ext.getCmp( splitbar.el.dom.nextSibling.id ), 
          resized = Ext.getCmp(splitbar.resizingEl.id); 

      if (next) { 
        splitbar.maxSize = (resized.height || resized.rowFit.calcAbsHeight) + 
                           next.getInnerHeight() - 1; // seems can't set height=0 in IE, "1" works fine 
      } 
      splitbar.minSize = resized.getFrameHeight() + 1; 
    } 
  } 

  Ext.extend(Ext.ux.layout.RowFitLayout.SplitAdapter, Ext.SplitBar.BasicLayoutAdapter, { 

    setElementSize: function(splitbar, newSize, onComplete) { 
      var resized = Ext.getCmp(splitbar.resizingEl.id); 

      // can't resize absent, collapsed or hidden panel 
      if (!resized || resized.collapsed || !resized.isVisible()) return; 

      // resizingEl has absolute height: just change it 
      if (resized.rowFit.hasAbsHeight) { 
        resized.setHeight(newSize); 
      } 
      // resizingEl has relative height: affects next sibling 
      else { 
        if (splitbar.el.dom.nextSibling) { 
          var nextSibling = Ext.getCmp( splitbar.el.dom.nextSibling.id ), 
              deltaAbsHeight = newSize - resized.rowFit.calcAbsHeight, // pixels 
              nsRf = nextSibling.rowFit, // shortcut 
              rzRf = resized.rowFit, 
              // pixels in a percent 
              pctPxRatio = rzRf.calcRelHeight / rzRf.calcAbsHeight, 
              deltaRelHeight = pctPxRatio * deltaAbsHeight; // change in height in percent 

          rzRf.relHeight = rzRf.calcRelHeight + deltaRelHeight; 

          if (nsRf.hasAbsHeight) { 
            var newHeight = nextSibling.height - deltaAbsHeight; 
            nextSibling.height = newHeight; 
            nextSibling.setHeight(newHeight); 
          } 
          else { 
            nsRf.relHeight = nsRf.calcRelHeight - deltaRelHeight; 
          } 
        } 
      } 
      // recalculate heights 
      resized.ownerCt.doLayout(); 
    } // of setElementSize 

  }); // of SplitAdapter 
} 

Ext.Container.LAYOUTS['rowfit'] = Ext.ux.layout.RowFitLayout;  Ext.layout.ColumnFitLayout = Ext.extend(Ext.layout.ContainerLayout, {
	// private
	monitorResize : true,

	/**
	 * @cfg {String} extraCls An optional extra CSS class that will be added to
	 *      the container (defaults to 'x-column'). This can be useful for
	 *      adding customized styles to the container or any of its children
	 *      using standard CSS rules.
	 */
	extraCls : 'x-column',

	scrollOffset : 0,

	// private
	isValidParent : function(c, target) {
		return (c.getPositionEl ? c.getPositionEl() : c.getEl()).dom.parentNode == this.innerCt.dom;
	},
	// private
	renderItem : function(c, position, target) {
		Ext.layout.ColumnFitLayout.superclass.renderItem.apply(this, arguments);
		// store some layout-specific calculations
		c.columnFit = {
			hasAbsWidth : false, // whether the component has absolute height
			// (in pixels)
			relWidth : 0, // relative height, in pixels (if applicable)
			calcRelWidth : 0, // calculated relative height (used when element
			// is resized)
			calcAbsWidth : 0
			// calculated absolute height
		};
		// process height config option
		if (c.width) {
			// store relative (given in percent) height
			if (typeof c.width == "string" && c.width.indexOf("%")) {
				c.columnFit.relWidth = parseInt(c.width);
			} else { // set absolute height
				c.setWidth(c.width - c.getEl().getMargins('lr'));
				c.columnFit.hasAbsWidth = true;
			}
		}
	},

	// private
	onLayout : function(ct, target) {
		var cs = ct.items.items, len = cs.length, c, i;

		if (!this.innerCt) {
			target.addClass('x-column-layout-ct');

			// the innerCt prevents wrapping and shuffling while
			// the container is resizing
			this.innerCt = target.createChild({
						cls : 'x-column-inner'
					});
			this.innerCt.createChild({
						cls : 'x-clear'
					});
		}
		this.renderAll(ct, this.innerCt);

		var size = Ext.isIE && target.dom != Ext.getBody().dom ? target
				.getStyleSize() : target.getViewSize();

		if (size.width < 1 && size.height < 1) { // display none?
			return;
		}

		var w = size.width - target.getPadding('lr') - this.scrollOffset, h = size.height
				- target.getPadding('tb'), pw = w;

		this.innerCt.setWidth(w);

		// some columns can be percentages while others are fixed
		// so we need to make 2 passes
		
        var noWidthCount = 0, relWidthSum = 0, percentage = 100;

		for (i = 0; i < len; i++) {
			c = cs[i];
			if (c.columnFit.hasAbsWidth) {
				pw -= (c.getSize().width + c.getEl().getMargins('lr'));
			}else{
			   if(!c.columnFit.relWidth){
			      noWidthCount++;
			   }
			}
		}
		pw = pw < 0 ? 0 : pw;
		
		// sum the reWidth
		for (i = 0; i < len; i++) {
			c = cs[i];
			if (c.columnFit.relWidth) {
				relWidthSum += c.columnFit.relWidth;
			}
		}
		// juge percentage great then 100% if so 
		if (relWidthSum > percentage) {
			percentage = relWidthSum;
		}
		//count rest width
		var freeWidth = pw - Math.floor(relWidthSum / percentage * pw);

		for (i = 0; i < len; i++) {
			c = cs[i];
			if (!c.columnFit.hasAbsWidth) {
				if (c.columnFit.relWidth) {
					c.setSize(Math
							.floor(c.columnFit.relWidth / percentage * pw)
							- c.getEl().getMargins('lr'),h);
				} else {
					if (freeWidth) {
						c.setSize(Math.floor(freeWidth/noWidthCount)
								- c.getEl().getMargins('lr'),h);
					}
				}
			}else{			       
			  c.setSize(undefined,h);
			}
			

		}

	}

		/**
		 * @property activeItem
		 * @hide
		 */
});

Ext.Container.LAYOUTS['columnfit'] = Ext.layout.ColumnFitLayout;Ext.namespace("Ext.ux.layout");
Ext.ux.layout.TableFormLayout = Ext.extend(Ext.layout.TableLayout, {
			monitorResize : true,
			labelSeparator :':',
			setContainer : function() {
				Ext.layout.FormLayout.prototype.setContainer.apply(this, arguments);
				this.currentRow = 0;
				this.currentColumn = 0;
				this.cells = [];
			},
			renderItem : function(c, position, target) {
				if (c && !c.rendered) {
					if (c instanceof Ext.form.Hidden) {
						Ext.layout.FormLayout.prototype.renderItem.call(this, c, 0, target);
					} else {
						var cell = Ext.get(this.getNextCell(c));
						cell.addClass("x-table-layout-column-" + this.currentColumn);
						Ext.layout.FormLayout.prototype.renderItem.call(this, c, 0, cell);
					}
				}
			},
			onLayout : function(ct, target) {
				Ext.ux.layout.TableFormLayout.superclass.onLayout.call(this, ct, target);
				if (!target.hasClass("x-table-form-layout-ct")) {
					target.addClass("x-table-form-layout-ct");
				}
				var viewSize = this.getLayoutTargetSize(ct, target);
				var aw, ah;
				if (ct.anchorSize) {
					if (typeof ct.anchorSize == "number") {
						aw = ct.anchorSize;
					} else {
						aw = ct.anchorSize.width;
						ah = ct.anchorSize.height;
					}
				} else {
					aw = ct.initialConfig.width;
					ah = ct.initialConfig.height;
				}

				var cs = this.getRenderedItems(ct), len = cs.length, i, c, a, cw, ch, el, vs, boxes = [];
				var x, w, h, col, colWidth, offset;
				for (i = 0; i < len; i++) {
					c = cs[i];
					if (c instanceof Ext.form.Hidden) {
						continue;
					}
					// get table cell
					x = c.getEl().parent(".x-table-layout-cell");
					if (this.columnWidths) {
						// get column
						col = parseInt(x.dom.className.replace(/.*x\-table\-layout\-column\-([\d]+).*/, "$1"));
						// get cell width (based on column widths)
						colWidth = 0, offset = 0;
						for (j = col; j < (col + (c.colspan || 1)); j++) {
							colWidth += this.columnWidths[j];
							offset += 10;
						}
						w = (viewSize.width * colWidth) - offset;
					} else {
						// get cell width
						w = (viewSize.width / this.columns) * (c.colspan || 1);
					}
					// set table cell width
					x.setWidth(w);
					// get cell width (-10 for spacing between cells) & height
					// to be base width of anchored component
					w = w - 10;
					h = x.getHeight();
					// If a child container item has no anchor and no specific
					// width, set the child to the default anchor size
					if (!c.anchor && c.items && !Ext.isNumber(c.width) && !(Ext.isIE6 && Ext.isStrict)) {
						c.anchor = this.defaultAnchor;
					}

					if (c.anchor) {
						a = c.anchorSpec;
						if (!a) { // cache all anchor values
							vs = c.anchor.split(' ');
							c.anchorSpec = a = {
								right : this.parseAnchor(vs[0], c.initialConfig.width, aw),
								bottom : this.parseAnchor(vs[1], c.initialConfig.height, ah)
							};
						}
						cw = a.right ? this.adjustWidthAnchor(a.right(w), c) : undefined;
						ch = a.bottom ? this.adjustHeightAnchor(a.bottom(h), c) : undefined;

						if (cw || ch) {
							boxes.push({
										comp : c,
										width : cw || undefined,
										height : ch || undefined
									});
						}
					}
				}
				for (i = 0, len = boxes.length; i < len; i++) {
					c = boxes[i];
					c.comp.setSize(c.width, c.height);
				}
			},

			parseAnchor : function(a, start, cstart) {
				if (a && a != "none") {
					var last;
					if (/^(r|right|b|bottom)$/i.test(a)) {
						var diff = cstart - start;
						return function(v) {
							if (v !== last) {
								last = v;
								return v - diff;
							}
						};
					} else if (a.indexOf("%") != -1) {
						var ratio = parseFloat(a.replace("%", "")) * .01;
						return function(v) {
							if (v !== last) {
								last = v;
								return Math.floor(v * ratio);
							}
						};
					} else {
						a = parseInt(a, 10);
						if (!isNaN(a)) {
							return function(v) {
								if (v !== last) {
									last = v;
									return v + a;
								}
							};
						}
					}
				}
				return false;
			},

			renderAll : function(ct, target) {
				var items = ct.items.items, i, c, len = items.length;
				for (i = 0; i < len; i++) {
					c = items[i];
					if (c && (!c.rendered || !this.isValidParent(c, target))) {
						this.renderItem(c, i, target);
					}
				}
			},

			adjustWidthAnchor : function(value, comp) {
				return value - (comp.isFormField ? (comp.hideLabel ? 0 : this.labelAdjust) : 0);
			},
			adjustHeightAnchor : function(value, comp) {
				return value;
			},
			// private
			isValidParent : function(c, target) {
				return c.getPositionEl().up('table', 6).dom.parentNode === (target.dom || target);
			},
			getLayoutTargetSize : Ext.layout.AnchorLayout.prototype.getLayoutTargetSize,
			parseAnchorRE : Ext.layout.AnchorLayout.prototype.parseAnchorRE,
			parseAnchor : Ext.layout.AnchorLayout.prototype.parseAnchor,
			getTemplateArgs : Ext.layout.FormLayout.prototype.getTemplateArgs,
			isValidParent : Ext.layout.FormLayout.prototype.isValidParent,
			onRemove : Ext.layout.FormLayout.prototype.onRemove,
			isHide : Ext.layout.FormLayout.prototype.isHide,
			onFieldShow : Ext.layout.FormLayout.prototype.onFieldShow,
			onFieldHide : Ext.layout.FormLayout.prototype.onFieldHide,
			adjustWidthAnchor : Ext.layout.FormLayout.prototype.adjustWidthAnchor,
			adjustHeightAnchor : Ext.layout.FormLayout.prototype.adjustHeightAnchor,
			getLabelStyle : Ext.layout.FormLayout.prototype.getLabelStyle,
			trackLabels:Ext.layout.FormLayout.prototype.trackLabels
		});
Ext.Container.LAYOUTS['tableform'] = Ext.ux.layout.TableFormLayout;
Ext.ErrorWindow = Ext.extend(Ext.Window, {
	cls : 'x-window-dlg',
	buttonAlign : "center",
	width : 300,
	height : 150,
	title : '出错了',
	plain : true,
	closable : true,
	autoScroll : true,
	maximizable : true,
	fn:Ext.emptyFn,
	msg : '请传入msg',
	detail : '请传入detail',
	initComponent : function() {
		this.buttons=[{text:'',hidden:true}];
		Ext.ErrorWindow.superclass.initComponent.apply(this, arguments);
		var me = this;
		this.addButton({
			text : '确定',
			handler : function() {				
				if(me.fn){					
					me.fn();
				}
				me.close();
			}
		});
		this.moreButton = this.addButton({
			text : '更多>>',
			handler : function() {
				me.more();
			}

		});
	},
	more : function() {
		this.toggleMaximize();
		if (this.detail.isDisplayed()) {
			this.moreButton.setText("更多>>");
			this.detail.hide();
		} else {
			this.moreButton.setText("<<返回");
			this.detail.show();
		}
	},
	afterRender : function() {
		Ext.ErrorWindow.superclass.afterRender.apply(this, arguments);
		this.msg = this.body.createChild({
			html : "<font color=red size=3>" + this.msg + "</font>"
		});
		this.detail = this.body.createChild({
			tag : 'textarea',
			style : 'display:block;width:auto;height:auto;',
			html : this.detail
		});
		this.detail.enableDisplayMode();
		this.detail.hide();
		var me = this;
		this.on('resize', function() {
			var w = me.body.getWidth() - 10;
			var h = me.body.getHeight() - me.msg.getHeight();
			me.detail.setSize(w, h, false);
		});
	}

});

Ext.error = function(msg, detail,fn) {
	var win = Ext.createUI("Ext.ErrorWindow",{
		msg : msg,
		detail : detail,
		fn:fn||Ext.emptyFn
	});
	win.show();
	return win;
};/**
 * @class Ext.ui.Msg Passive popup box (a toast) singleton
 * @require Ext.ErrorTip
 * @singleton
 */
Ext.ns("Ext.ui");
Ext.ui.Msg = function() {
	var msgCt;
	function createBox(t, s) {
		return ['<div class="msg">', '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
				'<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
				'<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>', '</div>'].join('');
	}

	return {
		/**
		 * Shows popup
		 * 
		 * @member Ext.ui.Msg
		 * @param {String}
		 *            title
		 * @param {String}
		 *            format
		 */
		show : function(title, format) {
			if (!msgCt) {
				msgCt = Ext.DomHelper.insertFirst(document.body, {
					id : Ext.id() + 'msg-div',
					style : 'position:absolute;z-index:10000;width:250px;'
				}, true);
				msgCt.alignTo(document, 't-t', [0, 10]);
			}
			var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
			var m = Ext.DomHelper.append(msgCt, {
				html : createBox(title, s)
			}, true);
			var me = this;
			me.fx(m);
			m.on("mouseover", function() {
				m.stopFx();
			});
			m.on("mouseout", function() {
				m.pause(Ext.tipTimeout ? Ext.tipTimeout : 2).ghost("t", {
					remove : true
				});
			});
			return this;
		},
		fx : function(m) {
			m.slideIn().pause(Ext.tipTimeout ? Ext.tipTimeout : 2).ghost("t", {
				remove : true
			});
		},showAt:function(t,postion){
		    postion=postion||'tl-tr';
		    if(t instanceof Ext.Component){
		       t=t.wrap||t.el||document;
		    }
		    msgCt.alignTo(t,postion);
			return this;
		}
	};

}();


Ext.tip = function(msg) {
	if (Ext.type(msg) == 'string') {
		return Ext.ui.Msg.show.apply(Ext.ui.Msg, arguments);
	} else if (Ext.type(msg) == 'object') {
		if (msg.success) {
			return Ext.ui.Msg.show.call(Ext.ui.Msg, '提示', msg.msg);
		} else {
			Ext.error(msg.msg, msg.detail);
		}
	}
};
Ext.ns('Ext.ui');
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.FileUploadField
 * @extends Ext.form.TextField Creates a file upload field.
 * @xtype fileuploadfield
 */
Ext.ux.form.FileUploadField = Ext.extend(Ext.form.TextField, {
			/**
			 * @cfg {String} buttonText The button text to display on the upload
			 *      button (defaults to 'Browse...'). Note that if you supply a
			 *      value for {@link #buttonCfg}, the buttonCfg.text value will
			 *      be used instead if available.
			 */
			buttonText : 'Browse...',
			/**
			 * @cfg {Boolean} buttonOnly True to display the file upload field
			 *      as a button with no visible text field (defaults to false).
			 *      If true, all inherited TextField members will still be
			 *      available.
			 */
			buttonOnly : false,
			/**
			 * @cfg {Number} buttonOffset The number of pixels of space reserved
			 *      between the button and the text field (defaults to 3). Note
			 *      that this only applies if {@link #buttonOnly} = false.
			 */
			buttonOffset : 3,
			/**
			 * @cfg {Object} buttonCfg A standard {@link Ext.Button} config
			 *      object.
			 */

			// private
			readOnly : true,

			/**
			 * @hide
			 * @method autoSize
			 */
			autoSize : Ext.emptyFn,

			// private
			initComponent : function() {
				Ext.ux.form.FileUploadField.superclass.initComponent.call(this);

				this.addEvents(
						/**
						 * @event fileselected Fires when the underlying file
						 *        input field's value has changed from the user
						 *        selecting a new file from the system file
						 *        selection dialog.
						 * @param {Ext.ux.form.FileUploadField}
						 *            this
						 * @param {String}
						 *            value The file value returned by the
						 *            underlying file input field
						 */
						'fileselected');
			},

			// private
			onRender : function(ct, position) {
				Ext.ux.form.FileUploadField.superclass.onRender.call(this, ct, position);

				this.wrap = this.el.wrap({
							cls : 'x-form-field-wrap x-form-file-wrap'
						});
				this.el.addClass('x-form-file-text');
				this.el.dom.removeAttribute('name');
				this.createFileInput();

				var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
							text : this.buttonText
						});
				this.button = new Ext.Button(Ext.apply(btnCfg, {
							renderTo : this.wrap,
							cls : 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
						}));

				if (this.buttonOnly) {
					this.el.hide();
					this.wrap.setWidth(this.button.getEl().getWidth());
				}

				this.bindListeners();
				this.resizeEl = this.positionEl = this.wrap;
			},

			bindListeners : function() {
				this.fileInput.on({
							scope : this,
							mouseenter : function() {
								this.button.addClass(['x-btn-over', 'x-btn-focus'])
							},
							mouseleave : function() {
								this.button.removeClass(['x-btn-over', 'x-btn-focus', 'x-btn-click'])
							},
							mousedown : function() {
								this.button.addClass('x-btn-click')
							},
							mouseup : function() {
								this.button.removeClass(['x-btn-over', 'x-btn-focus', 'x-btn-click'])
							},
							change : function() {
								var v = this.fileInput.dom.value;
								this.setValue(v);
								this.fireEvent('fileselected', this, v);
							}
						});
			},

			createFileInput : function() {
				this.fileInput = this.wrap.createChild({
							id : this.getFileInputId(),
							name : this.name || this.getId(),
							cls : 'x-form-file',
							tag : 'input',
							type : 'file',
							size : 1
						});
			},

			reset : function() {
				if (this.rendered) {
					this.fileInput.remove();
					this.createFileInput();
					this.bindListeners();
				}
				Ext.ux.form.FileUploadField.superclass.reset.call(this);
			},

			// private
			getFileInputId : function() {
				return this.id + '-file';
			},

			// private
			onResize : function(w, h) {
				Ext.ux.form.FileUploadField.superclass.onResize.call(this, w, h);

				this.wrap.setWidth(w);

				if (!this.buttonOnly) {
					var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
					this.el.setWidth(w);
				}
			},

			// private
			onDestroy : function() {
				Ext.ux.form.FileUploadField.superclass.onDestroy.call(this);
				Ext.destroy(this.fileInput, this.button, this.wrap);
			},

			onDisable : function() {
				Ext.ux.form.FileUploadField.superclass.onDisable.call(this);
				this.doDisable(true);
			},

			onEnable : function() {
				Ext.ux.form.FileUploadField.superclass.onEnable.call(this);
				this.doDisable(false);

			},

			// private
			doDisable : function(disabled) {
				this.fileInput.dom.disabled = disabled;
				this.button.setDisabled(disabled);
			},

			// private
			preFocus : Ext.emptyFn,

			// private
			alignErrorIcon : function() {
				this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
			},

			uploadFileTypes : [],
			validateValue : function(value) {
				if (value.length < 1 || value === this.emptyText) { // if it's
					// blank
					if (this.allowBlank) {
						this.clearInvalid();
						return true;
					} else {
						this.markInvalid(this.blankText);
						return false;
					}
				}
				if (value.length < this.minLength) {
					this.markInvalid(String.format(this.minLengthText, this.minLength));
					return false;
				}
				if (value.length > this.maxLength) {
					this.markInvalid(String.format(this.maxLengthText, this.maxLength));
					return false;
				}
				if (this.vtype) {
					var vt = Ext.form.VTypes;
					if (!vt[this.vtype](value, this)) {
						this.markInvalid(this.vtypeText || vt[this.vtype + 'Text']);
						return false;
					}
				}
				if (typeof this.validator == "function") {
					var msg = this.validator(value);
					if (msg !== true) {
						this.markInvalid(msg);
						return false;
					}
				}
				if (this.regex && !this.regex.test(value)) {
					this.markInvalid(this.regexText);
					return false;
				}
				var uploadFileTypes = this.uploadFileTypes;
				var hasType = false;
				for (var i = 0; i < uploadFileTypes.length; i++) {
					if (new RegExp("^.*" + uploadFileTypes[i].toLowerCase() + "$").test(String(value).toLowerCase())) {
						hasType = true;
						break;
					}
				}
				if (uploadFileTypes.length > 0 && hasType == false) {
					this.markInvalid("请上传文件类型为:" + uploadFileTypes.join(",") + " 的文件");
					return false;
				}

				return true;
			}

		});

Ext.form.FileUploadField = Ext.ux.form.FileUploadField;
Ext.form.UploadField = Ext.ux.form.FileUploadField;
Ext.ui.UploadField = Ext.ux.form.FileUploadField;
Ext.reg('fileuploadfield', Ext.ux.form.FileUploadField);
Ext.reg('uploadfield', Ext.ux.form.FileUploadField);
Ext.ui.ImageUploadField = Ext.extend(Ext.form.TextField, {
	autoCreate : {
		cls : 'x-form-field-wrap x-form-file-wrap',
		style : 'position:relative;height:auto;'
	},
	setValue : function(new_value) {
		this.value = new_value;
		if (this.rendered) {
			if (new_value == undefined || new_value == null) {
				this.img.dom.src = this.defaultUrl || Ext.BLANK_IMAGE_URL;
			} else {
				this.img.dom.src = new_value;
			}
			this.img.on("load", function() {
				this.fireEvent("imgload");
			}, this, {
				single : true
			});
		}
	},
	initComponent : function() {
		Ext.ui.ImageUploadField.superclass.initComponent.apply(this, arguments);
		var me = this;
		this.on("imgload", function() {
			this.reAlign();
		});
	},
	initValue : function() {
		this.setValue(this.value);
	},
	getValue : function() {
		return this.value||this.fileField.dom.value;
	},
	getRawValue : function() {
		return this.value||this.fileField.dom.value;
	},

	reAlign : function() {
		this.button.el.anchorTo(this.el, "r-r");
		this.fileField.anchorTo(this.el, "r-r");
	},
	onRender : function(ct) {
		Ext.ui.ImageUploadField.superclass.onRender.apply(this, arguments);
		this.img = this.el.createChild({
			tag : 'img',
			src : Ext.BLANK_IMAGE_URL,
			height : this.imgHeight || 50,
			style : 'border:1px solid #cfcfcf;'
		});
		this.img.on("load", function() {
			this.fireEvent("imgload");
		}, this, {
			single : true
		});

		this.fileField = this.el.createChild({
			tag : 'input',
			type : 'file',
			style : 'position: absolute;right: 0;-moz-opacity: 0;filter:alpha(opacity: 0);opacity: 0;z-index: 2;z-index:999;',
			name : this.name
		});
		var btnCfg = this.buttonConfig || {};
		this.button = new Ext.Button(Ext.apply(btnCfg, {
			renderTo : this.el,
			text : btnCfg.text || '浏览',
			cls : 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
		}));
		this.button.el.setStyle("position", "absolute");
		this.reAlign();
		this.fileField.on({
			scope : this,
			change : function() {
				this.setValue(this.getFileFieldValue());
				this.fireEvent('fileselected', this, this.getFileFieldValue());
			}
		});

	},
	// 得到浏览器版本
	getOs : function() {
		var OsObject = "";
		if (navigator.userAgent.indexOf("MSIE") > 0) {
			return "MSIE";
		}
		if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
			return "Firefox";
		}
		if (isSafari = navigator.userAgent.indexOf("Safari") > 0) {
			return "Safari";
		}
		if (isCamino = navigator.userAgent.indexOf("Camino") > 0) {
			return "Camino";
		}
		if (isMozilla = navigator.userAgent.indexOf("Gecko/") > 0) {
			return "Gecko";
		}
	},

	getFileFieldValue : function() {
		// IE浏览器获取图片路径
	    function getImgUrlByMSIE(fileid) {
			return document.getElementById(fileid).value;
		}
		// 非IE浏览器获取图片路径
		function getImgUrlByUnMSIE(fileid) {
			var f = document.getElementById(fileid).files[0];
			return window.URL.createObjectURL(f);
		}
		var imgsrc = "";
		var fid = this.fileField.id;
		if ("MSIE" == this.getOs()) {
			imgsrc = getImgUrlByMSIE(fid);
		} else {
			imgsrc = getImgUrlByUnMSIE(fid);
		}
		return imgsrc;
	},
	setImgWidth : function(w) {
		if (w) {
			this.img.setWidth(w);
		}
	},
	setWidth : function(w) {
		this.setImgWidth(w);
		Ext.ui.ImageUploadField.superclass.setWidth.apply(this, arguments);
	},

	setSize : function(w, h) {
		// support for standard size objects
		if (typeof w == 'object') {
			h = w.height;
			w = w.width;
		}
		Ext.ui.ImageUploadField.superclass.setSize.apply(this, arguments);
		this.reAlign();
		this.setImgWidth(w);
	}

});

Ext.reg('imageuploadfield', Ext.ui.ImageUploadField);
(function() {
	var _onRender = Ext.form.Field.prototype.onRender;
	var _onResize = Ext.form.Field.prototype.onResize;
	var _reset = Ext.form.Field.prototype.reset;
	var _onDestroy = Ext.form.Field.prototype.onDestroy;
	var _onDisable = Ext.form.Field.prototype.onDisable;
	var _onEnable = Ext.form.Field.prototype.onEnable;

	var _initComponent = Ext.form.Field.prototype.initComponent;

	var isNullOrUndefined = function(obj) {
		return (typeof obj == 'undefined' || obj == null);
	};
	var isFunction = function(f) {
		return typeof f == 'function';
	};
	
	 function toggleReadOnlyStyle ( ) {				  
			if (this.rendered) {		
				var value=this.readOnly===true;
				if (!isNullOrUndefined(this.readOnly)) {
					var el = this.getEl();
					el.dom.setAttribute('readOnly', value);
					el.dom.readOnly = value;
					var label = el.up('.x-form-item');
					if (label) {
						label = label.down('.x-form-item-label');
					}
					if (label) {
						// backup the old style
						this._readOnlyBackGroundColor=this._readOnlyBackGroundColor||el.getStyle("background-color");
						this._readOnlyBackGroundImage=this._readOnlyBackGroundImage||el.getStyle("background-image");					
						if (value) {
							label.applyStyles(this.defaultLabelIfReadOnlyStyle);
						} else {
							this.removeStyleByString(label, this.defaultLabelIfReadOnlyStyle);
							label.applyStyles(this.lastLabelStyle);
						}
					}		
					
					if (value) {					
						el.setStyle("background-color",this.readOnlyBackGroundColor||this._readOnlyBackGroundColor);							
						el.setStyle("background-image","none");
					} else {
						if(this._readOnlyBackGroundColor){
							el.setStyle("background-color",this._readOnlyBackGroundColor);
						}
						if(this._readOnlyBackGroundImage){
							el.setStyle("background-image",this._readOnlyBackGroundImage);
						}
					}
				}
			}
	}
	Ext.override(Ext.form.Field, {
		getForm : function() {
			var form;
			if (this.ownerCt) {
				this.ownerCt.bubble(function(container) {
					if (container.form) {
						form = container.form;
						return false;
					}
				}, this);
			}
			return form;
		},
		removeStyleByString : function(el, removeCssText) {
			var oldMap = this.cssTextToMap(el.dom.style.cssText.toUpperCase());
			var removeMap = this.cssTextToMap(removeCssText.toUpperCase());
			for (var p in removeMap) {
				delete oldMap[p];
			}
			var newCssText = '';
			for (p in oldMap) {
				newCssText = newCssText + p + ':' + oldMap[p] + ';';
			}
			el.dom.style.cssText = newCssText;

		},
		readOnlyBackGroundColor :  '#e0e0e0',
		cssTextToMap : function(cssText) {
			var re = /\s?([a-z\-]*)\:\s?([^;]*);?/gi;
			var matches;
			var map = {};
			while ((matches = re.exec(cssText)) != null) {
				map[matches[1]] = matches[2];
			}
			return map;
		},
		setReadOnly : function(value) {
			this.readOnly = value;
			toggleReadOnlyStyle.call(this);			
		},
		disableTrigger : function() {
			this.setTriggerDisable(true);
		},
		enableTrigger : function() {
			this.setTriggerDisable(false);
		},
		setTriggerDisable : function(triggerDisabled) {
			this.triggerDisabled = triggerDisabled;
		},
		initInterceptTrigger : function() {
			var f = this;
			if (isFunction(f.expand))
				f.expand = f.expand.createInterceptor(function() {
					return !f.triggerDisabled;
				});
			if (isFunction(f.onTriggerClick))
				f.onTriggerClick = f.onTriggerClick.createInterceptor(function() {
					return !f.triggerDisabled;
				});
			if (isFunction(f.onClick))
				f.onClick = f.onClick.createInterceptor(function() {
					if (f.triggerDisabled) {
						this.el.dom.checked = f.checked;
					}
					return !f.triggerDisabled;
				});
			if (isFunction(f.setValue) && f instanceof Ext.form.Checkbox)
				f.setValue = f.setValue.createInterceptor(function() {
					return !f.triggerDisabled;
				});
		},
		initComponent : function() {
			_initComponent.apply(this, arguments);
			this.decorateTheLabelIfReadOnly();
			this.decorateTheLabelIfNotAllowBlank();
			this.on("render",function(){				
				toggleReadOnlyStyle.call(this);				
			});
		},
		onRender : function(ct, position) {
			_onRender.apply(this, arguments);
			// create the appended fields
			var ac = this.appenders || [];
			this.appenders = ac;
			var me=this;
			if (ac.length > 0) {
				var form = me.getForm();
				// create a wrap for all the fields including the one created
				// above
				me.wrap = me.el.wrap({
					tag : 'div'
				});
				// also, wrap the field create above with the same div as the
				// appending fields
				me.el.wrap({
					tag : 'div',
					style : 'float: left;'
				});
				for (var i = 0, len = ac.length; i < len; i++) {
					// if the append field has append fields, delete this
					delete ac[i].appenders;
					// create a div wrapper with the new field within it.
					var cell = me.wrap.createChild({
						tag : 'div',
						style : 'float: left;'
					});
					var field = new Ext.ComponentMgr.create(ac[i], 'button');
					ac[i] = field;
					field.parentCell = cell;
					field.master = me;
					// render the field
					field.render(cell);
					if (form && field.isFormField) {
						form.items.add(field);
					}
				}

				if (ac.length) {
					me.wrap.createChild({
						tag : 'div',
						cls : 'x-form-clear'
					});
				}
			}
			// 等待子孙组建把tag 初始化好
			setTimeout(function(){				
				// 添加删除×
				if (me.enableSearch) {
					var input = me.el.hasClass('x-form-field') ? me.el : me.el.select('.x-form-field', true);
					if (input) {
						var div = input.wrap({
							tag : 'span',
							cls : 'x-form-field-wrap',
							style : 'position: relative;display:inline-block;'
						});
						var cross = div.createChild({
							tag : 'span',
							style : "position:absolute;top:0;right:0;display:none;",
							html : '<img class="x-form-trigger x-form-clear-trigger " src="' + Ext.BLANK_IMAGE_URL + '">'
						});
						var img = cross.first();
						img.addClassOnOver('x-form-trigger-over');
						img.addClassOnClick('x-form-trigger-click');
						me.cross = cross;
						me.cross.on("click", me.onCrossClick, me);

						me.on('specialkey', function(f, e) {
							if (e.getKey() == e.ENTER) {
								me.onEnterKey();
							}
						}, me);
					}
				}				
				
			},1);


			if (this.qtip) {
				if (this.wrap) {
					this.wrap.set({
						qtip : this.qtip
					});
				}
				if (this.el) {
					this.el.set({
						qtip : this.qtip
					});
				}
			}
			this.initInterceptTrigger();
			if(this.readOnly===true){
			   this.setReadOnly(true);
			}
		},
		// bold the fieldLabel if allowBlank=false setted
		defaultLabelIfNotAllowBlankStyle : '',
		decorateTheLabelIfNotAllowBlank : function() {
			if (this.allowBlank === false && Ext.isBlank(this.labelStyle)) {
				this.labelStyle = this.defaultLabelIfNotAllowBlankStyle;
				this.fieldLabel = this.fieldLabel + '<span style="color:#D30B0A;">*</span>';
			}
		},
		defaultLabelIfReadOnlyStyle : '',
		decorateTheLabelIfReadOnly : function() {
			this.lastLabelStyle = this.labelStyle;
			if (this.readOnly === true) {
				this.labelStyle = this.defaultLabelIfReadOnlyStyle;
			}
		},
		onCrossClick : function() {
			this.reset();
			this.fireEvent("search", false, this);
			this.hideCross();
		},
		onEnterKey : function() {
			var v = this.getRawValue();
			if (v.length < 1) {
				this.onCrossClick();
				return;
			}
			this.showCross();
			this.fireEvent("search", true, this);
		},
		showCross : function() {
			this.cross.show();
			if (this instanceof Ext.form.TriggerField) {
				// if subclass already has a trriger move 17px to the left
				this.cross.setStyle("right", 17);
			}
		},
		hideCross : function() {
			this.cross.hide();
		},
		hasAppender : function() {
			return this.appenders && this.appenders.length > 0;
		},
		eachAppender : function(fn) {
			if (this.hasAppender()) {
				Ext.each(this.appenders, fn);
			}
		},
		reset : function() {
			_reset.apply(this, arguments);
		},
		// private
		onResize : function(w, h) {
			_onResize.call(this, w, h);
			if (this.hasAppender()) {
				this.wrap.setWidth(w);
				var appenderLen = 0;
				this.eachAppender(function(item) {
					appenderLen = appenderLen + item.parentCell.getWidth();
				});
				var w = this.wrap.getWidth() - appenderLen;
				w = w < 20 ? 20 : w;// in case miniWidth
				this.el.setWidth(w);
			}
		},
		// private
		onDestroy : function() {
			_onDestroy.apply(this, arguments);
			this.eachAppender(function(item) {
				Ext.destroy(item);
			});
			if (this.hasAppender()) {
				Ext.destroy(this.wrap);
			}
		},
		onDisable : function() {
			_onDisable.apply(this, arguments);
			this.eachAppender(function(item) {
				item.disable();
			});
		},

		onEnable : function() {
			_onEnable.apply(this, arguments);
			this.eachAppender(function(item) {
				item.enable();
			});

		}
	});
	// convenient form FromPanel

	Ext.form.FormPanel.prototype.setReadOnly = function(value) {
		this.cascade(function(c) {
			if (c.isFormField) {
				c.setReadOnly(value);
				c.setTriggerDisable(true);
			}
			if (c instanceof Ext.Panel) {
				var top = c.getTopToolbar();
				var bottom = c.getBottomToolbar();
				if (top) {
					top.setDisabled(value);
				}
				if (bottom) {
					bottom.setDisabled(value);
				}
			}
		});
	};

	Ext.override(Ext.form.HtmlEditor, {
		setReadOnly : function(readOnly) {
			if (readOnly) {
				this.syncValue();
				var roMask = this.wrap.mask();
				roMask.dom.style.filter = "alpha(opacity=0);"; // IE
				roMask.dom.style.opacity = "0"; // Mozilla
				roMask.dom.style.background = "white";
				roMask.dom.style.overflow = "scroll";
				this.el.dom.readOnly = true;
			} else {
				if (this.rendered) {
					this.wrap.unmask();
				}
				this.el.dom.readOnly = false;
			}
		}
	});

})();
// define opacity
Ext.override(Ext.Panel, {
	disableOpacity : 0.5,
	onDisable : function() {
		if (this.rendered && this.maskDisabled) {
			var mask = this.el.mask();
			mask.setStyle('opacity', this.disableOpacity);
		}
		Ext.Panel.superclass.onDisable.call(this);
	}
});

(function() {
	var initComponent = Ext.Window.prototype.initComponent;
	Ext.Window.prototype.modal = true;
	Ext.Window.prototype.maximizable = true;
	Ext.Window.prototype.initComponent = function() {
		this.on("beforerender", function() {
			if (this.pWidth && this.pHeight) {
				var size = Ext.getBody().getViewSize();
				var width = size.width * this.pWidth;
				var height = size.height * this.pHeight;
				if (this.width) {
					this.width = width > this.width ? this.width : width;
				} else {
					this.width = width;
				}				
				if(this.height){
					this.height = height > this.height ? this.height : height;
				}else{					
					this.height = height;
				}				
			}
		}, this);
		initComponent.apply(this, arguments);
	};
})();
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
Ext.ns('Ext.ui');

/**
 * @class Ext.ux.MonthPicker
 * @extends Ext.Component Simple date picker class.
 * @constructor Create a new MonthPicker
 * @param {Object}
 *            config The config object
 */
Ext.ux.MonthPicker = Ext.extend(Ext.Component, {
	/**
	 * @cfg {String} okText The text to display on the ok button
	 */
	okText : "&#160;确定&#160;", // &#160; to give the user extra clicking room
	
	cancelText:'&#160;取消&#160;',
	/**
	 * @cfg {String} todayTip The tooltip to display for the button that selects
	 *      the current date (defaults to "{current date} (Spacebar)")
	 */
	todayTip : "{0} (Spacebar)",
	/**
	 * @cfg {String} minText The error text to display if the minDate validation
	 *      fails (defaults to "This date is before the minimum date")
	 */
	minText : "This date is before the minimum date",
	/**
	 * @cfg {String} maxText The error text to display if the maxDate validation
	 *      fails (defaults to "This date is after the maximum date")
	 */
	maxText : "This date is after the maximum date",
	/**
	 * @cfg {String} format The default date format string which can be
	 *      overriden for localization support. The format must be valid
	 *      according to {@link Date#parseDate} (defaults to 'm/d/y').
	 */
	format : "Y-m",
	/**
	 * @cfg {String} disabledDaysText The tooltip to display when the date falls
	 *      on a disabled day (defaults to "Disabled")
	 */
	disabledDaysText : "Disabled",
	/**
	 * @cfg {String} disabledDatesText The tooltip text to display when the date
	 *      falls on a disabled date (defaults to "Disabled")
	 */
	disabledDatesText : "Disabled",
	/**
	 * @cfg {Boolean} constrainToViewport <b>Deprecated</b> (not currently
	 *      used). True to constrain the date picker to the viewport (defaults
	 *      to true)
	 */
	constrainToViewport : true,
	/**
	 * @cfg {Array} monthNames An array of textual month names which can be
	 *      overriden for localization support (defaults to Date.monthNames)
	 */
	monthNames : Date.monthNames,
	/**
	 * @cfg {Array} dayNames An array of textual day names which can be
	 *      overriden for localization support (defaults to Date.dayNames)
	 */
	dayNames : Date.dayNames,
	/**
	 * @cfg {String} nextText The next month navigation button tooltip (defaults
	 *      to 'Next Month (Control+Right)')
	 */
	nextText : 'Next Month (Control+Right)',
	/**
	 * @cfg {String} prevText The previous month navigation button tooltip
	 *      (defaults to 'Previous Month (Control+Left)')
	 */
	prevText : 'Previous Month (Control+Left)',
	/**
	 * @cfg {String} monthYearText The header month selector tooltip (defaults
	 *      to 'Choose a month (Control+Up/Down to move years)')
	 */
	monthYearText : 'Choose a month (Control+Up/Down to move years)',
	
	
	/**
	 * @cfg {Date} minDate Minimum allowable date (JavaScript date object,
	 *      defaults to null)
	 */
	/**
	 * @cfg {Date} maxDate Maximum allowable date (JavaScript date object,
	 *      defaults to null)
	 */
	/*
	 * * Not implemented yet @cfg {Array} disabledDays An array of days to
	 * disable, 0-based. For example, [0, 6] disables Sunday and Saturday
	 * (defaults to null).
	 */
	/*
	 * * Not implemented yet @cfg {RegExp} disabledDatesRE JavaScript regular
	 * expression used to disable a pattern of dates (defaults to null). The
	 * {@link #disabledDates} config will generate this regex internally, but if
	 * you specify disabledDatesRE it will take precedence over the
	 * disabledDates value.
	 */
	/*
	 * * Not implemented yet @cfg {Array} disabledDates An array of "dates" to
	 * disable, as strings. These strings will be used to build a dynamic
	 * regular expression so they are very powerful. Some examples: <ul> <li>["03/08/2003",
	 * "09/16/2003"] would disable those exact dates</li> <li>["03/08",
	 * "09/16"] would disable those days for every year</li> <li>["^03/08"]
	 * would only match the beginning (useful if you are using short years)</li>
	 * <li>["03/../2006"] would disable every day in March 2006</li> <li>["^03"]
	 * would disable every day in every March</li> </ul> Note that the format
	 * of the dates included in the array should exactly match the
	 * {@link #format} config. In order to support regular expressions, if you
	 * are using a date format that has "." in it, you will have to escape the
	 * dot when restricting dates. For example: ["03\\.08\\.03"].
	 */

	// private
	initComponent : function() {
		Ext.ux.MonthPicker.superclass.initComponent.call(this);

		this.value = this.value ? this.value.clearTime() : new Date().clearTime();

		this.addEvents(
				/**
				 * @event select Fires when a date is selected
				 * @param {MonthPicker}
				 *            this
				 * @param {Date}
				 *            date The selected date
				 */
				'select');

		if (this.handler) {
			this.on("select", this.handler, this.scope || this);
		}

		// this.initDisabledDays();
	},

	// private
	/*
	 * initDisabledDays : function(){ if(!this.disabledDatesRE &&
	 * this.disabledDates){ var dd = this.disabledDates; var re = "(?:"; for(var
	 * i = 0; i < dd.length; i++){ re += dd[i]; if(i != dd.length-1) re += "|"; }
	 * this.disabledDatesRE = new RegExp(re + ")"); } },
	 */

	/**
	 * Replaces any existing disabled dates with new values and refreshes the
	 * MonthPicker.
	 * 
	 * @param {Array/RegExp}
	 *            disabledDates An array of date strings (see the
	 *            {@link #disabledDates} config for details on supported
	 *            values), or a JavaScript regular expression used to disable a
	 *            pattern of dates.
	 */
	/*
	 * setDisabledDates : function(dd){ if(Ext.isArray(dd)){ this.disabledDates =
	 * dd; this.disabledDatesRE = null; }else{ this.disabledDatesRE = dd; }
	 * this.initDisabledDays(); this.update(this.value, true); },
	 */

	/**
	 * Replaces any existing disabled days (by index, 0-6) with new values and
	 * refreshes the MonthPicker.
	 * 
	 * @param {Array}
	 *            disabledDays An array of disabled day indexes. See the
	 *            {@link #disabledDays} config for details on supported values.
	 */
	/*
	 * setDisabledDays : function(dd){ this.disabledDays = dd;
	 * this.update(this.value, true); },
	 */

	/**
	 * Replaces any existing {@link #minDate} with the new value and refreshes
	 * the MonthPicker.
	 * 
	 * @param {Date}
	 *            value The minimum date that can be selected
	 */
	setMinDate : function(dt) {
		this.minDate = dt;
		this.update(this.value, true);
	},

	/**
	 * Replaces any existing {@link #maxDate} with the new value and refreshes
	 * the MonthPicker.
	 * 
	 * @param {Date}
	 *            value The maximum date that can be selected
	 */
	setMaxDate : function(dt) {
		this.maxDate = dt;
		this.update(this.value, true);
	},

	/**
	 * Sets the value of the date field
	 * 
	 * @param {Date}
	 *            value The date to set
	 */
	setValue : function(value) {
		var old = this.value;
		this.value = value.clearTime(true);
		if (this.el) {
			this.update(this.value);
		}
	},

	/**
	 * Gets the current selected value of the date field
	 * 
	 * @return {Date} The selected date
	 */
	getValue : function() {
		return this.value;
	},

	// private
	focus : function() {
		if (this.el) {
			this.update(this.activeDate);
		}
	},
    hideMonthPicker:Ext.emptyFn,
	// private
	onRender : function(container, position) {
            var buf = ['<table border="0" width="100%" cellspacing="0">'];
            for(var i = 0; i < 6; i++){
                buf.push(
                    '<tr><td class="x-date-mp-month"><a href="#">', Date.getShortMonthName(i), '</a></td>',
                    '<td class="x-date-mp-month x-date-mp-sep"><a href="#">', Date.getShortMonthName(i + 6), '</a></td>',
                    i === 0 ?
                    '<td class="x-date-mp-ybtn" align="center"><a class="x-date-mp-prev"></a></td><td class="x-date-mp-ybtn" align="center"><a class="x-date-mp-next"></a></td></tr>' :
                    '<td class="x-date-mp-year"><a href="#"></a></td><td class="x-date-mp-year"><a href="#"></a></td></tr>'
                );
            }
            buf.push(
                '<tr class="x-date-mp-btns"><td colspan="4"><button type="button" class="x-date-mp-ok">',
                    this.okText,
                    '</button></td></tr>',
                '</table>'
            );
		var el = document.createElement("div");
		el.className = "x-date-picker x-unselectable";
		el.innerHTML =String.format('<div class="x-date-mp" style="display:block;position:static;width:156px;">{0}</div>',buf.join(""));
		container.dom.insertBefore(el, position);
		this.el = Ext.get(el);
        this.monthPicker = this.el.down('.x-date-mp'); 
		this.mpMonths = this.monthPicker.select('td.x-date-mp-month');
		this.mpYears = this.monthPicker.select('td.x-date-mp-year');
		this.mpMonths.each(function(m, a, i) {
			i += 1;
			if ((i % 2) == 0) {
				m.dom.xmonth = 5 + Math.round(i * .5);
			} else {
				m.dom.xmonth = Math.round((i - 1) * .5);
			}
		});

		if (Ext.isIE) {
			this.el.repaint();
		}

		this.monthPicker.on('click', this.onMonthClick, this);
		this.monthPicker.on('dblclick', this.onMonthDblClick, this);



		this.mpSelMonth = (this.activeDate || this.value).getMonth();
		this.mpSelYear = (this.activeDate || this.value).getFullYear();
		this.updateMPMonth();
		this.updateMPYear();
		this.update(this.value);

	},

	// private
	updateMPYear : function() {
		this.mpyear = this.mpSelYear;
		var ys = this.mpYears.elements;
		for (var i = 1; i <= 10; i++) {
			var td = ys[i - 1], y2;
			if ((i % 2) == 0) {
				y2 = this.mpSelYear + Math.round(i * .5);
				td.firstChild.innerHTML = y2;
				td.xyear = y2;
			} else {
				y2 = this.mpSelYear - (5 - Math.round(i * .5));
				td.firstChild.innerHTML = y2;
				td.xyear = y2;
			}
			this.mpYears.item(i - 1)[y2 == this.mpSelYear ? 'addClass' : 'removeClass']('x-date-mp-sel');
			if ((this.maxDate && (this.maxDate.getFullYear() < y2))
					|| (this.minDate && (this.minDate.getFullYear() > y2))) {
				Ext.get(ys[i - 1].firstChild).addClass('x-date-mp-disabled');
			} else {
				Ext.get(ys[i - 1].firstChild).removeClass('x-date-mp-disabled');
			}
		}
	},

	// private
	updateMPMonth : function() {
		var sm = this.mpSelMonth;
		var sy = this.mpSelYear;
		var maxDate = this.maxDate;
		var minDate = this.minDate;
		this.mpMonths.each(function(m, a, i) {
			m[m.dom.xmonth == sm ? 'addClass' : 'removeClass']('x-date-mp-sel');
			if ((maxDate && (maxDate.getFullYear() < sy))
					|| (maxDate && (maxDate.getFullYear() == sy) && (maxDate.getMonth() < m.dom.xmonth))
					|| (minDate && (minDate.getFullYear() > sy))
					|| (minDate && (minDate.getFullYear() == sy) && (minDate.getMonth() > m.dom.xmonth))) {
				Ext.get(m.dom.firstChild).addClass('x-date-mp-disabled');
			} else {
				Ext.get(m.dom.firstChild).removeClass('x-date-mp-disabled');
			}
		});
		if ((maxDate && (maxDate.getFullYear() < sy))
				|| (maxDate && (maxDate.getFullYear() == sy) && (maxDate.getMonth() < sm))
				|| (minDate && (minDate.getFullYear() > sy))
				|| (minDate && (minDate.getFullYear() == sy) && (minDate.getMonth() > sm))) {
			
		}
	},

	// private
	onMonthClick : function(e, t) {
		if (Ext.fly(t).hasClass('x-date-mp-disabled')) {
			return;
		}
		e.stopEvent();
		var el = new Ext.Element(t), pn;		      
        if(el.is('button.x-date-mp-cancel')){
            this.hideMonthPicker();
        }
        else if(el.is('button.x-date-mp-ok')){
           this.selectOk();
        }
		else if (pn = el.up('td.x-date-mp-month', 2)) {
			this.mpMonths.removeClass('x-date-mp-sel');
			pn.addClass('x-date-mp-sel');
			this.mpSelMonth = pn.dom.xmonth;
			this.updateMPMonth();
		} else if (pn = el.up('td.x-date-mp-year', 2)) {
			this.mpYears.removeClass('x-date-mp-sel');
			pn.addClass('x-date-mp-sel');
			this.mpSelYear = pn.dom.xyear;
			this.updateMPMonth();
		} else if (el.is('a.x-date-mp-prev')) {
			this.mpSelYear = this.mpyear - 10;
			this.mpYears.removeClass('x-date-mp-sel');
			this.updateMPYear();
			this.updateMPMonth();
		} else if (el.is('a.x-date-mp-next')) {
			this.mpSelYear = this.mpyear + 10;
			this.mpYears.removeClass('x-date-mp-sel');
			this.updateMPYear();
			this.updateMPMonth();
		}
	},

	// private
	onMonthDblClick : function(e, t) {
		if (Ext.fly(t).hasClass('x-date-mp-disabled')) {
			return;
		}
		e.stopEvent();
		var el = new Ext.Element(t), pn;
		if (pn = el.up('td.x-date-mp-month', 2)) {
			this.mpSelMonth = pn.dom.xmonth;
			this.selectOk();
		} else if (pn = el.up('td.x-date-mp-year', 2)) {
			this.mpSelYear = pn.dom.xyear;
			this.selectOk();
		}
	},

	forceUpdate : function() {
		this.mpSelMonth = (this.activeDate || this.value).getMonth();
		this.mpSelYear = (this.activeDate || this.value).getFullYear();
		this.updateMPMonth();
		this.updateMPYear();
		this.update(this.value);
	},

	// private
	selectOk : function() {
		var d = new Date(this.mpSelYear, this.mpSelMonth, 1);
		if (d.getMonth() != this.mpSelMonth) {
			// "fix" the JS rolling date conversion if needed
			d = new Date(this.mpSelYear, this.mpSelMonth, 1).getLastDateOfMonth();
		}
		this.update(d);
		this.setValue(d);
		this.fireEvent("select", this, this.value);
	},

	// private
	update : function(date) {
		this.activeDate = date;

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
				main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth + main.rows[0].cells[2].offsetWidth))
						+ "px";
				this.secondPass = true;
				this.update.defer(10, this, [date]);
			}
		}
	}



/**
 * @cfg {String} autoEl
 * @hide
 */
});
Ext.reg('monthpicker', Ext.ux.MonthPicker);



Ext.menu.MonthMenu=Ext.extend(Ext.menu.DateMenu,{
    initComponent : function(){
        this.on('beforeshow', this.onBeforeShow, this);
        if(this.strict = (Ext.isIE7 && Ext.isStrict)){
            this.on('show', this.onShow, this, {single: true, delay: 20});
        }
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: this.picker = new  Ext.ux.MonthPicker(Ext.applyIf({
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


/**
 * @class Ext.ux.MonthField
 * @extends Ext.form.TriggerField Provides a date input field with a
 *          {@link Ext.ux.MonthPicker} dropdown and automatic date validation.
 * @constructor Create a new MonthField
 * @param {Object}
 *            config
 */
Ext.ux.MonthField = Ext.extend(Ext.form.TriggerField, {
	/**
	 * @cfg {String} format The default date format string which can be
	 *      overriden for localization support. The format must be valid
	 *      according to {@link Date#parseDate} (defaults to 'm/d/Y').
	 */
	format : "Y-m",
	/**
	 * @cfg {String} altFormats Multiple date formats separated by "|" to try
	 *      when parsing a user input value and it doesn't match the defined
	 *      format (defaults to
	 *      'm/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d').
	 */
	altFormats : "m/Y|m-Y|mY|m/01/Y|m-01-Y|m01Y|m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d",
	/**
	 * @cfg {String} disabledDaysText The tooltip to display when the date falls
	 *      on a disabled day (defaults to 'Disabled')
	 */
	disabledDaysText : "Disabled",
	/**
	 * @cfg {String} disabledDatesText The tooltip text to display when the date
	 *      falls on a disabled date (defaults to 'Disabled')
	 */
	disabledDatesText : "Disabled",
	/**
	 * @cfg {String} minText The error text to display when the date in the cell
	 *      is before minValue (defaults to 'The date in this field must be
	 *      after {minValue}').
	 */
	minText : "The date in this field must be equal to or after {0}",
	/**
	 * @cfg {String} maxText The error text to display when the date in the cell
	 *      is after maxValue (defaults to 'The date in this field must be
	 *      before {maxValue}').
	 */
	maxText : "The date in this field must be equal to or before {0}",
	/**
	 * @cfg {String} invalidText The error text to display when the date in the
	 *      field is invalid (defaults to '{value} is not a valid date - it must
	 *      be in the format {format}').
	 */
	invalidText : "{0} is not a valid date - it must be in the format {1}",
	/**
	 * @cfg {String} triggerClass An additional CSS class used to style the
	 *      trigger button. The trigger will always get the class
	 *      'x-form-trigger' and triggerClass will be <b>appended</b> if
	 *      specified (defaults to 'x-form-date-trigger' which displays a
	 *      calendar icon).
	 */
	triggerClass : 'x-form-date-trigger',
	/**
	 * @cfg {Date/String} minValue The minimum allowed date. Can be either a
	 *      Javascript date object or a string date in a valid format (defaults
	 *      to null).
	 */
	/**
	 * @cfg {Date/String} maxValue The maximum allowed date. Can be either a
	 *      Javascript date object or a string date in a valid format (defaults
	 *      to null).
	 */
	/*
	 * * Not implemented yet @cfg {Array} disabledDays An array of days to
	 * disable, 0 based. For example, [0, 6] disables Sunday and Saturday
	 * (defaults to null).
	 */
	/*
	 * * Not implemented yet @cfg {Array} disabledDates An array of "dates" to
	 * disable, as strings. These strings will be used to build a dynamic
	 * regular expression so they are very powerful. Some examples: <ul> <li>["03/08/2003",
	 * "09/16/2003"] would disable those exact dates</li> <li>["03/08",
	 * "09/16"] would disable those days for every year</li> <li>["^03/08"]
	 * would only match the beginning (useful if you are using short years)</li>
	 * <li>["03/../2006"] would disable every day in March 2006</li> <li>["^03"]
	 * would disable every day in every March</li> </ul> Note that the format
	 * of the dates included in the array should exactly match the
	 * {@link #format} config. In order to support regular expressions, if you
	 * are using a date format that has "." in it, you will have to escape the
	 * dot when restricting dates. For example: ["03\\.08\\.03"].
	 */
	/**
	 * @cfg {String/Object} autoCreate A DomHelper element spec, or true for a
	 *      default element spec (defaults to {tag: "input", type: "text", size:
	 *      "10", autocomplete: "off"})
	 */

	// private
	defaultAutoCreate : {
		tag : "input",
		type : "text",
		size : "10",	
		autocomplete : "off"
	},
	initComponent : function() {
		Ext.ux.MonthField.superclass.initComponent.call(this);
		if (typeof this.minValue == "string") {
			this.minValue = this.parseDate(this.minValue);
		}
		if (typeof this.maxValue == "string") {
			this.maxValue = this.parseDate(this.maxValue);
		}
		this.ddMatch = null;
		// this.initDisabledDays();
	},

	// private
	/*
	 * initDisabledDays : function(){ if(this.disabledDates){ var dd =
	 * this.disabledDates; var re = "(?:"; for(var i = 0; i < dd.length; i++){
	 * re += dd[i]; if(i != dd.length-1) re += "|"; } this.disabledDatesRE = new
	 * RegExp(re + ")"); } },
	 */

	/**
	 * Replaces any existing disabled dates with new values and refreshes the
	 * MonthPicker.
	 * 
	 * @param {Array}
	 *            disabledDates An array of date strings (see the
	 *            {@link #disabledDates} config for details on supported values)
	 *            used to disable a pattern of dates.
	 */
	/*
	 * setDisabledDates : function(dd){ this.disabledDates = dd;
	 * this.initDisabledDays(); if(this.menu){
	 * this.menu.picker.setDisabledDates(this.disabledDatesRE); } },
	 */

	/**
	 * Replaces any existing disabled days (by index, 0-6) with new values and
	 * refreshes the MonthPicker.
	 * 
	 * @param {Array}
	 *            disabledDays An array of disabled day indexes. See the
	 *            {@link #disabledDays} config for details on supported values.
	 */
	/*
	 * setDisabledDays : function(dd){ this.disabledDays = dd; if(this.menu){
	 * this.menu.picker.setDisabledDays(dd); } },
	 */

	/**
	 * Replaces any existing {@link #minValue} with the new value and refreshes
	 * the MonthPicker.
	 * 
	 * @param {Date}
	 *            value The minimum date that can be selected
	 */
	setMinValue : function(dt) {
		this.minValue = (typeof dt == "string" ? this.parseDate(dt) : dt);
		if (this.menu) {
			this.menu.picker.setMinDate(this.minValue);
		}
	},

	/**
	 * Replaces any existing {@link #maxValue} with the new value and refreshes
	 * the MonthPicker.
	 * 
	 * @param {Date}
	 *            value The maximum date that can be selected
	 */
	setMaxValue : function(dt) {
		this.maxValue = (typeof dt == "string" ? this.parseDate(dt) : dt);
		if (this.menu) {
			this.menu.picker.setMaxDate(this.maxValue);
		}
	},

	// private
	validateValue : function(value) {
		value = this.formatDate(value);
		if (!Ext.ux.MonthField.superclass.validateValue.call(this, value)) {
			return false;
		}
		if (value.length < 1) { // if it's blank and textfield didn't flag it
			// then it's valid
			return true;
		}
		var svalue = value;
		value = this.parseDate(value);
		if (!value) {
			this.markInvalid(String.format(this.invalidText, svalue, this.format));
			return false;
		}
		var time = value.getTime();
		if (this.minValue && time < this.minValue.getTime()) {
			this.markInvalid(String.format(this.minText, this.formatDate(this.minValue)));
			return false;
		}
		if (this.maxValue && time > this.maxValue.getTime()) {
			this.markInvalid(String.format(this.maxText, this.formatDate(this.maxValue)));
			return false;
		}
		if (this.disabledDays) {
			var day = value.getDay();
			for (var i = 0; i < this.disabledDays.length; i++) {
				if (day === this.disabledDays[i]) {
					this.markInvalid(this.disabledDaysText);
					return false;
				}
			}
		}
		var fvalue = this.formatDate(value);
		if (this.ddMatch && this.ddMatch.test(fvalue)) {
			this.markInvalid(String.format(this.disabledDatesText, fvalue));
			return false;
		}
		return true;
	},

	// private
	// Provides logic to override the default TriggerField.validateBlur which
	// just returns true
	validateBlur : function() {
		return !this.menu || !this.menu.isVisible();
	},

	/**
	 * Returns the current date value of the date field.
	 * 
	 * @return {Date} The date value
	 */
	getValue : function() {
		return this.value || this.parseDate(Ext.ux.MonthField.superclass.getValue.call(this)) || "";
	},

	/**
	 * Sets the value of the date field. You can pass a date object or any
	 * string that can be parsed into a valid date, using MonthField.format as
	 * the date format, according to the same rules as {@link Date#parseDate}
	 * (the default format used is "m/d/Y"). <br />
	 * Usage:
	 * 
	 * <pre><code>
	 * //All of these calls set the same date value (May 4, 2006)
	 * 
	 * //Pass a date object:
	 * var dt = new Date('5/4/2006');
	 * dateField.setValue(dt);
	 * 
	 * //Pass a date string (default format):
	 * dateField.setValue('05/04/2006');
	 * 
	 * //Pass a date string (custom format):
	 * dateField.format = 'Y-m-d';
	 * dateField.setValue('2006-05-04');
	 * </code></pre>
	 * 
	 * @param {String/Date}
	 *            date The date or valid date string
	 */
	setValue : function(date) {
		if(typeof date =='string'){
		   Ext.ux.MonthField.superclass.setValue.call(this, date);
		}else{
		   Ext.ux.MonthField.superclass.setValue.call(this, this.formatDate(this.parseDate(date)));
		   this.value=date;
		}
	},

	// private
	parseDate : function(value) {
		if (!value || Ext.isDate(value)) {
			return value;
		}
		var v = Date.parseDate(value, this.format);
		if (!v && this.altFormats) {
			if (!this.altFormatsArray) {
				this.altFormatsArray = this.altFormats.split("|");
			}
			for (var i = 0, len = this.altFormatsArray.length; i < len && !v; i++) {
				v = Date.parseDate(value, this.altFormatsArray[i]);
			}
		}
		return v;
	},
	onRender : function() {
		Ext.ux.MonthField.superclass.onRender.apply(this, arguments);
		// 添加左右trigger,支持直接左右选择月份
		if (this.showPrevNextTrigger) {
			//this.el.setStyle("margin-left","17px");
			this.trigger.applyStyles('position:static;vertical-align: middle;');
			this.prevTrigger = this.el.insertSibling({
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				style:'position:static;vertical-align: middle;',
				cls : "x-form-trigger x-datepickerplus-fieldprev"
			});
			this.prevTrigger.addClassOnOver('x-form-trigger-over');
			this.prevTrigger.addClassOnClick('x-form-trigger-click');
			this.prevTrigger.on('click', function() {
				var old = this.getValue(), nxt = new Date();
				if (Ext.isDate(old)) {
				} else {
					old = nxt;
				}
				var md = old.getDate(), mm = old.getMonth() - 1, my = old.getFullYear(), maxd = 0;
				if (mm == -1) {
					mm = 11;
					my--;
				} else {
					maxd = new Date(my, mm, 1).getDaysInMonth();
					if (md > maxd) {
						md = maxd;
					}
				}
				nxt = new Date(my, mm, md);
				this.setValue(nxt);
				this.fireEvent('select', this, nxt);
			}, this);

			this.nextTrigger = this.trigger.insertSibling({
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				style:'position:static;vertical-align: middle;',
				cls : "x-form-trigger x-datepickerplus-fieldnext"
			}, 'after');
			
			this.nextTrigger.addClassOnOver('x-form-trigger-over');
			this.nextTrigger.addClassOnClick('x-form-trigger-click');
			this.nextTrigger.on('click', function() {
				var old = this.getValue(), nxt = new Date();
				if (Ext.isDate(old)) {
				} else {
					old = nxt;
				}
				var md = old.getDate(), mm = old.getMonth() + 1, my = old.getFullYear(), maxd = 0;
				if (mm == 12) {
					mm = 0;
					my++;
				} else {
					maxd = new Date(my, mm, 1).getDaysInMonth();
					if (md > maxd) {
						md = maxd;
					}
				}
				nxt = new Date(my, mm, md);
				this.setValue(nxt);
				this.fireEvent('select', this, nxt);

			}, this);
		}
	},
	onResize : function(w, h) {
		Ext.form.TriggerField.superclass.onResize.call(this, w, h);
		var tw = this.trigger.getWidth();
		var allTriggerWidths = tw;
		if (this.showPrevNextTrigger) {
			allTriggerWidths += this.prevTrigger.getWidth() + this.nextTrigger.getWidth();
		}
		if (!isNaN(w)) {
			this.el.setWidth(w - allTriggerWidths);
		}		
	},
	// private
	onDestroy : function() {
		if (this.menu) {
			this.menu.destroy();
		}
		if (this.wrap) {
			this.wrap.remove();
		}
		Ext.ux.MonthField.superclass.onDestroy.call(this);
	},	
	// private
	formatDate : function(date) {
		return Ext.isDate(date) ? date.dateFormat(this.format) : date;
	},

	// private
	menuListeners : {
		select : function(m, d) {
			this.setValue(d);
			this.fireEvent('select', this, d);
		},
		show : function() { // retain focus styling
			this.onFocus();
		},
		hide : function() {
			this.focus.defer(10, this);
			var ml = this.menuListeners;
			this.menu.un("select", ml.select, this);
			this.menu.un("show", ml.show, this);
			this.menu.un("hide", ml.hide, this);
		}
	},

	/**
	 * @method onTriggerClick
	 * @hide
	 */
	// private
	// Implements the default empty TriggerField.onTriggerClick function to
	// display the MonthPicker
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (this.menu == null) {
			this.menu = new Ext.menu.MonthMenu();
		}
		Ext.apply(this.menu.picker, {
			minDate : this.minValue,
			maxDate : this.maxValue,
			disabledDatesRE : this.ddMatch,
			disabledDatesText : this.disabledDatesText,
			disabledDays : this.disabledDays,
			disabledDaysText : this.disabledDaysText,
			format : this.format,
			showToday : this.showToday,
			minText : String.format(this.minText, this.formatDate(this.minValue)),
			maxText : String.format(this.maxText, this.formatDate(this.maxValue))
		});
		this.menu.on(Ext.apply({}, this.menuListeners, {
			scope : this
		}));
		this.menu.picker.setValue(this.getValue() || new Date());
		this.menu.show(this.el, "tl-bl?");
		this.menu.picker.forceUpdate();
	},

	// private
	beforeBlur : function() {
		/*
		var v = this.parseDate(this.getRawValue());
		if (v) {
			this.setValue(v);
		}*/
	}
});
Ext.reg('monthfield', Ext.ux.MonthField);

Ext.ui.MonthField = Ext.ux.MonthField;Ext.ns("Ext.ui");

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
﻿/*
  * Ext.ux.DatePickerPlus  Addon
  * Ext.ux.form.DateFieldPlus  Addon  
  *
  * @author    Marco Wienkoop (wm003/lubber)
  * @copyright (c) 2008-2010, Marco Wienkoop (marco.wienkoop@lubber.de) http://www.lubber.de
  *
  * @class Ext.ux.DatePickerPlus
  * @extends Ext.DatePicker
  *
  * v.1.4.3
  *
  * @class Ext.ux.form.DateFieldPlus
  * @extends Ext.form.DateField
  *
  
  You need at least ExtJS 2.0.2 or higher 
  
Also adds Ext.util.EasterDate
	Calculates the Date-Object of easter-sunday of a given year

 Commercial License available! See http://www.lubber.de/extjs/datepickerplus for more info

* Donations are always welcome :)
* Any amount is greatly appreciated and will help to continue on developing ExtJS Widgets
*
* You can donate via PayPal to donate@lubber.de

-----------------------------------------------------------------------------------------------------
-- DatePickerPlus Extension based on 4 contributed extensions from the ext-forum
-- and of course the original Datepicker from the awesome ExtJS Javascript Library
-----------------------------------------------------------------------------------------------------
-- (1) Multimonth calendar extension (enhanced integration) 
-- (2) Datepicker extension for multiple day/week/month selection (basic idea adopted)
-- (3) Weeknumber display (enhanced integration)
-- (4) XDateField with configurable submitFormat (full integration)
-- using my own getFirstDateOfWeek routine as it is more flexible for choosing which day is the first day of a week (in some countries its sunday, not monday!)
-----------------------------------------------------------------------------------------------------
-- (2) (multimonth calendar)
-- Author: aungii
-- Source: http://extjs.com/forum/showthread.php?t=20597
--
-- (2)  (multiple day/week/month selection)
-- Author: cocorossello / stevenvegt
-- Source: http://extjs.com/forum/showthread.php?t=22473
--
-- (3) (weeknumber display)
-- Author: eni.kao
-- Source: http://extjs.com/forum/showthread.php?t=15635
--
-- (4) (XDateField with configurable submitFormat)
-- Author: jsakalos
-- Source: http://extjs.com/forum/showthread.php?t=25900



 * @license  licensing of Ext.ux.DatePickerPlus and Ext.ux.form.DateFieldPlus depends of the underlying ExtJS Framework Version
 *
 * If you use ExtJS <= 2.0.2 Ext.ux.DatePickerPlus and Ext.ux.form.DateFieldPlus are licensed under the terms of the
 * LGPL v3
 * License details: http://www.gnu.org/licenses/lgpl.html
 * 
 * If you use ExtJS >= 2.1 Ext.ux.DatePickerPlus and Ext.ux.form.DateFieldPlus are licensed under the terms of the
 * GPL v3
 * License details: http://www.gnu.org/licenses/gpl.html

*
	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
	
 * This Addon requires the ExtJS Library, which is distributed under the terms of the GPL v3 (since ExtJs V2.1)
 * See http://extjs.com/license for more info
 



  
Revision History:
v.1.4.3 [2011/03/18]
- BUGFIX: Config wasn't set when used in Editorgridpanel

v.1.4.2 [2011/02/23]
- checked to work with ExtJS 3.3.1
- added config: showPrevNextTrigger (DateFieldPlus only and not with multiselection) to display 2 buttons next to the DateFieldPlus
- added config: prevNextTriggerType (DateFieldPlus only not with multiselection): m means +/- month (valid End of month will be considered), any numeric value means amount of +/- days
- added Event "onPrevTriggerRelease", (DateFieldPlus only not with multiselection) which triggers when the PrevTrigger MouseUp Event occurs (if omitted the usual select-handler will be triggered)
- added Event "onNextTriggerRelease", (DateFieldPlus only not with multiselection) which triggers when the PrevTrigger MouseUp Event occurs (if omitted the usual select-handler will be triggered)
- BUGFIX: When specifying that weeknumbers should not be rendered and showing more than 1 row of months,the widths of daily columns in the 2nd and subsequent rows of months are too small. (reported by josefhaydn)
- BUGFIX: select event was triggered twice on Datefieldplus 
- BUGFIX: When using strictRangeSelection all clicked dates outside gaps were still selected even when not displayed (reported by gkarmadi)

v.1.4.1 [2010/11/09]
- checked to work with ExtJS 3.3.0
- Forced to update viewport on setValue
- BUGFIX: correctly position picker in datefield with hiddenfield on IE in some cases

v.1.4 [2010/04/30]
- checked to work with ExtJS 3.2.1
- BUGFIX: Datepickers with shown months > 1 had a white glitch obove them (thanks to radubrehar)
- BUGFIX: CSS Fixes for Datemenus and more than 1 row of months  when using IE8 in Compatibility Mode
- added romanian locale (thanks to radubrehar)
- added japanese locale (thanks to itheart)
- added polish locale (thanks to maboch)

v.1.4 RC1 [2010/03/04]
- checked to work with ExtJS 3.1.1
- BUGFIX: DateField Events did not work properly (reported by yuewah)
- BUGFIX: beforedestroy throws exception when parent control of datepickerplus gets destroyed (reported by yuewah)
- spanish locale corrected (holiday had a leading zero)

v.1.4 Beta 2 [2009/09/18]
- checked to work with ExtJS 3.0.0
- checked to work with ExtJS 2.3.0
- Adopted config item prevNextDaysView to DateFieldPlus
- Adopted events beforedateclick, beforeweekclick and beforemonthclick to DateFieldPlus
- more code optimization for Ext 3.0 compatibility
- support option "defaultvalue" on datefieldplus
- BUGFIX: setDisabled did not work under Ext 3.0 (reported by radtad)

v.1.4 Beta [2009/07/03]
- checked to work with ExtJS 3.0-RC3
- checked to work with ExtJS 2.2.1
- support of jsondates  (e.g. "2008-08-04T12:22:00") in setEventDates, setSelectedDates, setAllowedDates,setMindate and setMaxdate
- some Code optimizations
- corrected holidays in german locale
- added events beforedateclick, beforeweekclick and beforemonthclick
- added dutch locale (thanks to walldorff)
- added french locale (thanks to dubdub)
- added Norwegian bokmål locale (thanks to Alex Brasetvik)
- added spanish locale (thanks to erzsebet)
- added version config
- added config prevNextDaysView ("mark","nomark",false) to disable automatic selection/view of selected days of current months in previous and next month, so only the current months days are selectable (suggested by sirtimbly)
- BUGFIX: select-event on datefieldplus was added again each time the trigger has been clicked
- BUGFIX: Fix for updatehidden in case of multiselection (thanks to Hunyi)
- BUGFIX: do not handle dateselection when disabled-property is set

v.1.3 [2008/08/05]
- Support of ExtJS 2.2
- Adopted new config items from 1.2 to DateFieldPlus also

v.1.2 [2008/08/04]
- support "allowOtherMenus" Config for DateFieldPlus
- datefieldplus can be hidden by clicking the triggerbutton again in cases hiding by clicking outside isn't possible
- added config "styleDisabledDates" to be able to set custom style dates (eventdates/weekends..) on disabled dates also (suggested by descheret)
- added config "eventDatesSelectable" to disble event-dates selection if desired (even if the dates are not disabled at all) (thanks to descheret)
- added config "disableSingleDateSelection" to force user to use week- or monthselection only (suggested by chemist458)
- added config "stayInAllowedRange" when setting minDate/maxDate, this will prevent to change months outside the allowed daterange  (suggested by descheret)
- added config "summarizeHeader" to add an optional global header when using multimonth display containing the month range (e.g. january 2008-october 2008)
- added italian locale (thanks to andreabat)
- BUGFIX: setMinDate/MaxDate/DateLimits did not update the viewport properly

V1.1 Final [2008/06/12]
- added config "allowMouseWheel" to generally turn on/off Mousewheelsupport (suggested by boraldo)
- added event "beforemousewheel" to be able to temporary disable the mousewheel if desired
- added event "beforemaxdays" to be able to cancel the default MessageBox but do something on your own instead
- Implemented fix for xdatefield code to support applyTo Config (thanks to mystix)
- updated russian locale (thanks to WhiteRussian)
- BUGFIX: updating eventclasses (and others) could result in wrong class-definition per cell (reported by aacraig)


V1.1 RC4 [2008/05/20]
- DateFieldPlus now also supports multiselection (thanks to Nohcs777)
- extended xdatefield to support multiselection
- "value" config for datefieldplus now also supports arrays in multiselection mode instead of just one date
- range selection is now also possible for a wider period than only the visible months (suggested by jo2008)
- updated xdatefield code integration to disable/enable the hidden submitfield from datefieldplus also, if the mainformfield gets disabled/enabled
- improved xdatefield code to fill the hiddenField with a given value at config time
- Improved some code-sections (mainly for respecting summertime changings when handling with Date.gettime())
- Corrected eventhandling on Datemenu and DateFieldPlus
- support for minDate and maxDate for Datefieldplus (as an alias for datepickers minValue and maxValue) to be more compatible to usual datepicker/datemenu config options
- added "multiSelectionDelimiter" config (datefieldplus and multiselection only)
- added "renderPrevNextButtons" config (if you want the user not to be able to change the month or force him to use the monthpicker)
- added "renderPrevNextYearButtons" config to display 2 small double-arrow buttons for changing next/previous year 
- added "nextYearText" config which will be displayed as tooltip on NextYear Button (updated locale!)
- added "prevYearText" config which will be displayed as tooltip on PrevYear Button (updated locale!)
- added "showActiveDate" will display the active Date to use keynavigation
- added "shiftSpaceSelect" if set to true (default) and showactivedate is set to true you can select dates on keynavigation by using shift+Space (because the space-key alone will select the today-date)
	if this is set to false , this behaviour reverses (shift+space selects today, space alone select the date under the shown activedate from keynavigation)
- added "disableMonthPicker" config
- added "disabledLetter" config to display e.g. a "X" instead of the daynumber if a date is disabled. (default false)
- added event "beforeyearchange"
- added event "afteryearchange"
- added russian locale (thanks to WhiteRussian)
- UP/DOWN/LEFT/RIGHT Keynavigation is now only available if showActiveDate is set to true and works much faster
- CTRL+UP/DOWN for year changing is now only available if either disableMonthPicker is false or renderPrevNextYearButtons is true
- CTRL+LEFT/RIGHT for month changing is now only available if either disableMonthPicker is false or renderPrevNextButtons is true
- BUGFIX: setEventDates did not update the viewport (reported by aacraig)
- BUGFIX: Array-Cloning was done in a wrong way (reported by lpfLoveExt)
- BUGFIX: weekselection was wrong when a different startDay was given (reported by WhiteRussian)
- Minor Upgrade Version because of much added features instead of a bugfix-only release


V1.0 RC3 [2008/04/21]
- checked to work with ExtJS 2.1
- added config strictRangeSelect (suggested by sigaref)
- added config displayMask and displayMaskText to support update masking 
- added config defaultEventDatesText and defaultEventDatesCls. used if no text/cls-object is given in eventdates
- added Events "aftermonthchange" and "beforemonthchange" (fires everytime the first month changes (by monthpicker or prev/next-month buttons)
- added method setEventDates, to automatically transform given arrays/or objects to working functions, if not already specified
- BUGFIX: range selection over specific months was incorrect

V1.0 RC2 [2008/04/10]
- BUGFIX: typo in DateFieldPlus corrected (reported by sigaref)

V1.0 RC1 [2008/04/10]
- BUGFIX: Undo-Function works again
- BUGFIX: Config items allowedDates and allowedDatesText had no effect on DateFieldPlus

V0.9 Beta 9 [2008/04/09]
- Added config items allowedDates and allowedDatesText
- Added method setAllowedDates()

V0.9 Beta 8 [2008/04/09]
- BUGFIX: setSelectedDates had another BUG...(thanks to wehtam for reporting!)

V0.9 Beta 7 [2008/04/08]
- added the state of the afterdateclick to examine, if the date was selected or unselected, same with week/month
- added option to cleanSelectedDates to not update the picker (e.g. to immediatly add dates manually by setSelectedDates(that would call update twice)
- added option to setSelectedDates to clean the selectedDates before setting the new once and to not update the picker
- BUGFIX: setSelectedDates did not work properly

V0.9 Beta 6 [2008/04/08]
- Added method clearSelectedDates() (suggested by wehtam)
- Added method setSelectedDates() (suggested by wehtam)
- Changes eventtriggering for afterdateclick. It now will always be fired when a date is clicked . Regardless, whether multiSelection is enabled or not.
- BUGFIX: Given listeners to DateFieldPlus have been ignored (reported by Richie1985)

V0.9 Beta 5 [2008/04/07]
- Added method setDateLimits() to change minDate and maxDate at once at runtime
- BUGFIX: Range selection by using the SHIFT-Key for a range more than one month, did not select some remaining days at the end of the range (reported by Spirit)

V0.9 Beta 4 [2008/04/06]
- Added method setMinDate() to change the minDate at runtime and immediatly update the datepicker
- Added method setMaxDate() to change the maxDate at runtime and immediatly update the datepicker
- BUGFIX: hidden submitformat Field had same name as original field, thus confuses IE with duplicate id/name. if name has not been specified in the config or is same as id datefieldplus will add a suffix to the hiddenfield (default "-format"). this field holds the custom submitFormat value

V0.9 Beta 3 [2008/04/06]
- Added xtype "datefieldplus"
- BUGFIX: DateFieldPlus accidently had renderTodayButton set to false by default...

V0.9 Beta 2 [2008/04/06]
- BUGFIX: Width on DateMenu and DateFieldPlus was broken in Firefox 3 (tested on latest Beta 5) (reported by ludoo)
- BUGFIX: Some old testpath in generating transparent GIF images was left in the code and has been deleted now (reported by sanjshah)
- Added new config options
"disablePartialUnselect" : Boolean/String (default true) (suggested by DVSDevise)
When multiselecting whole months or weeks, already selected days within this week/month will _not_ get unselected anymore. Set this to false, if you want them to get unselected.
Note: When the _whole set_ of the month/week are already selected, they get _all_ unselected anyway.

"renderOkUndoButtons" : Boolean (default true) (suggested by jsakalos)
If set to false, the OK- and Undo-Buttons will not be rendered on Multiselection Calendars
This way any selected Date will be immediatly available in the "selectedDates" Array. If used together with DateMenu or DateFieldPlus you need to click outside the Calendar to make it disappear or press Return (if calendar got focus...)
Works only if multiSelection is set to true

"renderTodayButton" : Boolean (default true) (suggested by jsakalos)
Whether the Today-Button should be rendered


V0.9 Beta [2008/04/05]
Initial Release:
Joined the extensions together nicely and added even more features:
- fixed some bugs/improved the original extensions a bit
- works on Original DateMenu and DateField (Ext.ux.form.DateFieldPlus) also
- Definable Multimonths (rows,amount,fill..)
- Custom CSS for definable days
- Weeknumber Display
- Weekend CSS Styling
- National Holidays CSS Styling
- Quicktip support
- Function based custom displayed days
- Multiselection support by CTRL-Key to add single days (when clicked on a date)
- Multiselection support by CTRL-Key to add single weeks (when clicked on a weeknumber)
- Multiselection support by CTRL-Key to add single months (when clicked on the weeknumber header)
- Multiselection support by SHIFT-Key to add a range of days depending on the lastclicked day  (when clicked on a single date)
- returned the prev/next monthbuttons to the monthlabelrow
- implemented mousewheel-event again for comfortable increasing/decreasing months
- implemented monthpicker again to comfortably select the starting month. the monthpicker is rendered on the very first monthname so with only 1 month given, it acts just like the original datepicker
- added quick dayselection routine without calling update() every time. MUCH faster selection, especially when using huge multimonth calendars!
- added "OK"- and "Undo"-Buttons when multiSelection is set to true
- unneccessary renderupdate trigger eliminated (performance-leak on huge multimonthcalendars!) (setvalue-function changed, much more faster now)
- prevented opening a new browsertab in IE7/IE8 when CTRL multiselecting (occured in original multimonth calendar extension and datepicker also if clicked on an empty area within the cell) (default behaviour for a-tags, prevented this by CSS)
- extend keynavigation (RETURN=ok-Button, CTRL as usual)
- added Tooltip functionality to DateFieldPlus just like Buttons (tooltip show on triggerbutton only, this way invalidtext tooltips stay intact)


- Tested in FF2/3/3.5,IE6/7/8,Op9/10b,Saf3/4(Win),Chrome2/3

- Default Language is (of course) english (including US Holidays!)
- Current available localization files (including Holidays):
	german
	russian
	italian
	dutch
	french
	norwegian
	spanish
	romanian
	japanese
	polish	
	english (for your own translations)

Create a copy of ext.ux.datepickerplus-lang-en.js and change it to your language settings to get this widget easily translated
Be sure to include it AFTER the datepickerwidget!

--- See Release-Notes for Full API Documentation --- 

ROAD MAP:

v1.5 (~ Summer 2011)
- support stores for selectedDates, allowedDates, disabledDates and eventDates
- Check if given value for first renderered month stays within a given min/maxdate (suggested by bholyoak)
- add a config item to be able to hide specific dates just like disableddays but they are not even visible
- add a config item to be able to hide specific days (do not even display a column for that days)
- add an additional event when the Ok-button is clicked
- separate method to add/remove an eventdate or an array of eventdates without the need to supply the full set of eventdates
- same for disableddates/alloweddates/selecteddates (creating something like addAllowedDates/removeAllowedDates)
- support of multiple events at the same date
- support of month-gaps (e.g. display every 3rd Month only)
- support of descending month display on multimonths and navigation
- give eventdates tooltips more priority or merge them with the today/holidays tooltips (suggested by RuiDC)
- turned today button into cyclebutton to be able to also use "Begin of year" "next decade"...(idea from Peter seliger -> http://extjs.com/forum/showthread.php?t=61645)
- added "resizable" to support resizing of datepicker when displayed as datemenu or datefield and automatically create more/less months and adjust noOfMonth, noOfMonthPerRow
- support selection of all weekdays per month by clicking on the apropriate weekday shortcut column header
- support hovering a full week/month/days when moving the mouse over weekday/weeknumber/weeknumberheader
- support dateranges for eventdates

v1.6/2.0 (~ Fall 2011/Spring 2012)
- change monthselection to combobox selection of month and year as an option
- implement time selection also like http://extjs.com/forum/showthread.php?p=170472#post170472
- use the spinner plugin for above selections if available (or integrate it) or combobox instead (?)
- optional combobox as an alternative to the monthpicker with a given range of previous/next months to select from
- context menu to select predefined dates (12 months ago, next 3 thursdays, etc...thinking of integrating datejs for this ?)
- usage of window.createPopup for IE only to render more quickly (? based on http://extjs.com/forum/showthread.php?t=33331)
- create a new form.datelist item (select-box with multiselect and no dropdown) component to be able to display multiselected dates like datefield after selection
- add config to define the sorting of prevnext(year) buttons (currently the prevnextyear buttons are rendered inside as the usual prevnextmonth buttons are outside anytime)
- support drag selection of days/weeks/months (like in dataview example)
- extend property grid/create plugin to use datepickerplus aswell for date-fields in there
- show monthpicker only (requested in http://extjs.com/forum/showthread.php?t=13911)
- full support of editor grids
- support shiftclick without deleting all previous selected dates
- try to speed up rendering-performance, when clicking on next/previous month (update()) and on startup (onRender()) (IE and FF are much slower than Opera(which is equal slow, but renders immediatly every part of the calendar while IE/FF are rendering the complete calender at the end). Safari3.2(Win) and Chrome render very fast by now!
																																																																										

* ? BROWSER BUGS ? *
- FF2: CTRL-multiselect clicking leaves an odd blue frame on the cell when clicking in empty areas of the cell (the CSS-Trick for preventing new TABs in IE does not work here...yet :)


*/


Date.prototype.getFirstDateOfWeek = function(startDay) {
//set startDay to Sunday by default
	if (typeof startDay === "undefined") {
		startDay=(Ext.DatePicker?Ext.DatePicker.prototype.startDay:0);
	}
	var dayDiff = this.getDay()-startDay;
	if (dayDiff<0) {
		dayDiff+=7;
	}
	return this.add(Date.DAY,-dayDiff);
};

Array.prototype.sortDates = function() {
	return this.sort(function(a,b){
		return a.getTime() - b.getTime();		
	});
};


if (!Ext.util.EasterDate) {
	Ext.util.EasterDate = function(year, plusDays) {
		if (typeof year === "undefined") {
			year = new Date().getFullYear();
		}
		year = parseInt(year,10);
	
		if (typeof plusDays === "undefined") {
			plusDays = 0;
		}
		plusDays = parseInt(plusDays,10);
		
	//difference to first sunday after first fullmoon after beginning of spring
		var a = year % 19;
		var d = (19 * a + 24) % 30;
		var diffDay = d + (2 * (year % 4) + 4 * (year % 7) + 6 * d + 5) % 7;
		if ((diffDay == 35) || ((diffDay == 34) && (d == 28) && (a > 10))) {
			diffDay -= 7;
		}
	
		var EasterDate = new Date(year, 2, 22);	//beginning of spring
		EasterDate.setTime(EasterDate.getTime() + 86400000 * diffDay + 86400000 * plusDays);
		return EasterDate;
	};
}


Ext.namespace('Ext.ux','Ext.ux.form');

/**
 * @class Ext.ux.DatePickerPlus
 * @extends Ext.DatePicker
 * @constructor
  * @param {Object} config The config object
 */
Ext.ux.DatePickerPlus = Ext.extend(Ext.DatePicker, {
								   
	version: "1.4",
    /**
    * @cfg {Number} noOfMonth
    * No of Month to be displayed
	* Default to 1 so it will displayed as original Datepicker 
    */
    noOfMonth : 1,
	/**
    * @cfg {Array} noOfMonthPerRow
    * No. Of Month to be displayed in a row
    */    
    noOfMonthPerRow : 3,
    /**
    * @cfg {Array} fillupRows
    * eventually extends the number of months to view to fit the given row/column matrix and avoid odd white gaps (especially when using as datemenu fill will lookup ugly when set to false
    */    
	fillupRows : true,
    /**
    * @cfg {Function returns Array} eventDates
    * a Function which returns an Object List of Dates which have an event (show in separate given css-class)
	* This function is called everytime a year has changed when rendering the calendar
	* attributes are date, text(optional) and cls(optional)
	* Its implemented as a function to be able to create cycling days for year
	* example
	* eventDates: function(year) {
		var myDates = 
		[{
			date: new Date(2008,0,1), //fixed date marked only on 2008/01/01
			text: "New Year 2008",
			cls: "x-datepickerplus-eventdates"			
		},
		{
			date: new Date(year,4,11), //will be marked every year on 05/11
			text: "May 11th, Authors Birthday (Age:"+(year-1973)+")",
			cls: "x-datepickerplus-eventdates"
		}];
		return myDates;
	*
	*
    */    
    eventDates : function(year) {
		return [];
	},
	
	styleDisabledDates: false,
	eventDatesSelectable : true,

	defaultEventDatesText : '',
	defaultEventDatesCls : 'x-datepickerplus-eventdates',
	
	setEventDates : function(edArray,update) {
		if (typeof update === "undefined") {
			update=true;
		}
		this.edArray = [];
		var i=0,il=edArray.length;
		for (;i<il;++i) {
			if (Ext.isDate(edArray[i])) {
				this.edArray.push({
					date:edArray[i],
					text:this.defaultEventDatesText,
					cls:this.defaultEventDatesCls
				});
			}
			else if (edArray[i].date) {
				edArray[i].date = this.jsonDate(edArray[i].date);
				this.edArray.push(edArray[i]);				
			}
		}
		this.eventDates = function(year) {
			return this.edArray;
		};
		if (this.rendered && update) {
			this.eventDatesNumbered = this.convertCSSDatesToNumbers(this.eventDates(this.activeDate.getFullYear()));
			this.update(this.activeDate);
		}
	},
	/**
	 * @cfg {Boolean} eventDatesRE
	 * To selected specific Days over a regular expression
	 */
	eventDatesRE : false,
	
	/**
	 * @cfg {String} eventDatesRECls
	 * Specifies what CSS Class will be applied to the days found by "eventDatesRE"
	 */
	eventDatesRECls : '',
	
	/**
	 * @cfg {String} eventDatesRECls
	 * Specifies what Quicktip will be displayed to the days found by "eventDatesRE"
	 */
	eventDatesREText : '',	
	
	/**
	 * @cfg {Boolean} showWeekNumber
	 * Whether the week number should be shown
	 */
	showWeekNumber : true,
	/**
	 * @cfg {String} weekName
	 * The short name of the week number column
	 */
	weekName : "Wk.",
	/**
	 * @cfg {String} selectWeekText
	 * Text to display when hovering over the weekNumber and multiSelection is enabled
	 */
	selectWeekText : "Click to select all days of this week",
	/**
	 * @cfg {String} selectMonthText
	 * Text to display when hovering over the MonthNumber and multiSelection is enabled
	 * Whole Month selection is disabled when displaying only 1 Month (think twice..)	 
	 */
	selectMonthText : "Click to select all weeks of this month",

	/**
	 * @cfg {String} multiSelection
	 * whether multiselection of dates is allowed. selection of weeks depends on displaying of weeknumbers
	 */
	multiSelection : false,
	/**
	 * @cfg {String} multiSelectByCTRL
	 * whether multiselection is made by pressing CTRL (default behaviour, a single click without CTRL will set the selection list to the last selected day/week) or without (ever click a day is added/removed)
	 */
	
	multiSelectByCTRL : true,

/**
    * @cfg {Array of Dateobjects} selectedDates
    * List of Dates which have been selected when multiselection is set to true (this.value only sets the startmonth then)
    */    
    selectedDates : [],


/**
    * @cfg {String/Bool} prevNextDaysView
    * "mark" selected days will be marke in prev/next months also
	* "nomark" will not be marked and are not selectable
	* false: will hide them, thus are not selectable too
    */    
	prevNextDaysView: "mark",
	
	/**
    * @cfg {Array of Dateobjects} preSelectedDates
    * contains the same at selection runtime (until "OK" is pressed)
	*/
	preSelectedDates : [], 

	/**
    * @cfg {Object} lastSelectedDate
    * contains the last selected Date or false right after initializing the object..
    */    
	lastSelectedDate : false, 

	/**
	 * @cfg {Array} markNationalHolidays
	 * trigger to add existing nationalHolidays to the eventdates list (nationalholidays can be changed in locale files, so these are independant from custom event Dates
	 */
	markNationalHolidays :true,

	/**
	 * @cfg {String} nationalHolidaysCls
	 * CSS Class displayed to national Holidays if markNationalHolidays is set to true
	 */
	nationalHolidaysCls : 'x-datepickerplus-nationalholidays',
	
	/**
    * @cfg {Function} nationalHolidays
    * returns an Array-List of national Holiday Dates which could by marked with separate given CSS. Will be shown if markNationalHolidays is set to true
	* Change this in your local file to override it with you country's own national Holiday Dates
	*
	* if markNationalHolidays is set to true, a new instance of this array (and thus recalculation of holidays) will be generated at month update, if year has been changed from last drawn month.
	*
    */  

	nationalHolidays : function(year) {
		year = (typeof year === "undefined" ? (this.lastRenderedYear ? this.lastRenderedYear : new Date().getFullYear()) : parseInt(year,10));
//per default the US national holidays are calculated (according to http://en.wikipedia.org/wiki/Public_holidays_of_the_United_States) 
//override this function in your local file to calculate holidays for your own country
//but remember to include the locale file _AFTER_ datepickerplus !
		var dayOfJan01 = new Date(year,0,1).getDay();
		var dayOfFeb01 = new Date(year,1,1).getDay();
		var dayOfMay01 = new Date(year,4,1).getDay();
		var dayOfSep01 = new Date(year,8,1).getDay();
		var dayOfOct01 = new Date(year,9,1).getDay();
		var dayOfNov01 = new Date(year,10,1).getDay();		

		var holidays = 
		[{
			text: "New Year's Day",
			date: new Date(year,0,1)
		},
		{
			text: "Martin Luther King Day", //(every third monday in january)
			date: new Date(year,0,(dayOfJan01>1?16+7-dayOfJan01:16-dayOfJan01))
		},
		{
			text: "Washington's Birthday", //(every third monday in february)
			date: new Date(year,1,(dayOfFeb01>1?16+7-dayOfFeb01:16-dayOfFeb01))
		},
		{
			text: "Memorial Day",//(last Monday in May)
			date: new Date(year,4,(dayOfMay01==6?31:30-dayOfMay01))
		},
		{
			text: "Independence Day",
			date: new Date(year,6,4)
		},
		{
			text: "Labor Day",//(every first monday in September)
			date: new Date(year,8,(dayOfSep01>1?2+7-dayOfSep01:2-dayOfSep01))
		},
		{
			text: "Columbus Day",//(every second monday in october)
			date: new Date(year,9,(dayOfOct01>1?9+7-dayOfOct01:9-dayOfOct01))
		},
		{
			text: "Veterans Day",
			date: new Date(year,10,11)
		},
		{
			text: "Thanksgiving Day",//(Fourth Thursday in November)
			date: new Date(year,10,(dayOfNov01>4?26+7-dayOfNov01:26-dayOfNov01))
		},
		{
			text: "Christmas Day",
			date: new Date(year,11,25)
		}];
		
		return holidays;
	},
	
	/**
	 * @cfg {Boolean} markWeekends
	 * whether weekends should be displayed differently
	 */
	markWeekends :true,
	/**
	 * @cfg {String} weekendCls
	 * CSS class to use for styling Weekends
	 */
	weekendCls : 'x-datepickerplus-weekends',
	/**
	 * @cfg {String} weekendText
	 * Quicktip for Weekends
	 */
	weekendText :'',
	/**
	 * @cfg {Array} weekendDays
	 * Array of Days (according to Days from dateobject thus Sunday=0,Monday=1,...Saturday=6)
	 * Additionally to weekends, you could use this to display e.g. every Tuesday and Thursday with a separate CSS class
	 */
	weekendDays: [6,0],
	
	/**
	 * @cfg {Boolean} useQuickTips
	 * Wheter TIps should be displayed as Ext.quicktips or browsercontrolled title-attributes
	 */
	useQuickTips : true,
	
	/**
	 * @cfg {Number} pageKeyWarp
	 * Amount of Months the picker will move forward/backward when pressing the pageUp/pageDown Keys
	 */
	pageKeyWarp : 1,

	/**
	 * @cfg {Number} maxSelectionDays
	 * Amount of Days that are selectable, set to false for unlimited selection
	 */
	maxSelectionDays : false,
	
	maxSelectionDaysTitle : 'Datepicker',
	maxSelectionDaysText : 'You can only select a maximum amount of %0 days',
	undoText : "Undo",
	
	
	/**
	 * @cfg {Boolean} stayInAllowedRange
	 * used then mindate/maxdate is set to prevent changing to a month that does not contain allowed dates
	 */
	stayInAllowedRange: true,

	/**
	 * @cfg {Boolean} summarizeHeader
	 * displays the from/to daterange on top of the datepicker
	 */
	summarizeHeader:false,
	
	/**
	 * @cfg {Boolean} resizable
	 * Whether the calendar can be extended with more/less months by simply resizing it like window
	 */
	resizable: false,
	
	/**
	 * @cfg {Boolean} renderOkUndoButtons
	 * If set to true, the OK- and Undo-Buttons will not be rendered on Multiselection Calendars
	 */
	renderOkUndoButtons : true,

	/**
	 * @cfg {Boolean} renderTodayButton
	 * Whether the Today Button should be rendered
	 */
	renderTodayButton : true,
	/**
	 * @cfg {Boolean} disablePartialUnselect
	 * When multiselecting whole months or weeks, already selected days within this week/month will _not_ get unselected anymore. Set this to false, if you want them to get unselected.
	 * Note: When the _whole set_ of the month/week are already selected, they get _all_ unselected anyway.
	 */
	disablePartialUnselect: true,
	
	allowedDates : false,
	allowedDatesText : '',

	strictRangeSelect : false,

	/**
	 * @cfg {Boolean/Number} displayMask
	 * As huge multimonth calendars can take some updating time this will display a mask when the noOfMonth property is higher than the given value in displayMask.
	 * Set to false to never display the mask
	 * default is 3
	 */
	displayMask:3,
	
	displayMaskText: 'Please wait...',
	
	renderPrevNextButtons: true,
	renderPrevNextYearButtons: false,
	disableMonthPicker:false,
	
	nextYearText: "Next Year (Control+Up)",
	prevYearText: "Previous Year (Control+Down)",
	
	showActiveDate: false,
	shiftSpaceSelect: true,
	disabledLetter: false,
	
	allowMouseWheel: true,
	
//this is accidently called too often in the original (when hovering over monthlabel or bottombar..there is no need to update the cells again and just leaks performance)
	focus: Ext.emptyFn,
	
	initComponent : function(){
		Ext.ux.DatePickerPlus.superclass.initComponent.call(this);
		this.noOfMonthPerRow = this.noOfMonthPerRow > this.noOfMonth ?this.noOfMonth : this.noOfMonthPerRow;
        this.addEvents(
            /**
             * @event beforeyearchange
             * Fires before a new year is selected (or prevYear/nextYear buttons)
             * @param {DatePicker} this
             * @param {oldyearnumber} dates The previous selected year
             * @param {newyearnumber} dates The new selected year
             */
            'beforeyearchange',
            /**
             * @event afteryearchange
             * Fires before a new year is selected (by prevYear/nextYear buttons)
             * @param {DatePicker} this
             * @param {oldyearnumber} dates The previous selected year		 
             * @param {newyearnumber} dates The new selected year
             */
            'afteryearchange',
            /**
             * @event beforemonthchange
             * Fires before a new startmonth is selected (by monthpicker or prev/next buttons)
             * @param {DatePicker} this
             * @param {oldmonthnumber} dates The previous selected month	 
             * @param {newmonthnumber} dates The new selected month
             */
            'beforemonthchange',
            /**
             * @event aftermonthchange
             * Fires before a new startmonth is selected (by monthpicker or prev/next buttons)
             * @param {DatePicker} this
             * @param {oldmonthnumber} dates The previous selected month			 
             * @param {newmonthnumber} dates The new selected month
             */
            'aftermonthchange',
            /**
             * @event beforemonthclick
             * Fires before a full month is (un)selected
             * @param {DatePicker} this
             * @param {monthnumber} dates The selected month
             */
            'beforemonthclick',
            /**
             * @event beforeweekclick
             * Fires before a week is (un)selected
             * @param {DatePicker} this
             * @param {dateobject} dates The first date of selected week
             */
            'beforeweekclick',
            /**
             * @event beforeweekclick
             * Fires before a single day is (un)selected
             * @param {DatePicker} this
             * @param {dateobject} dates The selected date
             */
            'beforedateclick',
            /**
             * @event aftermonthclick
             * Fires after a full month is (un)selected
             * @param {DatePicker} this
             * @param {monthnumber} dates The selected month
             */
            'aftermonthclick',
            /**
             * @event afterweekclick
             * Fires after a week is (un)selected
             * @param {DatePicker} this
             * @param {dateobject} dates The first date of selected week
             */
            'afterweekclick',
            /**
             * @event afterweekclick
             * Fires after a single day is (un)selected
             * @param {DatePicker} this
             * @param {dateobject} dates The selected date
             */
            'afterdateclick',
            /**
             * @event undo
             * Fires when Undo Button is clicked on multiselection right before deleting the preselected dates
             * @param {DatePicker} this
             * @param {Array} dates The preselected Dates
             */
            'undo',
            /**
             * @event beforemousewheel
             * Fires before a mousewheel event should be triggered return false in your function to disable the month change
             * @param {DatePicker} this
             * @param {object} event object
             */
			'beforemousewheel',
            /**
             * @event beforemousewheel
             * Fires before the default message box appears when max days have been reached
			 * return false to cancel the messagebox (to do something on your own)
             * @param {DatePicker} this
             * @param {object} event object
             */
			'beforemaxdays');
	},  
	
	activeDateKeyNav: function(direction) {
		if (this.showActiveDate) {
			this.activeDate = this.activeDate.add("d", direction);
			var adCell = this.activeDateCell.split("#");
			var tmpMonthCell = parseInt(adCell[0],10);
			var tmpDayCell = parseInt(adCell[1],10);
			var currentGetCell = Ext.get(this.cellsArray[tmpMonthCell].elements[tmpDayCell]);
//cursor gets out of visible range?
			if (	(tmpDayCell+direction>41 && tmpMonthCell+1>=this.cellsArray.length)	||
					(tmpDayCell+direction<0 && tmpMonthCell-1<0)	){
				this.update(this.activeDate);
			}
			else {
				currentGetCell.removeClass("x-datepickerplus-activedate");
				tmpDayCell+=direction;
				if (tmpDayCell>41) {
					tmpDayCell-=42;
					tmpMonthCell++;
				}
				else if (tmpDayCell<0) {
					tmpDayCell+=42;
					tmpMonthCell--;
				}
				currentGetCell = Ext.get(this.cellsArray[tmpMonthCell].elements[tmpDayCell]);
				currentGetCell.addClass("x-datepickerplus-activedate");
				this.activeDateCell = tmpMonthCell+"#"+tmpDayCell;
			}
		}
	},

    handleMouseWheel : function(e){
        if(this.fireEvent("beforemousewheel", this,e) !== false){
			var oldStartMonth = (this.activeDate ? this.activeDate.getMonth() : 99);
			var oldStartYear = (this.activeDate ? this.activeDate.getFullYear() : 0);			
			Ext.ux.DatePickerPlus.superclass.handleMouseWheel.call(this,e);
			var newStartMonth = (this.activeDate ? this.activeDate.getMonth() : 999);
			var newStartYear = (this.activeDate ? this.activeDate.getFullYear() : 9999);
			if (oldStartMonth!=newStartMonth) {
				this.fireEvent("aftermonthchange", this, oldStartMonth, newStartMonth);
			}
			if (oldStartYear!=newStartYear) {
				this.fireEvent("afteryearchange", this, oldStartYear, newStartYear);
			}
		}
	},
	

    doDisabled: function(disabled){
        this.keyNav.setDisabled(disabled);
		if (this.renderPrevNextButtons) {
			this.leftClickRpt.setDisabled(disabled);
			this.rightClickRpt.setDisabled(disabled);
		}
		if (this.renderPrevNextYearButtons) {
			this.leftYearClickRpt.setDisabled(disabled);
			this.rightYearClickRpt.setDisabled(disabled);
		}
        if(this.todayBtn){
            this.todayKeyListener.setDisabled(disabled);
            this.todayBtn.setDisabled(disabled);
        }
    },

// private
	onRender : function(container, position){
		if (this.noOfMonthPerRow===0) {
			this.noOfMonthPerRow = 1;
		}
		if (this.fillupRows && this.noOfMonthPerRow > 1 && this.noOfMonth % this.noOfMonthPerRow!==0) {
			this.noOfMonth+= (this.noOfMonthPerRow - (this.noOfMonth % this.noOfMonthPerRow));
		}
		var addIEClass = (Ext.isIE?' x-datepickerplus-ie':'');
		var m = ['<table cellspacing="0"',(this.multiSelection?' class="x-date-multiselect'+addIEClass+'" ':(addIEClass!==''?'class="'+addIEClass+'" ':'')),'>'];

		m.push("<tr>");

		var widfaker = (Ext.isIE?'<img src="'+Ext.BLANK_IMAGE_URL+'" />':'');
		var weekNumberQuickTip = (this.multiSelection ? (this.useQuickTips? ' ext:qtip="'+this.selectWeekText+'" ' :' title="'+this.selectWeekText+'" ') : '');
//as weekends (or defined weekly cycles) are displayed on every month at the same place, we can render the quicktips here to save time in update process
		var weekEndQuickTip = (this.markWeekends && this.weekendText!==''? (this.useQuickTips? ' ext:qtip="'+this.weekendText+'" ' :' title="'+this.weekendText+'" '):'');


//calculate the HTML of one month at first to gain some speed when rendering many calendars
		var mpre = ['<thead><tr>'];
		if (this.showWeekNumber) {
			mpre.push('<th class="x-date-weeknumber-header"><a href="#" hidefocus="on" class="x-date-weeknumber" tabIndex="1"><em><span ',(this.multiSelection ? (this.useQuickTips? ' ext:qtip="'+this.selectMonthText+'" ' :' title="'+this.selectMonthText+'" ') : ''),'>' + this.weekName + '</span></em></a></th>');
		}
		
		var dn = this.dayNames, i=0, d, k = 0, x=0, xk=this.noOfMonth;
		for(; i < 7; ++i){
		   d = this.startDay+i;
			if(d > 6){
				d = d-7;
			}
			mpre.push('<th><span>', dn[d].substr(0,1), '</span></th>');
		}
		mpre.push('</tr></thead><tbody><tr>');

		if (this.showWeekNumber) {
			mpre.push('<td class="x-date-weeknumber-cell"><a href="#" hidefocus="on" class="x-date-weeknumber" tabIndex="1"><em><span ',weekNumberQuickTip,'></span></em></a></td>');
		}
		
		for(; k < 42; ++k) {
			if(k % 7 === 0 && k > 0){
				if (this.showWeekNumber) {
					mpre.push('</tr><tr><td class="x-date-weeknumber-cell"><a href="#" hidefocus="on" class="x-date-weeknumber" tabIndex="1"><em><span ',weekNumberQuickTip,'></span></em></a></td>');
				} else {
					mpre.push('</tr><tr>');
				}
			}
			mpre.push('<td class="x-date-date-cell"><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span ',(this.weekendDays.indexOf((k+this.startDay)%7)!=-1?weekEndQuickTip:''),'></span></em></a></td>');
		}
		mpre.push('</tr></tbody></table></td></tr></table></td>');
		var prerenderedMonth = mpre.join("");

		if (this.summarizeHeader && this.noOfMonth > 1) {
			m.push('<td align="center" id="',this.id,'-summarize" colspan="',this.noOfMonthPerRow,'" class="x-date-middle x-date-pickerplus-middle"></td></tr>');
			m.push("<tr>");
		}

		for(; x<xk; ++x) {            
            m.push('<td><table class="x-date-pickerplus',(x%this.noOfMonthPerRow===0?'':' x-date-monthtable'),(!this.prevNextDaysView?" x-date-pickerplus-prevnexthide":""),'" cellspacing="0"><tr>');
			if (x===0) {				
				m.push('<td class="x-date-left">');
				if (this.renderPrevNextButtons) {
					m.push('<a class="npm" href="#" ',(this.useQuickTips? ' ext:qtip="'+this.prevText+'" ' :' title="'+this.prevText+'" '),'></a>');
				}
				if (this.renderPrevNextYearButtons) {
					m.push('<a class="npy" href="#" ',(this.useQuickTips? ' ext:qtip="'+this.prevYearText+'" ' :' title="'+this.prevYearText+'" '),'></a>');
				}
				m.push('</td>');
			}			
			else {
				m.push('<td class="x-date-dummy x-date-middle">',widfaker,'</td>');
			}
            m.push("<td class='x-date-middle x-date-pickerplus-middle",(x===0 && !this.disableMonthPicker ?" x-date-firstMonth":""),"' align='center'>");
			if (x>0 || this.disableMonthPicker) {
				m.push('<span id="',this.id,'-monthLabel', x , '"></span>');
			}
			m.push('</td>');
			if (x==this.noOfMonthPerRow-1)	{
				m.push('<td class="x-date-right">');
				if (this.renderPrevNextButtons) {				
					m.push('<a class="npm" href="#" ', (this.useQuickTips? ' ext:qtip="'+this.nextText+'" ' :' title="'+this.nextText+'" ') ,'></a>');
				}
				if (this.renderPrevNextYearButtons) {
					m.push('<a class="npy" href="#" ',(this.useQuickTips? ' ext:qtip="'+this.nextYearText+'" ' :' title="'+this.nextYearText+'" '),'></a>');
				}
				m.push('</td>');				
			}
			else  {
				m.push('<td class="x-date-dummy x-date-middle">',widfaker,'</td>');
			}			
			
            m.push('</tr><tr><td colspan="3"><table class="x-date-inner" id="',this.id,'-inner-date', x ,'" cellspacing="0">');

			m.push(prerenderedMonth);
	
            if( (x+1) % this.noOfMonthPerRow === 0) {
                m.push("</tr><tr>");
            }            
        }
        m.push('</tr>');
		
		m.push('<tr><td',(this.noOfMonthPerRow>1?' colspan="'+this.noOfMonthPerRow+'"':''),' class="x-date-bottom" align="center"><div><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="right" class="x-date-multiokbtn">',widfaker,'</td><td align="center" class="x-date-todaybtn">',widfaker,'</td><td align="left" class="x-date-multiundobtn">',widfaker,'</td></tr></table></div></td></tr>');
		
		m.push('</table><div class="x-date-mp"></div>');
        var el = document.createElement("div");
        el.className = "x-date-picker";
        el.innerHTML = m.join("");  

        container.dom.insertBefore(el, position);

        this.el = Ext.get(el);        
        this.eventEl = Ext.get(el.firstChild);

		if (this.renderPrevNextButtons) {
			this.leftClickRpt = new Ext.util.ClickRepeater(this.el.child("td.x-date-left a.npm"), {
				handler: this.showPrevMonth,
				scope: this,
				preventDefault:true,
				stopDefault:true
			});
	
			this.rightClickRpt = new Ext.util.ClickRepeater(this.el.child("td.x-date-right a.npm"), {
				handler: this.showNextMonth,
				scope: this,
				preventDefault:true,
				stopDefault:true
			});
		}
		
		if (this.renderPrevNextYearButtons) {
			this.leftYearClickRpt = new Ext.util.ClickRepeater(this.el.child("td.x-date-left a.npy"), {
				handler: this.showPrevYear,
				scope: this,
				preventDefault:true,
				stopDefault:true
			});
	
			this.rightYearClickRpt = new Ext.util.ClickRepeater(this.el.child("td.x-date-right a.npy"), {
				handler: this.showNextYear,
				scope: this,
				preventDefault:true,
				stopDefault:true
			});
		}
		if (this.allowMouseWheel) {
			this.eventEl.on("mousewheel", this.handleMouseWheel,  this);
		}


        this.keyNav = new Ext.KeyNav(this.eventEl, {
            "left" : function(e){
                (!this.disabled && e.ctrlKey && (!this.disableMonthPicker || this.renderPrevNextButtons) ?
                    this.showPrevMonth() :
					this.activeDateKeyNav(-1));
            },

            "right" : function(e){
                (!this.disabled && e.ctrlKey && (!this.disableMonthPicker || this.renderPrevNextButtons) ?
                    this.showNextMonth() :
					this.activeDateKeyNav(1));
            },

            "up" : function(e){
                (!this.disabled && e.ctrlKey && (!this.disableMonthPicker || this.renderPrevNextYearButtons) ?
                    this.showNextYear() :
					this.activeDateKeyNav(-7));
            },

            "down" : function(e){
                (!this.disabled && e.ctrlKey && (!this.disableMonthPicker || this.renderPrevNextYearButtons) ?
                    this.showPrevYear() :
					this.activeDateKeyNav(7));
            },

            "pageUp" : function(e){
				if (!this.disabled) {
			        this.update(this.activeDate.add("mo", this.pageKeyWarp*(-1)));
				}
            },

            "pageDown" : function(e){
				if (!this.disabled) {				
			        this.update(this.activeDate.add("mo", this.pageKeyWarp));
				}
            },

            "enter" : function(e){
                e.stopPropagation();
				if (!this.disabled) {				
					if (this.multiSelection) {
						this.okClicked();
					}
					else {
						this.finishDateSelection(this.activeDate);
					}
				}
                return true;
            }, 
            scope : this 
        });

		if (!this.disableSingleDateSelection) {
			this.eventEl.on("click", this.handleDateClick,  this, {delegate: "a.x-date-date"});
		}
		if (this.multiSelection && this.showWeekNumber) {
			this.eventEl.on("click", this.handleWeekClick,  this, {delegate: "a.x-date-weeknumber"});
		}
        
        this.cellsArray = [];
        this.textNodesArray = [];
        this.weekNumberCellsArray = [];
        this.weekNumberTextElsArray = [];		
		this.weekNumberHeaderCellsArray = [];
	
		var cells,textNodes,weekNumberCells,weekNumberTextEls,weekNumberHeaderCells, xx=0, xxk=this.noOfMonth;
        for(; xx< xxk; ++xx) {
            cells = Ext.get(this.id+'-inner-date'+xx).select("tbody td.x-date-date-cell");
            textNodes = Ext.get(this.id+'-inner-date'+xx).query("tbody td.x-date-date-cell span");
            this.cellsArray[xx] = cells;
            this.textNodesArray[xx] = textNodes;
			if (this.showWeekNumber) {
				weekNumberCells = Ext.get(this.id+'-inner-date'+xx).select("tbody td.x-date-weeknumber-cell");
				weekNumberTextEls = Ext.get(this.id+'-inner-date'+xx).select("tbody td.x-date-weeknumber-cell span");				
				this.weekNumberCellsArray[xx] = weekNumberCells;
				this.weekNumberTextElsArray[xx] = weekNumberTextEls;				
				weekNumberHeaderCells = Ext.get(this.id+'-inner-date'+xx).select("th.x-date-weeknumber-header");
				this.weekNumberHeaderCellsArray[xx] = weekNumberHeaderCells;
			}
        }

//set the original monthpicker again to the first month only to be able to quickly change the startmonth		
		if (!this.disableMonthPicker) {
	        this.monthPicker = this.el.down('div.x-date-mp');
	        this.monthPicker.enableDisplayMode('block');
			
			this.mbtn = new Ext.Button({
				text: "&#160;",
				tooltip: this.monthYearText,
				renderTo: this.el.child("td.x-date-firstMonth", true)			
			});
	
			this.mbtn.on('click', this.showMonthPickerPlus, this);
	        this.mbtn.el.child('em').addClass('x-btn-arrow');						
//			this.mbtn.el.child(this.mbtn.menuClassTarget).addClass("x-btn-with-menu");
		}

//showtoday from Ext 2.2
		if (this.renderTodayButton || this.showToday) {
	        this.todayKeyListener = this.eventEl.addKeyListener(Ext.EventObject.SPACE, this.spaceKeyPressed,  this);					
	        var today = new Date().dateFormat(this.format);			
			this.todayBtn = new Ext.Button({
				renderTo: this.el.child("td.x-date-bottom .x-date-todaybtn", true),
                text: String.format(this.todayText, today),
				tooltip: String.format(this.todayTip, today),
				handler: this.selectToday,
				scope: this
			});
		}
		
		if (this.multiSelection && this.renderOkUndoButtons) {
			this.OKBtn = new Ext.Button({
	            renderTo: this.el.child("td.x-date-bottom .x-date-multiokbtn", true),
				text: this.okText,
				handler: this.okClicked,
				scope: this
			});

			this.undoBtn = new Ext.Button({
	            renderTo: this.el.child("td.x-date-bottom .x-date-multiundobtn", true),
				text: this.undoText,
				handler: function() {
					if (!this.disabled) {
						this.fireEvent("undo", this, this.preSelectedDates);
						this.preSelectedDates = [];
						var i=0,il=this.selectedDates.length;
						for (;i<il;++i) {
							this.preSelectedDates.push(this.selectedDates[i].clearTime().getTime());
						}
						this.update(this.activeDate);
					}
				},
				scope: this
			});
		}
		
//In development...
/*
		if (this.resizable) {		
			var resizer = new Ext.Resizable(this.el, {
				handles: 'all',
// at least one month should be displayed				
				minWidth:200,
				minHeight:300,
				maxWidth: 1000,
				maxHeight: 800,
				heightIncrement: 250,
				widthIncrement: 200,
				adjustments: 'auto',	
				transparent:true
			});
			resizer.on("resize", function(){
	//			alert("you resized the calendar,ouch!");
			},this);
		}
*/

		if(Ext.isIE){
            this.el.repaint();
        }
//preselect dates if given
		this.preSelectedDates = [];
		var sdc=0, sdcl=this.selectedDates.length;
		for(; sdc < sdcl; ++sdc) {
		   this.preSelectedDates.push(this.selectedDates[sdc].clearTime().getTime());
		}

        this.update(this.value);
    },
	
	showMonthPickerPlus: function() {
		if (!this.disabled) {
			this.showMonthPicker();
		}
	},

//converts all custom dates to timestamps numbers for faster calculations and splits their attributes into separate arrays
	convertCSSDatesToNumbers : function(objarr) {
//date,text,class		
		var converted =  [[],[],[]], i=0, il=objarr.length;
		for (;i<il;++i) {
			converted[0][i] = objarr[i].date.clearTime().getTime();
			converted[1][i] = (objarr[i].text ? objarr[i].text : this.defaultEventDatesText);
			converted[2][i] = (objarr[i].cls ? objarr[i].cls : this.defaultEventDatesCls);
		}
		return converted;
	},

	clearSelectedDates : function(update) {
		if (typeof update === "undefined") {
			update=true;
		}
		this.selectedDates = [];
		this.preSelectedDates = [];
		if (this.rendered && update) {
			this.update(this.activeDate);
		}
	},
	
//support json dates
	jsonDate: function(dates) {
		if (!Ext.isArray(dates)) {
			if (typeof dates === "string") {
				return Date.parseDate(dates.replace(/T/," "),'Y-m-d H:i:s');
			}
		}
		else {
			var i=0,il=dates.length;
			for (;i<il;i++) {
				if (typeof dates[i] === "string") {
					dates[i] = Date.parseDate(dates[i].replace(/T/," "),'Y-m-d H:i:s');
				}
			}
		}
		return dates;
	},
	
	setSelectedDates : function(dates,update) {
		if (typeof update === "undefined") {
			update=true;
		}
		dates = this.jsonDate(dates);
		if (!Ext.isArray(dates)) {
			dates = [dates];
		}
		var d, dt, i=0,il=dates.length;
		for (;i<il;++i) {
			d = dates[i];
			dt = d.clearTime().getTime();
			if (this.preSelectedDates.indexOf(dt)==-1) {
				this.preSelectedDates.push(dt);
				this.selectedDates.push(d);				
			}
		}
		if (this.rendered && update) {
			this.update(this.activeDate);
		}
	},

	setAllowedDates : function(dates,update) {
		if (typeof update === "undefined") {
			update=true;
		}
		this.allowedDates = this.jsonDate(dates);
		if (this.rendered && update) {
			this.update(this.activeDate);
		}
	},

	setMinDate: function(minDate) {
		this.minDate = this.jsonDate(minDate);
        this.update(this.value, true);
	},

	setMaxDate: function(maxDate) {
		this.maxDate = this.jsonDate(maxDate);
        this.update(this.value, true);
	},

	setDateLimits: function(minDate,maxDate) {
		this.minDate = this.jsonDate(minDate);
		this.maxDate = this.jsonDate(maxDate);
        this.update(this.value, true);
	},

	
	// private
//forcerefresh option from ext 2.2 just included to be compatible	
    update : function(date, forceRefresh ,masked){
		if (typeof masked==="undefined")  {
			masked = false;
		}
		if (typeof forceRefresh==="undefined")  {
			forceRefresh = false;
		}
		
		if (forceRefresh) {
			var ad = this.activeDate;
			this.activeDate = null;
			date = ad;			
		}				
		
		var dMask = (this.displayMask && (isNaN(this.displayMask) || this.noOfMonth > this.displayMask)? true: false);
		
		if (!masked && dMask) {
			this.el.mask(this.displayMaskText);
//set forcerefresh to false because new date (from old activedate) is already calculated
			this.update.defer(10, this, [date,false,true]);
			return false;
		}
		
		if (this.stayInAllowedRange && (this.minDate||this.maxDate)) {
			if (this.minDate && (this.minDate.getFullYear() > date.getFullYear() || (this.minDate.getMonth() > date.getMonth() && this.minDate.getFullYear() == date.getFullYear()))) {
				date = new Date(this.minDate.getTime());
			}
			else if (this.maxDate && (this.maxDate.getFullYear() < date.getFullYear() || (this.maxDate.getMonth() < date.getMonth() && this.maxDate.getFullYear() == date.getFullYear()))) {
				date = new Date(this.maxDate.getTime());
			}
		}
		
		var newStartMonth = date.getMonth();
		var oldStartMonth = (this.activeDate ? this.activeDate.getMonth() : newStartMonth);
		var newStartYear = date.getFullYear();
		var oldStartYear = (this.activeDate ? this.activeDate.getFullYear() : newStartYear);
		
		if (oldStartMonth!=newStartMonth) {
            this.fireEvent("beforemonthchange", this, oldStartMonth, newStartMonth);			
		}
		if (oldStartYear!=newStartYear) {
            this.fireEvent("beforeyearchange", this, oldStartYear, newStartYear);
		}
		
        this.activeDate = date.clearTime();
		this.preSelectedCells = [];
		this.lastSelectedDateCell = '';
		this.activeDateCell = '';
		var lsd = (this.lastSelectedDate?this.lastSelectedDate:0);
		var today = new Date().clearTime().getTime();
		var min = this.minDate ? this.minDate.clearTime().getTime() : Number.NEGATIVE_INFINITY;
		var max = this.maxDate ? this.maxDate.clearTime().getTime() : Number.POSITIVE_INFINITY;
		var ddMatch = this.disabledDatesRE;
		var ddText = this.disabledDatesText;
		var ddays = this.disabledDays ? this.disabledDays.join("") : false;
		var ddaysText = this.disabledDaysText;
		
		var edMatch = this.eventDatesRE;
		var edCls = this.eventDatesRECls;
		var edText = this.eventDatesREText;		

		var adText = this.allowedDatesText;
		
		var format = this.format;
		var adt = this.activeDate.getTime();
		
		this.todayMonthCell	= false;
		this.todayDayCell = false;
		if (this.allowedDates) {
			this.allowedDatesT = [];
			var k=0, kl=this.allowedDates.length;
			for (;k<kl;++k) {
				this.allowedDatesT.push(this.allowedDates[k].clearTime().getTime());
			}
		}
		var setCellClass = function(cal, cell,textnode,d){
	
			var foundday, eCell = Ext.get(cell), eTextNode = Ext.get(textnode), t = d.getTime(), tiptext=false, fvalue;
			cell.title = "";
			cell.firstChild.dateValue = t;

//check this per day, so holidays between years in the same week will be recognized (newyear in most cases),
//yearly eventdates are also possible then
			var dfY = d.getFullYear();
			if (cal.lastRenderedYear!==dfY) {
				cal.lastRenderedYear=dfY;
				if(cal.markNationalHolidays) {
//calculate new holiday list for current year
					cal.nationalHolidaysNumbered = cal.convertCSSDatesToNumbers(cal.nationalHolidays(dfY));
				}
				cal.eventDatesNumbered = cal.convertCSSDatesToNumbers(cal.eventDates(dfY));
			}
			
			// disabling
			if(t < min) {
				cell.className = " x-date-disabled";
				tiptext = cal.minText;				
			}
			if(t > max) {
				cell.className = " x-date-disabled";
				tiptext = cal.maxText;
			}
			if(ddays){
				if(ddays.indexOf(d.getDay()) != -1){
					tiptext = ddaysText;
					cell.className = " x-date-disabled";
				}
			}
			if(ddMatch && format){
				fvalue = d.dateFormat(format);
				if(ddMatch.test(fvalue)){
					tiptext = ddText.replace("%0", fvalue);					
					cell.className = " x-date-disabled";
				}
			}

			if (cal.allowedDates && cal.allowedDatesT.indexOf(t)==-1){
				cell.className = " x-date-disabled";
				tiptext = adText;
			}

			//mark weekends
			if(cal.markWeekends && cal.weekendDays.indexOf(d.getDay()) != -1 && !eCell.hasClass('x-date-disabled')) {
				eCell.addClass(cal.weekendCls);
			}
			

			if(!eCell.hasClass('x-date-disabled') || cal.styleDisabledDates) {
//mark dates with specific css (still selectable) (higher priority than weekends)
				if (cal.eventDatesNumbered[0].length>0) {
					foundday = cal.eventDatesNumbered[0].indexOf(t);
					if (foundday!=-1) {
						if(cal.eventDatesNumbered[2][foundday]!==""){						
							eCell.addClass(cal.eventDatesNumbered[2][foundday]+(cal.eventDatesSelectable?"":"-disabled"));
							tiptext = (cal.eventDatesNumbered[1][foundday]!=="" ? cal.eventDatesNumbered[1][foundday] : false);
						}
					}
				}

//regular Expression custom CSS Dates
				if(edMatch && format){
					fvalue = d.dateFormat(format);
					if(edMatch.test(fvalue)){
						tiptext = edText.replace("%0", fvalue);					
						cell.className = edCls;
					}
				}
			}
			
			
			if(!eCell.hasClass('x-date-disabled')) {
//mark Holidays				
				if(cal.markNationalHolidays && cal.nationalHolidaysNumbered[0].length>0) {
					foundday = cal.nationalHolidaysNumbered[0].indexOf(t);
					if (foundday!=-1) {
						eCell.addClass(cal.nationalHolidaysCls);
						tiptext = (cal.nationalHolidaysNumbered[1][foundday]!=="" ? cal.nationalHolidaysNumbered[1][foundday] : false);
					}
				}
				
				
//finally mark already selected items as selected
				if (cal.preSelectedDates.indexOf(t)!=-1) {
					eCell.addClass("x-date-selected");
					cal.preSelectedCells.push(cell.firstChild.monthCell+"#"+cell.firstChild.dayCell);
				}
				
				if (t == lsd) {
					cal.lastSelectedDateCell = cell.firstChild.monthCell+"#"+cell.firstChild.dayCell;
				}
				
			}
			else if (cal.disabledLetter){
				textnode.innerHTML = cal.disabledLetter;
			}

//mark today afterwards to ensure today CSS has higher priority
			if(t == today){
				eCell.addClass("x-date-today");
				tiptext = cal.todayText;
			}

//keynavigation?
			if(cal.showActiveDate && t == adt && cal.activeDateCell === ''){
				eCell.addClass("x-datepickerplus-activedate");
				cal.activeDateCell = cell.firstChild.monthCell+"#"+cell.firstChild.dayCell;
			}

//any quicktips necessary?
			if (tiptext) {
				if (cal.useQuickTips) {
					Ext.QuickTips.register({
						target: eTextNode,
						text: tiptext
					});
				}
				else {
					cell.title = tiptext;
				}
			}
			
			
		};

		var cells,textEls,days,firstOfMonth,startingPos,pm,prevStart,d,sel,i,intDay,weekNumbers,weekNumbersTextEls,curWeekStart,weekNumbersHeader,monthLabel,main,w;
		var summarizeHTML = [], x=0, xk=this.noOfMonth,e,el;
		for(;x<xk;++x) {
			if (this.summarizeHeader && this.noOfMonth > 1 && (x===0||x==this.noOfMonth-1)) {
				summarizeHTML.push(this.monthNames[date.getMonth()]," ",date.getFullYear());
				if (x===0) {
					summarizeHTML.push(" - ");
				}
			}
			cells = this.cellsArray[x].elements;
			textEls = this.textNodesArray[x];

			if ((this.markNationalHolidays || this.eventDates.length>0) && this.useQuickTips) {
				for (e=0,el=textEls.length;e<el;++e) {
					Ext.QuickTips.unregister(textEls[e]);
				}
			}
			
			days = date.getDaysInMonth();
			firstOfMonth = date.getFirstDateOfMonth();
			startingPos = firstOfMonth.getDay()-this.startDay;
	
			if(startingPos <= this.startDay){
				startingPos += 7;
			}
	
			pm = date.add("mo", -1);
			prevStart = pm.getDaysInMonth()-startingPos;
	
			days += startingPos;
	
			d = new Date(pm.getFullYear(), pm.getMonth(), prevStart).clearTime();
	
			i = 0;
			if (this.showWeekNumber) {
				weekNumbers = this.weekNumberCellsArray[x].elements;
				weekNumbersTextEls = this.weekNumberTextElsArray[x].elements;				
				curWeekStart = new Date(d);
				curWeekStart.setDate(curWeekStart.getDate() + 7);
				
				weekNumbersHeader = this.weekNumberHeaderCellsArray[x].elements;
				weekNumbersHeader[0].firstChild.monthValue = date.getMonth();
				weekNumbersHeader[0].firstChild.dateValue = curWeekStart.getTime();				
				weekNumbersHeader[0].firstChild.monthCell = x;
				weekNumbersHeader[0].firstChild.dayCell = 0;
				
				while(i < weekNumbers.length) {
					weekNumbersTextEls[i].innerHTML = curWeekStart.getWeekOfYear();
					weekNumbers[i].firstChild.dateValue = curWeekStart.getTime();
					weekNumbers[i].firstChild.monthCell = x;
					weekNumbers[i].firstChild.dayCell = (i*7);
					curWeekStart.setDate(curWeekStart.getDate() + 7);
					i++;
				}
				i = 0;
			}

			for(; i < startingPos; ++i) {
				textEls[i].innerHTML = (++prevStart);
				cells[i].firstChild.monthCell = x;
				cells[i].firstChild.dayCell = i;
				
				d.setDate(d.getDate()+1);
				cells[i].className = "x-date-prevday";
				setCellClass(this, cells[i],textEls[i],d);
			}
			
			for(; i < days; ++i){
				intDay = i - startingPos + 1;
				textEls[i].innerHTML = (intDay);
				cells[i].firstChild.monthCell = x;
				cells[i].firstChild.dayCell = i;
				d.setDate(d.getDate()+1);
				cells[i].className = "x-date-active";
				setCellClass(this, cells[i],textEls[i],d);
				if(d.getTime() == today){
					this.todayMonthCell	= x;
					this.todayDayCell = i;
				}
			}
		
			var extraDays = 0;
			for(; i < 42; ++i) {
				textEls[i].innerHTML = (++extraDays);
				cells[i].firstChild.monthCell = x;
				cells[i].firstChild.dayCell = i;
				d.setDate(d.getDate()+1);
				cells[i].className = "x-date-nextday";
				setCellClass(this, cells[i],textEls[i],d);
			}

			if (x===0 && !this.disableMonthPicker) {
				this.mbtn.setText(this.monthNames[date.getMonth()] + " " + date.getFullYear());
			}
			else {
				monthLabel = Ext.get(this.id+'-monthLabel' + x);                    
				monthLabel.update(this.monthNames[date.getMonth()] + " " + date.getFullYear());
			}
			date = date.add('mo',1);

			
			if(!this.internalRender){
				main = this.el.dom.firstChild;
				w = main.offsetWidth;
				this.el.setWidth(w + this.el.getBorderWidth("lr"));
				Ext.fly(main).setWidth(w);
				this.internalRender = true;
				// opera does not respect the auto grow header center column
				// then, after it gets a width opera refuses to recalculate
				// without a second pass
//Not needed anymore (tested with opera 9)
/*
				if(Ext.isOpera && !this.secondPass){
					main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + "px";
					this.secondPass = true;
					this.update.defer(10, this, [date]);
				}
*/							
			}
		}
		if (this.summarizeHeader && this.noOfMonth > 1) {
			var topHeader = Ext.get(this.id+'-summarize');
			topHeader.update(summarizeHTML.join(""));
		}
		this.el.unmask();
		if (oldStartMonth!=newStartMonth) {
            this.fireEvent("aftermonthchange", this, oldStartMonth, newStartMonth);
		}
		if (oldStartYear!=newStartYear) {
            this.fireEvent("afteryearchange", this, oldStartYear, newStartYear);
		}
	
    },

	beforeDestroy : function() {
		if(this.rendered) {		
            this.keyNav.disable();
            this.keyNav = null;
			if (this.renderPrevNextButtons) {
				Ext.destroy(
					this.leftClickRpt,
					this.rightClickRpt
				);
			}
			if (this.renderPrevNextYearButtons) {
				Ext.destroy(
					this.leftYearClickRpt,
					this.rightYearClickRpt
				);
			}
			if (!this.disableMonthPicker) {
				Ext.destroy(
					this.monthPicker,
					this.mbtn
				);
			}
			if (this.todayBtn) {
				this.todayBtn.destroy();
			}
			if (this.OKBtn){
				this.OKBtn.destroy();
			}
			if (this.undoBtn){
				this.undoBtn.destroy();			
			}
			Ext.destroy(
				this.eventEl
			);			
		}
	},


    handleWeekClick : function(e, t){
		if (!this.disabled) {
			e.stopEvent();
			var startweekdate = new Date(t.dateValue).getFirstDateOfWeek(this.startDay), amount=0, startmonth, curmonth,enableUnselect;
			var monthcell = t.monthCell;
			var daycell = t.dayCell;
			switch(t.parentNode.tagName.toUpperCase()) {
			case "TH":
				amount=42;
				startmonth = t.monthValue;
				break;
			case "TD":
				amount=7;
				break;
			}
			
			if ((amount==42 && this.fireEvent("beforemonthclick", this, startmonth,this.lastStateWasSelected) !== false) ||
			    (amount==7 && this.fireEvent("beforeweekclick", this, startweekdate,this.lastStateWasSelected) !== false)) {
			
				if (!Ext.EventObject.ctrlKey && this.multiSelectByCTRL) {
					this.removeAllPreselectedClasses();
				}
				
				enableUnselect=true;	
				if (this.disablePartialUnselect) {
					var teststartweekdate = startweekdate,k=0;
					for (;k<amount;++k) {
		//check, if the whole set is still selected, then make unselection possible again
						curmonth = teststartweekdate.getMonth();		
						if ((amount == 7 || curmonth === startmonth) && this.preSelectedDates.indexOf(teststartweekdate.clearTime().getTime())==-1) {
							enableUnselect=false;
							break;
						}
						teststartweekdate = teststartweekdate.add(Date.DAY,1);
					}
				}
		
				var reverseAdd =  false;
				var dateAdder = 1;
				if (this.strictRangeSelect &&	(
													(this.preSelectedDates.indexOf(startweekdate.add(Date.DAY,-1).clearTime().getTime())==-1 && !enableUnselect) ||
													(this.preSelectedDates.indexOf(startweekdate.add(Date.DAY,-1).clearTime().getTime())!=-1 && enableUnselect)
												)
					) {
					reverseAdd = true;
					startweekdate = startweekdate.add(Date.DAY,amount-1);
					dateAdder = -1;
				}
				
				this.maxNotified = false;
				var i=0,ni;
				for (;i<amount;++i) {
					curmonth = startweekdate.getMonth();
					ni = (reverseAdd ? amount-1-i : i);
					if (amount == 7 || curmonth === startmonth) {
						this.markDateAsSelected(startweekdate.clearTime().getTime(),true,monthcell,daycell+ni,enableUnselect);
					}
					startweekdate = startweekdate.add(Date.DAY,dateAdder);
				}
				if (amount==42) {
					this.fireEvent("aftermonthclick", this, startmonth,this.lastStateWasSelected);
				}
				else {
					this.fireEvent("afterweekclick", this, new Date(t.dateValue).getFirstDateOfWeek(this.startDay),this.lastStateWasSelected);
				}
			}
		}
	},

	markDateAsSelected : function(t,fakeCTRL,monthcell,daycell,enableUnselect) {
		var currentGetCell = Ext.get(this.cellsArray[monthcell].elements[daycell]);
	
		if ((currentGetCell.hasClass("x-date-prevday") || currentGetCell.hasClass("x-date-nextday") ) && this.prevNextDaysView!=="mark") {		
			return false;
		}

		if (this.multiSelection && (Ext.EventObject.ctrlKey || fakeCTRL)) {
			var beforeDate = new Date(t).add(Date.DAY,-1).clearTime().getTime();
			var afterDate = new Date(t).add(Date.DAY,1).clearTime().getTime();				
			
			if (this.preSelectedDates.indexOf(t)==-1) {
				if (this.maxSelectionDays === this.preSelectedDates.length) {
					if (!this.maxNotified)  {
				        if(this.fireEvent("beforemaxdays", this) !== false){
							Ext.Msg.alert(this.maxSelectionDaysTitle,this.maxSelectionDaysText.replace(/%0/,this.maxSelectionDays));
						}
						this.maxNotified = true;
					}
					return false;
				}
				if (currentGetCell.hasClass("x-date-disabled")) {
					return false;
				}
				
				if (this.strictRangeSelect && this.preSelectedDates.indexOf(afterDate)==-1 && this.preSelectedDates.indexOf(beforeDate)==-1 && this.preSelectedDates.length > 0) {
					return false;
				}
				
				this.preSelectedDates.push(t);
				this.markSingleDays(monthcell,daycell,false);
				this.markGhostDatesAlso(monthcell,daycell,false);
				this.lastStateWasSelected = true;
			}
			else {
				if (enableUnselect &&	(!this.strictRangeSelect ||
											(this.strictRangeSelect && 
											 	(
													(this.preSelectedDates.indexOf(afterDate)==-1 && this.preSelectedDates.indexOf(beforeDate)!=-1 ) ||
													(this.preSelectedDates.indexOf(afterDate)!=-1 && this.preSelectedDates.indexOf(beforeDate)==-1 )
												)
											)
										)
					){
					this.preSelectedDates.remove(t);
					this.markSingleDays(monthcell,daycell,true);
					this.markGhostDatesAlso(monthcell,daycell,true);
					this.lastStateWasSelected = false;
				}
			}
		}
		else {
//calling update in any case would get too slow on huge multiselect calendars, so set the class for the selected cells manually	 (MUCH faster if not calling update() every time!)
			this.removeAllPreselectedClasses();
			this.preSelectedDates = [t];			
			this.preSelectedCells = [];
			this.markSingleDays(monthcell,daycell,false);
			this.markGhostDatesAlso(monthcell,daycell,false);
			this.lastStateWasSelected = true;
		}
		this.lastSelectedDate = t;
		this.lastSelectedDateCell = monthcell+"#"+daycell;
		if (this.multiSelection && !this.renderOkUndoButtons) {
			this.copyPreToSelectedDays();
		}
		return this.lastStateWasSelected;
	},

	markSingleDays : function(monthcell,daycell,remove) {
		if(!remove) {
			Ext.get(this.cellsArray[monthcell].elements[daycell]).addClass("x-date-selected");
			this.preSelectedCells.push((monthcell)+"#"+(daycell));
		}
		else {
			Ext.get(this.cellsArray[monthcell].elements[daycell]).removeClass("x-date-selected");
			this.preSelectedCells.remove((monthcell)+"#"+(daycell));
		}
	},

	markGhostDatesAlso : function(monthcell,daycell,remove) {
		if (this.prevNextDaysView=="mark") {
			var currentGetCell = Ext.get(this.cellsArray[monthcell].elements[daycell]), dayCellDiff;
			if(currentGetCell.hasClass("x-date-prevday") && monthcell>0) {
				dayCellDiff = (5-Math.floor(daycell/7))*7;
				if(Ext.get(this.cellsArray[monthcell-1].elements[daycell+dayCellDiff]).hasClass("x-date-nextday")) {
					dayCellDiff-=7;
				}
				this.markSingleDays(monthcell-1,daycell+dayCellDiff,remove);
			}
			else if(currentGetCell.hasClass("x-date-nextday") && monthcell<this.cellsArray.length-1) {
				dayCellDiff = 28;
				if(this.cellsArray[monthcell].elements[daycell].firstChild.firstChild.firstChild.innerHTML != this.cellsArray[monthcell+1].elements[daycell-dayCellDiff].firstChild.firstChild.firstChild.innerHTML) {
					dayCellDiff=35;
				}
				this.markSingleDays(monthcell+1,daycell-dayCellDiff,remove);
			}
			else if(currentGetCell.hasClass("x-date-active") && ((daycell < 14 && monthcell>0) || (daycell > 27 && monthcell<this.cellsArray.length-1))){
				if (daycell<14) {
					dayCellDiff = 28;
					if(!Ext.get(this.cellsArray[monthcell-1].elements[daycell+dayCellDiff]).hasClass("x-date-nextday")) {
						dayCellDiff=35;
					}
					if(daycell+dayCellDiff < 42 && this.cellsArray[monthcell].elements[daycell].firstChild.firstChild.firstChild.innerHTML == this.cellsArray[monthcell-1].elements[daycell+dayCellDiff].firstChild.firstChild.firstChild.innerHTML) {
						this.markSingleDays(monthcell-1,daycell+dayCellDiff,remove);
					}
				}
				else {
					dayCellDiff = 28;
					if(!Ext.get(this.cellsArray[monthcell+1].elements[daycell-dayCellDiff]).hasClass("x-date-prevday")) {
						dayCellDiff=35;
					}
					if(daycell-dayCellDiff >= 0 && this.cellsArray[monthcell].elements[daycell].firstChild.firstChild.firstChild.innerHTML == this.cellsArray[monthcell+1].elements[daycell-dayCellDiff].firstChild.firstChild.firstChild.innerHTML) {
						this.markSingleDays(monthcell+1,daycell-dayCellDiff,remove);
					}
				}
			}
		}
	},
	
	
	removeAllPreselectedClasses : function() {
		var e=0,el=this.preSelectedCells.length,position;
		for (;e<el;++e) {												
			position = this.preSelectedCells[e].split("#");
			Ext.get(this.cellsArray[position[0]].elements[position[1]]).removeClass("x-date-selected");
		}
		this.preSelectedDates = [];
		this.preSelectedCells = [];
	},

    handleDateClick : function(e, t){
		
		e.stopEvent();
		var tp = Ext.fly(t.parentNode);

        if(!this.disabled && t.dateValue && !tp.hasClass("x-date-disabled") && !tp.hasClass("x-datepickerplus-eventdates-disabled") && this.fireEvent("beforedateclick", this,t) !== false){
			if (( !tp.hasClass("x-date-prevday") && !tp.hasClass("x-date-nextday") ) || this.prevNextDaysView=="mark") {
				var eO = Ext.EventObject;
				if ((!eO.ctrlKey && this.multiSelectByCTRL) || eO.shiftKey || !this.multiSelection) {
					this.removeAllPreselectedClasses();
				}
				var ctrlfaker = (((!eO.ctrlKey && !this.multiSelectByCTRL) || eO.shiftKey) && this.multiSelection ? true:false);
	
	
				if (eO.shiftKey && this.multiSelection && this.lastSelectedDate) {
					var startdate = this.lastSelectedDate;
					var targetdate = t.dateValue;
					var dayDiff = (startdate<targetdate? 1:-1);
					var lsdCell = this.lastSelectedDateCell.split("#");
					var tmpMonthCell = parseInt(lsdCell[0],10);
					var tmpDayCell = parseInt(lsdCell[1],10);
					var testCell,ghostCounter=0,ghostplus=0;
	
					this.maxNotified = false;
	
	
	
	//startdate lies in nonvisible month ?
					var firstVisibleDate = this.activeDate.getFirstDateOfMonth().clearTime().getTime();
					var lastVisibleDate = this.activeDate.add(Date.MONTH,this.noOfMonth-1).getLastDateOfMonth().clearTime().getTime();
	
					if (startdate<firstVisibleDate ||
						startdate>lastVisibleDate) {
				
	//prepare for disabledCheck
						var min = this.minDate ? this.minDate.clearTime().getTime() : Number.NEGATIVE_INFINITY;
						var max = this.maxDate ? this.maxDate.clearTime().getTime() : Number.POSITIVE_INFINITY;
						var ddays = this.disabledDays ? this.disabledDays.join("") : "";
						var ddMatch = this.disabledDatesRE;
						var format = this.format;
						var allowedDatesT =  this.allowedDates ? this.allowedDatesT : false;
						var d,ddMatchResult,fvalue;
	//check, if the days would be disabled
						while(startdate<firstVisibleDate || startdate>lastVisibleDate) {
							d=new Date(startdate);
	
							ddMatchResult = false;
							if(ddMatch){
								fvalue = d.dateFormat(format);
								ddMatchResult = ddMatch.test(fvalue);
							}
	//don't use >= and <= here for datecomparison, because the dates can differ in timezone
							if(	!(startdate < min) &&
								!(startdate > max) &&
								ddays.indexOf(d.getDay()) == -1 &&
								!ddMatchResult &&
								( !allowedDatesT || allowedDatesT.indexOf(startdate)!=-1 )
							   ) {
	//is not disabled and can be processed
	
								if (this.maxSelectionDays === this.preSelectedDates.length) {
									if(this.fireEvent("beforemaxdays", this) !== false){								
										Ext.Msg.alert(this.maxSelectionDaysTitle,this.maxSelectionDaysText.replace(/%0/,this.maxSelectionDays));
									}
									break;
								}
								this.preSelectedDates.push(startdate);
	
							}
							startdate = new Date(startdate).add(Date.DAY,dayDiff).clearTime().getTime();
						}
					
						tmpMonthCell = (dayDiff>0 ? 0 : this.cellsArray.length-1);
						tmpDayCell = (dayDiff>0 ? 0 : 41);
	
	//mark left ghostdates aswell
						testCell = Ext.get(this.cellsArray[tmpMonthCell].elements[tmpDayCell]);
						while (testCell.hasClass("x-date-prevday") || testCell.hasClass("x-date-nextday")) {
							testCell.addClass("x-date-selected");
							this.preSelectedCells.push((tmpMonthCell)+"#"+(tmpDayCell));
							tmpDayCell+=dayDiff;
							testCell = Ext.get(this.cellsArray[tmpMonthCell].elements[tmpDayCell]);
						}
					}
					
	//mark range of visible dates
					while ((targetdate-startdate)*dayDiff >0 && tmpMonthCell>=0 && tmpMonthCell<this.cellsArray.length) {									
						this.markDateAsSelected(startdate,ctrlfaker,tmpMonthCell,tmpDayCell,true);
	
	//take care of summertime changing (would return different milliseconds)
						startdate = new Date(startdate).add(Date.DAY,dayDiff).clearTime().getTime();
										
						testCell = Ext.get(this.cellsArray[tmpMonthCell].elements[tmpDayCell]);
	
						if (testCell.hasClass("x-date-active")) {
							ghostCounter=0;						
						}
						else {
							ghostCounter++;
						}
						tmpDayCell+=dayDiff;
						if (tmpDayCell==42) {
							tmpMonthCell++;
							tmpDayCell=(ghostCounter>=7?14:7);
						}
						else if (tmpDayCell<0) {
							tmpMonthCell--;
							tmpDayCell=34;
							
							testCell = Ext.get(this.cellsArray[tmpMonthCell].elements[tmpDayCell]);
							if (testCell.hasClass("x-date-nextday") || ghostCounter==7) {
								tmpDayCell=27;
							}
						}
					}
	
				}
				
				if(this.markDateAsSelected(t.dateValue,ctrlfaker,t.monthCell,t.dayCell,true)) {
					this.finishDateSelection(new Date(t.dateValue));
				}
			}
		}
    },
	
	copyPreToSelectedDays : function() {
		this.selectedDates = [];
		var i=0,il=this.preSelectedDates.length;
		for (;i<il;++i) {
			this.selectedDates.push(new Date(this.preSelectedDates[i]));
		}
	},
	okClicked : function() {
		this.copyPreToSelectedDays();
		this.selectedDates = this.selectedDates.sortDates();
		this.fireEvent("select", this, this.selectedDates);
	},

	spaceKeyPressed: function(e) {
		var ctrlfaker = (((!Ext.EventObject.ctrlKey && !this.multiSelectByCTRL) || Ext.EventObject.shiftKey) && this.multiSelection ? true:false);
		if (!this.disabled && this.shiftSpaceSelect == Ext.EventObject.shiftKey && this.showActiveDate) {
			var adCell = this.activeDateCell.split("#");
			var tmpMonthCell = parseInt(adCell[0],10);
			var tmpDayCell = parseInt(adCell[1],10);
			this.markDateAsSelected(this.activeDate.getTime(),ctrlfaker,tmpMonthCell,tmpDayCell,true);
			this.finishDateSelection(this.activeDate);
		}
		else {
			this.selectToday();
		}
	},

	finishDateSelection: function(date) {
        this.setValue(date);		
		if (this.multiSelection) {
			this.fireEvent("afterdateclick", this, date,this.lastStateWasSelected);
		}
		else {
			this.fireEvent("afterdateclick", this, date,this.lastStateWasSelected);	
	        this.fireEvent("select", this, this.value);
		}
	},

    selectToday : function(){
        if(!this.disabled && this.todayBtn && !this.todayBtn.disabled){
			var today = new Date().clearTime();
			var todayT = today.getTime();
		//today already visible?
			if (typeof this.todayMonthCell === "number") {
				this.markDateAsSelected(todayT,false,this.todayMonthCell,this.todayDayCell,true);
			}
			else if (this.multiSelection){
				this.update(today);
			}
			this.finishDateSelection(today);
        }		
    },
	
    setValue : function(value){
		if (Ext.isArray(value)) {

			this.selectedDates = [];
			this.preSelectedDates = [];			
			this.setSelectedDates(value,true);
	        value = value[0];

		}
		else {
			this.setSelectedDates(value,false);
		}
        this.value = value.clearTime(true);


		if(this.el && !this.multiSelection && this.noOfMonth==1){
            this.update(this.value);
        }

    },
	
/* this is needed to get it displayed in a panel correctly, it is called several times...*/	
	setSize: Ext.emptyFn
	
});
Ext.reg('datepickerplus', Ext.ux.DatePickerPlus);  


/*
To use DatepickerPlus in menus and datefields, DateItem and datefield needs to be rewritten. This way Ext.DateMenu stays original and by supplying new config item usePickerPlus:true will use the datepickerplus insted of the original picker. 
*/

	
if (parseInt(Ext.version.substr(0,1),10)>2) {

//ext 3.0		
	Ext.menu.DateItem = Ext.ux.DatePickerPlus;
	Ext.override(Ext.menu.DateMenu,{
		initComponent: function(){
			this.on('beforeshow', this.onBeforeShow, this);
			if(this.strict = (Ext.isIE7 && Ext.isStrict)){
				this.on('show', this.onShow, this, {single: true, delay: 20});
			}
			var PickerWidget = (this.initialConfig.usePickerPlus ? Ext.ux.DatePickerPlus : Ext.DatePicker);
			Ext.apply(this, {
				plain: true,
				showSeparator: false,
				items: this.picker = new PickerWidget(Ext.apply({
					internalRender: this.strict || !Ext.isIE,
					ctCls: 'x-menu-date-item',
	                id: this.pickerId					
				}, this.initialConfig))
			});
	        this.picker.purgeListeners();
			Ext.menu.DateMenu.superclass.initComponent.call(this);
			this.relayEvents(this.picker, ["select"]);
	        this.on('show', this.picker.focus, this.picker);
			this.on('select', this.menuHide, this);

			if(this.handler){
				this.on('select', this.handler, this.scope || this);
			}
			
		}
	});
	
}
else {
//ext 2.x
	Ext.menu.DateItem = function(config){
		if (typeof config === "undefined") {
			config = {};
		}
		if (config.usePickerPlus) {
			Ext.menu.DateItem.superclass.constructor.call(this, new Ext.ux.DatePickerPlus(Ext.applyIf({listeners: config.datePickerListeners||{}}, config)), config);	//NEW LINE			
		}
		else {
			Ext.menu.DateItem.superclass.constructor.call(this, new Ext.DatePicker(Ext.applyIf({listeners: config.datePickerListeners||{}}, config)), config);
		}
		this.picker = this.component;
		this.addEvents('select');
		
		this.picker.on("render", function(picker){
			picker.getEl().swallowEvent("click");
			picker.container.addClass("x-menu-date-item");
		});

		this.picker.on("select", this.onSelect, this);
	};
//this breaks in ext 3.0 (Ext.menu.Adapter and Ext.menu.DateItem do not exist in ext 3.0 anymore)
	Ext.extend(Ext.menu.DateItem, Ext.menu.Adapter,{
		// private
		onSelect : function(picker, date){
			this.fireEvent("select", this, date, picker);
			if(picker.rendered) {
				Ext.menu.DateItem.superclass.handleClick.call(this);
			}
		}
	});
}


if (Ext.form && Ext.form.DateField) {
	Ext.ux.form.DateFieldPlus = Ext.extend(Ext.form.DateField, {
		showPrevNextTrigger:false,
		prevNextTriggerType: 1,
		onPrevTriggerRelease: null,
		onNextTriggerRelease: null,
										   
		usePickerPlus: true,
		showWeekNumber: true,
		noOfMonth : 1,
		noOfMonthPerRow : 3,
		nationalHolidaysCls: 'x-datepickerplus-nationalholidays',
		markNationalHolidays:true,
		eventDates: function(year) {
			return [];
		},
		eventDatesRE : false,
		eventDatesRECls : '',
		eventDatesREText : '',
		multiSelection: false,
		multiSelectionDelimiter: ',',			
		multiSelectByCTRL: true,	
		fillupRows: true,
		markWeekends:true,
		weekendText:'',
		weekendCls: 'x-datepickerplus-weekends',
		weekendDays: [6,0],
		useQuickTips: true,
		pageKeyWarp: 1,
		maxSelectionDays: false,
		resizable: false,
		renderTodayButton: true,
		renderOkUndoButtons: true,
		tooltipType: 'qtip',
		allowedDates : false,
		allowedDatesText : '',
		renderPrevNextButtons: true,
		renderPrevNextYearButtons: false,
		disableMonthPicker:false,
		showActiveDate: false,
		shiftSpaceSelect: true,
		disabledLetter: false,
		allowMouseWheel:  true,
		summarizeHeader: false,
		stayInAllowedRange: true,
		disableSingleDateSelection: false,
		eventDatesSelectable: false,
		styleDisabledDates: false,
		prevNextDaysView: "mark",

		allowOtherMenus: false,

		onBeforeYearChange : function(picker, oldStartYear, newStartYear){
			return this.fireEvent("beforeyearchange", this, oldStartYear, newStartYear, picker);
		},
		
		onAfterYearChange : function(picker, oldStartYear, newStartYear){
			return this.fireEvent("afteryearchange", this, oldStartYear, newStartYear, picker);
		},
		
		onBeforeMonthChange : function(picker, oldStartMonth, newStartMonth){
			return this.fireEvent("beforemonthchange", this, oldStartMonth, newStartMonth, picker);
		},
		
		onAfterMonthChange : function(picker, oldStartMonth, newStartMonth){
			return this.fireEvent("aftermonthchange", this, oldStartMonth, newStartMonth, picker);
		},
		
		onAfterMonthClick : function(picker, month, wasSelected){
			return this.fireEvent("aftermonthclick", this, month, wasSelected, picker);
		},
		
		onAfterWeekClick : function(picker, startOfWeek, wasSelected){
			return this.fireEvent("afterweekclick", this, startOfWeek, wasSelected, picker);
		},

		onAfterDateClick : function(picker, date, wasSelected){
			return this.fireEvent("afterdateclick", this, date, wasSelected, picker);
		},
		
		onBeforeMonthClick : function(picker, month, wasSelected){
			return this.fireEvent("beforemonthclick", this, month, wasSelected, picker);
		},
		
		onBeforeWeekClick : function(picker, startOfWeek, wasSelected){
			return this.fireEvent("beforeweekclick", this, startOfWeek, wasSelected, picker);
		},

		onBeforeDateClick : function(picker, date){
			return this.fireEvent("beforedateclick", this, date);
		},

		onBeforeMouseWheel : function(picker, event){
			return this.fireEvent("beforemousewheel", this, event, picker);
		},
		
		onBeforeMaxDays : function(picker){
			return this.fireEvent("beforemaxdays", this, picker);
		},
		
		onUndo : function(picker, preSelectedDates){
			return this.fireEvent("undo", this, preSelectedDates, picker);
		},

		createMenu: function() {
			if(!this.menu){
				this.menu = new Ext.menu.DateMenu({
					allowOtherMenus: this.allowOtherMenus,
//is needed at initialisation		
					usePickerPlus:this.usePickerPlus,
					noOfMonth:this.noOfMonth,
					noOfMonthPerRow:this.noOfMonthPerRow,
					listeners: {
						'beforeyearchange': {fn:this.onBeforeYearChange,scope:this},
						'afteryearchange': {fn:this.onAfterYearChange,scope:this},
						'beforemonthchange': {fn:this.onBeforeMonthChange,scope:this},
						'aftermonthchange': {fn:this.onAfterMonthChange,scope:this},
						'afterdateclick': {fn:this.onAfterDateClick,scope:this},
						'aftermonthclick': {fn:this.onAfterMonthClick,scope:this},
						'afterweekclick': {fn:this.onAfterWeekClick,scope:this},
						'beforedateclick': {fn:this.onBeforeDateClick,scope:this},
						'beforemonthclick': {fn:this.onBeforeMonthClick,scope:this},
						'beforeweekclick': {fn:this.onBeforeWeekClick,scope:this},
						'beforemousewheel': {fn:this.onBeforeMouseWheel,scope:this},
						'beforemaxdays': {fn:this.onBeforeMaxDays,scope:this},
						'undo': {fn:this.onUndo,scope:this}
					}
				});
//do this only once!
				this.relayEvents(this.menu, ["select"]);
			}
			if (this.menu.isVisible()) {
				this.menu.hide();
				return;
			}
			if (this.disabledDatesRE) {
				this.ddMatch = this.disabledDatesRE;
			}
			if(typeof this.minDate == "string"){
				this.minDate = this.parseDate(this.minDate);
			}
			if(typeof this.maxDate == "string"){
				this.maxDate = this.parseDate(this.maxDate);
			}
			
			Ext.apply(this.menu.picker,  {
				minDate : this.minValue || this.minDate,
				maxDate : this.maxValue || this.maxDate,
				disabledDatesRE : this.ddMatch,
				disabledDatesText : this.disabledDatesText,
				disabledDays : this.disabledDays,
				disabledDaysText : this.disabledDaysText,
				showToday : this.showToday,	//from Ext 2.2
				format : this.format,
				minText : String.format(this.minText, this.formatDate(this.minValue || this.minDate)),
				maxText : String.format(this.maxText, this.formatDate(this.maxValue || this.maxDate)),
				showWeekNumber: this.showWeekNumber,
				nationalHolidaysCls: this.nationalHolidaysCls,
				markNationalHolidays:this.markNationalHolidays,
				multiSelectByCTRL: this.multiSelectByCTRL,	
				fillupRows: this.fillupRows,
				multiSelection: this.multiSelection,
				markWeekends:this.markWeekends,
				weekendText:this.weekendText,
				weekendCls: this.weekendCls,
				weekendDays: this.weekendDays,
				useQuickTips: this.useQuickTips,
				eventDates: this.eventDates,
				eventDatesRE: this.eventDatesRE,
				eventDatesRECls: this.eventDatesRECls,
				eventDatesREText: this.eventDatesREText,
				pageKeyWarp: this.pageKeyWarp,
				maxSelectionDays: this.maxSelectionDays,
				resizable: this.resizable,
				renderTodayButton: this.renderTodayButton,
				renderOkUndoButtons: this.renderOkUndoButtons,
				allowedDates : this.allowedDates,
				allowedDatesText : this.allowedDatesText,
				renderPrevNextButtons: this.renderPrevNextButtons,
				renderPrevNextYearButtons: this.renderPrevNextYearButtons,
				disableMonthPicker:this.disableMonthPicker,
				showActiveDate: this.showActiveDate,
				shiftSpaceSelect: this.shiftSpaceSelect,
				disabledLetter: this.disabledLetter,
				allowMouseWheel: this.allowMouseWheel,
				summarizeHeader: this.summarizeHeader,
				stayInAllowedRange: this.stayInAllowedRange,
				disableSingleDateSelection: this.disableSingleDateSelection,
				eventDatesSelectable: this.eventDatesSelectable,
				styleDisabledDates: this.styleDisabledDates,
				prevNextDaysView : this.prevNextDaysView
			});

			this.menu.picker.on("select",function(dp,date) {
				this.setValue(date);
			},this);
/*
//Ext 3.0
			if (this.menuEvents) {
				this.menuEvents('on');
			}
			else {
//ext 2.2.x				
				this.menu.on(Ext.apply({}, this.menuListeners, {
					scope:this
				}));
			}
*/
		},

		onTriggerClick : function(){
			if(this.disabled){
				return;
			}
			this.createMenu();
			if( typeof this.defaultValue == 'string' ) {
				this.defaultValue = Date.parseDate( this.defaultValue, this.format );
			}
			
			this.menu.picker.setValue(this.getValue() || this.defaultValue || new Date());
			this.menu.show(this.el, "tl-bl?");
			this.menu.focus();
		},
		
		setValue : function(date){
			var field = this;     
			if (Ext.isArray(date)) {
				var formatted = [],e=0,el=date.length;
				for (;e<el;++e) {
					formatted.push(field.formatDate(date[e]));
				}
			
				var value = formatted.join(this.multiSelectionDelimiter);
			
//bypass setValue validation on Ext.DateField
				Ext.form.DateField.superclass.setValue.call(this, value);
			}
			else {
				Ext.form.DateField.superclass.setValue.call(this, this.formatDate(this.parseDate(date)));				   
			}
		},

		validateValue : function(value){
			if (this.multiSelection){
				var field = this;
				var values = value.split(this.multiSelectionDelimiter);
				var isValid = true,e=0,el=values.length;
				for (;e<el;++e) {										  
					if (!Ext.ux.form.DateFieldPlus.superclass.validateValue.call(field, values[e])) {
						isValid = false;
					}
				}
				return isValid;
			}
			else {
				return Ext.ux.form.DateFieldPlus.superclass.validateValue.call(this, value);
			}         
		},

		getValue : function() {
			if (this.multiSelection) {
				var value = Ext.form.DateField.superclass.getValue.call(this);
				var field = this;					
				var values = value.split(this.multiSelectionDelimiter);
				var dates = [],e=0,el=values.length;
				for (;e<el;++e) {											  
					var checkDate = field.parseDate(values[e]);
					if (checkDate) {
						dates.push(checkDate);
					}
				}
				return (dates.length>0?dates:"");
			}
			else {
				return Ext.ux.form.DateFieldPlus.superclass.getValue.call(this);
			}
		},			


		beforeBlur : function(){
			if (this.multiSelection) {
				this.setValue(this.getRawValue().split(this.multiSelectionDelimiter));
			}
			else {
				var v = this.parseDate(this.getRawValue());
				if(v){
					this.setValue(v);
				}
			}
		},


		
		submitFormat:'Y-m-d',
		submitFormatAddon: '-format',			
		
		onResize : function(w, h){
			Ext.form.TriggerField.superclass.onResize.call(this, w, h);
			var tw = this.trigger.getWidth();
			var allTriggerWidths = tw;
			if (this.showPrevNextTrigger && !this.multiSelection) {
				allTriggerWidths+= this.prevTrigger.getWidth()+this.nextTrigger.getWidth();
			}
			if(!isNaN(w)){
				this.el.setWidth(w - tw);				
			}
			this.wrap.setWidth(this.el.getWidth() + allTriggerWidths);
		},
		
		onRender:function() {
			Ext.ux.form.DateFieldPlus.superclass.onRender.apply(this, arguments);

			if (this.showPrevNextTrigger && !this.multiSelection) {
				this.createMenu();
				this.prevTrigger = this.el.insertSibling({																			 
					tag: "img",
					src: Ext.BLANK_IMAGE_URL,
					cls: "x-form-trigger x-datepickerplus-fieldprev"
				});
				this.prevTrigger.addClassOnOver('x-form-trigger-over');
				this.prevTrigger.addClassOnClick('x-form-trigger-click');

				this.nextTrigger = this.trigger.insertSibling({
					tag: "img",
					src: Ext.BLANK_IMAGE_URL,
					cls: "x-form-trigger x-datepickerplus-fieldnext"
				},'after');
				this.nextTrigger.addClassOnOver('x-form-trigger-over');
				this.nextTrigger.addClassOnClick('x-form-trigger-click');

//ext 3?				
				if (this.menuEvents) {
					this.el.addClass("x-datepickerplus-prevnext-ext3");
					this.nextTrigger.addClass("x-datepickerplus-prevnext-ext3-next");
					this.prevTrigger.addClass("x-datepickerplus-prevnext-ext3-prev");
					this.trigger.addClass("x-datepickerplus-prevnext-ext3-date");
				}

				this.prevTrigRpt = new Ext.util.ClickRepeater(this.prevTrigger, {
					handler: function(el) {
						var old = this.getValue(),nxt=new Date();
						if (Ext.isDate(old)) {
							if (this.prevNextTriggerType==='m') {
								var md = old.getDate(),mm = old.getMonth()-1, my = old.getFullYear(),maxd=0;
								if (mm==-1) {
									mm=11;
									my--;
								}
								else {
									maxd = new Date(my,mm,1).getDaysInMonth();
									if (md>maxd) {
										md=maxd;
									}
								}
								nxt = new Date(my,mm,md);
							}
							else {
								nxt = new Date(old.getTime()-(86400000*this.prevNextTriggerType));
							}
						}
						this.setValue(nxt);
						this.menu.picker.setValue([nxt]);
					},
					listeners: {
						mouseup: function(cr,e){
							if (typeof this.scope.onPrevTriggerRelease=="function") {
								this.scope.onPrevTriggerRelease(this.scope.menu.picker, this.scope.menu.picker.value);
							}
							else {
								this.scope.menu.picker.fireEvent("select", this.scope.menu.picker, this.scope.menu.picker.value);
							}
						}
					},
					scope: this,
					preventDefault:true,
					stopDefault:true
				});
				this.nextTrigRpt = new Ext.util.ClickRepeater(this.nextTrigger, {
					handler: function(el) {
						var old = this.getValue(),nxt=new Date();
						if (Ext.isDate(old)) {
							if (this.prevNextTriggerType==='m') {
								var md = old.getDate(),mm = old.getMonth()+1, my = old.getFullYear(),maxd=0;
								if (mm==12) {
									mm=0;
									my++;
								}
								else {
									maxd = new Date(my,mm,1).getDaysInMonth();
									if (md>maxd) {
										md=maxd;
									}
								}
								nxt = new Date(my,mm,md);
							}
							else {
								nxt = new Date(old.getTime()+(86400000*this.prevNextTriggerType));
							}
						}
						this.setValue(nxt);
						this.menu.picker.setValue([nxt]);						
					},
					listeners: {
						mouseup: function(cr,e){
							if (typeof this.scope.onNextTriggerRelease=="function") {
								this.scope.onNextTriggerRelease(this.scope.menu.picker, this.scope.menu.picker.value);
							}
							else {
								this.scope.menu.picker.fireEvent("select", this.scope.menu.picker, this.scope.menu.picker.value);
							}
						}
					},
					scope: this,
					preventDefault:true,
					stopDefault:true
				});
			}			

//be sure not to have duplicate formfield names (at least IE moans about it and gets confused)				
//				this.name =  (typeof this.name==="undefined"?this.id+this.submitFormatAddon:(this.name==this.id?this.name+this.submitFormatAddon:this.name));		
			var name =  this.name || this.el.dom.name || (this.id+this.submitFormatAddon);
			if (name==this.id) {
				name+= this.submitFormatAddon;
			}
			this.hiddenField = this.el.insertSibling({
				tag:'input',
				type:'hidden',
				name: name,
				value:this.formatHiddenDate(this.parseDate(this.value))
			}, Ext.isIE ? 'after' : 'before');
			this.hiddenName = name;
			this.el.dom.removeAttribute('name');
			this.el.on({
				keyup:{scope:this, fn:this.updateHidden},
				blur:{scope:this, fn:this.updateHidden}
			});
	
			this.setValue = this.setValue.createSequence(this.updateHidden);
			
			if(this.tooltip){
				if(typeof this.tooltip == 'object'){
					Ext.QuickTips.register(Ext.apply({
						  target: this.trigger
					}, this.tooltip));
				} else {
					this.trigger.dom[this.tooltipType] = this.tooltip;
				}
			}
			
	
		},
		onDestroy: function(){		
			Ext.ux.form.DateFieldPlus.superclass.onDestroy.apply(this, arguments);		
			if(this.prevTrigger){
				this.prevTrigRpt.destroy();
				this.prevTrigger.removeAllListeners();
				this.prevTrigger.remove();
			}
			if(this.nextTrigger){
				this.nextTrigRpt.destroy();
				this.nextTrigger.removeAllListeners();
				this.nextTrigger.remove();
			}
		},
		onDisable: function(){
			Ext.ux.form.DateFieldPlus.superclass.onDisable.apply(this, arguments);
			if(this.hiddenField) {
				this.hiddenField.dom.setAttribute('disabled','disabled');
			}
		},
		
		onEnable: function(){
			Ext.ux.form.DateFieldPlus.superclass.onEnable.apply(this, arguments);
			if(this.hiddenField) {
				this.hiddenField.dom.removeAttribute('disabled');
			}
		},
		
		formatHiddenDate : function(date){
			return Ext.isDate(date) ? Ext.util.Format.date(date, this.submitFormat) : date;
		},
		
		formatMultiHiddenDate : function(date) {
			var field = this, formatted = [],value,e=0,el=date.length;
			for (;e<el;++e) {
				formatted.push(field.formatHiddenDate(date[e]));
			}
			value = formatted.join(this.multiSelectionDelimiter);
			this.hiddenField.dom.value = value;
		},
		
		updateHidden:function(date) {
			if (Ext.isArray(date)) {
				this.formatMultiHiddenDate(date);
			}
			else {
				var value = this.getValue();
				if (Ext.isArray(value)) {
					this.formatMultiHiddenDate(value);
				} else {
					this.hiddenField.dom.value = this.formatHiddenDate(value);
				}
			}
		}

	});
	Ext.reg('datefieldplus', Ext.ux.form.DateFieldPlus);
}
﻿/*
  * Ext.ux.DatePickerPlus  Addon
  * Ext.ux.form.DateFieldPlus  Addon  
  *
  * @author    Marco Wienkoop (wm003/lubber)
  * @copyright (c) 2008, Marco Wienkoop (marco.wienkoop@lubber.de) http://www.lubber.de
  *
*/
// Be sure to include this AFTER the datepickerwidget in your html-files

//Use this as a start to create you own language-file.
//Post it to the ext-forum, if you are done! :)
if(Ext.ux.DatePickerPlus){
	Ext.apply(Ext.ux.DatePickerPlus.prototype, {
		weekName : "周",
		selectWeekText : "点击选择当周所有天",
		selectMonthText : "点击选择当月所有周",
		maxSelectionDaysTitle: '日期选择器',
		maxSelectionDaysText: '你最多只能选择  %0 天',
		undoText: "撤销",
		displayMaskText: '请稍后...',
		nextYearText: "下一年 (Control+Up)",
		prevYearText: "上一年 (Control+Down)",
		nationalHolidays: function(year) {
			year = (typeof year === "undefined" ? (this.lastRenderedYear ? this.lastRenderedYear : new Date().getFullYear()) : parseInt(year,10));
	//per default the US national holidays are calculated (according to http://en.wikipedia.org/wiki/Public_holidays_of_the_United_States) 
	//override this function in your local file to calculate holidays for your own country
	//but remember to include the locale file _AFTER_ datepickerplus !
			var dayOfJan01 = new Date(year,0,1).getDay();
			var dayOfFeb01 = new Date(year,1,1).getDay();
			var dayOfMay01 = new Date(year,4,1).getDay();
			var dayOfSep01 = new Date(year,8,1).getDay();
			var dayOfOct01 = new Date(year,9,1).getDay();
			var dayOfNov01 = new Date(year,10,1).getDay();		
	
			var holidays = 
			[{
				text: "元旦",
				date: new Date(year,0,1)
			},
			{
				text: "五一",
				date: new Date(year,4,1)
			},
			{
				text: "情人节",
				date: new Date(year,10,11)
			},
			{
				text: "感恩节",//(Fourth Thursday in November)
				date: new Date(year,10,(dayOfNov01>4?26+7-dayOfNov01:26-dayOfNov01))
			},
			{
				text: "圣诞节",
				date: new Date(year,11,25)
			}];
			
			return holidays;
		}
	});
   
}
/*
This file is part of Ext JS 3.4

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-04-03 15:07:25
*/
/**
 * @class Ext.ux.Spinner
 * @extends Ext.util.Observable
 * Creates a Spinner control utilized by Ext.ux.form.SpinnerField
 */
Ext.ux.Spinner = Ext.extend(Ext.util.Observable, {
    incrementValue: 1,
    alternateIncrementValue: 5,
    triggerClass: 'x-form-spinner-trigger',
    splitterClass: 'x-form-spinner-splitter',
    alternateKey: Ext.EventObject.shiftKey,
    defaultValue: 0,
    accelerate: false,

    constructor: function(config){
        Ext.ux.Spinner.superclass.constructor.call(this, config);
        Ext.apply(this, config);
        this.mimicing = false;
    },

    init: function(field){
        this.field = field;

        field.afterMethod('onRender', this.doRender, this);
        field.afterMethod('onEnable', this.doEnable, this);
        field.afterMethod('onDisable', this.doDisable, this);
        field.afterMethod('afterRender', this.doAfterRender, this);
        field.afterMethod('onResize', this.doResize, this);
        field.afterMethod('onFocus', this.doFocus, this);
        field.beforeMethod('onDestroy', this.doDestroy, this);
    },

    doRender: function(ct, position){
        var el = this.el = this.field.getEl();
        var f = this.field;

        if (!f.wrap) {
            f.wrap = this.wrap = el.wrap({
                cls: "x-form-field-wrap"
            });
        }
        else {
            this.wrap = f.wrap.addClass('x-form-field-wrap');
        }

        this.trigger = this.wrap.createChild({
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            cls: "x-form-trigger " + this.triggerClass
        });

        if (!f.width) {
            this.wrap.setWidth(el.getWidth() + this.trigger.getWidth());
        }

        this.splitter = this.wrap.createChild({
            tag: 'div',
            cls: this.splitterClass,
            style: 'width:13px; height:2px;'
        });
        this.splitter.setRight((Ext.isIE) ? 1 : 2).setTop(10).show();

        this.proxy = this.trigger.createProxy('', this.splitter, true);
        this.proxy.addClass("x-form-spinner-proxy");
        this.proxy.setStyle('left', '0px');
        this.proxy.setSize(14, 1);
        this.proxy.hide();
        this.dd = new Ext.dd.DDProxy(this.splitter.dom.id, "SpinnerDrag", {
            dragElId: this.proxy.id
        });

        this.initTrigger();
        this.initSpinner();
    },

    doAfterRender: function(){
        var y;
        if (Ext.isIE && this.el.getY() != (y = this.trigger.getY())) {
            this.el.position();
            this.el.setY(y);
        }
    },

    doEnable: function(){
        if (this.wrap) {
            this.disabled = false;
            this.wrap.removeClass(this.field.disabledClass);
        }
    },

    doDisable: function(){
        if (this.wrap) {
	        this.disabled = true;
            this.wrap.addClass(this.field.disabledClass);
            this.el.removeClass(this.field.disabledClass);
        }
    },

    doResize: function(w, h){
        if (typeof w == 'number') {
            this.el.setWidth(w - this.trigger.getWidth());
        }
        this.wrap.setWidth(this.el.getWidth() + this.trigger.getWidth());
    },

    doFocus: function(){
        if (!this.mimicing) {
            this.wrap.addClass('x-trigger-wrap-focus');
            this.mimicing = true;
            Ext.get(Ext.isIE ? document.body : document).on("mousedown", this.mimicBlur, this, {
                delay: 10
            });
            this.el.on('keydown', this.checkTab, this);
        }
    },

    // private
    checkTab: function(e){
        if (e.getKey() == e.TAB) {
            this.triggerBlur();
        }
    },

    // private
    mimicBlur: function(e){
        if (!this.wrap.contains(e.target) && this.field.validateBlur(e)) {
            this.triggerBlur();
        }
    },

    // private
    triggerBlur: function(){
        this.mimicing = false;
        Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this);
        this.el.un("keydown", this.checkTab, this);
        this.field.beforeBlur();
        this.wrap.removeClass('x-trigger-wrap-focus');
        this.field.onBlur.call(this.field);
    },

    initTrigger: function(){
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');
    },

    initSpinner: function(){
        this.field.addEvents({
            'spin': true,
            'spinup': true,
            'spindown': true
        });

        this.keyNav = new Ext.KeyNav(this.el, {
            "up": function(e){
                e.preventDefault();
                this.onSpinUp();
            },

            "down": function(e){
                e.preventDefault();
                this.onSpinDown();
            },

            "pageUp": function(e){
                e.preventDefault();
                this.onSpinUpAlternate();
            },

            "pageDown": function(e){
                e.preventDefault();
                this.onSpinDownAlternate();
            },

            scope: this
        });

        this.repeater = new Ext.util.ClickRepeater(this.trigger, {
            accelerate: this.accelerate
        });
        this.field.mon(this.repeater, "click", this.onTriggerClick, this, {
            preventDefault: true
        });

        this.field.mon(this.trigger, {
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut,
            mousemove: this.onMouseMove,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp,
            scope: this,
            preventDefault: true
        });

        this.field.mon(this.wrap, "mousewheel", this.handleMouseWheel, this);

        this.dd.setXConstraint(0, 0, 10)
        this.dd.setYConstraint(1500, 1500, 10);
        this.dd.endDrag = this.endDrag.createDelegate(this);
        this.dd.startDrag = this.startDrag.createDelegate(this);
        this.dd.onDrag = this.onDrag.createDelegate(this);
    },

    onMouseOver: function(){
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        this.tmpHoverClass = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-overup' : 'x-form-spinner-overdown';
        this.trigger.addClass(this.tmpHoverClass);
    },

    //private
    onMouseOut: function(){
        this.trigger.removeClass(this.tmpHoverClass);
    },

    //private
    onMouseMove: function(){
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        if (((Ext.EventObject.getPageY() > middle) && this.tmpHoverClass == "x-form-spinner-overup") ||
        ((Ext.EventObject.getPageY() < middle) && this.tmpHoverClass == "x-form-spinner-overdown")) {
        }
    },

    //private
    onMouseDown: function(){
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        this.tmpClickClass = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-clickup' : 'x-form-spinner-clickdown';
        this.trigger.addClass(this.tmpClickClass);
    },

    //private
    onMouseUp: function(){
        this.trigger.removeClass(this.tmpClickClass);
    },

    //private
    onTriggerClick: function(){
        if (this.disabled || this.el.dom.readOnly) {
            return;
        }
        var middle = this.getMiddle();
        var ud = (Ext.EventObject.getPageY() < middle) ? 'Up' : 'Down';
        this['onSpin' + ud]();
    },

    //private
    getMiddle: function(){
        var t = this.trigger.getTop();
        var h = this.trigger.getHeight();
        var middle = t + (h / 2);
        return middle;
    },

    //private
    //checks if control is allowed to spin
    isSpinnable: function(){
        if (this.disabled || this.el.dom.readOnly) {
            Ext.EventObject.preventDefault(); //prevent scrolling when disabled/readonly
            return false;
        }
        return true;
    },

    handleMouseWheel: function(e){
        //disable scrolling when not focused
        if (this.wrap.hasClass('x-trigger-wrap-focus') == false) {
            return;
        }

        var delta = e.getWheelDelta();
        if (delta > 0) {
            this.onSpinUp();
            e.stopEvent();
        }
        else
            if (delta < 0) {
                this.onSpinDown();
                e.stopEvent();
            }
    },

    //private
    startDrag: function(){
        this.proxy.show();
        this._previousY = Ext.fly(this.dd.getDragEl()).getTop();
    },

    //private
    endDrag: function(){
        this.proxy.hide();
    },

    //private
    onDrag: function(){
        if (this.disabled) {
            return;
        }
        var y = Ext.fly(this.dd.getDragEl()).getTop();
        var ud = '';

        if (this._previousY > y) {
            ud = 'Up';
        } //up
        if (this._previousY < y) {
            ud = 'Down';
        } //down
        if (ud != '') {
            this['onSpin' + ud]();
        }

        this._previousY = y;
    },

    //private
    onSpinUp: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        if (Ext.EventObject.shiftKey == true) {
            this.onSpinUpAlternate();
            return;
        }
        else {
            this.spin(false, false);
        }
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spinup", this);
    },

    //private
    onSpinDown: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        if (Ext.EventObject.shiftKey == true) {
            this.onSpinDownAlternate();
            return;
        }
        else {
            this.spin(true, false);
        }
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spindown", this);
    },

    //private
    onSpinUpAlternate: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        this.spin(false, true);
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spinup", this);
    },

    //private
    onSpinDownAlternate: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        this.spin(true, true);
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spindown", this);
    },

    spin: function(down, alternate){
        var v = parseFloat(this.field.getValue());
        var incr = (alternate == true) ? this.alternateIncrementValue : this.incrementValue;
        (down == true) ? v -= incr : v += incr;

        v = (isNaN(v)) ? this.defaultValue : v;
        v = this.fixBoundries(v);
        this.field.setRawValue(v);
    },

    fixBoundries: function(value){
        var v = value;

        if (this.field.minValue != undefined && v < this.field.minValue) {
            v = this.field.minValue;
        }
        if (this.field.maxValue != undefined && v > this.field.maxValue) {
            v = this.field.maxValue;
        }

        return this.fixPrecision(v);
    },

    // private
    fixPrecision: function(value){
        var nan = isNaN(value);
        if (!this.field.allowDecimals || this.field.decimalPrecision == -1 || nan || !value) {
            return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.field.decimalPrecision));
    },

    doDestroy: function(){
        if (this.trigger) {
            this.trigger.remove();
        }
        if (this.wrap) {
            this.wrap.remove();
            delete this.field.wrap;
        }

        if (this.splitter) {
            this.splitter.remove();
        }

        if (this.dd) {
            this.dd.unreg();
            this.dd = null;
        }

        if (this.proxy) {
            this.proxy.remove();
        }

        if (this.repeater) {
            this.repeater.purgeListeners();
        }
        if (this.mimicing){
            Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this);
        }
    }
});

//backwards compat
Ext.form.Spinner = Ext.ux.Spinner;/*
This file is part of Ext JS 3.4

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-04-03 15:07:25
*/
Ext.ns('Ext.ux.form');
Ext.ns('Ext.ui');
/**
 * @class Ext.ux.form.SpinnerField
 * @extends Ext.form.NumberField
 * Creates a field utilizing Ext.ux.Spinner
 * @xtype spinnerfield
 */
Ext.ux.form.SpinnerField = Ext.extend(Ext.form.NumberField, {
    actionMode: 'wrap',
    deferHeight: true,
    autoSize: Ext.emptyFn,
    onBlur: Ext.emptyFn,
    adjustSize: Ext.BoxComponent.prototype.adjustSize,

	constructor: function(config) {
		var spinnerConfig = Ext.copyTo({}, config, 'incrementValue,alternateIncrementValue,accelerate,defaultValue,triggerClass,splitterClass');

		var spl = this.spinner = new Ext.ux.Spinner(spinnerConfig);

		var plugins = config.plugins
			? (Ext.isArray(config.plugins)
				? config.plugins.push(spl)
				: [config.plugins, spl])
			: spl;

		Ext.ux.form.SpinnerField.superclass.constructor.call(this, Ext.apply(config, {plugins: plugins}));
	},

    // private
    getResizeEl: function(){
        return this.wrap;
    },

    // private
    getPositionEl: function(){
        return this.wrap;
    },

    // private
    alignErrorIcon: function(){
        if (this.wrap) {
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
        }
    },

    validateBlur: function(){
        return true;
    }
});

Ext.reg('spinnerfield', Ext.ux.form.SpinnerField);

//backwards compat
Ext.form.SpinnerField = Ext.ux.form.SpinnerField;
Ext.ui.SpinnerField = Ext.form.SpinnerField;

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

Ext.reg('datetimefield', Ext.ui.DateTimeField);Ext.namespace('Ext.ux.maximgb.treegrid');

/**
 * This class shouldn't be created directly use NestedSetStore or
 * AdjacencyListStore instead.
 * 
 * @abstract
 */
Ext.ux.maximgb.treegrid.AbstractTreeStore = Ext.extend(Ext.ui.CommonStore, {
	/**
	 * @cfg {String} is_leaf_field_name Record leaf flag field name.
	 */
	leaf_field_name : '_is_leaf',

	/**
	 * Current page offset.
	 * 
	 * @access private
	 */
	page_offset : 0,

	/**
	 * Current active node.
	 * 
	 * @access private
	 */
	active_node : null,

	/**
	 * @constructor
	 */
	constructor : function(config) {
		Ext.ux.maximgb.treegrid.AbstractTreeStore.superclass.constructor.call(this, config);

		if (!this.paramNames.active_node) {
			this.paramNames.active_node = 'anode';
		}

		this.addEvents(
				/**
				 * @event beforeexpandnode Fires before node expand. Return
				 *        false to cancel operation. param {AbstractTreeStore}
				 *        this param {Record} record
				 */
				'beforeexpandnode',
				/**
				 * @event expandnode Fires after node expand. param
				 *        {AbstractTreeStore} this param {Record} record
				 */
				'expandnode',
				/**
				 * @event expandnodefailed Fires when expand node operation is
				 *        failed. param {AbstractTreeStore} this param {id}
				 *        Record id param {Record} Record, may be undefined
				 */
				'expandnodefailed',
				/**
				 * @event beforecollapsenode Fires before node collapse. Return
				 *        false to cancel operation. param {AbstractTreeStore}
				 *        this param {Record} record
				 */
				'beforecollapsenode',
				/**
				 * @event collapsenode Fires after node collapse. param
				 *        {AbstractTreeStore} this param {Record} record
				 */
				'collapsenode',
				/**
				 * @event beforeactivenodechange Fires before active node
				 *        change. Return false to cancel operation. param
				 *        {AbstractTreeStore} this param {Record} old active
				 *        node record param {Record} new active node record
				 */
				'beforeactivenodechange',
				/**
				 * @event activenodechange Fires after active node change. param
				 *        {AbstractTreeStore} this param {Record} old active
				 *        node record param {Record} new active node record
				 */
				'activenodechange');
	},

	// Store methods.
	// -----------------------------------------------------------------------------------------------
	/**
	 * Removes record and all its descendants.
	 * 
	 * @access public
	 * @param {Record}
	 *            record Record to remove.
	 */
	remove : function(record) {
		// ----- Modification start
		if (record === this.active_node) {
			this.setActiveNode(null);
		}
		this.removeNodeDescendants(record);
		// ----- End of modification
		Ext.ux.maximgb.treegrid.AbstractTreeStore.superclass.remove.call(this, record);
	},

	/**
	 * Removes node descendants.
	 * 
	 * @access private
	 */
	removeNodeDescendants : function(rc) {
		var i, len, children = this.getNodeChildren(rc);
		for (i = 0, len = children.length; i < len; i++) {
			this.remove(children[i]);
		}
	},

	/**
	 * Applyes current sort method.
	 * 
	 * @access private
	 */
	applySort : function() {
		if (this.sortInfo && !this.remoteSort) {
			var s = this.sortInfo, f = s.field;
			this.sortData(f, s.direction);
		}
		// ----- Modification start
		else {
			this.applyTreeSort();
		}
		// ----- End of modification
	},

	/**
	 * Sorts data according to sort params and then applyes tree sorting.
	 * 
	 * @access private
	 */
	sortData : function(f, direction) {
		direction = direction || 'ASC';
		var st = this.fields.get(f).sortType;
		var fn = function(r1, r2) {
			var v1 = st(r1.data[f]), v2 = st(r2.data[f]);
			return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
		};
		this.data.sort(direction, fn);
		if (this.snapshot && this.snapshot != this.data) {
			this.snapshot.sort(direction, fn);
		}
		// ----- Modification start
		this.applyTreeSort();
		// ----- End of modification
	},

	/**
	 * Loads current active record data.
	 */
	load : function(options) {
		if (options) {
			if (options.params) {
				if (options.params[this.paramNames.active_node] === undefined) {
					options.params[this.paramNames.active_node] = this.active_node ? this.active_node.id : null;
				}
			} else {
				options.params = {};
				options.params[this.paramNames.active_node] = this.active_node ? this.active_node.id : null;
			}
		} else {
			options = {
				params : {}
			};
			options.params[this.paramNames.active_node] = this.active_node ? this.active_node.id : null;
		}
		if (options.params[this.paramNames.active_node] !== null) {
			options.add = true;
		}
		return Ext.ux.maximgb.treegrid.AbstractTreeStore.superclass.load.call(this, options);
	},

	/**
	 * Called as a callback by the Reader during load operation.
	 * 
	 * @access private
	 */
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

		var r = o.records, t = o.totalRecords || r.length, page_offset = this.getPageOffsetFromOptions(options), loaded_node_id = this
				.getLoadedNodeIdFromOptions(options), loaded_node, i, len, self = this;

		if (!options || options.add !== true || loaded_node_id === null) {
			if (this.pruneModifiedRecords) {
				this.modified = [];
			}
			for (var i = 0, len = r.length; i < len; i++) {
				r[i].join(this);
			}
			if (this.snapshot) {
				this.data = this.snapshot;
				delete this.snapshot;
			}
			this.data.clear();
			this.data.addAll(r);
			this.page_offset = page_offset;
			this.totalLength = t;
			this.applySort();
			this.fireEvent("datachanged", this);
		} else {
			loaded_node = this.getById(loaded_node_id);
			if (loaded_node) {
				this.setNodeChildrenOffset(loaded_node, page_offset);
				this.setNodeChildrenTotalCount(loaded_node, Math.max(t, r.length));

				this.removeNodeDescendants(loaded_node);
				this.suspendEvents();
				for (i = 0, len = r.length; i < len; i++) {
					this.add(r[i]);
				}
				this.applySort();
				this.resumeEvents();
				idx = [];

				r.sort(function(r1, r2) {
					var idx1 = self.data.indexOf(r1), idx2 = self.data.indexOf(r2), r;

					if (idx1 > idx2) {
						r = 1;
					} else {
						r = -1;
					}
					return r;
				});
              // batch row insert  optimised by faylai
			  if(r.length>0){
			        this.fireEvent("add", this, r, this.data.indexOf(r[0]));
			  }			

				/*
				 * this.suspendEvents();
				 * this.removeNodeDescendants(loaded_node); this.add(r);
				 * this.applyTreeSort(); this.resumeEvents();
				 * this.fireEvent("datachanged", this);
				 */
			}
		}
		this.fireEvent("load", this, r, options);
		if (options.callback) {
			options.callback.call(options.scope || this, r, options, true);
		}
	},

	// Tree support methods.
	// -----------------------------------------------------------------------------------------------

	/**
	 * Sorts store data with respect to nodes parent-child relation. Every child
	 * node will be positioned after its parent.
	 * 
	 * @access public
	 */
	applyTreeSort : function() {
		var i, len, temp, rec, records = [], roots = this.getRootNodes();

		// Sorting data
		for (i = 0, len = roots.length; i < len; i++) {
			rec = roots[i];
			records.push(rec);
			this.collectNodeChildrenTreeSorted(records, rec);
		}

		if (records.length > 0) {
			this.data.clear();
			this.data.addAll(records);
		}

		// Sorting the snapshot if one present.
		if (this.snapshot && this.snapshot !== this.data) {
			temp = this.data;
			this.data = this.snapshot;
			this.snapshot = null;
			this.applyTreeSort();
			this.snapshot = this.data;
			this.data = temp;
		}
	},

	/**
	 * Recusively collects rec descendants and adds them to records[] array.
	 * 
	 * @access private
	 * @param {Record[]}
	 *            records
	 * @param {Record}
	 *            rec
	 */
	collectNodeChildrenTreeSorted : function(records, rec) {
		var i, len, child, children = this.getNodeChildren(rec);

		for (i = 0, len = children.length; i < len; i++) {
			child = children[i];
			records.push(child);
			this.collectNodeChildrenTreeSorted(records, child);
		}
	},

	/**
	 * Returns current active node.
	 * 
	 * @access public
	 * @return {Record}
	 */
	getActiveNode : function() {
		return this.active_node;
	},

	/**
	 * Sets active node.
	 * 
	 * @access public
	 * @param {Record}
	 *            rc Record to set active.
	 */
	setActiveNode : function(rc) {
		if (this.active_node !== rc) {
			if (rc) {
				if (this.data.indexOf(rc) != -1) {
					if (this.fireEvent('beforeactivenodechange', this, this.active_node, rc) !== false) {
						this.active_node = rc;
						this.fireEvent('activenodechange', this, this.active_node, rc);
					}
				} else {
					throw "Given record is not from the store.";
				}
			} else {
				if (this.fireEvent('beforeactivenodechange', this, this.active_node, rc) !== false) {
					this.active_node = rc;
					this.fireEvent('activenodechange', this, this.active_node, rc);
				}
			}
		}
	},

	/**
	 * Returns true if node is expanded.
	 * 
	 * @access public
	 * @param {Record}
	 *            rc
	 */
	isExpandedNode : function(rc) {
		return rc.ux_maximgb_treegrid_expanded === true;
	},

	/**
	 * Sets node expanded flag.
	 * 
	 * @access private
	 */
	setNodeExpanded : function(rc, value) {
		rc.ux_maximgb_treegrid_expanded = value;
	},

	/**
	 * Returns true if node's ancestors are all expanded - node is visible.
	 * 
	 * @access public
	 * @param {Record}
	 *            rc
	 */
	isVisibleNode : function(rc) {
		var i, len, ancestors = this.getNodeAncestors(rc), result = true;
        //root node must be visible
		if(ancestors.length==0){		
			return true;
		}
		ancestors = this.getNodeAncestors(this.getNodeParent(rc));
		for (i = 0, len = ancestors.length; i < len; i++) {
			result = result && this.isExpandedNode(ancestors[i]);
			if (!result) {
				break;
			}
		}       
		return result;
	},

	/**
	 * Returns true if node is a leaf.
	 * 
	 * @access public
	 * @return {Boolean}
	 */
	isLeafNode : function(rc) {
		return rc.get(this.leaf_field_name) == true;
	},

	/**
	 * Returns true if node was loaded.
	 * 
	 * @access public
	 * @return {Boolean}
	 */
	isLoadedNode : function(rc) {
		var result;

		if (rc.ux_maximgb_treegrid_loaded !== undefined) {
			result = rc.ux_maximgb_treegrid_loaded
		} else if (this.isLeafNode(rc) || this.hasChildNodes(rc)) {
			result = true;
		} else {
			result = false;
		}

		return result;
	},

	/**
	 * Sets node loaded state.
	 * 
	 * @access private
	 * @param {Record}
	 *            rc
	 * @param {Boolean}
	 *            value
	 */
	setNodeLoaded : function(rc, value) {
		rc.ux_maximgb_treegrid_loaded = value;
	},

	/**
	 * Returns node's children offset.
	 * 
	 * @access public
	 * @param {Record}
	 *            rc
	 * @return {Integer}
	 */
	getNodeChildrenOffset : function(rc) {
		return rc.ux_maximgb_treegrid_offset || 0;
	},

	/**
	 * Sets node's children offset.
	 * 
	 * @access private
	 * @param {Record}
	 *            rc
	 * @parma {Integer} value
	 */
	setNodeChildrenOffset : function(rc, value) {
		rc.ux_maximgb_treegrid_offset = value;
	},

	/**
	 * Returns node's children total count
	 * 
	 * @access public
	 * @param {Record}
	 *            rc
	 * @return {Integer}
	 */
	getNodeChildrenTotalCount : function(rc) {
		return rc.ux_maximgb_treegrid_total || 0;
	},

	/**
	 * Sets node's children total count.
	 * 
	 * @access private
	 * @param {Record}
	 *            rc
	 * @param {Integer}
	 *            value
	 */
	setNodeChildrenTotalCount : function(rc, value) {
		rc.ux_maximgb_treegrid_total = value;
	},

	/**
	 * Collapses node.
	 * 
	 * @access public
	 * @param {Record}
	 *            rc
	 * @param {Record}
	 *            rc Node to collapse.
	 */
	collapseNode : function(rc) {
		if (this.isExpandedNode(rc) && this.fireEvent('beforecollapsenode', this, rc) !== false) {
			this.setNodeExpanded(rc, false);
			this.fireEvent('collapsenode', this, rc);
		}
	},

	/**
	 * Expands node.
	 * 
	 * @access public
	 * @param {Record}
	 *            rc
	 * @para {Boolean} reload 指定展开时是否刷新数据
	 */
	expandNode : function(rc, reload) {
		var params;
		if (!this.isExpandedNode(rc) && this.fireEvent('beforeexpandnode', this, rc) !== false) {
			if (reload == true) {
				this.setNodeLoaded(rc, false);
			}

			// If node is already loaded then expanding now.
			if (this.isLoadedNode(rc)) {
				this.setNodeExpanded(rc, true);
				this.fireEvent('expandnode', this, rc);
			}
			// If node isn't loaded yet then expanding after load.
			else {
				params = {};
				params[this.paramNames.active_node] = rc.id;
				Ext.apply(params, rc.data);
				this.load({
					add : true,
					params : params,
					callback : this.expandNodeCallback,
					scope : this
				});
			}
		}
	},

	/**
	 * @access private
	 */
	expandNodeCallback : function(r, options, success) {
		var rc = this.getById(options.params[this.paramNames.active_node]);

		if (success && rc) {
			this.setNodeLoaded(rc, true);
			this.setNodeExpanded(rc, true);
			this.fireEvent('expandnode', this, rc);
		} else {
			this.fireEvent('expandnodefailed', this, options.params[this.paramNames.active_node], rc);
		}
	},

	/**
	 * Returns loaded node id from the load options.
	 * 
	 * @access public
	 */
	getLoadedNodeIdFromOptions : function(options) {
		var result = null;
		if (options && options.params && options.params[this.paramNames.active_node]) {
			result = options.params[this.paramNames.active_node];
		}
		return result;
	},

	/**
	 * Returns start offset from the load options.
	 */
	getPageOffsetFromOptions : function(options) {
		var result = 0;
		if (options && options.params && options.params[this.paramNames.start]) {
			result = parseInt(options.params[this.paramNames.start], 10);
			if (isNaN(result)) {
				result = 0;
			}
		}
		return result;
	},

	// Public
	hasNextSiblingNode : function(rc) {
		return this.getNodeNextSibling(rc) !== null;
	},

	// Public
	hasPrevSiblingNode : function(rc) {
		return this.getNodePrevSibling(rc) !== null;
	},

	// Public
	hasChildNodes : function(rc) {
		return this.getNodeChildrenCount(rc) > 0;
	},

	// Public
	getNodeAncestors : function(rc) {
		var ancestors = [], parent;

		parent = this.getNodeParent(rc);
		while (parent) {
			ancestors.push(parent);
			parent = this.getNodeParent(parent);
		}

		return ancestors;
	},

	// Public
	getNodeChildrenCount : function(rc) {
		return this.getNodeChildren(rc).length;
	},

	// Public
	getNodeNextSibling : function(rc) {
		var siblings, parent, index, result = null;

		parent = this.getNodeParent(rc);
		if (parent) {
			siblings = this.getNodeChildren(parent);
		} else {
			siblings = this.getRootNodes();
		}

		index = siblings.indexOf(rc);

		if (index < siblings.length - 1) {
			result = siblings[index + 1];
		}

		return result;
	},

	// Public
	getNodePrevSibling : function(rc) {
		var siblings, parent, index, result = null;

		parent = this.getNodeParent(rc);
		if (parent) {
			siblings = this.getNodeChildren(parent);
		} else {
			siblings = this.getRootNodes();
		}

		index = siblings.indexOf(rc);
		if (index > 0) {
			result = siblings[index - 1];
		}

		return result;
	},

	// Abstract tree support methods.
	// -----------------------------------------------------------------------------------------------

	// Public - Abstract
	getRootNodes : function() {
		throw 'Abstract method call';
	},

	// Public - Abstract
	getNodeDepth : function(rc) {
		throw 'Abstract method call';
	},

	// Public - Abstract
	getNodeParent : function(rc) {
		throw 'Abstract method call';
	},

	// Public - Abstract
	getNodeChildren : function(rc) {
		throw 'Abstract method call';
	},

	// Public - Abstract
	addToNode : function(parent, child) {
		throw 'Abstract method call';
	},

	// Public - Abstract
	removeFromNode : function(parent, child) {
		throw 'Abstract method call';
	},

	// Paging support methods.
	// -----------------------------------------------------------------------------------------------
	/**
	 * Returns top level node page offset.
	 * 
	 * @access public
	 * @return {Integer}
	 */
	getPageOffset : function() {
		return this.page_offset;
	},

	/**
	 * Returns active node page offset.
	 * 
	 * @access public
	 * @return {Integer}
	 */
	getActiveNodePageOffset : function() {
		var result;

		if (this.active_node) {
			result = this.getNodeChildrenOffset(this.active_node);
		} else {
			result = this.getPageOffset();
		}

		return result;
	},

	/**
	 * Returns active node children count.
	 * 
	 * @access public
	 * @return {Integer}
	 */
	getActiveNodeCount : function() {
		var result;

		if (this.active_node) {
			result = this.getNodeChildrenCount(this.active_node);
		} else {
			result = this.getRootNodes().length;
		}

		return result;
	},

	/**
	 * Returns active node total children count.
	 * 
	 * @access public
	 * @return {Integer}
	 */
	getActiveNodeTotalCount : function() {
		var result;

		if (this.active_node) {
			result = this.getNodeChildrenTotalCount(this.active_node);
		} else {
			result = this.getTotalCount();
		}

		return result;
	}

});

/**
 * Tree store for adjacency list tree representation.
 */
Ext.ux.maximgb.treegrid.AdjacencyListStore = Ext.extend(Ext.ux.maximgb.treegrid.AbstractTreeStore, {
	/**
	 * @cfg {String} parent_id_field_name Record parent id field name.
	 */
	parent_id_field_name : '_parent',

	getRootNodes : function() {
		var i, len, result = [], records = this.data.getRange();

		for (i = 0, len = records.length; i < len; i++) {
			if (records[i].get(this.parent_id_field_name) == null) {
				result.push(records[i]);
			}
		}

		return result;
	},

	getNodeDepth : function(rc) {
		return this.getNodeAncestors(rc).length;
	},

	getNodeParent : function(rc) {
		return this.getById(rc.get(this.parent_id_field_name));
	},

	getNodeChildren : function(rc) {
		var i, len, result = [], records = this.data.getRange();

		for (i = 0, len = records.length; i < len; i++) {
			if (records[i].get(this.parent_id_field_name) == rc.id) {
				result.push(records[i]);
			}
		}

		return result;
	},
	reload : function(options) {
		var r = this.getActiveNode();
		var parent = this.getNodeParent(r);
		if (parent) {
			this.collapseNode(parent);
			this.expandNode(parent, true);
		} else {
			Ext.ux.maximgb.treegrid.AdjacencyListStore.superclass.reload.call(this, options);
		}

	}
});

/**
 * Tree store for nested set tree representation.
 */
Ext.ux.maximgb.treegrid.NestedSetStore = Ext.extend(Ext.ux.maximgb.treegrid.AbstractTreeStore, {
	/**
	 * @cfg {String} left_field_name Record NS-left bound field name.
	 */
	left_field_name : '_lft',

	/**
	 * @cfg {String} right_field_name Record NS-right bound field name.
	 */
	right_field_name : '_rgt',

	/**
	 * @cfg {String} level_field_name Record NS-level field name.
	 */
	level_field_name : '_level',

	/**
	 * @cfg {Number} root_node_level Root node level.
	 */
	root_node_level : 1,

	getRootNodes : function() {
		var i, len, result = [], records = this.data.getRange();

		for (i = 0, len = records.length; i < len; i++) {
			if (records[i].get(this.level_field_name) == this.root_node_level) {
				result.push(records[i]);
			}
		}

		return result;
	},

	getNodeDepth : function(rc) {
		return rc.get(this.level_field_name) - this.root_node_level;
	},

	getNodeParent : function(rc) {
		var result = null, rec, records = this.data.getRange(), i, len, lft, r_lft, rgt, r_rgt, level, r_level;

		lft = rc.get(this.left_field_name);
		rgt = rc.get(this.right_field_name);
		level = rc.get(this.level_field_name);

		for (i = 0, len = records.length; i < len; i++) {
			rec = records[i];
			r_lft = rec.get(this.left_field_name);
			r_rgt = rec.get(this.right_field_name);
			r_level = rec.get(this.level_field_name);

			if (r_level == level - 1 && r_lft < lft && r_rgt > rgt) {
				result = rec;
				break;
			}
		}

		return result;
	},

	getNodeChildren : function(rc) {
		var lft, r_lft, rgt, r_rgt, level, r_level, records, rec, result = [];

		records = this.data.getRange();

		lft = rc.get(this.left_field_name);
		rgt = rc.get(this.right_field_name);
		level = rc.get(this.level_field_name);

		for (i = 0, len = records.length; i < len; i++) {
			rec = records[i];
			r_lft = rec.get(this.left_field_name);
			r_rgt = rec.get(this.right_field_name);
			r_level = rec.get(this.level_field_name);

			if (r_level == level + 1 && r_lft > lft && r_rgt < rgt) {
				result.push(rec);
			}
		}

		return result;
	}
});

Ext.ux.maximgb.treegrid.GridView = Ext.extend(Ext.grid.GridView, {
	// private
	breadcrumbs_el : null,	
	hideBreadCrumb:false,
	// private - overriden
	initTemplates : function() {
		var ts = this.templates || {};
		var hideBreadCrumbStyle="";
		if(this.hideBreadCrumb===true){
		    hideBreadCrumbStyle='display:none;';
		}
		ts.master = new Ext.Template('<div class="x-grid3" hidefocus="true">', '<div class="x-grid3-viewport">',
				'<div class="x-grid3-header">',
				// Breadcrumbs
				'<div class="x-grid3-header-inner">', '<div class="x-grid3-header-offset">',
				'<div class="ux-maximgb-treegrid-breadcrumbs" style="'+hideBreadCrumbStyle+'">&#160;</div>', '</div>', '</div>',
				'<div class="x-clear"></div>',
				// End of breadcrumbs
				// Header
				'<div class="x-grid3-header-inner">', '<div class="x-grid3-header-offset">{header}</div>', '</div>', '<div class="x-clear"></div>',
				// End of header
				'</div>',
				// Scroller
				'<div class="x-grid3-scroller">', '<div class="x-grid3-body">{body}</div>', '<a href="#" class="x-grid3-focus" tabIndex="-1"></a>',
				'</div>',
				// End of scroller
				'</div>', '<div class="x-grid3-resize-marker">&#160;</div>', '<div class="x-grid3-resize-proxy">&#160;</div>', '</div>');

		ts.row = new Ext.Template('<div class="x-grid3-row {alt} ux-maximgb-treegrid-level-{level}" style="{tstyle} {display_style}">',
				'<table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">', '<tbody>', '<tr>{cells}</tr>',
				(this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}">'
						+ '<td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on">'
						+ '<div class="x-grid3-row-body">{body}</div>' + '</td>' + '</tr>' : ''), '</tbody>', '</table>', '</div>');

		ts.cell = new Ext.Template('<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>', '{treeui}',
				'<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>', '</td>');

		ts.treeui = new Ext.Template('<div class="ux-maximgb-treegrid-uiwrap" style="width: {wrap_width}px">', '{elbow_line}',
				'<div style="left: {left}px" class="{cls}">&#160;</div>', '</div>');

		ts.elbow_line = new Ext.Template('<div style="left: {left}px" class="{cls}">&#160;</div>');

		ts.brd_item = new Ext.Template('<a href="#" id="ux-maximgb-treegrid-brditem-{id}" class="ux-maximgb-treegrid-brditem" title="{title}">{caption}</a>');

		this.templates = ts;
		Ext.ux.maximgb.treegrid.GridView.superclass.initTemplates.call(this);
	},

	// private - overriden
	initElements : function() {
		var E = Ext.Element;

		var el = this.grid.getGridEl().dom.firstChild;
		var cs = el.childNodes;

		this.el = new E(el);

		this.mainWrap = new E(cs[0]);
		this.mainHd = new E(this.mainWrap.dom.firstChild);

		if (this.grid.hideHeaders) {
			this.mainHd.setDisplayed(false);
		}

		// ----- Modification start
		// Original: this.innerHd = this.mainHd.dom.firstChild;
		this.innerHd = this.mainHd.dom.childNodes[2];
		// ----- End of modification
		this.scroller = new E(this.mainWrap.dom.childNodes[1]);

		if (this.forceFit) {
			this.scroller.setStyle('overflow-x', 'hidden');
		}
		this.mainBody = new E(this.scroller.dom.firstChild);

		this.focusEl = new E(this.scroller.dom.childNodes[1]);
		this.focusEl.swallowEvent("click", true);

		this.resizeMarker = new E(cs[1]);
		this.resizeProxy = new E(cs[2]);

		this.breadcrumbs_el = this.el.child('.ux-maximgb-treegrid-breadcrumbs');

		this.setRootBreadcrumbs();
	},

	// Private - Overriden
	doRender : function(cs, rs, ds, startRow, colCount, stripe) {
		var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount - 1;
		var tstyle = 'width:' + this.getTotalWidth() + ';';
		// buffers
		var buf = [], cb, c, p = {}, rp = {
			tstyle : tstyle
		}, r;
		for (var j = 0, len = rs.length; j < len; j++) {
			r = rs[j];
			cb = [];
			var rowIndex = (j + startRow);
			for (var i = 0; i < colCount; i++) {
				c = cs[i];
				p.id = c.id;
				p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
				p.attr = p.cellAttr = "";
				p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
				p.style = c.style;
				if (p.value == undefined || p.value === "") {
					p.value = "&#160;";
				}
				if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
					p.css += ' x-grid3-dirty-cell';
				}
				// ----- Modification start
				if (c.id == this.grid.master_column_id) {
					p.treeui = this.renderCellTreeUI(r, ds);
				} else {
					p.treeui = '';
				}
				// ----- End of modification
				cb[cb.length] = ct.apply(p);
			}
			var alt = [];
			if (stripe && ((rowIndex + 1) % 2 == 0)) {
				alt[0] = "x-grid3-row-alt";
			}
			if (r.dirty) {
				alt[1] = " x-grid3-dirty-row";
			}
			rp.cols = colCount;
			if (this.getRowClass) {
				alt[2] = this.getRowClass(r, rowIndex, rp, ds);
			}
			rp.alt = alt.join(" ");
			rp.cells = cb.join("");
			// ----- Modification start
			if (!ds.isVisibleNode(r)) {
				rp.display_style = 'display: none;';
			} else {
				rp.display_style = '';
			}
			rp.level = ds.getNodeDepth(r);
			// ----- End of modification
			buf[buf.length] = rt.apply(rp);
		}
		return buf.join("");
	},

	renderCellTreeUI : function(record, store) {
		var tpl = this.templates.treeui, line_tpl = this.templates.elbow_line, tpl_data = {}, rec, parent, depth = level = store.getNodeDepth(record);

		tpl_data.wrap_width = (depth + 1) * 16;
		if (level > 0) {
			tpl_data.elbow_line = '';
			rec = record;
			left = 0;
			while (level--) {
				parent = store.getNodeParent(rec);
				if (parent) {
					if (store.hasNextSiblingNode(parent)) {
						tpl_data.elbow_line = line_tpl.apply({
							left : level * 16,
							cls : 'ux-maximgb-treegrid-elbow-line'
						}) + tpl_data.elbow_line;
					} else {
						tpl_data.elbow_line = line_tpl.apply({
							left : level * 16,
							cls : 'ux-maximgb-treegrid-elbow-empty'
						}) + tpl_data.elbow_line;
					}
				} else {
					throw ["Tree inconsistency can't get level ", level + 1, " node(id=", rec.id, ") parent."].join("")
				}
				rec = parent;
			}
		}
		if (store.isLeafNode(record)) {
			if (store.hasNextSiblingNode(record)) {
				tpl_data.cls = 'ux-maximgb-treegrid-elbow';
			} else {
				tpl_data.cls = 'ux-maximgb-treegrid-elbow-end';
			}
		} else {
			tpl_data.cls = 'ux-maximgb-treegrid-elbow-active ';
			if (store.isExpandedNode(record)) {
				if (store.hasNextSiblingNode(record)) {
					tpl_data.cls += 'ux-maximgb-treegrid-elbow-minus';
				} else {
					tpl_data.cls += 'ux-maximgb-treegrid-elbow-end-minus';
				}
			} else {
				if (store.hasNextSiblingNode(record)) {
					tpl_data.cls += 'ux-maximgb-treegrid-elbow-plus';
				} else {
					tpl_data.cls += 'ux-maximgb-treegrid-elbow-end-plus';
				}
			}
		}
		tpl_data.left = 1 + depth * 16;

		return tpl.apply(tpl_data);
	},

	// Private
	getBreadcrumbsEl : function() {
		return this.breadcrumbs_el;
	},

	// Private
	expandRow : function(record, initial) {
		var ds = this.ds, i, len, row, pmel, children, index, child_index;

		if (typeof record == 'number') {
			index = record;
			record = ds.getAt(index);
		} else {
			index = ds.indexOf(record);
		}

		row = this.getRow(index);
		pmel = Ext.fly(row).child('.ux-maximgb-treegrid-elbow-active');
		if (pmel) {
			if (ds.hasNextSiblingNode(record)) {
				pmel.removeClass('ux-maximgb-treegrid-elbow-plus');
				pmel.removeClass('ux-maximgb-treegrid-elbow-end-plus');
				pmel.addClass('ux-maximgb-treegrid-elbow-minus');
			} else {
				pmel.removeClass('ux-maximgb-treegrid-elbow-plus');
				pmel.removeClass('ux-maximgb-treegrid-elbow-end-plus');
				pmel.addClass('ux-maximgb-treegrid-elbow-end-minus');
			}
			if (ds.isVisibleNode(record)) {
				children = ds.getNodeChildren(record);
				for (i = 0, len = children.length; i < len; i++) {
					child_index = ds.indexOf(children[i]);
					row = this.getRow(child_index);
					Ext.fly(row).setStyle('display', 'block');
					if (ds.isExpandedNode(children[i])) {
						this.expandRow(child_index);
					}
				}
			}
		}
	},

	collapseRow : function(record) {
		var ds = this.ds, i, len, children, row, index;

		if (typeof record == 'number') {
			index = record;
			record = ds.getAt(index);
		} else {
			index = ds.indexOf(record);
		}

		row = this.getRow(index);
		pmel = Ext.fly(row).child('.ux-maximgb-treegrid-elbow-active');
		if (pmel) {
			if (ds.hasNextSiblingNode(record)) {
				pmel.removeClass('ux-maximgb-treegrid-elbow-minus');
				pmel.removeClass('ux-maximgb-treegrid-elbow-end-minus');
				pmel.addClass('ux-maximgb-treegrid-elbow-plus');
			} else {
				pmel.removeClass('ux-maximgb-treegrid-elbow-minus');
				pmel.removeClass('ux-maximgb-treegrid-elbow-end-minus');
				pmel.addClass('ux-maximgb-treegrid-elbow-end-plus');
			}
			children = ds.getNodeChildren(record);
			for (i = 0, len = children.length; i < len; i++) {
				index = ds.indexOf(children[i]);
				row = this.getRow(index);
				Ext.fly(row).setStyle('display', 'none');
				this.collapseRow(index);
			}
		}
	},

	/**
	 * @access private
	 */
	initData : function(ds, cm) {
		Ext.ux.maximgb.treegrid.GridView.superclass.initData.call(this, ds, cm);
		if (this.ds) {
			this.ds.un('activenodechange', this.onStoreActiveNodeChange, this);
			this.ds.un('expandnode', this.onStoreExpandNode, this);
			this.ds.un('collapsenode', this.onStoreCollapseNode, this);
		}
		if (ds) {
			ds.on('activenodechange', this.onStoreActiveNodeChange, this);
			ds.on('expandnode', this.onStoreExpandNode, this);
			ds.on('collapsenode', this.onStoreCollapseNode, this);
		}
	},

	onStoreActiveNodeChange : function(store, old_rc, new_rc) {
		var parents, i, len, rec, items = [], ts = this.templates;

		if (new_rc) {
			parents = this.ds.getNodeAncestors(new_rc), parents.reverse();
			parents.push(new_rc);

			for (i = 0, len = parents.length; i < len; i++) {
				rec = parents[i];
				items.push(ts.brd_item.apply({
					id : rec.id,
					title : this.grid.i18n.breadcrumbs_tip,
					caption : rec.get(this.cm.getDataIndex(this.cm.getIndexById(this.grid.master_column_id)))
				}));
			}

			this.breadcrumbs_el.update(this.grid.i18n.path_separator + ts.brd_item.apply({
				id : '',
				title : this.grid.i18n.breadcrumbs_root_tip,
				caption : this.grid.root_title
			}) + this.grid.i18n.path_separator + items.join(this.grid.i18n.path_separator));
		} else {
			this.setRootBreadcrumbs();
		}
	},

	setRootBreadcrumbs : function() {
		var ts = this.templates;
		this.breadcrumbs_el.update(this.grid.i18n.path_separator + ts.brd_item.apply({
			id : '',
			title : this.grid.i18n.breadcrumbs_root_tip,
			caption : this.grid.root_title
		}));
	},

	onLoad : function(store, records, options) {
		var id = store.getLoadedNodeIdFromOptions(options);
		if (id === null) {
			Ext.ux.maximgb.treegrid.GridView.superclass.onLoad.call(this, store, records, options);
		}
	},

	onStoreExpandNode : function(store, rc) {
		this.expandRow(rc);
	},

	onStoreCollapseNode : function(store, rc) {
		this.collapseRow(rc);
	}
});

Ext.ux.maximgb.treegrid.GridPanel = Ext.extend(Ext.ui.XGridPanel, {
	/**
	 * @cfg {String|Integer} master_column_id Master column id. Master column
	 *      cells are nested. Master column cell values are used to build
	 *      breadcrumbs.
	 */
	master_column_id : 0,

	/**
	 * @cfg {String} Root node title.
	 */
	root_title : null,

	/**
	 * @cfg {Object} i18n I18N text strings.
	 */
	i18n : null,

	// Private
	initComponent : function() {
		Ext.ux.maximgb.treegrid.GridPanel.superclass.initComponent.call(this);

		Ext.applyIf(this.i18n, Ext.ux.maximgb.treegrid.GridPanel.prototype.i18n);

		if (!this.root_title) {
			this.root_title = this.title || this.i18n.root_title;
		}

		this.getSelectionModel().on('selectionchange', this.onTreeGridSelectionChange, this);
	},

	/**
	 * Returns view instance.
	 * 
	 * @access private
	 * @return {GridView}
	 */
	getView : function() {
		if (!this.view) {
			this.view = new Ext.ux.maximgb.treegrid.GridView(this.viewConfig);
		}
		return this.view;
	},

	/**
	 * @access private
	 */
	onClick : function(e) {
		var target = e.getTarget(), view = this.getView(), row = view.findRowIndex(target), store = this.getStore(), sm = this.getSelectionModel(), record, record_id, do_default = true;

		// Row click
		if (row !== false) {
			if (Ext.fly(target).hasClass('ux-maximgb-treegrid-elbow-active')) {
				record = store.getAt(row);
				if (store.isExpandedNode(record)) {
					store.collapseNode(record);
				} else {
					store.expandNode(record);
				}
				do_default = false;
			}
		}
		// Breadcrumb click
		else if (Ext.fly(target).hasClass('ux-maximgb-treegrid-brditem')) {
			record_id = Ext.id(target);
			record_id = record_id.substr(record_id.lastIndexOf('-') + 1);
			if (record_id != '') {
				record = store.getById(record_id);
				row = store.indexOf(record);

				if (e.hasModifier()) {
					if (store.isExpandedNode(record)) {
						store.collapseNode(record);
					} else {
						store.expandNode(record);
					}
				} else if (sm.isSelected && !sm.isSelected(row)) {
					sm.selectRow(row);
				}
			} else {
				sm.clearSelections();
			}
			e.preventDefault();
		}

		if (do_default) {
			Ext.ux.maximgb.treegrid.GridPanel.superclass.onClick.call(this, e);
		}
	},

	/**
	 * @access private
	 */
	onMouseDown : function(e) {
		var target = e.getTarget();

		if (!Ext.fly(target).hasClass('ux-maximgb-treegrid-elbow-active')) {
			Ext.ux.maximgb.treegrid.GridPanel.superclass.onMouseDown.call(this, e);
		}
	},

	/**
	 * @access private
	 */
	onDblClick : function(e) {
		var target = e.getTarget(), view = this.getView(), row = view.findRowIndex(target), store = this.getStore(), sm = this.getSelectionModel(), record, record_id;

		// Breadcrumbs select + expand/collapse
		if (!row && Ext.fly(target).hasClass('ux-maximgb-treegrid-brditem')) {
			record_id = Ext.id(target);
			record_id = record_id.substr(record_id.lastIndexOf('-') + 1);
			if (record_id != '') {
				record = store.getById(record_id);
				row = store.indexOf(record);

				if (store.isExpandedNode(record)) {
					store.collapseNode(record);
				} else {
					store.expandNode(record);
				}

				if (sm.isSelected && !sm.isSelected(row)) {
					sm.selectRow(row);
				}
			} else {
				sm.clearSelections();
			}
		}

		Ext.ux.maximgb.treegrid.GridPanel.superclass.onDblClick.call(this, e);
	},

	/**
	 * @access private
	 */
	onTreeGridSelectionChange : function(sm, selection) {
		var record;
		// Row selection model
		if (sm.getSelected) {
			record = sm.getSelected();
			this.getStore().setActiveNode(record);
		}
		// Cell selection model
		else if (Ext.type(selection) == 'array' && selection.length > 0) {
			record = store.getAt(selection[0])
			this.getStore().setActiveNode(record);
		} else {
			throw "Unknown selection model applyed to the grid.";
		}
	}
});

Ext.ux.maximgb.treegrid.GridPanel.prototype.i18n = {
	path_separator : ' / ',
	root_title : '[root]',
	breadcrumbs_tip : 'Click to select node, CTRL+Click to expand or collapse node, Double click to select and expand or collapse node.',
	breadcrumbs_root_tip : 'Click to select the top level node.'
}

/**
 * Paging toolbar for work this AbstractTreeStore.
 */
Ext.ux.maximgb.treegrid.PagingToolbar = Ext.extend(Ext.PagingToolbar, {
	onRender : function(ct, position) {
		Ext.ux.maximgb.treegrid.PagingToolbar.superclass.onRender.call(this, ct, position);
		this.updateUI();
	},

	getPageData : function() {
		var total = 0, cursor = 0;
		if (this.store) {
			cursor = this.store.getActiveNodePageOffset();
			total = this.store.getActiveNodeTotalCount();
		}
		return {
			total : total,
			activePage : Math.ceil((cursor + this.pageSize) / this.pageSize),
			pages : total < this.pageSize ? 1 : Math.ceil(total / this.pageSize)
		};
	},

	updateInfo : function() {
		var count = 0, cursor = 0, total = 0, msg;
		if (this.displayEl) {
			if (this.store) {
				cursor = this.store.getActiveNodePageOffset();
				count = this.store.getActiveNodeCount();
				total = this.store.getActiveNodeTotalCount();
			}
			msg = count == 0 ? this.emptyMsg : String.format(this.displayMsg, cursor + 1, cursor + count, total);
			this.displayEl.update(msg);
		}
	},

	updateUI : function() {
		var d = this.getPageData(), ap = d.activePage, ps = d.pages;
		this.afterTextItem.setText( String.format(this.afterPageText, d.pages));
		this.inputItem.setValue(ap);
		this.first.setDisabled(ap == 1);
		this.prev.setDisabled(ap == 1);
		this.next.setDisabled(ap == ps);
		this.last.setDisabled(ap == ps);
		this.refresh.enable();
		this.updateInfo();
	},

	unbind : function(store) {
		Ext.ux.maximgb.treegrid.PagingToolbar.superclass.unbind.call(this, store);
		store.un('activenodechange', this.onStoreActiveNodeChange, this);
	},

	bind : function(store) {
		Ext.ux.maximgb.treegrid.PagingToolbar.superclass.bind.call(this, store);
		store.on('activenodechange', this.onStoreActiveNodeChange, this);
	},

	beforeLoad : function(store, options) {
		Ext.ux.maximgb.treegrid.PagingToolbar.superclass.beforeLoad.call(this, store, options);
		if (options && options.params) {			
			var names=this.getParams();
			if (options.params[names.start] === undefined) {
				options.params[names.start] = 0;
			}
			if (options.params[names.limit] === undefined) {
				options.params[names.limit] = this.pageSize;
			}
		}
	},

	onClick : function(which) {
		var store = this.store, cursor = store ? store.getActiveNodePageOffset() : 0, total = store ? store.getActiveNodeTotalCount() : 0;

		switch (which) {
			case "first" :
				this.doLoad(0);
				break;
			case "prev" :
				this.doLoad(Math.max(0, cursor - this.pageSize));
				break;
			case "next" :
				this.doLoad(cursor + this.pageSize);
				break;
			case "last" :
				var extra = total % this.pageSize;
				var lastStart = extra ? (total - extra) : total - this.pageSize;
				this.doLoad(lastStart);
				break;
			case "refresh" :
				this.doLoad(cursor);
				break;
		}
	},

	onStoreActiveNodeChange : function(store, old_rec, new_rec) {
		if (this.rendered) {
			this.updateUI();
		}
	}
});

Ext.ui.TreeGrid = Ext.extend(Ext.ux.maximgb.treegrid.GridPanel, {
	createPagingToolbar : function(pagingConfig, store) {
		var bar = new Ext.ux.maximgb.treegrid.PagingToolbar(Ext.apply({
			pageSize : 50,
			store : store,
			autoLoad : true,
			displayInfo : true
		}, pagingConfig));
		return bar;
	},
	createStore : function(storeConfig) {
		return new Ext.ux.maximgb.treegrid.AdjacencyListStore(storeConfig);
	}
});

Ext.reg('treegrid', Ext.ui.TreeGrid);
Ext.ns("Ext.ui");

/**
 * 润乾报表Panel
 */
Ext.ui.ReportPanel = Ext.extend(Ext.ui.IPanel, {
			/**
			 * @cfg {String} 报表文件名称(不包含扩展名)
			 */
			reportName : null,
			initComponent : function() {
				Ext.ui.ReportPanel.superclass.initComponent.call(this);

			},
			afterRender : function() {
				Ext.ui.ReportPanel.superclass.afterRender.call(this);
				this.mask = new Ext.LoadMask(this.getEl(), '报表加载中...');
				this.on('load', function() {
							this.mask.hide();
						}, this);
			},
			/**
			 * 加载报表
			 * 
			 * @param {Object}
			 *            配置
			 */
			load : function(options) {
				options = options || {};
				options.params = options.params || {};
				var url = String.format('{0}?reportName={1}&{2}', Ext.url('/reportView/ReportView.jsp'), this.reportName, Ext.urlEncode(options.params));
				this.mask.show();
				this.loadPage(url, options.callback || Ext.emptyFn());

			}
		});Ext.layout.ColumnFieldLayout = Ext.extend(Ext.layout.ContainerLayout, {
			// private
			monitorResize : true,

			/**
			 * @cfg {String} extraCls An optional extra CSS class that will be
			 *      added to the container (defaults to 'x-column'). This can be
			 *      useful for adding customized styles to the container or any
			 *      of its children using standard CSS rules.
			 */
			extraCls : '',

			scrollOffset : 0,

			// private
			isValidParent : function(c, target) {
				return true;
			},

			fieldAdjustWidth : function(tag, w) {
				return w;
			},
			// private
			renderItem : function(c, position, target) {
				if (c && !c.rendered) {
					var pos = target.dom.childNodes[position];
					c._wrapper = target.createChild({
								tag : "div",
								style : 'text-align:center;',
								cls : 'x-column'
							}).insertBefore(pos);
				}
				if (c instanceof Ext.form.Field) {
					c.adjustWidth = this.fieldAdjustWidth;
				}
				if (c instanceof Ext.form.Hidden) {
					c.width = 0;
					Ext.layout.ColumnFieldLayout.superclass.renderItem.call(this, c, position, target);
				} else {
					Ext.layout.ColumnFieldLayout.superclass.renderItem.call(this, c, 0, c._wrapper);
				}
				// store some layout-specific calculations
				c.columnFit = {
					hasAbsWidth : false, // whether the component has
					// absolute height
					// (in pixels)
					relWidth : 0, // relative height, in pixels (if
					// applicable)
					calcRelWidth : 0, // calculated relative height (used when
					// element
					// is resized)
					calcAbsWidth : 0
					// calculated absolute height
				};
				// handle the button

				if (c instanceof Ext.Button) {
					c.width = c.getEl().getWidth();
				}

				// process height config option
				if (typeof c.width == 'number') {
					// set absolute height
					if (c.setWidth) {
						c.setWidth(c.width - c.getEl().getMargins('lr'));
					}
					c.columnFit.hasAbsWidth = true;

				} else if (typeof c.width == "string" && c.width.indexOf("%")) {
					// store relative (given in percent) height
					c.columnFit.relWidth = parseInt(c.width);
				}
			},

			// private
			onLayout : function(ct, target) {
				var cs = ct.items.items, len = cs.length, c, i, maxHeight = 0;

				if (!this.innerCt) {
					target.addClass('x-column-layout-ct');

					// the innerCt prevents wrapping and shuffling while
					// the container is resizing
					this.innerCt = target.createChild({
								cls : 'x-column-inner',
								style : 'zoom:1;'
							});
					this.innerCt.createChild({
								cls : 'x-clear'
							});
				}
				var size = Ext.isIE && target.dom != Ext.getBody().dom ? target.getStyleSize() : target.getViewSize();
				this.renderAll(ct, this.innerCt);

				if (size.width < 1 && size.height < 1) { // display none?
					return;
				}
				var w = size.width - target.getPadding('lr') - this.scrollOffset, h = size.height - target.getPadding('tb'), pw = w;

				this.innerCt.setWidth(w);
				// some columns can be percentages while others are fixed
				// so we need to make 2 passes
				var noWidthCount = 0, relWidthSum = 0, percentage = 100;
				for (i = 0; i < len; i++) {
					c = cs[i];
					if (c.columnFit.hasAbsWidth) {
						pw -= ((c.getSize ? c.getSize().width : c.getEl().getWidth()) + c.getEl().getMargins('lr'));
					} else {
						if (!c.columnFit.relWidth) {
							noWidthCount++;
						}
					}
				}
				pw = pw < 0 ? 0 : pw;

				// sum the reWidth
				for (i = 0; i < len; i++) {
					c = cs[i];
					if (c.columnFit.relWidth) {
						relWidthSum += c.columnFit.relWidth;
					}

					// count maxHeight
					maxHeight = Math.max(c.getSize ? c.getSize().height : 0, maxHeight);
				}

				// alert(maxHeight);
				// juge percentage great then 100% if so
				if (relWidthSum > percentage) {
					percentage = relWidthSum;
				}
				// count rest width
				var freeWidth = pw - Math.floor(relWidthSum / percentage * pw);

				for (i = 0; i < len; i++) {
					c = cs[i];
					if (!c.columnFit.hasAbsWidth) {
						if (c.columnFit.relWidth) {
							c.setSize(Math.floor(c.columnFit.relWidth / percentage * pw) - c.getEl().getMargins('lr'), undefined);
						} else {
							if (freeWidth) {
								c.setSize(Math.floor(freeWidth / noWidthCount) - c.getEl().getMargins('lr'), undefined);
							}
						}
					} else {
						// c.setSize(undefined, h);
					}
					if (c._wrapper && c._wrapper.getHeight() < maxHeight) {
						// c._wrapper.setHeight(maxHeight);
					}

				}

			}

		});

Ext.Container.LAYOUTS['columnfield'] = Ext.layout.ColumnFieldLayout;

Ext.ns("Ext.ui");
Ext.ui.Spacer = Ext.extend(Ext.BoxComponent, {
			autoEl : {
				tag : 'div',
				html : '&nbsp;'
			},
			width : 3
		});

Ext.reg('spacer', Ext.ui.Spacer);
Ext.ui.ColumnField = Ext.extend(Ext.Container, {
			isFormField : true,
			autoEl : {
				tag : "div",
				'cls' : 'x-form-field',
				style : '_zoom:1;'
			},
			// private
			adjustSize : function(w, h) {
				var s = Ext.form.Field.superclass.adjustSize.call(this, w, h);
				s.width = this.adjustWidth(this.el.dom.tagName, s.width);
				return s;
			},
			// 3px bug for ie
			adjustWidth : function(tag, w) {
				if (typeof w == 'number' && !Ext.isWebKit) {
					if (Ext.isIE) {
						if (!Ext.isStrict) {
							return w - 3;
						}
						if (Ext.isStrict) {
							return w - (Ext.isIE6 ? 4 : 1);
						}

					}
				}
				return w;
			},
			layout : 'columnfield',
			isValid : function() {
				var valid = true;
				this.items.each(function(f) {
							if (!f.validate()) {
								valid = false;
							}
						});
				return valid;
			},
			validate : function() {
				var valid = true;
				this.items.each(function(f) {
							if (f.isFormField && !f.validate()) {
								valid = false;
							}
						});
				return valid;
			},
			reset : function() {
				this.items.each(function(f) {
							if (f.reset) {
								f.reset();
							}
						});
			},
			findField : function(id) {
				var field = this.items.get(id);
				if (!(field && typeof field == 'object')) {
					this.items.each(function(f) {
								if (f.isFormField && (f.dataIndex == id || f.id == id || f.getName() == id)) {
									field = f;
									return false;
								}
							});
				}
				return field;
			},
			disable : function() {
				this.items.each(function(f) {
							f.disable();
						});

			},
			enable : function() {
				this.items.each(function(f) {
							f.enable();
						});
			}
		});

Ext.reg('columnfield', Ext.ui.ColumnField);
Ext.ns("Ext.ui");

Ext.ui.LogPanel = Ext.extend(Ext.Panel, {
			cacheSize : 100,
			bodyStyle : 'background-color:black;overflow:auto;padding:3 5 5 3;',
			initComponent : function() {
				var me=this;
				if (!this.logTpl) {
					this.logTpl = new Ext.XTemplate(
					'<tpl for="logs">',
					    '<p style="color:#0c0;font-size: 12px;line-height: 16px;font-weight: 400;font-family: \'Inconsolata\',Courier,sans-serif;">{.}</p>',
					'</tpl>'
					);
				}
				
				this.bbar=['->','-',
					{
					  iconCls:'lock',
					  enableToggle:true,
					  toggleHandler:function(bt,st){
					     if(st){
					        me.lock();
					     }else{
					        me.unlock();
					     }
					  } 
					},'-',{
					   iconCls:'del',
					   handler:function(){
					      me.clear();
					   }
					
					}
				];
				Ext.ui.LogPanel.superclass.initComponent.apply(this, arguments);

			},
			lock:function(){
			    this.islock=true;
			},			
			unlock:function(){			
				this.islock=false;
			},
			clear : function() {
				this.body.update('');
				this.logCounter=0;
			},
			log : function() {
				if (arguments.length == 1) {
					var arg = arguments[0];
					if (Ext.isArray(arg)) {
						this.appendLog(arg);
					} else {
						arg = [arg];
					}
					this.appendLog(arg);
				} else {
					this.appendLog([].slice.call(arguments, 0));
				}

			},
			logCounter : 0,
			appendLog : function(logs) {
				if(this.islock===true && this.logCounter >= this.cacheSize){
				  return;
				}
				this.logTpl.append(this.body, {
							logs : logs
						});
				this.logCounter = this.logCounter + logs.length;
				this.trimLog();
				this.scrollToButtom();

			},
			scrollToButtom : function() {
				var bd = this.body.dom;
				if (bd.scrollHeight && this.islock!==true) {
					bd.scrollTop = bd.scrollHeight;
				}
			},
			trimLog : function(len) {
				len = this.logCounter - this.cacheSize;
				// extra delete mount for perfermance
				var extra=2;
				if (len>0) {					
					var bd = this.body.dom;
					for (var i = 0; i < len+extra; i++) {
						bd.removeChild(bd.firstChild);
					}
					this.logCounter=this.logCounter-(len+extra);
				}
			}

		});

Ext.reg("logpanel", Ext.ui.LogPanel);Ext.define("Ext.ui.GalleryPanel", {
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