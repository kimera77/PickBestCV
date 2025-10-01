import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: React.ComponentProps<"svg">) {
    return (
        <svg
            width="256"
            height="256"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(className)}
            {...props}
        >
            <path
                d="M128 0C94.087 0 61.437 13.484 37.5 37.5S0 94.087 0 128s13.484 66.563 37.5 90.5S94.087 256 128 256s66.563-13.484 90.5-37.5S256 161.913 256 128s-13.484-66.563-37.5-90.5S161.913 0 128 0Z"
                fill="#B492E9"
            />
            <path
                d="M174.938 120.312c0 23.438-16.875 30.938-42.188 30.938h-23.437v34.688H72.188V70.312h59.375c26.25 0 43.363 8.438 43.363 27.188 0 12.187-8.438 20.344-21.563 22.812Z"
                fill="#fff"
            />
        </svg>
    );
}
