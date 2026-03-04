// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"
import { motion, HTMLMotionProps } from "framer-motion"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                primary: "bg-gradient-to-r from-raspberry to-[#FFAB91] text-white hover:shadow-rose-glow hover:opacity-90",
                secondary: "border border-transparent bg-white text-deep-plum shadow-rose-glow hover:-translate-y-2 hover:shadow-glow hover:border-raspberry/20",
                ghost: "hover:bg-blush-50 text-raspberry",
                danger: "bg-red-50 text-red-600 hover:bg-red-100",
                outline: "border-2 border-raspberry bg-transparent hover:bg-blush-50 text-raspberry",
            },
            size: {
                sm: "h-9 px-4 text-xs rounded-full",
                md: "h-11 px-6 rounded-full",
                lg: "h-14 px-10 text-lg rounded-full",
                icon: "h-10 w-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// Animated version
export const AnimatedButton = motion.create(Button);
