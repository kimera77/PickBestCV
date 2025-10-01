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
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"
                fillOpacity="0.2"
            />
            <path
                d="M128,88a40,40,0,1,0,40,40,40,40,0,0,0-40-40Z"
                fillOpacity="0.5"
            />
            <path d="M195.88,184A63.63,63.63,0,0,0,128,152a63.62,63.62,0,0,0-67.88,32h135.76Z" />
        </svg>
    )
}