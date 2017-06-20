package com.weihua.core.utils;

import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import javax.crypto.Cipher;

import sun.misc.BASE64Decoder;

import com.thoughtworks.xstream.core.util.Base64Encoder;

/**
 * RSA加密、解密
 * 
 * @FileName RsaCipherImpl.java
 * @Description TODO
 * @Author wcl
 * 
 */
public class RsaCipherUtil {

	private Key publicKey = null;

	private Key privateKey = null;

	public void init() {
		try {
			KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
			SecureRandom secrand = new SecureRandom();
			secrand.setSeed("21cn".getBytes()); // 初始化随机产生器
			kpg.initialize(1024, secrand);
			KeyPair pair = kpg.generateKeyPair();
			this.publicKey = pair.getPublic();
			this.privateKey = pair.getPrivate();
		} catch (Exception e) {
			throw new RuntimeException("生成密钥对出错");
		}
	}

	/**
	 * 加密
	 * 
	 * @param data
	 * @return
	 */
	public String encrypt(String data) {
		try {
			Cipher cipher = Cipher.getInstance("RSA");
			cipher.init(Cipher.ENCRYPT_MODE, this.getPublicKey());
			byte[] res = cipher.doFinal(data.getBytes("UTF-8"));
			return new Base64Encoder().encode(res);
		} catch (Exception e) {
			throw new RuntimeException("加密数据出错!" + e.getMessage());
		}
	}

	/**
	 * 解密
	 * 
	 * @param data
	 * @return
	 */
	public String decrypt(String data) {
		try {
			byte[] rs = new BASE64Decoder().decodeBuffer(data);
			Cipher cipher = Cipher.getInstance("RSA");
			cipher.init(Cipher.DECRYPT_MODE, this.getPrivateKey());
			return new String(cipher.doFinal(rs), "UTF-8");
		} catch (Exception e) {
			throw new RuntimeException("解密密数据出错!" + e.getMessage());
		}
	}

	/**
	 * 加载公钥和密钥
	 * 
	 * @param keys
	 * @param isPublicKey
	 * @return
	 * @throws Exception
	 */
	public Key loadRsaKey(byte[] keys, boolean isPublicKey) throws Exception {
		Key resultKey = null;
		KeyFactory factory = KeyFactory.getInstance("RSA");
		if (isPublicKey) {
			X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keys);
			resultKey = factory.generatePublic(keySpec);
		} else {
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keys);
			resultKey = factory.generatePrivate(keySpec);
		}
		return resultKey;
	}

	public Key getPublicKey() {
		return publicKey;
	}

	public void setPublicKey(Key publicKey) {
		this.publicKey = publicKey;
	}

	public Key getPrivateKey() {
		return privateKey;
	}

	public void setPrivateKey(Key privateKey) {
		this.privateKey = privateKey;
	}

	public static void main(String[] args) throws Exception {
		String s1 = "100.4";
		RsaCipherUtil rsa1 = new RsaCipherUtil();
		DesCipherUtil des = new DesCipherUtil("123");
		DesCipherUtil des2 = new DesCipherUtil("123");
		rsa1.init();
		String enStr = rsa1.encrypt(s1);
		System.out.println("加密后的字符串 " + enStr);
		String enPrivate = des.encryptByByte(rsa1.getPrivateKey().getEncoded());
		byte[] privateKey = des2.decryptByByte(enPrivate);
		RsaCipherUtil rsa2 = new RsaCipherUtil();
		rsa2.init();
		rsa2.loadRsaKey(rsa1.getPrivateKey().getEncoded(), false);
		String deStr = rsa2.decrypt(enStr);
		System.out.println("解密后的字符串：" + deStr);
	}

}
