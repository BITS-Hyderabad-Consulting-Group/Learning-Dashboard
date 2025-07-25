import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Mail,
    Shield,
    Database,
    UserCheck,
    Trash2,
    FileText,
    CheckCircle,
    Info,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { BulletPoint } from '@/components/BulletPoint';
import privacy from '@/data/privacy.json';

const iconMap = {
    Mail: <Mail className="h-6 w-6 text-teal-500" />,
    Shield: <Shield className="h-6 w-6 text-teal-500" />,
    Database: <Database className="h-6 w-6 text-teal-500" />,
    UserCheck: <UserCheck className="h-6 w-6 text-teal-500" />,
    Trash2: <Trash2 className="h-6 w-6 text-teal-500" />,
    FileText: <FileText className="h-6 w-6 text-teal-500" />,
    CheckCircle: <CheckCircle className="w-4 h-4 min-w-4 min-h-4" />,
    Info: <Info className="w-4 h-4 min-w-4 min-h-4" />,
};

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12 lg:py-8 max-w-4xl">
                {/* Header */}
                <div className="text-left lg:text-center mb-12">
                    <h1 className="text-3xl lg:text-4xl font-bold text-teal-800 mb-6">
                        Privacy Policy
                    </h1>
                    <Badge
                        variant="outline"
                        className="mb-6 px-4 py-2 border-teal-200 text-teal-700"
                    >
                        Effective Date: {privacy.effectiveDate}
                    </Badge>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {privacy.headerSubtitle}
                    </p>
                </div>

                {/* Intro */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 mb-8 shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 leading-relaxed">{privacy.introText}</p>
                </div>

                <div className="space-y-6">
                    {privacy.sections.map((section, index) => (
                        <SectionCard
                            key={index}
                            icon={iconMap[section.icon as keyof typeof iconMap]}
                            title={section.title}
                        >
                            {section.content?.map((line, i) => (
                                <p key={i} className="text-gray-600 mb-6 leading-relaxed">
                                    {line}
                                </p>
                            ))}
                            {section.bullets && (
                                <div className="space-y-3 mb-6">
                                    {section.bullets.map((point, i) => (
                                        <BulletPoint key={i}>{point}</BulletPoint>
                                    ))}
                                </div>
                            )}
                            {section.note && (
                                <p
                                    className={`text-${section.note.color}-800 text-sm font-medium flex items-center gap-2`}
                                >
                                    {iconMap[section.note.icon as keyof typeof iconMap]}
                                    {section.note.text}
                                </p>
                            )}
                            {section.email && (
                                <div className="space-y-4">
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

export default PrivacyPolicyPage;
