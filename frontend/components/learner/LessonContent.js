import { useState } from 'react';

export default function LessonContent({ lesson }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  if (!lesson) return null;

  return (
    <div className="lesson-content">
      {/* Video Lesson */}
      {lesson.type === 'video' && lesson.videoUrl && (
        <div className="mb-6">
          {!isVideoLoaded && (
            <div className="flex justify-center items-center h-96 bg-gray-100 rounded-md">
              <div className="animate-pulse">Loading video...</div>
            </div>
          )}
          <div className={`aspect-w-16 aspect-h-9 ${!isVideoLoaded ? 'hidden' : ''}`}>
            <iframe 
              src={lesson.videoUrl.replace('watch?v=', 'embed/')} 
              className="w-full h-96 rounded-md"
              onLoad={() => setIsVideoLoaded(true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Text Content */}
      <div className="prose max-w-none mb-6">
        {lesson.content && (
          <div className="whitespace-pre-wrap">{lesson.content}</div>
        )}
      </div>

      {/* Attachments */}
      {lesson.attachments && lesson.attachments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Attachments</h3>
          <div className="space-y-2">
            {lesson.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  {attachment.name || `Attachment ${index + 1}`}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}