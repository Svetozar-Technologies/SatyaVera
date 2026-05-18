"use client";

import {
  Home, MessageCircle, FileText, Shield, BookOpen, Map, AlertTriangle,
  HelpCircle, User, LayoutGrid, Crown, Settings, Search, Send, Plus,
  ChevronRight, ChevronDown, Star, Check, Phone, Upload, Camera, Zap,
  Scale, Flag, Heart, Users, MapPin, Flame, Lock, Bell, Bookmark,
  Edit, Download, Eye, List, Info, ArrowRight, Sparkles, File,
  type LucideProps
} from "lucide-react";
import { forwardRef } from "react";

const iconMap = {
  home: Home,
  chat: MessageCircle,
  doc: FileText,
  shield: Shield,
  book: BookOpen,
  map: Map,
  siren: AlertTriangle,
  quiz: HelpCircle,
  user: User,
  template: LayoutGrid,
  crown: Crown,
  cog: Settings,
  search: Search,
  send: Send,
  plus: Plus,
  chevR: ChevronRight,
  chevD: ChevronDown,
  star: Star,
  check: Check,
  phone: Phone,
  upload: Upload,
  camera: Camera,
  bolt: Zap,
  scale: Scale,
  flag: Flag,
  heart: Heart,
  users: Users,
  pin: MapPin,
  fire: Flame,
  lock: Lock,
  bell: Bell,
  bookmark: Bookmark,
  edit: Edit,
  download: Download,
  eye: Eye,
  list: List,
  info: Info,
  arrowR: ArrowRight,
  sparkles: Sparkles,
  paper: File,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 16, className = "", ...props }, ref) => {
    const LucideIcon = iconMap[name];
    if (!LucideIcon) return null;
    return <LucideIcon ref={ref} size={size} className={className} strokeWidth={1.6} {...props} />;
  }
);
Icon.displayName = "Icon";
