"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CourseForm({ initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "gizi",
    level: "beginner",
    duration: "",
    requirePreTest: false,
    isPublished: true,
    tags: [],
  });
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Available categories - pastikan sesuai dengan enum di model
  const categories = [
    { value: 'psikologi', label: 'Psikologi' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'gizi', label: 'Gizi & Nutrisi' }
  ];

  // Available levels
  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    if (initialData) {
      const tagsValue = Array.isArray(initialData.tags) 
        ? initialData.tags.join(", ") 
        : "";
      
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "gizi",
        level: initialData.level || "beginner",
        duration: initialData.duration ? String(initialData.duration) : "",
        requirePreTest: initialData.requirePreTest || false,
        isPublished: initialData.isPublished !== undefined ? initialData.isPublished : true,
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      });
      
      setTagsInput(tagsValue);
      setCurrentThumbnailUrl(initialData.thumbnailUrl || null);
      setThumbnailPreview(initialData.thumbnailUrl || null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail image must be less than 5MB.");
        e.target.value = null;
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        e.target.value = null;
        return;
      }

      setThumbnailFile(file);
      setRemoveThumbnail(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailFile(null);
      setThumbnailPreview(currentThumbnailUrl);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setRemoveThumbnail(true);
    const fileInput = document.getElementById("thumbnailImage");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    setTagsInput(tagsString);
    
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
      
    setFormData((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) {
      errors.push("Title is required");
    }

    if (!formData.description.trim()) {
      errors.push("Description is required");
    }

    if (!categories.find(cat => cat.value === formData.category)) {
      errors.push("Invalid category selected");
    }

    if (!levels.find(level => level.value === formData.level)) {
      errors.push("Invalid level selected");
    }

    if (formData.duration && (isNaN(formData.duration) || parseInt(formData.duration) <= 0)) {
      errors.push("Duration must be a positive number");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setLoading(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append("title", formData.title.trim());
    submissionData.append("description", formData.description.trim());
    submissionData.append("category", formData.category);
    submissionData.append("level", formData.level);
    
    // Pastikan duration adalah number atau kosong
    if (formData.duration) {
      submissionData.append("duration", parseInt(formData.duration));
    }
    
    // Pastikan tags adalah array
    submissionData.append("tags", JSON.stringify(formData.tags));
    
    // Append boolean fields
    submissionData.append("requirePreTest", formData.requirePreTest);
    submissionData.append("isPublished", formData.isPublished);

    if (thumbnailFile) {
      submissionData.append("thumbnailImage", thumbnailFile);
    } else if (removeThumbnail && initialData?.id) {
      submissionData.append("removeThumbnail", "true");
    }

    try {
      let response;
      if (initialData?.id) {
        response = await axios.put(
          `/api/courses/${initialData.id}`,
          submissionData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Course updated successfully!");
      } else {
        response = await axios.post("/api/courses", submissionData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Course created successfully!");
      }

      router.push("/instructor/courses");
    } catch (err) {
      console.error("Error submitting course:", err);
      
      let errorMessage = "An error occurred.";
      
      if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors.map(error => 
          `${error.path}: ${error.msg}`
        ).join(", ");
        errorMessage = `Validation errors: ${validationErrors}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = initialData?.id
          ? "Failed to update course."
          : "Failed to create course.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-glass hover:shadow-xl transition-all-300 overflow-hidden border-t-4 border-primary-500 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-500 mb-6 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="p-8 space-y-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-primary-700">
            {initialData ? "Update Your Course" : "Create New Course"}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details to {initialData ? "update" : "create"} your
            course
          </p>
        </div>

        {/* Course Title */}
        <div className="transition-all duration-300 hover:translate-x-1">
          <label
            htmlFor="title"
            className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Course Title <span className="text-primary-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md hover:shadow-lg transition-all"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
          />
        </div>

        {/* Description */}
        <div className="transition-all duration-300 hover:translate-x-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            Description <span className="text-primary-500 ml-1">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md hover:shadow-lg transition-all"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a thorough description of your course"></textarea>
          <p className="text-xs text-gray-500 mt-1 italic">
            A detailed description helps students understand what they'll learn.
          </p>
        </div>

        {/* Category, Level, and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="transition-all duration-300 hover:translate-x-1">
            <label
              htmlFor="category"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Category <span className="text-primary-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                required
                className="text-black form-input w-full bg-white pl-3 pr-10 py-2 text-base focus:ring-2 focus:ring-primary-300 border-transparent shadow-md appearance-none"
                value={formData.category}
                onChange={handleChange}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="transition-all duration-300 hover:translate-x-1">
            <label
              htmlFor="level"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Difficulty Level <span className="text-primary-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                id="level"
                name="level"
                required
                className="text-black form-input w-full bg-white pl-3 pr-10 py-2 text-base focus:ring-2 focus:ring-primary-300 border-transparent shadow-md appearance-none"
                value={formData.level}
                onChange={handleChange}>
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="transition-all duration-300 hover:translate-x-1">
            <label
              htmlFor="duration"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              min="1"
              max="10000"
              className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md hover:shadow-lg transition-all"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 120"
            />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="transition-all duration-300 hover:translate-x-1">
          <label
            htmlFor="thumbnailImage"
            className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
              />
            </svg>
            Course Thumbnail (Optional, Max 5MB)
          </label>
          <div className="mt-2 flex items-center gap-4">
            {thumbnailPreview && (
              <div className="w-24 h-24 relative rounded overflow-hidden border border-gray-300">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            )}
            <input
              type="file"
              id="thumbnailImage"
              name="thumbnailImage"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary-50 file:text-primary-700
                           hover:file:bg-primary-100"
            />
          </div>
          {(currentThumbnailUrl || thumbnailFile) && (
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              className="mt-2 text-sm text-red-600 hover:text-red-800">
              Remove Thumbnail
            </button>
          )}
          <p className="text-xs text-gray-500 mt-1 italic">
            Upload an eye-catching thumbnail to attract students.
          </p>
        </div>

        {/* Tags */}
        <div className="transition-all duration-300 hover:translate-x-1">
          <label
            htmlFor="tags"
            className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md hover:shadow-lg transition-all"
            value={tagsInput}
            onChange={handleTagsChange}
            placeholder="e.g., health, wellness, nutrition"
          />
          <p className="text-xs text-gray-500 mt-1 italic">
            Tags help make your course more discoverable.
          </p>
        </div>

        {/* Additional Settings */}
        <div className="transition-all duration-300 hover:translate-x-1">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requirePreTest"
                name="requirePreTest"
                checked={formData.requirePreTest}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="requirePreTest" className="ml-2 text-sm text-gray-700">
                Require pre-test
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                Publish immediately
              </label>
            </div>
          </div>
        </div>

        {/* Test setup information */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Assessment setup
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  After creating your course, you'll be able to add pre-tests
                  and post-tests from the course dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="px-8 py-4 bg-gray-50 flex justify-end space-x-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline group"
          disabled={loading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white 
                     ${
                       loading
                         ? "bg-gray-400 cursor-not-allowed"
                         : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                     }
                     transition duration-150 ease-in-out`}>
          {loading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {initialData?.id ? "Update Course" : "Create Course"}
        </button>
      </div>
    </form>
  );
}