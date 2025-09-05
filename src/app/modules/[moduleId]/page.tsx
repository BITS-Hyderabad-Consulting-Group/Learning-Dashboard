// Module details page for /modules/[moduleId]
'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ModuleData {
    id: string;
    title: string;
    week: { id: string; title: string };
    course: { id: string; title: string };
    type: 'video' | 'article' | 'evaluative' | 'markdown' | 'hyperlink';
    content: string;
    evaluativeType?: 'quiz' | 'assignment';
}

export default function ModulePage() {
    const { moduleId } = useParams();
    const [module, setModule] = useState<ModuleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchModule() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/modules/${moduleId}`);
                if (!res.ok) throw new Error('Module not found');
                const data = await res.json();
                setModule(data);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Error loading module';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        if (moduleId) fetchModule();
    }, [moduleId]);

    if (loading) return <div className="p-8 text-center">Loading module...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!module) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Title, Course, Week Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{module.title}</CardTitle>
                    <div className="text-gray-500 text-sm mt-1">
                        <span>Course: {module.course ? module.course.title : 'N/A'}</span>
                        <br></br>
                        <span>{module.week ? module.week.title : 'N/A'}</span>
                    </div>
                </CardHeader>
            </Card>

            {/* Content directly on page */}
            <div className="mb-6">
                {module.type === 'video' &&
                    (() => {
                        let videoUrl = '';

                        // Try to parse as JSON first (format: {"url": "..."})
                        try {
                            const videoData = JSON.parse(module.content);
                            videoUrl = videoData.url;
                        } catch {
                            // If JSON parsing fails, treat as plain URL string
                            videoUrl = module.content.trim();
                        }

                        if (videoUrl) {
                            // Convert YouTube watch URLs to embed format
                            let embedUrl = videoUrl;
                            if (videoUrl.includes('youtube.com/watch?v=')) {
                                const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                                embedUrl = `https://www.youtube.com/embed/${videoId}`;
                            } else if (videoUrl.includes('youtu.be/')) {
                                const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                                embedUrl = `https://www.youtube.com/embed/${videoId}`;
                            }

                            return (
                                <div className="aspect-video w-full mb-4">
                                    <iframe
                                        src={embedUrl}
                                        title={module.title}
                                        allowFullScreen
                                        className="w-full h-full rounded-lg border"
                                    />
                                </div>
                            );
                        }

                        return <div className="text-gray-500">No video available</div>;
                    })()}
                {module.type === 'hyperlink' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center">
                        <a
                            href={module.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-semibold underline text-lg hover:text-blue-900"
                        >
                            {module.content}
                        </a>
                    </div>
                )}
                {(module.type === 'article' || module.type === 'markdown') && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                        <div className="prose max-w-none">
                            <Markdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h1: ({ children }) => (
                                        <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>
                                    ),
                                    h4: ({ children }) => (
                                        <h4 className="text-lg font-bold mb-2 mt-3">{children}</h4>
                                    ),
                                    pre: ({ children }) => (
                                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto border font-mono text-sm mt-4 mb-4">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ children, className }) => {
                                        // Check if it's inside a pre tag (code block) or inline
                                        if (className && className.includes('language-')) {
                                            return (
                                                <code className="text-green-400">{children}</code>
                                            );
                                        }
                                        // Inline code
                                        return (
                                            <code className="bg-gray-200 text-red-600 px-1 py-0.5 rounded text-sm font-mono">
                                                {children}
                                            </code>
                                        );
                                    },
                                    // Table components
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-6">
                                            <table className="min-w-full border-collapse border border-gray-300 bg-white">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="bg-gray-100 border-b border-gray-300">
                                            {children}
                                        </thead>
                                    ),
                                    tbody: ({ children }) => (
                                        <tbody className="bg-white">{children}</tbody>
                                    ),
                                    tr: ({ children }) => (
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            {children}
                                        </tr>
                                    ),
                                    th: ({ children }) => (
                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900 bg-gray-100 whitespace-nowrap align-top">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="border border-gray-300 px-3 py-2 text-gray-800 whitespace-nowrap align-top">
                                            {children}
                                        </td>
                                    ),
                                    // Text formatting
                                    strong: ({ children }) => (
                                        <strong className="font-bold text-gray-900">
                                            {children}
                                        </strong>
                                    ),
                                    em: ({ children }) => (
                                        <em className="italic text-gray-800">{children}</em>
                                    ),
                                    u: ({ children }) => <u className="underline">{children}</u>,
                                    // Lists
                                    ul: ({ children }) => (
                                        <ul className="list-disc pl-6 my-3 space-y-1">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal pl-6 my-3 space-y-1">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => {
                                        // Handle checkboxes in list items
                                        const childText =
                                            typeof children === 'string'
                                                ? children
                                                : Array.isArray(children)
                                                ? children.join('')
                                                : String(children);

                                        if (childText.startsWith('[x] ')) {
                                            return (
                                                <li className="text-gray-700 list-none flex items-center">
                                                    <span className="mr-2 text-green-600">✅</span>
                                                    {childText.substring(4)}
                                                </li>
                                            );
                                        } else if (childText.startsWith('[ ] ')) {
                                            return (
                                                <li className="text-gray-700 list-none flex items-center">
                                                    <span className="mr-2 text-gray-400">☐</span>
                                                    {childText.substring(4)}
                                                </li>
                                            );
                                        }

                                        return <li className="text-gray-700">{children}</li>;
                                    },
                                    // Paragraphs and line breaks
                                    p: ({ children }) => (
                                        <p className="mb-3 text-gray-700 leading-relaxed">
                                            {children}
                                        </p>
                                    ),
                                    br: () => <br className="my-2" />,
                                    // Blockquotes
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-teal-400 pl-4 my-4 italic text-gray-600 bg-gray-50 py-2">
                                            {children}
                                        </blockquote>
                                    ),
                                    // Links
                                    a: ({ children, href }) => (
                                        <a
                                            href={href}
                                            className="text-teal-600 hover:text-teal-800 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {children}
                                        </a>
                                    ),
                                }}
                            >
                                {module.content}
                            </Markdown>
                        </div>
                    </div>
                )}
                {module.type === 'evaluative' && (
                    <div>
                        <div className="font-semibold mb-2 text-lg">
                            {module.evaluativeType === 'quiz' ? 'Quiz' : 'Assignment'}
                        </div>
                        <div className="bg-gray-50 rounded p-4 border text-gray-800 whitespace-pre-line">
                            {module.content}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
