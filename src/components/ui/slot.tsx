import * as React from "react"

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement<Record<string, unknown>>(children)) {
      const childProps = children.props as Record<string, unknown>
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ...props,
        ...(childProps as object),
        ref,
        className: mergeClasses(
          props.className,
          childProps.className as string | undefined
        ),
      })
    }

    return null
  }
)
Slot.displayName = "Slot"

function mergeClasses(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export { Slot }
