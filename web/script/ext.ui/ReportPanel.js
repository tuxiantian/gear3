Ext.ns("Ext.ui");

/**
 * 润乾报表Panel
 */
Ext.ui.ReportPanel = Ext.extend(Ext.ui.IPanel, {
			/**
			 * @cfg {String} 报表文件名称(不包含扩展名)
			 */
			reportName : null,
			initComponent : function() {
				Ext.ui.ReportPanel.superclass.initComponent.call(this);

			},
			afterRender : function() {
				Ext.ui.ReportPanel.superclass.afterRender.call(this);
				this.mask = new Ext.LoadMask(this.getEl(), '报表加载中...');
				this.on('load', function() {
							this.mask.hide();
						}, this);
			},
			/**
			 * 加载报表
			 * 
			 * @param {Object}
			 *            配置
			 */
			load : function(options) {
				options = options || {};
				options.params = options.params || {};
				var url = String.format('{0}?reportName={1}&{2}', Ext.url('/reportView/ReportView.jsp'), this.reportName, Ext.urlEncode(options.params));
				this.mask.show();
				this.loadPage(url, options.callback || Ext.emptyFn());

			}
		});