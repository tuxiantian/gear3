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
