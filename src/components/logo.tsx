import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className, ...props }: React.ComponentProps<"img">) {
    return (
        <Image
            src="https://placehold.co/256x256/B492E9/FFFFFF?text=PB&font=raleway"
            alt="PickbestCV Logo"
            width={256}
            height={256}
            className={cn(className)}
            priority
        />
    )
}
