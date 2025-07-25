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
                        Last Updated: July 25, 2025
                    </Badge>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Learning Dashboard - Developed by BITS Hyderabad Consulting Group
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 mb-8 shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        These Terms and Conditions ("Terms") govern your access to and use of the
                        Learning Dashboard platform and its associated services (collectively, the
                        "Service"), provided by BITS Hyderabad Consulting Group ("we," "us," or
                        "our"). By accessing or using the Service, you agree to be bound by these
                        Terms. If you do not agree to these Terms, you are prohibited from using the
                        Service.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* User Accounts */}
                    <SectionCard
                        icon={<User className="h-6 w-6 text-teal-500" />}
                        title="User Accounts"
                    >
                        <div className="space-y-4">
                            <BulletPoint>
                                Account registration requires authentication via Google OAuth. You
                                agree to provide and maintain accurate account information.
                            </BulletPoint>
                            <BulletPoint>
                                You are solely responsible for maintaining the confidentiality of
                                your account and for all activities that occur under it.
                            </BulletPoint>
                            <BulletPoint>
                                You must notify us immediately upon becoming aware of any breach of
                                security or unauthorized use of your account.
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* License and Acceptable Use */}
                    <SectionCard
                        icon={<ClipboardCheck className="h-6 w-6 text-teal-500" />}
                        title="License and Acceptable Use"
                    >
                        <div className="space-y-4">
                            <BulletPoint>
                                We grant you a limited, non-exclusive, non-transferable license to
                                access and use the Service for personal, non-commercial educational
                                purposes, in compliance with these Terms.
                            </BulletPoint>
                            <BulletPoint>
                                You agree not to use the Service for any unlawful purpose or to
                                engage in any activity that disrupts, diminishes the quality of, or
                                interferes with the performance of the Service.
                            </BulletPoint>
                            <BulletPoint>
                                The use of any bots, scripts, or other automated tools to access or
                                interact with the platform is strictly prohibited.
                            </BulletPoint>
                            <BulletPoint>
                                Engaging in any form of academic dishonesty is a material breach of
                                these Terms and will result in immediate termination of your access.
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* Intellectual Property Rights */}
                    <SectionCard
                        icon={<Copyright className="h-6 w-6 text-teal-500" />}
                        title="Intellectual Property Rights"
                    >
                        <div className="space-y-4">
                            <BulletPoint>
                                The Service and its entire contents, features, and functionality are
                                owned by BITS Hyderabad Consulting Group and are protected by
                                copyright and other intellectual property laws.
                            </BulletPoint>
                            <BulletPoint>
                                No right, title, or interest in or to the Service or any content on
                                the Service is transferred to you, and all rights not expressly
                                granted are reserved by us.
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* Disclaimer of Warranties and Limitation of Liability */}
                    <SectionCard
                        icon={<AlertTriangle className="h-6 w-6 text-teal-500" />}
                        title="Disclaimer & Limitation of Liability"
                    >
                        <div className="space-y-4">
                            <BulletPoint>
                                The Service is provided on an "AS IS" and "AS AVAILABLE" basis,
                                without any warranties of any kind, either express or implied,
                                including but not limited to the accuracy, reliability, or
                                availability of the Service.
                            </BulletPoint>
                            <BulletPoint>
                                To the fullest extent permitted by law, in no event will BITS
                                Hyderabad Consulting Group be liable for damages of any kind arising
                                out of or in connection with your use, or inability to use, the
                                Service.
                            </BulletPoint>
                            <BulletPoint>
                                We strive to maintain the accuracy and availability of the Service,
                                but cannot guarantee 100% accuracy or uptime. You acknowledge that
                                interruptions, errors, or inaccuracies may occur and agree that we
                                are not liable for any resulting consequences.
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* Termination */}
                    <SectionCard
                        icon={<XCircle className="h-6 w-6 text-teal-500" />}
                        title="Termination"
                    >
                        <div className="space-y-4">
                            <BulletPoint>
                                We may terminate or suspend your access to the Service, without
                                prior notice or liability, for any reason, including any breach of
                                these Terms.
                            </BulletPoint>
                            <BulletPoint>
                                Upon termination, your right to use the Service will immediately
                                cease. All provisions of the Terms which by their nature should
                                survive termination shall survive.
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* Amendments to Terms */}
                    <SectionCard
                        icon={<RefreshCw className="h-6 w-6 text-teal-500" />}
                        title="Amendments to Terms"
                    >
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these
                            Terms at any time. We will provide notice by updating the "Last Updated"
                            date. Your continued use of the Service after any such changes
                            constitutes your acceptance of the new Terms.
                        </p>
                    </SectionCard>

                    {/* Contact Information */}
                    <SectionCard
                        icon={<Mail className="h-6 w-6 text-teal-500" />}
                        title="Contact Information"
                    >
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            For any inquiries regarding these Terms and Conditions, please direct
                            your correspondence to:
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <Mail className="h-5 w-5 text-teal-500" />
                                <Link
                                    href="mailto:bhcg@hyderabad.bits-pilani.ac.in"
                                    className="text-teal-600 hover:underline font-medium break-all"
                                >
                                    bhcg@hyderabad.bits-pilani.ac.in
                                </Link>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
