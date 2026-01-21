import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-gray-200" />
                    <Skeleton className="h-4 w-64 bg-gray-100" />
                </div>
                <Skeleton className="h-10 w-32 bg-gray-200 rounded-lg" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                        <div className="flex justify-between mb-4">
                            <Skeleton className="h-4 w-24 bg-gray-100" />
                            <Skeleton className="h-4 w-4 bg-gray-100" />
                        </div>
                        <Skeleton className="h-8 w-16 bg-gray-200 mb-2" />
                        <Skeleton className="h-3 w-32 bg-gray-100" />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 h-[400px]">
                    <Skeleton className="h-6 w-48 bg-gray-200 mb-6" />
                    <Skeleton className="h-[280px] w-full bg-gray-50" />
                </div>
                <div className="col-span-3 bg-white p-6 rounded-xl border border-gray-100">
                    <Skeleton className="h-6 w-48 bg-gray-200 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-12 w-full bg-gray-50 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
