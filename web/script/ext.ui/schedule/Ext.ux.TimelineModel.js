/**
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
};