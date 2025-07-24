import React from 'react';
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
import Link from 'next/link';

const SectionCard = ({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) => (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                {icon}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
    </Card>
);

const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0" />
        <span className="text-gray-700 leading-relaxed">{children}</span>
    </div>
);

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
                        Effective Date: July 22, 2025
                    </Badge>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Learning Dashboard - Developed by BITS Hyderabad Consulting Group
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 mb-8 shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        BITS Hyderabad Consulting Group values your privacy and is committed to
                        protecting your personal information. By using our platform, you agree to
                        these terms which outline how we collect, use, protect, and manage your
                        data.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Information We Collect */}
                    <SectionCard
                        icon={<Database className="h-6 w-6 text-teal-500" />}
                        title="Information We Collect"
                    >
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We only collect minimal personal information through secure Google OAuth
                            authentication:
                        </p>
                        <div className="space-y-3 mb-6">
                            <BulletPoint>Google Email Address</BulletPoint>
                            <BulletPoint>Your Full Name (from your Google account)</BulletPoint>
                            <BulletPoint>Your Profile Picture</BulletPoint>
                        </div>
                        <p className="text-teal-800 text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 min-w-4 min-h-4" />
                            Personal information and sensitive identifiers are never collected or
                            stored.
                        </p>
                    </SectionCard>

                    {/* How We Use Your Information */}
                    <SectionCard
                        icon={<UserCheck className="h-6 w-6 text-teal-500" />}
                        title="How We Use Your Information"
                    >
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We use your information solely to:
                        </p>
                        <div className="space-y-4 mb-6">
                            <BulletPoint>
                                Authenticate and log you into the platform securely via Supabase
                            </BulletPoint>
                            <BulletPoint>
                                Personalize your dashboard experience with your name and profile
                                image
                            </BulletPoint>
                            <BulletPoint>
                                Track your course progress, XP, and quiz submissions
                            </BulletPoint>
                            <BulletPoint>
                                Associate your activity (like submissions and course enrollment)
                                with your account
                            </BulletPoint>
                        </div>
                        <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                            <Info className="w-4 h-4 min-w-4 min-h-4" />
                            We do not send promotional emails, nor do we sell, share, or transfer
                            your data to third parties.
                        </p>
                    </SectionCard>

                    {/* Data Protection */}
                    <SectionCard
                        icon={<Shield className="h-6 w-6 text-teal-500" />}
                        title="Data Protection"
                    >
                        <div className="space-y-4">
                            <BulletPoint>
                                All user data is stored securely using industry-standard practices
                            </BulletPoint>
                            <BulletPoint>
                                Access to personal information is strictly limited to authorized
                                platform administrators
                            </BulletPoint>
                            <BulletPoint>
                                We do not collect any passwords — authentication is fully handled by
                                Google OAuth via Supabase
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* Your Rights */}
                    <SectionCard
                        icon={<FileText className="h-6 w-6 text-teal-500" />}
                        title="Your Rights"
                    >
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            You have full control over your data:
                        </p>
                        <div className="space-y-4">
                            <BulletPoint>
                                You can delete your account and associated data at any time
                            </BulletPoint>
                            <BulletPoint>
                                You can request a copy of the data we store about you via our
                                support team
                            </BulletPoint>
                        </div>
                    </SectionCard>

                    {/* Account Deletion */}
                    <SectionCard
                        icon={<Trash2 className="h-6 w-6 text-teal-500" />}
                        title="Account Deletion"
                    >
                        <p className="text-gray-700 leading-relaxed">
                            To request account deletion and permanent removal of your information
                            from our system, please contact us using the email below.
                        </p>
                    </SectionCard>

                    {/* Contact Information */}
                    <SectionCard
                        icon={<Mail className="h-6 w-6 text-teal-500" />}
                        title="Contact Us"
                    >
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            If you have questions, concerns, or feedback regarding this Privacy
                            Policy or our data handling practices, please reach out to:
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

export default PrivacyPolicyPage;
