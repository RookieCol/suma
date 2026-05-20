import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  fromColor?: string;
}

export function ScrollFade({ children, className = '', fromColor = 'from-card' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const hasMore = el.scrollHeight - el.scrollTop > el.clientHeight + 2;
      setFaded(hasMore);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', check); ro.disconnect(); };
  }, [children]);

  return (
    <div className={`relative flex-1 min-h-0 ${className}`}>
      <div ref={ref} className="h-full overflow-y-auto">
        {children}
      </div>
      {faded && (
        <div className={`absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t ${fromColor} to-transparent pointer-events-none`} />
      )}
    </div>
  );
}
