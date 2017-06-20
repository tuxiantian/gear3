Ext.namespace('Ext.ux.grid');

/**
 * 根据
 * @class Ext.ux.Andrie.pPageSize 
 * @version 0.1.1
 * 改写成 Ext.ux.grid.PageSize
 *
 * Gong Yungui 2007.12.15
 */
Ext.ux.grid.PageSize = function(config){
	Ext.apply(this, config);
};

Ext.extend(Ext.ux.grid.PageSize, Ext.util.Observable, {
	/** 
   	 * @cfg {Array} sizes 
     * An array of pageSize choices to populate the comboBox with 
     */ 
	sizes: [[10],[20],[50],[100],[200],[500]],
	
	init: function(pagingToolbar){
		this.pagingToolbar = pagingToolbar;
		this.pagingToolbar.on('render', this.onRender, this);
	},
	
	changePageSize:function(combo){
		//zlh 2008-08-25 修改，每页N行如果选择的是原值就不要刷新(不管外部条件的变化)		
		var lastPageSize=this.pagingToolbar.pageSize;
		
		this.pagingToolbar.pageSize = parseInt(combo.getValue());
		//this.pagingToolbar.doLoad(0);//zlh 2008-08-25 屏蔽
		
		if (lastPageSize==this.pagingToolbar.pageSize){
			//不执行刷新
		}else{
			this.pagingToolbar.doLoad(0);//执行刷新
		}
		// end
	},
	
	//private
	onRender: function(){
		Ext.apply(this.config,this.comboCfg);
		this.combo = new Ext.form.ComboBox({
			store:new Ext.data.SimpleStore({
				fields:['pageSize'],
				data:this.sizes
				}),			
			displayField:'pageSize',
			valueField:'pageSize',
			emptyText: this.pageSize,	
			editable:false,
			typeAhead: true,
			clearTrigger:false,
			triggerAction:'all',
			mode:'local',
			value: this.pagingToolbar.pageSize,
			width:45
			});
		this.combo.on('select', this.changePageSize, this);		
		this.pagingToolbar.add('-','每页',this.combo,'行','-');
	}
})