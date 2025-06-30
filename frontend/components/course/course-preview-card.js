import Link from 'next/link';

export default function CoursePreviewCard({ course }) {
  // Format category for display
  const formatCategory = (category) => {
    if (category === 'mental_health') return 'Mental Health';
    if (category === 'obesity') return 'Obesity';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Format level for display
  const formatLevel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {formatLevel(course.level)}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">{formatCategory(course.category)}</span>
          <Link
            href={`/preview/courses/${course.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Preview Course
          </Link>
        </div>
      </div>
    </div>
  );
}