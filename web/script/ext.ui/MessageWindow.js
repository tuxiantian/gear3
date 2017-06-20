
Ext.ns("biz");

biz.MessageWindow = Ext.extend(Ext.Window, {
    enableScroll: true,
    width: 300,
    height: 200,
    modal: false,
    shadow: false,
    closeAction: "minimize",
    closable: false,
    plain: true,
    layout: 'fit',
    initComponent: function () {
        var win = this;
        this.on("show", function () {
            var el = this.getEl();
            this.alignWindowtoBr();
            el.slideIn('b', {
                easing: 'easeOut',
                duration: 2,
                callback: function () {
                    console.log("ok");
                }
            });
        });

        this.items = new Ext.ui.XGridPanel({
            border: false,
            hideHeaders: true,
            trackMouseOver: true,
            fields: [
                {name: 'id', display: false},
                {name: 'text', header: '测试'}
            ],
            viewConfig: {
                forceFit: true
            },
            storeConfig: {data: [
                {id: '1', text: "你有订单需要处理"},
                {id: '2', text: "你有订单未支付"},
                {id: '3', text: "你有订单需要处理"},
                {id: '4', text: "你有订单未支付"}

            ]}

        });
        this.tools = [
            {
                id: 'restore',
                handler: function (evt, toolEl, owner, tool) {
                   win.toggleCollapse(false);
                   win.alignWindowtoBr();
                }
            }
        ];

        Ext.EventManager.onWindowResize(this.alignWindowtoBr, this);
        biz.MessageWindow.superclass.initComponent.apply(this, arguments);

    },
    alignWindowtoBr: function () {
        this.getEl().alignTo(Ext.getBody(), 'br-br', [-6,
                                                      -6]);
    }

})
;