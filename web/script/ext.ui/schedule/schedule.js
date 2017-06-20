Ext.onReady(function() {

	// create a simple store with some scheduled items
	// note: these items specify a parent field which allows the schedule to
	// nest them
	var scheduleStore = new Ext.ui.CommonStore({
		url : 'data.jsp',
		fields : ['id', 'name', 'activity', 'start', 'end', 'parent', 'color']
	});

	// setup a timeline Model
	var timelineModel = new Ext.ux.TimelineModel([{
		timeUnit : 'MINUTE',
		interval : 30,
		renderer : function(date) {
			return date.format('G:i')
		},
		stagger : false,
		width : 44
	}]);
	var scheduleModel = new Ext.ux.ScheduleModel({
		title : '<span style="font-weight:bold;font-size:13px;">会议室</span>',
		labelDataIndex : 'name',
		labelRenderer : null,
		labelWidth : 120,
		labelAlign : 'left',
		activityDataIndex : 'activity',
		activityRenderer : null,
		idIndex : 'id',
		startDateIndex : 'start',
		endDateIndex : 'end',
		parentDataIndex : 'parent',
		dateFormat : 'Y-m-d H:i',
		colorDataIndex : 'color',
		startDate : '2009-07-23 09:00',
		endDate : '2009-07-23 17:00'
	});

	// create a new schedule panel
	var schedule = new Ext.ux.SchedulePanel({
		store : scheduleStore,
		enableNesting : false,
		tbar : ['-', '会议预定日期:', {
			xtype : 'datefieldplus',
			fieldLabel : "显示左右加减箭头",
			showToday : false,// 用于Ext.2.2 不显示 [今天] 按钮
			renderTodayButton : false, // 不显示 [今天] 按钮
			allowBlank : false,
			markWeekends : false,// 标出周末
			markNationalHolidays : false, // 显示节日
			showWeekNumber : false, // 显示第几周
			showPrevNextTrigger : true, // 显示左右加减箭头
			width : 150,
			readOnly : true,
			value : '2009-07-23',
			format : 'Y-m-d',
			listeners : {
				select : function(f, v) {
					scheduleModel.startDate = v.add(Date.HOUR, 9);
					scheduleModel.endDate = v.add(Date.HOUR, 17);
					scheduleStore.load({
						params : {
							day : v.format('j')
						}
					});
				}
			}
		}],
		timelineModel : timelineModel,
		scheduleModel : scheduleModel,
		selModel : new Ext.ux.ScheduleRowSelectionModel({
			singleSelect : true
		}),
		frame : true,
		height : 400,
		width : 1000
	});
	schedule.render('schedule-example');
	Ext.QuickTips.init();
});
