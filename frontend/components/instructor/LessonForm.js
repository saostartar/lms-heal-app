'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axios from '../../lib/axios';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
});

import 'react-quill/dist/quill.snow.css';

export default function LessonForm({ courseId, moduleId, initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || 'text',
    videoUrl: initialData?.videoUrl || '',
    duration: initialData?.duration || '',
    position: initialData?.position !== undefined ? initialData.position : 0,
  });

  // State for existing attachments (from initialData)
  const [existingAttachments, setExistingAttachments] = useState(initialData?.attachments || []);
  // State for newly added files
  const [newFiles, setNewFiles] = useState([]);
  // State for paths of existing attachments marked for removal
  const [filesToRemove, setFilesToRemove] = useState([]);
  // State for active form section
  const [activeSection, setActiveSection] = useState('basics');

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Handle Quill content change
  const handleContentChange = (content, delta, source, editor) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveExistingAttachment = (pathToRemove) => {
    setFilesToRemove(prev => [...prev, pathToRemove]);
    setExistingAttachments(prev => prev.filter(att => att.path !== pathToRemove));
  };

  const handleRemoveNewFile = (fileToRemove) => {
    setNewFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submissionData = new FormData();

    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });

    newFiles.forEach(file => {
      submissionData.append('attachments', file);
    });

    if (initialData) {
      submissionData.append('removedAttachments', JSON.stringify(filesToRemove));
    }

    if (formData.type !== 'video') {
      submissionData.set('videoUrl', '');
    }

    try {
      if (initialData) {
        await axios.put(`/api/lessons/${initialData.id}`, submissionData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`/api/lessons/module/${moduleId}`, submissionData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      router.replace(`/instructor/courses/${courseId}/modules/${moduleId}`);
    } catch (err) {
      let errorMessage = 'Failed to save lesson.';
      if (err.response?.data?.errors) {
        errorMessage += ' Validation errors: ' + err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.response?.data?.message) {
        errorMessage += ' ' + err.response.data.message;
      } else {
        errorMessage += ' ' + err.message;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    let fields = 0;
    let completed = 0;
    
    if (formData.title) completed++;
    fields++;
    
    if (formData.type === 'video') {
      if (formData.videoUrl) completed++;
      fields++;
    }
    
    if (formData.content) completed++;
    fields++;
    
    return Math.round((completed / fields) * 100);
  };

  const progressPercentage = calculateProgress();

  // Function to render content with proper formatting
 const renderContentPreview = (content) => {
    if (!content || content === '<p><br></p>') {
      return <p className="text-gray-600 italic">Your content preview will appear here.</p>;
    }
    
    return (
      <div 
        className="prose prose-lg max-w-none text-gray-900"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ color: '#374151' }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Form Header with 3D Card Effect */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-90 z-10"></div>
          <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-10 z-20"></div>
          
          <div className="relative z-30 px-8 pt-12 pb-14">
            <div className="flex items-start">
              <div className="mr-6">
                <div className="h-16 w-16 rounded-2xl bg-white bg-opacity-20 backdrop-blur-lg flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {initialData ? 'Update Lesson' : 'Create New Lesson'}
                </h1>
                <p className="mt-2 text-lg text-indigo-100">
                  Craft an engaging learning experience for your students
                </p>
                
                {/* Progress Bar */}
                <div className="mt-6 w-full bg-white bg-opacity-20 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white mt-2 font-medium">{progressPercentage}% Complete</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-0 right-0 transform translate-y-1/4 translate-x-1/4 z-0">
            <div className="h-40 w-40 rounded-full bg-indigo-500 opacity-50 blur-2xl"></div>
          </div>
          <div className="absolute top-0 left-8 transform -translate-y-1/2 z-0">
            <div className="h-24 w-24 rounded-full bg-purple-500 opacity-30 blur-xl"></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 animate-pulse">
            <div className="relative overflow-hidden rounded-2xl bg-red-50 border border-red-100 shadow-lg">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-red-600"></div>
              <div className="px-6 py-5 sm:flex sm:items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabbed Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('basics')}
              className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeSection === 'basics' 
                  ? 'bg-white text-primary-700 shadow-lg shadow-indigo-200/50 ring-1 ring-primary-100 transform -translate-y-1' 
                  : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Info
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveSection('content')}
              className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeSection === 'content' 
                  ? 'bg-white text-primary-700 shadow-lg shadow-indigo-200/50 ring-1 ring-primary-100 transform -translate-y-1' 
                  : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Content
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveSection('attachments')}
              className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeSection === 'attachments' 
                  ? 'bg-white text-primary-700 shadow-lg shadow-indigo-200/50 ring-1 ring-primary-100 transform -translate-y-1' 
                  : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments
                {(existingAttachments.length > 0 || newFiles.length > 0) && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {existingAttachments.length + newFiles.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeSection === 'settings' 
                  ? 'bg-white text-primary-700 shadow-lg shadow-indigo-200/50 ring-1 ring-primary-100 transform -translate-y-1' 
                  : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className={`${activeSection === 'basics' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                <p className="text-sm text-gray-600 mt-1">Set up the fundamentals of your lesson</p>
              </div>
              
              <div className="p-8 space-y-6">
                {/* Lesson Title */}
                <div className="group">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title <span className="text-primary-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="text-black pl-10 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200 bg-white/50 backdrop-blur-sm"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter an engaging title for your lesson"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Clear, descriptive titles help students understand what they'll learn
                  </p>
                </div>

                {/* Lesson Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Lesson Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                        formData.type === 'text' ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg' : 'border border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'text' }))}
                    >
                      <div className="px-6 py-5">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            formData.type === 'text' ? 'bg-primary-100' : 'bg-gray-100'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                              formData.type === 'text' ? 'text-primary-600' : 'text-gray-500'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className={`font-medium ${formData.type === 'text' ? 'text-primary-700' : 'text-gray-700'}`}>
                              Text Lesson
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Written content with formatting
                            </p>
                          </div>
                        </div>
                      </div>
                      {formData.type === 'text' && (
                        <div className="absolute inset-y-0 right-0 w-1 bg-primary-500"></div>
                      )}
                    </div>

                    <div 
                      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                        formData.type === 'video' ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg' : 'border border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'video' }))}
                    >
                      <div className="px-6 py-5">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            formData.type === 'video' ? 'bg-primary-100' : 'bg-gray-100'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                              formData.type === 'video' ? 'text-primary-600' : 'text-gray-500'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className={`font-medium ${formData.type === 'video' ? 'text-primary-700' : 'text-gray-700'}`}>
                              Video Lesson
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Embed an external video
                            </p>
                          </div>
                        </div>
                      </div>
                      {formData.type === 'video' && (
                        <div className="absolute inset-y-0 right-0 w-1 bg-primary-500"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video URL - conditionally rendered */}
                {formData.type === 'video' && (
                  <div className="animate-fadeIn">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL <span className="text-primary-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="url"
                          id="videoUrl"
                          name="videoUrl"
                          required={formData.type === 'video'}
                          className="text-black pl-10 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          value={formData.videoUrl}
                          onChange={handleChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      <div className="mt-4 flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="ml-2 text-sm text-blue-700">
                          Supports YouTube, Vimeo, and other major video platforms.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
                   <div className={`${activeSection === 'content' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <h2 className="text-xl font-bold text-gray-800">Lesson Content</h2>
                <p className="text-sm text-gray-600 mt-1">The main educational material for your students</p>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-4">
                    Content <span className="text-primary-500">*</span>
                  </label>
                  
                  {/* Rich Text Editor */}
                 <div className="rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                    <style jsx global>{`
                      .ql-container {
                        font-size: 16px;
                      }
                      .ql-editor {
                        min-height: 300px;
                        line-height: 1.6;
                        color: #374151 !important;
                        background-color: #ffffff !important;
                      }
                      .ql-editor p {
                        color: #374151 !important;
                      }
                      .ql-editor h1,
                      .ql-editor h2,
                      .ql-editor h3,
                      .ql-editor h4,
                      .ql-editor h5,
                      .ql-editor h6 {
                        color: #1f2937 !important;
                      }
                      .ql-editor ul,
                      .ql-editor ol,
                      .ql-editor li {
                        color: #374151 !important;
                      }
                      .ql-editor strong,
                      .ql-editor b {
                        color: #1f2937 !important;
                      }
                      .ql-editor em,
                      .ql-editor i {
                        color: #374151 !important;
                      }
                      .ql-editor blockquote {
                        color: #6b7280 !important;
                        border-left: 4px solid #e5e7eb;
                        padding-left: 1rem;
                        margin: 1rem 0;
                        font-style: italic;
                      }
                      .ql-editor code {
                        background-color: #f3f4f6;
                        color: #be185d !important;
                        padding: 0.125rem 0.25rem;
                        border-radius: 0.25rem;
                        font-size: 0.875rem;
                      }
                      .ql-editor pre {
                        background-color: #1f2937;
                        color: #f9fafb !important;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        margin: 1rem 0;
                      }
                      .ql-editor pre code {
                        background-color: transparent;
                        color: inherit !important;
                        padding: 0;
                      }
                      .ql-editor a {
                        color: #3b82f6 !important;
                        text-decoration: underline;
                      }
                      .ql-toolbar {
                        border-bottom: 1px solid #e5e7eb;
                        background-color: #f9fafb;
                      }
                      .ql-container {
                        border-bottom: none;
                      }
                      .ql-editor.ql-blank::before {
                        color: #9ca3af !important;
                        font-style: italic;
                      }
                      /* Fix untuk dark mode atau theme lain yang mungkin mengubah warna */
                      .ql-snow .ql-editor {
                        color: #374151 !important;
                      }
                      /* Pastikan semua elemen child juga menggunakan warna yang benar */
                      .ql-editor * {
                        color: inherit !important;
                      }
                      .ql-editor span {
                        color: #374151 !important;
                      }
                    `}</style>
                    
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Start writing your lesson content here. Use the toolbar above to format your text..."
                      style={{
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                    />
                  </div>
                  
                  <div className="mt-3 flex items-start space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">
                        <strong>Tips for creating engaging content:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Use headings to organize your content</li>
                        <li>Bold important terms and concepts</li>
                        <li>Use bullet points for lists and key takeaways</li>
                        <li>Add images and videos to support your explanations</li>
                        <li>Keep paragraphs short and focused</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Preview Section - Updated */}
                {/* Preview Section - Updated */}
                <div className="mt-10">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Content Preview
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-auto max-h-96">
                    <style jsx>{`
                      .prose { color: #374151 !important; }
                      .prose h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #1f2937 !important; }
                      .prose h2 { font-size: 1.75rem; font-weight: bold; margin-bottom: 0.875rem; color: #1f2937 !important; }
                      .prose h3 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem; color: #1f2937 !important; }
                      .prose h4 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.625rem; color: #1f2937 !important; }
                      .prose h5 { font-size: 1.125rem; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937 !important; }
                      .prose h6 { font-size: 1rem; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937 !important; }
                      .prose p { margin-bottom: 1rem; line-height: 1.6; color: #374151 !important; }
                      .prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; color: #374151 !important; }
                      .prose li { margin-bottom: 0.25rem; color: #374151 !important; }
                      .prose blockquote { 
                        border-left: 4px solid #e5e7eb; 
                        padding-left: 1rem; 
                        margin: 1rem 0;
                        font-style: italic;
                        color: #6b7280 !important;
                      }
                      .prose code { 
                        background-color: #f3f4f6; 
                        padding: 0.125rem 0.25rem; 
                        border-radius: 0.25rem;
                        font-size: 0.875rem;
                        color: #be185d !important;
                      }
                      .prose pre { 
                        background-color: #1f2937; 
                        color: #f9fafb !important; 
                        padding: 1rem; 
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        margin: 1rem 0;
                      }
                      .prose pre code {
                        background-color: transparent;
                        color: inherit !important;
                        padding: 0;
                      }
                      .prose img { 
                        max-width: 100%; 
                        height: auto; 
                        border-radius: 0.5rem;
                        margin: 1rem 0;
                      }
                      .prose a { 
                        color: #3b82f6 !important; 
                        text-decoration: underline;
                      }
                      .prose a:hover { 
                        color: #1d4ed8 !important; 
                      }
                      .prose strong, .prose b {
                        font-weight: 700;
                        color: #1f2937 !important;
                      }
                      .prose em, .prose i {
                        font-style: italic;
                        color: #374151 !important;
                      }
                      .prose u {
                        text-decoration: underline;
                        color: #374151 !important;
                      }
                      .prose s {
                        text-decoration: line-through;
                        color: #374151 !important;
                      }
                    `}</style>
                    {renderContentPreview(formData.content)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className={`${activeSection === 'attachments' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <h2 className="text-xl font-bold text-gray-800">Supplementary Materials</h2>
                <p className="text-sm text-gray-600 mt-1">Add supporting files for your students</p>
              </div>
              
              <div className="p-8">
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 border border-dashed border-gray-300 rounded-2xl p-6 transition-colors duration-300 hover:border-primary-300">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Files</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Drag and drop files here, or click to browse
                    </p>
                    <div className="mt-4">
                      <label htmlFor="attachments-upload" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Choose Files
                      </label>
                      <input
                        id="attachments-upload"
                        name="attachments"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX (max 10MB each)
                    </p>
                  </div>
                </div>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Current Attachments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {existingAttachments.map((att, index) => (
                        <div key={index} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <div className="p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="h-9 w-9 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {att.originalname || att.filename}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {att.size ? Math.round(att.size / 1024) + ' KB' : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingAttachment(att.path)}
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white bg-opacity-90 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Remove this file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly Added Files */}
                {newFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Files to Upload</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {newFiles.map((file, index) => (
                        <div key={index} className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <div className="p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="h-9 w-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {Math.round(file.size / 1024)} KB • New
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 left-0 h-full w-1 bg-blue-400"></div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(file)}
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white bg-opacity-90 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Remove this file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className={`${activeSection === 'settings' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <h2 className="text-xl font-bold text-gray-800">Lesson Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Configure additional options</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (minutes)
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        min="0"
                        className="text-black pl-10 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g. 15"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      How long will it take students to complete this lesson?
                    </p>
                  </div>

                  {/* Position */}
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Order
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="position"
                        name="position"
                        min="0"
                        required
                        className="text-black pl-10 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        value={formData.position}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Determines the order of lessons in the module (0 is first)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions - Fixed at Bottom */}
          <div className="sticky bottom-4 z-50 flex justify-end">
            <div className="bg-white rounded-full shadow-2xl p-2 flex space-x-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden inline-flex items-center px-6 py-2 rounded-full border border-transparent text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {initialData ? 'Update Lesson' : 'Create Lesson'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}