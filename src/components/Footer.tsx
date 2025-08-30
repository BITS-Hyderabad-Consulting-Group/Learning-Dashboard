'use client';
import React, { useState } from 'react';
import {
    Facebook,
    Instagram,
    Linkedin,
    Phone,
    Globe,
    Mail,
    Code2,
    Crown,
    MapPin,
    PenTool,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

const Footer: React.FC = () => {
    const [isCreditsVisible, setIsCreditsVisible] = useState(false);
    const year = new Date().getFullYear();
    const { user, loading } = useUser();
    const lead = {
        name: 'Aravind Sathesh',
        role: 'Technical & Design Lead',
        icon: Crown,
        url: 'https://github.com/Aravind-Sathesh',
    };

    const teams = [
        {
            name: 'Design Team',
            icon: PenTool,
            members: [
                { name: 'Arjun Rathore' },
                { name: 'Aryan Saini' },
                { name: 'Garima Dwivedi' },
                { name: 'Rithvik Vallivedu' },
            ],
        },
        {
            name: 'Technical Team',
            icon: Code2,
            members: [
                { name: 'Anand Venkataraman' },
                { name: 'Arpit Kudre' },
                { name: 'B Rushil Mohan' },
                { name: 'Sashidhar Naidu' },
                { name: 'Vedant Nichal' },
                { name: 'Vindaksh C M Reddy' },
                { name: 'Yashvi A' },
            ],
        },
    ];

    return (
        <footer className="bg-gradient-to-br from-[#027F7B] to-[#015d5a] text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Logo.png"
                                alt="BHCG Logo"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain bg-white/10 rounded-lg p-1"
                            />
                            <h3 className="text-lg font-bold">BITS Hyderabad Consulting Group</h3>
                        </div>
                        {/* Social Links */}
                        <div className="flex gap-2">
                            <a
                                href="https://www.facebook.com/TheBHCG/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook size={16} />
                            </a>
                            <a
                                href="https://www.instagram.com/bhcg.bitshyd/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={16} />
                            </a>
                            <a
                                href="https://in.linkedin.com/company/bhcg-bitshyd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={16} />
                            </a>
                            <a
                                href="https://bhcg.site"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Globe size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="ml=0 sm:ml-10">
                        <h4 className="text-md font-semibold text-white mb-3">Quick Links</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/learning"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Learning
                                </Link>
                            </li>
                            {!loading && user && (
                                <li>
                                    <Link
                                        href="/profile"
                                        className="text-gray-300 hover:text-white transition-colors text-sm"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-md font-semibold text-white mb-3">Legal</h4>
                        <div className="space-y-2">
                            <Link
                                href="/terms"
                                className="text-gray-300 hover:text-white transition-colors text-sm block"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-gray-300 hover:text-white transition-colors text-sm block"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="-ml-0 lg:-ml-10">
                        <h4 className="text-md font-semibold text-white mb-3">Contact</h4>
                        <div className="space-y-2">
                            <a
                                href="tel:9346315392"
                                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
                            >
                                <Phone size={14} />
                                +91 9346315392
                            </a>
                            <a
                                href="mailto:bhcg@hyderabad.bits-pilani.ac.in"
                                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
                            >
                                <Mail size={14} />
                                bhcg@hyderabad.bits-pilani.ac.in
                            </a>
                            <div className="flex items-start justify-items-start gap-2 text-gray-300">
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://maps.app.goo.gl/xdaopRRCGqA7PmRz8"
                                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
                                >
                                    <MapPin size={14} />
                                    BITS Pilani Hyderabad Campus
                                    <br />
                                    Hyderabad, Telangana 500078
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-white/20 bg-black/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-gray-300 text-xs">
                            © {year} BITS Hyderabad Consulting Group. All rights reserved.
                        </p>

                        <div
                            className="relative"
                            onMouseEnter={() => setIsCreditsVisible(true)}
                            onMouseLeave={() => setIsCreditsVisible(false)}
                        >
                            <button className="text-gray-300 hover:text-white transition-colors text-xs px-3 py-1 rounded hover:bg-white/10">
                                Website Credits
                            </button>

                            {isCreditsVisible && (
                                <div className="absolute bottom-full mb-2 w-72 rounded-xl bg-[#BDE4E2] backdrop-blur-lg p-4 shadow-xl text-gray-800 ring-1 ring-black/10 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Crafted By
                                        </h3>
                                        <div className="w-8 h-0.5 bg-gradient-to-r from-[#027F7B] to-[#015d5a] mx-auto rounded-full"></div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <lead.icon size={16} className="text-yellow-600" />
                                                <h4 className="font-semibold text-xs text-gray-800">
                                                    {lead.role}
                                                </h4>
                                            </div>
                                            <a
                                                href={lead.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-[#027F7B] hover:text-[#015d5a] transition-colors text-sm hover:underline"
                                            >
                                                {lead.name}
                                            </a>
                                        </div>

                                        {teams.map((team) => {
                                            const TeamIcon = team.icon;
                                            return (
                                                <div
                                                    key={team.name}
                                                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TeamIcon
                                                            size={14}
                                                            className="text-[#027F7B]"
                                                        />
                                                        <h4 className="font-semibold text-xs text-gray-800">
                                                            {team.name}
                                                        </h4>
                                                    </div>
                                                    <ul className="space-y-1 pl-4">
                                                        {team.members.map((member) => (
                                                            <li
                                                                key={member.name}
                                                                className="text-xs text-gray-600"
                                                            >
                                                                {member.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Arrow */}
                                    <div className="absolute bottom-0 translate-y-1/2 w-2 h-2 bg-white/95 backdrop-blur-lg rotate-45 ring-1 ring-black/10 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
