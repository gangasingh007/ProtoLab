'use client';

import * as React from 'react';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className="dark" {...props}>
      {children}
    </div>
  );
}
