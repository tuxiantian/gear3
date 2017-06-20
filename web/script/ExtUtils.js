// 常数配置
Ext.Ajax.timeout = 90000;
Ext.DatePicker.prototype.startDay = 1;
Ext.consts = {
    maxRow: 5000,
    treeUrl: "/widgets/getTree.do",
    treeDataUrl: "/widgets/getTreeData.do",
    comboUrl: "/widgets/getCombo.do",
    listDataUrl: "/widgets/getListData.do",
    queryUrl: '/common/query.do',
    saveByXmlUrl: '/common/saveByXml.do',
    saveUrl: '/common/save.do',
    saveGrid: '/common/saveGrid.do',
    extPaging: '/common/extPaging.do',
    exportUrl: '/common/excel.do',
    clearFilter: '清除所有过滤'
};
Ext.url = function (url) {
    url = url || "";
    if (url.indexOf('/') == 0) {
        url = (_base || "") + url;
    } else {
        if (url.indexOf('http:') != 0) {
            var ar = location.pathname.split("/");
            ar.pop();
            url = ar.join("/") + "/" + url;
        }
    }
    return url;
};
// Ext.applyAll merge source to dest
(function () {
    function copy(dest, source) {
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                dest[p] = source[p];
            }
        }
        return dest;

    }

    Ext.applyAll = function (one, tow) {
        var _one = copy({}, one), _tow = copy({}, tow), p, modified = false, i = 0;
        for (p in _tow) {
            if (_one[p] && typeof _tow[p] == 'object' && !Ext.isDate(_tow[p])) {
                if (Ext.isArray(_tow[p])) {
                    for (i = 0; i < _tow[p].length; i++) {
                        _one[p] = _one[p] || [];
                        _one[p].push(_tow[p][i]);
                    }

                } else {
                    _one[p] = Ext.applyAll(_one[p], _tow[p]);
                }

            } else {
                _one[p] = _tow[p];
            }
            modified = true;
        }
        if (modified) {
            return _one;
        } else {
            return one;
        }

    };

})();

(function () {
    Ext.Ajax.on('requestcomplete', function (conn, response, options) {
        if (!response.getResponseHeader) {
            return;
        }
        var JsonError = (typeof response.getResponseHeader == 'function')
            ? response.getResponseHeader('JsonError')
            : response.getResponseHeader['JsonError'], r;
        if (JsonError) {
            var r = Ext.decode(response.responseText);            
            Ext.error(  
            		r.text || r.msg || response.responseText,
                    r.detail || r.msg || response.responseText,
                    function () {
                        if (r.code == 'session_out' || r.code == 'login') {// 会话失效
                            parent.location = Ext.url("/login.jsp");
                        }
                    });
        }
    });
    Ext.Ajax.on("requestexception", function (conn, response, options) {
        var status = response.status, msg, detail;
        switch (status) {
            case 404 :
                msg = "你请求的页面不存在!";
                detail = msg;
                break;
            case 500 :
                msg = "服务器发生错误!\n";
                detail = response.responseText;
                break;
            case 503 :
                msg = "系统重启中...!";
                detail = msg;
                break;
            case 0 :
                msg = "服务器超时...!";
                detail = msg;
                break;
            case -1 :
                msg = "服务器超时...!";
                detail = msg;
                break;
            default :
                msg = "未知错误!";
                detail = msg;
        }
        Ext.error(msg, detail);
    });
})();

Ext.override(Ext.util.MixedCollection, {
    getKey: function (comp) {
        return comp.itemId || comp.id;
    }
});

// 让表格编辑控件能够访问父容器
(function () {
    var initComponent = Ext.Editor.prototype.initComponent;
    Ext.override(Ext.Editor, {
        initComponent: function () {
            initComponent.apply(this, arguments);
            this.field.ct = this;
        }
    });

})();
// 对Ext.Ajax.request 默认加上loading
/**
 * @cfg {string}waitMsg 等待信息
 */
(function () {
    var request = Ext.Ajax.request, mask = false;
    Ext.Ajax.request = function (opt) {
        if (!mask) {
            mask = new Ext.LoadMask(Ext.getBody(), {
                msg: "请稍等..."
            });
        }
        if (opt.waitMsg) {
            opt.callback = opt.callback || function () {
            };
            opt.callback = opt.callback.createSequence(function () {
                mask.hide();
            });
            mask.msg = opt.waitMsg;
            mask.show();
        }
        request.call(Ext.Ajax, opt);
    }

})();
// 记录验证信息
(function () {
    var markInvalid = Ext.form.Field.prototype.markInvalid;
    Ext.override(Ext.form.Field, {
        markInvalid: function (msg) {
            markInvalid.apply(this, arguments);
            this.errorMsg = msg;

        }
    });

})();

// --start js flow control
function Step() {
    var steps = Array.prototype.slice.call(arguments), counter, results;

    function next() {
        if (steps.length <= 0) {
            return;
        }
        var fn = steps.shift();
        counter = 0;
        results = [];
        fn.apply(next, arguments);
    }

    next.parallel = function () {
        var i = counter;
        counter++;
        return function () {
            counter--;
            if (arguments[0]) {
                results[0] = arguments[0];
            }
            results[i + 1] = arguments[1];
            if (counter <= 0) {
                next.apply(null, results);
            }
        };
    };
    next([]);
}
// --end js flow control

// start 下载
/*
 * @param {String} url url to download @param {object} post params
 */
Ext.download = function (url, params) {
    var frame = document.createElement('iframe');
    frame.id = id;
    frame.name = id;
    frame.className = 'x-hidden';
    if (Ext.isIE)
        frame.src = Ext.SSL_SECURE_URL;
    document.body.appendChild(frame);
    if (Ext.isIE)
        document.frames[id].name = id;
    var form = Ext.DomHelper.append(Ext.getBody(), {
        tag: 'form',
        method: 'post',
        target: id,
        action: url,
        cls: 'x-hidden'
    }, true);
    var hiddens, hd;
    if (params) { // add dynamic params
        hiddens = [];
        for (var k in params) {
            hd = document.createElement('input');
            hd.type = 'hidden';
            hd.name = k;
            hd.value = params[k];
            form.appendChild(hd);
            hiddens.push(hd);
        }
    }
    form.dom.submit();
    if (hiddens) { // remove dynamic params
        for (var i = 0, len = hiddens.length; i < len; i++) {
            Ext.removeNode(hiddens[i]);
        }
    }
};
// end 下载

// 修改defaults 的模式不允许覆盖
Ext.override(Ext.Container, {
    applyDefaults: function (c) {
        if (this.defaults) {
            if (typeof c == 'string') {
                c = Ext.ComponentMgr.get(c);
            }
            if (c) {
                Ext.applyIf(c, this.defaults);
            }
        }
        return c;
    }
});
// end 修改defaults 的模式不允许覆盖

Ext.MD5 = function (s) {
    var hexcase = 0;
    var chrsz = 8;

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function core_md5(x, len) {
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    function str2binl(str) {
        var bin = [];
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
        }
        return bin;
    }

    function binl2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
    }

    return binl2hex(core_md5(str2binl(s), s.length * chrsz));
};
// }}}
// {{{
/**
 * Clone Function
 *
 * @param {Object/Array}
 *            o Object or array to clone
 * @return {Object/Array} Deep clone of an object or an array
 * @author Ing. Jozef Sakáloš
 */
Ext.clone = function (o) {
    if (!o || 'object' !== typeof o) {
        return o;
    }
    if ('function' === typeof o.clone) {
        return o.clone();
    }
    var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && 'object' === typeof v) {
                c[p] = Ext.clone(v);
            } else {
                c[p] = v;
            }
        }
    }
    return c;
}; // eo function clone
// }}}
// {{{
/**
 * Copies the source object properties with names that match target object
 * properties to the target. Undefined properties of the source object are
 * ignored even if names match. This way it is possible to create a target
 * object with defaults, apply source to it not overwriting target defaults with
 * <code>undefined</code> values of source.
 *
 * @param {Object}
 *            t The target object
 * @param {Object}
 *            s (optional) The source object. Equals to scope in which the
 *            function runs if omitted. That allows to set this function as
 *            method of any object and then call it in the scope of that object.
 *            E.g.:
 *
 * <pre>
 * var p = new Ext.Panel({
 *  	 prop1:11
 *  	,prop2:22
 *  	,&lt;b&gt;applyMatching:Ext.applyMatching&lt;/b&gt;
 *  	// ...
 * });
 * var t = p.applyMatching({prop1:0, prop2:0, prop3:33});
 * </pre>
 *
 * The resulting object:
 *
 * <pre>
 * t = {
 * 	prop1 : 11,
 * 	prop2 : 22,
 * 	prop3 : 33
 * };
 * </pre>
 *
 * @return {Object} Original passed target object with properties updated from
 *         source
 */
Ext.applyMatching = function (t, s) {
    var s = s || this;
    for (var p in t) {
        if (t.hasOwnProperty(p) && undefined !== s[p]) {
            t[p] = s[p];
        }
    }
    return t;
}; // eo function applyMatching
// }}}

// conditional override
// {{{
/**
 * Same as {@link Ext#override} but overrides only if method does not exist in
 * the target class
 *
 * @member Ext
 * @param {Object}
 *            origclass
 * @param {Object}
 *            overrides
 */
Ext.overrideIf = 'function' === typeof Ext.overrideIf ? Ext.overrideIf : function (origclass, overrides) {
    if (overrides) {
        var p = origclass.prototype;
        for (var method in overrides) {
            if (!p[method]) {
                p[method] = overrides[method];
            }
        }
    }
};
// }}}

// RegExp
// {{{
/**
 * @class RegExp
 */
if ('function' !== typeof RegExp.escape) {
    /**
     * Escapes regular expression
     *
     * @param {String}
     *            s
     * @return {String} The escaped string
     * @static
     */
    RegExp.escape = function (s) {
        if ('string' !== typeof s) {
            return s;
        }
        return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1');
    };
}
Ext.overrideIf(RegExp, {

    /**
     * Clones RegExp object
     *
     * @return {RegExp} Clone of this RegExp
     */
    clone: function () {
        return new RegExp(this);
    } // eo function clone
});
// }}}

// Array
// {{{
Ext.overrideIf(Array, {
    // {{{
    /**
     * One dimensional copy. Use {@link Ext#clone Ext.clone} to deeply clone an
     * Array.
     *
     * @member Array
     * @return {Array} New Array that is copy of this
     */
    copy: function () {
        var a = [];
        for (var i = 0, l = this.length; i < l; i++) {
            a.push(this[i]);
        }
        return a;
    } // eo function copy
    // }}}
    // {{{
    /**
     * Not used anyway as Ext has its own indexOf
     *
     * @member Array
     * @return {Integer} Index of v or -1 if not found
     * @param {Mixed}
     *            v Value to find indexOf
     * @param {Integer}
     *            b Starting index
     */,
    indexOf: function (v, b) {
        for (var i = +b || 0, l = this.length; i < l; i++) {
            if (this[i] === v) {
                return i;
            }
        }
        return -1;
    } // eo function indexOf
    // }}}
    // {{{
    /**
     * Returns intersection of this Array and passed arguments
     *
     * @member Array
     * @return {Array} Intersection of this and passed arguments
     * @param {Mixed}
     *            arg1 (optional)
     * @param {Mixed}
     *            arg2 (optional)
     * @param {Mixed}
     *            etc. (optional)
     */,
    intersect: function () {
        if (!arguments.length) {
            return [];
        }
        var a1 = this, a2, a;
        for (var k = 0, ac = arguments.length; k < ac; k++) {
            a = [];
            a2 = arguments[k] || [];
            for (var i = 0, l = a1.length; i < l; i++) {
                if (-1 < a2.indexOf(a1[i])) {
                    a.push(a1[i]);
                }
            }
            a1 = a;
        }
        return a.unique();
    } // eo function intesect
    // }}}
    // {{{
    /**
     * Returns last index of passed argument
     *
     * @member Array
     * @return {Integer} Index of v or -1 if not found
     * @param {Mixed}
     *            v Value to find indexOf
     * @param {Integer}
     *            b Starting index
     */,
    lastIndexOf: function (v, b) {
        b = +b || 0;
        var i = this.length;
        while (i-- > b) {
            if (this[i] === v) {
                return i;
            }
        }
        return -1;
    } // eof function lastIndexOf
    // }}}
    // {{{
    /**
     * @member Array
     * @return {Array} New Array that is union of this and passed arguments
     * @param {Mixed}
     *            arg1 (optional)
     * @param {Mixed}
     *            arg2 (optional)
     * @param {Mixed}
     *            etc. (optional)
     */,
    union: function () {
        var a = this.copy(), a1;
        for (var k = 0, ac = arguments.length; k < ac; k++) {
            a1 = arguments[k] || [];
            for (var i = 0, l = a1.length; i < l; i++) {
                a.push(a1[i]);
            }
        }
        return a.unique();
    } // eo function union
    // }}}
    // {{{
    /**
     * Removes duplicates from array
     *
     * @member Array
     * @return {Array} New Array with duplicates removed
     */,
    unique: function () {
        var a = [], i, l = this.length;
        for (i = 0; i < l; i++) {
            if (a.indexOf(this[i]) < 0) {
                a.push(this[i]);
            }
        }
        return a;
    } // eo function unique
    // }}}

});
// }}}

// eof
// fix accordion layout bug
Ext.override(Ext.layout.Accordion, {
    setItemSize: function (item, size) {
        if (this.fill && item) {
            var items = this.container.items.items;
            var hh = 0;
            for (var i = 0, len = items.length; i < len; i++) {
                var p = items[i];
                if (p != item) {
                    hh += p.header.getHeight();
                }
            }
            size.height -= hh;
            item.setSize(size);
        }
    }
});
// 复写 过滤ext 生成Input
Ext.lib.Ajax.serializeForm = function (form) {
    if (typeof form == 'string') {
        form = (document.getElementById(form) || document.forms[form]);
    }
    var el, name, val, disabled, data = '', hasSubmit = false, regex;
    for (var i = 0; i < form.elements.length; i++) {
        el = form.elements[i];
        disabled = form.elements[i].disabled;
        name = form.elements[i].name;
        val = form.elements[i].value;
        regex = /ext-comp-.+/;
        if (!disabled && name && !regex.test(name)) {
            switch (el.type) {
                case 'select-one' :
                case 'select-multiple' :
                    for (var j = 0; j < el.options.length; j++) {
                        if (el.options[j].selected) {
                            var opt = el.options[j], sel = (opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified)
                                ? opt.value
                                : opt.text;
                            data += encodeURIComponent(name) + '=' + encodeURIComponent(sel) + '&';
                        }
                    }
                    break;
                case 'radio' :
                case 'checkbox' :
                    if (el.checked) {
                        data += encodeURIComponent(name) + '=' + encodeURIComponent(val) + '&';
                    }
                    break;
                case 'file' :

                case undefined :

                case 'reset' :

                case 'button' :

                    break;
                case 'submit' :
                    if (hasSubmit == false) {
                        data += encodeURIComponent(name) + '=' + encodeURIComponent(val) + '&';
                        hasSubmit = true;
                    }
                    break;
                default :
                    data += encodeURIComponent(name) + '=' + encodeURIComponent(val) + '&';
                    break;
            }
        }
    }
    data = data.substr(0, data.length - 1);
    return data;
};
// 公共renderer
Ext.grid.renderers = {
    arrayRenderer: function (data, vIndex, dIndex) {
        if (Ext.type(vIndex) != 'number') {
            vIndex = 0
        }
        if (Ext.type(dIndex) != 'number') {
            dIndex = 1
        }
        return function (v) {
            for (var i = 0; i < data.length; i++) {
                if (v == data[i][vIndex]) {
                    return data[i][dIndex];
                }
            }
            return v;
        };
    },
    jsonRenderer: function (data, vName, dName) {
        if (Ext.type(vName) != 'string') {
            vName = 'ID';
        }
        if (Ext.type(dName) != 'string') {
            dName = 'TEXT';
        }
        return function (v) {
            for (var i = 0; i < data.length; i++) {
                if (v == data[i][vName]) {
                    return data[i][dName];
                }
            }
            return v;
        };
    },
    storeRenderer: function (storeId, grid, vName, dName) {
        var store = storeId instanceof Ext.data.Store ? storeId : Ext.StoreMgr.get(storeId);
        if (!store) {
            return function (v) {
                return v;
            }
        }
        var rs = store.getRange();
        if (Ext.type(vName) != 'string') {
            vName = 'ID';
        }
        if (Ext.type(dName) != 'string') {
            dName = 'TEXT';
        }
        var renderer = function (v) {
            rs = store.getRange();
            for (var i = 0; i < rs.length; i++) {
                if (v == rs[i].get(vName)) {
                    return rs[i].get(dName);
                }
            }
            return v;
        };
        if (rs.length > 0) {
            return renderer;
        } else {
            var loaded = false;
            store.on("load", function (store, records) {
                loaded = true;
            });
            return function (v, m, r, rindex, cindex) {
                if (rs.length > 0 || loaded) {
                    return renderer(v);
                }
                store.on("load", function (store, records) {
                    var cell = grid.getView().getCell(rindex, cindex);
                    cell.firstChild.innerHTML = renderer(v);
                });
                return "...";
            };
        }
    }
};



/**
 * 判断store是否load
 *
 * @params store1 ... storeN callback
 */
Ext.onStoreReady = function () {
    var params = [].slice.call(arguments, 0);
    if (params.length <= 1) {
        return;
    }
    var stores = params.slice(0, params.length - 1);
    var cb = params[params.length - 1];
    var funs = [];
    var startFun = function () {
        var store;
        for (var i = 0; i < stores.length; i++) {
            store = Ext.StoreMgr.lookup(stores[i]);
            if (store.proxy instanceof Ext.data.HttpProxy && store.getCount()==0) {
                store.on("load", (function (parallel) {
                    return function () {
                        parallel(false, store);
                    };
                })(this.parallel()), store, {
                    single: true
                });
            } else {
                this.parallel()(false, store);
            }
        }
    }
    var endFun = function (error, stores) {
        if (typeof cb == 'function') {
            cb(stores);
        }
    }
    Step(startFun, endFun);
};

Ext.getParam = function (param) {
    if (location.search) {
        var params = Ext.urlDecode(location.search.substring(1));
        return params[param];
    } else {
        return '';
    }
};
Ext.isNotBlank = function (v) {
    return (v !== null && v !== undefined && ((v + '').trim() != ''));
};

Ext.isBlank = function (v) {
    return !Ext.isNotBlank(v)
};
/**
 * Returns the week number for this date. dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1
 * (Monday), the week returned is the ISO 8601 week number.
 *
 * @param int
 *            dowOffset
 * @return int
 */
Date.prototype.getWeek = function (dowOffset) {
    /*
     * getWeek() was developed by Nick Baicoianu at MeanFreePath:
     * http://www.epoch-calendar.com
     */

    dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; // default dowOffset
    // to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; // the day of week the year begins
    // on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weeknum;
    // if the year starts before the middle of a week
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1, 0, 1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*
             * if the next year starts before the middle of the week, it is week
             * #1 of that year
             */
            weeknum = nday < 4 ? 1 : 53;
        }
    } else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
};

// Ext.form.BasicForm 提交emptyText 的问题

Ext.override(Ext.form.BasicForm, {
    getValues: function (asString, ignoreEmptyText) {
        var fs = Ext.lib.Ajax.serializeForm(this.el.dom);
        var vs = Ext.urlDecode(fs);
        var field;
        if (ignoreEmptyText === true) {
            for (var name in vs) {
                field = this.findField(name);
                if (field && field.emptyText) {
                    if (vs[name] == field.emptyText) {
                        vs[name] = '';
                    }
                }
            }
        }
        if (asString === true) {
            return Ext.urlEncode(vs);
        } else {
            return vs;
        }
    }
});

(function (win) {

    function getClassByNS(ns) {
        var names = ns.split('.');
        var clazz = win;
        for (var i = 0; i < names.length; i++) {
            clazz = clazz[names[i]];
            if (!clazz) {
                throw new Error(String.format("[ {0} ] 类型未找到", names[i]));
            }
        }
        return clazz;
    }

    Ext.createUI = function (ns, config) {
        config = config || {};
        if (typeof ns == 'string') {
            var ns_bak = ns;
            ns = getClassByNS(ns);
            Ext.applyIf(config, {itemId: ns_bak});
        }

        if (typeof config == 'string') {
            config = {'itemId': config}
        }

        if (ns) {
            return Ext.getCmp(config.itemId) || new ns(config);
        } else {
            throw new Error(String.format("[ {0} ] 类型未找到", ns));
        }
    };

})(window);



Ext.onScan=function(config){
  var scanInterval=60;
  var lastScanTime=new Date().getTime();
  var scanKeys=[];
  config=config||{};
  var cb=config.cb||Ext.emptyFn;
  var target =config.target||Ext.getBody();    
   
   function keyup(e){      
	    if(scanKeys.length==0 || (lastScanTime+scanInterval)>new Date().getTime()){     
	      if(e.getKey()==e.ENTER){      
	          config.cb(scanKeys);
	          scanKeys.length=0;        
	      }else{      
	        scanKeys.push(e.getKey());               
	      }    
	    }else{    
	      scanKeys.length=0;
	      scanKeys.push(e.getKey());
	    }    
	    lastScanTime=new Date().getTime();    
	  }
   if(target.mon){	    		 
     	target.mon(target.getEl(),'keyup',keyup);
   }else{
   	target.on('keyup',keyup);   	
   }
};


