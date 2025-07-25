import { CardTitle,CardHeader,Card,CardContent } from "./ui/card";

export const SectionCard = ({
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