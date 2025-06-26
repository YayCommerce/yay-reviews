import { cn } from '@/lib/utils';

export default function PageLayout({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'm-auto flex w-[1000px] max-w-[90%] flex-col items-center justify-center gap-8 py-8',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
