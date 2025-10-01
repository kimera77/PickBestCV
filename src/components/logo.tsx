import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("fill-current", props.className)}
            {...props}
        >
            <circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" stroke="none" />
            <path
                d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
            />
            <line
                x1="12"
                y1="12"
                x2="12"
                y2="12"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    )
}
