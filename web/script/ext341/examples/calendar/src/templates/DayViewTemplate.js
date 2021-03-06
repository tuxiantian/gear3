/*
This file is part of Ext JS 3.4

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-04-03 15:07:25
*/
/**
 * @class Ext.calendar.DayViewTemplate
 * @extends Ext.XTemplate
 * <p>This is the template used to render the all-day event container used in {@link Ext.calendar.DayView DayView} and 
 * {@link Ext.calendar.WeekView WeekView}. Internally this class simply defers to instances of {@link Ext.calerndar.DayHeaderTemplate}
 * and  {@link Ext.calerndar.DayBodyTemplate} to perform the actual rendering logic, but it also provides the overall calendar view
 * container that contains them both.  As such this is the template that should be used when rendering day or week views.</p> 
 * <p>This template is automatically bound to the underlying event store by the 
 * calendar components and expects records of type {@link Ext.calendar.EventRecord}.</p>
 * @constructor
 * @param {Object} config The config object
 */
Ext.calendar.DayViewTemplate = function(config){
    
    Ext.apply(this, config);
    
    this.headerTpl = new Ext.calendar.DayHeaderTemplate(config);
    this.headerTpl.compile();
    
    this.bodyTpl = new Ext.calendar.DayBodyTemplate(config);
    this.bodyTpl.compile();
    
    Ext.calendar.DayViewTemplate.superclass.constructor.call(this,
        '<div class="ext-cal-inner-ct">',
            '{headerTpl}',
            '{bodyTpl}',
        '</div>'
    );
};

Ext.extend(Ext.calendar.DayViewTemplate, Ext.XTemplate, {
    // private
    applyTemplate : function(o){
        return Ext.calendar.DayViewTemplate.superclass.applyTemplate.call(this, {
            headerTpl: this.headerTpl.apply(o),
            bodyTpl: this.bodyTpl.apply(o)
        });
    }
});

Ext.calendar.DayViewTemplate.prototype.apply = Ext.calendar.DayViewTemplate.prototype.applyTemplate;
