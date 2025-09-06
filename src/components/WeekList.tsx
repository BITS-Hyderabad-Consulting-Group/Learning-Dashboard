'use client';

import { useState } from 'react';
import {
    Clock,
    CheckCheck,
    Bookmark,
    BookOpen,
    Video,
    FileCheck2,
    Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';

interface Module {
    id?: string;
    title: string;
    type: string;
    completed: boolean;
    markedForReview: boolean;
    content?: string;
}

interface Week {
    title: string;
    duration: number;
    modules: Module[];
}

interface Props {
    weeks: Week[];
    enrolled?: boolean;
}

function formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
}

export default function WeekList({ weeks, enrolled = true }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [moduleStates, setModuleStates] = useState<{
        [moduleId: string]: { completed: boolean; markedForReview: boolean };
    }>({});

    // Initialize module states from props on first render
    useState(() => {
        const initialStates: {
            [moduleId: string]: { completed: boolean; markedForReview: boolean };
        } = {};
        weeks.forEach((week) => {
            week.modules.forEach((module) => {
                if (module.id) {
                    initialStates[module.id] = {
                        completed: module.completed,
                        markedForReview: module.markedForReview,
                    };
                }
            });
        });
        setModuleStates(initialStates);
    });

    const updateModuleStatus = (moduleId: string, completed: boolean) => {
        if (!moduleId) return;

        setModuleStates((prev) => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId],
                completed,
            },
        }));
    };

    const updateReviewStatus = (moduleId: string, markedForReview: boolean) => {
        if (!moduleId) return;

        setModuleStates((prev) => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId],
                markedForReview,
            },
        }));
    };

    // Helper function to get current module state
    const getModuleState = (
        moduleId: string,
        defaultState: { completed: boolean; markedForReview: boolean }
    ) => {
        return moduleStates[moduleId] || defaultState;
    };

    return (
        <div className="space-y-4 mt-6">
            {weeks.map((week, index) => {
                const isOpen = openIndex === index;

                return (
                    <div key={index} className="relative">
                        {/* Vertical solid line connecting circles - hidden on mobile */}
                        {/* {index < weeks.length - 1 && (
                            <div
                                className={`absolute left-2.5 top-11 w-0.5 bg-[#03706E] z-0 transition-all duration-200 hidden sm:block`}
                                style={{
                                    height: isOpen
                                        ? `${
                                              week.modules.length > 0
                                                  ? 63 + week.modules.length * 64 + 50
                                                  : 150
                                          }px`
                                        : '72px',
                                }}
                            />
                        )} */}

                        {/* Circle - hidden on mobile */}
                        {/* <div className="absolute left-0 top-5 w-6 h-6 rounded-full border-4 border-[#03706E] bg-white z-10 hidden sm:flex items-center justify-center">
                            {isOpen ? (
                                <div className="w-2.5 h-2.5 bg-[#03706E] rounded-full" />
                            ) : null}
                        </div> */}

                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className={`w-full px-6 py-4 flex justify-between items-center rounded-md shadow-sm bg-[#B4DEDD] transition-all duration-200`}
                        >
                            {/* Left: Circle indicator + Week Title */}
                            <div className="flex items-center gap-3">
                                {/* Circle indicator */}
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white border-[#03706E]">
                                    {week.modules.length > 0 &&
                                    week.modules.every((m) => {
                                        const state = getModuleState(m.id || '', {
                                            completed: m.completed,
                                            markedForReview: m.markedForReview,
                                        });
                                        return state.completed;
                                    }) ? (
                                        <CheckCheck className="w-4 h-4 text-green-600" />
                                    ) : null}
                                </div>

                                {/* Week Title */}
                                {/^Week \d+ \| /.test(week.title) ? (
                                    (() => {
                                        const [weekPart, ...rest] = week.title.split(' | ');
                                        return (
                                            <h3 className="font-semibold text-base">
                                                <span className="text-[#03706E]">{weekPart} |</span>
                                                <span className="text-black ml-2">
                                                    {rest.join()}
                                                </span>
                                            </h3>
                                        );
                                    })()
                                ) : (
                                    <h3 className="text-[#03706E] font-semibold text-base">
                                        {week.title}
                                    </h3>
                                )}
                            </div>

                            {/* Duration + Icon */}
                            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{formatDuration(week.duration)}</span>
                                <span className="ml-2 text-lg font-bold text-[#03706E]">
                                    {isOpen ? '−' : '+'}
                                </span>
                            </div>
                        </button>

                        {isOpen && (
                            <div className="px-3 sm:px-6 pb-4 pt-2 bg-[#B4DEDD] rounded-md mt-1">
                                {/* Table Headers */}
                                <div className="flex justify-between text-sm text-[#666] font-semibold py-2 border-b border-[#A6D6D8]">
                                    <div>Content</div>
                                    <div className="grid grid-cols-3 text-center w-[200px] sm:w-[280px]">
                                        <div className="text-center">Type</div>
                                        <div className="text-center">Status</div>
                                        <div className="text-center">Review</div>
                                    </div>
                                </div>

                                {/* Modules */}
                                {week.modules.length === 0 ? (
                                    <p className="text-sm text-gray-600 mt-3">No modules yet.</p>
                                ) : (
                                    week.modules.map((mod, idx) => {
                                        const currentState = getModuleState(mod.id || '', {
                                            completed: mod.completed,
                                            markedForReview: mod.markedForReview,
                                        });

                                        return (
                                            <div key={idx}>
                                                <div className="flex justify-between items-center py-3 sm:py-3 text-sm text-[#065F5F]">
                                                    {/* Title */}
                                                    <p className="font-medium flex-1 pr-2">
                                                        {enrolled && mod.id ? (
                                                            mod.type === 'Hyperlink' ? (
                                                                <a
                                                                    href={mod.content}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="cursor-pointer text-[#065F5F] hover:text-[#03706E] hover:underline transition-colors"
                                                                >
                                                                    {mod.title}
                                                                </a>
                                                            ) : (
                                                                <Link
                                                                    href={`/modules/${mod.id}`}
                                                                    className="cursor-pointer text-[#065F5F] hover:text-[#03706E] hover:underline transition-colors"
                                                                >
                                                                    {mod.title}
                                                                </Link>
                                                            )
                                                        ) : enrolled ? (
                                                            <span className="cursor-pointer text-[#065F5F]">
                                                                {mod.title}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 cursor-not-allowed select-none">
                                                                {mod.title}
                                                            </span>
                                                        )}
                                                    </p>

                                                    {/* Type, Status, Review */}
                                                    <div className="grid grid-cols-3 place-items-center w-[200px] sm:w-[280px]">
                                                        {/* Type with Icon */}
                                                        <div className="flex items-center gap-1 sm:gap-2 capitalize">
                                                            {mod.type === 'Article' && (
                                                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            )}
                                                            {mod.type === 'Video' && (
                                                                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            )}
                                                            {mod.type === 'Evaluative' && (
                                                                <FileCheck2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            )}
                                                            {mod.type === 'Hyperlink' && (
                                                                <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            )}
                                                            <span className="text-xs sm:text-sm">
                                                                {mod.type}
                                                            </span>
                                                        </div>

                                                        {/* Status Toggle Button */}
                                                        <div className="flex justify-center">
                                                            <button
                                                                tabIndex={enrolled ? 0 : -1}
                                                                onClick={
                                                                    enrolled && mod.id
                                                                        ? () =>
                                                                              updateModuleStatus(
                                                                                  mod.id as string,
                                                                                  !currentState.completed
                                                                              )
                                                                        : undefined
                                                                }
                                                                disabled={!mod.id || !enrolled}
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                                                    !enrolled
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : ''
                                                                }`}
                                                                style={{
                                                                    backgroundColor:
                                                                        currentState.completed
                                                                            ? '#03706E'
                                                                            : 'white',
                                                                    borderColor:
                                                                        currentState.completed
                                                                            ? '#03706E'
                                                                            : '#d1d5db',
                                                                }}
                                                                aria-disabled={!enrolled}
                                                            >
                                                                {currentState.completed && (
                                                                    <CheckCheck className="w-3 h-3 text-white" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Review Toggle Button */}
                                                        <div className="flex justify-center">
                                                            <button
                                                                tabIndex={enrolled ? 0 : -1}
                                                                onClick={
                                                                    enrolled && mod.id
                                                                        ? () =>
                                                                              updateReviewStatus(
                                                                                  mod.id as string,
                                                                                  !currentState.markedForReview
                                                                              )
                                                                        : undefined
                                                                }
                                                                disabled={!mod.id || !enrolled}
                                                                className={`transition-colors duration-200 ${
                                                                    !enrolled
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : ''
                                                                }`}
                                                                aria-disabled={!enrolled}
                                                            >
                                                                <Bookmark
                                                                    className={`w-5 h-5 ${
                                                                        currentState.markedForReview
                                                                            ? 'text-[#03706E] fill-[#03706E]'
                                                                            : 'text-[#025959]'
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* White horizontal line separator */}
                                                {idx < week.modules.length - 1 && (
                                                    <div className="border-b border-white"></div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
