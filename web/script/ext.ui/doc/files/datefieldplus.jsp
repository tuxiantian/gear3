<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../ux/ext.ux.datepickerplus.js"></script>
<script type="text/javascript"
	src="../../ux/ext.ux.datepickerplus-lang-cn.js"></script>
</head>
<body>



	<div class="block">
		<font>代码示例</font>
		<p>配置项目</p>
		<pre class="brush:javascript">
-----------------
API Documentation
-----------------

New config Items
[since 1.4.2]
"showPrevNextTrigger" (DateFieldPlus only and not with multiselection)
To display 2 buttons next to the DateFieldPlus to select next/previous day(s)

"prevNextTriggerType" (DateFieldPlus only not with multiselection)
values:
"m": means +/- month (valid End of month will be considered)
any numeric value: means amount of +/- days

[since 1.4 beta2]
"defaultValue" (DateFieldPlus only)
A String in Dateformat or a DateObject that will be used as initial value when open the picker on an empty datefieldplus

[since 1.4 beta]
"prevNextDaysView" String/Boolean (default "mark")
values:
"mark" : selected days will be marked in prev/next months also
"nomark" will not be marked and are not selectable
false: will hide them, thus are not selectable too
Note: When using anything other than "mark", week or monthclick will not select days outside the current month!

[since 1.2]
"styleDisabledDates": Boolean (default false)
To be able to set custom style dates (eventdates/weekends..) on disabled dates also

"eventDatesSelectable": Boolean (default false)
To disable event-dates selection if desired (even if the dates are not disabled at all)

"disableSingleDateSelection" Boolean (default false)
To force user to use week- or monthselection only

"stayInAllowedRange" Boolean (default true)
When setting minDate/maxDate, this will prevent to change months outside the allowed daterange  (suggested by descheret)

"summarizeHeader": Boolean (default false)
To add an optional global header when using multimonth display containing the month range (e.g. january 2008-october 2008)

[since 1.1 Final]
"allowMouseWheel": Boolean (default true)
Self explaining...

[since 1.1 RC4]
"multiSelectionDelimiter": String (default ',')
For Datefieldplus and Multiselection only

"renderPrevNextButtons": Boolean (default true)
If you want the user not to be able to change the month or force him to use the monthpicker, set this to false

"renderPrevNextYearButtons": Boolean (default false)
Display 2 small double-arrow buttons for changing next/previous year 

"nextYearText": String (default "Next Year (Control+Up)")
Will be displayed as tooltip on NextYear Button (updated locale!)

"prevYearText": String (default "Previous Year (Control+Down)")
Will be displayed as tooltip on PrevYear Button (updated locale!)

"showActiveDate": Boolean (default false)
Will display the active Date to use keynavigation

"shiftSpaceSelect": Boolean (default true)
if set to true (default) and showactivedate is set to true you can select dates on keynavigation by using shift+Space (because the space-key alone will select the today-date)
if this is set to false , this behaviour reverses (shift+space selects today, space alone select the date under the shown activedate from keynavigation)
Remembery Keynavigation works only when the datepicker has got focus which isnt always the case in some browsers

"disableMonthPicker": Boolean (default false)
Self explaining...

"disabledLetter": String/Boolean (default false)
Display e.g. a "X" instead of the daynumber if a date is disabled.

[since 1.0 RC3]
"strictRangeSelect": Boolean (default false)
Set this to true does only allow multiselection in a range without the possibility to create gaps. Selection by CTRL is still possible, but DatepickerPLus checked, if the selected Day(s) append the existing selection of would produce a gap

"displayMask": Number (default 3)
As huge multimonth calendars can take some updating time this will display a mask when the noOfMonth property is higher than the given value in displayMask.
Set to false to never display the mask

"displayMaskText": String (default "Please wait...")
The Message to be displayed when a mask is shown

"defaultEventDatesText": String (default '')
Used if no text-object is given in eventdates

"defaultEventDatesCls": String (default 'x-datepickerplus-eventdates')
Used if no cls-object is given in eventdates

[since 0.9 beta 9]
"allowedDates": Array{Dateobjects}/false (default false)
If this is set with an Array of Dates, only these Dates are available for Selection in the DatepickerPlus, all other dates are automatically disabled

"allowedDatesText": String (default '')
Text to display on the disabled Days as quicktip

"minDate": Date
Alias for minValue

"maxDate": Date
Alias for maxValue

[since 0.9 beta 2]
"disablePartialUnselect" : Boolean/String (default true) (suggested by DVSDevise)
When multiselecting whole months or weeks, already selected days within this week/month will _not_ get unselected anymore. Set this to false, if you want them to get unselected.
Note: When the _whole set_ of the month/week are already selected, they get _all_ unselected anyway.

"renderOkUndoButtons" : Boolean (default true) (suggested by jsakalos)
If set to false, the OK- and Undo-Buttons will not be rendered on Multiselection Calendars
This way any selected Date will be immediatly available in the "selectedDates" Array. If used together with DateMenu or DateFieldPlus you need to click outside the Calendar to make it disappear or press Return (if calendar got focus...)
Works only if multiSelection is set to true

"renderTodayButton" : Boolean (default true) (suggested by jsakalos)
Whether the Today-Button should be rendered

[since 0.9 beta]
"noOfMonth" : Number (default 1)
how many months should be displayed

"noOfMonthPerRow" :Number (default 3)

"fillupRows" : Boolean (default true)
to automatically increase month-amount to fit display-matrix of rows/columns

"showWeekNumber" : Boolean(default true)
to support display of weekNumbers

"selectWeekText" : String (default "Click to select all days of this week")
Will be displayed when hovering over Weeknumber

"selectMonthText" : String (default "Click to select all weeks of this month")
Will be displayed when hovering over WeeknumberHeader

"weekName" : String (default "Wk.")
Text, that appears on the Weeknumber Header

"multiSelection" : Boolean (default false to act like original datepicker)
Whether Multiselection should be possible or not

"multiSelectByCTRL" Boolean (default true)
If set to false, its possible to multiselect the "easy" way (without CTRL) also

"selectedDates" : Array
Holds an array of dateobjects which have been selected (after clicking the OK-Button, or immediatly, if renderOkUndoButtons is set to false)

"preSelectedDates" : Array
Holds an array of date-times (getTime()) which have been selected at runtime (before clicking the OK-Button)

"nationalHolidays" : function(year) (default US Holidays)
Called every year-change to generate holidays with custom CSS

"nationalHolidaysCls" : String (default to 'x-datepickerplus-nationalholidays')
CSS Class to be applied to holidays

"markNationalHolidays" : Boolean (default true)
Whether national Holidays should be marked with different CSS

"markWeekends" : Boolean (default true)
Whether weekends should be marked with different CSS
Custom CSS Days can also be used for cycling weekevents like "every friday"

"weekendDays" : Array (default [6,0] for Saturday and Sunday)
Array of weekdays which are supposed to be weekends

"weekendText" : String (default '')
Text to be display as Quicktips when hovering over weekends

"useQuickTips" : Boolean (default true)
To be able to show cellinfos in nice quicktips instead of cell-titles
Occurs for disabled/eventdates/weekends/holidays days

"pageKeyWarp" : Number(default 1)
Extend pageup/pagedown keynav for custom amount of months forward/backward

"maxSelectionDays" : Boolean (default false for unlimited selection)
To limit the selection of single days to a specific amount

"maxSelectionDaysTitle" : String (default 'Datepicker')
Window-title of the alert-msg which is disdplayed when trying to select more than the allowed amount of days

"maxSelectionDaysText" : String (default 'You can only select a maximum amount of %0 days')
Window-Contentext of the alert-msg which is disdplayed when trying to select more than the allowed amount of days (When translating this use %0 as placeholder for the amount of days)

"undoText" : String (default 'Undo')
Buttontext for the Undo-option

"eventdates" : function(year)
Returns days which are marked by a specific css class and not as selected

"eventDatesRE" : RegExp (default null)
Regular Expression to select custom CSS Days (works just like disabledDaysRE)

"eventDatesRECls" : String (default '')
CSS Class to be used if days are found by eventDatesRE

"eventDatesREText" : String (default '')
Quicktip Text to be displayed if days are found by eventDatesRE

"lastSelectedDate" : Number
Contains the last selected Date.. (getTime() value)

"tooltip" : String/Object (for DateFieldPlus only)
Works exactly like in Buttons-Widget (works on Trigger Button, not field itself to keep invalidText tooltips intact!)

"tooltipType" : String (for DateFieldPlus only)
Works exactly like in Buttons-Widget

"usePickerPlus" : Boolean (for datemenus only)
</pre>


		<p>该控件的事件</p>
		<pre class="brush:javascript">
 Events  可用事件

"onPrevTriggerRelease" (DateFieldPlus only not with multiselection)
Fires when the PrevTrigger MouseUp Event occurs (if omitted the usual select-handler will be triggered)

"onNextTriggerRelease" (DateFieldPlus only not with multiselection)
Fires when the PrevTrigger MouseUp Event occurs (if omitted the usual select-handler will be triggered)


"beforemonthclick"
Called with pickerobject, monthnumber (0=january,1=february...) and selectedState (if true, the whole month was selected, if false, it was unselected)
Fires only when multiSelection=true and showWeekNumbers=true. Return false to cancel selection.

"beforeweekclick"
Called with pickerobject, date (firstdate of clicked week) and selectedState (if true, the whole week was selected, if false, it was unselected)
Fires only when multiSelection=true and showWeekNumbers=true. Return false to cancel selection.

"beforedateclick"
Called with pickerobject and current clicked date
Fires before a date is clicked. Return false to cancel selection.


"beforemousewheel"
Fires before the month will change on mousewheel trigger

"beforemaxdays"
Fires before the default ext alertbox will appear when the amount of maxSelectionDays has been reached (return false to cancel the msgbox appearance)


"beforeyearchange"
Fires everytime before the year of the first month changes (by monthpicker or prev/next(year)-month buttons

"afteryearchange"
Fires everytime after the year of the first month changes (by monthpicker or prev/next(year)-month buttons


"beforemonthchange"
Fires everytime before the first month changes (by monthpicker or prev/next-month buttons

"aftermonthchange"
Fires everytime after the first month changes (by monthpicker or prev/next-month buttons


"aftermonthclick"
Called with pickerobject, monthnumber (0=january,1=february...) and [since 0.9 beta 7]selectedState (if true, the whole month was selected, if false, it was unselected)
Fires only when multiSelection=true and showWeekNumbers=true

"afterweekclick"Called with pickerobject, date (firstdate of clicked week) and [since 0.9 beta 7]selectedState (if true, the whole week was selected, if false, it was unselected)
Fires only when multiSelection=true and showWeekNumbers=true

"afterdateclick"Called with pickerobject, current clicked date and [since 0.9 beta 7] selectedState (if true, the day was selected, if false, it was unselected)
Fires everytime a date is clicked

"undo"
Fires on undo-button-click on multiSelection
		
		</pre>
		<pre class="brush:javascript;" code="code">
/*
 * 限制值能选择指定的日期
 */		
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',	
		bodyStyle : 'padding:5px;',
		labelWidth:150,
		items : [{
			xtype : 'datefieldplus',
			
			fieldLabel:"限制值能选择指定的日子",
			
			showToday:false,// 用于Ext.2.2 不显示 [今天] 按钮
			
			renderTodayButton:false, // 不显示 [今天] 按钮			
			
			format:'Y-m-d',			

			allowBlank : false,	

			readonly : true,

			showWeekNumber : true, // 显示周

			disableMonthPicker : true, // 不显示月

			renderPrevNextButtons:true,// 显示下一月上一月按钮

			renderPrevNextYearButtons : true,// 显示下一年上一年按钮

			showActiveDate : false, //  显示活动的日期

			disabledLetter : "X", // 禁用的遮盖字符

			value : new Date(2011, 4, 8),// 初始化值

			minDate : new Date(2011, 4, 5),// 最小日期

			maxDate : new Date(2011, 4, 26),// 最大日期

			width : 120

		}]
	}]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>







	<div class="block">
		<font>代码示例</font>
		<p>覆盖Ext.form.Field</p>
		<pre class="brush:javascript;" code="code">
/*
 * 只能选择周
 */
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		bodyStyle : 'padding:5px;',
		labelWidth : 150,
		items : [{
			xtype : 'datefieldplus',
			fieldLabel : "限制值能选择指定的日子",
			showToday : true,// 用于Ext.2.2 不显示 [今天] 按钮
			renderTodayButton : false, // 不显示 [今天] 按钮
			format : 'Y-m-d',
			allowBlank : false,
			readonly : true,
			showWeekNumber : true, // 显示周
			startDay:1,			
			disableSingleDateSelection : true,
			maxSelectionDays : 7,
			multiSelection : true,
			renderPrevNextButtons : true,// 显示下一月上一月按钮
			renderPrevNextYearButtons : true,// 显示下一年上一年按钮
			showActiveDate : false, // 显示活动的日期
			width : 120,
			listeners : {
				select : function(field,dates) {
					var from =dates[0].format('Y-m-d')
					var to=dates[dates.length-1].format('Y-m-d');
					alert(from+"到"+to+"第"+dates[0].getWeek()+"周");
				}
			}

		}]
	}]
}).show();


</pre>
		<input type="button" value="运行" class="run" />
	</div>








	<div class="block">
		<font>代码示例</font>
		<p>覆盖Ext.form.Field</p>
		<pre class="brush:javascript;" code="code">
/*
 *  多选并配置三列月历
 */		
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		bodyStyle : 'padding:5px;',
		labelWidth : 150,
		items : [{
			xtype : 'datefieldplus',

			fieldLabel : "多选并配置三列月历",

			showToday : false,// 用于Ext.2.2 不显示 [今天] 按钮

			renderTodayButton : false, // 不显示 [今天] 按钮

			format : 'Y-m-d',

			allowBlank : false,

			readonly : true,

			showWeekNumber : true,// 显示第几周

			noOfMonth : 3,       // 月历显示个数

			noOfMonthPerRow : 1, // 每行显示月历的个数

			useQuickTips : false, // 使用quickTips

			multiSelection : true, // 多选

			width : 210,

			value : [new Date(2011, 4, 8), new Date(2011, 4, 11)]

		}]
	}]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>












	<div class="block">
		<font>代码示例</font>
		<p>覆盖Ext.form.Field</p>
		<pre class="brush:javascript;" code="code">

/*
 * 左右加减箭头
 */
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		bodyStyle : 'padding:5px;',
		labelWidth : 150,
		items : [{
			xtype : 'datefieldplus',

			fieldLabel : "显示左右加减箭头",

			showToday : false,// 用于Ext.2.2 不显示 [今天] 按钮

			renderTodayButton : false, // 不显示 [今天] 按钮

			format : 'Y-m-d',

			allowBlank : false,

			markWeekends : false,// 标出周末

			markNationalHolidays : false, // 显示节日

			showWeekNumber : false, // 显示第几周

			showPrevNextTrigger : true, // 显示左右加减箭头

			width : 210

		}]
	}]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>










	<div class="block">
		<font>代码示例</font>

		<pre class="brush:javascript;" code="code">
/*
 * 一行三列严格限制日期范围
 */		
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		bodyStyle : 'padding:5px;',
		labelWidth : 150,
		items : [{
			xtype : 'datefieldplus',

			fieldLabel : "一行三列严格限制日期范围",

			format : 'Y-m-d',

			allowBlank : false,

			noOfMonth : 3,

			multiSelection : true,

			minDate : new Date(2011, 3, 1),

			maxDate : new Date(2011, 6, 31),

			strictRangeSelect : true, // 严格限制日期范围

			width : 210

		}]
	}]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>











	<div class="block">
		<font>代码示例</font>

		<pre class="brush:javascript;" code="code">
/*
 * 2行2列不使用ctrl 键配合多选
 */
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		bodyStyle : 'padding:5px;',
		labelWidth : 150,
		items : [{
			xtype : 'datefieldplus',

			fieldLabel : "2行2列不使用ctrl 键配合多选",

			format : 'Y-m-d',

			allowBlank : false,

			noOfMonth : 4, // 月历总数

			noOfMonthPerRow : 2,// 每行显示几列

			multiSelection : true, // 是否多选

			multiSelectByCTRL : false, // ctrl 按下连续选择

			maxSelectionDays : 10, // 最多选择多少天

			markNationalHolidays : false, // 显示节日

			renderOkUndoButtons : false, // 渲染 确定 撤销 按钮

			disablePartialUnselect : false, 

			width : 210

		}]
	}]
}).show();


</pre>
		<input type="button" value="运行" class="run" />
	</div>











	<div class="block">
		<font>代码示例</font>

		<pre class="brush:javascript;" code="code">

/*
 * 一行三列限制特点的天
 */
new Ext.Window({
	width : 500,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		bodyStyle : 'padding:5px;',
		labelWidth : 150,
		items : [{
			xtype : 'datefieldplus',

			fieldLabel : "一行三列限制特点的天",

			format : 'Y-m-d',

			allowBlank : false,

			noOfMonth : 3,

			noOfMonthPerRow : 3,

			markWeekends : false,

			pageKeyWarp : 3, // pageup/pagedown 每次点击 导航月总页数

			allowedDates : [

			new Date(2011, 4, 11),

			new Date(2011, 4, 18),

			new Date(2011, 4, 14),

			new Date(2011, 4, 15)

			],

			width : 210

		}]
	}]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>




	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>