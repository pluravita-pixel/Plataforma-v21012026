import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-10 w-64 bg-gray-200 rounded-xl" />
                    <Skeleton className="h-4 w-96 bg-gray-100 rounded-lg mt-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-[200px] w-full bg-gray-200 rounded-[2.5rem]" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-48 bg-gray-200" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-[150px] bg-white rounded-3xl border border-gray-100" />
                            <Skeleton className="h-[150px] bg-white rounded-3xl border border-gray-100" />
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-[400px] w-full bg-white rounded-[2.5rem] border border-gray-100" />
                </div>
            </div>
        </div>
    );
}
