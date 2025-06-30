'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createNews } from '../../../../../lib/newsService';

export default function CreateNews() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    isPublished: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Create form data for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add image if selected
      if (image) {
        submitData.append('image', image);
      }

      const response = await createNews(submitData);
      router.push('/admin/news');
    } catch (err) {
      console.error('Error creating news:', err);
      setError(err.response?.data?.message || 'Failed to create news article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20">
      {/* Header section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white mb-10 rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute left-1/3 top-1/2 w-48 h-48 bg-primary-400/20 rounded-full blur-3xl"></div>
          <div className="absolute left-10 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/admin/news" className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-medium opacity-90">Back to News Management</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Create News Article</h1>
          <p className="text-primary-100 max-w-2xl">Share valuable information with your audience. Add details, images, and format your content to create engaging articles.</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md mb-8 animate-fadeIn flex items-start">
            <div className="text-red-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="md:grid md:grid-cols-5">
            {/* Form sidebar with helpful info */}
            <div className="hidden md:block md:col-span-1 bg-gradient-to-b from-primary-50 to-gray-50 p-6">
              <h3 className="font-semibold text-primary-700 mb-4">Tips for great articles</h3>
              
              <div className="space-y-6 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <p>Use clear, engaging titles that accurately describe your content</p>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>Add relevant images to make your content visually appealing</p>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p>Structure your content with headings, lists, and paragraphs</p>
                </div>
              </div>
            </div>
            
            {/* Main form */}
            <div className="md:col-span-4 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Article Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Enter an engaging title"
                    className=" text-black w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all text-lg"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      id="category"
                      className="text-black w-full appearance-none rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 pl-4 pr-10 py-2.5"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="mental_health">Mental Health</option>
                      <option value="obesity">Obesity</option>
                      <option value="general">General</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative group">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-56 md:h-72 object-cover rounded-lg shadow-md" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500 mb-3 text-center">Drag and drop an image, or click to browse</p>
                      <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="image" className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium">
                        Select Image
                      </label>
                      <p className="mt-3 text-xs text-gray-500">
                        Recommended size: 1200x630 pixels. Max size: 5MB.
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Article Content
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    rows="12"
                    placeholder="Write your article content here..."
                    className="text-black w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all resize-none"
                    value={formData.content}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    You can use Markdown formatting for rich text.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isPublished"
                        id="isPublished"
                        className="sr-only peer"
                        checked={formData.isPublished}
                        onChange={handleChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <label htmlFor="isPublished" className="ml-3 text-sm font-medium text-gray-700">
                      Publish immediately
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 ml-14">
                    {formData.isPublished ? 
                      'This will be published and visible to the public.' : 
                      'This will be saved as a draft and not visible to the public.'}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                  <Link
                    href="/admin/news"
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 rounded-lg text-white font-medium shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        Create News
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}