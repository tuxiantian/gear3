﻿/**
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

});