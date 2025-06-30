import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { useRouter } from 'next/navigation';

export default function CourseTestForm({ 
  courseId, 
  initialData = null, 
  isEditing = false,
  apiEndpoint = null,
  apiMethod = 'post'
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [
      {
        text: '',
        type: 'multiple_choice',
        points: 1,
        position: 1,
        explanation: '',
        imageUrl: '',
        isRequired: true,
        options: [
          { text: '', isCorrect: false, explanation: '', position: 0 },
          { text: '', isCorrect: false, explanation: '', position: 1 },
          { text: '', isCorrect: false, explanation: '', position: 2 },
          { text: '', isCorrect: false, explanation: '', position: 3 }
        ]
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Test title is required';
    }
    
    let questionErrors = [];
    let hasCorrectOption = false;
    
    formData.questions.forEach((question, qIndex) => {
      const qErrors = {};
      
      if (!question.text.trim()) {
        qErrors.text = 'Question text is required';
      }
      
      if (question.points < 1) {
        qErrors.points = 'Points must be at least 1';
      }
      
      let optionErrors = [];
      let hasCorrect = false;
      
      // Only validate options for multiple choice or true/false questions
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        // For true_false, ensure exactly 2 options
        if (question.type === 'true_false' && question.options.length !== 2) {
          qErrors.options = 'True/False questions must have exactly 2 options';
        }
        
        question.options.forEach((option, oIndex) => {
          const oErrors = {};
          
          if (!option.text.trim()) {
            oErrors.text = 'Option text cannot be empty';
          }
          
          if (option.isCorrect) {
            hasCorrect = true;
            hasCorrectOption = true;
          }
          
          if (Object.keys(oErrors).length > 0) {
            optionErrors[oIndex] = oErrors;
          }
        });
        
        if (!hasCorrect) {
          qErrors.options = 'At least one option must be marked as correct';
        }
      }
      
      if (Object.keys(qErrors).length > 0 || optionErrors.length > 0) {
        qErrors.optionErrors = optionErrors;
        questionErrors[qIndex] = qErrors;
      }
    });
    
    if (!hasCorrectOption && formData.questions.some(q => q.type === 'multiple_choice' || q.type === 'true_false')) {
      errors.general = 'Multiple choice and True/False questions must have at least one correct answer';
    }
    
    if (questionErrors.length > 0) {
      errors.questions = questionErrors;
    }
    
    return errors;
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    
    // Special handling for question type changes
    if (field === 'type') {
      const currentQuestion = updatedQuestions[index];
      
      // If changing to true_false, adjust options to exactly 2
      if (value === 'true_false') {
        // Limit to 2 options
        const options = currentQuestion.options.slice(0, 2);
        
        // If less than 2 options, add them
        while (options.length < 2) {
          options.push({ 
            text: options.length === 0 ? 'True' : 'False', 
            isCorrect: false,
            explanation: '',
            position: options.length
          });
        }
        
        currentQuestion.options = options;
      }
      // If changing from true_false to multiple_choice, ensure at least 4 options
      else if (currentQuestion.type === 'true_false' && value === 'multiple_choice') {
        const options = [...currentQuestion.options];
        while (options.length < 4) {
          options.push({ 
            text: '', 
            isCorrect: false,
            explanation: '',
            position: options.length
          });
        }
        currentQuestion.options = options;
      }
      // If changing to short_answer or essay, options are not needed
      else if (value === 'short_answer' || value === 'essay') {
        // Keep options in the object but they won't be used
        // We're not removing them in case the user switches back
      }
    }
    
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
    
    // Clear validation errors for this field if any
    if (validationErrors.questions?.[index]?.[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors.questions[index][field];
      setValidationErrors(newErrors);
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    
    // If changing isCorrect, check if it's a true_false question
    if (field === 'isCorrect' && value === true) {
      const questionType = updatedQuestions[questionIndex].type;
      
      // For multiple_choice, uncheck all other options for radio button behavior
      if (questionType === 'multiple_choice') {
        updatedOptions.forEach((option, idx) => {
          updatedOptions[idx] = { ...option, isCorrect: idx === optionIndex };
        });
      }
      // For true_false, ensure exactly one option is correct
      else if (questionType === 'true_false') {
        updatedOptions.forEach((option, idx) => {
          updatedOptions[idx] = { ...option, isCorrect: idx === optionIndex };
        });
      }
    } else {
      updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    }
    
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions };
    setFormData({ ...formData, questions: updatedQuestions });
    
    // Clear validation errors for this option if any
    if (validationErrors.questions?.[questionIndex]?.optionErrors?.[optionIndex]) {
      const newErrors = { ...validationErrors };
      delete newErrors.questions[questionIndex].optionErrors[optionIndex];
      setValidationErrors(newErrors);
    }
  };

  const addQuestion = () => {
    const newPosition = formData.questions.length + 1;
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          type: 'multiple_choice',
          points: 1,
          position: newPosition,
          explanation: '',
          imageUrl: '',
          isRequired: true,
          options: [
            { text: '', isCorrect: false, explanation: '', position: 0 },
            { text: '', isCorrect: false, explanation: '', position: 1 },
            { text: '', isCorrect: false, explanation: '', position: 2 },
            { text: '', isCorrect: false, explanation: '', position: 3 }
          ]
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      setError('You must have at least one question');
      return;
    }
    
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    // Update positions after removal
    updatedQuestions.forEach((q, i) => {
      updatedQuestions[i] = { ...q, position: i + 1 };
    });
    setFormData({ ...formData, questions: updatedQuestions });
    
    // Clear validation errors for this question if any
    if (validationErrors.questions?.[index]) {
      const newErrors = { ...validationErrors };
      newErrors.questions = newErrors.questions.filter((_, i) => i !== index);
      setValidationErrors(newErrors);
    }
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    const questionType = updatedQuestions[questionIndex].type;
    
    // Don't add more options for true/false questions
    if (questionType === 'true_false' && updatedQuestions[questionIndex].options.length >= 2) {
      setError('True/False questions can only have 2 options');
      return;
    }
    
    const newPosition = updatedQuestions[questionIndex].options.length;
    updatedQuestions[questionIndex].options.push({ 
      text: '', 
      isCorrect: false, 
      explanation: '',
      position: newPosition
    });
    
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    const questionType = updatedQuestions[questionIndex].type;
    
    // Don't allow removing for true/false if only 2 options remain
    if (questionType === 'true_false') {
      setError('True/False questions must have exactly 2 options');
      return;
    }
    
    // Don't allow removing if only 2 options remain for multiple choice
    if (updatedQuestions[questionIndex].options.length <= 2) {
      setError('Questions must have at least 2 options');
      return;
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    
    // Update positions for remaining options
    updatedQuestions[questionIndex].options.forEach((o, i) => {
      updatedQuestions[questionIndex].options[i].position = i;
    });
    
    setFormData({ ...formData, questions: updatedQuestions });
    
    // Clear validation errors for this option if any
    if (validationErrors.questions?.[questionIndex]?.optionErrors?.[optionIndex]) {
      const newErrors = { ...validationErrors };
      delete newErrors.questions[questionIndex].optionErrors[optionIndex];
      setValidationErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    
    // Validate form before submission
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);

    try {
      const endpoint = apiEndpoint || `/api/courses/${courseId}/tests`;
      
      if (apiMethod === 'put') {
        await axios.put(endpoint, formData);
      } else {
        await axios.post(endpoint, formData);
      }
      
      router.push(`/instructor/courses/${courseId}/tests`);
    } catch (err) {
      console.error('Error saving tests:', err);
      setError(err.response?.data?.message || `An error occurred while ${isEditing ? 'updating' : 'creating'} the tests`);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Error notifications */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-pulse">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0v-5a1 1 0 10-2 0v5z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}
      
      {validationErrors.general && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-700 font-medium">{validationErrors.general}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Test title and description section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-5 border border-primary-200">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Assessment Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Test Title <span className="text-primary-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({...formData, title: e.target.value});
                    if (validationErrors.title) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.title;
                      setValidationErrors(newErrors);
                    }
                  }}
                  className="text-black form-input w-full focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter test title"
                  required
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 italic">This title will be used for both pre-test and post-test</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="text-black form-input w-full focus:ring-primary-500 focus:border-primary-500"
                  placeholder="This assessment will measure your knowledge before and after the course"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Questions
            </h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
          
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            The same questions will appear in both pre-test and post-test to accurately measure knowledge gain.
          </p>

          {formData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h4 className="text-md font-semibold text-gray-700 flex items-center">
                  <span className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                    {questionIndex + 1}
                  </span>
                  Question {questionIndex + 1}
                </h4>
                <button 
                  type="button" 
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text <span className="text-primary-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                    className="text-black form-input w-full focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your question here"
                    required
                  />
                  {validationErrors.questions?.[questionIndex]?.text && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.questions[questionIndex].text}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points <span className="text-primary-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value) || 1)}
                    min="1"
                    className="text-black form-input w-full focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  {validationErrors.questions?.[questionIndex]?.points && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.questions[questionIndex].points}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type <span className="text-primary-500">*</span>
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                    className="text-black form-select w-full focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={question.explanation || ''}
                    onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                    className="text-black form-input w-full focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Explanation for this question"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`required-${questionIndex}`}
                    checked={question.isRequired}
                    onChange={(e) => handleQuestionChange(questionIndex, 'isRequired', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`required-${questionIndex}`} className="ml-2 block text-sm text-gray-700">
                    Required question
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={question.imageUrl || ''}
                  onChange={(e) => handleQuestionChange(questionIndex, 'imageUrl', e.target.value)}
                  className="text-black form-input w-full focus:ring-primary-500 focus:border-primary-500"
                  placeholder="URL to an image for this question"
                />
              </div>

              {/* Only show options for multiple_choice and true_false question types */}
              {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                      Answer Options <span className="text-primary-500 ml-1">*</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      disabled={question.options.length >= 10 || question.type === 'true_false'}
                      className={`text-sm flex items-center font-medium ${
                        question.options.length >= 10 || question.type === 'true_false'
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-primary-600 hover:text-primary-800'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {question.type === 'multiple_choice' 
                      ? 'Mark the correct answer (exactly one per question)' 
                      : 'Select which option is the correct answer (True or False)'}
                  </p>
                  
                  {validationErrors.questions?.[questionIndex]?.options && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {validationErrors.questions[questionIndex].options}
                    </p>
                  )}

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                          <input
                            type="radio"
                            id={`q${questionIndex}-o${optionIndex}`}
                            name={`q${questionIndex}-correct`}
                            checked={option.isCorrect}
                            onChange={() => handleOptionChange(questionIndex, optionIndex, 'isCorrect', true)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                        </div>
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="text-black form-input w-full border-0 focus:ring-primary-500 bg-transparent"
                            required
                          />
                        </div>
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={option.explanation || ''}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'explanation', e.target.value)}
                            placeholder="Option explanation (optional)"
                            className="text-black form-input w-full border-0 focus:ring-primary-500 bg-transparent"
                          />
                        </div>
                        {question.type !== 'true_false' && question.options.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500"
                            title="Remove this option"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* For short_answer and essay types, show a preview of how it will appear */}
              {question.type === 'short_answer' && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Short Answer Question</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Student will enter a short text answer (1-2 sentences)
                  </p>
                  <div className="border border-gray-300 rounded-md p-2 bg-white">
                    <input
                      type="text"
                      disabled
                      placeholder="Student will type their answer here..."
                      className="form-input w-full border-0 bg-white text-gray-400"
                    />
                  </div>
                </div>
              )}

              {question.type === 'essay' && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Essay Question</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Student will write a longer response
                  </p>
                  <div className="border border-gray-300 rounded-md p-2 bg-white">
                    <textarea
                      disabled
                      rows={3}
                      placeholder="Student will write their essay response here..."
                      className="form-textarea w-full border-0 bg-white text-gray-400"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form actions */}
        <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary relative overflow-hidden group"
          >
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Saving Changes...' : 'Creating Tests...'}
              </span>
            ) : (
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isEditing ? 'Save Changes' : 'Create Tests'}
                <span className="absolute right-0 top-0 h-full w-0 bg-white bg-opacity-20 transform -skew-x-12 group-hover:w-full transition-all duration-500"></span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}