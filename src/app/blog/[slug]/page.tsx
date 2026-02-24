import { getBlogPostBySlug, getBlogPosts } from "@/app/actions/blogs";
import { ChevronLeft, Calendar, User, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const otherPosts = (await getBlogPosts()).filter((p: any) => p.id !== post.id).slice(0, 2);

    return (
        <div className="bg-[#FDFCFB] min-h-screen">
            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[500px] w-full">
                <Image
                    src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop"}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3C31] via-[#4A3C31]/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 font-bold text-xs uppercase tracking-[0.2em] transition-all group"
                        >
                            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Volver al Blog
                        </Link>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <span className="bg-[#A68363] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {post.category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight uppercase italic">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-6 text-white/80 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#A68363]" />
                                {new Date(post.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-[#A68363]" />
                                {post.author}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <article className="lg:col-span-8">
                    <div className="prose prose-lg prose-stone max-w-none 
                        prose-headings:text-[#4A3C31] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                        prose-p:text-[#6B6B6B] prose-p:leading-relaxed prose-p:font-medium
                        prose-strong:text-[#4A3C31] prose-strong:font-black
                        prose-li:text-[#6B6B6B] prose-li:font-medium
                        prose-blockquote:border-[#A68363] prose-blockquote:bg-[#F2EDE7]/30 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:not-italic prose-blockquote:font-bold
                    ">
                        {/* Assuming content is Markdown, for a real app use a renderer. 
                            For this implementation we'll handle simple formatting manually or just use raw text with line breaks */}
                        {post.content.split('\n').map((line: string, i: number) => {
                            if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="mt-12">{line.replace('## ', '')}</h2>;
                            if (line.startsWith('### ')) return <h3 key={i} className="mt-8 text-2xl">{line.replace('### ', '')}</h3>;
                            if (line.match(/^\d+\. /)) {
                                return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                            }
                            if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc">{line.replace('* ', '')}</li>;
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i}>{line}</p>;
                        })}
                    </div>

                    {/* Share & Tags */}
                    <div className="mt-20 pt-10 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compartir:</span>
                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-[#4A3C31]">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </article>

                {/* Sidebar / CTA */}
                <aside className="lg:col-span-4 space-y-12">
                    {/* Booking CTA */}
                    <div className="bg-[#4A3C31] p-10 rounded-[3rem] text-white sticky top-32 shadow-2xl shadow-[#4A3C31]/20 overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase italic leading-tight">
                                ¿Buscas apoyo personalizado?
                            </h3>
                            <p className="text-white/70 mb-8 font-medium leading-relaxed">
                                Encuentra al psicólogo ideal para ti y da el primer paso hacia tu bienestar emocional hoy mismo.
                            </p>
                            <Button asChild className="w-full h-14 bg-[#A68363] hover:bg-[#8B6B4E] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-black/20 transition-all hover:-translate-y-1">
                                <Link href="/usuario/search" className="flex items-center justify-center gap-2">
                                    Encontrar Psicólogo
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A68363]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    {/* More Posts */}
                    {otherPosts.length > 0 && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight">Artículos Relacionados</h4>
                            <div className="space-y-6">
                                {otherPosts.map((p: any) => (
                                    <Link key={p.id} href={`/blog/${p.slug}`} className="flex gap-4 group">
                                        <div className="w-24 h-24 relative shrink-0 rounded-2xl overflow-hidden shadow-sm">
                                            <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-[#4A3C31] line-clamp-2 leading-tight group-hover:text-[#A68363] transition-colors">
                                                {p.title}
                                            </h5>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">
                                                {p.category}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
