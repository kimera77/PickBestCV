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
                fillOpacity="0.5"
            />
            <path
                d="M128,88a36,36,0,1,0,36,36,36,36,0,0,0-36-36Z"
            />
            <path d="M184,160H72a48,48,0,0,0-48,48v16a0,0,0,0,0,0,0H232a0,0,0,0,0,0,0V208A48,48,0,0,0,184,160Z" />
        </svg>
    )
}