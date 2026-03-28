import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  id?: string;
}

const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ className, message, id, ...props }, ref) => {
    if (!message) return null;

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "mt-2 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg",
          className
        )}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-destructive">{message}</p>
      </div>
    )
  }
)

FormError.displayName = "FormError"

export { FormError }
