<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<head>
<title>SuperBoxSelect Examples (Ext 3.2)</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../DisplayField.js"></script>
		<script type="text/javascript" src="../../SuperBoxSelect.js"></script>
		
<style type="text/css">
	body {
		font:13px/1.3 arial,helvetica,clean,sans-serif;
		*font-size:small;
		*font:x-small;
		padding: 20px !important;
	}
	#page {
		width: 700px;
	}
	p {
		color: #333;
		margin-bottom: 7px;
		font-size: 14px;
	}
	form p {
		margin-top: 7px;
	}
	code {
		color: #000;
	}
	#intro p {
		color: #000;
		font-size: 15px;
		margin-bottom: 20px;
	}
	h1 {
		font-size: 1.6em;
		line-height: 2.0em;
		margin-bottom: 0.8em;
	}
	h2 {
		font-size: 1.2em;
		line-height: 1.6em;
		margin-bottom: 0.6em;
	}
	.exForm{
		padding: 20px 20px 20px 0px;
		font-size: 12px;
	}
	.x-tag {
		color: #693;
		background-image: url(tag_green.gif);
		background-repeat: no-repeat;
		background-position:  2px center;
		padding-left: 17px !important;
		*text-indent: 17px !important;
    }
	.x-flag{
        background-image: url(libs/ext-2.2.1/resources/images/default/s.gif);
        background-repeat: no-repeat;
        background-position:  2px center;
        text-indent: 17px !important;
    }
	body.ext-ie6 .x-flag .x-superboxselect-item-close {
		top: 4px;
		right: 2px;
	}
    .x-flag-au{
        background-image: url(flags/Australia.png);
		
    }
    .x-flag-at{
        background-image: url(flags/Austria.png);
    }
    .x-flag-ca{
        background-image: url(flags/Canada.png);
    }
    .x-flag-fr{
        background-image: url(flags/France.png);
    }
    .x-flag-it{
        background-image: url(flags/Italy.png);
    }
    .x-flag-jp{
        background-image: url(flags/Japan.png);
    }
    .x-flag-nz{
        background-image: url("flags/New Zealand.png");
    }
    .x-flag-us{
        background-image: url(flags/USA.png);
    }

	.small {
		font-size: small;
	}
	
	#f2Form .x-superboxselect-item-focus {
		color: #fff;
	}
	
</style>
    <script type="text/javascript">
	
	
    var tempIdCounter = 0;
	Ext.BLANK_IMAGE_URL = 'http://static.technomedia.co.uk/libs/ext-3.2.0/resources/images/default/s.gif';

    Ext.onReady(function() {
        
        Ext.QuickTips.init();

        var states = new Ext.data.SimpleStore({
            fields: ['abbr', 'state', 'nick', 'cls'],
            data: Ext.exampledata.states,
            sortInfo: {field: 'state', direction: 'ASC'}
        });
        
		
		
		var sbs1 = new Ext.ux.form.SuperBoxSelect({
	        allowBlank:false,
	        id:'selector1',
	        xtype:'superboxselect',
	        fieldLabel: 'States',
	        emptyText: 'Select some US States',
	        resizable: true,
	        name: 'states',
	        anchor:'100%',
	        store: states,
	        mode: 'local',
	        displayField: 'state',
	        displayFieldTpl: '{state} ({abbr})',
	        valueField: 'abbr',
	        value: 'CA,NY',
	        forceSelection : true,
			allowQueryAll : false,
			listeners : {
		        render : function(sbs){
			        sbs.wrapEl.on('contextmenu', function(ev,h,o){
						ev.stopEvent();
						var rec = sbs.findSelectedRecord(h),
						    i = sbs.findSelectedItem(h),
							n = rec.get('abbr');
						var ctxMenu = new Ext.menu.Menu({
							items:[{
								text : 'Action 1 on ' + n 
							},
							{
                                text : 'Action 2 on ' + n
                            }]
						});
						ctxMenu.showAt([ev.getPageX(), ev.getPageY()]);
					},sbs,{
						delegate : 'li.x-superboxselect-item'
					});		
				}  	
		    }
	    });
		
      	var form1 = new Ext.form.FormPanel({
            id:'f1Form',
			renderTo: 'f1',
            title:'Base Functionality',
            autoHeight: true,
			bodyStyle: 'padding:50px;',
			width: 700,
            items: [sbs1],
			buttons: [{
                text: "setValue('AK,NY,CO')",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector1').setValue('AK,NY,CO');
                }
            },{
                text: 'getValue()',
                scope: this,
                handler: function(){
                    alert(Ext.getCmp('selector1').getValue());
                }
            }, {
                text: 'BasicForm.getValues()',
                scope: this,
                handler: function(){
                    var v = form1.getForm().getValues(true);
                    alert(v);
                }
            },{
                text: "reset",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector1').reset();
                }
            },{
                text: "disable",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector1').disable();
                }
            },{
                text: "enable",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector1').enable();
                }
            }]
        });
        
		new Ext.ToolTip({
		    target : sbs1.wrapEl,
		    delegate : 'li.x-superboxselect-item',
		    trackMouse : true,
		    renderTo : document.body,
		    listeners : {
		        'beforeshow' : {
		           fn : function(tip) {
		                var rec = sbs1.findSelectedRecord(tip.triggerElement);
		                tip.body.dom.innerHTML = rec.get('nick');
		           },
		           scope : this
		       }
		    }
		});
		var tagStore = new Ext.data.SimpleStore({
            fields: ['id', 'name'],
            data: [['Architecture','Architecture'],['Sport','Sport'],['Science','Science'],['Nature','Nature'],['Technology','Technology'],['Travel','Travel']],
            sortInfo: {field: 'name', direction: 'ASC'}
        });

		var form2 = new Ext.form.FormPanel({
            id:'f2Form',
			renderTo: 'f2',
            title:'Allowing New Data',
            autoHeight: true,
			bodyStyle: 'padding:50px;',
			width: 700,
            items: [{
				allowBlank:false,
				msgTarget: 'under',
                allowAddNewData: true,
                id:'selector2',
                xtype:'superboxselect',
				addNewDataOnBlur : true, 
                fieldLabel: 'Tags',
                emptyText: 'Enter or select the category tags',
                resizable: true,
                name: 'tags',
                anchor:'100%',
                store: tagStore,
                mode: 'local',
                displayField: 'name',
                valueField: 'id',
                extraItemCls: 'x-tag',
                listeners: {
                    beforeadditem: function(bs,v){
                        //console.log('beforeadditem:', v);
                        //return false;
                    },
                    additem: function(bs,v){
                        //console.log('additem:', v);
                    },
                    beforeremoveitem: function(bs,v){
                        //console.log('beforeremoveitem:', v);
                        //return false;
                    },
                    removeitem: function(bs,v){
                        //console.log('removeitem:', v);
                    },
                    newitem: function(bs,v, f){
						//console.log(f);
                        v = v.slice(0,1).toUpperCase() + v.slice(1).toLowerCase();
                        var newObj = {
                            id: v,
                            name: v
                        };
                        bs.addItem(newObj);
                    }
                }
             }
            ],
			buttons: [{
                text: "Add Existing Tag (addItem)",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector2').addItem({id:'Travel', name:'Travel'});
                }
            },{
                text: "Add New Tag (addItem)",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector2').addItem({id:'Beauty', name:'Beauty'});
                }
            },{
                text: "Set New Values (setValueEx)",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector2').setValueEx([{id:'Finance', name:'Finance'},{id:'Gardening', name:'Gardening'}]);
                }
            },{
                text: 'getValue()',
                scope: this,
                handler: function(){
                    alert(Ext.getCmp('selector2').getValue());
                }
            },{
                text: "reset",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector2').reset();
                }
            }]
        });

		var countryData = [
	        ['AU', 'Australia','x-flag-au','font-style:italic'],
	        ['AT', 'Austria', 'x-flag-at',''],
	        ['CA', 'Canada', 'x-flag-ca',''],
	        ['FR', 'France', 'x-flag-fr',''],
	        ['IT', 'Italy', 'x-flag-it',''],
	        ['JP', 'Japan', 'x-flag-jp',''],
	        ['NZ', 'New Zealand', 'x-flag-nz',''],
	        ['US', 'USA', 'x-flag-us','']
	    ];

		var countryStore = new Ext.data.SimpleStore({
            fields: ['code', 'name', 'cls', 'style'],
            data: countryData,
            sortInfo: {field: 'name', direction: 'ASC'}
        });

		var form3 = new Ext.form.FormPanel({
            id:'f3Form',
			renderTo: 'f3',
            title:'Extra Functionality',
            autoHeight: true,
			bodyStyle: 'padding:50px;',
			width: 700,
            items: [{
				allowBlank:false,
				msgTarget: 'side',
                renderFieldBtns:false,
                id:'selector3',
                xtype:'superboxselect',
                fieldLabel: 'Countries',
                resizable: true,
                name: 'countries',
                anchor:'100%',
                store: countryStore,
                mode: 'local',
                displayField: 'name',
                valueField: 'code',
                classField: 'cls',
                styleField: 'style',
                extraItemCls: 'x-flag',
                extraItemStyle: 'border-width:2px',
                stackItems: true
             }
            ],
			buttons: [{
                text: "Add Australia (addItem)",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector3').addItem({code:'AU'});
                }
            },{
                text: 'getValue()',
                scope: this,
                handler: function(){
                    alert(Ext.getCmp('selector3').getValue());
                }
            }, {
                text: 'BasicForm.getValues()',
                scope: this,
                handler: function(){
                    var v = form3.getForm().getValues(true);
                    alert(v);
                }
            },{
                text: "reset",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector3').reset();
                }
            }]
        });

		var states2 = new Ext.data.SimpleStore({
            fields: ['abbr', 'state', 'nick', 'cls'],
            data: Ext.exampledata.states,
            sortInfo: {field: 'state', direction: 'ASC'}
        });

      	var form4 = new Ext.form.FormPanel({
            id:'f4Form',
			renderTo: 'f4',
            title:'Prevent TAB key navigation',
            autoHeight: true,
			bodyStyle: 'padding:50px;',
			width: 700,
            items: [{
                allowBlank:false,
				msgTarget: 'title',
                id:'selector4',
                xtype:'superboxselect',
                fieldLabel: 'States',
                resizable: true,
                name: 'states2',
                anchor:'100%',
                store: states2,
                mode: 'local',
                displayField: 'state',
                displayFieldTpl: '{state} ({abbr})',
                valueField: 'abbr',
				navigateItemsWithTab: false
             }
            ],
			buttons: [{
                text: "setValue('AK,NY,CO')",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector4').setValue('AK,NY,CO');
                }
            },{
                text: 'getValue()',
                scope: this,
                handler: function(){
                    alert(Ext.getCmp('selector4').getValue());
                }
            }, {
                text: 'BasicForm.getValues()',
                scope: this,
                handler: function(){
                    var v = form4.getForm().getValues(true);
                    alert(v);
                }
            },{
                text: "reset",
                scope: this,
                handler: function(){
                    Ext.getCmp('selector4').reset();
                }
            }]
        });
		
		//example 5
		
		var states3 = new Ext.data.SimpleStore({
            fields: ['abbr', 'state', 'nick', 'cls'],
            data: Ext.exampledata.states,
            sortInfo: {field: 'state', direction: 'ASC'}
        });

      	new Ext.ux.form.SuperBoxSelect({
				applyTo: 'f5-sbs',
                allowBlank:false,
				msgTarget: 'title',
                id:'selector5',
                xtype:'superboxselect',
                fieldLabel: 'States',
                resizable: true,
                //name: 'states[]',
				hiddenName : 'statesHidden[]',
                width:300,
                store: states3,
                mode: 'local',
                displayField: 'state',
                displayFieldTpl: '{state} ({abbr})',
                valueField: 'abbr',
				navigateItemsWithTab: false,
				value : ['AL', 'AZ']
             });
			 
			 //example 6
			 new Ext.ux.form.SuperBoxSelect({
				transform: 'f6-sbs',
                allowBlank:false,
				msgTarget: 'title',
                id:'selector6',
                fieldLabel: 'States',
                resizable: true,
                name: 'countries2',
                width:200,
                displayField: 'text',
                valueField: 'value',
                classField: 'cls',
                styleField: 'style',
				extraItemCls: 'x-flag',
                extraItemStyle: 'border-width:2px',
                stackItems: true
             });
    });
</script>

</head>
<body>
	<div id="page">
		<h1>SuperBoxSelect Examples</h1>
		<div id="intro">
			<p>SuperBoxSelect is an extension of the ComboBox component which displays selected items as labelled boxes within the form field. As seen on facebook, hotmail and other sites, it combines both auto-complete and multi-selection capabilities.</p>
			<p>The SuperBoxSelect component was inspired by the BoxSelect component found here: http://efattal.fr/en/extjs/extuxboxselect/</p>
		</div>
		<h2>Example 1</h2>
		<p>This example demonstrates the base functionality of auto-completion and multi-select capabilities. Apart from the <code>displayFieldTpl</code> config, all other functionality is as per the default behaviour.</p>
		<div id="f1" class="exForm"></div>
		<h2>Example 2</h2>
		<p>This example demonstrates the <code>allowNewData</code> config, which allows new data to be added via the <code>addItem</code> and <code>setValueEx</code> methods. New data entered by the user is first sent to a callback function via the <code>newitem</code> event as shown in the source code.</p>
		<p>The <code>extraItemCls</code> config property is also used in this example, and enables additional styling of the selected items.</p>
		<div id="f2" class="exForm"></div>
		<h2>Example 3</h2>
		<p>This example demonstrates the <code>stackItems</code> config, which forces the selected items to be rendered stacked.</p><p>The per item styling capabilities are demonstrated by the use of the <code>classField</code> and <code>styleField</code> config properties.</p><p>This demonstration hides the in-field ‘clear’ and ‘expand’ buttons by setting the <code>renderFieldBtns</code> config to ‘false’</p>
		<div id="f3" class="exForm"></div>
		<h2>Example 4</h2>
		<p>This example demonstrates the <code>navigateItemsWithTab</code> config property set to ‘false’. This prevents the TAB key from focusing the selected items.</p>
		<p>The <i>ARROW</i> keys and <i>HOME</i> and <i>END</i> keys can still be used for keyboard navigation between selected items.</p>
		<div id="f4" class="exForm"></div>
		<h2>Example 5</h2>
		<p>This example demonstrates using <code>applyTo</code> to apply the component to an existing dom element.</p>
		<form id="f5" class="exForm" method="POST" action="http://www.technomedia.co.uk/post.php">
        	<input id="f5-sbs" type="text" /><input type="submit" />
        </form>
		<h2>Example 6</h2>
		<p>This example demonstrates using <code>transform</code> on an existing SELECT.</p>
		<form id="f6" class="exForm">
			<p>Transformed SELECT</p>
			<select id="f6-sbs" multiple="multiple">
        		<option value="AU" class="x-flag-au" style="font-style:italic" selected="selected">Australia</option>
				<option value="AT" class="x-flag-at" >Austria</option>
				<option value="CA" class="x-flag-ca" >Canada</option>
				<option value="FR" class="x-flag-fr" >France</option>
				<option value="IT" class="x-flag-it" >Italy</option>
				<option value="NZ" class="x-flag-nz" >New Zealand</option>
				<option value="US" class="x-flag-us" selected="selected" >USA</option>
        	</select>
			
			<p>Originally looked like this</p>
			<select id="f6-plain" multiple="multiple">
        		<option value="AU" class="x-flag x-flag-au" style="font-style:italic" selected="selected">Australia</option>
				<option value="AT" class="x-flag x-flag-at" >Austria</option>
				<option value="CA" class="x-flag x-flag-ca" >Canada</option>
				<option value="FR" class="x-flag x-flag-fr" >France</option>
				<option value="IT" class="x-flag x-flag-it" >Italy</option>
				<option value="NZ" class="x-flag x-flag-nz" >New Zealand</option>
				<option value="US" class="x-flag x-flag-us" selected="selected" >USA</option>
        	</select>
        </form>
	</div>
	<span class="small">Flag icons by http://www.icondrawer.com</span>
</body>
</html>
