import { useState } from 'react';
import Link from 'next/link';

export default function ModuleAccordion({ modules, courseId, currentModuleId, currentLessonId }) {
  const [openModules, setOpenModules] = useState({});

  // Initialize with current module open
  useState(() => {
    if (currentModuleId) {
      setOpenModules(prev => ({
        ...prev,
        [currentModuleId]: true
      }));
    }
  }, [currentModuleId]);

  const toggleModule = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (!modules || modules.length === 0) return null;

  return (
    <div className="module-accordion space-y-2">
      {modules.map((module, index) => (
        <div key={module.id} className="border border-gray-200 rounded-md overflow-hidden">
          <div 
            className={`px-4 py-3 flex justify-between items-center cursor-pointer ${
              Number(currentModuleId) === module.id ? 'bg-primary-50' : 'bg-gray-50'
            }`}
            onClick={() => toggleModule(module.id)}
          >
            <h4 className="font-medium">Module {index + 1}: {module.title}</h4>
            <svg 
              className={`h-5 w-5 text-gray-500 transform ${openModules[module.id] ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {openModules[module.id] && module.lessons && module.lessons.length > 0 && (
            <div className="divide-y divide-gray-200">
              {module.lessons.map((lesson, lessonIndex) => (
                <div 
                  key={lesson.id} 
                  className={`px-4 py-3 flex justify-between items-center hover:bg-gray-50 ${
                    Number(currentLessonId) === lesson.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Lesson {lessonIndex + 1}:</span>
                    <span className="font-medium">{lesson.title}</span>
                    {lesson.completed && (
                      <svg className="ml-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded">
                      {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Quiz' : 'Text'}
                    </span>
                  </div>
                  
                  {lesson.isUnlocked !== false && (
                    <Link
                      href={`/learner/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      {lesson.completed ? 'Review' : 'Start'}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}