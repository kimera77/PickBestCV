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
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M88 192V64h56a40 40 0 0 1 0 80H88v48Z"
                fill="hsl(var(--primary))"
            />
            <path
                d="m144 104a40 40 0 0 0 0-80H88v80h56Z"
                fill="hsl(var(--primary-foreground))"
            />
        </svg>
    )
}
