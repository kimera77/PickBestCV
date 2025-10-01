import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={cn("fill-current", props.className)}
            {...props}
        >
            <defs>
                <style>
                    {`
                    .cls-1 {
                        fill: hsl(var(--primary));
                    }
                    .cls-2 {
                        fill: hsl(var(--foreground));
                        opacity: 0.8;
                    }
                    `}
                </style>
            </defs>
            <circle className="cls-1" cx="50" cy="50" r="48" />
            <path
                className="cls-2"
                d="M50,85.23c-19.45,0-35.23-15.78-35.23-35.23S30.55,14.77,50,14.77,85.23,30.55,85.23,50,69.45,85.23,50,85.23Zm0-65.47c-16.68,0-30.23,13.55-30.23,30.23s13.55,30.23,30.23,30.23,30.23-13.55,30.23-30.23S66.68,19.77,50,19.77Z"
            />
            <path
                className="cls-2"
                d="M50,60.23c-9.51,0-17.23-7.72-17.23-17.23s7.72-17.23,17.23-17.23,17.23,7.72,17.23,17.23-7.72,17.23-17.23,17.23Zm0-29.47c-6.75,0-12.23,5.48-12.23,12.23s5.48,12.23,12.23,12.23,12.23-5.48,12.23-12.23-5.48-12.23-12.23-12.23Z"
            />
        </svg>
    )
}