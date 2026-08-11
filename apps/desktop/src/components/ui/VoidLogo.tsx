interface VoidLogoProps {
  className?: string;
  size?: number;
}

export function VoidLogo({ className = "w-8 h-8", size }: VoidLogoProps) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={style}>
      <img
        src="/void_hooded_logo.png"
        alt="VOID Logo"
        className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
      />
    </div>
  );
}

