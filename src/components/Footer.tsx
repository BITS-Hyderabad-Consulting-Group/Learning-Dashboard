'use client';
import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Phone, Mail, Code2, Paintbrush, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
    const [isCreditsVisible, setIsCreditsVisible] = useState(false);

    const lead = {
        name: 'Aravind Sathesh',
        role: 'Design & Technical Lead',
        icon: Crown,
        url: 'https://bhcg.netlify.app/home',
    };

    const teams = [
        {
            name: 'Design Team',
            icon: Paintbrush,
            members: [
                { name: 'Arjun Rathore' },
                { name: 'Arushi Chandurkar' },
                { name: 'Aryan Saini' },
                { name: 'Bhavya Gupta' },
                { name: 'Garima Dwivedi' },
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
        <footer className="bg-[#027F7B] text-white text-sm">
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row flex-wrap md:flex-nowrap justify-between items-start gap-y-8 py-8 border-b border-white/30 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 items-start w-full md:w-auto">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/Logo.png"
                            alt="BHCG Logo"
                            width={225}
                            height={225}
                            className="w-20 h-auto"
                        />
                        <p className="leading-snug text-sm">
                            BITS Pilani
                            <br />
                            Hyderabad Campus
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <a
                            href="https://www.facebook.com/TheBHCG/"
                            className="hover:text-gray-300"
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a
                            href="https://www.instagram.com/bhcg.bitshyd/"
                            className="hover:text-gray-300"
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                        <a
                            href="https://in.linkedin.com/company/bhcg-bitshyd"
                            className="hover:text-gray-300"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-2 mt-8 md:mt-0 md:ml-12 w-full md:w-auto">
                    <h4 className="font-bold mb-1 text-lg">Quick Links</h4>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/" className="hover:text-gray-300">
                                Home
                            </Link>
                        </li>
                        
                        <li>
                            <a href="/learning" className="hover:text-gray-300">
                                Learning
                            </a>
                        </li>
                        <li>
                            <a href="/profile" className="hover:text-gray-300">
                                Profile
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contact Us */}
                <div className="flex flex-col gap-2 mt-8 md:mt-0 md:-ml-4 w-full md:w-auto">
                    <h4 className="font-bold mb-1 text-lg">Contact Us</h4>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="tel:9346315392"
                                className="flex items-center gap-2 hover:text-gray-300 transition"
                            >
                                <Phone size={16} />
                                9346315392
                            </a>
                        </li>
                        <li>
                            <a
                                href="mailto:bhcg@hyderabad.bits-pilani.ac.in"
                                className="flex items-center gap-2 hover:text-gray-300 transition"
                            >
                                <Mail size={16} />
                                bhcg@hyderabad.bits-pilani.ac.in
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-300">
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-300">
                                Privacy Policy
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer bottom bar */}
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 text-xs px-4 sm:px-6 lg:px-8 gap-y-2">
                <p className="text-center md:text-left">
                    © {new Date().getFullYear()} BITS Hyderabad Consulting Group. All rights
                    reserved.
                </p>
                <div
                    className="relative"
                    onMouseEnter={() => setIsCreditsVisible(true)}
                    onMouseLeave={() => setIsCreditsVisible(false)}
                >
                    <span className="cursor-pointer hover:text-white transition-colors duration-200 hover:underline ">
                        Website Credits
                    </span>

                    {isCreditsVisible && (
                        <div
                            className="absolute bottom-full mb-2 w-80 rounded-xl bg-white p-5 shadow-2xl text-gray-800 ring-1 ring-black ring-opacity-5
               left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0
               transition-all duration-300 ease-in-out"
                        >
                            <div className="text-center mb-5">
                                <h3 className="text-xl font-bold text-gray-900">Crafted By</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <lead.icon size={20} className="text-yellow-500" />
                                        <h4 className="font-bold text-md text-[#387b7d]">
                                            {lead.role}
                                        </h4>
                                    </div>
                                    <a
                                        href={lead.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-gray-700 hover:underline"
                                    >
                                        {lead.name}
                                    </a>
                                </div>

                                {teams.map((team) => {
                                    const TeamIcon = team.icon;
                                    return (
                                        <div key={team.name}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <TeamIcon size={20} className="text-[#387b7d]" />
                                                <h4 className="font-bold text-md text-[#387b7d]">
                                                    {team.name}
                                                </h4>
                                            </div>
                                            <ul className="space-y-2 pl-8">
                                                {team.members.map((member) => (
                                                    <li
                                                        key={member.name}
                                                        className="flex items-center justify-between"
                                                    >
                                                        {member.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* The Arrow */}
                            <div className="absolute bottom-0 translate-y-1/2 w-3 h-3 bg-white rotate-45 ring-1 ring-black ring-opacity-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-8"></div>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
