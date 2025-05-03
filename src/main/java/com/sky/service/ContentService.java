package com.sky.service;

import com.sky.models.Article;
import com.sky.models.Category;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@ApplicationScoped
public class ContentService {
	private static final Logger LOG = Logger.getLogger(ContentService.class.getName());

	private Map<String, Article> articleCache = new ConcurrentHashMap<>();
	private Map<String, Category> categoryCache = new ConcurrentHashMap<>();
	private Map<String, List<Article>> categoryArticlesCache = new ConcurrentHashMap<>();
	private Map<String, Integer> viewCountCache = new ConcurrentHashMap<>();

	private Random random = new Random();

	public ContentService() {
		// Initialize the caches with some data
		LOG.info("Initializing ContentService caches");
		initializeCaches();
	}

	private void initializeCaches() {
		articleCache.clear();
		categoryCache.clear();

		if (viewCountCache == null) {
			viewCountCache = new ConcurrentHashMap<>();
		}

		createCategories();

		for (Category category : categoryCache.values()) {
			generateArticlesForCategory(category);
		}

		// Initialize random view counts
		for (String slug : articleCache.keySet()) {
			viewCountCache.put(slug, random.nextInt(1000));
		}

		// Mark some articles as featured
		List<Article> allArticles = new ArrayList<>(articleCache.values());
		for (int i = 0; i < Math.min(5, allArticles.size()); i++) {
			Article article = allArticles.get(random.nextInt(allArticles.size()));
			article.setFeatured(true);
		}
	}

	private void generateArticlesForCategory(Category category) {
		String[] titles = {
				"Best Practices for " + category.getName(),
				"How to Improve Your " + category.getName() + " in 5 Steps",
				"The Future of " + category.getName() + " in 2025",
				"Why " + category.getName() + " Is Important",
				"10 Tips About " + category.getName()
		};

		String[] excerpts = {
				"Discover the most effective strategies to optimize your " + category.getName() + " and achieve better results.",
				"In this article, we explore proven methods to improve your " + category.getName() + " quickly.",
				"We analyze future trends in " + category.getName() + " that you should know to be prepared.",
				"We explain why paying attention to " + category.getName() + " can make a big difference in your results.",
				"Practical and easy-to-implement tips to enhance your " + category.getName() + " starting today."
		};

		LocalDateTime now = LocalDateTime.now();

		for (int i = 0; i < 5; i++) {
			String slug = category.getSlug() + "-article-" + (i + 1);
			String title = titles[i % titles.length];
			String excerpt = excerpts[i % excerpts.length];
			String imageUrl = "/static/images/article" + (i % 5 + 1) + ".jpg";

			LocalDateTime publishedAt = now.minusDays(random.nextInt(10));
			int readingTimeMinutes = 3 + random.nextInt(8); // Between 3 and 10 minutes

			Article article = new Article(
					slug,
					title,
					excerpt,
					imageUrl,
					category,
					publishedAt,
					readingTimeMinutes,
					false
			);

			articleCache.put(slug, article);
			categoryArticlesCache.computeIfAbsent(category.getSlug(), k -> new ArrayList<>()).add(article);
		}
	}

	private void createCategories() {
		Category category1 = new Category("technology", "Technology", "News and articles about technology");
		Category category2 = new Category("sports", "Sports", "All sports news");
		Category category3 = new Category("entertainment", "Entertainment", "Movies, music, and culture");

		categoryCache.put(category1.getSlug(), category1);
		categoryCache.put(category2.getSlug(), category2);
		categoryCache.put(category3.getSlug(), category3);
	}

	public List<Category> getCategories() {
		return new ArrayList<>(categoryCache.values());
	}

	public List<Article> getFeaturedArticles() {
		return articleCache.values().stream()
				.filter(Article::isFeatured)
				.limit(5)
				.collect(Collectors.toList());
	}

	public List<Article> getRecentArticles() {
		return articleCache.values().stream()
				.sorted((a1, a2) -> {
					if (a1.getPublishedAt() == null || a2.getPublishedAt() == null) {
						return 0;
					}
					return a2.getPublishedAt().compareTo(a1.getPublishedAt());
				})
				.limit(10)
				.collect(Collectors.toList());
	}

	public List<Article> getPopularArticles() {
		return articleCache.values().stream()
				.sorted((a1, a2) -> {
					Integer views1 = viewCountCache.getOrDefault(a1.getSlug(), 0);
					Integer views2 = viewCountCache.getOrDefault(a2.getSlug(), 0);
					return views2.compareTo(views1);
				})
				.limit(5)
				.collect(Collectors.toList());
	}

	public Article getArticleBySlug(String slug) {
		return articleCache.get(slug);
	}

	public Category getCategoryBySlug(String slug) {
		return categoryCache.get(slug);
	}

	public List<Article> getArticlesByCategory(String categorySlug) {
		return categoryArticlesCache.getOrDefault(categorySlug, new ArrayList<>());
	}

	public List<Article> getRelatedArticles(Article article) {
		if (article == null || article.getCategory() == null) {
			return new ArrayList<>();
		}

		return categoryArticlesCache.getOrDefault(article.getCategory().getSlug(), new ArrayList<>()).stream()
				.filter(a -> !a.getSlug().equals(article.getSlug()))
				.limit(4)
				.collect(Collectors.toList());
	}

	public void incrementViewCount(String slug) {
		viewCountCache.compute(slug, (k, v) -> (v == null) ? 1 : v + 1);
	}
}