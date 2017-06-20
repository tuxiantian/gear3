// just override css
Ext.override(Ext.form.DisplayField, {

			/**
			 * @cfg {String/Object} autoCreate A DomHelper element spec, or true
			 *      for a default element spec (defaults to {tag: "div",
			 *      style:"overflow-y:scroll;padding:3px 3px 3px 0;"},
			 */
			defaultAutoCreate : {
				tag : "div",
				style : "overflow:auto;border:none;background:none;text-decoration:underline;"
			},
			/**
			 * @cfg {String} fieldClass The default CSS class for the field
			 *      (defaults to "x-form-field")
			 */
			fieldClass : "x-form-display-field break-word"

		});