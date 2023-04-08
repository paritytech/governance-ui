export function InnerCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`flex flex-col rounded-xl p-3 ${className}`}>
      {children}
    </div>
  );
}
