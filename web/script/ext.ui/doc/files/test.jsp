<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<head>
<title>drag and drop</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<style type="text/css">
body {
	padding: 10px;
}

.availableLot {
	width: 105px;
	border: 1px solid #999999;
	padding: 10px;
	height: 290px;
	-moz-border-radius: 17px;
	-webkit-border-radius: 17px;
}

.rented,.repair {
	width: 195px;
}

.availableLot div {
	-moz-border-radius: 5px;
	-webkit-border-radius: 5px;
	width: 85px;
	border: 1px solid #666666;
	padding: 3px;
	background-color: #FFFFFF;
	margin: 5px;
	cursor: move;
	text-align: center;
}

#cars div,#trucks div {
	margin: 5px;
	width: 85px;
}

#repair div,#rented div {
	float: left;
	margin: 2px;
	/*padding:           3px;*/
}

.imgThumb {
	height: 57px;
	width: 77px;
	border: 1px solid #777777;
}

.dropOK {
	background-color: #99ff99 !important;
}

.dropNotOK {
	border: 1px solid #FF0000 !important;
}
</style>

<!--[if IE]>

<style type="text/css">
    body  {
        padding: 10px;
    }

    .availableLot {
        width:            120px;
        border:           1px solid #999999;
        padding:          10px;
        height:           320px;
    }


    .rented, .repair {
        width:            210px;
    }

    .availableLot div {
        width:             85px;
        border:            1px solid #666666;
        padding:           3px;
        background-color:  #FFFFFF;
        margin:            5px;
        cursor:            move;
        text-align:        center;
    }

    #cars div, #trucks div {
        margin: 5px;
        width:  85px;
    }

    #repair div, #rented div {
        float:  left;
        margin: 2px;
    }

    .imgThumb {
        height:  57px;
        width:   77px;
        border:  1px solid #777777;
    }


    .dropOK {
        background-color: #99ff99 !important;
    }

    .dropNotOK {
        border: 1px solid #FF0000 !important;
    }
</style>
<![endif]-->
</head>
<body>
	<table class="x-unselectable">
		<tr>
			<td>
				<table>
					<tr>
						<td align='center'>Available Cars</td>
						<td align='center'>Available Trucks</td>
					</tr>


					<tr>
						<td>
							<div id="cars" class="availableLot">
								<div>
									<img src="test_files/camaro.jpg" class="imgThumb" qtip="Camaro" />
								</div>
								<div>
									<img src="test_files/miata.jpg" class="imgThumb" qtip="Miata" />
								</div>
								<div>
									<img src="test_files/mustang.jpg" class="imgThumb"
										qtip="Mustang" />
								</div>
								<div>
									<img src="test_files/corvette.jpg" class="imgThumb"
										qtip="Corvette" />
								</div>
							</div>
						</td>

						<td>
							<div id="trucks" class="availableLot trucksLot">
								<div>
									<img src="test_files/f150.jpg" class="imgThumb" qtip="F150" />
								</div>
								<div>
									<img src="test_files/tahoe.jpg" class="imgThumb" qtip="Tahoe" />
								</div>
								<div>
									<img src="test_files/tacoma.jpg" class="imgThumb" qtip="Tacoma" />
								</div>
								<div>
									<img src="test_files/s10.jpg" class="imgThumb" qtip="S10" />
								</div>
							</div>
						</td>
					</tr>

				</table>
			</td>
			<td align='center' style="width: 200px;">
				<table>
					<tr>
						<td align='center' style="width: 200px;">Vehicles Rented</td>
						<td align='center' style="width: 200px;">Vehicles In Repair</td>
					</tr>
					<tr style="">
						<td style="">
							<div id="rented" class="availableLot rented"></div>
						</td>
						<td>
							<div id="repair" class="availableLot repair"></div>
						</td>
					</tr>

				</table>
			</td>
		</tr>
	</table>
	<script type="text/javascript">
		// Create an object that we'll use to implement and override drag behaviors a little later
		var overrides = {// Called the instance the element is dragged.
			b4StartDrag : function() {
				// Cache the drag element
				if (!this.el) {
					this.el = Ext.get(this.getEl());
				}

				//Cache the original XY Coordinates of the element, we'll use this later.
				this.originalXY = this.el.getXY();
			},
			// Called when element is dropped not anything other than a dropzone with the same ddgroup
			onInvalidDrop : function() {
				// Set a flag to invoke the animated repair
				this.invalidDrop = true;
			},
			// Called when the drag operation completes
			endDrag : function() {
				// Invoke the animation if the invalidDrop flag is set to true
				if (this.invalidDrop === true) {
					// Remove the drop invitation
					this.el.removeClass('dropOK');

					// Create the animation configuration object
					var animCfgObj = {
						easing : 'elasticOut',
						duration : 1,
						scope : this,
						callback : function() {
							// Remove the position attribute
							this.el.dom.style.position = '';
						}
					};

					// Apply the repair animation
					this.el.moveTo(this.originalXY[0], this.originalXY[1],
							animCfgObj);
					delete this.invalidDrop;
				}

			},
			onDragDrop : function(evtObj, targetElId) {
				// Wrap the drop target element with Ext.Element
				var dropEl = Ext.get(targetElId);

				// Perform the node move only if the drag element's 
				// parent is not the same as the drop target
				if (this.el.dom.parentNode.id != targetElId) {

					// Move the element
					dropEl.appendChild(this.el);

					// Remove the drag invitation
					this.onDragOut(evtObj, targetElId);

					// Clear the styles
					this.el.dom.style.position = '';
					this.el.dom.style.top = '';
					this.el.dom.style.left = '';
				} else {
					// This was an invalid drop, initiate a repair
					this.onInvalidDrop();
				}
			},// Only called when the drag element is dragged over the a drop target with the same ddgroup
			onDragEnter : function(evtObj, targetElId) {
				// Colorize the drag target if the drag node's parent is not the same as the drop target
				if (targetElId != this.el.dom.parentNode.id) {
					this.el.addClass('dropOK');
				} else {
					// Remove the invitation
					this.onDragOut();
				}
			},
			// Only called when element is dragged out of a dropzone with the same ddgroup
			onDragOut : function(evtObj, targetElId) {
				this.el.removeClass('dropOK');
			}

		};
		// Configure the cars to be draggable
		var carElements = Ext.get('cars').select('div');
		Ext.each(carElements.elements, function(el) {
			var dd = new Ext.dd.DD(el, 'carsDDGroup', {
				isTarget : false
			});
			//Apply the overrides object to the newly created instance of DD
			Ext.apply(dd, overrides);
		});

		var truckElements = Ext.get('trucks').select('div');
		Ext.each(truckElements.elements, function(el) {
			var dd = new Ext.dd.DD(el, 'trucksDDGroup', {
				isTarget : false
			});
			Ext.apply(dd, overrides);
		});

		//Instantiate instances of Ext.dd.DDTarget for the cars and trucks container
		var carsDDTarget = new Ext.dd.DDTarget('cars', 'carsDDGroup');
		var trucksDDTarget = new Ext.dd.DDTarget('trucks', 'trucksDDGroup');

		//Instantiate instnaces of DDTarget for the rented and repair drop target elements
		var rentedDDTarget = new Ext.dd.DDTarget('rented', 'carsDDGroup');
		var repairDDTarget = new Ext.dd.DDTarget('repair', 'carsDDGroup');

		//Ensure that the rented and repair DDTargets will participate in the trucksDDGroup 
		rentedDDTarget.addToGroup('trucksDDGroup');
		repairDDTarget.addToGroup('trucksDDGroup');

		//    Ext.onReady(function() {
		//    Ext.QuickTips.init();
		//    // A list of method overrides
		//    var overrides = {
		//        // Only called when element is dragged over the a dropzone with the same ddgroup
		//        onDragEnter : function(evtObj, targetElId) {
		//            // Colorize the drag target if the drag node's parent is not the same as the drop target
		//            if (targetElId != this.el.dom.parentNode.id) {
		//                this.el.addClass('dropOK');
		//            }
		//            else {
		//                // Remove the invitation
		//                this.onDragOut();
		//            }
		//        },
		//        // Only called when element is dragged out of a dropzone with the same ddgroup
		//        onDragOut : function(evtObj, targetElId) {
		//            this.el.removeClass('dropOK');
		//        },
		//        //Called when mousedown for a specific amount of time
		//        b4StartDrag : function() {
		//            if (!this.el) {
		//                this.el = Ext.get(this.getEl());
		//            }
		//            //this.el.highlight();
		//            //Cache the original XY Coordinates of the element, we'll use this later.
		//            this.originalXY = this.el.getXY();
		//        },
		//        // Called when element is dropped not anything other than a
		//        // dropzone with the same ddgroup
		//        onInvalidDrop : function() {
		//            this.invalidDrop = true;
		//
		//        },
		//        endDrag : function() {
		//            if (this.invalidDrop === true) {
		//                this.el.removeClass('dropOK');
		//
		//                var animCfgObj = {
		//                    easing   : 'elasticOut',
		//                    duration : 1,
		//                    scope    : this,
		//                    callback : function() {
		//                        this.el.dom.style.position = '';
		//                    }
		//                };
		//                this.el.moveTo(this.originalXY[0], this.originalXY[1], animCfgObj);
		//                delete this.invalidDrop;
		//            }
		//
		//        },
		//        // Called upon successful drop of an element on a DDTarget with the same
		//        onDragDrop : function(evtObj, targetElId) {
		//            // Wrap the drop target element with Ext.Element
		//            var dropEl = Ext.get(targetElId);
		//
		//            // Perform the node move only if the drag element's parent is not the same as the drop target
		//            if (this.el.dom.parentNode.id != targetElId) {
		//
		//                // Move the element
		//                dropEl.appendChild(this.el);
		//
		//                // Remove the drag invitation
		//                this.onDragOut(evtObj, targetElId);
		//
		//                // Clear the styles
		//                this.el.dom.style.position ='';
		//                this.el.dom.style.top = '';
		//                this.el.dom.style.left = '';
		//            }
		//            else {
		//                // This was an invalid drop, lets call onInvalidDrop to initiate a repair
		//                this.onInvalidDrop();
		//            }
		//        }
		//    };
		//
		//// Configure the cars to be draggable
		//var carElements = Ext.get('cars').select('div');
		//Ext.each(carElements.elements, function(el) {
		//    var dd = new Ext.dd.DD(el, 'carsDDGroup', {
		//        isTarget  : false
		//    });
		//    Ext.apply(dd, overrides);
		//});
		//
		//var truckElements = Ext.get('trucks').select('div');
		//Ext.each(truckElements.elements, function(el) {
		//    var dd = new Ext.dd.DD(el, 'trucksDDGroup', {
		//        isTarget  : false
		//    });
		//    Ext.apply(dd, overrides);
		//});
		//
		////Instantiate instances of Ext.dd.DDTarget for the cars and trucks container
		//var carsDDTarget    = new Ext.dd.DDTarget('cars','carsDDGroup');
		//var trucksDDTarget = new Ext.dd.DDTarget('trucks', 'trucksDDGroup');
		//
		////Instantiate instnaces of DDTarget for the rented and repair drop target elements
		//var rentedDDTarget = new Ext.dd.DDTarget('rented', 'carsDDGroup');
		//var repairDDTarget = new Ext.dd.DDTarget('repair', 'carsDDGroup');
		//
		////Ensure that the rented and repair DDTargets will participate in the trucksDDGroup
		//rentedDDTarget.addToGroup('trucksDDGroup');
		//repairDDTarget.addToGroup('trucksDDGroup');

		//});
	</script>
</body>
</html>
