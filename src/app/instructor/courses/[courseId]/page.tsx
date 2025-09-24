'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import data from '../../../instructor/SampleData.json';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, Star } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import CourseUpsertPageSkeleton from './SkeletonLoader';

type Week = {
    id: string;
    courseId: string;
    weekNumber: number;
    title: string;
    description: string;
    duration: number;
};

type CourseFormState = {
    id: string;
    name: string;
    description: string;
    status: string;
    duration: number | string;
    badge_name: string;
    domain: string;
    date_created: string;
    date_updated: string;
    weeks: Week[];
    learningModules?: string[]; // new: captures "learning modules" (maps to objectives array in backend)
};

export default function CourseUpsertPage({ params }: { params: Promise<{ courseId: string }> }) {
    const [courseId, setCourseId] = useState<string>('');

    useEffect(() => {
        params.then((p) => setCourseId(p.courseId));
    }, [params]);
    const isCreateMode = courseId === 'new';
    // --- AUTH / USER CONTEXT ---
    const { profile, loading, session } = useUser();

    const [form, setForm] = useState<CourseFormState>({
        ...data.newCourseTemplate,
        learningModules: [],
    });
    // Multiline text area content for learning objectives (create mode only)
    const [learningObjectivesText, setLearningObjectivesText] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [certName, setCertName] = useState('');
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!courseId) return;

            if (isCreateMode) {
                setForm({ ...data.newCourseTemplate, learningModules: [] });
                setLearningObjectivesText('');
                setIsDataLoaded(true);
                return;
            }
            try {
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
                const res = await fetch(`/api/instructor/courses/${courseId}`, { headers });
                if (!res.ok) {
                    if (res.status === 404) {
                        setErrorMessage('Course not found');
                    } else {
                        setErrorMessage('Failed to load course data');
                    }
                    setIsDataLoaded(true);
                    return;
                }
                const apiCourse = await res.json();
                console.log('API Course Data:', apiCourse); // Debug log
                const mapped: CourseFormState = {
                    id: apiCourse.id,
                    name: apiCourse.name || apiCourse.title, // Handle both name and title
                    description: apiCourse.description || '',
                    status: apiCourse.status || 'draft',
                    duration: apiCourse.duration || apiCourse.totalDuration || 0,
                    badge_name: apiCourse.badge_name || '',
                    domain: apiCourse.domain || 'General',
                    date_created: apiCourse.date_created || new Date().toISOString(),
                    date_updated: apiCourse.date_updated || new Date().toISOString(),
                    weeks: apiCourse.weeks || [],
                    learningModules: apiCourse.objectives || [],
                };
                setForm(mapped);
            } catch (e: unknown) {
                let errorMsg = 'Failed to load course';
                if (
                    typeof e === 'object' &&
                    e &&
                    'message' in e &&
                    typeof (e as { message?: string }).message === 'string'
                ) {
                    errorMsg = (e as { message: string }).message;
                }
                setErrorMessage(errorMsg);
            } finally {
                setIsDataLoaded(true);
            }
        };
        load();
    }, [courseId, isCreateMode, session]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
        setForm((prev) => ({ ...prev, [name]: finalValue }));
    }

    // (Removed tag-based add/remove handlers; now using simple textarea.)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);

        // Client-side validation to avoid backend 400
        if (!form.name || !form.name.trim()) {
            setErrorMessage('Title is required');
            return;
        }
        if (!form.description || !String(form.description).trim()) {
            setErrorMessage('Description is required');
            return;
        }

        setIsSubmitting(true);
        try {
            // Map frontend form fields to backend API shape
            const payload: {
                title: string;
                description: string;
                total_duration: number;
                objectives: string[];
                list_price: number;
                is_active: boolean;
                instructor: string | null;
                domain: string;
            } = {
                title: String(form.name).trim(), // name -> title
                description: String(form.description).trim(),
                // total_duration only if provided (in create mode we removed duration field, send 0)
                total_duration: isCreateMode
                    ? 0
                    : typeof form.duration === 'number'
                    ? form.duration
                    : parseInt(String(form.duration) || '0', 10),
                objectives: isCreateMode
                    ? learningObjectivesText
                          .split(/\n+/)
                          .map((s: string) => s.trim())
                          .filter((s: string) => s.length > 0)
                    : form.learningModules || [], // map new learning modules
                list_price: (form as { list_price?: number }).list_price || 0,
                is_active: form.status === 'active',
                instructor:
                    profile?.id || (session as { user?: { id?: string } })?.user?.id || null,
                domain: form.domain || 'General',
            };

            const url = isCreateMode
                ? '/api/instructor/courses'
                : `/api/instructor/courses/${courseId}`;
            const method = isCreateMode ? 'POST' : 'PUT';

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            // Minimal log for debugging (can be removed if not desired)
            // console.debug('Submitting course payload', { url, method });
            const res = await fetch(url, {
                method,
                headers,
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let parsed: { error?: string; details?: unknown } | null = null;
                let rawText: string | null = null;
                try {
                    parsed = await res.json();
                } catch {
                    try {
                        rawText = await res.text();
                    } catch {
                        rawText = null;
                    }
                }
                const msg = parsed?.error || `Request failed (${res.status})`;
                const details = parsed?.details ? ` - ${JSON.stringify(parsed.details)}` : '';
                const tail = !parsed && rawText ? ` :: ${rawText.slice(0, 180)}` : '';
                setErrorMessage(msg + details + tail);
                setIsSubmitting(false);
                return;
            }
            const data = await res.json().catch(() => ({}));
            // console.debug('Course upsert success');
            const newId = data?.course?.id || courseId;
            setSubmitted(true);

            // Redirect appropriately
            if (isCreateMode && newId) {
                // For new courses, redirect to content builder
                router.push(`/instructor/courses/${newId}/content`);
            } else {
                // For edits, stay on the same page or go to dashboard
                router.push(`/instructor/courses/${courseId}`);
            }
        } catch (err) {
            let errorMsg = 'Failed to save course.';
            if (
                typeof err === 'object' &&
                err &&
                'message' in err &&
                typeof (err as { message?: string }).message === 'string'
            ) {
                errorMsg = (err as { message: string }).message;
            }
            setErrorMessage(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    }

    // --- AUTH LOGIC ---
    const router = useRouter();
    useEffect(() => {
        if (!loading) {
            if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
                router.replace('/learning');
            }
        }
    }, [profile, loading, router]);
    if (loading || !isDataLoaded) {
        return <CourseUpsertPageSkeleton />;
    }
    if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
        return null;
    }
    if (errorMessage && !isCreateMode) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{errorMessage}</p>
                    <Button
                        onClick={() => router.push('/instructor/dashboard')}
                        className="bg-teal-600 hover:bg-teal-700"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white to-teal-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="w-full rounded-2xl p-4 sm:p-8 shadow-xl border border-gray-100">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-3xl text-teal-800 mb-2 text-center font-extrabold">
                            {isCreateMode ? 'Create New Course' : 'Edit Course'}
                        </CardTitle>
                        <p className="text-gray-500 text-center text-base mb-2">
                            {isCreateMode
                                ? 'Fill out the details to start a new course.'
                                : `Editing: ${form.name}`}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-10">
                        <section>
                            <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-teal-500" /> General Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Course Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder={data.sampleCourseNames?.[0]}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="domain"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Domain
                                    </label>
                                    <input
                                        id="domain"
                                        name="domain"
                                        type="text"
                                        value={form.domain}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="e.g. Business, Finance, Tech"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder={data.defaultDescription}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="learningObjectives"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Learning Objectives
                                    </label>
                                    <textarea
                                        id="learningObjectives"
                                        value={learningObjectivesText}
                                        onChange={(e) => setLearningObjectivesText(e.target.value)}
                                        rows={4}
                                        placeholder={
                                            form.learningModules && form.learningModules.length > 0
                                                ? form.learningModules.join('\n')
                                                : `One objective per line\nE.g.\nUnderstand MECE framework\nPerform basic financial analysis`
                                        }
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 whitespace-pre-wrap"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        One per line, saved as course objectives.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-teal-500" /> Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {data.statuses.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {isCreateMode && (
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="learningObjectives"
                                            className="block text-sm font-semibold text-gray-700 mb-1"
                                        >
                                            Learning Objectives
                                        </label>
                                        <textarea
                                            id="learningObjectives"
                                            value={learningObjectivesText}
                                            onChange={(e) =>
                                                setLearningObjectivesText(e.target.value)
                                            }
                                            rows={4}
                                            placeholder={`One objective per line\nE.g.\nUnderstand MECE framework\nPerform basic financial analysis`}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 whitespace-pre-wrap"
                                        />
                                        <p className="text-xs text-gray-400 mt-2">
                                            One per line, saved as course objectives.
                                        </p>
                                    </div>
                                )}
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="badge_name"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Badge Name
                                    </label>
                                    <input
                                        id="badge_name"
                                        name="badge_name"
                                        type="text"
                                        value={form.badge_name}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        </section>

                        {!isCreateMode && (
                            <section>
                                <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-teal-500" /> Curriculum
                                </h2>
                                <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                                    {form.weeks && form.weeks.length > 0 ? (
                                        <>
                                            {form.weeks.map((week, i) => (
                                                <div key={i}>{week.title}</div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="text-gray-500 text-center py-4">
                                            No curriculum content yet. Use the curriculum builder to
                                            add weeks and modules.
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400 pt-2 border-t">
                                        To edit curriculum, use the curriculum builder.
                                    </div>
                                </div>
                            </section>
                        )}

                        {!isCreateMode && (
                            <section>
                                <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                    Generate Certificate
                                </h2>
                                <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                                    <div>
                                        <label htmlFor="cert_name" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Recipient Name
                                        </label>
                                        <input
                                            id="cert_name"
                                            name="cert_name"
                                            type="text"
                                            value={certName}
                                            onChange={(e) => setCertName(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="e.g. Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            disabled={isGeneratingCert || !certName.trim()}
                                            className="bg-teal-600 hover:bg-teal-700"
                                            onClick={async () => {
                                                setIsGeneratingCert(true);
                                                try {
                                                    const res = await fetch('/api/certificates', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ name: certName.trim(), courseId }),
                                                    });
                                                    if (!res.ok) {
                                                        const j: { error?: string } | null = await res
                                                            .json()
                                                            .catch(() => null);
                                                        throw new Error(j?.error || `Failed to generate certificate (${res.status})`);
                                                    }
                                                    const blob = await res.blob();
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `certificate-${courseId}.pdf`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                    URL.revokeObjectURL(url);
                                                } catch (e) {
                                                    setErrorMessage(e instanceof Error ? e.message : 'Failed to generate certificate');
                                                } finally {
                                                    setIsGeneratingCert(false);
                                                }
                                            }}
                                        >
                                            {isGeneratingCert ? 'Generating…' : 'Download Certificate'}
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </CardContent>
                    <div className="mt-4 mb-4 text-center text-teal-700 font-semibold underline hover:text-teal-900 transition-colors">
                        <Link href={`/instructor/courses/${courseId}/content`}>
                            Go to Curriculum Builder
                        </Link>
                    </div>
                    <CardFooter className="flex flex-col items-center">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-teal-700 to-teal-500 text-white hover:from-teal-800 hover:to-teal-600 mb-2 text-lg py-3 rounded-xl shadow-md transition-all disabled:opacity-60"
                        >
                            {isCreateMode
                                ? isSubmitting
                                    ? 'Creating…'
                                    : 'Create Course'
                                : isSubmitting
                                ? 'Saving…'
                                : 'Save Changes'}
                        </Button>
                        {submitted && (
                            <div className="text-green-700 font-semibold text-center mt-2">
                                {isCreateMode ? 'Course created!' : 'Changes saved!'}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="text-red-600 font-medium text-center mt-2">
                                {errorMessage}
                            </div>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
