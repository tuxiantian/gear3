package org.openflashchart;

public class Candle extends Data_set
{
	final int high;
	final int low; 
	final int close;
	final int open;
	
	public Candle( int high, int open, int close, int low )
	{
		this.high = high;
		this.low = low;
		this.close = close;
		this.open = open;
	}
	
	public String toString(String arg0, String arg1)
	{
		return "["+high+","+open+","+low+","+close+"]";
	}
}