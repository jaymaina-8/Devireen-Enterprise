export default function PublicLoading() {
  return (
    <div className="animate-in fade-in flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-8 duration-150">
      <div className="border-primary-600 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      <span className="text-text-muted text-xs font-semibold tracking-wider uppercase">
        Loading Devireen...
      </span>
    </div>
  );
}
