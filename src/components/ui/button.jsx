import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#02988C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[#02988C] text-white shadow-md hover:bg-[#027A70] hover:shadow-lg",
        gradient:
          "bg-[linear-gradient(135deg,#02988C_0%,#09D2FF_100%)] text-white shadow-md hover:shadow-lg hover:opacity-90",
        accent:
          "bg-[#9531F5] text-white shadow-md hover:bg-[#7D26CC] hover:shadow-lg",
        destructive:
          "bg-[#DC2626] text-white shadow-sm hover:bg-[#B91C1C]",
        outline:
          "border-2 border-[#02988C] text-[#02988C] bg-transparent hover:bg-[#02988C]/5",
        secondary:
          "bg-[#02988C]/10 text-[#02988C] hover:bg-[#02988C]/15",
        ghost: "hover:bg-slate-100 hover:text-[#0A1F1D]",
        link: "text-[#02988C] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-7 py-3 rounded-lg text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {asChild ? children : (
        <>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }