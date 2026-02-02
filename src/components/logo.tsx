"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    variant?: "light" | "dark";
    minimal?: boolean;
}

export function Logo({ className, variant = "dark", minimal = false }: LogoProps) {
    return (
        <div className={cn(
            "flex items-center font-black tracking-tighter leading-none select-none",
            variant === "light" ? "text-white" : "text-black",
            className
        )}
        >
            <span className="text-2xl md:text-3xl lg:text-4xl">
                {minimal ? "P" : "Pluravita"}<span className="text-[#FF5F5F]">.</span>
            </span>
        </div>
    );
}
