import { ComponentRef, useEffect, useRef } from "react";

export function useFitWindow<T extends HTMLElement>(
  additional: Array<React.RefObject<HTMLElement>>
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    let prevWidth: number = 0;
    let resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      if (height !== prevWidth) {
        prevWidth = height;
        window.api.send(
          "setContentHeight",
          ref.current!.offsetHeight +
            additional.reduce((acc, elem) => {
              if (!elem.current) return acc;
              return acc + elem.current.offsetHeight;
            }, 0)
        );
      }
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, [ref, ...additional]);
  return ref;
}
