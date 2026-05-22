"use client";

import { useState, useEffect } from "react";
import { icons } from "lucide-react";

type IconProps = {
  name: string;
  className?: string;
};

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type IconsType = {
  [key: string]: IconType;
};

const iconMap: IconsType = icons;

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const LucideIcon = iconMap[name];

  if (!LucideIcon) {
    return null;
  }

  // Prevent hydration mismatch by not rendering icon until mounted
  if (!mounted) {
    return <div className={className} style={{ width: '1rem', height: '1rem' }} />;
  }

  return <LucideIcon className={className} />;
};

export default Icon;
