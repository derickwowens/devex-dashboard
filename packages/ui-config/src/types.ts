/**
 * UI Configuration types for the design system.
 */

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  success: string;
  warning: string;
}

export interface ThemeConfig {
  name: string;
  colors: ColorPalette;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ComponentConfig {
  /** Component type (button, input, card, etc.) */
  component: string;
  /** Visual variant */
  variant: ComponentVariant;
  /** Size */
  size: ComponentSize;
  /** CSS classes to apply */
  className: string;
  /** Inline styles */
  style: Record<string, string>;
  /** Component-specific props */
  props: Record<string, unknown>;
  /** Accessibility attributes */
  a11y: {
    role?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
  };
}

export interface ButtonConfig extends ComponentConfig {
  component: 'button';
  props: {
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
  };
}

export interface InputConfig extends ComponentConfig {
  component: 'input';
  props: {
    type?: 'text' | 'email' | 'password' | 'number' | 'search';
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
  };
}

export interface CardConfig extends ComponentConfig {
  component: 'card';
  props: {
    elevated?: boolean;
    interactive?: boolean;
    padding?: ComponentSize;
  };
}

export interface BadgeConfig extends ComponentConfig {
  component: 'badge';
  props: {
    dot?: boolean;
    count?: number;
    maxCount?: number;
  };
}
