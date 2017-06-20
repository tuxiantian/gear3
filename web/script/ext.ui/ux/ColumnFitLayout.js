Ext.layout.ColumnFitLayout = Ext.extend(Ext.layout.ContainerLayout, {
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

Ext.Container.LAYOUTS['columnfit'] = Ext.layout.ColumnFitLayout;