package com.sky.models;

import java.time.LocalDateTime;

public class Article {
	private String slug;
	private String title;
	private String excerpt;
	private String imageUrl;
	private Category category;
	private LocalDateTime publishedAt;
	private int readingTimeMinutes;
	private boolean featured;

	public Article() {
		// Default constructor
	}

	public Article(String slug, String title, String excerpt, String imageUrl, Category category, LocalDateTime publishedAt, int readingTimeMinutes, boolean featured) {
		this.slug = slug;
		this.title = title;
		this.excerpt = excerpt;
		this.imageUrl = imageUrl;
		this.category = category;
		this.publishedAt = publishedAt;
		this.readingTimeMinutes = readingTimeMinutes;
		this.featured = featured;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getExcerpt() {
		return excerpt;
	}

	public void setExcerpt(String excerpt) {
		this.excerpt = excerpt;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public LocalDateTime getPublishedAt() {
		return publishedAt;
	}

	public void setPublishedAt(LocalDateTime publishedAt) {
		this.publishedAt = publishedAt;
	}

	public int getReadingTimeMinutes() {
		return readingTimeMinutes;
	}

	public void setReadingTimeMinutes(int readingTimeMinutes) {
		this.readingTimeMinutes = readingTimeMinutes;
	}

	public boolean isFeatured() {
		return featured;
	}

	public void setFeatured(boolean featured) {
		this.featured = featured;
	}
}
