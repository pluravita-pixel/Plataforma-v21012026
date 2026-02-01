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
                width={1000}
                height={1000}
                className={cn(
                    "object-contain w-full h-full transition-all duration-700 ease-in-out group-hover:scale-105",
                    variant === "light"
                        ? "brightness-0 invert"
                        : "mix-blend-multiply brightness-[1.1] contrast-[1.1] saturate-[1.1]"
                )}
                style={{
                    transform: "scale(1.3)",
                    // Ensure no lingering background colors from the image interfere
                    filter: variant === "dark" ? "contrast(1.15) brightness(1.05)" : "none"
                }}
                priority
            />
        </div>
    );
}
