package org.crabdave.chartdemo;

import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openflashchart.Graph;

public class ChartRenderServlet extends HttpServlet {
	private static final long serialVersionUID = -7442075906889560871L;

	public void init(){
		System.out.println("init");
	}
	//flash取数据时，走的是doGet方法
	public void doGet(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {
		this.doPost(request, response);		
	}
	
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {
		int max = 50;
		List<String> data = new ArrayList<String>();
		List<String> data2 = new ArrayList<String>();
		for(int i = 0; i < 12; i++) {
			data.add(Double.toString(Math.random() * max));
			data2.add(Double.toString(Math.random() * max / 2));
		}

		Graph g = new Graph();

		// Spoon sales, March 2007
		g.title("ServletDemo", "{font-size: 25px;}");
		g.set_data(data);
		g.set_data(data2);
		
		g.line(2, "0x9933CC", "Page views", 10, 2);
		g.line_hollow("2", "4", "0x80a033", "Bounces", "10");

		// label each point with its value
		List<String> labels = new ArrayList<String>();
		labels.add("a");
		labels.add("b");
		labels.add("c");
		labels.add("d");
		labels.add("e");
		labels.add("f");
		labels.add("g");
		labels.add("h");
		labels.add("i");
		labels.add("j");
		labels.add("k");
		labels.add("l");
		g.set_x_labels(labels);
		g.set_x_label_style("12", "#FF0000", 0, 2, "");
		g.set_x_legend("Open Flash Chart Demo", 12, "#736AFF");
		
		// set the Y max
		g.set_y_max(60);
		// label every 20 (0,20,40,60)
		g.y_label_steps(6);
		response.setCharacterEncoding("utf-8");
		response.getWriter().write(g.render());
	}
}
