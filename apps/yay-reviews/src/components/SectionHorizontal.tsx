export const SectionHorizontal = ({ label }: { label: string }) => {
  return (
    <div className="my-0 flex items-center gap-2">
      <div className="w-2/3 border-t" />
      <span className="text-right text-xs uppercase">{label}</span>
      <div className="w-1/3 border-t" />
    </div>
  );
};
