import React from 'react';
import Link from 'next/link';
import {
    Mail,
    FileText,
    User,
    ClipboardCheck,
    Copyright,
    AlertTriangle,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/SectionCard';
import { BulletPoint } from '@/components/BulletPoint';
import terms from '@/data/terms.json';

const iconMap = {
    Mail: <Mail className="h-6 w-6 text-teal-500" />,
    FileText: <FileText className="h-6 w-6 text-teal-500" />,
    User: <User className="h-6 w-6 text-teal-500" />,
    ClipboardCheck: <ClipboardCheck className="h-6 w-6 text-teal-500" />,
    Copyright: <Copyright className="h-6 w-6 text-teal-500" />,
    AlertTriangle: <AlertTriangle className="h-6 w-6 text-teal-500" />,
    XCircle: <XCircle className="h-6 w-6 text-teal-500" />,
    RefreshCw: <RefreshCw className="h-6 w-6 text-teal-500" />,
};

const TermsAndConditionsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12 lg:py-8 max-w-4xl">
                {/* Header */}
                <div className="text-left lg:text-center mb-12">
                    <h1 className="text-3xl lg:text-4xl font-bold text-teal-800 mb-6">
                        Terms and Conditions
                    </h1>
                    <Badge
                        variant="outline"
                        className="mb-6 px-4 py-2 border-teal-200 text-teal-700"
                    >
                        Last Updated: {terms.lastUpdated}
                    </Badge>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {terms.headerSubtitle}
                    </p>
                </div>

                {/* Intro */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 mb-8 shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 leading-relaxed">{terms.introText}</p>
                </div>

                <div className="space-y-6">
                    {terms.sections.map((section, index) => (
                        <SectionCard
                            key={index}
                            icon={iconMap[section.icon as keyof typeof iconMap]}
                            title={section.title}
                        >
                            {section.content?.map((line, i) => (
                                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                                    {line}
                                </p>
                            ))}
                            {section.bullets && (
                                <div className="space-y-4">
                                    {section.bullets.map((point, i) => (
                                        <BulletPoint key={i}>{point}</BulletPoint>
                                    ))}
                                </div>
                            )}
                            {section.email && (
                                <div className="space-y-4 mt-6">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <Mail className="h-5 w-5 text-teal-500" />
                                        <Link
                                            href={`mailto:${section.email}`}
                                            className="text-teal-600 hover:underline font-medium break-all"
                                        >
                                            {section.email}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </SectionCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
