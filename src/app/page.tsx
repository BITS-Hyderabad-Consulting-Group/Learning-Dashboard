'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/CourseCard';
import coursesData from '@/data/courses.json';

const HomePage: React.FC = () => {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	return (
		<main className='min-h-screen bg-gray-50 p-4 sm:p-8'>
			<div className='mx-auto max-w-6xl'>
				<h1 className='mb-12 text-center text-4xl font-bold text-zinc-800'>
					Available Courses
				</h1>

				<motion.div
					className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
					variants={containerVariants}
					initial='hidden'
					animate='visible'
				>
					{coursesData.map((course) => (
						<CourseCard key={course.id} course={course} />
					))}
				</motion.div>
			</div>
		</main>
	);
};

export default HomePage;
