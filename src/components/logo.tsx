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
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" opacity="0.2"/>
            <path d="M128,32a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,32Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,208Z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16"/>
            <path d="M128,80v96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
            <path d="M172,96a24,24,0,0,0,0,48,8,8,0,0,1,8,8v16a8,8,0,0,1-8,8,24,24,0,0,0,0,48h0a24,24,0,0,0,23.4-28.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
            <path d="M128,80a48,48,0,0,0-48,48v40a48,48,0,0,0,48,48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        </svg>
    )
}
