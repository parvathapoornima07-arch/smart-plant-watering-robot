import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...rest} />;
}

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  title,
  description,
  action,
  className,
  ...rest
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 p-5 pb-0", className)} {...rest}>
      <div>
        {title ? <h3 className="text-base font-semibold text-charcoal-900">{title}</h3> : null}
        {description ? (
          <p className="mt-1 text-sm text-charcoal-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-leaf-100 p-5", className)} {...rest} />;
}
