'use client';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function SwipeIndicator() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [cycles, setCycles] = useState(0);
    const [start, setStart] = useState(false);

    useEffect(() => {
        if (inView) setStart(true);
    }, [inView]);

    return (
        <div ref={ref} className="relative h-0 pointer-events-none z-20">
            <AnimatePresence>
                {start && cycles < 3 && (
                    <motion.div
                        key="swipe-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="absolute left-1/2 bottom-20 -translate-x-1/2 w-24 h-6 overflow-hidden">
                            <motion.div
                                key={cycles}
                                className="w-6 h-6 bg-teal-600/30 rounded-full absolute top-0"
                                initial={{ left: 72 }}
                                animate={{ left: 0 }}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                onAnimationComplete={() =>
                                    setTimeout(() => setCycles((prev) => prev + 1), 800)
                                }
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
