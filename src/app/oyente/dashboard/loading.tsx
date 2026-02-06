import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <Skeleton className="h-10 w-64 bg-gray-200 rounded-xl" />
                <Skeleton className="h-4 w-96 bg-gray-100 rounded-lg mt-2 " />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <Skeleton className="h-12 w-12 rounded-2xl bg-gray-100 mb-4" />
                        <Skeleton className="h-4 w-24 bg-gray-100 mb-2" />
                        <Skeleton className="h-8 w-32 bg-gray-200" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-40 bg-gray-200" />
                            <Skeleton className="h-4 w-20 bg-gray-100" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="flex items-center justify-between p-4 rounded-3xl bg-[#FAFAFA]">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32 bg-gray-200" />
                                            <Skeleton className="h-3 w-24 bg-gray-100" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-24 bg-gray-100 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
