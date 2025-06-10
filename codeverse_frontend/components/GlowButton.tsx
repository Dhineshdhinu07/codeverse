'use client';
import { ButtonHTMLAttributes } from 'react';
import { codeverseTheme } from '@/utils/theme';

export default function GlowButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: codeverseTheme.colors.neon,
        color: codeverseTheme.colors.background,
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontFamily: codeverseTheme.fonts.heading,
        fontWeight: 700,
        boxShadow: codeverseTheme.shadows.neon,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {props.children}
    </button>
  );
}