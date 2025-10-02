import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginFilters from "./_config/filters.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// --- СОЗДАНИЕ "ЧИСТЫХ" КОЛЛЕКЦИЙ ---
	eleventyConfig.addCollection("posts", collectionApi => collectionApi.getFilteredByGlob("./content/blog/**/*.md"));
	eleventyConfig.addCollection("news", collectionApi => collectionApi.getFilteredByGlob("./content/news/**/*.md"));

	// --- КОПИРОВАНИЕ СТАТИЧНЫХ ФАЙЛОВ ---
	// Убираем "агрессивное" копирование картинок, теперь этим занимается плагин.
	eleventyConfig.addPassthroughCopy({ "./public/": "/" });
	eleventyConfig.addPassthroughCopy("./css/");
	eleventyConfig.addPassthroughCopy("./js/");
	eleventyConfig.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// --- ОСТАЛЬНАЯ КОНФИГУРАЦИЯ (ОРИГИНАЛЬНАЯ) ---
	eleventyConfig.addWatchTarget("css/**/*.css");
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");
	eleventyConfig.addPlugin(pluginSyntaxHighlight, { preAttributes: { tabindex: 0 } });
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	// --- ПРАВИЛЬНАЯ НАСТРОЙКА IMAGE PLUGIN ---
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["webp", "auto"], // Убираем avif для лучшей совместимости
		
		// Куда складывать готовые, оптимизированные картинки
		outputDir: "./_site/img/",
		// По какому URL они будут доступны на сайте
		urlPath: "/img/",

		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
	});
	// ---------------------------------------------

	// RSS Feed Plugin
	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", outputPath: "/feed/feed.xml", stylesheet: "pretty-atom-feed.xsl",
		collection: { name: "posts", limit: 10, },
		metadata: {
			language: "ru", title: "Блог SetHubble", subtitle: "Новости, обновления и инсайты.",
			base: "https://blog.sethubble.ru/", author: { name: "SetHubble" }
		}
	});

	// Filters
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
