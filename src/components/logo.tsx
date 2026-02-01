"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    variant?: "light" | "dark";
}

export function Logo({ className, variant = "dark" }: LogoProps) {
    return (
        <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
            <Image
                src="/logo.png"
                alt="pluravita"
                width={1200}
                height={1200}
                className={cn(
                    "object-contain w-full h-full transition-all duration-700 ease-in-out group-hover:scale-110",
                    variant === "light" ? "brightness-0 invert" : "brightness-[1.05] contrast-[1.05] saturate-[1.1] "
                )}
                style={{
                    transform: "scale(1.8)",
                    imageRendering: "crisp-edges"
                }}
                priority
            />
        </div>
    );
}
