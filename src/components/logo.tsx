import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className={cn("fill-current", props.className)}
            {...props}
        >
            <path
                fill="hsl(var(--primary))"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-8 168a72 72 0 0 1-72-72h48a24 24 0 0 0 24 24Zm0-40a24 24 0 0 0 0-48h48a24 24 0 1 0 0-48h-48a72 72 0 0 1 0 144Z"
            ></path>
            <path
                fill="hsl(var(--primary-foreground))"
                d="M120 80h48a24 24 0 1 0 0-48h-48a72 72 0 0 1 0 144 72 72 0 0 1-72-72h48a24 24 0 0 0 24-24Zm0 48a24 24 0 0 0 0-48Z"
            ></path>
        </svg>
    )
}
