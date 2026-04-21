export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const variants = {
    primary: "bg-accent text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200",
    dark: "bg-base text-white hover:bg-indigo-600 dark:bg-white dark:text-base",
    danger: "bg-danger text-white hover:bg-red-600",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
