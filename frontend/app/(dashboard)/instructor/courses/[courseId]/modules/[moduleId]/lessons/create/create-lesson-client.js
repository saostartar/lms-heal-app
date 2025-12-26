'use client';

import LessonForm from '@/components/instructor/LessonForm';

export default function CreateLessonClient({ initialModule, params }) {
  const { courseId, moduleId } = params;

  // Jika data modul gagal dimuat dari server, tampilkan pesan error
  if (!initialModule) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-6 rounded-md shadow-md flex items-center my-8 max-w-3xl mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-lg font-medium">Failed to load module information. Please go back and try again.</p>
      </div>
    );
  }

  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with visual elements */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white mb-8 transform hover:scale-[1.01] transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-full shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1 text-white">Add New Lesson</h1>
            <p className="text-primary-100">Creating content for module: <span className="font-medium">{moduleTitle}</span></p>
          </div>
        </div>
      </div>

      {/* Form component */}
      <div className="transform transition-all duration-500">
        <LessonForm courseId={courseId} moduleId={moduleId} />
      </div>

      {/* Tips section */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg shadow-sm mt-8 transform transition-all duration-300 hover:shadow-md">
        <h3 className="text-blue-800 text-lg font-medium mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Tips for Creating Effective Lessons
        </h3>
        <ul className="space-y-2 text-sm text-blue-700 ml-6 list-disc">
          <li>Keep content focused on a single learning objective</li>
          <li>Include relevant examples and practice opportunities</li>
          <li>If using video, keep it under 10 minutes for better engagement</li>
          <li>Use clear headings and organize content logically</li>
        </ul>
      </div>
    </div>
  );
}