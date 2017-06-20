/**
 * @class Ext.ux.ScheduleView
 * @extends Ext.util.Observable
 * <p>This class encapsulates the user interface of an {@link Ext.ux.SchedulePanel}.
 * Methods of this class may be used to access user interface elements to enable
 * special display effects. Do not change the DOM structure of the user interface.</p>
 * <p>This class does not provide ways to manipulate the underlying data. The data
 * model of a Schedule is held in an {@link Ext.data.Store}.</p>
 * @constructor
 * @param {Object} config
 */
Ext.ux.ScheduleView = function(config){
    
    Ext.apply(this, config);
    
    // These events are only used internally by the schedule components
    this.addEvents(
      /**
         * @event beforerowremoved
         * Internal UI Event. Fired before a row is removed.
         * @param {Ext.grid.GridView} view
         * @param {Number} rowIndex The index of the row to be removed.
         * @param {Ext.data.Record} record The Record to be removed
       */
      "beforerowremoved",
      /**
         * @event beforerowsinserted
         * Internal UI Event. Fired before rows are inserted.
         * @param {Ext.grid.GridView} view
         * @param {Number} firstRow The index of the first row to be inserted.
         * @param {Number} lastRow The index of the last row to be inserted.
       */
      "beforerowsinserted",
      /**
         * @event beforerefresh
         * Internal UI Event. Fired before the view is refreshed.
         * @param {Ext.grid.GridView} view
       */
      "beforerefresh",
      /**
         * @event rowremoved
         * Internal UI Event. Fired after a row is removed.
         * @param {Ext.grid.GridView} view
         * @param {Number} rowIndex The index of the row that was removed.
         * @param {Ext.data.Record} record The Record that was removed
       */
      "rowremoved",
      /**
         * @event rowsinserted
         * Internal UI Event. Fired after rows are inserted.
         * @param {Ext.grid.GridView} view
         * @param {Number} firstRow The index of the first inserted.
         * @param {Number} lastRow The index of the last row inserted.
       */
      "rowsinserted",
      /**
         * @event rowupdated
         * Internal UI Event. Fired after a row has been updated.
         * @param {Ext.grid.GridView} view
         * @param {Number} firstRow The index of the row updated.
         * @param {Ext.data.record} record The Record backing the row updated.
       */
      "rowupdated",
      /**
         * @event refresh
         * Internal UI Event. Fired after the GridView's body has been refreshed.
         * @param {Ext.grid.GridView} view
       */
      "refresh"
  );
    
    Ext.ux.ScheduleView.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.ScheduleView, Ext.util.Observable, {
    /**
     * @cfg {String} emptyText Default text to display in the grid body when no rows are available (defaults to '').
     */
    /**
     * @cfg {Boolean} deferEmptyText True to defer emptyText being applied until the store's first load
     */
    /**
     * The amount of space to reserve for the scrollbar (defaults to 19 pixels)
     * @type Number
     */
    scrollOffset: 19,
    /**
     * The width of the area reserved for resizing the label width (defaults to 2 pixels)
     * @type Number
     */
    resizerWidth: 2,
     /**
     * The height of a line/row in the schedule (defaults to 21 pixels)
     * @type Number
     */
    lineHeight: 21,
    /**
     * @cfg {String} activitySelector The selector used to find activities internally
     */
    activitySelector: '.x-schedule-activity',
    /**
     * @cfg {Number} activitySelectorDepth The number of levels to search for activities in event delegation (defaults to 4)
     */
    activitySelectorDepth: 4,
    /**
     * @cfg {String} activitySelector The selector used to find activities internally
     */
    labelSelector: '.x-schedule-lc',
    /**
     * @cfg {Number} labelSelectorDepth The number of levels to search for labels in event delegation (defaults to 4)
     */
    labelSelectorDepth: 4,
    
    //internal used to determine if the dataset is sorted for a hierarchical view
    dsSorted: false,
    
    //internal used for the width of the expand/collapse icon in the tree
    treeNodeWidth: 18,
    
    
    /*************************************************************
    control initalization
    *************************************************************/
    
    // called by the SchedulePanel to initialize the templates, data and UI
    init: function(schedule){
        this.schedule = schedule;
        this.initTemplates();
        this.initData(schedule.store);
        this.tm = schedule.timelineModel;        
        this.sm = schedule.scheduleModel;
        this.labelWidth = this.sm.labelWidth;                
        this.initUI(schedule);
    },
    
    // define the templates that are used to generate the schedule's UI
    initTemplates : function(){
        var ts = this.templates || {};
        if(!ts.master){
            ts.master = new Ext.Template(
                    '<div class="x-schedule" hidefocus="true">',                        
                        '<div class="x-schedule-sidePanel" style="position: absolute; top:0; left:0; width:{labelWidth};"  >',                        
                            '<div class="x-schedule-title" ><div class="x-schedule-title-inner" style="width:{titleWidth};">{title}</div><div class="x-schedule-resizer" style="left:{titleWidth};"></div></div>',                            
                            '<div class="x-schedule-label"><div class="x-schedule-label-inner"  style="width:{labelWidth};"><div class="x-schedule-label-offset">{label}</div></div><div class="x-clear"></div></div>',                            
                        "</div>",
                        '<div class="x-schedule-timeline" style="left:{timelinePosition};">',                        
                            '<div class="x-schedule-viewport">',                            
                                '<div class="x-schedule-header" ><div class="x-schedule-header-inner"><div class="x-schedule-header-offset">{timelineheader}</div></div><div class="x-clear"></div></div>',                            
                                '<div class="x-schedule-scroller"><div class="x-schedule-body" >{timelinebody}</div><a href="#" class="x-schedule-focus" tabIndex="-1"></a><div class="x-schedule-activities" >{activities}</div><div class="x-schedule-ct" style="left: {ctLeft}; background-color: {ctColor};"></div> </div>',
                            "</div>",                            
                        "</div>",
                        '<div class="x-schedule-resize-marker">&#160;</div>',
                        '<div class="x-schedule-resize-proxy">&#160;</div>',
                    "</div>"
                    );
        }
        
        if(!ts.title){
            ts.title = new Ext.Template('{title}');
        }

        if(!ts.header){
            ts.header = new Ext.Template(
                    '<table border="0" cellspacing="0" cellpadding="0"  style="{tstyle}">',
                    '<thead><tr class="x-schedule-hd-row">{cells}</tr></thead>',
                    "</table>"
                    );
        }

        if(!ts.hcell){
            ts.hcell = new Ext.Template(
                    '<td class="x-schedule-hd-cell x-schedule-td-{id}" style="{style}" {colspan}><div {tooltip} class="x-schedule-hd-inner x-schedule-hd-{id}" unselectable="on" style="{istyle}">',
                    '{value}</div></td>'
                    );
        }
        
        if(!ts.label){            
            ts.label = new Ext.Template('<div class="x-schedule-lc x-schedule-lc-{id} {alt}" style="{style} height:{height};">{treeNode}<div class="x-schedule-lc-inner" style="left:{lleft};">{value}</div></div>');
        }
        
        if(!ts.treeNode){
            ts.treeNode = new Ext.Template('<div class="x-schedule-lc-tree x-schedule-lc-tree-{tree}" style="left:{tleft}; ">&#160;</div>');           
        }


        if(!ts.bstripe){
            ts.bstripe = new Ext.Template(
                '<div class="x-schedule-bstripe x-schedule-bstripe-{id} {css}" style="left: {left}; width: {width}; {style}">{content}</div>'
                );
        }
        
        if(!ts.row){
            ts.row = new Ext.Template(
                '<div class="x-schedule-row x-schedule-row-{id}" style="height: {height};">{activities}</div>'
            );
        }

        if(!ts.activity){
            ts.activity = new Ext.Template(
                    '<div class="x-schedule-activity x-schedule-activity-{id}" style="left:{left}; width: {width}; height: {height}; {cstyle}">',
                        '<div  {tooltip} class="x-schedule-activity-inner {cls}" style="height: {iheight}; {style}">{value}</div>',
                    '</div>'
                    );
        }
        
        for(var k in ts){
            var t = ts[k];
            if(t && typeof t.compile == 'function' && !t.compiled){
                t.disableFormats = true;
                t.compile();
            }
        }

        this.templates = ts;
        this.actRe = new RegExp("x-schedule-activity-([^\\s]+)", ""); //activity regular expression
        this.tsRe = new RegExp("x-schedule-td-([^\\s]+)", ""); //timeline segment regular expression        
        this.lRe = new RegExp("x-schedule-lc-([^\\s]+)", ""); //label regular expression        
        this.rowRe = new RegExp("x-schedule-row-([^\\s]+)", ""); //timeline row regular expression        
        
    },
    
    // disconnects event handlers from an existing dataStore and adds event handlers to the store passed in
    initData : function(dataStore){
        if(this.ds){
            this.ds.un("load", this.onLoad, this);
            this.ds.un("datachanged", this.onDataChange, this);
            this.ds.un("add", this.onAdd, this);
            this.ds.un("remove", this.onRemove, this);
            this.ds.un("update", this.onUpdate, this);
            this.ds.un("clear", this.onClear, this);
        }
        if(dataStore){
            dataStore.on("load", this.onLoad, this);
            dataStore.on("datachanged", this.onDataChange, this);
            dataStore.on("add", this.onAdd, this);
            dataStore.on("remove", this.onRemove, this);
            dataStore.on("update", this.onUpdate, this);
            dataStore.on("clear", this.onClear, this);
        }
        this.ds = dataStore;
    },
            
    //Connect event handlers to events on the SchedulePanel
    //(SchedulePanel) sp The schedule parent that owns this view
    initUI : function(sp){
        //sp.on("headerclick", this.onHeaderClick, this);

        if(sp.trackMouseOver){
            sp.on("mouseover", this.onRowOver, this);
          sp.on("mouseout", this.onRowOut, this);
        }
    },
    
    /*************************************************************
    Rendering
    *************************************************************/
    
    // called by the SchedulePanel to render the UI
    render : function(){
        
        //perform any pre-processing based on user configuration if needed here
                
        this.renderUI();
    },
    
    // renders the control 
    renderUI : function() {

        //generate the html for each portion of the control
        var title = this.renderTitle();
        var timeline = this.renderTimeline();
        //var timelineBody = this.renderTimelineBody();
        var label = this.renderLabels();
        var activities = this.renderActivities();
            
        //generate the control's html by sending each portion to the master template
        var controlHtml = this.templates.master.apply({
            title:  title,
            timelineheader: timeline.timelineheader,
            timelinebody: timeline.timelinebody,
            label: label,
            labelWidth: this.sm.labelWidth,
            titleWidth: this.sm.labelWidth - this.resizerWidth,
            timelineWidth: this.timelineWidth,
            timelinePosition: this.sm.labelWidth + 1, //leave space for a 1px border
            activities: activities,
            ctLeft: -1, //current time marker
            ctColor: '#00BB00' //green
        });
        //stopit();
        //set the controls html
        this.schedule.getScheduleEl().dom.innerHTML = controlHtml;
        
        //initialize the control's elements
        this.initElements();
        
        //add event handlers, etc to the rows
        this.processRows();

        this.scroller.on('scroll', this.syncScroll,  this);
        
        //initalize the current time indicator
        this.updateCurrentTimeLocation();
        this.startCurrentTimeUpdater();
        
        //Create a drag zone for resizing the label width
        new Ext.ux.ScheduleView.SplitDragZone(this.schedule, this.resizer.dom);
    },
   
    
    renderTitle : function() {
        var sm = this.sm,           //schedule model
            ts = this.templates,    //templates
            tt = ts.title;          //title template            
        
        var title = sm.title;
        if(sm.titleRenderer){
            title = sm.titleRenderer(title);
        }
        
        return tt.apply({title: title});
    },
        
    //This function is currently hard-coded to use a minute timeline.  This function should be re-written to 
    //get an arbitrary number of timelines from the timeline model and render them        
    renderTimeline : function() {
        
        var tm = this.tm,           //timeline model
            sm = this.sm,           //schedule model
            ts = this.templates,    //templates
            sd = this.tm.startDate, //schedule start date
            ed = this.tm.endDate;   //schedule end date
            
        var tb = [[],[],[],[],[]]; //timeline buffer holds the html markup for each of the 5 possible timelines
            
        //get the minute timeline config
        var mc = tm.getMinuteTimelineConfig(sm.startDate, sm.endDate); 
        
        var hcb = [],    //header cell buffer
            bcb = [],    //body cell buffer
            hc = {},    //header cell config object
            bc = {},    //body cell config object
            sd,         //start date
            cs,         //colspan
            tw = 0,     //total width of timeline - calculated during rendering 
            cw = 0;     //cumulative width
        
        for(var i = -1; i<mc.nextDateCallCount; i++){  //start at -1 to account for the start date
            if(i == -1){ //start date
                sd = mc.startDate;
                cs = mc.startSpan;
            }
            else if(i == mc.nextDateCallCount - 1){ //last date
                sd = mc.nextDateFn();
                cs = mc.lastDateSpan;            
            }
            else{ //all other dates
                sd = mc.nextDateFn();
                cs = mc.nextDateSpan;
            }
            
            //configure the object representing the header cell
            hc.id = 'tl-min-' + sd.format('mdYHi');   //month, day, year, hour, min
            hc.style = 'width:'+ (mc.unitWidth + (Ext.isGecko || Ext.isOpera ? -2 : 0)) +'px;overflow:hidden;  ';    
            hc.colspan = cs == 1 ? '' : 'colspan="' + cs + '"';
            hc.tooltip = 'ext:qtip="' + sd.format(sm.dateFormat) + '"';
            hc.istyle = '';
            hc.value = tm.timelines[0].renderer ? tm.timelines[0].renderer(sd) : sd.getMinutes();
        
            hcb[hcb.length] = ts.hcell.apply(hc); //add the cell
            tw += mc.unitWidth; 
            
            //configure the object representing the body stripe                                
            bc.id = 'body-' + sd.format('mdYHi');   //month, day, year, hour, min
            bc.width = mc.unitWidth;
            bc.left = ((i + 1) * bc.width) + 1; //add pixel for border                        
            bc.style = 'border-right: 1px solid #EBEFF2; ';
            bc.style += (i % 2 == 0) ? 'background-color: #FAFAFA;' : '';
//            var day = sd.getDay();    
//            if(day === 0 || day === 6) bc.style += ' background-color: #f1f5f9;';                                                
            
            bcb[bcb.length] = ts.bstripe.apply(bc); //add the cell
                        
        }
        this.timelineWidth = tw;
        
        var returnObject = {
            timelineheader: ts.header.apply({cells: hcb.join(""), tstyle:'width:'+tw+'px;'}),
            timelinebody: bcb.join("")
        }
        
        return returnObject;
            
    },
 
    
    renderLabels: function() {
        if(this.ds.getCount() < 1){
            return "";
        }
               
        var sm = this.sm,               //schedule model
            ds = this.ds,               //data store
            ts = this.templates,        //templates
            startRow = 0,
            endRow = ds.getCount()-1,   
            rs = ds.getRange(startRow, endRow),  //get the records from the store
            pi = sm.parentDataIndex,    //parent index
            ii = sm.idIndex,            //id index
            n = false,                  //nesting disabled (enabled later if detected in data store)          
            ind = -1,                   //indention level starts at -1.  moves to 0 for first root level node            
            hc = false,                 //has children - indicates that the current node has child nodes
            ps = [],                    //parent node stack - (used when determining indention level)
            r,                          //current row
            lo = {},                    //label object - used to parameterize label template
            lb = [],                    //label buffer - holds all the rendered labels                        
            rc = 0,                     //row count            
            nx,                         //next record index
            tn,                         //tree node object - used to parameterize treeNode template       
            tnw = this.treeNodeWidth;   //width of the treenode icon 
            
        //If the Store Model specifies a parentDataIndex, assume we are using a tree layout for labels        
        if(pi && this.schedule.enableNesting === true) {
            n = true;
            //ensure that the data store is sorted correctly
            if(this.dsSorted == false){
                this.treeSort();            
            }
        }
  
       var previd = '';      // store id field value for ignoring duplicates
        for(var j = 0, len = rs.length; j < len; j++){
            r = rs[j]; 
       
       if (previd != r.data[sm.idIndex]) // ignore rows with duplicate id
       { 
       previd = r.data[sm.idIndex];
       
            rc++;            
            //handle indention and expand/collapse if enabled
            if(n){
                if(ps.length == 0) { //parent node stack is empty
                    ps.push(r);
                    ind++;
                }
                else{
                    //parent node should be in the stack.  
                    var found = false;
                    for(var k=ps.length-1; k>=0; k--){
                        if(ps[k].data[ii] == r.data[pi]){ //if node is current node's parent
                            ps.push(r);
                            ind++;
                            found = true;
                            break;
                        }
                        else{
                            ps.pop();
                            ind--;
                        }
                    }
                    
                    if(!found){
                        //if we get here, the parent was not present, so this is a root node
                        ps.push(r);
                        ind++;
                    }
                }
            }
            
            //see if this record has children
            nx = j+1;            
            if(nx != len && rs[nx].data[pi] == r.data[ii]){
                hc = true;
            }
            else{
                hc = false;
            }

            //build the label object                        
            lo.id = j; //set the id to the index of the record (NOTE: fix this if using a start point other than 0)                      
            lo.value = sm.labelRenderer ? sm.labelRenderer(r.data[sm.labelDataIndex]) : r.data[sm.labelDataIndex];
            lo.style = '';
            lo.height = this.lineHeight;            
            if(lo.value == undefined || lo.value === "") lo.value = "&#160;";
                   
            //add a tree expand/collapse icon if the node has children                        
            if(hc){ 
                tn = {
                    tree : 'col',
                    tleft: ind * tnw  //indention level * treeNode width
                };
                lo.lleft = tn.tleft + tnw;
                lo.treeNode = ts.treeNode.apply(tn);                        
            }
            else{
                lo.treeNode = null;                
                lo.lleft = (ind * tnw) + tnw;
            }
            
            lb[lb.length] = ts.label.apply(lo);
        }
      } // end dulicate row if

        
        this.bodyHeight = rc * this.lineHeight;
        
        return lb.join("");
    },
    
    renderActivities : function() {
        if(this.ds.getCount() < 1){
            return "";
        }
        
        var tm = this.tm,           //timeline model
            sm = this.sm,           //schedule model
            ds = this.ds,           //data store
            ts = this.templates,    //templates
            startRow = 0,
            endRow = ds.getCount()-1,
            rs = ds.getRange(startRow, endRow),        
            r,          //current row
            ha,         //has activity
            ao = {},    //activity object
            ab = [],    //label buffer
            id,         //id of the activity
            value,      //holds the value of the activity
            p,          //position of activity
            lh = this.lineHeight,
            pm = tm.getPixelsPerMinute(),   //pixels per minute
            tls = tm.startDate,  //timeline start date
            em,         //minutes elapsed between timeline start date and activity start date
            am,         //minutes elapsed between activity start and activity end date
            sd,         //activity start date
            ed         //activity end date 
            ;           

            rowac = [];
            var previd = ''

                        
        for(var j = 0, len = rs.length; j < len; j++){
            r = rs[j];                         
            sd = r.data[sm.startDateIndex];
            ed = r.data[sm.endDateIndex];
            ha = false;

             if (previd != r.data[sm.idIndex] && j!=0 ) // if id no duplicated build prev row
                         {
                                    var row = {};
                                    row.id = j-1;
                                    row.height = lh+ (Ext.isGecko  || Ext.isOpera ? 1 : 0) + 'px';
                                    row.activities = rowac.length !=0 ? rowac.join('') : '';
                                    ab[ab.length] = ts.row.apply(row);
                                    rowac = [];
                          }
              previd = r.data[sm.idIndex];
            //if start or end date is not defined, continue
            if(sd && sd != '' && ed && ed != ''){
                ha = true;    //indicates this row has an activity

                if(!Ext.isDate(sd)) sd = Date.parseDate(sd,sm.dateFormat);
                if(!Ext.isDate(ed)) ed = Date.parseDate(ed,sm.dateFormat);
            
                //multiple activities, change the -0 to be the index of the activity in the row
                ao.id = j + '-0'; //get id from datastore or use the loop counter            
                ao.top = j * lh;            
                em = tls.getElapsed(sd) / 60000; //minutes between timeline start and activity start                                    
                ao.left = em * pm;            
                am = sd.getElapsed(ed) / 60000; //activity duration in minutes
                ao.width = (am * pm)+'px';
                if(Ext.isGecko || Ext.isOpera ){ ao.height = (lh-1)+'px';   ao.iheight = (lh-2)+'px'; }else{ ao.height = lh+'px'; ao.iheight = (lh-1)+'px'; }
      //          if(Ext.isOpera){ ao.height = (lh+2)+'px';   ao.iheight = (lh+1)+'px'; }
                ao.cstyle = 'text-align: center';  //container style            
                ao.cls = r.data[sm.colorDataIndex]!= '' ? 'act-' + r.data[sm.colorDataIndex] : 'act-blue' ; //'act-blue';
                value = r.data[sm.activityDataIndex];
                ao.value = sm.activityRenderer ? sm.activityRenderer(value, r, j) : value;                 
                if(ao.value == undefined || ao.value === "") ao.value = "&#160;";
                ao.tooltip = 'ext:qtip="' + value + '"';
                rowac[rowac.length] = ts.activity.apply(ao);
            }        
              

            //Generate the row object

            
        }

        var row = {};
        row.id = -1;
        row.height = lh+ (Ext.isGecko ? 1 : 0) + 'px';
        row.activities = rowac.length !=0 ? rowac.join('') : '';
        ab[ab.length] = ts.row.apply(row);  // build last row
        
        return ab.join("");
//        return '<div style="position: absolute; left:100; top:0; width:200px;">' + 
//               '    <div style="background-color:Red; color: white; margin-top: 3px; margin-bottom: 3px; margin-left:1px;">Test</div>' +
//               '</div>' +
//               '<div style="position: absolute; left:0; top:19; width:150;">' + 
//               '    <div style="background-color:Blue; color: white; margin-top: 3px; margin-bottom: 3px; margin-left:1px;">On Time</div>' +
//               '</div>';              
    },
    
    // create references to the dom elements that contain the major portions of the control
    initElements : function(){
        var E = Ext.Element;

        var scheduleElement = this.schedule.getScheduleEl().dom.firstChild; //x-schedule
        var scheduleChildren = scheduleElement.childNodes;
        this.el = new E(scheduleElement,true);
        
        //Get the side panel elements
        this.sidePanel = new E(scheduleChildren[0],true);  //sidepanel that holds the title area and the label area        
        this.mainTitle = new E(this.sidePanel.dom.childNodes[0],true);  //title area       
        this.mainLabel = new E(this.sidePanel.dom.childNodes[1],true); //label area
        
        //get the timeline area elements
        this.timelineArea = new E(scheduleChildren[1],true); //panel that holds the timeline header and main body
        this.viewport = new E(this.timelineArea.dom.childNodes[0],true);  //viewport 
        this.resizeMarker = new E(scheduleChildren[2],true);
        this.resizeProxy = new E(scheduleChildren[3],true);
        
        //get the header elements
        this.mainHeader = new E(this.viewport.dom.childNodes[0],true);  //title area                                 
        this.innerHeader = this.mainHeader.dom.firstChild;  //header-inner
        this.headerOffset = new E(this.innerHeader.firstChild,true);  //header-offset
        
        //Get the title elements
        this.titleInner = new E(this.mainTitle.dom.childNodes[0],true);
        this.resizer = new E(this.mainTitle.dom.childNodes[1],true);        
        this.innerLabel = new E(this.mainLabel.dom.childNodes[0],true);
        this.labelOffset = new E(this.innerLabel.dom.childNodes[0],true);
        
        //get the timeline body elements
        this.scroller = new E(this.viewport.dom.childNodes[1],true); //scroller      
        this.mainBody = new E(this.scroller.dom.childNodes[0],true);        
        this.focusEl = new E(this.scroller.dom.childNodes[1],true); 
        this.activitiesArea = new E(this.scroller.dom.childNodes[2],true);
        this.currentTimeMarker = new E(this.scroller.dom.childNodes[3],true);
        
        //the focus element is here to allow this control to have focus.  swallow all events        
        this.focusEl.swallowEvent("click", true);
        
        //hide the headers if configured to do so
        if(this.schedule.hideHeaders){
            this.mainHeader.setDisplayed(false); //hide the header
            this.mainTitle.setDisplayed(false); //hide the title area
        }        
    },
           
    //If the schedule does not end in the past, a task will run on the configured interval
    //to update the position of the timeline marker
    startCurrentTimeUpdater : function(){        
        if(new Date() < this.sm.endDate){
            Ext.TaskMgr.start({
		        run: function(){
		            this.updateCurrentTimeLocation();
		        },		        
		        scope: this,
		        interval: 60000
		    }); 
        }
    },
    
    //sets the size of the control's components based on the size of the control's container           
    layout : function(){
        if(!this.mainBody){
            return; // not rendered yet
        }
        var s = this.schedule,
            c = s.getScheduleEl(),
            csize = c.getSize(true),
            vw = csize.width,
            lw =this.labelWidth;
            
        if(vw < 20 || csize.height < 20){ // display: none?
            return;
        }

        this.el.setSize(csize.width, csize.height);
        var hdHeight = this.mainHeader.getHeight();        
        var vh = csize.height - hdHeight;        
        var sw = vw - lw;
        this.scroller.setSize(sw, vh);
        
        //heights need to be set based on if the horizontal scrollbar is present
        var ih = vh; //inner height
        if(this.timelineWidth > sw){
            ih -= 16; //assuming 16 is horizontal scrollbar height
        }        
        
        var bh = Math.max(ih, this.bodyHeight);
        this.mainBody.setHeight(bh);        
        this.activitiesArea.setSize(this.timelineWidth, bh);        
        this.currentTimeMarker.setHeight(bh);
        
        if(this.innerHeader){            
            this.innerHeader.style.width = (vw)+'px';
        }   
                        
        this.sidePanel.setWidth(lw);
        this.innerLabel.setSize(lw, ih);
        
        var tw = lw - this.resizerWidth;
        this.titleInner.setWidth(tw);
        this.mainTitle.setHeight(hdHeight);
        
        this.resizer.setLeft(tw);        
        this.timelineArea.setLeft(lw + 1);  //1 pixel for the border
        
        this.syncHeaderScroll();
        this.onLayout(vw, vh);
    },
    refresh: function() {
        this.renderUI();
        this.layout();
        //var sw = 843;
        //var vh = 339;
        this.fireEvent('refresh');
    },    
    // template function for subclasses and plugins    
    onLayout : function(width, height){
        // do nothing
    },
          
    
    /*************************************************************
    scrolling control
    *************************************************************/
    //returns an object containing a left and top property to indicate the scroll position of the schedule body
    getScrollState : function(){
        var sb = this.scroller.dom;
        return {left: sb.scrollLeft, top: sb.scrollTop};
    },

    // moves the schedule body to the 0,0 position 
    restoreScroll : function(state){
        var sb = this.scroller.dom;
        sb.scrollLeft = state.left;
        sb.scrollTop = state.top;
    },

    /*
     * Scrolls the grid to the top
     */
    scrollToTop : function(){
        this.scroller.dom.scrollTop = 0;
        this.scroller.dom.scrollLeft = 0;
    },

    // private
    syncScroll : function(){
      this.syncHeaderScroll();
      var mb = this.scroller.dom;
        this.schedule.fireEvent("bodyscroll", mb.scrollLeft, mb.scrollTop);
    },

    // scrolls the timeline header to stay synchronized with the schedule body
    syncHeaderScroll : function(){
        var mb = this.scroller.dom;
        this.innerHeader.scrollLeft = mb.scrollLeft;        
        this.innerHeader.scrollLeft = mb.scrollLeft; // second time for IE (1/2 time first fails, other browsers ignore)
        
        this.innerLabel.dom.scrollTop = mb.scrollTop;
        this.innerLabel.dom.scrollTop = mb.scrollTop;
    },
    
    /*************************************************************
    Get/Find functions
    *************************************************************/
    
    //Returns an array of row dom nodes which hold the activities in the schedule
    getActivityRows : function(){
        return this.hasRows() ? this.activitiesArea.dom.childNodes : [];
    },

    //Returns an array of label dom nodes which hold the labels for the schedule
    getLabelRows : function(){
        return this.hasRows() ? this.labelOffset.dom.childNodes : [];
    },

//    //Finds the activity that contains the element passed in
//    findActivity : function(el){
//        if(!el){
//            return false;
//        }
//        return this.fly(el).findParent(this.activitySelector, this.activitySelectorDepth);
//    },
    
    //Finds the label that contains the element passed in
    findLabel : function(el){
        if(!el){
            return false;
        }
        return el.findParent(this.labelSelector, this.labelSelectorDepth);
    },
    
    //Return the dom node representing the row in the timeline at the specified index
    getRow : function(index){
        var a = this.getActivityRows();
        if(a.length > index)
            return a[index];
        
        return null;
    },
    
    //Return the dom node representing the label at the specified index
    getLabel : function(index){
        var a = this.getLabelRows();
        if(a.length > index)
            return a[index];
        
        return null;
    },
    
    //Returns the label row and activity row at the specified index 
    getFullRow : function(index){                
        return {
            labelRow: this.getLabel(index),
            activityRow: this.getRow(index)
        };
    },
    
    //returns true if the control has rows
    hasRows : function(){
        var fc = this.activitiesArea.dom.firstChild;
        return fc && fc.className != 'x-schedule-empty';
    },
    
    //returns the dom node representing the activity passed in
    getActivity : function(rowIndex, activityIndex){
        var rowEl = this.getRow(rowIndex), activity;
        if(rowEl){
            activity = rowEl.childNodes[activityIndex];
        }        
        
        return activity || false;
    },
    
    //returns the id of the timeline header segment that contains the dom element passed in
    findTimelineHeaderId : function(el){
        var cell = Ext.fly(el).findParent('.x-schedule-hd-cell');
        if(cell){
            return this.getTimelineHeaderId(cell);
        }
        
        return false;
    },
    
    //returns the id of the timeline segement represented by the dom element passed in
    getTimelineHeaderId : function(domEl){
        if(domEl){
            var m = domEl.className.match(this.tsRe);
            if(m && m[1]){
                return m[1];
            }
        }
        return false;
    },
    
    //returns the id of the label that contains the dom element passed in
    findLabelIndex : function(domEl){
        var cell = Ext.fly(domEl).findParent('.x-schedule-lc');
        if(cell){            
            return cell.rowIndex || this.getLabelIndex(cell);
        }
        
        return false;
    },
    
    //returns the id of the label represented by the dom element passed in
    getLabelIndex : function(domEl){
        if(domEl){
            var m = domEl.className.match(this.lRe);
            if(m && m[1]){                
                return m[1];
            }
        }
        return false;
    },
    
    findRowIndex : function(domEl){
        var row = Ext.fly(domEl).findParent('.x-schedule-row');
        if(row){            
            return row.rowIndex || this.getRowIndex(row);
        }
        
        return false;
    },
    
    getRowIndex : function(domEl){
        if(domEl){
            var m = domEl.className.match(this.rowRe);
            if(m && m[1]){                
                return m[1];
            }
        }
        return false;
    },
    
    findActivityIndex : function(domEl){
        var a = Ext.fly(domEl).findParent('.x-schedule-activity');
        if(a){            
            return this.getActivityIndex(a);
        }        
        return false;
    },
    
    //returns the index of the activity represented by the domEl passed in
    //{Boolean} returnObj If true, returns an object with two properties: rowIndex, activityIndex
    //                    If false, returns only a Number representing the activityIndex
    getActivityIndex : function(domEl, returnObj){
        if(domEl){
            var m = domEl.className.match(this.actRe);
            if(m && m[1]){   
                //the id should be in the form:  rowIndex-activityIndex.  break it apart
                var di = m[1].indexOf('-'),                    
                    aIndex = m[1].substring(di+1);
                    
                if(returnObj === true){
                    var rowIndex = m[1].substring(0, di);
                    return {
                        rowIndex: parseInt(rowIndex),
                        activityIndex: parseInt(aIndex)
                    };
                }             
                return parseInt(aIndex);
            }
        }
        return false;
    },
    
    
    /*************************************************************
    Utility functions
    *************************************************************/
    
    //returns a flyweight for the given element
    fly : function(el){
        if(!this._flyweight){
            this._flyweight = new Ext.Element.Flyweight(document.body);
        }
        this._flyweight.dom = el;
        return this._flyweight;
    },
    
    //depth first sort of dataset
    treeSort : function() {
        this.dsSorted = true;
    },
     
    //moves the current time marker based on the current time
    updateCurrentTimeLocation : function(){
        var sm = this.sm,
            tm = this.tm,
            now = new Date();
            
        if(now.between(sm.startDate, sm.endDate)){
            var mins = now. getElapsed(sm.startDate) / 60000; 
            this.currentTimeMarker.setLeft(mins * tm.getPixelsPerMinute());
        }
        else{
           this.currentTimeMarker.setLeft(-1);
        }
    },
    
    // private 
    addRowClass : function(row, cls){
        var r = this.getRow(row);
        if(r){
            this.fly(r).addClass(cls);
        }
    },

    // private
    removeRowClass : function(row, cls){
        var r = this.getRow(row);
        if(r){
            this.fly(r).removeClass(cls);
        }
    },
    
    //add event handlers and classes to rows
    processRows : function() {            
        var rows = this.getLabelRows(),
            ctrl = this,
            tn;    //tree node           
        //add event handlers to the tree expand/collapse icons          
        for(var i=0; i<rows.length; i++){
            rows[i].rowIndex = i;
             tn = Ext.fly(rows[i]).child('.x-schedule-lc-tree');  
             if(tn){                
                tn.on('click', function(event){                    
                    ctrl.onTreeNodeClicked(this);  //pass the div that fired the click
                    event.stopEvent();  //prevent the schedule from searching for what was clicked                    
                });
                
                rows[i].hasChildren = true;
             }
             Ext.fly(rows[i]).addClassOnOver('x-schedule-row-over');
        }        
        //add a mouse over class to rows in the timeline
        rows = this.getActivityRows();
        for(var i=0; i<rows.length; i++){
            rows[i].rowIndex = i;
            Ext.fly(rows[i]).addClassOnOver('x-schedule-row-over');
        }
    },
    
    //collapse the row for the given record
    //{Record / Number} record Record from data store or index of record
    collapseRow : function(record) {    
    
        var index = this.getRecordIndex(record);
        var label = this.getLabel(index);   //returns a dom node that contains the row's label
        label.isExpanded = false;
        //Change the expand icon to a collapse icon
        tn = Ext.fly(label).child('.x-schedule-lc-tree');    //get the div that contains the tree icon
        if(tn){
            tn.removeClass('x-schedule-lc-tree-col');
            tn.addClass('x-schedule-lc-tree-exp');
        }
        
        //hide this row - this will also recursively hide child rows
        this.changeChildRowDisplay(index, 'none');                
    },
    
    //expand the row for the given record
    //{Record / Number} record Record from data store or index of record
    expandRow : function(record) {    
        
        var index = this.getRecordIndex(record);
        var label = this.getLabel(index);   //returns a dom node that contains the row's label
        label.isExpanded = true;
        //Change the expand icon to a collapse icon
        var tn = Ext.fly(label).child('.x-schedule-lc-tree');    //get the div that contains the tree icon
        if(tn){
            tn.removeClass('x-schedule-lc-tree-exp');
            tn.addClass('x-schedule-lc-tree-col');            
        }
        
        //show this row - this will also hide child rows
        //send in a condition function that will check to see if the row was previously expanded
        this.changeChildRowDisplay(index, 'block', function(l){ return (l.hasChildren && l.isExpanded === true) });                
    },
    
    //changes the display property of the row's children recursively
    changeChildRowDisplay : function(index, display, conditionFn){                
        var cr = this.getChildRecords(index);
        if(!cr) return;
        for(var i=0; i<cr.length; i++){            
            index = this.ds.indexOf(cr[i]);
            row = this.getFullRow(index);            
            Ext.fly(row.labelRow).setStyle('display', display);            
            Ext.fly(row.activityRow).setStyle('display', display);
            if(!conditionFn || conditionFn(row.labelRow)){
                this.changeChildRowDisplay(index, display);
            }                        
        }
    },
        
    //returns the direct descendants of the record at the given index
    //(Number) index - the index of the parent record in the data store
    //returns an array of records
    getChildRecords : function(index){    
        var ds = this.ds,
            sm = this.sm,           //schedule model
            pi = sm.parentDataIndex,//index of the parentId data
            ii = sm.idIndex,        //index of the id field in the data            
            e = ds.getCount()-1,    //end row      
            rs = ds.getRange(index, e),
            len = rs.length,        //lenght of the record set
            r = [],                 //records to return
            pid,                    //parent id
            r;                      //current row            
            
        if(len <= 1)  //If this is the last record, then there are no child nodes
            return null;
            
        pid = rs[0].data[ii];     //get the id of the parent record
        
        //this is currently a brute force search.  for large datasets, this code should be modified to 
        //track parent nodes in a stack so that it can break early at the end of the tree rooted by the parent                
        for(var i=1; i < len; i++){            
            if(rs[i].data[pi] == pid){
                r.push(rs[i]);
            }
        }
        
        return r;        
    },
    
        
    //Returns the index of the given record.  If the record passed in is a number, it will be returned
    getRecordIndex : function(record){
        var ds = this.ds,
            index;          //index of the record            
 
        if(typeof record === 'number'){
            return record;
        }
        else{
            return ds.indexOf(record);
        }
    },
    
    //Adds the class to the dom node representing the activity.
    addActivityClass : function(row, activity, cls){
        var a = getActivity(row, activity);
        if(a){
            this.fly(a).addClass(cls);
        }   
    },
    
    //Removes the class from the dom node representing the activity.
    removeActivityClass : function(row, activity, cls){
        var a = getActivity(row, activity);
        if(a){
            this.fly(a).removeClass(cls);
        }   
    },
    
    /**
     * Focuses the specified row.
     * @param {Number} row The row index
     */
    focusRow : function(row){
        this.focusActivity(row, 0, false, false);
    },

    /**
     * Focuses the specified activity.
     * @param {Number} row The row index
     * @param {Number} activity The activity index
     * @param {Boolean} hscroll Scroll Horizontally to put the     
     */
    focusActivity : function(row, activity, hscroll){
        row = Math.min(row, Math.max(0, this.getActivityRows().length-1));
        var xy = this.ensureVisible(row, activity, hscroll);
        this.focusEl.setXY(xy||this.scroller.getXY());
        
        if(Ext.isGecko){
            this.focusEl.focus();
        }else{
            this.focusEl.focus.defer(1, this.focusEl);
        }
    },

    // private
    ensureVisible : function(row, activity, hscroll){        
        if(!this.ds){
            return;
        }
        if(typeof row != "number"){
            row = row.rowIndex;
        }        
        if(row < 0 || row >= this.ds.getCount()){
            return;
        }
        activity = (activity !== undefined ? activity : 0);

        var rowEl = this.getRow(row), activityEl;        
        if(!(hscroll === false && activity === 0)){            
            activityEl = this.getActivity(row, activity);
        }
        if(!rowEl){
            return;
        }

        var c = this.scroller.dom;

        var ctop = 0;
        var p = rowEl, stop = this.el.dom;
        while(p && p != stop){
            ctop += p.offsetTop;
            p = p.offsetParent;
        }
        ctop -= this.mainHeader.dom.offsetHeight;

        var cbot = ctop + rowEl.offsetHeight;

        var ch = c.clientHeight;
        var stop = parseInt(c.scrollTop, 10);
        var sbot = stop + ch;

        if(ctop < stop){
          c.scrollTop = ctop;
        }else if(cbot > sbot){
            c.scrollTop = cbot-ch;
        }

        if(hscroll !== false){
            var cleft = parseInt(activityEl.offsetLeft, 10);
            var cright = cleft + activityEl.offsetWidth;

            var sleft = parseInt(c.scrollLeft, 10);
            var sright = sleft + c.clientWidth;
            if(cleft < sleft){
                c.scrollLeft = cleft;
            }else if(cright > sright){
                c.scrollLeft = cright-c.clientWidth;
            }
        }
        return activityEl ? Ext.fly(activityEl).getXY() : [c.scrollLeft+this.el.getX(), Ext.fly(rowEl).getY()];
    },
    
    /*************************************************************
    Event Handlers
    *************************************************************/
    
    onActivitySelect : function(activity){
        this.addActivityClass(activity, 'act-selected');
    },
    
    onActivityDeselect : function(activity){
        this.removeActivityClass(activity, 'act-selected');
    },
    
    //Called when the user resizes the label area
    //paramter:  (Number) diff difference in width from previous
    onColumnSplitterMoved : function(diff){
        this.userResized = true;
        
        //set the new width
        this.labelWidth = this.labelWidth + diff - this.resizerWidth;
             
        this.layout();
        this.schedule.fireEvent("labelresize", this.labelWidth);
    },
    
    // event handler for the data store's load event
    onLoad : function(){
        this.scrollToTop();
    },
    
    // event handler for the data store's datachanged event
    onDataChange : function(){
        this.refresh();        
    },
    
    // event handler for the data store's add event
    onAdd : function(ds, records, index){
        this.refresh();
        //this.insertRows(ds, index, index + (records.length-1));
    },
    
    // event handler for the data store's remove event
    onRemove : function(ds, record, index, isUpdate){
//        if(isUpdate !== true){
//            this.fireEvent("beforerowremoved", this, index, record);
//        }
//        this.removeRow(index);
//        if(isUpdate !== true){
//            this.processRows(index);
//            this.applyEmptyText();
//            this.fireEvent("rowremoved", this, index, record);
//        }
        this.refresh();
    },

    // event handler for the data store's update event
    onUpdate : function(ds, record){
//        this.refreshRow(record);
    },
    
    // event handler for the data store's clear event
    onClear : function(){
        this.refresh();
    },
    
    // event handler for the SchedulePanel headerclick event
    onHeaderClick : function(s, index){
                
    },

    // event handler for the SchedulePanel mouseover event
    onRowOver : function(e, t){
        
    },

    // event handler for the SchedulePanel mouseout event
    onRowOut : function(e, t){
        
    },
    
    onTreeNodeClicked : function(treeNode){    
    
        //find the label
        var label = this.findLabel(treeNode);
        var i = label.rowIndex;
        if(Ext.fly(treeNode).hasClass('x-schedule-lc-tree-col'))
            this.collapseRow(i);
        else
            this.expandRow(i);        
    },
    
    // private
    onRowSelect : function(row){
        this.addRowClass(row, "x-schedule-row-selected");
    },

    // private
    onRowDeselect : function(row){
        this.removeRowClass(row, "x-schedule-row-selected");
    },

    // private
    onActivitySelect : function(row, col){
        var activity = this.getActivity(row, col);
        if(activity){
            this.fly(activity).addClass("x-schedule-act-selected");
        }
    },

    // private
    onActivityDeselect : function(row, col){
        var activity = this.getActivity(row, col);
        if(activity){
            this.fly(activity).removeClass("x-schedule-act-selected");
        }
    },
    
    onResize : function(){
        this.layout();
    }
    
}); //End Ext.extend
  
  

    
    
// private
// This is a support class used internally by the Schedule components
Ext.ux.ScheduleView.SplitDragZone = function(schedule, r){
    this.schedule = schedule;
    this.view = schedule.getView();
    this.marker = this.view.resizeMarker;
    this.proxy = this.view.resizeProxy;
    this.resizer = r;
    Ext.ux.ScheduleView.SplitDragZone.superclass.constructor.call(this, r,
        "scheduleSplitters" + this.schedule.getScheduleEl().id, {
        dragElId : Ext.id(this.proxy.dom), resizeFrame:false
    });
    this.scroll = false;
    this.hw = 5;
};
Ext.extend(Ext.ux.ScheduleView.SplitDragZone, Ext.dd.DDProxy, {

    b4StartDrag : function(x, y){
        //this.view.headersDisabled = true;
        var h = this.view.el.getHeight();
        this.marker.setHeight(h);
        this.marker.show();
        this.marker.alignTo(this.resizer, 'tl-tr');
        this.proxy.setHeight(h);        
        var minx = this.view.labelWidth - this.schedule.minLabelWidth;;        
        this.resetConstraints();
        this.setXConstraint(minx, 1000);
        this.setYConstraint(0, 0);
        this.minX = x - minx;
        this.maxX = x + 1000;
        this.startPos = x;
        Ext.dd.DDProxy.prototype.b4StartDrag.call(this, x, y);
    },

    endDrag : function(e){
        this.marker.hide();
        var v = this.view;
        var endX = Math.max(this.minX, e.getPageX());
        var diff = endX - this.startPos;
       
        v.onColumnSplitterMoved(diff);        
    },

    autoOffset : function(){
        this.setDelta(0,0);
    }
});    