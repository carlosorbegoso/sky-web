package com.sky;

import com.sky.models.Article;
import com.sky.service.ContentService;
import io.quarkus.qute.Engine;
import io.quarkus.qute.Template;

import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.util.HashMap;
import java.util.Map;

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

			// Verificar si es una petición AJAX
			if (isAjaxRequest(rc)) {
				// Devolver solo el contenido como JSON
				Map<String, Object> responseData = new HashMap<>();
				responseData.put("title", "Sky - News Portal");

				// Obtener el contenido sin renderizar la plantilla base completa
				String content = renderContent(template, data);
				responseData.put("content", content);

				rc.response()
						.putHeader("Content-Type", "application/json")
						.end(Json.encode(responseData));
			} else {
				// Devolver la página completa
				rc.response()
						.putHeader("Content-Type", "text/html")
						.putHeader("Cache-Control", "public, max-age=60") // Cache for 60 seconds
						.end(template.render(data));
			}
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

			// Verificar si es una petición AJAX
			if (isAjaxRequest(rc)) {
				// Devolver solo el contenido como JSON
				Map<String, Object> responseData = new HashMap<>();
				responseData.put("title", article.getTitle() + " - Sky");

				String content = renderContent(template, data);
				responseData.put("content", content);

				rc.response()
						.putHeader("Content-Type", "application/json")
						.end(Json.encode(responseData));
			} else {
				// Devolver la página completa
				rc.response()
						.putHeader("Content-Type", "text/html")
						.putHeader("Cache-Control", "public, max-age=60") // Cache for 60 seconds
						.end(template.render(data));
			}
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

			// Verificar si es una petición AJAX
			if (isAjaxRequest(rc)) {
				// Devolver solo el contenido como JSON
				Map<String, Object> responseData = new HashMap<>();
				String categoryName = contentService.getCategoryBySlug(slug).getName();
				responseData.put("title", categoryName + " - Sky");

				String content = renderContent(template, data);
				responseData.put("content", content);

				rc.response()
						.putHeader("Content-Type", "application/json")
						.end(Json.encode(responseData));
			} else {
				// Devolver la página completa
				rc.response()
						.putHeader("Content-Type", "text/html")
						.putHeader("Cache-Control", "public, max-age=60") // Cache for 60 seconds
						.end(template.render(data));
			}
		});
	}

	// Método para verificar si es una petición AJAX
	private boolean isAjaxRequest(RoutingContext rc) {
		String requestedWith = rc.request().getHeader("X-Requested-With");
		return "XMLHttpRequest".equals(requestedWith);
	}

	// Método para renderizar solo el contenido de una plantilla
	private String renderContent(Template template, Map<String, Object> data) {
		// Renderizar la plantilla completa
		String fullHtml = template.render(data);

		// Extraer solo el contenido entre las etiquetas {#content} y {/content}
		int startIndex = fullHtml.indexOf("{#content}");
		if (startIndex < 0) {
			// Si no se encuentra la etiqueta de inicio, buscar con formato alternativo
			startIndex = fullHtml.indexOf("{#insert content}");
			if (startIndex < 0) return fullHtml; // No se encontró ninguna etiqueta
			startIndex += 16; // Longitud de "{#insert content}"
		} else {
			startIndex += 10; // Longitud de "{#content}"
		}

		int endIndex = fullHtml.indexOf("{/content}");
		if (endIndex < 0) {
			// Si no se encuentra la etiqueta de fin, buscar con formato alternativo
			endIndex = fullHtml.indexOf("{/insert}");
			if (endIndex < 0) return fullHtml; // No se encontró ninguna etiqueta
		}

		if (startIndex >= 0 && endIndex > startIndex) {
			return fullHtml.substring(startIndex, endIndex).trim();
		}

		// Si no se pudo extraer el contenido, devolver el HTML completo
		return fullHtml;
	}
}