package org.openflashchart;

import java.util.ArrayList;
import java.util.List;

public class Bar extends Data_set {
	String colour;
	String alpha;
	List<String> data;
	List<String> links;
	boolean _key;
	String key;
	int key_size;
	String var;

	public Bar() {
		super();
	}

	public String getVar() {
		return var;
	}

	public void setVar(String var) {
		this.var = var;
	}

	public Bar(String alpha, String colour) {
		this.var = "bar";

		this.alpha = alpha;
		this.colour = colour;
		this.data = new ArrayList<String>();
		this.links = new ArrayList<String>();
		this._key = false;
	}

	public void key(String key, int size) {
		this._key = true;
		this.key = key;
		this.key_size = size;
	}

	public void add(String data, String link) {
		this.data.add(data);
		this.links.add(link);
	}

	public String toString(String output_type, String set_num) {
		String values = this.alpha + "," + this.colour;

		if (this._key) {
			values += "," + this.key + "," + this.key_size;
		}
		String tmp = null;
		if (output_type.equals("js")) {
			tmp = "so.addVariable(\"" + this.var + "\",\"" + values + "\");";
		} else {
			tmp = "&" + this.var + set_num + "=" + values + "&";
			tmp += "\r\n";
			tmp += "&values" + set_num + "=" + implode(",", this.data) + "&";
			if (this.links.size() > 0) {
				tmp += "\r\n";
				tmp += "&links" + set_num + "=" + implode(",", this.links)
						+ "&";
			}
		}

		return tmp;
	}

	String implode(String glue, List<String> array) {
		StringBuilder sb = new StringBuilder();
		for (String element : array) {
			if (sb.length() > 0)
				sb.append(glue);
			sb.append(element);
		}
		return sb.toString();
	}

}
