package com.sky.models;

public class Category {
	private String slug;
	private String name;
	private String description;

	public Category() {
		// Default constructor
	}

	public Category(String slug, String name, String description) {
		this.slug = slug;
		this.name = name;
		this.description = description;

	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}


}
