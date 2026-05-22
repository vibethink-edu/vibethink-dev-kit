import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  scrambleSpeed?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";

const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = "",
  delay = 0,
  scrambleSpeed = 40
}) => {
  const [displayText, setDisplayText] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { margin: "-10%" });
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      setIsScrambling(true);
      let iteration = 0;

      const interval = setInterval(() => {
        setDisplayText(prev =>
          text
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          clearInterval(interval);
          setIsScrambling(false);
        }

        iteration += 1 / 3; // Slower reveal for "hacker" feel
      }, scrambleSpeed);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, text, delay, scrambleSpeed]);

  return (
    <span ref={ref} className={`${className} inline-block font-mono`}>
      {displayText}
    </span>
  );
};

export default ScrambleText;