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
    
});