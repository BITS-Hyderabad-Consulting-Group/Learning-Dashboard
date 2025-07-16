'use client';

import { useState } from 'react';
import data from './APIdata.json';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, CheckCircle, Star, Image as ImageIcon } from 'lucide-react';

export default function EditCoursePage() {
    const course = data.course;
    const [form, setForm] = useState({ ...course, domain: course.domain || data.domains[0] });
    const [submitted, setSubmitted] = useState(false);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>(course.banner_url || '');

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value, type, files } = e.target as HTMLInputElement;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                setBannerFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setBannerPreview(ev.target?.result as string);
                    setForm((prev) => ({ ...prev, banner_url: ev.target?.result as string }));
                };
                reader.readAsDataURL(file);
            } else {
                setBannerFile(null);
                setBannerPreview('');
                setForm((prev) => ({ ...prev, banner_url: '' }));
                alert('Please upload a JPEG or PNG image.');
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitted(true);
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-white to-teal-50 px-2 sm:px-0 py-8">
            <Card className="w-full max-w-2xl rounded-2xl px-2 py-4 sm:px-10 sm:py-12 shadow-xl border border-gray-100">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-3xl text-teal-800 mb-2 text-center font-extrabold tracking-tight drop-shadow-sm">
                            Edit Course
                        </CardTitle>
                        <p className="text-gray-500 text-center text-base mt-1">
                            Update course details and curriculum below.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-12">
                        {/* General Info */}
                        <section>
                            <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-teal-500" /> General Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="name"
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
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="domain"
                                    >
                                        Domain
                                    </label>
                                    <select
                                        id="domain"
                                        name="domain"
                                        value={form.domain}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                    >
                                        {data.domains.map((domain: string) => (
                                            <option key={domain} value={domain}>
                                                {domain}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="description"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                                    />
                                    <span className="text-xs text-gray-400">
                                        This will be shown to students on the course page.
                                    </span>
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"
                                        htmlFor="banner_url"
                                    >
                                        <ImageIcon className="w-5 h-5 text-teal-500" /> Banner (JPEG
                                        or PNG)
                                    </label>
                                    <input
                                        id="banner_url"
                                        name="banner_url"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white"
                                    />
                                    {bannerPreview && (
                                        <img
                                            src={bannerPreview}
                                            alt="Banner Preview"
                                            className="mt-2 rounded-lg max-h-40 border border-gray-200 shadow"
                                        />
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-gray-200 my-8" />

                        {/* Details */}
                        <section>
                            <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-teal-500" /> Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="status"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                    >
                                        {data.statuses.map((status: string) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="duration"
                                    >
                                        Duration
                                    </label>
                                    <input
                                        id="duration"
                                        name="duration"
                                        type="text"
                                        value={form.duration}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="modules"
                                    >
                                        Modules
                                    </label>
                                    <input
                                        id="modules"
                                        name="modules"
                                        type="number"
                                        value={form.modules}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        className="block text-sm font-semibold text-gray-700 mb-1"
                                        htmlFor="badge_name"
                                    >
                                        Badge Name
                                    </label>
                                    <input
                                        id="badge_name"
                                        name="badge_name"
                                        type="text"
                                        value={form.badge_name}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-gray-200 my-8" />

                        {/* Curriculum */}
                        <section>
                            <h2 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-teal-500" /> Curriculum
                            </h2>
                            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                                {form.weeks && form.weeks.length > 0 ? (
                                    form.weeks.map((week: any, i: number) => (
                                        <div key={i} className="mb-2">
                                            <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-400" />{' '}
                                                {week.title}{' '}
                                                <span className="text-xs text-gray-400">
                                                    ({week.duration} min)
                                                </span>
                                            </div>
                                            <ul className="ml-6 list-disc text-sm text-gray-600">
                                                {week.modules.map((mod: any, j: number) => (
                                                    <li
                                                        key={j}
                                                        className="mb-1 flex items-center gap-2"
                                                    >
                                                        <span className="font-medium">
                                                            {mod.title}
                                                        </span>{' '}
                                                        <span className="text-xs text-gray-400">
                                                            [{mod.type}]
                                                        </span>
                                                        {mod.completed && (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        )}
                                                        {mod.markedForReview && (
                                                            <Star className="w-4 h-4 text-yellow-400" />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 italic">
                                        No weeks/modules defined.
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                    To edit curriculum, use the curriculum builder (coming soon).
                                </div>
                            </div>
                        </section>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch mt-4 sm:mt-6 sticky bottom-0 bg-white/80 rounded-b-2xl z-10 shadow-none">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-700 to-teal-500 text-white hover:from-teal-800 hover:to-teal-600 mb-2 text-lg py-3 rounded-xl shadow-md transition-all"
                        >
                            Save Changes
                        </Button>
                        {submitted && (
                            <div className="text-green-700 font-semibold text-center mt-2">
                                Course updated! (UI only)
                            </div>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
