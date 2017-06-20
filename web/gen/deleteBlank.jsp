<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>去空白行</title>
<%@ include file="/common/pureExt.jsp"%>
<script src="js/papaparse.min.js">
</script>


</head>
<body>

	<script>
		var columns = 12;
		var fields = [];
		var ch = 65;
		for ( var i = 0; i < columns; i++) {
			fields.push({
				name : String.fromCharCode(ch + i),
				header : String.fromCharCode(ch + i),
				editor : new Ext.form.TextField({})
			});
		}
		var postionName=fields[0].name;
		var partName=fields[2].name;	
		
		function isBlank(p){			
			if(typeof p=='string'){				
				return Ext.isEmpty(p.trim());
			}			
			 return Ext.isEmpty(p);						
		}
		function blankDefault(test,defaultValue){
			return isBlank(test)?defaultValue||'':test;			
		}		
		
		function mergeAll(rs){			
			var i=0,lastRow,currentRow,newRs=[];

			//debugger;
			for(i=0;i<rs.length;i++){
				 currentRow=rs[i];				 
				 if(lastRow && isBlank(currentRow[postionName])){
					   // 根据第1列是否有位置 	
					   //无位置合并	到上一行				    
					   	mergeFilledCell(currentRow,lastRow);
					     continue;
				 }	 
				 newRs.push(currentRow);
				 lastRow=currentRow;				
			}
			return newRs;
		}
			
	  function deleteNoPostionWidthPartDes(rs){
		     var newRs=[],continueBreaked=false;
		     // 删除开始没有位置的行
		     for(var i=0;i<rs.length;i++){				    	 
		    	 if(!continueBreaked && isBlank(rs[i][postionName])){
		    		 continue;
		    	 }else{
		    		 continueBreaked=true;
		    	 }
		    	 if(continueBreaked){
		    		 newRs.push(rs[i]);		    		 
		    	 }		    	 	
		    	 
		     }
		     
		  
		     
		     // 删除颜色无位置的描述
		     rs=newRs;
		     newRs=[];
		     for(i=0;i<rs.length;i++){
		    	 if(isBlank(rs[i][postionName]) && !isBlank(rs[i][partName])){
		    		 
		    	 }else{		    		 
		    		 newRs.push(rs[i]);
		    	 }	 
		     }
		     
		     return newRs;
		  
	  }
	  
		
		function mergeFilledCell(from ,to){
	    	for(var j=3;j<fields.length;j++){
	    		if(!isBlank(from[fields[j].name])){					    			
	    			to[fields[j].name]=blankDefault(to[fields[j].name]) +"\r\n"+ blankDefault(from[fields[j].name]);
	    		}					    		
	    	}			
		}
		
		function recordToObjec(r){			
			return Ext.apply({},r.data);
		}
		
		function recordsToObjects(rs){			
			var objs=[];
			for(var i=0;i<rs.length;i++){
				objs.push(recordToObjec(rs[i]))
			}
			return objs;
		}
		
		
		new Ext.Viewport({
			width : 800,
			height : 400,
			title : '超级表格',
			layout : 'fit',
			items : [ new Ext.grid.EditorPasteCopyGridPanel({
				id : 'insertTest',
				hideRowNumberer : false,
				fields : fields,
				storeConfig : {
					data : [ {
						A : ''
					} ]
				},
				tbar : [ {
					text : '复制',
					handler : function(bt) {
						var grid= Ext.getCmp('insertTest');
						var rs=grid.store.getRange();
						var ar=[];					
						for(var i=0;i<rs.length;i++){
							var tmp=[];
							for(var j=0;j<fields.length;j++){								
								tmp.push(rs[i].get(fields[j].name));
							}
							ar.push(tmp);
						}
						var cvs=Papa.unparse(ar,{
							skipEmptyLines: true,
							delimiter: "\t",
							quotes: true,
							header:false,
							newline: "\n"
						});
						//console.log(cvs);						
						new Ext.Window({
							width:600,
							height:300,
							layout:'fit',
							items:[{
								xtype:'textarea',
							   value:	cvs
							}]
							
						}).show();
					}

				} , {
					text : '合并',
					handler : function(bt) {
						var grid= Ext.getCmp('insertTest');
						grid.store.remove(grid.store.getAt(0));
						var rs=grid.store.getRange();
						var merged=mergeAll(deleteNoPostionWidthPartDes(recordsToObjects(rs)));
						grid.store.removeAll();
						for(var i=0;i<merged.length;i++){
							grid.insertLast(merged[i]);
						}						
					
					}
				} , {
					text : '清空',
					handler : function(bt) {
						var grid= Ext.getCmp('insertTest');
						grid.store.removeAll();
						grid.insertFirst({});
					}

				}]
			}) ]
		});
	</script>

</body>
</html>