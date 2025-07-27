'use client';

import React, { useState, useEffect } from 'react';
import APIdata from './APIdata.json';
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
import { Textarea } from '@/components/ui/textarea';
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
    Award,
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
    contentType: 'article' | 'video' | 'quiz' | 'assignment' | 'resource';
    markdownContent?: string; // New field for markdown content
    contentUrl?: string; // Keep for non-article types
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
    duration: number;
    price: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    status: 'draft' | 'published' | 'archived';
    enrollmentLimit: number;
    prerequisites?: string;
    learningObjectives?: string;
    thumbnailUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const apiData = APIdata as {
    course: Course;
    weeks: Week[];
    modules: Module[];
};

const contentTypeIcons = {
    article: FileText,
    video: Video,
    quiz: HelpCircle,
    assignment: Edit,
    resource: Award,
};

const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
};

export default function App() {
    const [course, setCourse] = useState<Course | null>(null);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [editingWeek, setEditingWeek] = useState<Week | null>(null);
    const [editingModule, setEditingModule] = useState<{ week: Week; module: Module | null }>({
        week: weeks[0],
        module: null,
    });

    // Delete confirmation states
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

    // Load data from embedded object
    useEffect(() => {
        const loadData = () => {
            setCourse(apiData.course as Course);

            // Combine weeks with their modules
            const weeksWithModules = apiData.weeks.map((week) => ({
                ...week,
                modules: apiData.modules.filter((module) => module.weekId === week.id),
            })) as Week[];

            setWeeks(weeksWithModules);
        };

        loadData();
    }, []);

    const handleSaveChanges = async () => {
        setIsSaving(true);

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Update course timestamp
            if (course) {
                setCourse({
                    ...course,
                    updatedAt: new Date().toISOString(),
                });
            }

            // Update weeks timestamps
            setWeeks((prevWeeks) =>
                prevWeeks.map((week) => ({
                    ...week,
                    updatedAt: new Date().toISOString(),
                    modules: week.modules?.map((module) => ({
                        ...module,
                        updatedAt: new Date().toISOString(),
                    })),
                }))
            );

            // Show success toast
            toast.success('Course saved successfully!', {
                description: 'All changes have been saved to the database.',
                duration: 3000,
            });
        } catch {
            // Show error toast
            toast.error('Failed to save course', {
                description: 'Please try again or contact support if the problem persists.',
                duration: 4000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleWeek = (weekIndex: number) => {
        setWeeks(
            weeks.map((week, index) =>
                index === weekIndex ? { ...week, expanded: !week.expanded } : week
            )
        );
    };

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

    const handleSaveWeek = () => {
        if (editingWeek) {
            setWeeks(
                weeks.map((week) =>
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
            toast.success('Week updated successfully!');
        } else {
            const newWeek: Week = {
                id: `week_${Date.now()}`,
                courseId: course?.id || '',
                weekNumber: weeks.length + 1,
                ...weekForm,
                unlockDate: weekForm.unlockDate + 'T00:00:00Z',
                isPublished: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                expanded: false,
                modules: [],
            };
            setWeeks([...weeks, newWeek]);
            toast.success('New week added successfully!');
        }
        setIsWeekDialogOpen(false);
    };

    const handleDeleteWeekConfirm = (week: Week) => {
        setWeekToDelete(week);
    };

    const handleDeleteWeek = () => {
        if (weekToDelete) {
            setWeeks(weeks.filter((week) => week.id !== weekToDelete.id));
            toast.success('Week deleted successfully!', {
                description: `"${weekToDelete.title}" and all its modules have been removed.`,
            });
            setWeekToDelete(null);
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

    const handleSaveModule = () => {
        if (editingModule.module) {
            setWeeks(
                weeks.map((week) =>
                    week.id === editingModule.week.id
                        ? {
                              ...week,
                              modules: week.modules?.map((module) =>
                                  module.id === editingModule.module!.id
                                      ? {
                                            ...module,
                                            ...moduleForm,
                                            estimatedReadTime:
                                                moduleForm.contentType === 'article'
                                                    ? moduleForm.estimatedReadTime
                                                    : null,
                                            updatedAt: new Date().toISOString(),
                                        }
                                      : module
                              ),
                          }
                        : week
                )
            );
            toast.success('Module updated successfully!');
        } else {
            const newModule: Module = {
                id: `module_${Date.now()}`,
                weekId: editingModule.week.id,
                moduleNumber: (editingModule.week.modules?.length || 0) + 1,
                ...moduleForm,
                orderIndex: (editingModule.week.modules?.length || 0) + 1,
                estimatedReadTime:
                    moduleForm.contentType === 'article' ? moduleForm.estimatedReadTime : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setWeeks(
                weeks.map((week) =>
                    week.id === editingModule.week.id
                        ? { ...week, modules: [...(week.modules || []), newModule] }
                        : week
                )
            );
            toast.success('New module added successfully!');
        }
        setIsModuleDialogOpen(false);
    };

    const handleDeleteModuleConfirm = (week: Week, module: Module) => {
        setModuleToDelete({ week, module });
    };

    const handleDeleteModule = () => {
        if (moduleToDelete) {
            setWeeks(
                weeks.map((week) =>
                    week.id === moduleToDelete.week.id
                        ? {
                              ...week,
                              modules:
                                  week.modules?.filter(
                                      (module) => module.id !== moduleToDelete.module.id
                                  ) || [],
                          }
                        : week
                )
            );
            toast.success('Module deleted successfully!', {
                description: `"${moduleToDelete.module.title}" has been removed.`,
            });
            setModuleToDelete(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getTotalModules = () => {
        return weeks.reduce((total, week) => total + (week.modules?.length || 0), 0);
    };

    const getTotalDuration = () => {
        return weeks.reduce((total, week) => total + week.duration, 0);
    };

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
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
                                    <Badge className={difficultyColors[course.difficultyLevel]}>
                                        {course.difficultyLevel}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 mb-4">{course.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span>{getTotalDuration()} minutes total</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-gray-500" />
                                        <span>{getTotalModules()} modules</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Price:</span>
                                        <span>${course.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Limit:</span>
                                        <span>{course.enrollmentLimit} students</span>
                                    </div>
                                </div>
                                {course.prerequisites && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm">
                                            <span className="font-medium text-blue-900">
                                                Prerequisites:{' '}
                                            </span>
                                            <span className="text-blue-800">
                                                {course.prerequisites}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

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
                        {weeks.map((week, weekIndex) => {
                            const totalPoints =
                                week.modules?.reduce((sum, module) => sum + module.points, 0) || 0;

                            return (
                                <div key={week.id} className="border border-gray-200 rounded-lg">
                                    <Collapsible
                                        open={week.expanded}
                                        onOpenChange={() => toggleWeek(weekIndex)}
                                    >
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                            <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                                                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        Week {week.weekNumber} | {week.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {week.duration} min
                                                        </span>
                                                        <span>
                                                            {week.modules?.length || 0} modules
                                                        </span>
                                                        <span>{totalPoints} points</span>
                                                        <span>
                                                            Unlocks: {formatDate(week.unlockDate)}
                                                        </span>
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
                                                <button
                                                    type="button"
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditWeek(week);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded text-red-600 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteWeekConfirm(week);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="ml-2">
                                                    {week.expanded ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <CollapsibleContent>
                                            <div className="px-4 pb-4 border-t border-gray-100">
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
                                                        const IconComponent =
                                                            contentTypeIcons[module.contentType];
                                                        return (
                                                            <div
                                                                key={module.id}
                                                                className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                                                                        <IconComponent className="w-4 h-4 text-gray-600" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-sm">
                                                                            {module.title}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 flex items-center gap-3 flex-wrap">
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {module.duration}{' '}
                                                                                min
                                                                            </span>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-xs h-5"
                                                                            >
                                                                                {module.contentType}
                                                                            </Badge>
                                                                            {module.isRequired && (
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="text-xs h-5"
                                                                                >
                                                                                    Required
                                                                                </Badge>
                                                                            )}
                                                                            <span>
                                                                                {module.points} pts
                                                                            </span>
                                                                            {module.estimatedReadTime && (
                                                                                <span>
                                                                                    {
                                                                                        module.estimatedReadTime
                                                                                    }{' '}
                                                                                    min read
                                                                                </span>
                                                                            )}
                                                                            {module.contentType ===
                                                                                'article' &&
                                                                                module.markdownContent && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="text-xs h-5 bg-teal-50 text-teal-700"
                                                                                    >
                                                                                        Markdown
                                                                                    </Badge>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleEditModule(
                                                                                week,
                                                                                module
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() =>
                                                                            handleDeleteModuleConfirm(
                                                                                week,
                                                                                module
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
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

                <div className="flex justify-center">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-12 py-3 rounded-full"
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
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="weekTitle">Week Title</Label>
                                <Input
                                    id="weekTitle"
                                    value={weekForm.title}
                                    onChange={(e) =>
                                        setWeekForm({ ...weekForm, title: e.target.value })
                                    }
                                    placeholder="Enter week title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weekDescription">Description</Label>
                                <Textarea
                                    id="weekDescription"
                                    value={weekForm.description}
                                    onChange={(e) =>
                                        setWeekForm({ ...weekForm, description: e.target.value })
                                    }
                                    placeholder="Enter week description"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weekDuration">Duration (minutes)</Label>
                                    <Input
                                        id="weekDuration"
                                        type="number"
                                        value={weekForm.duration}
                                        onChange={(e) =>
                                            setWeekForm({
                                                ...weekForm,
                                                duration: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        placeholder="60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unlockDate">Unlock Date</Label>
                                    <Input
                                        id="unlockDate"
                                        type="date"
                                        value={weekForm.unlockDate}
                                        onChange={(e) =>
                                            setWeekForm({ ...weekForm, unlockDate: e.target.value })
                                        }
                                    />
                                </div>
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

                <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                    <DialogContent className="sm:max-w-7xl max-h-[95vh] flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle>
                                {editingModule.module ? 'Edit Module' : 'Add New Module'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingModule.module
                                    ? 'Update the module information below.'
                                    : 'Create a new module by filling out the form below.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto">
                            {moduleForm.contentType === 'article' ? (
                                <div className="space-y-6 p-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="moduleDescription">Description</Label>
                                            <Textarea
                                                id="moduleDescription"
                                                value={moduleForm.description}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        description: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter module description"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contentType">Content Type</Label>
                                            <Select
                                                value={moduleForm.contentType}
                                                onValueChange={(value: Module['contentType']) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        contentType: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger id="contentType">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="article">Article</SelectItem>
                                                    <SelectItem value="video">Video</SelectItem>
                                                    <SelectItem value="quiz">Quiz</SelectItem>
                                                    <SelectItem value="assignment">
                                                        Assignment
                                                    </SelectItem>
                                                    <SelectItem value="resource">
                                                        Resource
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="moduleDuration">
                                                    Duration (min)
                                                </Label>
                                                <Input
                                                    id="moduleDuration"
                                                    type="number"
                                                    value={moduleForm.duration}
                                                    onChange={(e) =>
                                                        setModuleForm({
                                                            ...moduleForm,
                                                            duration: parseInt(e.target.value) || 0,
                                                        })
                                                    }
                                                    placeholder="30"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="points">Points</Label>
                                                <Input
                                                    id="points"
                                                    type="number"
                                                    value={moduleForm.points}
                                                    onChange={(e) =>
                                                        setModuleForm({
                                                            ...moduleForm,
                                                            points: parseInt(e.target.value) || 0,
                                                        })
                                                    }
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="estimatedReadTime">Read Time</Label>
                                                <Input
                                                    id="estimatedReadTime"
                                                    type="number"
                                                    value={moduleForm.estimatedReadTime}
                                                    onChange={(e) =>
                                                        setModuleForm({
                                                            ...moduleForm,
                                                            estimatedReadTime:
                                                                parseInt(e.target.value) || 0,
                                                        })
                                                    }
                                                    placeholder="25"
                                                />
                                            </div>
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
                                        placeholder="Write your article content here using Markdown formatting..."
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 p-1">
                                    <div className="space-y-2">
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
                                            placeholder="Enter module title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="moduleDescription">Description</Label>
                                        <Textarea
                                            id="moduleDescription"
                                            value={moduleForm.description}
                                            onChange={(e) =>
                                                setModuleForm({
                                                    ...moduleForm,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Enter module description"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
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
                                            placeholder="https://example.com/content"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contentType">Content Type</Label>
                                            <Select
                                                value={moduleForm.contentType}
                                                onValueChange={(value: Module['contentType']) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        contentType: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger id="contentType">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="article">Article</SelectItem>
                                                    <SelectItem value="video">Video</SelectItem>
                                                    <SelectItem value="quiz">Quiz</SelectItem>
                                                    <SelectItem value="assignment">
                                                        Assignment
                                                    </SelectItem>
                                                    <SelectItem value="resource">
                                                        Resource
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="moduleDuration">Duration (min)</Label>
                                            <Input
                                                id="moduleDuration"
                                                type="number"
                                                value={moduleForm.duration}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        duration: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                                placeholder="30"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="points">Points</Label>
                                            <Input
                                                id="points"
                                                type="number"
                                                value={moduleForm.points}
                                                onChange={(e) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        points: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                                placeholder="10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="isRequired">Required</Label>
                                            <Select
                                                value={moduleForm.isRequired.toString()}
                                                onValueChange={(value) =>
                                                    setModuleForm({
                                                        ...moduleForm,
                                                        isRequired: value === 'true',
                                                    })
                                                }
                                            >
                                                <SelectTrigger id="isRequired">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Required</SelectItem>
                                                    <SelectItem value="false">Optional</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
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

                <AlertDialog open={!!weekToDelete} onOpenChange={() => setWeekToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Delete Week
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this week? This action will also
                                delete all modules within this week and cannot be undone.
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

                <AlertDialog open={!!moduleToDelete} onOpenChange={() => setModuleToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Delete Module
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this module? This action cannot be
                                undone.
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
