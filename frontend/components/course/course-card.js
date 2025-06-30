import Link from 'next/link';
import Image from 'next/image';

export default function CourseCard({ course }) {
  const thumbnailUrl = course.thumbnailUrl; 
  return (
    <Link href={`/courses/${course.id}`} legacyBehavior>
      <a className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48">
          {thumbnailUrl ? ( // Check if thumbnailUrl exists
            <Image
              src={thumbnailUrl} // Use the full URL
              alt={course.title}
              layout="fill"
              objectFit="cover"
              onError={(e) => { e.target.style.display = 'none'; /* Optional: Hide broken image */ }}
            />
          ) : (
            // Fallback display if no thumbnail
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-xl font-semibold px-2 text-center">{course.title}</span>
            </div>
          )}
          
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {course.category === 'mental_health' ? 'Mental Health' : 
               course.category === 'obesity' ? 'Obesity' : 'Other'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {course.level}
            </span>
          </div>
          <Link href={`/courses/${course.id}`}>
            <h3 className="text-lg leading-6 font-medium text-gray-900 hover:text-primary-600">
              {course.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-gray-500 line-clamp-3">
            {course.description}
          </p>
          <div className="mt-4 flex items-center">
            {course.instructor && (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {course.instructor.name.charAt(0)}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-900">
                  {course.instructor.name}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Link
              href={`/courses/${course.id}`}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              View Course
            </Link>
          </div>
        </div>
      </a>
    </Link>
  );
}