import React from 'react';

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="absolute left-0 top-0 z-[100000] block -translate-y-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
    >
      Skip to main content
    </a>
  );
}
