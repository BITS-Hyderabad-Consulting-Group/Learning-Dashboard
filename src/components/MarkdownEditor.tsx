import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { FileText, Eye } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
    placeholder?: string;
}

// CSS styles for markdown preview
const markdownStyles = {
    wrapper: {
        fontSize: '0.875rem',
        lineHeight: '1.625',
        color: '#374151',
    } as const,
    h1: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        color: '#111827',
    } as const,
    h2: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#111827',
    } as const,
    h3: {
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#111827',
    } as const,
    p: {
        marginBottom: '1rem',
    } as const,
    ul: {
        listStyleType: 'disc' as const,
        paddingLeft: '1.5rem',
        marginBottom: '1rem',
    } as const,
    ol: {
        listStyleType: 'decimal' as const,
        paddingLeft: '1.5rem',
        marginBottom: '1rem',
    } as const,
    li: {
        marginBottom: '0.25rem',
    } as const,
    strong: {
        fontWeight: '600',
        color: '#111827',
    } as const,
    em: {
        fontStyle: 'italic' as const,
    } as const,
    code: {
        backgroundColor: '#f3f4f6',
        padding: '0.125rem 0.25rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        color: '#111827',
    } as const,
    pre: {
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        padding: '1rem',
        borderRadius: '0.5rem',
        overflowX: 'auto' as const,
        marginBottom: '1rem',
    } as const,
    blockquote: {
        borderLeft: '4px solid #e5e7eb',
        paddingLeft: '1rem',
        fontStyle: 'italic' as const,
        color: '#6b7280',
        marginBottom: '1rem',
    } as const,
    a: {
        color: '#059669',
        textDecoration: 'underline' as const,
    } as const,
    hr: {
        borderTop: '1px solid #e5e7eb',
        margin: '1.5rem 0',
    } as const,
};

export function MarkdownEditor({
    title,
    content,
    onTitleChange,
    onContentChange,
    placeholder = 'Write your content here in Markdown...',
}: MarkdownEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Force re-render of preview when content changes to ensure live update
    useEffect(() => {
        setPreviewKey(prev => prev + 1);
    }, [content]);
    
    // If not mounted yet, show loading state
    if (!mounted) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                <Card className="flex flex-col">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                <FileText className="w-3 h-3 text-white" />
                            </div>
                            <CardTitle className="text-teal-600">Article Editor</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
                        <div className="space-y-2">
                            <Label>Article Title</Label>
                            <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                        <div className="space-y-2 flex-1 flex flex-col">
                            <Label>Content (Markdown)</Label>
                            <div className="flex-1 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                <Eye className="w-3 h-3 text-white" />
                            </div>
                            <CardTitle className="text-teal-600">Live Preview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 bg-gray-50 overflow-y-auto">
                        <div className="text-gray-400 text-center py-12">
                            <p>Loading preview...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            {/* Editor Panel */}
            <Card className="flex flex-col">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <FileText className="w-3 h-3 text-white" />
                        </div>
                        <CardTitle className="text-teal-600">Article Editor</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    <div className="space-y-2">
                        <Label htmlFor="articleTitle">Article Title</Label>
                        <Input
                            id="articleTitle"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder="Enter article title"
                            className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <Label htmlFor="markdownContent">Content (Markdown)</Label>
                        <Textarea
                            id="markdownContent"
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 resize-none border-teal-200 focus:border-teal-500 focus:ring-teal-500 font-mono text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                            Supports Markdown
                        </Badge>
                        <span>Use # for headers, **bold**, *italic*, ```code```</span>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="flex flex-col">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <Eye className="w-3 h-3 text-white" />
                        </div>
                        <CardTitle className="text-teal-600">Live Preview</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 bg-gray-50 overflow-y-auto" suppressHydrationWarning>
                    {title && (
                        <h1 className="text-2xl font-medium mb-6 text-gray-800 border-b border-gray-200 pb-3">
                            {title}
                        </h1>
                    )}
                    {content ? (
                        <div className="text-gray-700 leading-relaxed">
                            <Markdown
                                key={previewKey}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({children}) => <h1 style={markdownStyles.h1}>{children}</h1>,
                                    h2: ({children}) => <h2 style={markdownStyles.h2}>{children}</h2>,
                                    h3: ({children}) => <h3 style={markdownStyles.h3}>{children}</h3>,
                                    p: ({children}) => <p style={markdownStyles.p}>{children}</p>,
                                    ul: ({children}) => <ul style={markdownStyles.ul}>{children}</ul>,
                                    ol: ({children}) => <ol style={markdownStyles.ol}>{children}</ol>,
                                    li: ({children}) => <li style={markdownStyles.li}>{children}</li>,
                                    strong: ({children}) => <strong style={markdownStyles.strong}>{children}</strong>,
                                    em: ({children}) => <em style={markdownStyles.em}>{children}</em>,
                                    code: ({className, children}) => {
                                        const isInline = !className;
                                        if (isInline) {
                                            return <code style={markdownStyles.code}>{children}</code>;
                                        }
                                        return <pre style={markdownStyles.pre}><code className={className}>{children}</code></pre>;
                                    },
                                    blockquote: ({children}) => <blockquote style={markdownStyles.blockquote}>{children}</blockquote>,
                                    a: ({href, children}) => <a href={href} style={markdownStyles.a} target="_blank" rel="noopener noreferrer">{children}</a>,
                                    hr: () => <hr style={markdownStyles.hr} />,
                                }}
                            >
                                {content}
                            </Markdown>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-12">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Your content will appear here as you type...</p>
                            <p className="text-sm mt-2">
                                Try typing some Markdown in the editor!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
