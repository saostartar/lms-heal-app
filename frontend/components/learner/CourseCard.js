import Link from 'next/link';

export default function CourseCard({ course, progress = null, lastAccessed = null }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {course.thumbnail && (
        <div className="h-40 bg-gray-200">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{course.title}</h3>
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {course.level}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        
        {progress !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 rounded-full h-2" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {lastAccessed ? (
            <span className="text-xs text-gray-500">
              Last accessed: {new Date(lastAccessed).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-sm text-gray-700">{course.category}</span>
          )}
          
          <Link
            href={`/learner/courses/${course.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            {progress === null ? 'View Course' : progress > 0 ? 'Continue' : 'Start'}
          </Link>
        </div>
      </div>
    </div>
  );
}