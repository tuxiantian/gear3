package com.weihua.core.utils;

import java.security.Key;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import com.sun.star.uno.RuntimeException;

/**
 * DES 加密、解密
 * 
 * @FileName DesCipherUtil.java
 * @Description TODO
 * @Author wcl
 * 
 */
public class DesCipherUtil {

	private Key key = null;

	public DesCipherUtil() {

	}

	public DesCipherUtil(String pwd) {
		this.init(pwd);
	}

	public void init(String pwd) {
		this.key = generatorKey(pwd);
	}

	/**
	 * 生成密钥
	 * 
	 * @param pwd
	 * @return
	 */
	private Key generatorKey(String pwd) {
		KeyGenerator kg = null;
		try {
			kg = KeyGenerator.getInstance("DES");
			SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG");
			secureRandom.setSeed(pwd.getBytes());
			kg.init(56, secureRandom);
			return kg.generateKey();
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException(" 初始化密钥出现异常 ");
		}
	}

	public String encryptByStr(String s1) throws Exception {
		return encryptByByte(s1.getBytes("UTF-8"));
	}

	public String decryptByStr(String s1) throws Exception {
		return new String(decryptByByte(s1), "UTF-8");
	}

	/**
	 * 数据加密
	 * 
	 * @param str
	 *            明文输入
	 * @return 密文输出
	 * @throws Exception
	 */
	public String encryptByByte(byte[] data) throws Exception {
		BASE64Encoder encoder = new BASE64Encoder();
		byte[] enstr = encrypt(data);
		return encoder.encode(enstr);
	}

	/**
	 * 数据解密
	 * 
	 * @param str
	 *            密文输入
	 * @return 明文输出
	 * @throws Exception
	 */
	public byte[] decryptByByte(String str) throws Exception {
		BASE64Decoder decoder = new BASE64Decoder();
		byte[] destr = decoder.decodeBuffer(str);
		return decrypt(destr);
	}

	/**
	 * DES解密
	 * 
	 * @param data
	 *            加密数据输入
	 * @return 明文数据输出
	 */
	private byte[] decrypt(byte[] data) {
		try {
			Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
			cipher.init(Cipher.DECRYPT_MODE, this.key);
			return cipher.doFinal(data);
		} catch (Exception e) {
			throw new RuntimeException("解密数据出错!" + e.getMessage());
		}
	}

	/**
	 * DES加密
	 * 
	 * @param data
	 *            明文数据输入
	 * @return 加密数据输出
	 */
	private byte[] encrypt(byte[] data) {
		try {
			Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, this.key);
			return cipher.doFinal(data);
		} catch (Exception e) {
			throw new RuntimeException("加密数据出错!" + e.getMessage());
		}
	}

	public static void main(String[] args) throws Exception {
		String pwd = "12312312";
		DesCipherUtil des = new DesCipherUtil(pwd);
		String d1 = des.encryptByByte("我是一个中国人".getBytes("UTF-8"));
		System.out.println("加密后的字符串: " + d1);
		DesCipherUtil des2 = new DesCipherUtil(pwd);
		String d2 = new String(des2.decryptByByte(d1), "UTF-8");
		System.out.println("解密后的字符串: " + d2);
	}

}
