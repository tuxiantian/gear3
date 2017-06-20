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
Ext.reg('asynctreepanel', Ext.ui.AsyncTreePanel);