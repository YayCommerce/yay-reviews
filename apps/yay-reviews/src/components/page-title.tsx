export default function PageTitle({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto flex flex-col gap-3.5 p-7">
      <div className="text-foreground text-3xl font-bold">{title}</div>
      {description && <div className="text-base leading-6 text-slate-600">{description}</div>}
    </div>
  );
}
