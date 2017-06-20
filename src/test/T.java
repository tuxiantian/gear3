
public class T
{

	/**
	 * @param args
	 */
	public static void main(String[] args)
	{
		org.springframework.util.AntPathMatcher apm = new org.springframework.util.AntPathMatcher();
		String url = "/mps/sales/salesman/salesman_index.do";
		String matcher = "/mps/**/*.do";
		System.out.println(apm.match(matcher, url));
		String sp[] = url.split(":");
		System.out.println(sp[sp.length - 1]);




	}

}
