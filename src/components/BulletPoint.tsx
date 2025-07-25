export const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0" />
        <span className="text-gray-700 leading-relaxed">{children}</span>
    </div>
);
