'use client';
import React from 'react';

interface NexsLogoProps {
  className?: string;
  variant?: 'full' | 'icon-only' | 'light-text' | 'dark-text';
  height?: number;
}

export function NexsLogo({
  className = '',
  variant = 'dark-text',
  height = 36,
}: NexsLogoProps) {
  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/nexs-icon.svg"
          alt="NEXS"
          style={{ height: `${height}px`, width: `${height}px` }}
          className="object-contain drop-shadow-xs block"
        />
      </div>
    );
  }

  if (variant === 'light-text') {
    return (
      <div className={`flex items-center gap-3 shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/nexs-icon.svg"
          alt="NEXS"
          style={{ height: `${height}px`, width: `${height}px` }}
          className="object-contain drop-shadow-xs shrink-0 block"
        />
        <div className="flex flex-col leading-tight select-none">
          <span className="font-black text-lg tracking-wider text-white">NEXS</span>
          <span className="font-bold text-xs text-slate-300">Japanese Academy</span>
          <span className="text-[9px] text-slate-400 font-medium">We Make Your Japanese Up!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/brand/nexs-icon.svg"
        alt="NEXS"
        style={{ height: `${height}px`, width: `${height}px` }}
        className="object-contain drop-shadow-xs shrink-0 block"
      />
      <div className="flex flex-col leading-tight select-none">
        <span className="font-black text-lg tracking-wider text-[#3B1D1D]">NEXS</span>
        <span className="font-bold text-xs text-[#3B1D1D]">Japanese Academy</span>
        <span className="text-[9px] text-[#6B4F4F] font-medium">We Make Your Japanese Up!</span>
      </div>
    </div>
  );
}
