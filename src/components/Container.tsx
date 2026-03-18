import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8 2xl:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

