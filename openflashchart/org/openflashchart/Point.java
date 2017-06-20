package org.openflashchart;

public class Point extends Data_set
{
	final int x;
	final int y; 
	final int size_px;
	
	public Point( int x, int y, int size_px )
	{
		this.x = x;
		this.y = y;
		this.size_px = size_px;
	}
	
	public String toString(String arg0, String arg1)
	{
		return "["+x+","+y+","+size_px+"]";
	}
}
