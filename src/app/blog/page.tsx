import { getBlogPosts, seedInitialBlogs } from "@/app/actions/blogs";
import { Calendar, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPage() {
    // Seed blogs on first load if none exist
    const posts = await getBlogPosts();

    if (posts.length === 0) {
        await seedInitialBlogs();
    }

    const allPosts = await getBlogPosts();

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            {/* Hero Section */}
            <div className="bg-[#4A3C31] pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic">
                        Nuestro Blog
                    </h1>
                    <p className="text-[#A68363] text-xl font-bold max-w-2xl mx-auto uppercase tracking-[0.2em] text-sm">
                        Recursos, consejos y guías para tu bienestar emocional
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#A68363]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {allPosts.map((post: any) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            <div className="aspect-[16/10] relative overflow-hidden">
                                <Image
                                    src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop"}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[#4A3C31] shadow-xl">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10 flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-4 text-[#8C8C8C] text-[10px] font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(post.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        {post.author}
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-[#4A3C31] mb-4 leading-tight group-hover:text-[#A68363] transition-colors line-clamp-2">
                                    {post.title}
                                </h2>

                                <p className="text-[#6B6B6B] leading-relaxed mb-8 line-clamp-3 text-sm font-medium">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-[#4A3C31] font-black text-xs uppercase tracking-widest">
                                    Leer más
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
