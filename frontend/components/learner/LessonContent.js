'use client';

import { useState } from 'react';

export default function LessonContent({ lesson }) {
  const [showAttachments, setShowAttachments] = useState(false);

  // Function to safely render HTML content
  const renderHTMLContent = (htmlContent) => {
    if (!htmlContent) return null;
    
    return (
      <div 
        className="prose prose-lg max-w-none lesson-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Video Content */}
      {lesson.type === 'video' && lesson.videoUrl && (
        <div className="mb-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={lesson.videoUrl.replace('watch?v=', 'embed/')}
              title={lesson.title}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Rich Text Content */}
      {lesson.content && (
        <div className="mb-6">
          <style jsx>{`
            .lesson-content h1 { 
              font-size: 2.25rem; 
              font-weight: bold; 
              margin-bottom: 1.5rem;
              margin-top: 2rem;
              color: #1f2937;
              line-height: 1.2;
            }
            .lesson-content h2 { 
              font-size: 2rem; 
              font-weight: bold; 
              margin-bottom: 1.25rem;
              margin-top: 1.75rem;
              color: #1f2937;
              line-height: 1.3;
            }
            .lesson-content h3 { 
              font-size: 1.75rem; 
              font-weight: bold; 
              margin-bottom: 1rem;
              margin-top: 1.5rem;
              color: #1f2937;
              line-height: 1.4;
            }
            .lesson-content h4 { 
              font-size: 1.5rem; 
              font-weight: bold; 
              margin-bottom: 0.875rem;
              margin-top: 1.25rem;
              color: #374151;
              line-height: 1.4;
            }
            .lesson-content h5 { 
              font-size: 1.25rem; 
              font-weight: bold; 
              margin-bottom: 0.75rem;
              margin-top: 1rem;
              color: #374151;
              line-height: 1.5;
            }
            .lesson-content h6 { 
              font-size: 1.125rem; 
              font-weight: bold; 
              margin-bottom: 0.5rem;
              margin-top: 0.875rem;
              color: #4b5563;
              line-height: 1.5;
            }
            .lesson-content p { 
              margin-bottom: 1.25rem; 
              line-height: 1.75;
              color: #374151;
              font-size: 1.125rem;
            }
            .lesson-content ul, .lesson-content ol { 
              margin-bottom: 1.25rem; 
              padding-left: 2rem;
              color: #374151;
            }
            .lesson-content li { 
              margin-bottom: 0.5rem;
              line-height: 1.6;
            }
            .lesson-content ul li {
              list-style-type: disc;
            }
            .lesson-content ol li {
              list-style-type: decimal;
            }
            .lesson-content blockquote { 
              border-left: 4px solid #3b82f6; 
              padding-left: 1.5rem; 
              margin: 1.5rem 0;
              font-style: italic;
              color: #6b7280;
              background-color: #f8fafc;
              padding-top: 1rem;
              padding-bottom: 1rem;
              border-radius: 0 0.5rem 0.5rem 0;
            }
            .lesson-content code { 
              background-color: #f1f5f9; 
              color: #be185d;
              padding: 0.25rem 0.5rem; 
              border-radius: 0.375rem;
              font-size: 0.875rem;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            .lesson-content pre { 
              background-color: #1e293b; 
              color: #e2e8f0; 
              padding: 1.5rem; 
              border-radius: 0.75rem;
              overflow-x: auto;
              margin: 1.5rem 0;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            .lesson-content pre code {
              background-color: transparent;
              color: inherit;
              padding: 0;
            }
            .lesson-content img { 
              max-width: 100%; 
              height: auto; 
              border-radius: 0.75rem;
              margin: 1.5rem auto;
              display: block;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .lesson-content a { 
              color: #3b82f6; 
              text-decoration: underline;
              font-weight: 500;
            }
            .lesson-content a:hover { 
              color: #1d4ed8; 
              text-decoration: none;
            }
            .lesson-content strong, .lesson-content b {
              font-weight: 700;
              color: #1f2937;
            }
            .lesson-content em, .lesson-content i {
              font-style: italic;
            }
            .lesson-content u {
              text-decoration: underline;
            }
            .lesson-content s {
              text-decoration: line-through;
            }
            .lesson-content sup {
              vertical-align: super;
              font-size: smaller;
            }
            .lesson-content sub {
              vertical-align: sub;
              font-size: smaller;
            }
            .lesson-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5rem 0;
            }
            .lesson-content th, .lesson-content td {
              border: 1px solid #d1d5db;
              padding: 0.75rem;
              text-align: left;
            }
            .lesson-content th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .lesson-content .ql-align-center {
              text-align: center;
            }
            .lesson-content .ql-align-right {
              text-align: right;
            }
            .lesson-content .ql-align-justify {
              text-align: justify;
            }
          `}</style>
          {renderHTMLContent(lesson.content)}
        </div>
      )}

      {/* Attachments */}
      {lesson.attachments && lesson.attachments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-lg text-gray-800">Supplementary Materials</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-blue-800">
                View Attachments ({lesson.attachments.length})
              </span>
              <svg 
                className={`h-5 w-5 text-blue-600 transform transition-transform ${showAttachments ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAttachments && (
              <div className="mt-4 space-y-2">
                {lesson.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center bg-white p-3 rounded-lg border border-blue-200">
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex-1"
                    >
                      {attachment.name || `Attachment ${index + 1}`}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}