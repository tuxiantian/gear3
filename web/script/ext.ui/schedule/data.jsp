<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%
String day =request.getParameter("day");
if(day==null || day.trim().equals("")|| day.equals("23"))
{
%>
{
	rows : [{
		id : "2",
		name : "会议室1",
		activity : "one-1",
		start : "2009-07-23 09:40",
		end : "2009-07-23 09:50",
		parent : null,
		color : "blue"
	}, {
		id : "3",
		name : "会议室2",
		activity : "one-2",
		start : "2009-07-23 11:00",
		end : "2009-07-23 17:00",
		parent : null,
		color : "blue"
	}, {
		id : "4",
		name : "会议室3",
		activity : "one-3",
		start : "2009-07-23 09:30",
		end : "2009-07-23 12:00",
		parent : null,
		color : "blue"
	}, {
		id : "5",
		name : "会议室4",
		activity : "one-4",
		start : "2009-07-23 09:00",
		end : "2009-07-23 10:00",
		parent : null,
		color : "blue"
	}, {
		id : "6",
		name : "会议室5",
		activity : "上午",
		start : "2009-07-23 09:15",
		end : "2009-07-23 11:00",
		parent : null,
		color : "blue"
	}, {
		id : "6",
		name : "会议室5",
		activity : "午饭",
		start : "2009-07-23 11:15",
		end : "2009-07-23 12:15",
		parent : null,
		color : "blue"
	}, {
		id : "6",
		name : "会议室5",
		activity : "下午",
		start : "2009-07-23 13:50",
		end : "2009-07-23 14:50",
		parent : null,
		color : "blue"
	}]
}

<%
 return;
}
%>
<%
   if(day.equals("24")){
 %>
{
	rows : [{
		id : "5",
		name : "会议室4",
		activity : "one-4",
		start : "2009-07-24 09:00",
		end : "2009-07-24 10:00",
		parent : null,
		color : "blue"
	}, {
		id : "6",
		name : "会议室5",
		activity : "午饭",
		start : "2009-07-24 11:15",
		end : "2009-07-24 12:15",
		parent : null,
		color : "blue"
	}, {
		id : "6",
		name : "会议室5",
		activity : "下午",
		start : "2009-07-24 13:50",
		end : "2009-07-24 14:50",
		parent : null,
		color : "blue"
	}]
}
<%
 return;
}
%>


<%
   if(day.equals("25")){
 %>
{
	rows : [{
		id : "5",
		name : "会议室4",
		activity : "one-4",
		start : "2009-07-25 09:00",
		end : "2009-07-25 10:00",
		parent : null,
		color : "green"
	}, {
		id : "6",
		name : "会议室5",
		activity : "午饭",
		start : "2009-07-25 11:15",
		end : "2009-07-25 12:15",
		parent : null,
		color : "green"
	}, {
		id : "6",
		name : "会议室5",
		activity : "下午",
		start : "2009-07-25 13:50",
		end : "2009-07-25 14:50",
		parent : null,
		color : "green"
	}]
}
<%
 return;
}
%>
