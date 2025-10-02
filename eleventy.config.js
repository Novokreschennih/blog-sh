import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import Image from "@11ty/eleventy-img"; // <-- ВАЖНЫЙ ИМПОРТ

import pluginFilters from "./_config/filters.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// --- КОПИРОВАНИЕ СТАТИЧНЫХ ФАЙЛОВ ---
	eleventyConfig.addPassthroughCopy({ "./public/": "/" });
	eleventyConfig.addPassthroughCopy("./css/");
	eleventyConfig.addPassthroughCopy("./js/");
	eleventyConfig.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// --- РЕГИСТРАЦИЯ НАШЕГО ШОРТКОДА ДЛЯ КАРТИНОК (ГЛАВНЫЙ ФИКС) ---
	eleventyConfig.addNunjucksAsyncShortcode("image", async function(src, alt, sizes) {
		// `this.page.inputPath` дает нам путь к текущему markdown-файлу
		let
			filepath = `${this.page.inputPath.substring(0, this.page.inputPath.lastIndexOf('/'))}/${src}`;
		
		let metadata = await Image(filepath, {
			widths: [400, 800, "auto"],
			formats: ["webp", "jpeg"],
			outputDir: "./_site/img/",
			urlPath: "/img/",
		});

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

		return Image.generateHTML(metadata, imageAttributes);
	});
	// -----------------------------------------------------------------

	// --- ОСТАЛЬНАЯ КОНФИГУРАЦИЯ (ОРИГИНАЛЬНАЯ И НЕИЗМЕННАЯ) ---
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft) data.title = `${data.title} (draft)`;
		if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") return false;
	});

	eleventyConfig.addWatchTarget("css/**/*.css");
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	eleventyConfig.addBundle("css", { toFileDirectory: "dist", bundleHtmlContentFromSelector: "style" });
	eleventyConfig.addBundle("js", { toFileDirectory: "dist", bundleHtmlContentFromSelector: "script" });

	eleventyConfig.addPlugin(pluginSyntaxHighlight, { preAttributes: { tabindex: 0 } });
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", outputPath: "/feed/feed.xml", stylesheet: "pretty-atom-feed.xsl",
		collection: { name: "posts", limit: 10, },
		metadata: {
			language: "ru", title: "Блог SetHubble", subtitle: "Новости, обновления и инсайты.",
			base: "https://blog.sethubble.ru/", author: { name: "SetHubble" }
		}
	});

	// Мы УДАЛИЛИ отсюда плагин eleventyImageTransformPlugin, так как теперь используем его вручную
	
	eleventyConfig.addPlugin(pluginFilters);
	eleventyConfig.addPlugin(IdAttributePlugin);

	eleventyConfig.addShortcode("currentBuildDate", () => (new Date()).toISOString());
};

export const config = {
	templateFormats: ["md", "njk", "html", "liquid"],
	markdownTemplateEngine: "njk",
	htmlTemplateEngine: "njk",
	dir: {
		input: "content", includes: "../_includes",
		data: "../_data", output: "_site"
	},
};
