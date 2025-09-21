'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

// Type definitions for API responses
interface WeekApiResponse {
    id: string;
    weekNumber: number;
    title: string;
    description?: string;
    duration?: number;
    isPublished?: boolean;
    unlockDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ModuleApiResponse {
    id: string;
    weekId: string;
    moduleNumber: number;
    title: string;
    description?: string;
    contentType?: string;
    contentUrl?: string;
    markdownContent?: string;
    duration?: number;
    points?: number;
    orderIndex?: number;
    isRequired?: boolean;
    estimatedReadTime?: number | null;
    createdAt?: string;
    updatedAt?: string;
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    Plus,
    Edit,
    Trash2,
    Clock,
    FileText,
    Video,
    HelpCircle,
    LinkIcon,
    BookOpen,
    AlertTriangle,
    Save,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/MarkdownEditor';

interface Module {
    id: string;
    weekId: string;
    moduleNumber: number;
    title: string;
    description: string;
    contentType: 'article' | 'video' | 'quiz' | 'hyperlink';
    markdownContent?: string;
    contentUrl?: string;
    duration: number;
    isRequired: boolean;
    points: number;
    orderIndex: number;
    estimatedReadTime?: number | null;
    createdAt: string;
    updatedAt: string;
}

interface Week {
    id: string;
    courseId: string;
    weekNumber: number;
    title: string;
    description: string;
    duration: number;
    isPublished: boolean;
    unlockDate: string;
    createdAt: string;
    updatedAt: string;
    expanded: boolean;
    modules?: Module[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    categoryId: string;
    totalDuration?: number;
    price: number;
    // difficulty removed from schema
    status: 'draft' | 'published' | 'archived';
    enrollmentLimit: number;
    prerequisites?: string;
    learningObjectives?: string;
    thumbnailUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const contentTypeIcons = {
    article: FileText,
    video: Video,
    quiz: HelpCircle,
    hyperlink: LinkIcon,
};
const contentTypes: Module['contentType'][] = ['article', 'video', 'quiz', 'hyperlink'];

export default function CourseContentPage() {
    const { profile, loading } = useUser();
    const router = useRouter();
    const params = useParams();
    const courseId = (params?.courseId as string) || '';
    const [course, setCourse] = useState<Course | null>(null);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);

    const [editingWeek, setEditingWeek] = useState<Week | null>(null);
    const [editingModule, setEditingModule] = useState<{
        week: Week | null;
        module: Module | null;
    }>({
        week: null,
        module: null,
    });
    const [weekToDelete, setWeekToDelete] = useState<Week | null>(null);
    const [moduleToDelete, setModuleToDelete] = useState<{ week: Week; module: Module } | null>(
        null
    );
    const [weekForm, setWeekForm] = useState({
        title: '',
        description: '',
        duration: 60,
        unlockDate: new Date().toISOString().split('T')[0],
    });
    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        contentType: 'article' as Module['contentType'],
        markdownContent: '',
        contentUrl: '',
        duration: 30,
        isRequired: true,
        points: 10,
        estimatedReadTime: 25,
    });
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading) {
            if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
                router.replace('/learning');
            }
        }
    }, [profile, loading, router]);

    // Fetch course content from backend
    useEffect(() => {
        const fetchContent = async () => {
            if (!courseId) return;
            setIsLoadingContent(true);
            setContentError(null);
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
                const res = await fetch(`/api/instructor/courses/${courseId}/content`, { headers });
                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody.error || 'Failed to load course content');
                }
                const data = await res.json();
                // Map API response to local state shape
                setCourse({
                    id: data.course.id,
                    title: data.course.title,
                    description: data.course.description,
                    instructorId: '',
                    categoryId: '',
                    totalDuration: data.course.totalDuration,
                    price: data.course.price || 0,
                    status: data.course.status || 'draft',
                    enrollmentLimit: 0,
                    prerequisites: '',
                    learningObjectives: '',
                    thumbnailUrl: '',
                    isActive: data.course.isActive,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                const weekMap: Week[] = (data.weeks || []).map((w: WeekApiResponse) => ({
                    id: w.id,
                    courseId: data.course.id,
                    weekNumber: w.weekNumber,
                    title: w.title,
                    description: w.description || '',
                    duration: w.duration || 0,
                    isPublished: w.isPublished || false,
                    unlockDate: w.unlockDate || new Date().toISOString(),
                    createdAt: w.createdAt || new Date().toISOString(),
                    updatedAt: w.updatedAt || new Date().toISOString(),
                    expanded: false,
                    modules: [],
                }));
                const modules: Module[] = (data.modules || []).map((m: ModuleApiResponse) => ({
                    id: m.id,
                    weekId: m.weekId,
                    moduleNumber: m.moduleNumber,
                    title: m.title,
                    description: m.description || '',
                    contentType: (m.contentType || 'article') as Module['contentType'],
                    markdownContent: m.contentType === 'article' ? '' : undefined,
                    contentUrl: m.contentUrl || '',
                    duration: m.duration || 0,
                    isRequired: m.isRequired !== false,
                    points: m.points || 0,
                    orderIndex: m.orderIndex || 0,
                    estimatedReadTime: m.estimatedReadTime || null,
                    createdAt: m.createdAt || new Date().toISOString(),
                    updatedAt: m.updatedAt || new Date().toISOString(),
                }));
                // Attach modules to weeks
                const weekWithModules = weekMap.map((w) => ({
                    ...w,
                    modules: modules.filter((m) => m.weekId === w.id),
                }));
                setWeeks(weekWithModules);
            } catch (e: unknown) {
                let errorMsg = 'Failed to load';
                if (
                    typeof e === 'object' &&
                    e &&
                    'message' in e &&
                    typeof (e as { message?: string }).message === 'string'
                ) {
                    errorMsg = (e as { message: string }).message;
                }
                setContentError(errorMsg);
            } finally {
                setIsLoadingContent(false);
            }
        };
        if (!loading && profile && (profile.role === 'admin' || profile.role === 'instructor')) {
            fetchContent();
        }
    }, [courseId, loading, profile]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    const getTotalModules = () => weeks.reduce((t, w) => t + (w.modules?.length || 0), 0);
    const getTotalDuration = () => weeks.reduce((t, w) => t + w.duration, 0);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await new Promise((r) => setTimeout(r, 1500));
            setCourse((c) => c && { ...c, updatedAt: new Date().toISOString() });
            setWeeks((w) =>
                w.map((week) => ({
                    ...week,
                    updatedAt: new Date().toISOString(),
                    modules: week.modules?.map((m) => ({
                        ...m,
                        updatedAt: new Date().toISOString(),
                    })),
                }))
            );
            toast.success('Course saved successfully!');
        } catch {
            toast.error('Failed to save course');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleWeek = (i: number) =>
        setWeeks((w) =>
            w.map((week, idx) => (idx === i ? { ...week, expanded: !week.expanded } : week))
        );

    const handleAddWeek = () => {
        setEditingWeek(null);
        setWeekForm({
            title: '',
            description: '',
            duration: 60,
            unlockDate: new Date().toISOString().split('T')[0],
        });
        setIsWeekDialogOpen(true);
    };
    const handleEditWeek = (week: Week) => {
        setEditingWeek(week);
        setWeekForm({
            title: week.title,
            description: week.description,
            duration: week.duration,
            unlockDate: week.unlockDate.split('T')[0],
        });
        setIsWeekDialogOpen(true);
    };
    const handleSaveWeek = async () => {
        if (!courseId) return;
        if (editingWeek) {
            // Local update only (no dedicated update endpoint yet)
            setWeeks((w) =>
                w.map((week) =>
                    week.id === editingWeek.id
                        ? {
                              ...week,
                              ...weekForm,
                              unlockDate: weekForm.unlockDate + 'T00:00:00Z',
                              updatedAt: new Date().toISOString(),
                          }
                        : week
                )
            );
            toast.success('Week updated (local)');
            setIsWeekDialogOpen(false);
            return;
        }
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
            const payload = {
                type: 'week',
                data: {
                    title: weekForm.title,
                    description: weekForm.description,
                    duration: weekForm.duration,
                    weekNumber: weeks.length + 1,
                },
            };
            const res = await fetch(`/api/instructor/courses/${courseId}/content`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || 'Failed to create week');
            }
            const json = await res.json();
            const newWeek: Week = {
                id: json.week.id,
                courseId,
                weekNumber: weeks.length + 1,
                title: weekForm.title,
                description: weekForm.description,
                duration: weekForm.duration,
                isPublished: false,
                unlockDate: new Date().toISOString(),
                createdAt: json.week.created_at || new Date().toISOString(),
                updatedAt: json.week.updated_at || new Date().toISOString(),
                expanded: false,
                modules: [],
            };
            setWeeks((w) => [...w, newWeek]);
            toast.success('Week created');
            setIsWeekDialogOpen(false);
        } catch (e: unknown) {
            let errorMsg = 'Failed to create week';
            if (
                typeof e === 'object' &&
                e &&
                'message' in e &&
                typeof (e as { message?: string }).message === 'string'
            ) {
                errorMsg = (e as { message: string }).message;
            }
            toast.error(errorMsg);
        }
    };

    const handleAddModule = (week: Week) => {
        setEditingModule({ week, module: null });
        setModuleForm({
            title: '',
            description: '',
            contentType: 'article',
            markdownContent: '',
            contentUrl: '',
            duration: 30,
            isRequired: true,
            points: 10,
            estimatedReadTime: 25,
        });
        setIsModuleDialogOpen(true);
    };
    const handleEditModule = (week: Week, module: Module) => {
        setEditingModule({ week, module });
        setModuleForm({
            title: module.title,
            description: module.description,
            contentType: module.contentType,
            markdownContent: module.markdownContent || '',
            contentUrl: module.contentUrl || '',
            duration: module.duration,
            isRequired: module.isRequired,
            points: module.points,
            estimatedReadTime: module.estimatedReadTime || 0,
        });
        setIsModuleDialogOpen(true);
    };
    const handleSaveModule = async () => {
        if (!courseId || !editingModule.week) {
            toast.error('Missing courseId or week - cannot save module');
            return;
        }
        if (editingModule.module) {
            try {
                console.log('Updating existing module via API');
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

                const payload = {
                    type: 'module',
                    id: editingModule.module.id,
                    data: {
                        title: moduleForm.title,
                        description: moduleForm.description,
                        contentType: moduleForm.contentType,
                        contentUrl: moduleForm.contentUrl,
                        markdownContent: moduleForm.markdownContent,
                        duration: moduleForm.duration,
                        isRequired: moduleForm.isRequired,
                        points: moduleForm.points,
                        orderIndex: editingModule.module.orderIndex,
                    },
                };

                console.log('Update payload:', payload);
                const res = await fetch(`/api/instructor/courses/${courseId}/content`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload),
                });

                console.log('Update response status:', res.status, res.ok);

                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    console.log('Update error:', errBody);
                    throw new Error(errBody.error || 'Failed to update module');
                }

                const responseData = await res.json();
                console.log('Update success response:', responseData);

                // Update local state with the response from the API
                setWeeks((w) =>
                    w.map((week) =>
                        week.id === editingModule.week!.id
                            ? {
                                  ...week,
                                  modules: week.modules?.map((m) =>
                                      m.id === editingModule.module!.id
                                          ? {
                                                ...m,
                                                ...moduleForm,
                                                estimatedReadTime:
                                                    moduleForm.contentType === 'article'
                                                        ? moduleForm.estimatedReadTime
                                                        : null,
                                                updatedAt:
                                                    responseData.module.updated_at ||
                                                    new Date().toISOString(),
                                            }
                                          : m
                                  ),
                              }
                            : week
                    )
                );

                toast.success('Module updated successfully');
                setIsModuleDialogOpen(false);
                return;
            } catch (e: unknown) {
                console.log('Error updating module:', e);
                let errorMsg = 'Failed to update module';
                if (
                    typeof e === 'object' &&
                    e &&
                    'message' in e &&
                    typeof (e as { message?: string }).message === 'string'
                ) {
                    errorMsg = (e as { message: string }).message;
                }
                toast.error(errorMsg);
                return;
            }
        }
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
            const payload = {
                type: 'module',
                data: {
                    weekId: editingModule.week!.id,
                    title: moduleForm.title,
                    description: moduleForm.description,
                    contentType: moduleForm.contentType,
                    contentUrl: moduleForm.contentUrl,
                    markdownContent: moduleForm.markdownContent,
                    duration: moduleForm.duration,
                    isRequired: moduleForm.isRequired,
                    points: moduleForm.points,
                    orderIndex: (editingModule.week!.modules?.length || 0) + 1,
                },
            };
            const res = await fetch(`/api/instructor/courses/${courseId}/content`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                toast.error(
                    'API Error: ' + (errBody.error || `Status ${res.status}: ${res.statusText}`)
                );
                throw new Error(errBody.error || 'Failed to create module');
            }
            const json = await res.json();
            const newModule: Module = {
                id: json.module.id,
                weekId: editingModule.week!.id,
                moduleNumber: (editingModule.week!.modules?.length || 0) + 1,
                title: moduleForm.title,
                description: moduleForm.description,
                contentType: moduleForm.contentType,
                markdownContent:
                    moduleForm.contentType === 'article' ? moduleForm.markdownContent : '',
                contentUrl: moduleForm.contentUrl,
                duration: moduleForm.duration,
                isRequired: moduleForm.isRequired,
                points: moduleForm.points,
                orderIndex: (editingModule.week!.modules?.length || 0) + 1,
                estimatedReadTime:
                    moduleForm.contentType === 'article' ? moduleForm.estimatedReadTime : null,
                createdAt: json.module.created_at || new Date().toISOString(),
                updatedAt: json.module.updated_at || new Date().toISOString(),
            };
            setWeeks((w) =>
                w.map((week) =>
                    week.id === editingModule.week!.id
                        ? { ...week, modules: [...(week.modules || []), newModule] }
                        : week
                )
            );
            toast.success('Module created successfully');
            setIsModuleDialogOpen(false);
        } catch (e: unknown) {
            let errorMsg = 'Failed to create module';
            if (
                typeof e === 'object' &&
                e &&
                'message' in e &&
                typeof (e as { message?: string }).message === 'string'
            ) {
                errorMsg = (e as { message: string }).message;
            }
            toast.error(errorMsg);
        }
    };

    const handleDeleteWeek = () => {
        if (weekToDelete) {
            setWeeks((w) => w.filter((week) => week.id !== weekToDelete.id));
            toast.success(`Deleted ${weekToDelete.title}`);
            setWeekToDelete(null);
        }
    };
    const handleDeleteModule = () => {
        if (moduleToDelete) {
            setWeeks((w) =>
                w.map((week) =>
                    week.id === moduleToDelete.week.id
                        ? {
                              ...week,
                              modules: week.modules?.filter(
                                  (m) => m.id !== moduleToDelete.module.id
                              ),
                          }
                        : week
                )
            );
            toast.success(`Deleted ${moduleToDelete.module.title}`);
            setModuleToDelete(null);
        }
    };

    if (isLoadingContent) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
                Loading course content...
            </div>
        );
    }
    if (contentError) {
        return (
            <div className="min-h-screen flex flex-col gap-4 items-center justify-center text-center px-4">
                <p className="text-red-600 font-medium">{contentError}</p>
                <Button variant="outline" onClick={() => router.refresh()}>
                    Retry
                </Button>
            </div>
        );
    }
    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
                Course not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* --- Course Info --- */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                                    <Badge
                                        variant={
                                            course.status === 'published' ? 'default' : 'secondary'
                                        }
                                    >
                                        {course.status}
                                    </Badge>
                                    {/* difficulty removed */}
                                </div>
                                <p className="text-gray-600 mb-4">{course.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    {[
                                        {
                                            icon: Clock,
                                            text: `${getTotalDuration()} minutes total`,
                                        },
                                        { icon: BookOpen, text: `${getTotalModules()} modules` },
                                        { text: `Price: $${course.price}` },
                                       
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            {item.icon && (
                                                <item.icon className="w-4 h-4 text-gray-500" />
                                            )}
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                                {course.prerequisites && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                                        <span className="font-medium text-blue-900">
                                            Prerequisites:{' '}
                                        </span>
                                        {course.prerequisites}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* --- Weeks & Modules --- */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <CardTitle className="text-teal-600">Course Content</CardTitle>
                        </div>
                        <Button onClick={handleAddWeek} className="bg-teal-600 hover:bg-teal-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Week
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {weeks.map((week, i) => {
                            const totalPoints =
                                week.modules?.reduce((s, m) => s + m.points, 0) || 0;
                            return (
                                <div key={week.id} className="border border-gray-200 rounded-lg">
                                    <Collapsible
                                        open={week.expanded}
                                        onOpenChange={() => toggleWeek(i)}
                                    >
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                                            <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                                                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        Week {week.weekNumber} | {week.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-4 flex-wrap">
                                                        {[
                                                            `${week.duration} min`,
                                                            `${week.modules?.length || 0} modules`,
                                                            `${totalPoints} points`,
                                                            
                                                        ].map((t, idx) => (
                                                            <span key={idx}>{t}</span>
                                                        ))}
                                                        {week.isPublished && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs h-5"
                                                            >
                                                                Published
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2 ml-4">
                                                {[
                                                    {
                                                        icon: Edit,
                                                        onClick: () => handleEditWeek(week),
                                                    },
                                                    {
                                                        icon: Trash2,
                                                        onClick: () => setWeekToDelete(week),
                                                        className: 'text-red-600 hover:bg-red-50',
                                                    },
                                                ].map((b, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className={`p-1 rounded hover:bg-gray-100 ${
                                                            b.className || ''
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            b.onClick();
                                                        }}
                                                    >
                                                        <b.icon className="w-4 h-4" />
                                                    </button>
                                                ))}
                                                {week.expanded ? (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                        <CollapsibleContent>
                                            <div className="px-4 pb-4 border-t">
                                                <div className="flex items-center justify-between py-3">
                                                    <p className="text-sm text-gray-600">
                                                        {week.description}
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddModule(week)}
                                                        className="border-teal-200 text-teal-600 hover:bg-teal-50"
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Add Module
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {week.modules?.map((module) => {
                                                        const Icon =
                                                            contentTypeIcons[module.contentType];
                                                        const badges = [
                                                            {
                                                                condition: true,
                                                                content: module.contentType,
                                                                variant: 'outline',
                                                            },
                                                            {
                                                                condition: module.isRequired,
                                                                content: 'Required',
                                                                variant: 'secondary',
                                                            },
                                                            {
                                                                condition: module.estimatedReadTime,
                                                                content: `${module.estimatedReadTime} min read`,
                                                                variant: 'outline',
                                                            },
                                                            {
                                                                condition:
                                                                    module.contentType ===
                                                                        'article' &&
                                                                    module.markdownContent,
                                                                content: 'Markdown',
                                                                variant: 'outline',
                                                                extra: 'bg-teal-50 text-teal-700',
                                                            },
                                                        ];
                                                        return (
                                                            <div
                                                                key={module.id}
                                                                className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                                                                        <Icon className="w-4 h-4 text-gray-600" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm">
                                                                            {module.title}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {module.duration}{' '}
                                                                                min
                                                                            </span>
                                                                            {badges
                                                                                .filter(
                                                                                    (b) =>
                                                                                        b.condition
                                                                                )
                                                                                .map((b, idx) => (
                                                                                    <Badge
                                                                                        key={idx}
                                                                                        className={`text-xs h-5 text-gray-500 bg-white ${
                                                                                            b.extra ||
                                                                                            ''
                                                                                        }`}
                                                                                    >
                                                                                        {b.content}
                                                                                    </Badge>
                                                                                ))}
                                                                            <span>
                                                                                {module.points} pts
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {[
                                                                        {
                                                                            icon: Edit,
                                                                            onClick: () =>
                                                                                handleEditModule(
                                                                                    week,
                                                                                    module
                                                                                ),
                                                                        },
                                                                        {
                                                                            icon: Trash2,
                                                                            onClick: () =>
                                                                                setModuleToDelete({
                                                                                    week,
                                                                                    module,
                                                                                }),
                                                                            className:
                                                                                'text-red-600 hover:text-red-700 hover:bg-red-50',
                                                                        },
                                                                    ].map((b, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={
                                                                                b.className || ''
                                                                            }
                                                                            onClick={b.onClick}
                                                                        >
                                                                            <b.icon className="w-3 h-3" />
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Save button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-3 rounded-full"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                {/* Week Dialog */}
                <Dialog open={isWeekDialogOpen} onOpenChange={setIsWeekDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingWeek ? 'Edit Week' : 'Add New Week'}</DialogTitle>
                            <DialogDescription>
                                {editingWeek
                                    ? 'Update the week information below.'
                                    : 'Create a new week by filling out the form below.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="p-2">
                                <Label htmlFor="weekTitle">Week Title</Label>
                                <Input
                                    id="weekTitle"
                                    value={weekForm.title}
                                    onChange={(e) =>
                                        setWeekForm({ ...weekForm, title: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsWeekDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveWeek}
                                    className="bg-teal-600 hover:bg-teal-700"
                                >
                                    {editingWeek ? 'Update' : 'Create'} Week
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Module Dialog */}
                <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                    <DialogContent className="sm:max-w-7xl max-h-[95vh] flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle>
                                {editingModule?.module ? 'Edit Module' : 'Add New Module'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingModule?.module
                                    ? 'Update the module information below.'
                                    : 'Create a new module by filling out the form below.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {moduleForm.contentType === 'article' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <div className="space-y-1.5">
                                            <Label>Content Type</Label>
                                            <Select
                                                value={moduleForm.contentType}
                                                onValueChange={(v: Module['contentType']) =>
                                                    setModuleForm({ ...moduleForm, contentType: v })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contentTypes.map((c) => (
                                                        <SelectItem key={c} value={c}>
                                                            {c}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Points (XP)</Label>
                                            <Input
                                                type="number"
                                                value={moduleForm.points}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        points: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Estimated Reading Time (min)</Label>
                                            <Input
                                                type="number"
                                                value={moduleForm.duration}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        duration: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <MarkdownEditor
                                        title={moduleForm.title}
                                        content={moduleForm.markdownContent}
                                        onTitleChange={(title) =>
                                            setModuleForm({ ...moduleForm, title })
                                        }
                                        onContentChange={(content) =>
                                            setModuleForm({
                                                ...moduleForm,
                                                markdownContent: content,
                                            })
                                        }
                                        placeholder="Write your article content here..."
                                    />
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="moduleTitle">Module Title</Label>
                                        <Input
                                            id="moduleTitle"
                                            value={moduleForm.title}
                                            onChange={(e) =>
                                                setModuleForm({
                                                    ...moduleForm,
                                                    title: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="contentUrl">Content URL</Label>
                                        <Input
                                            id="contentUrl"
                                            value={moduleForm.contentUrl}
                                            onChange={(e) =>
                                                setModuleForm({
                                                    ...moduleForm,
                                                    contentUrl: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Content Type</Label>
                                            <Select
                                                value={moduleForm.contentType}
                                                onValueChange={(v: Module['contentType']) =>
                                                    setModuleForm({ ...moduleForm, contentType: v })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contentTypes.map((c) => (
                                                        <SelectItem key={c} value={c}>
                                                            {c}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Points (XP)</Label>
                                            <Input
                                                type="number"
                                                value={moduleForm.points}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        points: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Duration (min)</Label>
                                            <Input
                                                type="number"
                                                value={moduleForm.duration}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        duration: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0">
                            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveModule}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                {editingModule.module ? 'Update' : 'Create'} Module
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Week */}
                <AlertDialog open={!!weekToDelete} onOpenChange={() => setWeekToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Delete Week
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure? This will also delete all modules.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteWeek}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Week
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Delete Module */}
                <AlertDialog open={!!moduleToDelete} onOpenChange={() => setModuleToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Delete Module
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteModule}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Module
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
