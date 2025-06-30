"use client";

import { useState, useEffect } from "react";
import axios from "../../../../lib/axios";
import { useAuth } from "../../../../lib/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  PlusCircleIcon, 
  PencilSquareIcon, 
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

export default function AdminForumManagement() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    order: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
  
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/forum/categories");
        setCategories(data.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await axios.post("/api/forum/categories", formData);
      setCategories([...categories, data.data]);
      setFormData({
        title: '',
        description: '',
        slug: '',
        order: 0,
        isActive: true
      });
    } catch (err) {
      console.error("Failed to create category:", err);
      setError("Failed to create category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id);
    setFormData({
      title: category.title,
      description: category.description || "",
      slug: category.slug,
      order: category.order || 0,
      isActive: category.isActive !== false,
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await axios.put(
        `/api/forum/categories/${editingCategoryId}`,
        formData
      );
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategoryId ? data.data : cat
        )
      );
      setFormData({
        title: '',
        description: '',
        slug: '',
        order: 0,
        isActive: true
      });
      setEditingCategoryId(null);
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setFormData({
      title: '',
      description: '',
      slug: '',
      order: 0,
      isActive: true
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <header className="border-b border-gray-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 text-transparent bg-clip-text">
            Forum Management
          </h1>
          <p className="text-gray-500 mt-2 md:mt-0">
            Create and manage discussion categories
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md animate-fade-in">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {editingCategoryId ? (
              <PencilSquareIcon className="h-5 w-5 mr-2 text-secondary-500" />
            ) : (
              <PlusCircleIcon className="h-5 w-5 mr-2 text-primary-500" />
            )}
            {editingCategoryId ? "Edit Category" : "Create New Category"}
          </h2>
        </div>
        
        <form
          className="p-6" 
          onSubmit={editingCategoryId ? handleUpdateSubmit : handleCreateSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="transform transition duration-500 hover:scale-[1.01]">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="text-black form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 shadow-sm"
              />
            </div>

            <div className="transform transition duration-500 hover:scale-[1.01]">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="text-black form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1 italic">
                URL-friendly name (no spaces, lowercase)
              </p>
            </div>

            <div className="md:col-span-2 transform transition duration-500 hover:scale-[1.01]">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="text-black form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 shadow-sm"
                placeholder="Enter a brief description of this category..."
              />
            </div>

            <div className="transform transition duration-500 hover:scale-[1.01]">
              <label
                htmlFor="order"
                className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="text-black form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 shadow-sm"
              />
            </div>

            {editingCategoryId && (
              <div className="flex items-center transform transition duration-500 hover:scale-[1.01]">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-3 text-sm text-gray-700 font-medium">
                    Active Category
                  </label>
                  <div className="ml-3 text-xs text-gray-500">
                    (Inactive categories will be hidden from users)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-8 space-x-3">
            {editingCategoryId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-outline">
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`btn ${editingCategoryId ? 'btn-secondary' : 'btn-primary'}`}>
              {submitting ? (
                <span className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  {editingCategoryId ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <span className="flex items-center">
                  {editingCategoryId ? (
                    <>
                      <PencilSquareIcon className="h-4 w-4 mr-2" />
                      Update Category
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Create Category
                    </>
                  )}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center px-1">
          <span className="bg-gradient-to-r from-primary-600 to-secondary-500 text-transparent bg-clip-text">Manage Categories</span>
          <div className="ml-3 badge badge-secondary">{categories.length}</div>
        </h2>
        
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-dashed border-gray-300">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusCircleIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No categories found</h3>
            <p className="text-gray-500 mb-4">Create your first category using the form above</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-white">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {category.title}
                        </div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {category.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block">
                          {category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-center w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-medium text-gray-700">
                          {category.order}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive !== false
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                          {category.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="text-secondary-600 hover:text-secondary-900 p-1 rounded-full hover:bg-secondary-50 transition-colors">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <Link
                            href={`/forum/categories/${category.id}`}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50 transition-colors"
                            target="_blank">
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}