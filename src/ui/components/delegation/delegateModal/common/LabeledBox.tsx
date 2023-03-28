export function LabeledBox({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="text-sm">{title}</div>
        <div className="flex gap-2 text-base font-medium">{children}</div>
      </div>
    </>
  );
}
