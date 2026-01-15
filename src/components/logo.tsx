import Image from 'next/image';

// A generic, visible logo to ensure the app is functional.
export function Logo({ className }: { className?: string }) {
    return (
        <Image 
            src="/icon_pickbestcv.png" 
            alt="PickbestCV Logo" 
            width={48} 
            height={48} 
            className={className}
        />
    );
}
