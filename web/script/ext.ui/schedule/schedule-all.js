/**
 * @class Ext.ux.AbstractScheduleSelectionModel
 * @extends Ext.util.Observable
 * Abstract base class for schedule SelectionModels.  It provides the interface that should be
 * implemented by descendant classes.  This class should not be directly instantiated.
 * @constructor
 */
Ext.ux.AbstractScheduleSelectionModel = function(){    
    this.locked = false;
    Ext.ux.AbstractScheduleSelectionModel.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.AbstractScheduleSelectionModel, Ext.util.Observable,  {
    /** @ignore Called by the schedule automatically. Do not call directly. */
    init : function(schedule){
        this.schedule = schedule;
        this.initEvents();
    },
    
    /**
     * Locks the selections.
     */
    lock : function(){
        this.locked = true;
    },

    /**
     * Unlocks the selections.
     */
    unlock : function(){
        this.locked = false;
    },

    /**
     * Returns true if the selections are locked.
     * @return {Boolean}
     */
    isLocked : function(){
        return this.locked;
    }
    
});﻿/**
 @class Ext.ux.ScheduleRowSelectionModel
 * @extends Ext.ux.AbstractScheduleSelectionModel
 * The default SelectionModel used by {@link Ext.ux.SchedulePanel}. 
 * @constructor
 * @param {Object} config
 */
Ext.ux.ScheduleRowSelectionModel = function(config){
    Ext.apply(this, config);
    this.selections = new Ext.util.MixedCollection(false, function(o){
        return o.id;
    });

    this.last = false;
    this.lastActive = false;
    
    //add events
    this.addEvents(
        /**
	     * @event selectionchange
	     * Fires when the selection changes
	     * @param {SelectionModel} this
	     */
	    "selectionchange",
        /**
	     * @event beforerowselect
	     * Fires when a row is being selected, return false to cancel.
	     * @param {SelectionModel} this
	     * @param {Number} rowIndex The index to be selected
	     * @param {Boolean} keepExisting False if other selections will be cleared
	     * @param {Record} record The record to be selected
	     */
	    "beforerowselect",
        /**
	     * @event rowselect
	     * Fires when a row is selected.
	     * @param {SelectionModel} this
	     * @param {Number} rowIndex The selected index
	     * @param {Ext.data.Record} r The selected record
	     */
	    "rowselect",
        /**
	     * @event rowdeselect
	     * Fires when a row is deselected.
	     * @param {SelectionModel} this
	     * @param {Number} rowIndex
	     * @param {Record} record
	     */
	    "rowdeselect"
    );
    
     Ext.ux.ScheduleRowSelectionModel.superclass.constructor.call(this);
};


Ext.extend(Ext.ux.ScheduleRowSelectionModel, Ext.ux.AbstractScheduleSelectionModel,  {
    /**
     * @cfg {Boolean} singleSelect
     * True to allow selection of only one row at a time (defaults to false)
     */
    singleSelect : false,
	
    // private
    initEvents : function(){
    
        this.schedule.on("rowmousedown", this.handleMouseDown, this);
    
        this.rowNav = new Ext.KeyNav(this.schedule.getScheduleEl(), {
            "up" : function(e){
                if(!e.shiftKey){
                    this.selectPrevious(e.shiftKey);
                }else if(this.last !== false && this.lastActive !== false){
                    var last = this.last;
                    this.selectRange(this.last,  this.lastActive-1);
                    this.schedule.getView().focusRow(this.lastActive);
                    if(last !== false){
                        this.last = last;
                    }
                }else{
                    this.selectFirstRow();
                }
            },
            "down" : function(e){
                if(!e.shiftKey){
                    this.selectNext(e.shiftKey);
                }else if(this.last !== false && this.lastActive !== false){
                    var last = this.last;
                    this.selectRange(this.last,  this.lastActive+1);
                    this.schedule.getView().focusRow(this.lastActive);
                    if(last !== false){
                        this.last = last;
                    }
                }else{
                    this.selectFirstRow();
                }
            },
            scope: this
        });
        
        var view = this.schedule.view;
        view.on("refresh", this.onRefresh, this);    
        view.on("rowupdated", this.onRowUpdated, this);
        view.on("rowremoved", this.onRemove, this);    
        
    },
    
    //Selects any rows that were selected before the refresh and are still present in the datastore    
    onRefresh : function(){
        var ds = this.schedule.store, index;
        var s = this.getSelections();
        this.clearSelections(true);
        for(var i = 0, len = s.length; i < len; i++){
            var r = s[i];
            if((index = ds.indexOfId(r.id)) != -1){
                this.selectRow(index, true);
            }
        }
        if(s.length != this.selections.getCount()){
            this.fireEvent("selectionchange", this);
        }
        
    },

    //If the record being removed is currently selected, it will be removed from the selections
    //and the selectionchange event will be fired
    onRemove : function(v, index, r){
        if(this.selections.remove(r) !== false){
            this.fireEvent('selectionchange', this);
        }   
    },

    //Forces the view to mark the row as selected after that row has been updated
    onRowUpdated : function(v, index, r){
        if(this.isSelected(r)){
            v.onRowSelect(index);
        }
    },
    
    /**
     * Select records.
     * @param {Array} records The records to select
     * @param {Boolean} keepExisting (optional) True to keep existing selections
     */
    selectRecords : function(records, keepExisting){
        if(!keepExisting){
            this.clearSelections();
        }
        var ds = this.schedule.store;
        for(var i = 0, len = records.length; i < len; i++){
            this.selectRow(ds.indexOf(records[i]), true);
        }
    },
    
    /**
     * Gets the number of selected rows.
     * @return {Number}
     */
    getCount : function(){
        return this.selections.length;
    },

    /**
     * Selects the first row in the grid.
     */
    selectFirstRow : function(){
        this.selectRow(0);
    },

    /**
     * Select the last row.
     * @param {Boolean} keepExisting (optional) True to keep existing selections
     */
    selectLastRow : function(keepExisting){
        this.selectRow(this.schedule.store.getCount() - 1, keepExisting);
    },

    /**
     * Selects the row immediately following the last selected row.
     * @param {Boolean} keepExisting (optional) True to keep existing selections
     * @return {Boolean} True if there is a next row, else false
     */
    selectNext : function(keepExisting){
        if(this.hasNext()){
            this.selectRow(this.last+1, keepExisting);
            this.schedule.getView().focusRow(this.last);
			return true;
        }
		return false;
    },
    
    /**
     * Selects the row that precedes the last selected row.
     * @param {Boolean} keepExisting (optional) True to keep existing selections
     * @return {Boolean} True if there is a previous row, else false
     */
    selectPrevious : function(keepExisting){
        if(this.hasPrevious()){
            this.selectRow(this.last-1, keepExisting);
            this.schedule.getView().focusRow(this.last);
			return true;
        }
		return false;
    },

    /**
     * Returns true if there is a next record to select
     * @return {Boolean}
     */
    hasNext : function(){
        return this.last !== false && (this.last+1) < this.schedule.store.getCount();
    },

    /**
     * Returns true if there is a previous record to select
     * @return {Boolean}
     */
    hasPrevious : function(){
        return !!this.last;
    },
    
    /**
     * Returns the selected records
     * @return {Array} Array of selected records
     */
    getSelections : function(){
        return [].concat(this.selections.items);
    },

    /**
     * Returns the first selected record.
     * @return {Record}
     */
    getSelected : function(){
        return this.selections.itemAt(0);
    },
    
    /**
     * Calls the passed function with each selection. If the function returns false, iteration is
     * stopped and this function returns false. Otherwise it returns true.
     * @param {Function} fn
     * @param {Object} scope (optional)
     * @return {Boolean} true if all selections were iterated
     */
    each : function(fn, scope){
        var s = this.getSelections();
        for(var i = 0, len = s.length; i < len; i++){
            if(fn.call(scope || this, s[i], i) === false){
                return false;
            }
        }
        return true;
    },

    /**
     * Clears all selections.
     */    
    clearSelections : function(fast){        
        if(this.locked) return;
        if(fast !== true){
            var ds = this.schedule.store;
            var s = this.selections;
            s.each(function(r){
                this.deselectRow(ds.indexOfId(r.id));
            }, this);
            s.clear();
        }else{
            this.selections.clear();
        }
        this.last = false;
    },
    
    /**
     * Selects all rows.
     */
    selectAll : function(){  
        if(this.locked) return;      
        this.selections.clear();
        for(var i = 0, len = this.schedule.store.getCount(); i < len; i++){
            this.selectRow(i, true);
        }
    },

    /**
     * Returns True if there is a selection.
     * @return {Boolean}
     */
    hasSelection : function(){
        return this.selections.length > 0;
    },

    /**
     * Returns True if the specified row is selected.
     * @param {Number/Record} record The record or index of the record to check
     * @return {Boolean}
     */
    isSelected : function(index){
        var r = typeof index == "number" ? this.schedule.store.getAt(index) : index;
        return (r && this.selections.key(r.id) ? true : false);
    },

    /**
     * Returns True if the specified record id is selected.
     * @param {String} id The id of record to check
     * @return {Boolean}
     */
    isIdSelected : function(id){
        return (this.selections.key(id) ? true : false);
    },
    
    // private
    handleMouseDown : function(g, rowIndex, e){
        if(e.button !== 0 || this.isLocked()){
            return;
        };
        var view = this.schedule.getView();
        if(e.shiftKey && this.last !== false){
            var last = this.last;
            this.selectRange(last, rowIndex, e.ctrlKey);
            this.last = last; // reset the last
            view.focusRow(rowIndex);
        }else{
            var isSelected = this.isSelected(rowIndex);
            if(e.ctrlKey && isSelected){
                this.deselectRow(rowIndex);
            }else if(!isSelected || this.getCount() > 1){
                this.selectRow(rowIndex, e.ctrlKey || e.shiftKey);
                view.focusRow(rowIndex);
            }
        }        
    },
    
    /**
     * Selects multiple rows.
     * @param {Array} rows Array of the indexes of the row to select
     * @param {Boolean} keepExisting (optional) True to keep existing selections (defaults to false)
     */
    selectRows : function(rows, keepExisting){
        if(!keepExisting){
            this.clearSelections();
        }
        for(var i = 0, len = rows.length; i < len; i++){
            this.selectRow(rows[i], true);
        }
    },

    /**
     * Selects a range of rows. All rows in between startRow and endRow are also selected.
     * @param {Number} startRow The index of the first row in the range
     * @param {Number} endRow The index of the last row in the range
     * @param {Boolean} keepExisting (optional) True to retain existing selections
     */
    selectRange : function(startRow, endRow, keepExisting){
        if(this.locked) return;
        if(!keepExisting){
            this.clearSelections();
        }
        if(startRow <= endRow){
            for(var i = startRow; i <= endRow; i++){
                this.selectRow(i, true);
            }
        }else{
            for(var i = startRow; i >= endRow; i--){
                this.selectRow(i, true);
            }
        }
    },
    
    /**
     * Deselects a range of rows. All rows in between startRow and endRow are also deselected.
     * @param {Number} startRow The index of the first row in the range
     * @param {Number} endRow The index of the last row in the range
     */
    deselectRange : function(startRow, endRow, preventViewNotify){
        if(this.locked) return;
        for(var i = startRow; i <= endRow; i++){
            this.deselectRow(i, preventViewNotify);
        }
    },

    /**
     * Selects a row.
     * @param {Number} row The index of the row to select
     * @param {Boolean} keepExisting (optional) True to keep existing selections
     */
    selectRow : function(index, keepExisting, preventViewNotify){
        if(this.locked || (index < 0 || index >= this.schedule.store.getCount()) || this.isSelected(index)) return;
        var r = this.schedule.store.getAt(index);
        if(r && this.fireEvent("beforerowselect", this, index, keepExisting, r) !== false){
            if(!keepExisting || this.singleSelect){
                this.clearSelections();
            }
            this.selections.add(r);
            this.last = this.lastActive = index;
            if(!preventViewNotify){
                this.schedule.getView().onRowSelect(index);
            }
            this.fireEvent("rowselect", this, index, r);
            this.fireEvent("selectionchange", this);
        }
    },

    /**
     * Deselects a row.
     * @param {Number} row The index of the row to deselect
     */
    deselectRow : function(index, preventViewNotify){
        if(this.locked) return;
        if(this.last == index){
            this.last = false;
        }
        if(this.lastActive == index){
            this.lastActive = false;
        }
        var r = this.schedule.store.getAt(index);
        if(r){
            this.selections.remove(r);
            if(!preventViewNotify){
                this.schedule.getView().onRowDeselect(index);
            }
            this.fireEvent("rowdeselect", this, index, r);
            this.fireEvent("selectionchange", this);
        }
    },

    // private
    restoreLast : function(){
        if(this._last){
            this.last = this._last;
        }
    }

});﻿/**
 * @class Ext.ux.ScheduleModel This is the default implementation of a
 *        ScheduleModel used by the SchedulePanel. <br>
 *        Usage:<br>
 * 
 * <pre><code>
 *  var scheduleModel = new Ext.ux.ScheduleModel({
 *     title:  'My Schedule',    
 *     titleRenderer: null,    
 *     labelDataIndex: 'label',    
 *     labelRenderer: this.scheduleLabelRenderer,
 *     labelWidth: 250,        
 *     activityDataIndex: 'activity',
 *     activityRenderer: this.activityRenderer
 *     idIndex: 'id',
 *     startDateIndex: 'startDate',
 *     endDateIndex: 'endDate',
 *     parentDataIndex: 'parentId',
 *     colorDataIndex: 'color',
 *     startDate: '1/1/2009',
 *     endDate: new Date()    
 *  });
 * </code></pre>
 * 
 * A start and end date can be specified explicitly. If they are not specified,
 * the schedule will determine the start and end dates by finding the earliest
 * and latest date in the data store
 */
Ext.ux.ScheduleModel = function(config) {

	/**
	 * @cfg {String} title Title that will appear in the upper-left corner of
	 *      the schedule above the labels (defaults to 'Schedule')
	 */
	this.title = 'Schedule';

	/**
	 * @cfg {Function} titleRenderer A function used to generate HTML markup for
	 *      the title given the title's data value. If not specified, the
	 *      default renderer uses the raw data value.
	 */
	this.titleRenderer = function() {		
		return this.title;
	};

	/**
	 * @cfg {String} labelDataIndex The name of the field in the DataStore that
	 *      contains the label data.
	 */
	this.labelDataIndex = undefined;

	/**
	 * @cfg {Function} labelRenderer A function used to generate HTML markup for
	 *      the label given the label's data value. If not specified, the
	 *      default renderer uses the raw data value.
	 */
	this.labelRenderer = undefined;

	/**
	 * @cfg {Number} labelWidth The starting width of the label area of the
	 *      SchedulePanel. This can be resized by the user
	 */
	this.labelWidth = 250;

	/**
	 * @cfg {String} activityDataIndex The name of the field in the DataStore
	 *      that contains the activity data. The activity is the item that will
	 *      be present in the scrollable timeline area of the SchedulePanel
	 */
	this.activityDataIndex = undefined;

	/**
	 * @cfg {Function} activityRenderer A function used to generate HTML markup
	 *      for the activity given the activity's data value. If not specified,
	 *      the default renderer uses the raw data value.
	 */
	this.activityRenderer = undefined;

	/**
	 * @cfg {String} idIndex The name of the field in the DataStore that
	 *      contains the id for the record. If the data is hierarchical and to
	 *      be displayed in a tree form, then the id field is used to determine
	 *      the parent/child relationship between records along with the
	 *      parentDataIndex parameter. If the data is not hierarchical then both
	 *      the idIndex and parentDataIndex parameters are optional
	 */
	this.idIndex = undefined;

	/**
	 * @cfg {String} parentDataIndex The name of the field in the DataStore that
	 *      contains the parent id for the record. If the data is hierarchical
	 *      and to be displayed in a tree form, then the parentDataIndex field
	 *      is used to determine the parent/child relationship between records
	 *      along with the idIndex parameter. The parentDataIndex field should
	 *      contain the id of another record in the data store or null if it is
	 *      a root level record. If the data is not hierarchical then both the
	 *      idIndex and parentDataIndex parameters are optional
	 */
	this.parentDataIndex = undefined;
	this.colorDataIndex = undefined;
	/**
	 * @cfg {String/Date} startDate The first date that will be shown in the
	 *      Timeline portion of the SchedulePanel. This parameter can be a Date
	 *      object or a string which can be used to create a Date object. The
	 *      SchedulePanel may adjust the actual start date shown based on the
	 *      TimelineModel. For example, if the startDate is specified as
	 *      1/1/2009 05:22:00 and the TimelineModel is set to show a time
	 *      interval of every 30 minutes, then the actual start date would
	 *      become 1/1/2009 05:00:00
	 */
	this.startDate = undefined;

	/**
	 * @cfg {String/Date} endDate The last date that will be shown in the
	 *      Timeline portion of the SchedulePanel. This parameter can be a Date
	 *      object or a string which can be used to create a Date object. The
	 *      SchedulePanel may adjust the actual end date shown based on the
	 *      TimelineModel. For example, if the endDate is specified as 1/5/2009
	 *      06:41:00 and the TimelineModel is set to show a time interval of
	 *      every 30 minutes, then the actual end date would become 1/5/2009
	 *      07:00:00
	 */
	this.endDate = undefined;

	this.dateFormat = 'Y-m-d H:i';

	Ext.apply(this, config);
	if (typeof this.startDate === 'string') {
		this.startDate = Date.parseDate(this.startDate, this.dateFormat);
	}

	if (typeof this.endDate === 'string') {
		this.endDate = Date.parseDate(this.endDate, this.dateFormat);
	}

};﻿/**
 * @class Ext.ux.TimelineModel 
 * @extends Ext.util.Observable
 * This is the default implementation of a TimelineModel used by the SchedulePanel. 
 * This class is initialized with an Array of timeUnit config objects.
 * <br><br>
 * An individual timeUnit's config object defines the time unit type, the renderer used to 
 * render the time unit, the width and minWidth of the time unit.  
 * <br>
 * A stagger property is also available.  If it is set to true, a default color staggering will be
 * used.  It can also be set to any css class you wish.  This will be applied to every other time segement rendered.
 * Each timeUnit Config objectwill be be rendered on top of the time unit configs that come after it.  
 * This allows for nesting multiple time units (example:  Days -> Hours). 
 * <br>
 * The increment property allows you to render every Nth time unit.  For example, 
 * {timeUnit: 'HOUR', increment: 4} may render the following into the timeline:
 * 12:00   4:00   8:00   12:00
 * <br>Usage:<br>
 <pre><code>
 var timelineModel = new Ext.ux.TimelineModel([
	{timeUnit: 'DAY', interval: 1, renderer: this.dayRenderer, stagger: true},
	{timeUnit: 'HOUR', interval: 4, renderer: this.hourRenderer, width: 20},
 ]);
 </code></pre> 
*/
Ext.ux.TimelineModel = function(config){
    
    //Setup constants
    if(!Ext.ux.TimelineModel.MINUTE){
        Ext.ux.TimelineModel.MINUTE = 0;
        Ext.ux.TimelineModel.HOUR = 1;
        Ext.ux.TimelineModel.DAY = 2;
        Ext.ux.TimelineModel.MONTH = 3;
        Ext.ux.TimelineModel.YEAR = 4;
    }
    
    this.defaultTimeUnitWidth = 20; //size of each time.  only used by timeline with smallest time unit that is defined in config (ie. MIN)
    this.initial = true;  //used to determine when the initial config is set
    
    this.addEvents(
        /**
	     * @event configchange
	     * Fires when the timeline configuration changes
	     * @param {TimelineModel} this	     
	     */
	    "configchange"	    
	);
	
	//set the configuration    
    this.setConfig(config, true);
	
    Ext.ux.TimelineModel.superclass.constructor.call(this);
};
Ext.extend(Ext.ux.TimelineModel, Ext.util.Observable, {

    /**
     * Reconfigures this timeline model
     * @param {Array} config Array of Column configs
     */
    setConfig : function(config, initial){
        
        this.config = config; 
            
        this.pixelsPerMinute = null;  //this is a local cache that should be cleared when config changes
        
        //create an array that will hold each possible timeline   
        this.timelines = [null,null,null,null,null];
        
        //iterate through the config and add each timeline given to its appropriate spot in the array
        for(var i=0; i<config.length; i++){
            var c = config[i];
            //get the render function if it is defined as a string
            if(typeof c.renderer == "string"){
                c.renderer = Ext.util.Format[c.renderer];
            }     
            //set default increment
            if(!c.interval){
                c.interval = 1;
            }
            //get the numeric version of the time unit (MIN = 0, HOUR = 1, etc)
            if(typeof c.timeUnit === 'string'){
                var timeUnit = Ext.ux.TimelineModel[c.timeUnit];
                //if the string literal was translated to a constant, assign it, otherwise default: 1
                c.timeUnitValue = timeUnit ? timeUnit : 0;
            }
            
            this.timelines[c.timeUnitValue] = c;
        }      
        
        //find the first non-null timeline (smallest time unit first) and set width if not already set
        for(var i=0; i<5; i++){
            if(this.timelines[i] != null){
                this.timelines[i].width = this.timelines[i].width || this.defaultTimeUnitWidth;
                break;
            }
        }
        
        if(!initial){
            this.fireEvent('configchange', this);
        }
    },
   
   
    /**
    * Each of the next 5 functions return an object with info needed to render a specific timeline
    * based on this TimelineModel and the start/end dates passed in
    returns an object like this:
    * { startDate: '1/1/2009 03:00',    //first minute to render
    *   startSpan: 1,                   //span of this unit in the timeline
    *   nextDateFn: <fn>,               //function to call to get the next date
    *   nextDateSpan: 7,                //span to use for each call to the nextDateFn
    *   nextDateCallCount,              //number of times to call the nextDateFn    
    *   lastDateSpan: 5,                //span of the last date
    *   unitWidth: 20                   //width of each time unit
    * } 
    * @param {Date} startDate Start Date
    * @param {Date} endDate End Date
    */
    getMinuteTimelineConfig : function(startDate, endDate){
        //If the MINUTE timeline was not defined in the config, return
        if(!this.timelines[0]) {
            return null;
        }
        
        if(!Ext.isDate(startDate))
            startDate = new Date(startDate);
        
        if(!Ext.isDate(endDate))
            endDate = new Date(endDate);
        
        var sd = this.dateToObject(startDate); //convert the date to a simple object                  
        var ed = this.dateToObject(endDate); //convert the date to a simple object
        var t = this.timelines[0]; //the MINUTE timeline
       
        //If the interval is not 1, ensure the startDate minutes are on an even interval
        if(t.interval !== 1){    
            sd.m = this.getFirstInterval(0, t.interval, sd.m, 60);                        
        }
                
        //setup the object to be returned
        var newStartDate = new Date(sd.yy, sd.mm, sd.dd, sd.hh, sd.m);
        var newEndDate = new Date(ed.yy, ed.mm, ed.dd, ed.hh, ed.m);  //removes seconds, etc that might be present
        
        //calculate the number of minutes that occur between the endDate and startDate
        var ms = newStartDate.getElapsed(newEndDate);   //get the milliseconds between the two dates
        var mins = ms / 60000;                          //convert to minutes
        var nextCount = mins / t.interval;              //number of times the interval is divisible
        if(mins % t.interval != 0) nextCount++;         //add an extra if there are minutes left over
        
        //set the modified start date on the timeline model
        this.startDate = newStartDate;
        
        var minCfg = {
            startDate : newStartDate,
            startSpan : 1, //span is always 1 for minutes since they are the smallest time unit
            nextDateFn: function(){
                newStartDate = newStartDate.add(Date.MINUTE, t.interval);
                return newStartDate;
            },
            nextDateSpan: 1, //always 1 for minutes
            nextDateCallCount: nextCount,
            lastDateSpan: 1,
            unitWidth: t.width
        };
        
        return minCfg;
    },
    
    /*  
    * @param {Date} startDate Start Date
    * @param {Date} endDate End Date
    * @param {Object} minuteTimelineConfig If there is a minute timeline configured, it needs to be sent in (optional)
    */
    getHourTimelineConfig : function(startDate, endDate, minuteTimelineConfig){
        //If the HOUR timeline was not defined in the config, return
        if(!this.timelines[1]) {
            return null;
        }
        
        var sd = this.dateToObject(startDate); //convert the date to a simple object                  
        var ed = this.dateToObject(endDate); //convert the date to a simple object
        var t = this.timelines[1]; //the HOUR timeline
       
        //If the interval is not 1, ensure the startDate hours are on an even interval
        if(t.interval !== 1){    
            sd.hh = getFirstInterval(0, t.interval, sd.hh, 23);                        
        }
                
        //setup the object to be returned 
        var newStartDate = new Date(sd.yy, sd.mm, sd.dd, sd.hh, sd.m);
        var newEndDate = new Date(ed.yy, ed.mm, ed.dd, ed.hh, ed.m);  //removes seconds, etc that might be present
        
        //calculate the number of hours that occur between the endDate and startDate
        var ms = newStartDate.getElapsed(newEndDate);   //get the milliseconds between the two dates
        var hours = ms / 3600000;                        //convert to hours
        var nextCount = hours / t.interval;              //number of times the interval is divisible
        if(mins % t.interval != 0) nextCount++;         //add an extra if there are hours left over
        
        var ss, //start span
            ns, //next span
            ls; //last span
            
        //If there was no minute timeline passed in, this is the smallest time unit, so all spans = 1
        if(!minuteTimelineConfig){
            ss = ns = ls = 1;
        }
        else {
            
        }
        
        
        
        var minCfg = {
            startDate : newStartDate,
            startSpan : 1, //span is always 1 for minutes since they are the smallest time unit
            nextDateFn: function(){
                newStartDate = newStartDate.add(Date.MINUTE, t.interval);
                return newStartDate;
            },
            nextDateSpan: 1, //always 1 for minutes
            nextDateCallCount: nextCount,
            lastDateSpan: 1
        };
        
        return minCfg;
    },
    
    /**
    * Returns the number of pixels in a minute based on the timeline config
    * @param {Date} d Date to convert    
    */
    getPixelsPerMinute : function() {
        if(this.pixelsPerMinute)  //if we have already cached the value
            return this.pixelsPerMinute;        
            
        var t = this.timelines,
            v; //value
       
        if(t[0] != null)
            v = t[0].width / t[0].interval;  //minutes
        else if(t[1] != null)
            v = t[1].width / (t[1].interval * 60); //hours
        else if(t[2] != null)
            v = t[2].width / (t[2].interval * 1440); //days
//        else if(t[3] != null)
//            return t[3].width / (t[3].interval * 60); //months
//        else if(t[4] != null)
//            return t[4].width / (t[4].interval * 60); //years

        this.pixelsPerMinute = v;  //cache the result
        return v;
    },
    
    /**
    * Utility to convert a Date to a object with simple property names
    * @param {Date} d Date to convert    
    */
    dateToObject : function(d) {
        return {
            yy: d.getFullYear(),
            mm: d.getMonth(),
            dd: d.getDate(),                    
            hh: d.getHours(), 
            m : d.getMinutes()
        };
    },
    
    /**
    * Utility to find the first interval that occurs before the given value in a range
    * between start and max.  Used when displaying minute timeline in 15 min increments:
    * 3:00  3:15  3:30  3:45  4:00
    * and given a date with 3:33.  The timeline should start on an even interval: 3:30
    * @param {Number} start first value in the range
    * @param {Number} interval the interval to increment by each time
    * @param {Number} value the value to find the preceeding interval for
    * @param {Number} max highest number in the range
    **/
    getFirstInterval : function(start, interval, value, max){
               
        var lastInt = start, //holds the last interval as we loop
            nv = -1;      //the new value
        
        for(var i=interval; i<max; i+=interval){
            if(value < i){
                nv = lastInt;
                break;
            }
            lastInt = nv;
        }
        
        //if max is not divisible by the interval, we may need to set the value here
        if(nv == -1)
            nv = lastInt;
            
        //return the new value
        return nv;  
    },
        
    /**
    * Highlights a specific timeUnit of time
    * @param {String} timeUnit to highlight: MIN, HOUR, DAY, 
    * @param {Date} date date to highlight
    * @param {String} css to apply for the highlight (defaults to light yellow) (optional)     
    */
    highlight: function(timeUnit, date, css){
        
    },
    
    /**
     * Highlights a specific point or range of time
     * @param {Date} startDate date to begin highlight
     * @param {Date} endDate date to end highlight
     * @param {String} css to apply for the highlight (defaults to light yellow) (optional)     
     */
    highlightRange: function(startDate, endDate, css){
        
    }

});

// private
Ext.ux.TimelineModel.defaultRenderer = function(value){
	if(typeof value == "string" && value.length < 1){
	    return "&#160;";
	}
	return value;
};﻿/**
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
});    ﻿/**
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