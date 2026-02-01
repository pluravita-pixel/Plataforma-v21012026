"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    variant?: "light" | "dark";
}

/**
 * Logo Component
 * 
 * This component uses CSS filters to remove the beige background from the source logo.png
 * and isolate the dark text and green leaves.
 * 
 * Filters explained:
 * 1. brightness(1.1) contrast(1.2): Enhances the difference between background and foreground.
 * 2. multiply: Blends with the parent background, effectively making the light/beige parts transparent.
 */
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
                        : "mix-blend-multiply brightness-[1.08] contrast-[1.2] saturate-[1.2]"
                )}
                style={{
                    transform: "scale(1.3)", // Balanced scale for standard devices
                    imageRendering: "auto"
                }}
                priority
            />
        </div>
    );
}
