package com.sky;

import com.sky.models.Article;
import com.sky.service.ContentService;
import io.quarkus.qute.Engine;
import io.quarkus.qute.Template;

import io.vertx.ext.web.Router;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@ApplicationScoped
public class WebRoutes {
	@Inject
	Engine engine;

	@Inject
	ContentService contentService;

	public void register(@Observes Router router) {
		// Home route
		router.get("/").handler(rc -> {
			Template template = engine.getTemplate("pub/home");

			Map<String, Object> data = new HashMap<>();

			// Add categories
			data.put("categories", contentService.getCategories());

			// Add articles
			data.put("featuredArticles", contentService.getFeaturedArticles());
			data.put("recentArticles", contentService.getRecentArticles());
			data.put("popularArticles", contentService.getPopularArticles());

			// Add advertisements (empty for now)
			Map<String, Object> ads = new HashMap<>();
			ads.put("sidebar-top", null);
			ads.put("sidebar-bottom", null);
			ads.put("banner", null);
			data.put("ads", ads);

			rc.response()
					.putHeader("Content-Type", "text/html")
					.end(template.render(data));
		});

		// Individual article route
		router.get("/article/:slug").handler(rc -> {
			String slug = rc.pathParam("slug");
			Article article = contentService.getArticleBySlug(slug);

			// Increment view count
			contentService.incrementViewCount(slug);

			if (article == null) {
				rc.response().setStatusCode(404).end("Article not found");
				return;
			}

			Template template = engine.getTemplate("pub/article");

			Map<String, Object> data = new HashMap<>();
			data.put("categories", contentService.getCategories());
			data.put("article", article);
			data.put("relatedArticles", contentService.getRelatedArticles(article));
			data.put("popularArticles", contentService.getPopularArticles());

			Map<String, Object> ads = new HashMap<>();
			ads.put("sidebar-top", null);
			ads.put("sidebar-bottom", null);
			ads.put("banner", null);
			data.put("ads", ads);

			rc.response()
					.putHeader("Content-Type", "text/html")
					.end(template.render(data));
		});

		// Category route
		router.get("/category/:slug").handler(rc -> {
			String slug = rc.pathParam("slug");

			Template template = engine.getTemplate("pub/category");

			Map<String, Object> data = new HashMap<>();
			data.put("categories", contentService.getCategories());
			data.put("currentCategory", contentService.getCategoryBySlug(slug));
			data.put("articles", contentService.getArticlesByCategory(slug));

			Map<String, Object> ads = new HashMap<>();
			ads.put("sidebar-top", null);
			ads.put("sidebar-bottom", null);
			ads.put("banner", null);
			data.put("ads", ads);

			rc.response()
					.putHeader("Content-Type", "text/html")
					.end(template.render(data));
		});
	}
}