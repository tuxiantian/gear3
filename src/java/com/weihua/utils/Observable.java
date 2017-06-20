package com.weihua.utils;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Observable
{

	/**
	 * @param args
	 */
	private Map<String, Set<Listener>> events = new HashMap<String, Set<Listener>>();

	private ExecutorService service = Executors.newFixedThreadPool(10);

	public void fireEvent(String eventName, Object... param)
	{
		Set<Listener> listeners = getListenersByEventName(eventName, true);
		if (listeners != null)
		{
			Listener next;
			for (Iterator<Listener> it = listeners.iterator(); it.hasNext();)
			{
				next = it.next();
				next.setParam(param);
				next.setEventName(eventName);
				service.execute(next);
			}

		}
	}

	public synchronized void on(String eventName, Listener listener)
	{
		Set<Listener> listeners = getListenersByEventName(eventName, false);
		listeners.add(listener);
		events.put(eventName, listeners);
	}

	private synchronized Set<Listener> getListenersByEventName(String eventName, boolean needACopy)
	{
		Set<Listener> listeners = events.get(eventName);
		if (listeners == null)
		{
			listeners = new HashSet<Listener>();
			events.put(eventName, listeners);
		}
		if (needACopy == true)
		{
			Set<Listener> cpyListeners = new HashSet<Listener>(listeners.size());
			cpyListeners.addAll(listeners);
			return cpyListeners;
		} else
		{
			return listeners;
		}

	}

	public synchronized void un(String eventName, Listener listener)
	{
		Set<Listener> listeners = getListenersByEventName(eventName, false);
		for (Iterator<Listener> it = listeners.iterator(); it.hasNext();)
		{
			if (it.next() == listener)
			{
				it.remove();
			}
		}
	}

}
