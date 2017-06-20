/**
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

};