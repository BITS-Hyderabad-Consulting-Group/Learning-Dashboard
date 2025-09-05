import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { FileText, Eye } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownEditorProps {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
    placeholder?: string;
}

export function MarkdownEditor({
    title,
    content,
    onTitleChange,
    onContentChange,
    placeholder = 'Write your content here in Markdown...',
}: MarkdownEditorProps) {
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
                            <div className="text-gray-700 leading-relaxed">
                                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
