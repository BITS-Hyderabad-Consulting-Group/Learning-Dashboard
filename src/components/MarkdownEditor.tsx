import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { FileText, Eye } from 'lucide-react';

interface MarkdownEditorProps {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
    placeholder?: string;
}

// Simple markdown parser for preview
const parseMarkdown = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-medium mb-3 text-gray-800">$1</h3>'
    );
    html = html.replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-medium mb-4 text-gray-800">$1</h2>'
    );
    html = html.replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-medium mb-4 text-gray-800">$1</h1>'
    );

    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong class="font-medium">$1</strong>');

    // Italic
    html = html.replace(/\*(.*)\*/gim, '<em class="italic">$1</em>');

    // Code blocks
    html = html.replace(
        /```([\s\S]*?)```/gim,
        '<pre class="bg-gray-100 p-3 rounded-lg my-3 text-sm overflow-x-auto"><code>$1</code></pre>'
    );

    // Inline code
    html = html.replace(
        /`([^`]*)`/gim,
        '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
    );

    // Links
    html = html.replace(
        /\[([^\]]*)\]\(([^\)]*)\)/gim,
        '<a href="$2" class="text-teal-600 hover:text-teal-700 underline">$1</a>'
    );

    // Process lists before line breaks
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isListItem = /^[-*] (.+)$/.test(line.trim());

        if (isListItem) {
            const content = line.trim().substring(2); // Remove "- " or "* "
            if (!inList) {
                processedLines.push('<ul class="list-disc ml-6 mb-4">');
                inList = true;
            }
            processedLines.push(`<li class="mb-1">${content}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }

    // Close any remaining list
    if (inList) {
        processedLines.push('</ul>');
    }

    html = processedLines.join('\n');

    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p class="mb-4">');
    html = html.replace(/\n/gim, '<br>');

    // Wrap in paragraphs if content exists
    if (html.trim() && !html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>')) {
        html = `<p class="mb-4">${html}</p>`;
    }

    return html;
};

export function MarkdownEditor({
    title,
    content,
    onTitleChange,
    onContentChange,
    placeholder = 'Write your content here in Markdown...',
}: MarkdownEditorProps) {
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        setPreviewHtml(parseMarkdown(content));
    }, [content]);

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
                <CardContent className="flex-1 bg-gray-50 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                        {title && (
                            <h1 className="text-2xl font-medium mb-6 text-gray-800 border-b border-gray-200 pb-3">
                                {title}
                            </h1>
                        )}
                        {content ? (
                            <div
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        ) : (
                            <div className="text-gray-400 text-center py-12">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Your content will appear here as you type...</p>
                                <p className="text-sm mt-2">
                                    Try typing some Markdown in the editor!
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
