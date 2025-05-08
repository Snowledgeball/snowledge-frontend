"use client";

import { useState, useEffect } from "react";

export const useMounted = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};
