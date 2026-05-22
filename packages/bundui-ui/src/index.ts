// Bundui Premium Components - VThink 1.0 Integration
// Exporta todos los componentes premium de Bundui para uso en VibeThink Orchestrator

// Componentes principales
export { default as ActiveTheme } from "./components/ActiveTheme";
export { ExportButton } from "./components/CardActionMenus";
export { default as CustomDateRangePicker } from "./components/custom-date-range-picker";
export { DateTimePicker } from "./components/date-time-picker";
export { default as Icon } from "./components/icon";

// Componentes UI
export * from "./components/ui/accordion";
export * from "./components/ui/alert";
export * from "./components/ui/alert-dialog";
export * from "./components/ui/aspect-ratio";
export * from "./components/ui/avatar";
export * from "./components/ui/badge";
export * from "./components/ui/breadcrumb";
export * from "./components/ui/button";
export * from "./components/ui/calendar";
export * from "./components/ui/card";
export * from "./components/ui/checkbox";
export * from "./components/ui/collapsible";
export * from "./components/ui/command";
export * from "./components/ui/context-menu";
export * from "./components/ui/dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/form";
export * from "./components/ui/hover-card";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/menubar";
export * from "./components/ui/navigation-menu";
export * from "./components/ui/popover";
export * from "./components/ui/progress";
export * from "./components/ui/radio-group";
export * from "./components/ui/scroll-area";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/skeleton";
export * from "./components/ui/slider";
export * from "./components/ui/switch";
export * from "./components/ui/table";
export * from "./components/ui/tabs";
export * from "./components/ui/textarea";
export * from "./components/ui/toast";
export * from "./components/ui/toggle";
export * from "./components/ui/tooltip";

// Layout components
export { default as DashboardLayout } from "./components/layout/DashboardLayout";
// export { default as Sidebar } from './components/layout/sidebar'; // Comentado - depende de Next.js
// export { default as Logo } from './components/layout/logo'; // Comentado - depende de Next.js

// Theme customizer
export * from "./components/theme-customizer";

// Hooks - exports individuales
export * from "./hooks/use-mobile";
export * from "./hooks/use-toast";
export * from "./hooks/use-file-upload";

// Utilities - exports individuales
export { cn } from "./lib/utils";
export * from "./lib/themes";
// export * from './lib/fonts'; // Comentado - depende de Next.js (next/font module)
// Debug Panel
export { default as SystemDebugPanel } from "./components/debug/SystemDebugPanel";
// Premium dashboards/pages
export { default as BunduiPremiumDashboard } from "./components/BunduiPremiumDashboard";
export { default as PremiumTestPageEnhanced } from "./components/PremiumTestPageEnhanced";
export { default as BunduiDefaultDashboard } from "./components/BunduiDefaultDashboard";

// Dashboard components (100% identical to Bundui-Premium)
export { TeamMembersCard } from "./components/dashboard-components/TeamMembersCard";
export { SubscriptionsCard } from "./components/dashboard-components/SubscriptionsCard";
export { TotalRevenueCard } from "./components/dashboard-components/TotalRevenueCard";
export { ChatWidget } from "./components/dashboard-components/ChatWidget";
export { ExerciseMinutes } from "./components/dashboard-components/ExerciseMinutes";
export { LatestPayments } from "./components/dashboard-components/LatestPayments";
export { PaymentMethodCard } from "./components/dashboard-components/PaymentMethodCard";
