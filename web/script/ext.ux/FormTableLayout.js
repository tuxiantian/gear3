Ext.layout.FormTableLayout=Ext.extend(Ext.layout.TableLayout,{
	labelSeparator : ':',
	getAnchorViewSize : function(ct, target){
        var size=ct.body.getStyleSize();
        var num=this.layoutConfig?this.layoutConfig.columns:1;
        size.width=size.width/num;
        return size;
    },
    onLayout : function(ct, target){
    	Ext.layout.FormTableLayout.superclass.onLayout.call(this, ct,target);
    	this.table.width="100%";
    	Ext.layout.FormLayout.superclass.onLayout.call(this, ct,target);
    },
    parseAnchor :Ext.layout.FormLayout.superclass.parseAnchor,
    setContainer : function(ct){
        Ext.layout.FormTableLayout.superclass.setContainer.call(this, ct);
        if(ct.labelAlign){
            ct.addClass('x-form-label-'+ct.labelAlign);
        }
        if(ct.hideLabels){
            this.labelStyle = "display:none";
            this.elementStyle = "padding-left:0;";
            this.labelAdjust = 0;
        }else{
            this.labelSeparator = ct.labelSeparator || this.labelSeparator;
            if(typeof ct.labelWidth == 'number'){
                var pad = (typeof ct.labelPad == 'number' ? ct.labelPad : 5);
                this.labelAdjust = ct.labelWidth+pad;
                this.labelStyle = "width:"+ct.labelWidth+"px";
                this.elementStyle = "padding-left:"+(ct.labelWidth+pad)+'px';
            }
            if(ct.labelAlign == 'top'){
                this.labelStyle = "width:auto;";
                this.labelAdjust = 0;
                this.elementStyle = "padding-left:0;";
            }
        }
        if(!this.fieldTpl){
            var t = new Ext.Template(
                '<div class="x-form-item {5}" tabIndex="-1">',
                    '<label for="{0}" style="{2}" class="x-form-item-label">{1}{4}</label>',
                    '<div class="x-form-element" id="x-form-el-{0}" style="{3}"></div>',
                    '<div class="{6}"></div>',
                '</div>'
            );
            t.disableFormats = true;
            t.compile();
            Ext.layout.FormTableLayout.prototype.fieldTpl = t;
        }
    },
	renderItem : function(c, position, target){
		if(c && !c.rendered && c.isFormField && c.inputType != 'hidden'){
            var args = [
                   c.id, c.fieldLabel,
                   c.labelStyle||this.labelStyle||'',
                   this.elementStyle||'',
                   typeof c.labelSeparator == 'undefined' ? this.labelSeparator : c.labelSeparator,
                   (c.itemCls||this.container.itemCls||'') + (c.hideLabel ? ' x-hide-label' : ''),
                   c.clearCls || 'x-form-clear-left' 
            ];
            if(typeof position == 'number'){
                position = target.dom.childNodes[position] || null;
            }
			var td=this.getNextCell(c);
            this.fieldTpl.append(td, args);
            c.render('x-form-el-'+c.id);
            delete td;
        }else {
            Ext.layout.FormTableLayout.superclass.renderItem.apply(this, arguments);
        }
    },
    adjustWidthAnchor : function(value, comp){
        return value - (comp.hideLabel ? 0 : this.labelAdjust);
    }
});
Ext.Container.LAYOUTS['formtable'] = Ext.layout.FormTableLayout;