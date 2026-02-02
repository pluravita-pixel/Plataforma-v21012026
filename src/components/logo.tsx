"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    variant?: "light" | "dark";
}

export function Logo({ className, variant = "dark" }: LogoProps) {
    return (
        <div className={cn(
            "flex items-center font-black tracking-tighter leading-none select-none",
            variant === "light" ? "text-white" : "text-black",
            className
        )}
        >
            <span className="text-2xl md:text-3xl lg:text-4xl">
                Pluravita<span className="text-[#FF5F5F]">.</span>
            </span>
        </div>
    );
}
