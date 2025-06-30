'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../lib/axios';

export default function QuestionForm({ courseId, moduleId, quizId, initialData = null, onError }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('question'); // To track active accordion section
  
  const [formData, setFormData] = useState({
    text: initialData?.text || '',
    type: initialData?.type || 'multiple_choice',
    points: initialData?.points || 1,
    position: initialData?.position || 0,
    explanation: initialData?.explanation || '',
    imageUrl: initialData?.imageUrl || '',
    isRequired: initialData?.isRequired !== false,
    options: initialData?.Options || [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      onError && onError('Questions must have at least 2 options');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate options - at least one must be correct for multiple choice
      if (formData.type === 'multiple_choice') {
        const hasCorrectOption = formData.options.some(opt => opt.isCorrect);
        if (!hasCorrectOption) {
          throw new Error('At least one option must be marked as correct');
        }
      }
      
      if (initialData) {
        await axios.put(`/api/quizzes/questions/${initialData.id}`, {
          ...formData,
          options: formData.type === 'multiple_choice' || formData.type === 'true_false' ? formData.options : []
        });
      } else {
        await axios.post(`/api/quizzes/${quizId}/questions`, {
          ...formData,
          options: formData.type === 'multiple_choice' || formData.type === 'true_false' ? formData.options : []
        });
      }
      
      router.push(`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`);
    } catch (err) {
      onError && onError('Failed to save question: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.type === 'true_false') {
      setFormData(prev => ({
        ...prev,
        options: [
          { text: 'True', isCorrect: prev.options?.[0]?.isCorrect || false },
          { text: 'False', isCorrect: prev.options?.[1]?.isCorrect || false }
        ]
      }));
    }
  }, [formData.type]);

  // Helper function to determine section styling
  const getSectionClass = (section) => {
    return `mb-6 rounded-2xl overflow-hidden transition-all duration-300 ${
      activeSection === section ? 'ring-2 ring-primary-200 shadow-lg' : 'border border-gray-200 shadow-sm'
    }`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Question Details Section */}
      <div className={getSectionClass('question')}>
        <div 
          className={`flex items-center justify-between p-5 cursor-pointer ${
            activeSection === 'question' ? 'bg-gradient-to-r from-primary-50 to-indigo-50' : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => setActiveSection(activeSection === 'question' ? '' : 'question')}
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white mr-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Question Details</h2>
          </div>
          <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${activeSection === 'question' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {activeSection === 'question' && (
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="space-y-6">
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="text"
                  name="text"
                  rows={3}
                  required
                  className="text-black form-input w-full rounded-xl bg-gray-50 focus:bg-white transition-all border-gray-200"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Enter the question here..."
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    className="text-black form-input w-full appearance-none pr-10 rounded-xl bg-gray-50 focus:bg-white transition-all border-gray-200"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center mt-4">
                  <div className={`p-1.5 rounded-md ${formData.type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'} mr-2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M16 4H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1zM7 8h2v2H7V8zm0 4h2v2H7v-2zm4-4h2v2h-2V8zm4 4h-2v2h2v-2z" />
                    </svg>
                  </div>
                  <div className={`p-1.5 rounded-md ${formData.type === 'true_false' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} mr-2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={`p-1.5 rounded-md ${formData.type === 'short_answer' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'} mr-2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={`p-1.5 rounded-md ${formData.type === 'essay' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Answer Options Section */}
      {(formData.type === 'multiple_choice' || formData.type === 'true_false') && (
        <div className={getSectionClass('options')}>
          <div 
            className={`flex items-center justify-between p-5 cursor-pointer ${
              activeSection === 'options' ? 'bg-gradient-to-r from-secondary-50 to-blue-50' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveSection(activeSection === 'options' ? '' : 'options')}
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center text-white mr-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Answer Options</h2>
            </div>
            <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${activeSection === 'options' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {activeSection === 'options' && (
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="space-y-4">
                {formData.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`group flex items-center gap-3 p-4 rounded-xl transition-all ${
                      option.isCorrect 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200 hover:border-primary-200 hover:bg-white'
                    }`}
                  >
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full font-medium ${
                      option.isCorrect 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <input
                      type={formData.type === 'true_false' ? 'radio' : 'checkbox'}
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                      name={formData.type === 'true_false' ? 'correctOption' : `option-${index}`}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={`text-black flex-1 form-input rounded-lg ${
                        option.isCorrect ? 'border-green-300 bg-green-50' : ''
                      }`}
                      disabled={formData.type === 'true_false'}
                      required={formData.type === 'multiple_choice'}
                    />
                    
                    {formData.type === 'multiple_choice' && (
                      <button 
                        type="button" 
                        onClick={() => removeOption(index)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                {formData.type === 'multiple_choice' && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-primary-600 hover:text-primary-700 hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Another Option
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Advanced Settings Section */}
      <div className={getSectionClass('settings')}>
        <div 
          className={`flex items-center justify-between p-5 cursor-pointer ${
            activeSection === 'settings' ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => setActiveSection(activeSection === 'settings' ? '' : 'settings')}
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Additional Settings</h2>
          </div>
          <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${activeSection === 'settings' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {activeSection === 'settings' && (
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-0.5 shadow-sm">
                  <div className="bg-white p-5 rounded-[10px] h-full">
                    <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                      Points
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        id="points"
                        name="points"
                        min="1"
                        className="text-black form-input w-full rounded-lg pr-12"
                        value={formData.points}
                        onChange={handleChange}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        points
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-0.5 shadow-sm">
                  <div className="bg-white p-5 rounded-[10px] h-full">
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position (Order)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="position"
                        name="position"
                        min="0"
                        className="text-black form-input w-full rounded-lg"
                        value={formData.position}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-0.5 shadow-sm">
                <div className="bg-white p-5 rounded-[10px]">
                  <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation (shown after answering)
                  </label>
                  <textarea
                    id="explanation"
                    name="explanation"
                    rows={3}
                    className="text-black form-input w-full mt-1 rounded-lg"
                    value={formData.explanation}
                    onChange={handleChange}
                    placeholder="Explain why the correct answer is right..."
                  />
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-0.5 shadow-sm">
                <div className="bg-white p-5 rounded-[10px]">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    className="text-black form-input w-full mt-1 rounded-lg"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  {formData.imageUrl && (
                    <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-4 bg-gray-50 flex justify-center">
                      <img
                        src={formData.imageUrl}
                        alt="Question image preview"
                        className="max-h-48 object-contain rounded-md shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%236b7280'%3EInvalid Image URL%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 rounded-xl flex items-center">
                  <input
                    type="checkbox"
                    id="isRequired"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleChange}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="ml-3">
                    <span className="font-medium text-gray-700">Required question</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Students must answer this question to progress
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="flex justify-end pt-6 border-t border-gray-200 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          className="btn btn-primary relative overflow-hidden group"
          disabled={loading}
        >
          <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full bg-white/20 group-hover:translate-x-[-100%]"></span>
          <div className="relative flex items-center">
            {loading ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : initialData ? (
              'Update Question'
            ) : (
              'Create Question'
            )}
          </div>
        </button>
      </div>
    </form>
  );
}