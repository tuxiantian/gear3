/**
 * @class Ext.ux.SchedulePanel
 * @extends Ext.Panel
 * This class represents the primary interface of a component based schedule control.
 * <br><br>Usage:
 * <pre><code>var schedule = new Ext.ux.SchedulePanel({
    store: new Ext.data.Store({
        reader: reader,
        data: xg.dummyData
    }),
    timelineModel: new Ext.ux.TimelineModel({
    
    }),
    viewConfig: {
        forceFit: true
    },
    selModel: new Ext.ux.TimelineActivitySelectionModel({singleSelect:true}),
    width:600,
    height:300,
    frame:true
});</code></pre>
 * <b>Notes:</b><ul>
 * <li>Although this class inherits many configuration options from base classes, some of them
 * (such as autoScroll, layout, items, etc) are not used by this class, and will have no effect.</li>
 * <li>A schedule <b>requires</b> a width in which to scroll its columns, and a height in which to scroll its rows. The dimensions can either
 * be set through the {@link #height} and {@link #width} configuration options or automatically set by using the schedule in a {@link Ext.Container Container}
 * who's {@link Ext.Container#layout layout} provides sizing of its child items.</li>
 * <li>To access the data in a Schedule, it is necessary to use the data model encapsulated
 * by the {@link #store Store}. See the {@link #activityclick} event.</li>
 * </ul>
 * @constructor
 * @param {Object} config The config object
 */
Ext.ux.SchedulePanel = Ext.extend(Ext.Panel, {
    
    /**
     * @cfg {Ext.data.Store} store The {@link Ext.data.Store} the schedule should use as its data source (required).
     */     
    /**
     * @cfg {Object} timelineModel The {@link Ext.ux.TimelineModel} to use when rendering the grid.
     * (defaults to {@link Ext.ux.TimelineModel} if not specified).
     */
    /**
     * @cfg {Object} selModel Any subclass of AbstractTimelineSelectionModel that will provide the selection model for
     * the schedule (defaults to {@link Ext.ux.TimelineActivitySelectionModel} if not specified).
     */
    /**
     * @cfg {Boolean} disableSelection True to disable selections in the schedule (defaults to false). - ignored if a SelectionModel is specified 
     */
    /**
     * @cfg {Object} viewConfig A config object that will be applied to the schedule's UI view.  Any of
     * the config options available for {@link Ext.ux.ScheduleView} can be specified here.
     */
    /**
     * @cfg {Boolean} hideHeaders True to hide the schedule's header (defaults to false).
     */
    /**
     * @cfg {Number} minColumnWidth The minimum width a time unit column can be resized to. Defaults to 25.
     */
    minColumnWidth : 25,
    /**
     * @cfg {Number} minLabelWidth The minimum width the label column can be resized to. Defaults to 30.
     */
    minLabelWidth: 50,
    /**
     * @cfg {Boolean} disableNesting When the parentIndexId parameter is defined in the ScheduleModel, the view
     * will display labels in a tree structure.  Setting this parameter to false will disable that feature and 
     * all rows will be displayed in a flat struccture with the same indention level.  Default is true
     */
    enableNesting: true,
    /**
     * @cfg {Boolean} trackMouseOver True to highlight rows when the mouse is over. Default is true.
     */
    trackMouseOver : true,
    /**
     * @cfg {Object} loadMask An {@link Ext.LoadMask} config or true to mask the grid while loading (defaults to false).
     */
    loadMask : false,
    
    //private variables        
    rendered : false,
    viewReady: false,
    stateEvents: ["timeresize"],

    // private
    initComponent : function(){
        Ext.ux.SchedulePanel.superclass.initComponent.call(this);

        // override any provided value since it isn't valid        
        this.autoScroll = false;        
        this.autoWidth = false;
        
        //get the data store
        this.store = Ext.StoreMgr.lookup(this.store);
        
        this.addEvents(
            // raw events
            /**
             * @event click
             * The raw click event for the entire schedule.
             * @param {Ext.EventObject} e
             */
            "click",
            /**
             * @event dblclick
             * The raw dblclick event for the entire schedule.
             * @param {Ext.EventObject} e
             */
            "dblclick",
            /**
             * @event contextmenu
             * The raw contextmenu event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "contextmenu",
            /**
             * @event mousedown
             * The raw mousedown event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "mousedown",
            /**
             * @event mouseup
             * The raw mouseup event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "mouseup",
            /**
             * @event mouseover
             * The raw mouseover event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "mouseover",
            /**
             * @event mouseout
             * The raw mouseout event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "mouseout",
            /**
             * @event keypress
             * The raw keypress event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "keypress",
            /**
             * @event keydown
             * The raw keydown event for the entire grid.
             * @param {Ext.EventObject} e
             */
            "keydown"
        );
        
    },

    // private
    onRender : function(ct, position){
        Ext.ux.SchedulePanel.superclass.onRender.apply(this, arguments);
        
        this.el.addClass('x-schedule-panel');

        var view = this.getView();        
        view.init(this);
        
        //handle events on the body element
        var c = this.body;
        c.on("mousedown", this.onMouseDown, this);
        c.on("click", this.onClick, this);
        c.on("dblclick", this.onDblClick, this);
        c.on("contextmenu", this.onContextMenu, this);
        c.on("keydown", this.onKeyDown, this);

        this.relayEvents(c, ["mousedown","mouseup","mouseover","mouseout","keypress"]);

        this.getSelectionModel().init(this);
        this.view.render();
    },
    
    // private
    initEvents : function(){
        Ext.ux.SchedulePanel.superclass.initEvents.call(this);

        if(this.loadMask){
            this.loadMask = new Ext.LoadMask(this.bwrap,
                    Ext.apply({store:this.store}, this.loadMask));
        }
    },
        
    // private
    afterRender : function(){
        Ext.ux.SchedulePanel.superclass.afterRender.call(this);
        this.view.layout();        
        this.viewReady = true;
    },    
   
    // private
    onKeyDown : function(e){
        this.fireEvent("keydown", e);
    },

    // private
    onDestroy : function(){
        if(this.rendered){
            if(this.loadMask){
                this.loadMask.destroy();
            }
            var c = this.body;
            c.removeAllListeners();
            this.view.destroy();
            c.update("");
        }
        this.timelineModel.purgeListeners();
        Ext.ux.SchedulePanel.superclass.onDestroy.call(this);
    },            
    
    // fires the specified mouse related event from this control and then fires a similar
    // event from either the timeline or the activity that was a target of the mouse event
    processEvent : function(name, e){
        this.fireEvent(name, e);
        var t = e.getTarget();
        var v = this.view;
        
        var label = v.findLabelIndex(t);
        if(label !== false){
            this.fireEvent("label" + name, this, label, e);
            return;
        }
        
        var tr = v.findRowIndex(t);
        if(tr !== false){
            this.fireEvent("row" + name, this, tr, e);
            
            var a = v.findActivityIndex(t);  //returns object with rowIndex and activityIndex
            if(a !== false){
                this.fireEvent("activity" + name, this, {rowIndex: tr, activityIndex: a}, e);
            }
        }
        
        var header = v.findTimelineHeaderId(t);
        if(header !== false){
            this.fireEvent("header" + name, this, header, e);
            return;
        }  
    },

    // private
    onClick : function(e){
        this.processEvent("click", e);
    },

    // private
    onMouseDown : function(e){
        this.processEvent("mousedown", e);
    },

    // private
    onContextMenu : function(e, t){
        this.processEvent("contextmenu", e);
    },

    // private
    onDblClick : function(e){
        this.processEvent("dblclick", e);
    },
    
    // private
    getSelections : function(){
        return this.selModel.getSelections();
    },

    // private
    onResize : function(){
        Ext.ux.SchedulePanel.superclass.onResize.apply(this, arguments);
        if(this.viewReady){
            this.view.layout();
        }
    },

    /**
     * Returns the schedule's underlying element.
     * @return {Element} The element
     */
    getScheduleEl : function(){
        return this.body;
    },
    
    /**
     * Returns the schedule's SelectionModel.
     * @return {SelectionModel} The selection model
     */
    getSelectionModel : function(){
        if(!this.selModel){
            this.selModel = new Ext.ux.ScheduleActivitySelectionModel();
        }
        return this.selModel;
    },

    /**
     * Returns the grid's data store.
     * @return {DataSource} The store
     */
    getStore : function(){
        return this.store;
    },
    
    /**
     * Returns the schedule's TimelineModel.
     * @return {TimelineModel} The timeline model
     */
    getTimelineModel : function(){
        if(!this.timelineModel){
            this.timelineModel = new Ext.ux.TimelineModel();
        }
        return this.timelineModel;
    },

    /**
     * Returns the schedule's ScheduleView object.
     * @return {ScheduleView} The schedule view
     */
    getView : function(){
        if(!this.view){
            this.view = new Ext.ux.ScheduleView(this.viewConfig);
        }
        return this.view;
    }
});
Ext.reg('schedule', Ext.ux.SchedulePanel);