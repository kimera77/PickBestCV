// A generic, visible logo to ensure the app is functional.
export function Logo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill="hsl(var(--primary))"
        >
            <path d="M50 0L100 28.87V86.6L50 115.47L0 86.6V28.87L50 0Z" />
        </svg>
    );
}
