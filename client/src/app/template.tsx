"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const transitionRoutes = ['/login', '/register'];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldAnimate = transitionRoutes.includes(pathname);

  return (
    <AnimatePresence mode="wait" initial={true}>
      {shouldAnimate ? (
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative h-full w-full"
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </AnimatePresence>
  );
}