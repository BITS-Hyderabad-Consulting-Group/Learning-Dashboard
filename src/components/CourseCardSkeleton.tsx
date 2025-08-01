export default function CourseCardSkeleton({ progress = false }: { progress?: boolean } = {}) {
    return (
        <div className="px-2 py-4">
            <div className="w-full bg-white rounded-lg shadow-lg border-t-[12px] border-teal-800 border-x-0 border-b-0">
                <div className="flex flex-row items-center justify-between gap-4 p-6 pb-0">
                    <div className="flex-1 min-w-0">
                        <div className="w-48 h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                    </div>
                </div>
                <div className="px-6 pb-2">
                    <div className="flex items-center justify-start space-x-3">
                        <div className="flex items-center space-x-1.5">
                            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center space-x-1.5"></div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex flex-col items-start space-y-1">
                    <div className="flex w-full justify-between">
                        <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>
                {progress && (
                    <div className="px-6 pb-4">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-teal-600 rounded-full animate-pulse w-3/4"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
