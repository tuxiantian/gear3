/**
 * @class Ext.ui.Msg Passive popup box (a toast) singleton
 * @require Ext.ErrorTip
 * @singleton
 */
Ext.ns("Ext.ui");
Ext.ui.Msg = function() {
	var msgCt;
	function createBox(t, s) {
		return ['<div class="msg">', '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
				'<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
				'<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>', '</div>'].join('');
	}

	return {
		/**
		 * Shows popup
		 * 
		 * @member Ext.ui.Msg
		 * @param {String}
		 *            title
		 * @param {String}
		 *            format
		 */
		show : function(title, format) {
			if (!msgCt) {
				msgCt = Ext.DomHelper.insertFirst(document.body, {
					id : Ext.id() + 'msg-div',
					style : 'position:absolute;z-index:10000;width:250px;'
				}, true);
				msgCt.alignTo(document, 't-t', [0, 10]);
			}
			var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
			var m = Ext.DomHelper.append(msgCt, {
				html : createBox(title, s)
			}, true);
			var me = this;
			me.fx(m);
			m.on("mouseover", function() {
				m.stopFx();
			});
			m.on("mouseout", function() {
				m.pause(Ext.tipTimeout ? Ext.tipTimeout : 2).ghost("t", {
					remove : true
				});
			});
			return this;
		},
		fx : function(m) {
			m.slideIn().pause(Ext.tipTimeout ? Ext.tipTimeout : 2).ghost("t", {
				remove : true
			});
		},showAt:function(t,postion){
		    postion=postion||'tl-tr';
		    if(t instanceof Ext.Component){
		       t=t.wrap||t.el||document;
		    }
		    msgCt.alignTo(t,postion);
			return this;
		}
	};

}();


Ext.tip = function(msg) {
	if (Ext.type(msg) == 'string') {
		return Ext.ui.Msg.show.apply(Ext.ui.Msg, arguments);
	} else if (Ext.type(msg) == 'object') {
		if (msg.success) {
			return Ext.ui.Msg.show.call(Ext.ui.Msg, '提示', msg.msg);
		} else {
			Ext.error(msg.msg, msg.detail);
		}
	}
};
