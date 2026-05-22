import React from 'react';
import { motion } from 'framer-motion';

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  width?: "fit-content" | "100%";
  priority?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = "",
  delay = 0,
  width = "fit-content",
  priority = false
}) => {
  return (
    <div style={{ overflow: 'hidden', width }} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98, filter: "blur(4px)" }}
        animate={priority ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : undefined}
        whileInView={!priority ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : undefined}
        viewport={{ margin: "-10%" }}
        transition={{
          duration: 1,
          delay: delay,
          ease: [0.16, 1, 0.3, 1] // Custom editorial ease (Expo-like)
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default TextReveal;