'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import data from '../../../admin/APIdata.json';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, Star, Image as ImageIcon } from 'lucide-react';

type Week = {
    id: string;
    courseId: string;
    weekNumber: number;
    title: string;
    description: string;
    duration: number;
};

type Module = {
    id: string;
    weekId: string;
    title: string;
    contentType: string;
    duration: number;
    markedForReviewCount: number;
};

type CourseFormState = {
    id: string;
    name: string;
    description: string;
    prereq: string;
    status: string;
    attendees: number;
    duration: number | string;
    badge_name: string;
    domain: string;
    date_created: string;
    date_updated: string;
    difficultyLevel: string;
    banner_url: string;
    weeks: Week[];
    modules: Module[];
};

export default function CourseUpsertPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = React.use(params);
    const isCreateMode = courseId === 'new';

    const [form, setForm] = useState<CourseFormState>(data.newCourseTemplate);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [bannerPreview, setBannerPreview] = useState('');

    useEffect(() => {
        if (isCreateMode) {
            setForm(data.newCourseTemplate);
            setBannerPreview('');
        } else {
            const existingCourse = data.courses.find((c) => c.id === courseId);
            if (existingCourse) {
                const fullCourseData = {
                    ...data.newCourseTemplate,
                    ...existingCourse,
                };
                setForm(fullCourseData);
                setBannerPreview(existingCourse.banner_url || '');
            } else {
                return notFound();
            }
        }
        setIsDataLoaded(true);
    }, [courseId, isCreateMode]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
        setForm((prev) => ({ ...prev, [name]: finalValue }));
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            const reader = new FileReader();
            reader.onloadend = () => setBannerPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Please upload a valid JPEG or PNG image.');
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log('Submitting form:', form);
        setSubmitted(true);
    }

    if (!isDataLoaded) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white to-teal-50 px-4 py-8">
            <Card className="w-full max-w-2xl rounded-2xl p-4 sm:p-8 shadow-xl border border-gray-100">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-3xl text-teal-800 mb-2 text-center font-extrabold">
                            {isCreateMode ? 'Create New Course' : 'Edit Course'}
                        </CardTitle>
                        <p className="text-gray-500 text-center text-base mt-1">
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
                                    <select
                                        id="domain"
                                        name="domain"
                                        value={form.domain}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {data.domains.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
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
                                <div>
                                    <label
                                        htmlFor="duration"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Duration
                                    </label>
                                    <input
                                        id="duration"
                                        name="duration"
                                        type="text"
                                        value={form.duration}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="modules"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Modules
                                    </label>
                                    <input
                                        id="modules"
                                        name="modules"
                                        type="number"
                                        min={0}
                                        value={form.modules.length}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="attendees"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Attendees
                                    </label>
                                    <input
                                        id="attendees"
                                        name="attendees"
                                        type="number"
                                        min={0}
                                        value={form.attendees}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="prereq"
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                    >
                                        Prerequisites
                                    </label>
                                    <input
                                        id="prereq"
                                        name="prereq"
                                        type="text"
                                        value={form.prereq}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
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

                        <section>
                            <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-teal-500" /> Banner Image
                            </h2>
                            <input
                                id="banner_url"
                                name="banner_url"
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleFileChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {bannerPreview && (
                                <img
                                    src={bannerPreview}
                                    alt="Banner Preview"
                                    className="mt-4 rounded-lg max-h-48 w-full object-cover border"
                                />
                            )}
                        </section>

                        {!isCreateMode && form.weeks && form.weeks.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-teal-500" /> Curriculum
                                </h2>
                                <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                                    {form.weeks.map((week, i) => (
                                        <div key={i}>{week.title}</div>
                                    ))}
                                    <div className="text-xs text-gray-400 pt-2 border-t">
                                        To edit curriculum, use the curriculum builder.
                                    </div>
                                </div>
                            </section>
                        )}
                    </CardContent>
                    <div className="mt-4 mb-4 text-center text-teal-700 font-semibold underline hover:text-teal-900 transition-colors">
                        <Link href={`/admin/courses/${courseId}/content`}>
                            Go to Curriculum Builder
                        </Link>
                    </div>
                    <CardFooter className="flex flex-col items-center">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-700 to-teal-500 text-white hover:from-teal-800 hover:to-teal-600 mb-2 text-lg py-3 rounded-xl shadow-md transition-all"
                        >
                            {isCreateMode ? 'Create Course' : 'Save Changes'}
                        </Button>
                        {submitted && (
                            <div className="text-green-700 font-semibold text-center mt-2">
                                {isCreateMode ? 'Course created!' : 'Changes saved!'} (UI only)
                            </div>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
