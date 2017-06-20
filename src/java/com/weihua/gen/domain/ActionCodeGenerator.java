package com.weihua.gen.domain;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;

import freemarker.cache.FileTemplateLoader;
import freemarker.cache.MultiTemplateLoader;
import freemarker.cache.TemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

/** */

/**
 * Action代码产生器,根据Action类模板用FreeMarker产生Action代码. <br>
 * 模板例子请参照config目录下的action.ftl
 *
 * @author HuangYu
 */
public class ActionCodeGenerator {

    private Configuration cfg;
    private String[] templateDir = new String[]
            {"tpl/js", "tpl/java", "tpl/sql", "tpl/ftl"};

    private String outputDir = "C:/codegen/output";

    public ActionCodeGenerator() throws IOException {
        init();
    }

    public void setOutputDir(String outputDir) {
        this.outputDir = outputDir;
    }

    public void setTemplateDir(String[] templateDir) throws IOException {
        this.templateDir = templateDir;
    }

    private String getRealPath(String url) {
        File file = new File(ActionCodeGenerator.class.getClassLoader().getResource(url).getPath());
        return file.getAbsolutePath();

    }

    public void init() throws IOException {
        cfg = new Configuration();
        List<TemplateLoader> loaders = new ArrayList<TemplateLoader>();
        for (String path : templateDir) {
            System.out.println(getRealPath(path));
            loaders.add(new FileTemplateLoader(new File(getRealPath(path))));
        }
        MultiTemplateLoader ml = new MultiTemplateLoader(loaders.toArray(new FileTemplateLoader[0]));
        cfg.setTemplateLoader(ml);
        cfg.setLocale(Locale.CHINA);
        cfg.setDefaultEncoding("UTF-8");
    }

    public void generate(String templateName, File file, Object params) throws IOException {

        // Get the templat object
        Template template = cfg.getTemplate(templateName);
        Writer writer = new OutputStreamWriter(new FileOutputStream(file), "UTF-8");
        // Merge the data-model and the template
        try {
            template.process(params, writer);

        } catch (TemplateException e) {
            e.printStackTrace();
        } finally {

            writer.close();
        }
    }

    /** */
    /**
     * 测试，根据Model类生成相应的Action
     */
    public static void main(String[] args) throws IOException {
        ActionCodeGenerator gen = new ActionCodeGenerator();
        org.apache.commons.io.FileUtils.forceMkdir(new File(gen.getOutputDir()));
        gen.generate("action.ftl", gen.getOutPutFile("", "FAction.java"), new HashMap());

    }

    public File getOutPutFile(String relativePath, String fileName) throws IOException {
        String abspath = mkPackageDir(relativePath);
        return new File(abspath, fileName);

    }

    public String mkPackageDir(String pck) throws IOException {
        File path = new File(outputDir, pck.replaceAll("\\.", "\\" + File.separator));
        org.apache.commons.io.FileUtils.forceMkdir(path);
        return path.getAbsolutePath();
    }

    public String getOutputDir() {
        return outputDir;
    }

}
