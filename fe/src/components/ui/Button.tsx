/**
 * Archivo: components/ui/Button.tsx
 * Descripción: Botón reutilizable con variantes de estilo y estado de carga.
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      "bg-brand-purple text-white hover:bg-brand-dark focus:ring-brand-purple/20",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-brand-purple/40 dark:hover:bg-brand-purple/20 focus:ring-brand-purple/20",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500/20",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
                        {isLoading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
