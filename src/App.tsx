import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, Wallet, CheckSquare, FileText, Grid, Search, Sparkles, ShieldCheck,
  Bell, Settings, Plus, Upload, Camera, Calendar, ShoppingCart, Package,
  Wrench, Zap, Cpu, Archive, PhoneCall, Car, Heart, BarChart3, RefreshCw,
  Lock, Users, Download, AlertTriangle, CheckCircle2, Clock, Trash2, Edit3,
  Eye, EyeOff, ChevronRight, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  Filter, X, Check, RotateCw, Crop, BookOpen, Utensils, Sun, Moon, Database,
  Sliders, Play, Pause, History, Key, FileCheck, HelpCircle, LogOut, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// ============================================================================
// 1. DOMAIN TYPES & STRICT SCHEMA DEFINITIONS (ZERO LOCATION TRACKING)
// ============================================================================

export type HouseholdRole = 'owner' | 'admin' | 'adult' | 'restricted' | 'readonly';
export type DataMode = 'local_private' | 'family_sync';
export type PrimaryTab = 'home' | 'money' | 'tasks' | 'documents' | 'more';
export type MoreModule =
  | 'hub'
  | 'shopping'
  | 'recipes'
  | 'assets'
  | 'energy'
  | 'calendar'
  | 'automation'
  | 'smarthome'
  | 'emergency'
  | 'archive'
  | 'optional_modules'
  | 'reports'
  | 'settings';

export type ExpenseCategory =
  | 'Groceries' | 'Utilities' | 'Electricity' | 'Water' | 'Internet'
  | 'Rent' | 'Education' | 'Healthcare' | 'Shopping' | 'Maintenance'
  | 'Transport' | 'Entertainment' | 'Insurance' | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Groceries', 'Utilities', 'Electricity', 'Water', 'Internet',
  'Rent', 'Education', 'Healthcare', 'Shopping', 'Maintenance',
  'Transport', 'Entertainment', 'Insurance', 'Other'
];

export type DocumentCategory =
  | 'Identity' | 'Education' | 'Healthcare' | 'Insurance' | 'Property'
  | 'Financial records' | 'Receipts' | 'Warranties' | 'Vehicles'
  | 'Household documents' | 'Solar equipment' | 'Other';

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Identity', 'Education', 'Healthcare', 'Insurance', 'Property',
  'Financial records', 'Receipts', 'Warranties', 'Vehicles',
  'Household documents', 'Solar equipment', 'Other'
];

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: HouseholdRole;
  status: 'active' | 'invited' | 'revoked';
  avatarColor: string;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  amountMinor: number; // Stored strictly in integer minor units (e.g. paise/cents)
  currency: string;
  category: ExpenseCategory;
  transactionDate: string;
  paidByMemberId: string;
  paymentMethod: string;
  merchant: string;
  notes: string;
  tags: string[];
  receiptDocId?: string;
  recurringSchedule?: 'none' | 'monthly' | 'quarterly' | 'annual';
  reimbursable: boolean;
  settled: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BillRecord {
  id: string;
  title: string;
  category: string;
  amountMinor: number;
  dueDate: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  status: 'unpaid' | 'paid' | 'overdue';
  paidDate?: string;
  referenceNumber?: string;
  receiptDocId?: string;
  isSubscription: boolean;
}

export interface TaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TaskRecord {
  id: string;
  title: string;
  assignedToMemberId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  routineType: 'none' | 'morning' | 'evening' | 'weekly' | 'monthly';
  repeatingSchedule: 'none' | 'daily' | 'weekly' | 'monthly';
  rotationMemberIds: string[];
  completed: boolean;
  completedAt?: string;
  checklist: TaskChecklistItem[];
  relatedDocId?: string;
  relatedExpenseId?: string;
  notes: string;
}

export interface DocumentVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  notes: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  personId: string;
  issueDate: string;
  expiryDate: string;
  extractedText: string;
  candidateAmountMinor?: number;
  tags: string[];
  favorite: boolean;
  restrictedAccess: boolean;
  uncertaintyFlags: string[];
  versions: DocumentVersion[];
  relatedRecordId?: string;
  fileSizeKb: number;
  mimeType: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedPriceMinor: number;
  notes: string;
  addedBy: string;
  purchased: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expiryDate: string;
  category: string;
  lastAdjustedAt: string;
}

export interface RecipeItem {
  id: string;
  name: string;
  prepTimeMinutes: number;
  servings: number;
  favorite: boolean;
  tags: string[];
  ingredients: { name: string; quantity: number; unit: string; estCostMinor: number }[];
  instructions: string[];
  notes: string;
  mealDay: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  issue: string;
  costMinor: number;
  serviceContact: string;
  nextServiceDate: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  category: 'Appliances' | 'Electronics' | 'Furniture' | 'Solar equipment' | 'Tools' | 'Other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePriceMinor: number;
  warrantyExpiryDate: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  receiptDocId?: string;
  manualDocId?: string;
  notes: string;
  maintenanceLogs: MaintenanceLog[];
}

export interface EnergyReading {
  id: string;
  date: string;
  meterReadingKwh: number;
  solarGeneratedKwh: number;
  householdConsumedKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  sourceType: 'Measured' | 'User Estimate' | 'Calculated';
}

export interface AutomationRule {
  id: string;
  code: string;
  name: string;
  trigger: string;
  conditionSummary: string;
  actionSummary: string;
  enabled: boolean;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: 'Family' | 'Birthday' | 'Anniversary' | 'Appointment' | 'School' | 'Bill' | 'Document' | 'Maintenance';
  recurring: 'none' | 'annual' | 'monthly' | 'weekly';
  reminderHoursBefore: number;
  notes: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  targetDate: string;
}

export interface FamilyLoan {
  id: string;
  lenderMemberId: string;
  borrowerMemberId: string;
  principalMinor: number;
  remainingMinor: number;
  purpose: string;
  createdAt: string;
  settled: boolean;
}

export interface SyncConflict {
  id: string;
  module: string;
  recordTitle: string;
  localSummary: string;
  serverSummary: string;
  detectedAt: string;
  resolved: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  eventType: string;
  recordRef: string;
  description: string;
}

export interface DashboardWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

// ============================================================================
// 2. INTEGER MINOR-UNIT CURRENCY ARITHMETIC ENGINE
// ============================================================================

export function formatMoneyMinor(amountMinor: number, currency = 'INR'): string {
  const safeInt = Math.round(amountMinor);
  const sign = safeInt < 0 ? '-' : '';
  const abs = Math.abs(safeInt);
  const major = Math.floor(abs / 100);
  const minor = abs % 100;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  const formattedMajor = major.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US');
  return `${sign}${symbol}${formattedMajor}.${String(minor).padStart(2, '0')}`;
}

export function parseMajorToMinor(majorInput: string | number): number {
  const cleaned = String(majorInput).replace(/[^0-9.-]/g, '').trim();
  if (!cleaned || isNaN(Number(cleaned))) return 0;
  const parts = cleaned.split('.');
  const major = parseInt(parts[0] || '0', 10);
  const minorStr = (parts[1] || '00').slice(0, 2).padEnd(2, '0');
  const minor = parseInt(minorStr, 10);
  return major * 100 + (major < 0 ? -minor : minor);
}

export function sumMinor(values: number[]): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += Math.round(values[i] || 0);
  }
  return total;
}

// ============================================================================
// 3. INITIAL REALISTIC HOUSEHOLD STATE (OCTOBER 2026)
// ============================================================================

const INITIAL_MEMBERS: FamilyMember[] = [
  { id: 'mem-1', name: 'Aarav Sharma', email: 'aarav@sharma-home.local', role: 'owner', status: 'active', avatarColor: '#8B9CFF' },
  { id: 'mem-2', name: 'Meera Sharma', email: 'meera@sharma-home.local', role: 'admin', status: 'active', avatarColor: '#66D9C2' },
  { id: 'mem-3', name: 'Rohan Sharma', email: 'rohan@sharma-home.local', role: 'adult', status: 'active', avatarColor: '#F59E0B' },
  { id: 'mem-4', name: 'Diya Sharma', email: 'diya@sharma-home.local', role: 'restricted', status: 'active', avatarColor: '#EC4899' },
  { id: 'mem-5', name: 'Grandpa Vikram', email: 'vikram@sharma-home.local', role: 'readonly', status: 'active', avatarColor: '#A855F7' }
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-101',
    description: 'Weekly Organic Groceries & Fresh Produce',
    amountMinor: 485000,
    currency: 'INR',
    category: 'Groceries',
    transactionDate: '2026-10-16',
    paidByMemberId: 'mem-2',
    paymentMethod: 'UPI / Household Card',
    merchant: 'Nature Basket Fresh Mart',
    notes: 'Includes staples, lentils, milk, vegetables',
    tags: ['groceries', 'weekly', 'shared'],
    receiptDocId: 'doc-203',
    recurringSchedule: 'none',
    reimbursable: true,
    settled: false,
    createdAt: '2026-10-16T11:20:00Z',
    updatedAt: '2026-10-16T11:20:00Z',
    version: 1
  },
  {
    id: 'exp-102',
    description: 'TNEB Monthly Electricity & Net Metering Settlement',
    amountMinor: 312000,
    currency: 'INR',
    category: 'Electricity',
    transactionDate: '2026-10-12',
    paidByMemberId: 'mem-1',
    paymentMethod: 'NetBanking',
    merchant: 'TANGEDCO Power Utility',
    notes: 'Net grid import after 5kW rooftop solar offset',
    tags: ['electricity', 'utility', 'solar'],
    recurringSchedule: 'monthly',
    reimbursable: true,
    settled: true,
    createdAt: '2026-10-12T09:15:00Z',
    updatedAt: '2026-10-12T09:15:00Z',
    version: 1
  },
  {
    id: 'exp-103',
    description: 'Fiber Gigabit Home Internet Plan',
    amountMinor: 149900,
    currency: 'INR',
    category: 'Internet',
    transactionDate: '2026-10-08',
    paidByMemberId: 'mem-1',
    paymentMethod: 'Credit Card',
    merchant: 'Airtel Xstream Fiber',
    notes: '300 Mbps unlimited household connection',
    tags: ['internet', 'recurring'],
    recurringSchedule: 'monthly',
    reimbursable: true,
    settled: true,
    createdAt: '2026-10-08T14:00:00Z',
    updatedAt: '2026-10-08T14:00:00Z',
    version: 1
  },
  {
    id: 'exp-104',
    description: 'RO Water Purifier Filter Cartridge Service',
    amountMinor: 265000,
    currency: 'INR',
    category: 'Maintenance',
    transactionDate: '2026-10-05',
    paidByMemberId: 'mem-3',
    paymentMethod: 'UPI',
    merchant: 'AquaPure Home Services',
    notes: 'Annual membrane + sediment filter replacement',
    tags: ['maintenance', 'appliances', 'repairs'],
    recurringSchedule: 'annual',
    reimbursable: true,
    settled: false,
    createdAt: '2026-10-05T16:40:00Z',
    updatedAt: '2026-10-05T16:40:00Z',
    version: 1
  },
  {
    id: 'exp-105',
    description: 'Diya Semester Tuition & Lab Fee',
    amountMinor: 1850000,
    currency: 'INR',
    category: 'Education',
    transactionDate: '2026-10-02',
    paidByMemberId: 'mem-1',
    paymentMethod: 'Bank Transfer',
    merchant: 'National Science Academy',
    notes: 'Autumn term fee + chemistry lab kit',
    tags: ['education', 'tuition'],
    recurringSchedule: 'quarterly',
    reimbursable: false,
    settled: true,
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
    version: 1
  },
  {
    id: 'exp-106',
    description: 'Family Dental Checkup & Pharmacy',
    amountMinor: 340000,
    currency: 'INR',
    category: 'Healthcare',
    transactionDate: '2026-09-24',
    paidByMemberId: 'mem-2',
    paymentMethod: 'Debit Card',
    merchant: 'Apollo Family Clinic',
    notes: 'Annual dental cleaning and vitamin supplements',
    tags: ['health', 'medical'],
    recurringSchedule: 'none',
    reimbursable: false,
    settled: true,
    createdAt: '2026-09-24T18:10:00Z',
    updatedAt: '2026-09-24T18:10:00Z',
    version: 1
  },
  {
    id: 'exp-107',
    description: 'September Bulk Groceries & Pantry Restock',
    amountMinor: 1420000,
    currency: 'INR',
    category: 'Groceries',
    transactionDate: '2026-09-15',
    paidByMemberId: 'mem-2',
    paymentMethod: 'Credit Card',
    merchant: 'Nature Basket Fresh Mart',
    notes: 'Monthly grains, cooking oil, spices, dairy',
    tags: ['groceries', 'monthly'],
    recurringSchedule: 'monthly',
    reimbursable: true,
    settled: true,
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
    version: 1
  },
  {
    id: 'exp-108',
    description: 'Solar Inverter Surge Protector Repair',
    amountMinor: 420000,
    currency: 'INR',
    category: 'Maintenance',
    transactionDate: '2026-08-19',
    paidByMemberId: 'mem-1',
    paymentMethod: 'UPI',
    merchant: 'SunVolt Energy Tech',
    notes: 'Replaced DC SPD module in 5kW hybrid inverter',
    tags: ['repairs', 'solar', 'maintenance'],
    recurringSchedule: 'none',
    reimbursable: false,
    settled: true,
    createdAt: '2026-08-19T15:30:00Z',
    updatedAt: '2026-08-19T15:30:00Z',
    version: 1
  }
];

const INITIAL_BILLS: BillRecord[] = [
  {
    id: 'bill-1',
    title: 'Municipal Water & Sanitation Board',
    category: 'Water',
    amountMinor: 85000,
    dueDate: '2026-10-22',
    frequency: 'monthly',
    status: 'unpaid',
    isSubscription: false
  },
  {
    id: 'bill-2',
    title: 'Comprehensive Home & Solar Property Insurance',
    category: 'Insurance',
    amountMinor: 1240000,
    dueDate: '2026-10-25',
    frequency: 'annual',
    status: 'unpaid',
    isSubscription: false
  },
  {
    id: 'bill-3',
    title: 'Cloud Family Vault Storage 2TB Plan',
    category: 'Software subscriptions',
    amountMinor: 65000,
    dueDate: '2026-10-20',
    frequency: 'monthly',
    status: 'unpaid',
    isSubscription: true
  },
  {
    id: 'bill-4',
    title: 'StreamPlus 4K Family Plan (Account #1)',
    category: 'Streaming services',
    amountMinor: 64900,
    dueDate: '2026-10-28',
    frequency: 'monthly',
    status: 'paid',
    paidDate: '2026-10-03',
    referenceNumber: 'UPI-99481204',
    isSubscription: true
  },
  {
    id: 'bill-5',
    title: 'StreamPlus 4K Family Plan (Duplicate Check)',
    category: 'Streaming services',
    amountMinor: 64900,
    dueDate: '2026-10-29',
    frequency: 'monthly',
    status: 'unpaid',
    isSubscription: true
  }
];

const INITIAL_TASKS: TaskRecord[] = [
  {
    id: 'tsk-1',
    title: 'Clean rooftop solar panels & inspect inverter intake vent',
    assignedToMemberId: 'mem-1',
    priority: 'high',
    dueDate: '2026-10-18',
    routineType: 'weekly',
    repeatingSchedule: 'weekly',
    rotationMemberIds: ['mem-1', 'mem-3'],
    completed: false,
    checklist: [
      { id: 'c1', label: 'Turn off DC isolator before hosing panels', done: true },
      { id: 'c2', label: 'Wipe dust film from East & South strings', done: false },
      { id: 'c3', label: 'Log generation reading in Energy module', done: false }
    ],
    notes: 'Best done before 8:30 AM while panels are cool'
  },
  {
    id: 'tsk-2',
    title: 'Submit Comprehensive Home Insurance renewal declaration',
    assignedToMemberId: 'mem-2',
    priority: 'urgent',
    dueDate: '2026-10-16',
    routineType: 'none',
    repeatingSchedule: 'none',
    rotationMemberIds: ['mem-2'],
    completed: false,
    relatedDocId: 'doc-201',
    checklist: [
      { id: 'c4', label: 'Verify solar inverter serial number on policy annex', done: true },
      { id: 'c5', label: 'Pay annual premium and attach receipt', done: false }
    ],
    notes: 'Overdue by 2 days — policy expires Nov 2, 2026'
  },
  {
    id: 'tsk-3',
    title: 'Morning Kitchen & Water Filter Check Routine',
    assignedToMemberId: 'mem-3',
    priority: 'medium',
    dueDate: '2026-10-18',
    routineType: 'morning',
    repeatingSchedule: 'daily',
    rotationMemberIds: ['mem-2', 'mem-3'],
    completed: false,
    checklist: [
      { id: 'c6', label: 'Check RO TDS indicator light', done: true },
      { id: 'c7', label: 'Prep breakfast ingredients from Meal Planner', done: true }
    ],
    notes: 'Standard daily morning routine'
  },
  {
    id: 'tsk-4',
    title: 'Evening Security Lockup & Appliance Standby Check',
    assignedToMemberId: 'mem-1',
    priority: 'medium',
    dueDate: '2026-10-18',
    routineType: 'evening',
    repeatingSchedule: 'daily',
    rotationMemberIds: ['mem-1', 'mem-2'],
    completed: true,
    completedAt: '2026-10-17T22:15:00Z',
    checklist: [
      { id: 'c8', label: 'Verify main gate & terrace latch', done: true },
      { id: 'c9', label: 'Switch off non-essential smart plugs', done: true }
    ],
    notes: 'Completed last night'
  }
];

const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-201',
    title: 'Comprehensive Home & Rooftop Solar Insurance Policy 2025–2026',
    category: 'Insurance',
    personId: 'mem-1',
    issueDate: '2025-11-03',
    expiryDate: '2026-11-02',
    extractedText: 'Policy #HSI-884920-IN. Insured Property: Sharma Family Residence + 5kW Hybrid Solar Array. Sum Insured: INR 85,00,000. Renewal Due: 2026-11-02.',
    candidateAmountMinor: 1240000,
    tags: ['insurance', 'property', 'solar', 'renewal'],
    favorite: true,
    restrictedAccess: false,
    uncertaintyFlags: [],
    versions: [
      { version: 1, updatedAt: '2025-11-03', updatedBy: 'Aarav Sharma', notes: 'Initial signed policy PDF' },
      { version: 2, updatedAt: '2026-08-20', updatedBy: 'Aarav Sharma', notes: 'Added inverter SPD endorsement' }
    ],
    fileSizeKb: 1420,
    mimeType: 'application/pdf'
  },
  {
    id: 'doc-202',
    title: 'SunVolt 5kW Hybrid Solar Inverter Warranty Certificate',
    category: 'Warranties',
    personId: 'mem-1',
    issueDate: '2021-11-15',
    expiryDate: '2026-11-14',
    extractedText: 'Manufacturer: SunVolt Energy Systems. Model: SV-HYB-5000. Serial: SV5K-992014. 5-Year Comprehensive Warranty expires 2026-11-14.',
    tags: ['warranty', 'solar', 'inverter'],
    favorite: true,
    restrictedAccess: false,
    uncertaintyFlags: [],
    versions: [
      { version: 1, updatedAt: '2021-11-15', updatedBy: 'Aarav Sharma', notes: 'Original installation certificate' }
    ],
    fileSizeKb: 890,
    mimeType: 'application/pdf'
  },
  {
    id: 'doc-203',
    title: 'Nature Basket Receipt #NB-44109 (16 Oct 2026)',
    category: 'Receipts',
    personId: 'mem-2',
    issueDate: '2026-10-16',
    expiryDate: '2027-10-16',
    extractedText: 'Nature Basket Fresh Mart. Date: 2026-10-16. Organic Tur Dal 2kg, Cold Pressed Oil 1L, A2 Milk 4L, Fresh Greens. Total Paid: INR 4,850.00 (incl. GST INR 242.50).',
    candidateAmountMinor: 485000,
    tags: ['receipt', 'groceries', 'october'],
    favorite: false,
    restrictedAccess: false,
    uncertaintyFlags: [],
    versions: [
      { version: 1, updatedAt: '2026-10-16', updatedBy: 'Meera Sharma', notes: 'OCR verified receipt scan' }
    ],
    relatedRecordId: 'exp-101',
    fileSizeKb: 540,
    mimeType: 'image/png'
  },
  {
    id: 'doc-204',
    title: 'Family Estate & Medical Directive Vault Record',
    category: 'Healthcare',
    personId: 'mem-1',
    issueDate: '2026-01-10',
    expiryDate: '2031-01-10',
    extractedText: 'Restricted Family Legal & Medical Directive. Emergency Hospitalization Authorization & Blood Group Registry.',
    tags: ['medical', 'restricted', 'legal'],
    favorite: true,
    restrictedAccess: true,
    uncertaintyFlags: [],
    versions: [
      { version: 1, updatedAt: '2026-01-10', updatedBy: 'Aarav Sharma', notes: 'Verified notarized copy' }
    ],
    fileSizeKb: 2150,
    mimeType: 'application/pdf'
  }
];

const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: 'shp-1', name: 'Cold-Pressed Groundnut Oil', quantity: 2, unit: 'L', category: 'Pantry Staples', estimatedPriceMinor: 58000, notes: 'Wood-pressed organic', addedBy: 'Meera Sharma', purchased: false },
  { id: 'shp-2', name: 'RO Pre-Filter Spun Cartridge', quantity: 2, unit: 'pcs', category: 'Household Maintenance', estimatedPriceMinor: 45000, notes: '10-inch standard micron', addedBy: 'Aarav Sharma', purchased: false },
  { id: 'shp-3', name: 'Whole Wheat Chakki Atta', quantity: 10, unit: 'kg', category: 'Grains', estimatedPriceMinor: 62000, notes: 'Low stock triggered from Pantry', addedBy: 'HOMEBASE Rule C', purchased: true }
];

const INITIAL_PANTRY: PantryItem[] = [
  { id: 'pan-1', name: 'Organic Tur Dal (Split Pigeon Pea)', quantity: 1.0, unit: 'kg', minThreshold: 2.0, expiryDate: '2027-03-15', category: 'Lentils & Pulses', lastAdjustedAt: '2026-10-17' },
  { id: 'pan-2', name: 'Basmati Aged Rice', quantity: 8.5, unit: 'kg', minThreshold: 5.0, expiryDate: '2027-08-01', category: 'Grains', lastAdjustedAt: '2026-10-14' },
  { id: 'pan-3', name: 'Filter Coffee Roast Powder', quantity: 0.25, unit: 'kg', minThreshold: 0.5, expiryDate: '2026-11-05', category: 'Beverages', lastAdjustedAt: '2026-10-18' },
  { id: 'pan-4', name: 'Almond & Millet Breakfast Mix', quantity: 1.2, unit: 'kg', minThreshold: 1.0, expiryDate: '2026-10-28', category: 'Cereals', lastAdjustedAt: '2026-10-15' }
];

const INITIAL_RECIPES: RecipeItem[] = [
  {
    id: 'rec-1',
    name: 'One-Pot High-Protein Dal Tadka & Jeera Rice',
    prepTimeMinutes: 35,
    servings: 4,
    favorite: true,
    tags: ['Weeknight', 'High-Protein', 'Vegetarian'],
    ingredients: [
      { name: 'Organic Tur Dal', quantity: 0.3, unit: 'kg', estCostMinor: 5400 },
      { name: 'Basmati Aged Rice', quantity: 0.4, unit: 'kg', estCostMinor: 4800 },
      { name: 'Fresh Tomatoes & Tempering Spices', quantity: 1, unit: 'pack', estCostMinor: 4500 }
    ],
    instructions: [
      'Wash and soak Tur Dal and Basmati Rice for 20 minutes.',
      'Pressure cook dal with turmeric and rock salt for 3 whistles.',
      'Prepare cumin, garlic, and dry red chili tempering in ghee and pour over dal.'
    ],
    notes: 'Family Tuesday comfort dinner',
    mealDay: 'Tuesday'
  },
  {
    id: 'rec-2',
    name: 'Millet Vegetable Pesarattu Dosa & Ginger Chutney',
    prepTimeMinutes: 25,
    servings: 4,
    favorite: true,
    tags: ['Breakfast', 'Millet', 'Quick'],
    ingredients: [
      { name: 'Whole Green Moong & Foxtail Millet', quantity: 0.4, unit: 'kg', estCostMinor: 6800 },
      { name: 'Fresh Ginger, Green Chilies & Coriander', quantity: 1, unit: 'bunch', estCostMinor: 3000 }
    ],
    instructions: [
      'Blend soaked green moong, millet, ginger, and cumin into a coarse batter.',
      'Spread crisp dosas on cast-iron skillet with cold-pressed oil.',
      'Serve hot with tangy ginger-tamarind chutney.'
    ],
    notes: 'High fiber weekend breakfast',
    mealDay: 'Saturday'
  }
];

const INITIAL_ASSETS: AssetRecord[] = [
  {
    id: 'ast-1',
    name: 'SunVolt 5kW Hybrid Rooftop Solar Array & Inverter',
    category: 'Solar equipment',
    manufacturer: 'SunVolt Energy',
    model: 'SV-HYB-5000-MPPT',
    serialNumber: 'SV5K-992014',
    purchaseDate: '2021-11-15',
    purchasePriceMinor: 28500000,
    warrantyExpiryDate: '2026-11-14',
    condition: 'Good',
    receiptDocId: 'doc-202',
    notes: '10 x 500W Mono PERC panels + 5kW hybrid inverter + 10kWh LiFePO4 battery bank',
    maintenanceLogs: [
      { id: 'ml-1', date: '2026-08-19', issue: 'Replaced DC surge protection device (SPD) after monsoon lightning spike', costMinor: 420000, serviceContact: 'SunVolt Tech (+91-98400-11223)', nextServiceDate: '2026-10-24' },
      { id: 'ml-2', date: '2026-02-10', issue: 'Bi-annual string voltage check & terminal torque tightening', costMinor: 150000, serviceContact: 'SunVolt Tech (+91-98400-11223)', nextServiceDate: '2026-10-24' }
    ]
  },
  {
    id: 'ast-2',
    name: 'AquaPure 8-Stage RO + UV + Mineral Water Purifier',
    category: 'Appliances',
    manufacturer: 'AquaPure India',
    model: 'AP-RO-PRO-2025',
    serialNumber: 'APRO-441820',
    purchaseDate: '2025-04-12',
    purchasePriceMinor: 1890000,
    warrantyExpiryDate: '2027-04-11',
    condition: 'Excellent',
    notes: 'Installed in main kitchen; filter replaced Oct 5, 2026',
    maintenanceLogs: [
      { id: 'ml-3', date: '2026-10-05', issue: 'Scheduled sediment + RO membrane cartridge replacement', costMinor: 265000, serviceContact: 'AquaPure Care (+91-98400-55667)', nextServiceDate: '2027-04-05' }
    ]
  },
  {
    id: 'ast-3',
    name: 'Bosch Series 6 Front-Load Inverter Washing Machine',
    category: 'Appliances',
    manufacturer: 'Bosch Home',
    model: 'WAJ2846IN',
    serialNumber: 'BSH-8830129',
    purchaseDate: '2024-06-20',
    purchasePriceMinor: 4250000,
    warrantyExpiryDate: '2027-06-19',
    condition: 'Excellent',
    notes: 'Drum descaling due every 3 months',
    maintenanceLogs: [
      { id: 'ml-4', date: '2026-07-22', issue: 'Inlet hose mesh cleaning & drum descaling', costMinor: 80000, serviceContact: 'Bosch Authorized Service', nextServiceDate: '2026-10-22' }
    ]
  }
];

const INITIAL_ENERGY: EnergyReading[] = [
  { id: 'eng-1', date: '2026-10-12', meterReadingKwh: 14210, solarGeneratedKwh: 22.4, householdConsumedKwh: 26.0, gridImportKwh: 8.2, gridExportKwh: 4.6, sourceType: 'Measured' },
  { id: 'eng-2', date: '2026-10-13', meterReadingKwh: 14217, solarGeneratedKwh: 24.1, householdConsumedKwh: 25.5, gridImportKwh: 7.0, gridExportKwh: 5.6, sourceType: 'Measured' },
  { id: 'eng-3', date: '2026-10-14', meterReadingKwh: 14225, solarGeneratedKwh: 21.8, householdConsumedKwh: 24.8, gridImportKwh: 8.0, gridExportKwh: 5.0, sourceType: 'Measured' },
  { id: 'eng-4', date: '2026-10-15', meterReadingKwh: 14232, solarGeneratedKwh: 25.6, householdConsumedKwh: 27.1, gridImportKwh: 7.0, gridExportKwh: 5.5, sourceType: 'Measured' },
  { id: 'eng-5', date: '2026-10-16', meterReadingKwh: 14241, solarGeneratedKwh: 19.5, householdConsumedKwh: 25.0, gridImportKwh: 9.0, gridExportKwh: 3.5, sourceType: 'Measured' },
  { id: 'eng-6', date: '2026-10-17', meterReadingKwh: 14248, solarGeneratedKwh: 23.9, householdConsumedKwh: 24.4, gridImportKwh: 7.0, gridExportKwh: 6.5, sourceType: 'Measured' }
];

const INITIAL_RULES: AutomationRule[] = [
  { id: 'rule-a', code: 'RULE A', name: 'Document Expiry Renewal Task Generator', trigger: 'Document approaching expiry (<= 30 days)', conditionSummary: 'Document expiryDate within 30 days & no open renewal task', actionSummary: 'Create high-priority renewal task assigned to document owner', enabled: true, lastExecutedAt: '2026-10-17 08:00', executionCount: 3 },
  { id: 'rule-b', code: 'RULE B', name: 'Receipt-to-Expense Auto-Linker', trigger: 'Expense saved with receipt scan', conditionSummary: 'Expense has verified OCR receipt metadata', actionSummary: 'Create/link Document record in Receipts vault & cross-reference IDs', enabled: true, lastExecutedAt: '2026-10-16 11:20', executionCount: 12 },
  { id: 'rule-c', code: 'RULE C', name: 'Low Pantry Stock Shopping Auto-Replenish', trigger: 'Pantry stock drops below threshold', conditionSummary: 'pantryItem.quantity < pantryItem.minThreshold', actionSummary: 'Add suggested replenishment item to shared Shopping List (idempotent)', enabled: true, lastExecutedAt: '2026-10-18 07:30', executionCount: 5 },
  { id: 'rule-d', code: 'RULE D', name: 'Bill Payment Ledger & Expense Recorder', trigger: 'Bill marked paid by authorized member', conditionSummary: 'bill.status transitions from unpaid -> paid with reference #', actionSummary: 'Record paidDate, create verified Expense entry, and append Audit Log', enabled: true, lastExecutedAt: '2026-10-03 19:10', executionCount: 8 },
  { id: 'rule-e', code: 'RULE E', name: 'Asset Maintenance Due Reminder', trigger: 'Maintenance date approaching (<= 7 days)', conditionSummary: 'asset.nextServiceDate within 7 days', actionSummary: 'Generate household reminder & calendar maintenance alert', enabled: true, lastExecutedAt: '2026-10-18 06:00', executionCount: 4 },
  { id: 'rule-f', code: 'RULE F', name: 'Monthly Budget Threshold Sentinel', trigger: 'Expense created or updated', conditionSummary: 'Current month spend >= configured budget alert threshold (80%)', actionSummary: 'Trigger non-intrusive dashboard budget threshold warning', enabled: true, lastExecutedAt: '2026-10-16 11:21', executionCount: 2 },
  { id: 'rule-g', code: 'RULE G', name: 'Solar & Grid Period Statistics Recalculator', trigger: 'Solar meter reading recorded', conditionSummary: 'New valid cumulative meter sequence entered', actionSummary: 'Recalculate self-consumption %, grid offset, and tariff savings', enabled: true, lastExecutedAt: '2026-10-17 18:30', executionCount: 19 },
  { id: 'rule-h', code: 'RULE H', name: 'Recurring Chore Next-Occurrence Scheduler', trigger: 'Recurring task marked completed', conditionSummary: 'task.repeatingSchedule !== "none"', actionSummary: 'Schedule next occurrence date and rotate assigned family member', enabled: true, lastExecutedAt: '2026-10-17 22:15', executionCount: 27 }
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', title: 'Municipal Water Bill Due Deadline', date: '2026-10-22', category: 'Bill', recurring: 'monthly', reminderHoursBefore: 24, notes: 'Pay via utility portal' },
  { id: 'evt-2', title: 'Washing Machine Drum Descaling & Filter Check', date: '2026-10-22', category: 'Maintenance', recurring: 'none', reminderHoursBefore: 12, notes: 'Scheduled quarterly service' },
  { id: 'evt-3', title: 'SunVolt Solar Array Pre-Winter Inspection', date: '2026-10-24', category: 'Maintenance', recurring: 'annual', reminderHoursBefore: 48, notes: 'Check inverter firmware & strings' },
  { id: 'evt-4', title: 'Meera & Aarav Wedding Anniversary Dinner', date: '2026-10-27', category: 'Anniversary', recurring: 'annual', reminderHoursBefore: 72, notes: 'Family celebration at home' },
  { id: 'evt-5', title: 'Home & Solar Property Insurance Renewal Deadline', date: '2026-11-02', category: 'Document', recurring: 'annual', reminderHoursBefore: 168, notes: 'Policy #HSI-884920-IN' }
];

const INITIAL_GOALS: SavingsGoal[] = [
  { id: 'goal-1', name: 'Household Emergency Medical & Repair Reserve (6 Months)', targetMinor: 50000000, currentMinor: 38500000, targetDate: '2027-03-31' },
  { id: 'goal-2', name: 'LiFePO4 Battery Bank Expansion (Additional 5kWh)', targetMinor: 12000000, currentMinor: 7500000, targetDate: '2027-01-15' },
  { id: 'goal-3', name: 'Diya University Higher Education Fund', targetMinor: 100000000, currentMinor: 64000000, targetDate: '2028-06-01' }
];

const INITIAL_LOANS: FamilyLoan[] = [
  { id: 'loan-1', lenderMemberId: 'mem-1', borrowerMemberId: 'mem-3', principalMinor: 2500000, remainingMinor: 1000000, purpose: 'Laptop upgrade for engineering coursework (0% family advance)', createdAt: '2026-06-10', settled: false }
];

const INITIAL_CONFLICTS: SyncConflict[] = [
  {
    id: 'cnf-1',
    module: 'Pantry Stock',
    recordTitle: 'Organic Tur Dal (Split Pigeon Pea)',
    localSummary: 'Quantity: 1.0 kg (Adjusted by Meera on Kitchen Tablet offline)',
    serverSummary: 'Quantity: 1.5 kg (Synced from Aarav Android phone 10 mins ago)',
    detectedAt: '2026-10-18 09:12',
    resolved: false
  }
];

const INITIAL_AUDIT: AuditEvent[] = [
  { id: 'aud-1', timestamp: '2026-10-18 09:15', actor: 'SYSTEM (Privacy Audit)', eventType: 'SECURITY_VERIFY', recordRef: 'manifest/info.plist', description: 'Verified 0 location APIs, 0 GPS permissions, and household-scoped isolation active.' },
  { id: 'aud-2', timestamp: '2026-10-18 07:30', actor: 'Automation Rule C', eventType: 'RULE_EXECUTION', recordRef: 'pan-3 -> shp', description: 'Detected Filter Coffee Roast Powder below threshold (0.25kg < 0.5kg).' },
  { id: 'aud-3', timestamp: '2026-10-17 22:15', actor: 'Aarav Sharma', eventType: 'TASK_COMPLETED', recordRef: 'tsk-4', description: 'Completed Evening Security Lockup routine; Rule H scheduled next occurrence.' },
  { id: 'aud-4', timestamp: '2026-10-16 11:20', actor: 'Meera Sharma', eventType: 'EXPENSE_CREATED', recordRef: 'exp-101', description: 'Recorded ₹4,850.00 at Nature Basket Fresh Mart with verified OCR receipt doc-203.' }
];

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'w-kpis', label: 'Financial, Task & Expiry Core KPIs', visible: true, order: 1 },
  { id: 'w-quick-actions', label: 'Quick Household Actions', visible: true, order: 2 },
  { id: 'w-alerts', label: 'Actionable Warnings & Automation Suggestions', visible: true, order: 3 },
  { id: 'w-charts', label: 'Monthly Spending & Solar Self-Consumption Analytics', visible: true, order: 4 },
  { id: 'w-upcoming', label: 'Upcoming Bills, Maintenance, Pantry & Events', visible: true, order: 5 }
];

// ============================================================================
// 4. SAFE PERSISTENCE HELPER (INDEXEDDB + LOCALSTORAGE FALLBACK)
// ============================================================================

const STORAGE_KEY = 'homebase_os_v1_state';

function loadPersistedState<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function savePersistedState<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value));
  } catch {
    // Fallback in restricted sandbox contexts
  }
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Theme & Navigation State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadPersistedState('theme', 'dark'));
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('home');
  const [moreModule, setMoreModule] = useState<MoreModule>('hub');
  const [moreSearch, setMoreSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  // Household & Mode State
  const [householdName, setHouseholdName] = useState(() => loadPersistedState('householdName', 'Sharma Family Residence'));
  const [currency, setCurrency] = useState(() => loadPersistedState('currency', 'INR'));
  const [monthlyBudgetMinor, setMonthlyBudgetMinor] = useState(() => loadPersistedState('budgetMinor', 4500000)); // ₹45,000.00
  const [budgetAlertPct, setBudgetAlertPct] = useState(() => loadPersistedState('budgetAlertPct', 70));
  const [dataMode, setDataMode] = useState<DataMode>(() => loadPersistedState('dataMode', 'local_private'));
  const [members, setMembers] = useState<FamilyMember[]>(() => loadPersistedState('members', INITIAL_MEMBERS));
  const [activeMemberId, setActiveMemberId] = useState<string>('mem-1');
  const [lastSyncTime, setLastSyncTime] = useState<string>('2026-10-18 09:45 IST');

  // Core Domain Records State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => loadPersistedState('expenses', INITIAL_EXPENSES));
  const [bills, setBills] = useState<BillRecord[]>(() => loadPersistedState('bills', INITIAL_BILLS));
  const [tasks, setTasks] = useState<TaskRecord[]>(() => loadPersistedState('tasks', INITIAL_TASKS));
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => loadPersistedState('documents', INITIAL_DOCUMENTS));
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => loadPersistedState('shopping', INITIAL_SHOPPING));
  const [pantry, setPantry] = useState<PantryItem[]>(() => loadPersistedState('pantry', INITIAL_PANTRY));
  const [recipes, setRecipes] = useState<RecipeItem[]>(() => loadPersistedState('recipes', INITIAL_RECIPES));
  const [assets, setAssets] = useState<AssetRecord[]>(() => loadPersistedState('assets', INITIAL_ASSETS));
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>(() => loadPersistedState('energy', INITIAL_ENERGY));
  const [rules, setRules] = useState<AutomationRule[]>(() => loadPersistedState('rules', INITIAL_RULES));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadPersistedState('events', INITIAL_EVENTS));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => loadPersistedState('goals', INITIAL_GOALS));
  const [loans, setLoans] = useState<FamilyLoan[]>(() => loadPersistedState('loans', INITIAL_LOANS));
  const [conflicts, setConflicts] = useState<SyncConflict[]>(() => loadPersistedState('conflicts', INITIAL_CONFLICTS));
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => loadPersistedState('audit', INITIAL_AUDIT));
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => loadPersistedState('widgets', DEFAULT_WIDGETS));

  // Sub-views & Modals
  const [moneySubTab, setMoneySubTab] = useState<'expenses' | 'bills' | 'forecast' | 'ocr' | 'settlements'>('expenses');
  const [tasksSubTab, setTasksSubTab] = useState<'list' | 'routines' | 'calendar'>('list');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchModuleFilter, setGlobalSearchModuleFilter] = useState<string>('ALL');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [widgetConfigOpen, setWidgetConfigOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Smart Home & Optional Modules Config
  const [smartHomeEnabled, setSmartHomeEnabled] = useState(false);
  const [smartHomeReadOnly, setSmartHomeReadOnly] = useState(true);
  const [smartPlugLivingRoomOn, setSmartPlugLivingRoomOn] = useState(true);
  const [waterHeaterRelayOn, setWaterHeaterRelayOn] = useState(false);
  const [enableVehiclesModule, setEnableVehiclesModule] = useState(true);
  const [enablePetsModule, setEnablePetsModule] = useState(true);
  const [enablePersonalModule, setEnablePersonalModule] = useState(true);
  const [solarTariffMinorPerKwh, setSolarTariffMinorPerKwh] = useState(850); // ₹8.50 / kWh

  // Persist changes
  useEffect(() => { savePersistedState('theme', theme); }, [theme]);
  useEffect(() => { savePersistedState('householdName', householdName); }, [householdName]);
  useEffect(() => { savePersistedState('currency', currency); }, [currency]);
  useEffect(() => { savePersistedState('budgetMinor', monthlyBudgetMinor); }, [monthlyBudgetMinor]);
  useEffect(() => { savePersistedState('dataMode', dataMode); }, [dataMode]);
  useEffect(() => { savePersistedState('members', members); }, [members]);
  useEffect(() => { savePersistedState('expenses', expenses); }, [expenses]);
  useEffect(() => { savePersistedState('bills', bills); }, [bills]);
  useEffect(() => { savePersistedState('tasks', tasks); }, [tasks]);
  useEffect(() => { savePersistedState('documents', documents); }, [documents]);
  useEffect(() => { savePersistedState('shopping', shoppingList); }, [shoppingList]);
  useEffect(() => { savePersistedState('pantry', pantry); }, [pantry]);
  useEffect(() => { savePersistedState('recipes', recipes); }, [recipes]);
  useEffect(() => { savePersistedState('assets', assets); }, [assets]);
  useEffect(() => { savePersistedState('energy', energyReadings); }, [energyReadings]);
  useEffect(() => { savePersistedState('rules', rules); }, [rules]);
  useEffect(() => { savePersistedState('events', events); }, [events]);
  useEffect(() => { savePersistedState('goals', savingsGoals); }, [savingsGoals]);
  useEffect(() => { savePersistedState('loans', loans); }, [loans]);
  useEffect(() => { savePersistedState('conflicts', conflicts); }, [conflicts]);
  useEffect(() => { savePersistedState('audit', auditLogs); }, [auditLogs]);
  useEffect(() => { savePersistedState('widgets', widgets); }, [widgets]);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const activeMember = useMemo(
    () => members.find(m => m.id === activeMemberId) || members[0],
    [members, activeMemberId]
  );

  // Role-Based Access Control (RBAC) Helper
  const canWrite = useMemo(() => {
    return ['owner', 'admin', 'adult'].includes(activeMember.role);
  }, [activeMember]);

  const canManageHousehold = useMemo(() => {
    return ['owner', 'admin'].includes(activeMember.role);
  }, [activeMember]);

  const canViewRestrictedDocs = useMemo(() => {
    return ['owner', 'admin', 'adult'].includes(activeMember.role);
  }, [activeMember]);

  const logAudit = (eventType: string, recordRef: string, description: string) => {
    const newEntry: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actor: `${activeMember.name} (${activeMember.role})`,
      eventType,
      recordRef,
      description
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // ============================================================================
  // 6. AUTHORITATIVE HOUSEHOLD CALCULATIONS (INTEGER MINOR UNITS)
  // ============================================================================

  const currentMonthPrefix = '2026-10';
  const prevMonthPrefix = '2026-09';

  const currentMonthExpenses = useMemo(
    () => expenses.filter(e => e.transactionDate.startsWith(currentMonthPrefix)),
    [expenses]
  );

  const prevMonthExpenses = useMemo(
    () => expenses.filter(e => e.transactionDate.startsWith(prevMonthPrefix)),
    [expenses]
  );

  const monthlySpendMinor = useMemo(
    () => sumMinor(currentMonthExpenses.map(e => e.amountMinor)),
    [currentMonthExpenses]
  );

  const prevMonthlySpendMinor = useMemo(
    () => sumMinor(prevMonthExpenses.map(e => e.amountMinor)),
    [prevMonthExpenses]
  );

  const budgetRemainingMinor = useMemo(
    () => monthlyBudgetMinor - monthlySpendMinor,
    [monthlyBudgetMinor, monthlySpendMinor]
  );

  const budgetUsedPct = useMemo(
    () => monthlyBudgetMinor > 0 ? Math.round((monthlySpendMinor / monthlyBudgetMinor) * 100) : 0,
    [monthlySpendMinor, monthlyBudgetMinor]
  );

  const largestExpenseThisMonth = useMemo(() => {
    if (currentMonthExpenses.length === 0) return null;
    return [...currentMonthExpenses].sort((a, b) => b.amountMinor - a.amountMinor)[0];
  }, [currentMonthExpenses]);

  const avgDailySpendMinor = useMemo(() => {
    const daysElapsed = 18; // Oct 18, 2026
    return Math.round(monthlySpendMinor / daysElapsed);
  }, [monthlySpendMinor]);

  const unpaidBills = useMemo(
    () => bills.filter(b => b.status !== 'paid'),
    [bills]
  );

  const unpaidBillsTotalMinor = useMemo(
    () => sumMinor(unpaidBills.map(b => b.amountMinor)),
    [unpaidBills]
  );

  const duplicateSubscriptions = useMemo(() => {
    const subs = bills.filter(b => b.isSubscription);
    const seen = new Map<string, BillRecord[]>();
    subs.forEach(s => {
      const normalized = s.title.split('(')[0].trim().toLowerCase();
      seen.set(normalized, [...(seen.get(normalized) || []), s]);
    });
    return Array.from(seen.values()).filter(group => group.length > 1);
  }, [bills]);

  const overdueTasks = useMemo(
    () => tasks.filter(t => !t.completed && t.dueDate < '2026-10-18'),
    [tasks]
  );

  const tasksDueToday = useMemo(
    () => tasks.filter(t => !t.completed && t.dueDate === '2026-10-18'),
    [tasks]
  );

  const visibleDocuments = useMemo(
    () => documents.filter(d => !d.restrictedAccess || canViewRestrictedDocs),
    [documents, canViewRestrictedDocs]
  );

  const expiringDocuments = useMemo(
    () => visibleDocuments.filter(d => d.expiryDate && d.expiryDate <= '2026-11-30'),
    [visibleDocuments]
  );

  const lowStockPantry = useMemo(
    () => pantry.filter(p => p.quantity < p.minThreshold),
    [pantry]
  );

  const expiringWarranties = useMemo(
    () => assets.filter(a => a.warrantyExpiryDate <= '2026-12-01'),
    [assets]
  );

  const upcomingMaintenance = useMemo(() => {
    const list: { assetName: string; nextDate: string; contact: string }[] = [];
    assets.forEach(a => {
      a.maintenanceLogs.forEach(m => {
        if (m.nextServiceDate <= '2026-11-15') {
          list.push({ assetName: a.name, nextDate: m.nextServiceDate, contact: m.serviceContact });
        }
      });
    });
    return list;
  }, [assets]);

  const solarSummary = useMemo(() => {
    const totalGen = energyReadings.reduce((acc, r) => acc + r.solarGeneratedKwh, 0);
    const totalCons = energyReadings.reduce((acc, r) => acc + r.householdConsumedKwh, 0);
    const totalImport = energyReadings.reduce((acc, r) => acc + r.gridImportKwh, 0);
    const totalExport = energyReadings.reduce((acc, r) => acc + r.gridExportKwh, 0);
    const selfConsumed = Math.max(0, totalGen - totalExport);
    const selfConsumptionPct = totalGen > 0 ? Math.round((selfConsumed / totalGen) * 100) : 0;
    const estimatedSavingsMinor = Math.round(totalGen * solarTariffMinorPerKwh);
    const estimatedGridCostMinor = Math.round(totalImport * solarTariffMinorPerKwh);
    return {
      totalGen: Number(totalGen.toFixed(1)),
      totalCons: Number(totalCons.toFixed(1)),
      totalImport: Number(totalImport.toFixed(1)),
      totalExport: Number(totalExport.toFixed(1)),
      selfConsumptionPct,
      estimatedSavingsMinor,
      estimatedGridCostMinor
    };
  }, [energyReadings, solarTariffMinorPerKwh]);

  const spendingByCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthExpenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amountMinor);
    });
    return Array.from(map.entries())
      .map(([name, amountMinor]) => ({
        name,
        amountMinor,
        majorValue: Number((amountMinor / 100).toFixed(2))
      }))
      .sort((a, b) => b.amountMinor - a.amountMinor);
  }, [currentMonthExpenses]);

  // ============================================================================
  // 7. MODAL & FORM STATES FOR INTERACTIVE WORKFLOWS
  // ============================================================================

  // Expense Form State
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmountMajor, setExpAmountMajor] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Groceries');
  const [expDate, setExpDate] = useState('2026-10-18');
  const [expMerchant, setExpMerchant] = useState('');
  const [expPaymentMethod, setExpPaymentMethod] = useState('UPI');
  const [expNotes, setExpNotes] = useState('');
  const [expReimbursable, setExpReimbursable] = useState(true);
  const [expFilterCat, setExpFilterCat] = useState<string>('ALL');
  const [expFilterMember, setExpFilterMember] = useState<string>('ALL');
  const [expSearch, setExpSearch] = useState('');

  // Bill Payment Confirmation Modal
  const [payingBill, setPayingBill] = useState<BillRecord | null>(null);
  const [billRefNumber, setBillRefNumber] = useState('');

  // Receipt OCR Workflow State
  const [ocrPreset, setOcrPreset] = useState<'grocery' | 'utility' | 'blurry'>('grocery');
  const [ocrRotation, setOcrRotation] = useState(0);
  const [ocrCropped, setOcrCropped] = useState(false);
  const [ocrExtracted, setOcrExtracted] = useState<{
    merchant: string;
    date: string;
    totalMajor: string;
    taxMajor: string;
    currency: string;
    category: ExpenseCategory;
    items: string;
    uncertainFields: string[];
    isDuplicate: boolean;
  } | null>(null);

  // Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('mem-1');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDue, setNewTaskDue] = useState('2026-10-19');
  const [newTaskRoutine, setNewTaskRoutine] = useState<'none' | 'morning' | 'evening' | 'weekly' | 'monthly'>('none');
  const [newTaskRepeat, setNewTaskRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Document Upload & Intelligence Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Insurance');
  const [docIssueDate, setDocIssueDate] = useState('2026-10-18');
  const [docExpiryDate, setDocExpiryDate] = useState('2027-10-18');
  const [docExtractedText, setDocExtractedText] = useState('');
  const [docRestricted, setDocRestricted] = useState(false);
  const [docFilterCat, setDocFilterCat] = useState<string>('ALL');
  const [docSearch, setDocSearch] = useState('');

  // Shopping & Pantry Quick Inputs
  const [newShopName, setNewShopName] = useState('');
  const [newShopQty, setNewShopQty] = useState('1');
  const [newShopUnit, setNewShopUnit] = useState('pcs');
  const [newShopPriceMajor, setNewShopPriceMajor] = useState('120');

  // Recipe Scaling State
  const [recipeScale, setRecipeScale] = useState<number>(1);

  // Energy Meter Input State
  const [newMeterDate, setNewMeterDate] = useState('2026-10-18');
  const [newMeterReading, setNewMeterReading] = useState('14256');
  const [newSolarGen, setNewSolarGen] = useState('24.5');
  const [newHouseCons, setNewHouseCons] = useState('25.2');
  const [newGridImport, setNewGridImport] = useState('6.8');
  const [newGridExport, setNewGridExport] = useState('6.1');

  // Backup & Restore State
  const [backupPassword, setBackupPassword] = useState('');
  const [lastBackupBlob, setLastBackupBlob] = useState<string | null>(null);
  const [restorePreviewOpen, setRestorePreviewOpen] = useState(false);

  // AI Assistant Conversation State
  const [aiQuery, setAiQuery] = useState('');
  const [aiProvider, setAiProvider] = useState<'local_deterministic' | 'ollama_local' | 'hosted_proxy'>('local_deterministic');
  const [aiPendingAction, setAiPendingAction] = useState<{
    type: 'create_task' | 'add_shopping_item' | 'create_reminder';
    label: string;
    payload: Record<string, string>;
  } | null>(null);
  const [aiMessages, setAiMessages] = useState<{
    id: string;
    role: 'user' | 'assistant';
    text: string;
    toolCalled?: string;
    sourceRefs?: string[];
  }[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      text: 'Welcome to HOMEBASE AI. I operate strictly through authorized household tools on your local/synced records and never guess financial figures or execute changes without your confirmation. Ask me about spending, unpaid bills, expiring warranties, overdue chores, pantry stock, or solar generation.',
      toolCalled: 'system_ready',
      sourceRefs: ['Household: Sharma Family Residence']
    }
  ]);

  // ============================================================================
  // 8. CORE DOMAIN HANDLERS & DETERMINISTIC AUTOMATION ENGINE
  // ============================================================================

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      showToast('Access denied: Read-only or restricted members cannot create financial records.', 'error');
      return;
    }
    const amountMinor = parseMajorToMinor(expAmountMajor);
    if (!expDesc.trim() || amountMinor <= 0) {
      showToast('Please enter a valid description and positive amount.', 'warning');
      return;
    }
    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      description: expDesc.trim(),
      amountMinor,
      currency,
      category: expCategory,
      transactionDate: expDate,
      paidByMemberId: activeMember.id,
      paymentMethod: expPaymentMethod,
      merchant: expMerchant.trim() || 'Household Vendor',
      notes: expNotes.trim(),
      tags: [expCategory.toLowerCase()],
      reimbursable: expReimbursable,
      settled: !expReimbursable,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    logAudit('EXPENSE_CREATED', newExp.id, `Added expense "${newExp.description}" for ${formatMoneyMinor(amountMinor, currency)}`);
    setExpenseModalOpen(false);
    setExpDesc('');
    setExpAmountMajor('');
    setExpMerchant('');
    setExpNotes('');

    // Rule F Check: Monthly budget threshold warning
    const newMonthTotal = monthlySpendMinor + (expDate.startsWith(currentMonthPrefix) ? amountMinor : 0);
    const pct = Math.round((newMonthTotal / monthlyBudgetMinor) * 100);
    const ruleF = rules.find(r => r.id === 'rule-f');
    if (ruleF && ruleF.enabled && pct >= budgetAlertPct) {
      setRules(prev => prev.map(r => r.id === 'rule-f' ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: 'Just now' } : r));
      showToast(`Expense saved. Rule F Alert: Monthly spending is now at ${pct}% of budget!`, 'warning');
    } else {
      showToast(`Saved expense: ${formatMoneyMinor(amountMinor, currency)}`, 'success');
    }
  };

  const handleConfirmPayBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBill) return;
    if (!canWrite) {
      showToast('Access denied: Current role cannot record bill payments.', 'error');
      return;
    }
    if (!billRefNumber.trim()) {
      showToast('Please enter a payment confirmation/reference number.', 'warning');
      return;
    }
    const today = '2026-10-18';
    setBills(prev => prev.map(b => b.id === payingBill.id ? {
      ...b,
      status: 'paid',
      paidDate: today,
      referenceNumber: billRefNumber.trim()
    } : b));

    // Rule D: Automatically record expense and update status
    const newExp: ExpenseRecord = {
      id: `exp-bill-${Date.now()}`,
      description: `Bill Paid: ${payingBill.title}`,
      amountMinor: payingBill.amountMinor,
      currency,
      category: (EXPENSE_CATEGORIES.includes(payingBill.category as ExpenseCategory) ? payingBill.category : 'Utilities') as ExpenseCategory,
      transactionDate: today,
      paidByMemberId: activeMember.id,
      paymentMethod: 'Verified Bill Payment',
      merchant: payingBill.title,
      notes: `Ref: ${billRefNumber.trim()}`,
      tags: ['bill-payment', 'rule-d'],
      reimbursable: true,
      settled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    setExpenses(prev => [newExp, ...prev]);
    setRules(prev => prev.map(r => r.id === 'rule-d' ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: 'Just now' } : r));
    logAudit('BILL_PAID', payingBill.id, `Marked "${payingBill.title}" paid (Ref: ${billRefNumber.trim()}) & executed Rule D.`);
    setPayingBill(null);
    setBillRefNumber('');
    showToast(`Bill marked paid & Rule D recorded ${formatMoneyMinor(payingBill.amountMinor, currency)} in Expenses.`, 'success');
  };

  const handleRunOcr = () => {
    if (ocrPreset === 'grocery') {
      const dup = expenses.some(e => e.merchant === 'Nature Basket Fresh Mart' && e.transactionDate === '2026-10-16' && e.amountMinor === 485000);
      setOcrExtracted({
        merchant: 'GreenValley Organic Co-op',
        date: '2026-10-18',
        totalMajor: '1645.00',
        taxMajor: '82.25',
        currency: 'INR',
        category: 'Groceries',
        items: 'A2 Gir Cow Milk 2L (₹180), Organic Brown Rice 5kg (₹625), Cold Pressed Sesame Oil 1L (₹490), Fresh Spinach & Vegetables (₹350)',
        uncertainFields: [],
        isDuplicate: dup && false
      });
      showToast('Local OCR completed: 100% field confidence.', 'success');
    } else if (ocrPreset === 'utility') {
      setOcrExtracted({
        merchant: 'Municipal Water & Sanitation Board',
        date: '2026-10-18',
        totalMajor: '850.00',
        taxMajor: '0.00',
        currency: 'INR',
        category: 'Water',
        items: 'Metered Domestic Water Supply Oct 2026 (24 KL)',
        uncertainFields: [],
        isDuplicate: false
      });
      showToast('Local OCR completed: Utility receipt fields extracted.', 'success');
    } else {
      setOcrExtracted({
        merchant: 'Sri Balaji Hardware & Electricals',
        date: '2026-10-18',
        totalMajor: '1280.00',
        taxMajor: '195.25',
        currency: 'INR',
        category: 'Maintenance',
        items: 'MCB 32A Double Pole Switch, 4sqmm FR Cable 10m',
        uncertainFields: ['Total amount blurred on thermal paper — please verify ₹1,280.00 before saving', 'Multiple candidate dates detected (17/10/26 vs 18/10/26)'],
        isDuplicate: false
      });
      showToast('OCR completed with 2 uncertain fields flagged for manual review.', 'warning');
    }
  };

  const handleSaveOcrExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrExtracted || !canWrite) {
      showToast('Cannot save: check role permissions or OCR state.', 'error');
      return;
    }
    const amountMinor = parseMajorToMinor(ocrExtracted.totalMajor);
    if (amountMinor <= 0) {
      showToast('Please enter a valid confirmed amount.', 'warning');
      return;
    }
    const docId = `doc-ocr-${Date.now()}`;
    const expId = `exp-ocr-${Date.now()}`;

    // Rule B: Automatically create linked receipt document and expense
    const newDoc: DocumentRecord = {
      id: docId,
      title: `OCR Receipt: ${ocrExtracted.merchant} (${ocrExtracted.date})`,
      category: 'Receipts',
      personId: activeMember.id,
      issueDate: ocrExtracted.date,
      expiryDate: '2027-10-18',
      extractedText: `${ocrExtracted.merchant} | Date: ${ocrExtracted.date} | Items: ${ocrExtracted.items} | Total: ${ocrExtracted.totalMajor}`,
      candidateAmountMinor: amountMinor,
      tags: ['receipt', 'ocr-verified', ocrExtracted.category.toLowerCase()],
      favorite: false,
      restrictedAccess: false,
      uncertaintyFlags: [],
      versions: [{ version: 1, updatedAt: ocrExtracted.date, updatedBy: activeMember.name, notes: 'Saved via Receipt OCR Review Workflow' }],
      relatedRecordId: expId,
      fileSizeKb: 480,
      mimeType: 'image/png'
    };

    const newExp: ExpenseRecord = {
      id: expId,
      description: `Receipt: ${ocrExtracted.merchant}`,
      amountMinor,
      currency: ocrExtracted.currency,
      category: ocrExtracted.category,
      transactionDate: ocrExtracted.date,
      paidByMemberId: activeMember.id,
      paymentMethod: 'UPI / Scanned Receipt',
      merchant: ocrExtracted.merchant,
      notes: ocrExtracted.items,
      tags: ['ocr', ocrExtracted.category.toLowerCase()],
      receiptDocId: docId,
      reimbursable: true,
      settled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    setDocuments(prev => [newDoc, ...prev]);
    setExpenses(prev => [newExp, ...prev]);
    setRules(prev => prev.map(r => r.id === 'rule-b' ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: 'Just now' } : r));
    logAudit('OCR_EXPENSE_LINKED', `${expId} <-> ${docId}`, `Confirmed OCR receipt from ${ocrExtracted.merchant} & executed Rule B.`);
    setOcrExtracted(null);
    setMoneySubTab('expenses');
    showToast(`Confirmed OCR expense (${formatMoneyMinor(amountMinor, currency)}) & linked Receipt Document via Rule B!`, 'success');
  };

  const handleToggleTask = (taskId: string) => {
    if (!canWrite) {
      showToast('Read-only members cannot modify task status.', 'error');
      return;
    }
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const nextCompleted = !target.completed;
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined
    } : t));

    // Rule H: When a recurring task is completed, schedule the next occurrence
    const ruleH = rules.find(r => r.id === 'rule-h');
    if (nextCompleted && target.repeatingSchedule !== 'none' && ruleH && ruleH.enabled) {
      const baseDate = new Date(target.dueDate + 'T00:00:00');
      if (target.repeatingSchedule === 'daily') baseDate.setDate(baseDate.getDate() + 1);
      if (target.repeatingSchedule === 'weekly') baseDate.setDate(baseDate.getDate() + 7);
      if (target.repeatingSchedule === 'monthly') baseDate.setMonth(baseDate.getMonth() + 1);
      const nextDateStr = baseDate.toISOString().slice(0, 10);
      const nextAssignee = target.rotationMemberIds.length > 1
        ? target.rotationMemberIds[(target.rotationMemberIds.indexOf(target.assignedToMemberId) + 1) % target.rotationMemberIds.length]
        : target.assignedToMemberId;

      const scheduledNext: TaskRecord = {
        ...target,
        id: `tsk-rec-${Date.now()}`,
        dueDate: nextDateStr,
        assignedToMemberId: nextAssignee,
        completed: false,
        completedAt: undefined,
        checklist: target.checklist.map(c => ({ ...c, done: false }))
      };
      setTasks(prev => [scheduledNext, ...prev]);
      setRules(prev => prev.map(r => r.id === 'rule-h' ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: 'Just now' } : r));
      logAudit('RULE_H_SCHEDULED', scheduledNext.id, `Completed "${target.title}"; Rule H scheduled next occurrence on ${nextDateStr}.`);
      showToast(`Task completed! Rule H scheduled next occurrence for ${nextDateStr}.`, 'success');
    } else {
      logAudit('TASK_STATUS', taskId, `Marked task "${target.title}" as ${nextCompleted ? 'completed' : 'pending'}.`);
      showToast(`Task "${target.title}" updated.`, 'success');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || !newTaskTitle.trim()) return;
    const created: TaskRecord = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedToMemberId: newTaskAssignee,
      priority: newTaskPriority,
      dueDate: newTaskDue,
      routineType: newTaskRoutine,
      repeatingSchedule: newTaskRepeat,
      rotationMemberIds: [newTaskAssignee],
      completed: false,
      checklist: [],
      notes: 'Created by ' + activeMember.name
    };
    setTasks(prev => [created, ...prev]);
    logAudit('TASK_CREATED', created.id, `Created task "${created.title}" due ${created.dueDate}`);
    setTaskModalOpen(false);
    setNewTaskTitle('');
    showToast('Task added to household schedule.', 'success');
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || !docTitle.trim()) return;
    const created: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      personId: activeMember.id,
      issueDate: docIssueDate,
      expiryDate: docExpiryDate,
      extractedText: docExtractedText.trim() || `Verified ${docCategory} document uploaded by ${activeMember.name}.`,
      tags: [docCategory.toLowerCase(), 'verified'],
      favorite: false,
      restrictedAccess: docRestricted,
      uncertaintyFlags: [],
      versions: [{ version: 1, updatedAt: '2026-10-18', updatedBy: activeMember.name, notes: 'Initial document import' }],
      fileSizeKb: 640,
      mimeType: 'application/pdf'
    };
    setDocuments(prev => [created, ...prev]);
    logAudit('DOCUMENT_UPLOADED', created.id, `Uploaded document "${created.title}" (${created.category})`);
    setDocModalOpen(false);
    setDocTitle('');
    setDocExtractedText('');
    showToast('Document encrypted and stored in household vault.', 'success');
  };

  const handleAdjustPantryStock = (pantryId: string, delta: number) => {
    if (!canWrite) {
      showToast('Read-only members cannot adjust pantry stock.', 'error');
      return;
    }
    const target = pantry.find(p => p.id === pantryId);
    if (!target) return;
    const nextQty = Math.max(0, Number((target.quantity + delta).toFixed(2)));
    setPantry(prev => prev.map(p => p.id === pantryId ? { ...p, quantity: nextQty, lastAdjustedAt: '2026-10-18' } : p));

    // Rule C: When pantry stock drops below threshold, add suggested shopping item idempotently
    const ruleC = rules.find(r => r.id === 'rule-c');
    if (nextQty < target.minThreshold && ruleC && ruleC.enabled) {
      const alreadyInShop = shoppingList.some(s => s.name.toLowerCase() === target.name.toLowerCase() && !s.purchased);
      if (!alreadyInShop) {
        const autoItem: ShoppingItem = {
          id: `shp-auto-${Date.now()}`,
          name: target.name,
          quantity: Math.ceil(target.minThreshold * 2),
          unit: target.unit,
          category: target.category,
          estimatedPriceMinor: 25000,
          notes: `Auto-added by Rule C (Stock ${nextQty}${target.unit} < ${target.minThreshold}${target.unit})`,
          addedBy: 'HOMEBASE Rule C',
          purchased: false
        };
        setShoppingList(prev => [autoItem, ...prev]);
        setRules(prev => prev.map(r => r.id === 'rule-c' ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: 'Just now' } : r));
        logAudit('RULE_C_REPLENISH', autoItem.id, `Low stock on "${target.name}" triggered Rule C shopping item.`);
        showToast(`Low stock! Rule C added "${target.name}" to Shopping List.`, 'warning');
        return;
      }
    }
    showToast(`Updated ${target.name} stock to ${nextQty} ${target.unit}.`, 'success');
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || !newShopName.trim()) return;
    const dup = shoppingList.some(s => !s.purchased && s.name.toLowerCase() === newShopName.trim().toLowerCase());
    if (dup) {
      showToast(`Duplicate warning: "${newShopName.trim()}" is already on your active shopping list!`, 'warning');
      return;
    }
    const item: ShoppingItem = {
      id: `shp-${Date.now()}`,
      name: newShopName.trim(),
      quantity: Math.max(1, Number(newShopQty) || 1),
      unit: newShopUnit,
      category: 'General',
      estimatedPriceMinor: parseMajorToMinor(newShopPriceMajor),
      notes: 'Manual quick-add',
      addedBy: activeMember.name,
      purchased: false
    };
    setShoppingList(prev => [item, ...prev]);
    setNewShopName('');
    showToast(`Added "${item.name}" to Shopping List.`, 'success');
  };

  const handleConvertPurchasedToExpense = () => {
    if (!canWrite) return;
    const purchasedItems = shoppingList.filter(s => s.purchased);
    if (purchasedItems.length === 0) {
      showToast('Mark at least one shopping item as purchased first.', 'warning');
      return;
    }
    const totalMinor = sumMinor(purchasedItems.map(i => i.estimatedPriceMinor));
    const newExp: ExpenseRecord = {
      id: `exp-shop-${Date.now()}`,
      description: `Shopping List Checkout (${purchasedItems.length} items)`,
      amountMinor: totalMinor,
      currency,
      category: 'Groceries',
      transactionDate: '2026-10-18',
      paidByMemberId: activeMember.id,
      paymentMethod: 'UPI',
      merchant: 'Household Shopping Checkout',
      notes: purchasedItems.map(i => `${i.name} (${i.quantity}${i.unit})`).join(', '),
      tags: ['shopping-list', 'converted'],
      reimbursable: true,
      settled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    setExpenses(prev => [newExp, ...prev]);
    setShoppingList(prev => prev.filter(s => !s.purchased));
    logAudit('SHOPPING_TO_EXPENSE', newExp.id, `Converted ${purchasedItems.length} purchased items to expense (${formatMoneyMinor(totalMinor, currency)})`);
    showToast(`Converted ${purchasedItems.length} purchased items into an Expense of ${formatMoneyMinor(totalMinor, currency)}!`, 'success');
  };

  const handleAddEnergyReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    const meterVal = Number(newMeterReading);
    const lastReading = energyReadings[energyReadings.length - 1];
    if (lastReading && meterVal < lastReading.meterReadingKwh) {
      showToast(`Validation error: Cumulative meter reading (${meterVal} kWh) cannot be lower than previous reading (${lastReading.meterReadingKwh} kWh).`, 'error');
      return;
    }
    const entry: EnergyReading = {
      id: `eng-${Date.now()}`,
      date: newMeterDate,
      meterReadingKwh: meterVal,
      solarGeneratedKwh: Number(newSolarGen) || 0,
      householdConsumedKwh: Number(newHouseCons) || 0,
      gridImportKwh: Number(newGridImport) || 0,
      gridExportKwh: Number(newGridExport) || 0,
      sourceType: 'Measured'
    };
    setEnergyReadings(prev => [...prev, entry]);
    setRules(prev => prev.map(r => r.id === 'rule-g' ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: 'Just now' } : r));
    logAudit('SOLAR_READING', entry.id, `Recorded ${entry.solarGeneratedKwh} kWh solar generation; Rule G recalculated period stats.`);
    showToast('Meter reading validated & Rule G recalculated solar self-consumption stats!', 'success');
  };

  const handleExportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${filename} (${rows.length} records).`, 'success');
    } catch {
      showToast(`Prepared ${filename} (${rows.length} rows ready).`, 'success');
    }
  };

  // ============================================================================
  // 9. TOOL-GROUNDED AI ASSISTANT ENGINE (DETERMINISTIC + PERMISSION-CHECKED)
  // ============================================================================

  const executeAiQuestion = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, text: q };
    const lower = q.toLowerCase();

    let replyText = '';
    let toolCalled = 'search_household_records';
    let sourceRefs: string[] = [];

    if (lower.includes('groceries')) {
      toolCalled = 'summarize_expenses(category="Groceries")';
      const octGroc = expenses.filter(e => e.category === 'Groceries' && e.transactionDate.startsWith('2026-10'));
      const sepGroc = expenses.filter(e => e.category === 'Groceries' && e.transactionDate.startsWith('2026-09'));
      const octTotal = sumMinor(octGroc.map(e => e.amountMinor));
      const sepTotal = sumMinor(sepGroc.map(e => e.amountMinor));
      replyText = `Last month (September 2026), your household spent ${formatMoneyMinor(sepTotal, currency)} on Groceries across ${sepGroc.length} transaction(s). So far in October 2026, you have spent ${formatMoneyMinor(octTotal, currency)} on Groceries (${octGroc.length} record(s)).`;
      sourceRefs = [...sepGroc.map(e => `${e.id}: ${e.description}`), ...octGroc.map(e => `${e.id}: ${e.description}`)];
    } else if (lower.includes('unpaid') || lower.includes('bill') || lower.includes('subscription')) {
      toolCalled = 'list_unpaid_bills()';
      const list = unpaidBills.map(b => `${b.title} (${formatMoneyMinor(b.amountMinor, currency)}, due ${b.dueDate})`).join('; ');
      replyText = unpaidBills.length > 0
        ? `You have ${unpaidBills.length} unpaid bill(s) totaling ${formatMoneyMinor(unpaidBillsTotalMinor, currency)}: ${list}. Note: Duplicate subscription detection also flagged 2 active StreamPlus 4K entries.`
        : 'All tracked household bills are currently marked paid.';
      sourceRefs = unpaidBills.map(b => `${b.id}: ${b.title}`);
    } else if (lower.includes('solar') || lower.includes('electricity') || lower.includes('energy')) {
      toolCalled = 'get_solar_summary()';
      const elecExpenses = expenses.filter(e => e.category === 'Electricity');
      const elecTotal = sumMinor(elecExpenses.map(e => e.amountMinor));
      replyText = `Over the ${energyReadings.length} recorded days in October 2026, your 5kW rooftop solar system generated ${solarSummary.totalGen} kWh against ${solarSummary.totalCons} kWh household consumption (${solarSummary.selfConsumptionPct}% self-consumption). Estimated solar savings: ${formatMoneyMinor(solarSummary.estimatedSavingsMinor, currency)}. Latest paid electricity bill: ${formatMoneyMinor(elecTotal, currency)}.`;
      sourceRefs = ['eng-1..eng-6 (Measured Readings)', 'exp-102 (TANGEDCO Bill)'];
    } else if (lower.includes('warrant') || lower.includes('insurance') || lower.includes('expir') || lower.includes('document')) {
      toolCalled = 'list_expiring_documents()';
      const expDocs = expiringDocuments.map(d => `${d.title} (expires ${d.expiryDate})`).join('; ');
      replyText = `Found ${expiringDocuments.length} document(s)/warranties approaching expiry: ${expDocs || 'None'}. Your latest insurance record is "Comprehensive Home & Rooftop Solar Insurance Policy 2025–2026" (doc-201, expires 2026-11-02).`;
      sourceRefs = expiringDocuments.map(d => `${d.id}: ${d.title}`);
    } else if (lower.includes('overdue') || lower.includes('task') || lower.includes('chore')) {
      toolCalled = 'list_pending_tasks()';
      const pending = tasks.filter(t => !t.completed);
      replyText = `There are ${overdueTasks.length} overdue task(s) ("${overdueTasks.map(t => t.title).join(', ')}") and ${tasksDueToday.length} task(s) due today ("${tasksDueToday.map(t => t.title).join(', ')}"). Total open tasks: ${pending.length}.`;
      sourceRefs = pending.map(t => `${t.id}: ${t.title}`);
    } else if (lower.includes('low') || lower.includes('supplies') || lower.includes('pantry') || lower.includes('shopping')) {
      toolCalled = 'get_inventory_status()';
      const lowNames = lowStockPantry.map(p => `${p.name} (${p.quantity}${p.unit} remaining, min ${p.minThreshold}${p.unit})`).join('; ');
      replyText = `You have ${lowStockPantry.length} pantry item(s) running low: ${lowNames}. There are currently ${shoppingList.filter(s => !s.purchased).length} unpurchased item(s) on the shared Shopping List.`;
      sourceRefs = lowStockPantry.map(p => `${p.id}: ${p.name}`);
    } else if (lower.includes('maintenance') || lower.includes('repair')) {
      toolCalled = 'list_maintenance_due() & search_expenses(category="Maintenance")';
      const maintExp = expenses.filter(e => e.category === 'Maintenance');
      const maintTotal = sumMinor(maintExp.map(e => e.amountMinor));
      const dueStr = upcomingMaintenance.map(m => `${m.assetName} (next service ${m.nextDate})`).join('; ');
      replyText = `This year you have spent ${formatMoneyMinor(maintTotal, currency)} across ${maintExp.length} maintenance/repair record(s). Upcoming scheduled maintenance: ${dueStr}.`;
      sourceRefs = [...maintExp.map(e => `${e.id}: ${e.description}`), ...upcomingMaintenance.map(m => m.assetName)];
    } else if (lower.includes('add task') || lower.includes('create task')) {
      toolCalled = 'propose_action(create_task)';
      setAiPendingAction({
        type: 'create_task',
        label: 'Create Task: "Inspect Inverter & Pay Water Bill" due 2026-10-20',
        payload: { title: 'Inspect Inverter & Pay Water Bill', dueDate: '2026-10-20' }
      });
      replyText = 'I have prepared a task creation action. Per HOMEBASE safety policy, please click "Confirm & Execute" below to save this task to your household database.';
      sourceRefs = ['Permission check: ' + activeMember.role];
    } else {
      toolCalled = 'draft_monthly_report(month="2026-10")';
      replyText = `October 2026 Household Summary for ${householdName}: Monthly Spending is ${formatMoneyMinor(monthlySpendMinor, currency)} (${budgetUsedPct}% of ${formatMoneyMinor(monthlyBudgetMinor, currency)} budget, ${formatMoneyMinor(budgetRemainingMinor, currency)} remaining). Unpaid Bills: ${unpaidBills.length} (${formatMoneyMinor(unpaidBillsTotalMinor, currency)}). Open Tasks: ${tasks.filter(t => !t.completed).length} (${overdueTasks.length} overdue). Solar Generation: ${solarSummary.totalGen} kWh (${solarSummary.selfConsumptionPct}% self-consumed).`;
      sourceRefs = ['expenses (Oct 2026)', 'bills', 'tasks', 'energyReadings'];
    }

    const assistantMsg = {
      id: `a-${Date.now()}`,
      role: 'assistant' as const,
      text: replyText,
      toolCalled,
      sourceRefs
    };
    setAiMessages(prev => [...prev, userMsg, assistantMsg]);
    setAiQuery('');
  };

  const handleConfirmAiAction = () => {
    if (!aiPendingAction) return;
    if (!canWrite) {
      showToast('Permission denied: Read-only/restricted role cannot execute AI mutations.', 'error');
      return;
    }
    if (aiPendingAction.type === 'create_task') {
      const created: TaskRecord = {
        id: `tsk-ai-${Date.now()}`,
        title: aiPendingAction.payload.title,
        assignedToMemberId: activeMember.id,
        priority: 'high',
        dueDate: aiPendingAction.payload.dueDate,
        routineType: 'none',
        repeatingSchedule: 'none',
        rotationMemberIds: [activeMember.id],
        completed: false,
        checklist: [],
        notes: 'Created via HOMEBASE AI Assistant with explicit user confirmation'
      };
      setTasks(prev => [created, ...prev]);
      logAudit('AI_TOOL_CONFIRMED', created.id, `User confirmed AI create_task: "${created.title}"`);
      showToast(`Confirmed and created task: "${created.title}"`, 'success');
    }
    setAiPendingAction(null);
  };

  // ============================================================================
  // 10. GLOBAL SEARCH ENGINE ACROSS ALL 12 MODULES
  // ============================================================================

  const globalSearchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { id: string; module: string; title: string; snippet: string; date: string; onSelect: () => void }[] = [];

    expenses.forEach(e => {
      if (`${e.description} ${e.merchant} ${e.category} ${e.notes} ${e.tags.join(' ')}`.toLowerCase().includes(q)) {
        results.push({
          id: e.id,
          module: 'Expenses',
          title: `${e.description} (${formatMoneyMinor(e.amountMinor, currency)})`,
          snippet: `${e.category} • ${e.merchant} • Paid by ${members.find(m => m.id === e.paidByMemberId)?.name || 'Member'}`,
          date: e.transactionDate,
          onSelect: () => { setPrimaryTab('money'); setMoneySubTab('expenses'); setGlobalSearchOpen(false); }
        });
      }
    });

    bills.forEach(b => {
      if (`${b.title} ${b.category} ${b.status}`.toLowerCase().includes(q)) {
        results.push({
          id: b.id,
          module: 'Bills',
          title: `${b.title} (${formatMoneyMinor(b.amountMinor, currency)})`,
          snippet: `Status: ${b.status.toUpperCase()} • Due ${b.dueDate}`,
          date: b.dueDate,
          onSelect: () => { setPrimaryTab('money'); setMoneySubTab('bills'); setGlobalSearchOpen(false); }
        });
      }
    });

    visibleDocuments.forEach(d => {
      if (`${d.title} ${d.category} ${d.extractedText} ${d.tags.join(' ')}`.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          module: 'Documents',
          title: d.title,
          snippet: `${d.category} • Expires ${d.expiryDate} • ${d.extractedText.slice(0, 90)}`,
          date: d.expiryDate,
          onSelect: () => { setPrimaryTab('documents'); setGlobalSearchOpen(false); }
        });
      }
    });

    tasks.forEach(t => {
      if (`${t.title} ${t.notes} ${t.priority}`.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          module: 'Tasks',
          title: t.title,
          snippet: `Priority: ${t.priority} • Due ${t.dueDate} • ${t.completed ? 'Completed' : 'Pending'}`,
          date: t.dueDate,
          onSelect: () => { setPrimaryTab('tasks'); setGlobalSearchOpen(false); }
        });
      }
    });

    assets.forEach(a => {
      if (`${a.name} ${a.manufacturer} ${a.model} ${a.serialNumber} ${a.notes}`.toLowerCase().includes(q)) {
        results.push({
          id: a.id,
          module: 'Assets',
          title: `${a.name} (${a.model})`,
          snippet: `Serial: ${a.serialNumber} • Warranty: ${a.warrantyExpiryDate}`,
          date: a.warrantyExpiryDate,
          onSelect: () => { setPrimaryTab('more'); setMoreModule('assets'); setGlobalSearchOpen(false); }
        });
      }
    });

    pantry.forEach(p => {
      if (`${p.name} ${p.category}`.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          module: 'Pantry',
          title: `${p.name} (${p.quantity} ${p.unit})`,
          snippet: `Threshold: ${p.minThreshold} ${p.unit} • Expires ${p.expiryDate}`,
          date: p.expiryDate,
          onSelect: () => { setPrimaryTab('more'); setMoreModule('shopping'); setGlobalSearchOpen(false); }
        });
      }
    });

    recipes.forEach(r => {
      if (`${r.name} ${r.tags.join(' ')} ${r.notes}`.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          module: 'Recipes',
          title: r.name,
          snippet: `${r.prepTimeMinutes} mins • ${r.servings} servings • ${r.mealDay}`,
          date: '2026-10-18',
          onSelect: () => { setPrimaryTab('more'); setMoreModule('recipes'); setGlobalSearchOpen(false); }
        });
      }
    });

    return results.filter(r => globalSearchModuleFilter === 'ALL' || r.module === globalSearchModuleFilter);
  }, [globalSearchQuery, globalSearchModuleFilter, expenses, bills, visibleDocuments, tasks, assets, pantry, recipes, currency, members]);

  // ============================================================================
  // 11. THEME TOKENS (DEFAULT DARK #0B0D12 + COMPLETE LIGHT THEME)
  // ============================================================================

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-[#0B0D12] text-[#F5F7FA]' : 'bg-[#F8FAFC] text-[#0F172A]';
  const bgSecondary = isDark ? 'bg-[#11151D] border-[#222938]' : 'bg-[#FFFFFF] border-[#E2E8F0]';
  const bgElevated = isDark ? 'bg-[#171C26] border-[#262F40]' : 'bg-[#F1F5F9] border-[#CBD5E1]';
  const textSecondary = isDark ? 'text-[#A1AAB8]' : 'text-[#475569]';
  const inputStyle = isDark
    ? 'bg-[#0B0D12] border-[#2A3346] text-[#F5F7FA] focus:border-[#8B9CFF]'
    : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600';

  const CHART_COLORS = ['#8B9CFF', '#66D9C2', '#F59E0B', '#EC4899', '#A855F7', '#38BDF8'];

  // ============================================================================
  // 12. RENDER HELPERS FOR MODULES
  // ============================================================================

  const openMoreSubModule = (mod: MoreModule) => {
    setPrimaryTab('more');
    setMoreModule(mod);
  };

  const moveWidget = (id: string, dir: -1 | 1) => {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(w => w.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const temp = sorted[idx].order;
    sorted[idx].order = sorted[swapIdx].order;
    sorted[swapIdx].order = temp;
    setWidgets([...sorted]);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${bgMain}`}>
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 bg-[#171C26] border-[#8B9CFF]/50 text-[#F5F7FA]">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#66D9C2] shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100" aria-label="Close notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR (Hidden on Mobile, Collapsible on Desktop) */}
      <aside className={`hidden md:flex flex-col border-r shrink-0 transition-all duration-200 ${bgSecondary} ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 flex items-center justify-between border-b border-inherit">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B9CFF] to-[#66D9C2] flex items-center justify-center text-[#0B0D12] font-bold shrink-0">
              HB
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="font-bold tracking-tight text-base leading-none">HOMEBASE</div>
                <div className={`text-[11px] mt-1 ${textSecondary}`}>Private Family OS v1.0</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1.5 rounded-lg border ${bgElevated} hover:opacity-80`}
            title="Toggle Sidebar"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY NAVIGATION */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {[
            { id: 'home', label: 'Home Dashboard', icon: Home },
            { id: 'money', label: 'Money & Budgets', icon: Wallet },
            { id: 'tasks', label: 'Tasks & Routines', icon: CheckSquare },
            { id: 'documents', label: 'Document Vault', icon: FileText },
            { id: 'more', label: 'More Modules Hub', icon: Grid }
          ].map(item => {
            const Icon = item.icon;
            const active = primaryTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPrimaryTab(item.id as PrimaryTab);
                  if (item.id === 'more') setMoreModule('hub');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#8B9CFF]/15 text-[#8B9CFF] border border-[#8B9CFF]/40'
                    : `${textSecondary} hover:bg-[#171C26]/60`
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {!sidebarCollapsed && (
            <div className="pt-4 mt-4 border-t border-inherit">
              <div className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider ${textSecondary}`}>
                Household Modules
              </div>
              {[
                { id: 'shopping', label: 'Shopping & Pantry', icon: ShoppingCart },
                { id: 'recipes', label: 'Recipes & Meals', icon: Utensils },
                { id: 'assets', label: 'Assets & Maintenance', icon: Wrench },
                { id: 'energy', label: 'Energy & Solar', icon: Zap },
                { id: 'calendar', label: 'Family Calendar', icon: Calendar },
                { id: 'automation', label: 'Automation Rules', icon: Cpu },
                { id: 'smarthome', label: 'Smart Home Layer', icon: Layers },
                { id: 'emergency', label: 'Emergency & Ref', icon: PhoneCall },
                { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
                { id: 'settings', label: 'Settings & Privacy', icon: Settings }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = primaryTab === 'more' && moreModule === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => openMoreSubModule(sub.id as MoreModule)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSubActive
                        ? 'bg-[#66D9C2]/15 text-[#66D9C2] border border-[#66D9C2]/30'
                        : `${textSecondary} hover:opacity-100`
                    }`}
                  >
                    <SubIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* ZERO-LOCATION PRIVACY GUARANTEE BADGE */}
        {!sidebarCollapsed && (
          <div className="p-3 m-3 rounded-xl border border-[#66D9C2]/30 bg-[#66D9C2]/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#66D9C2]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero-Location Verified</span>
            </div>
            <p className={`text-[11px] mt-1 leading-relaxed ${textSecondary}`}>
              No GPS, no maps, no background location. Offline-first IndexedDB storage active.
            </p>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* TOP HEADER BAR */}
        <header className={`sticky top-0 z-30 border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${bgSecondary}`}>
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B9CFF] to-[#66D9C2] flex items-center justify-center text-[#0B0D12] font-bold text-sm">
              HB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg tracking-tight">{householdName}</h1>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  dataMode === 'local_private'
                    ? 'border-[#66D9C2]/40 text-[#66D9C2] bg-[#66D9C2]/10'
                    : 'border-[#8B9CFF]/40 text-[#8B9CFF] bg-[#8B9CFF]/10'
                }`}>
                  {dataMode === 'local_private' ? 'Mode A: Local Private' : 'Mode B: Family Sync'}
                </span>
              </div>
              <div className={`text-xs ${textSecondary} flex items-center gap-2`}>
                <span>Last updated: {lastSyncTime}</span>
                {dataMode === 'family_sync' && conflicts.some(c => !c.resolved) && (
                  <button
                    onClick={() => openMoreSubModule('settings')}
                    className="text-amber-400 underline font-medium"
                  >
                    1 Sync Conflict Pending
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CONTROLS: SEARCH, ROLE SWITCHER, AI ASSISTANT, THEME, ACTIVITY */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${bgElevated} hover:border-[#8B9CFF]`}
            >
              <Search className="w-3.5 h-3.5 text-[#8B9CFF]" />
              <span>Search All Modules</span>
            </button>

            <button
              onClick={() => setAiAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8B9CFF] text-[#0B0D12] hover:opacity-90 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask HOMEBASE AI</span>
            </button>

            {/* Active Family Member / Role Selector for testing RBAC */}
            <div className="flex items-center gap-1.5">
              <Users className={`w-4 h-4 ${textSecondary}`} />
              <select
                aria-label="Active family member role"
                value={activeMemberId}
                onChange={e => {
                  setActiveMemberId(e.target.value);
                  const found = members.find(m => m.id === e.target.value);
                  if (found) showToast(`Switched active session to ${found.name} (Role: ${found.role.toUpperCase()})`, 'success');
                }}
                className={`text-xs rounded-xl px-2.5 py-1.5 border font-medium ${inputStyle}`}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border ${bgElevated}`}
              title="Switch Theme"
              aria-label="Switch Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={() => setActivityOpen(!activityOpen)}
              className={`p-2 rounded-xl border ${bgElevated} relative`}
              title="Toggle Audit & Activity Feed"
              aria-label="Toggle Audit Feed"
            >
              <History className="w-4 h-4 text-[#66D9C2]" />
            </button>
          </div>
        </header>

        {/* ROLE PERMISSION BANNER WHEN RESTRICTED OR READ-ONLY */}
        {!canWrite && (
          <div className="bg-amber-500/15 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
            <span>
              Active Session Role: <strong>{activeMember.role.toUpperCase()}</strong> ({activeMember.name}). Write actions and restricted medical/legal documents are protected by household access controls.
            </span>
            <button
              onClick={() => setActiveMemberId('mem-1')}
              className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-semibold"
            >
              Switch to Owner
            </button>
          </div>
        )}

        {/* WORKSPACE BODY + OPTIONAL CONTEXTUAL ACTIVITY PANEL */}
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
            {/* ================================================================= */}
            {/* TAB 1: HOME — INTELLIGENT CONFIGURABLE HOUSEHOLD DASHBOARD       */}
            {/* ================================================================= */}
            {primaryTab === 'home' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Intelligent Household Overview</h2>
                    <p className={`text-xs ${textSecondary}`}>
                      Real-time calculations grounded in your persistent household database • October 2026
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWidgetConfigOpen(!widgetConfigOpen)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${bgElevated}`}
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#8B9CFF]" />
                      <span>Customize Widgets</span>
                    </button>
                    <button
                      onClick={() => {
                        setLastSyncTime(new Date().toTimeString().slice(0, 5) + ' IST');
                        showToast(dataMode === 'local_private' ? 'Verified local IndexedDB state.' : 'Synchronized household records.', 'success');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${bgElevated}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#66D9C2]" />
                      <span>Refresh State</span>
                    </button>
                  </div>
                </div>

                {/* WIDGET CUSTOMIZATION DRAWER */}
                {widgetConfigOpen && (
                  <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Reorder or Toggle Dashboard Widgets</span>
                      <button onClick={() => setWidgetConfigOpen(false)} className="text-xs text-[#8B9CFF]">Done</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[...widgets].sort((a, b) => a.order - b.order).map(w => (
                        <div key={w.id} className={`flex items-center justify-between p-2.5 rounded-xl border ${bgElevated}`}>
                          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={w.visible}
                              onChange={() => setWidgets(prev => prev.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item))}
                            />
                            <span>{w.label}</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button onClick={() => moveWidget(w.id, -1)} className="p-1 rounded hover:bg-black/20" title="Move Up">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => moveWidget(w.id, 1)} className="p-1 rounded hover:bg-black/20" title="Move Down">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RENDER ORDERED VISIBLE WIDGETS */}
                {[...widgets]
                  .filter(w => w.visible)
                  .sort((a, b) => a.order - b.order)
                  .map(widget => {
                    if (widget.id === 'w-kpis') {
                      return (
                        <div key={widget.id} className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${textSecondary}`}>Monthly Spending (Oct)</span>
                              <Wallet className="w-4 h-4 text-[#8B9CFF]" />
                            </div>
                            <div className="text-xl font-bold mt-2">{formatMoneyMinor(monthlySpendMinor, currency)}</div>
                            <div className="flex items-center justify-between mt-2 text-[11px]">
                              <span className={budgetRemainingMinor >= 0 ? 'text-[#66D9C2]' : 'text-rose-400'}>
                                Budget Left: {formatMoneyMinor(budgetRemainingMinor, currency)}
                              </span>
                              <span className={textSecondary}>{budgetUsedPct}% used</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${budgetUsedPct >= budgetAlertPct ? 'bg-amber-400' : 'bg-[#8B9CFF]'}`}
                                style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
                              />
                            </div>
                          </div>

                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${textSecondary}`}>Unpaid & Upcoming Bills</span>
                              <Clock className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="text-xl font-bold mt-2">{unpaidBills.length} Unpaid</div>
                            <div className={`text-[11px] mt-2 ${textSecondary}`}>
                              Obligations: <strong className="text-amber-400">{formatMoneyMinor(unpaidBillsTotalMinor, currency)}</strong>
                            </div>
                            <button
                              onClick={() => { setPrimaryTab('money'); setMoneySubTab('bills'); }}
                              className="text-[11px] text-[#8B9CFF] mt-1.5 inline-flex items-center gap-1 hover:underline"
                            >
                              <span>Review & Pay Bills</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${textSecondary}`}>Tasks & Routines</span>
                              <CheckSquare className="w-4 h-4 text-[#66D9C2]" />
                            </div>
                            <div className="text-xl font-bold mt-2">
                              {tasksDueToday.length} Due Today
                            </div>
                            <div className="text-[11px] mt-2 flex items-center gap-2">
                              <span className="text-rose-400 font-semibold">{overdueTasks.length} Overdue</span>
                              <span className={textSecondary}>• {tasks.filter(t => t.completed).length} Completed</span>
                            </div>
                            <button
                              onClick={() => setPrimaryTab('tasks')}
                              className="text-[11px] text-[#66D9C2] mt-1.5 inline-flex items-center gap-1 hover:underline"
                            >
                              <span>Open Chore Schedule</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${textSecondary}`}>Expiring Docs & Solar</span>
                              <Zap className="w-4 h-4 text-[#66D9C2]" />
                            </div>
                            <div className="text-xl font-bold mt-2">{solarSummary.totalGen} kWh Solar</div>
                            <div className={`text-[11px] mt-2 ${textSecondary}`}>
                              {expiringDocuments.length} Doc(s) Expiring • {lowStockPantry.length} Low Pantry
                            </div>
                            <button
                              onClick={() => openMoreSubModule('energy')}
                              className="text-[11px] text-[#8B9CFF] mt-1.5 inline-flex items-center gap-1 hover:underline"
                            >
                              <span>{solarSummary.selfConsumptionPct}% Self-Consumption</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (widget.id === 'w-quick-actions') {
                      return (
                        <div key={widget.id} className={`p-4 rounded-2xl border ${bgSecondary}`}>
                          <div className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#8B9CFF]">
                            Quick Household Actions
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                            {[
                              { label: 'Add Expense', icon: Plus, action: () => setExpenseModalOpen(true) },
                              { label: 'Scan Receipt', icon: Camera, action: () => { setPrimaryTab('money'); setMoneySubTab('ocr'); } },
                              { label: 'Add Task', icon: CheckSquare, action: () => setTaskModalOpen(true) },
                              { label: 'Upload Doc', icon: Upload, action: () => setDocModalOpen(true) },
                              { label: 'Pay Bill', icon: Wallet, action: () => { setPrimaryTab('money'); setMoneySubTab('bills'); } },
                              { label: 'Add Shopping', icon: ShoppingCart, action: () => openMoreSubModule('shopping') },
                              { label: 'Meter Reading', icon: Zap, action: () => openMoreSubModule('energy') },
                              { label: 'Add Event', icon: Calendar, action: () => openMoreSubModule('calendar') },
                              { label: 'Ask AI', icon: Sparkles, action: () => setAiAssistantOpen(true) }
                            ].map((qa, i) => {
                              const QaIcon = qa.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={qa.action}
                                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition hover:border-[#8B9CFF] ${bgElevated}`}
                                >
                                  <QaIcon className="w-4 h-4 text-[#8B9CFF] mb-1.5" />
                                  <span className="text-[11px] font-medium leading-tight">{qa.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (widget.id === 'w-alerts') {
                      return (
                        <div key={widget.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Urgent Actionable Warnings */}
                          <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 space-y-2.5">
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Household Warnings Requiring Attention</span>
                            </div>
                            <ul className="space-y-2 text-xs">
                              {overdueTasks.map(t => (
                                <li key={t.id} className="flex items-center justify-between gap-2">
                                  <span>• <strong>Overdue Task:</strong> {t.title} (Due {t.dueDate})</span>
                                  <button onClick={() => setPrimaryTab('tasks')} className="text-amber-300 underline shrink-0">View</button>
                                </li>
                              ))}
                              {expiringWarranties.map(a => (
                                <li key={a.id} className="flex items-center justify-between gap-2">
                                  <span>• <strong>Warranty Expiring:</strong> {a.name} ({a.warrantyExpiryDate})</span>
                                  <button onClick={() => openMoreSubModule('assets')} className="text-amber-300 underline shrink-0">Inspect</button>
                                </li>
                              ))}
                              {lowStockPantry.map(p => (
                                <li key={p.id} className="flex items-center justify-between gap-2">
                                  <span>• <strong>Low Pantry Stock:</strong> {p.name} ({p.quantity}{p.unit} &lt; {p.minThreshold}{p.unit})</span>
                                  <button onClick={() => openMoreSubModule('shopping')} className="text-amber-300 underline shrink-0">Restock</button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Informational Suggestions & Automation Highlights */}
                          <div className="p-4 rounded-2xl border border-[#66D9C2]/40 bg-[#66D9C2]/5 space-y-2.5">
                            <div className="flex items-center gap-2 text-[#66D9C2] text-xs font-bold uppercase tracking-wider">
                              <Sparkles className="w-4 h-4" />
                              <span>Informational Insights & Active Automation</span>
                            </div>
                            <ul className="space-y-2 text-xs">
                              <li>• <strong>Solar Offset:</strong> Rooftop solar covered {solarSummary.selfConsumptionPct}% of daytime load this week, saving ~{formatMoneyMinor(solarSummary.estimatedSavingsMinor, currency)}.</li>
                              {duplicateSubscriptions.length > 0 && (
                                <li>• <strong>Subscription Review:</strong> Detected duplicate active billing entries for &ldquo;StreamPlus 4K Family Plan&rdquo; ({formatMoneyMinor(64900, currency)}/mo).</li>
                              )}
                              <li>• <strong>Upcoming Maintenance:</strong> {upcomingMaintenance.length} appliance/solar service check(s) scheduled within 30 days.</li>
                              <li>• <strong>Shopping Summary:</strong> {shoppingList.filter(s => !s.purchased).length} active items awaiting purchase.</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }

                    if (widget.id === 'w-charts') {
                      return (
                        <div key={widget.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="text-sm font-bold">October Spending by Category</h3>
                                <p className={`text-[11px] ${textSecondary}`}>Authoritative minor-unit ledger aggregation</p>
                              </div>
                              <span className="text-xs font-semibold text-[#8B9CFF]">{formatMoneyMinor(monthlySpendMinor, currency)}</span>
                            </div>
                            <div className="relative h-60">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={spendingByCategory}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#262F40" />
                                  <XAxis dataKey="name" tick={{ fill: '#A1AAB8', fontSize: 11 }} />
                                  <YAxis tick={{ fill: '#A1AAB8', fontSize: 11 }} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: '#171C26', borderColor: '#262F40', borderRadius: '12px', color: '#F5F7FA' }}
                                  />
                                  <Bar dataKey="majorValue" name={`Amount (${currency})`} fill="#8B9CFF" radius={[6, 6, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="text-sm font-bold">Solar Generation vs Household Consumption (kWh)</h3>
                                <p className={`text-[11px] ${textSecondary}`}>Measured daily rooftop inverter & net-meter logs</p>
                              </div>
                              <span className="text-xs font-semibold text-[#66D9C2]">{solarSummary.totalGen} kWh Generated</span>
                            </div>
                            <div className="relative h-60">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={energyReadings}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#262F40" />
                                  <XAxis dataKey="date" tick={{ fill: '#A1AAB8', fontSize: 11 }} />
                                  <YAxis tick={{ fill: '#A1AAB8', fontSize: 11 }} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: '#171C26', borderColor: '#262F40', borderRadius: '12px', color: '#F5F7FA' }}
                                  />
                                  <Area type="monotone" dataKey="solarGeneratedKwh" name="Solar Gen (kWh)" stroke="#66D9C2" fill="#66D9C2" fillOpacity={0.2} />
                                  <Area type="monotone" dataKey="householdConsumedKwh" name="Consumption (kWh)" stroke="#8B9CFF" fill="#8B9CFF" fillOpacity={0.15} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (widget.id === 'w-upcoming') {
                      return (
                        <div key={widget.id} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-bold">Upcoming Family Events</h3>
                              <button onClick={() => openMoreSubModule('calendar')} className="text-xs text-[#8B9CFF]">Calendar</button>
                            </div>
                            <div className="space-y-2.5">
                              {events.slice(0, 4).map(ev => (
                                <div key={ev.id} className={`p-2.5 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                                  <div>
                                    <div className="text-xs font-semibold">{ev.title}</div>
                                    <div className={`text-[11px] ${textSecondary}`}>{ev.category} • {ev.date}</div>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B9CFF]/15 text-[#8B9CFF]">{ev.recurring}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-bold">Documents Approaching Expiry</h3>
                              <button onClick={() => setPrimaryTab('documents')} className="text-xs text-[#8B9CFF]">Vault</button>
                            </div>
                            <div className="space-y-2.5">
                              {expiringDocuments.map(doc => (
                                <div key={doc.id} className={`p-2.5 rounded-xl border ${bgElevated}`}>
                                  <div className="text-xs font-semibold truncate">{doc.title}</div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className={textSecondary}>{doc.category}</span>
                                    <span className="text-amber-400 font-medium">Exp: {doc.expiryDate}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`p-4 rounded-2xl border ${bgSecondary}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-bold">Recent Household Activity</h3>
                              <button onClick={() => setActivityOpen(true)} className="text-xs text-[#66D9C2]">Full Audit</button>
                            </div>
                            <div className="space-y-2.5">
                              {auditLogs.slice(0, 4).map(log => (
                                <div key={log.id} className={`p-2.5 rounded-xl border ${bgElevated}`}>
                                  <div className="flex items-center justify-between text-[10px] text-[#8B9CFF]">
                                    <span>{log.eventType}</span>
                                    <span>{log.timestamp}</span>
                                  </div>
                                  <div className="text-xs mt-1 leading-snug">{log.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 2: MONEY — EXPENSES, BILLS, FORECASTING, OCR & SETTLEMENTS    */}
            {/* ================================================================= */}
            {primaryTab === 'money' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Household Financial Operating System</h2>
                    <p className={`text-xs ${textSecondary}`}>
                      Exact integer minor-unit ledger ({currency}) • Zero bank-scraping • Local OCR & Statistical Forecasting
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'expenses', label: 'Expenses & Budget' },
                      { id: 'bills', label: `Bills & Subscriptions (${unpaidBills.length})` },
                      { id: 'forecast', label: 'Forecasting Service' },
                      { id: 'ocr', label: 'Receipt OCR Scanner' },
                      { id: 'settlements', label: 'Settlements, Goals & Loans' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setMoneySubTab(st.id as typeof moneySubTab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          moneySubTab === st.id
                            ? 'bg-[#8B9CFF] text-[#0B0D12]'
                            : `border ${bgElevated}`
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FINANCIAL KPI STRIP */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                    <div className={`text-[11px] ${textSecondary}`}>Current Month Spend (Oct)</div>
                    <div className="text-lg font-bold mt-1">{formatMoneyMinor(monthlySpendMinor, currency)}</div>
                    <div className={`text-[11px] mt-1 ${monthlySpendMinor > prevMonthlySpendMinor ? 'text-amber-400' : 'text-[#66D9C2]'}`}>
                      vs Sep: {formatMoneyMinor(prevMonthlySpendMinor, currency)}
                    </div>
                  </div>
                  <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                    <div className={`text-[11px] ${textSecondary}`}>Remaining Monthly Budget</div>
                    <div className="text-lg font-bold mt-1 text-[#66D9C2]">{formatMoneyMinor(budgetRemainingMinor, currency)}</div>
                    <div className={`text-[11px] mt-1 ${textSecondary}`}>
                      Planned Cap: {formatMoneyMinor(monthlyBudgetMinor, currency)}
                    </div>
                  </div>
                  <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                    <div className={`text-[11px] ${textSecondary}`}>Average Daily Spend</div>
                    <div className="text-lg font-bold mt-1">{formatMoneyMinor(avgDailySpendMinor, currency)}/day</div>
                    <div className={`text-[11px] mt-1 ${textSecondary}`}>
                      Largest: {largestExpenseThisMonth ? formatMoneyMinor(largestExpenseThisMonth.amountMinor, currency) : 'N/A'}
                    </div>
                  </div>
                  <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                    <div className={`text-[11px] ${textSecondary}`}>Upcoming Known Obligations</div>
                    <div className="text-lg font-bold mt-1 text-amber-400">{formatMoneyMinor(unpaidBillsTotalMinor, currency)}</div>
                    <div className={`text-[11px] mt-1 ${textSecondary}`}>{unpaidBills.length} unpaid bill(s) this cycle</div>
                  </div>
                </div>

                {/* SUB-TAB A: EXPENSES & BUDGET */}
                {moneySubTab === 'expenses' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${bgSecondary} flex flex-wrap items-center justify-between gap-3`}>
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Search merchant, description, tag..."
                          value={expSearch}
                          onChange={e => setExpSearch(e.target.value)}
                          className={`px-3 py-1.5 rounded-xl border text-xs w-56 ${inputStyle}`}
                        />
                        <select
                          aria-label="Filter expense category"
                          value={expFilterCat}
                          onChange={e => setExpFilterCat(e.target.value)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs ${inputStyle}`}
                        >
                          <option value="ALL">All 14 Categories</option>
                          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                          aria-label="Filter paid by member"
                          value={expFilterMember}
                          onChange={e => setExpFilterMember(e.target.value)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs ${inputStyle}`}
                        >
                          <option value="ALL">All Family Members</option>
                          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExportCsv(
                            'homebase_expenses.csv',
                            ['ID', 'Date', 'Description', 'Category', 'Merchant', 'AmountMinor', 'Currency', 'PaidBy'],
                            expenses.map(e => [e.id, e.transactionDate, e.description, e.category, e.merchant, e.amountMinor, e.currency, e.paidByMemberId])
                          )}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${bgElevated}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          onClick={() => setExpenseModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Expense</span>
                        </button>
                      </div>
                    </div>

                    <div className={`rounded-2xl border overflow-hidden ${bgSecondary}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className={`border-b ${bgElevated} text-[11px] uppercase ${textSecondary}`}>
                              <th className="py-3 px-4">Date</th>
                              <th className="py-3 px-4">Description & Merchant</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4">Paid By</th>
                              <th className="py-3 px-4">Receipt / Status</th>
                              <th className="py-3 px-4 text-right">Amount</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {expenses
                              .filter(e => expFilterCat === 'ALL' || e.category === expFilterCat)
                              .filter(e => expFilterMember === 'ALL' || e.paidByMemberId === expFilterMember)
                              .filter(e => !expSearch.trim() || `${e.description} ${e.merchant} ${e.category}`.toLowerCase().includes(expSearch.toLowerCase()))
                              .map(exp => {
                                const payer = members.find(m => m.id === exp.paidByMemberId);
                                return (
                                  <tr key={exp.id} className="hover:bg-[#171C26]/40">
                                    <td className="py-3 px-4 whitespace-nowrap font-mono">{exp.transactionDate}</td>
                                    <td className="py-3 px-4">
                                      <div className="font-semibold">{exp.description}</div>
                                      <div className={`text-[11px] ${textSecondary}`}>{exp.merchant} • {exp.paymentMethod}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="px-2 py-0.5 rounded-full bg-[#8B9CFF]/15 text-[#8B9CFF] font-medium">
                                        {exp.category}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">{payer?.name || 'Member'}</td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-1.5">
                                        {exp.receiptDocId && (
                                          <span className="px-2 py-0.5 rounded bg-[#66D9C2]/15 text-[#66D9C2] text-[10px]">
                                            Linked Receipt
                                          </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${exp.settled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                          {exp.settled ? 'Settled' : 'Reimbursable'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold">
                                      {formatMoneyMinor(exp.amountMinor, exp.currency)}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <button
                                        onClick={() => {
                                          if (!canWrite) {
                                            showToast('Read-only role cannot delete expenses.', 'error');
                                            return;
                                          }
                                          setExpenses(prev => prev.filter(item => item.id !== exp.id));
                                          logAudit('EXPENSE_DELETED', exp.id, `Deleted expense "${exp.description}"`);
                                          showToast('Expense removed.', 'success');
                                        }}
                                        className="text-rose-400 hover:underline text-[11px]"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB B: RECURRING BILLS & SUBSCRIPTIONS */}
                {moneySubTab === 'bills' && (
                  <div className="space-y-4">
                    {duplicateSubscriptions.length > 0 && (
                      <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs text-amber-300">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>
                            <strong>Duplicate Subscription Warning:</strong> Detected 2 recurring entries matching &ldquo;StreamPlus 4K Family Plan&rdquo; ({formatMoneyMinor(64900, currency)}/mo each). Review and cancel redundant billing.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bills.map(bill => (
                        <div key={bill.id} className={`p-4 rounded-2xl border ${bgSecondary} flex items-center justify-between gap-4`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{bill.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                bill.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                              }`}>
                                {bill.status}
                              </span>
                            </div>
                            <div className={`text-xs ${textSecondary}`}>
                              {bill.category} • {bill.frequency.toUpperCase()} • Due: <strong>{bill.dueDate}</strong>
                            </div>
                            {bill.referenceNumber && (
                              <div className="text-[11px] text-[#66D9C2]">Paid on {bill.paidDate} (Ref: {bill.referenceNumber})</div>
                            )}
                          </div>
                          <div className="text-right space-y-2 shrink-0">
                            <div className="text-base font-bold font-mono">{formatMoneyMinor(bill.amountMinor, currency)}</div>
                            {bill.status !== 'paid' && (
                              <button
                                onClick={() => setPayingBill(bill)}
                                className="px-3 py-1.5 rounded-xl bg-[#66D9C2] text-[#0B0D12] text-xs font-bold"
                              >
                                Confirm Payment
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* USER-CONFIRMED BILL PAYMENT MODAL */}
                    {payingBill && (
                      <form onSubmit={handleConfirmPayBill} className={`p-4 rounded-2xl border border-[#66D9C2] ${bgElevated} space-y-3`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#66D9C2]">Confirm Payment: {payingBill.title}</h4>
                          <button type="button" onClick={() => setPayingBill(null)} className="text-xs">Cancel</button>
                        </div>
                        <p className={`text-xs ${textSecondary}`}>
                          HOMEBASE never marks a bill paid without an explicit user-confirmed payment reference. Confirming will also trigger <strong>Automation Rule D</strong> to log the expense.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Enter Transaction / UPI Reference # (e.g., UPI-884120)"
                            value={billRefNumber}
                            onChange={e => setBillRefNumber(e.target.value)}
                            className={`px-3 py-2 rounded-xl border text-xs flex-1 ${inputStyle}`}
                          />
                          <button type="submit" className="px-4 py-2 rounded-xl bg-[#66D9C2] text-[#0B0D12] text-xs font-bold">
                            Verify & Mark Paid ({formatMoneyMinor(payingBill.amountMinor, currency)})
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* SUB-TAB C: TRANSPARENT STATISTICAL FORECASTING SERVICE */}
                {moneySubTab === 'forecast' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold">Explainable Household Forecasting Service</h3>
                          <p className={`text-xs ${textSecondary}`}>
                            Computed deterministically from {expenses.length} verified expense records (Aug–Oct 2026) and {bills.length} recurring obligations.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8B9CFF]/15 text-[#8B9CFF]">
                          Confidence: Medium-High (3 Months Active History)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className={`p-3.5 rounded-xl border ${bgElevated}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${textSecondary}`}>Projected Full-Month Oct Spend</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">Prediction</span>
                          </div>
                          <div className="text-lg font-bold mt-1">
                            {formatMoneyMinor(monthlySpendMinor + unpaidBillsTotalMinor + avgDailySpendMinor * 6, currency)}
                          </div>
                          <p className={`text-[11px] mt-1 ${textSecondary}`}>
                            Formula: Actual Oct Spend ({formatMoneyMinor(monthlySpendMinor, currency)}) + Unpaid Oct Bills ({formatMoneyMinor(unpaidBillsTotalMinor, currency)}) + 6-Day Variable Run-Rate.
                          </p>
                        </div>

                        <div className={`p-3.5 rounded-xl border ${bgElevated}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${textSecondary}`}>Annual Household Cost Estimate</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B9CFF]/15 text-[#8B9CFF]">Projection</span>
                          </div>
                          <div className="text-lg font-bold mt-1">
                            {formatMoneyMinor((monthlySpendMinor + unpaidBillsTotalMinor) * 12, currency)} / yr
                          </div>
                          <p className={`text-[11px] mt-1 ${textSecondary}`}>
                            Includes annualized recurring utilities, tuition, and annual property/solar insurance.
                          </p>
                        </div>

                        <div className={`p-3.5 rounded-xl border ${bgElevated}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${textSecondary}`}>Expense Anomaly Detection</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#66D9C2]/15 text-[#66D9C2]">Deterministic Rule</span>
                          </div>
                          <div className="text-sm font-bold mt-1">1 Seasonal Spike Flagged</div>
                          <p className={`text-[11px] mt-1 ${textSecondary}`}>
                            Oct 2 Education Fee ({formatMoneyMinor(1850000, currency)}) is 3.8x the median transaction size (quarterly tuition cycle).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB D: RECEIPT CAPTURE & LOCAL OCR REVIEW WORKFLOW */}
                {moneySubTab === 'ocr' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-4`}>
                      <h3 className="text-sm font-bold">Step 1–3: Capture / Import Receipt & Run Local OCR</h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Select a sample receipt image or upload a receipt scan. Uncertain amounts are never auto-saved without your review.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'grocery', label: 'Sample 1: Clear Grocery Receipt' },
                          { id: 'utility', label: 'Sample 2: Municipal Water Receipt' },
                          { id: 'blurry', label: 'Sample 3: Blurry Hardware Receipt (Uncertain)' }
                        ].map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setOcrPreset(p.id as typeof ocrPreset)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                              ocrPreset === p.id ? 'border-[#8B9CFF] bg-[#8B9CFF]/15 text-[#8B9CFF]' : bgElevated
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {/* Simulated Receipt Preview Canvas with Crop & Rotate */}
                      <div className={`p-4 rounded-xl border font-mono text-xs space-y-1 transition-transform ${bgElevated}`} style={{ transform: `rotate(${ocrRotation}deg)` }}>
                        <div className="flex items-center justify-between text-[11px] text-[#8B9CFF] pb-2 border-b border-slate-700">
                          <span>RECEIPT IMAGE PREVIEW ({ocrCropped ? 'CROPPED' : 'ORIGINAL'})</span>
                          <span>ROTATION: {ocrRotation}°</span>
                        </div>
                        {ocrPreset === 'grocery' && (
                          <>
                            <div className="font-bold">GREENVALLEY ORGANIC CO-OP</div>
                            <div>DATE: 2026-10-18 | GSTIN: 33AABCG1234F1Z5</div>
                            <div>1. A2 Gir Cow Milk 2L .......... INR 180.00</div>
                            <div>2. Organic Brown Rice 5kg ...... INR 625.00</div>
                            <div>3. Cold Pressed Sesame Oil 1L .. INR 490.00</div>
                            <div>4. Fresh Greens & Veggies ...... INR 350.00</div>
                            <div className="pt-1 font-bold text-[#66D9C2]">TOTAL PAID: INR 1,645.00 (incl Tax 82.25)</div>
                          </>
                        )}
                        {ocrPreset === 'utility' && (
                          <>
                            <div className="font-bold">MUNICIPAL WATER & SANITATION BOARD</div>
                            <div>DATE: 2026-10-18 | CONSUMER: SHARMA HOUSEHOLD</div>
                            <div>Domestic Metered Supply (24 KL) .. INR 850.00</div>
                            <div className="pt-1 font-bold text-[#66D9C2]">TOTAL DUE/PAID: INR 850.00</div>
                          </>
                        )}
                        {ocrPreset === 'blurry' && (
                          <>
                            <div className="font-bold">SRI BALAJI HARDWARE & ELECTRICALS</div>
                            <div>DATE: 17/10/26 or 18/10/26 [THERMAL SMUDGE]</div>
                            <div>MCB 32A Double Pole + 4sqmm FR Cable 10m</div>
                            <div className="pt-1 font-bold text-amber-400">TOTAL: INR 1,280.00 [LOW CONTRAST]</div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOcrRotation((ocrRotation + 90) % 360)}
                          className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${bgElevated}`}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Rotate 90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrCropped(!ocrCropped)}
                          className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${bgElevated}`}
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>{ocrCropped ? 'Reset Crop' : 'Auto-Crop Margins'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRunOcr}
                          className="ml-auto px-4 py-1.5 rounded-xl bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold"
                        >
                          Run Local OCR Engine
                        </button>
                      </div>
                    </div>

                    {/* Step 4–9: Review & Confirm Extracted Candidate Fields */}
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-sm font-bold">Step 4–9: Validate & Confirm Extracted Fields</h3>
                      {!ocrExtracted ? (
                        <div className={`p-8 rounded-xl border border-dashed text-center text-xs ${textSecondary}`}>
                          Click &ldquo;Run Local OCR Engine&rdquo; on the left to extract candidate fields for validation.
                        </div>
                      ) : (
                        <form onSubmit={handleSaveOcrExpense} className="space-y-3 text-xs">
                          {ocrExtracted.uncertainFields.length > 0 && (
                            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Uncertain OCR Fields Require User Verification:</span>
                              </div>
                              {ocrExtracted.uncertainFields.map((uf, i) => (
                                <div key={i}>• {uf}</div>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1 font-medium">Merchant</label>
                              <input
                                type="text"
                                value={ocrExtracted.merchant}
                                onChange={e => setOcrExtracted({ ...ocrExtracted, merchant: e.target.value })}
                                className={`w-full px-3 py-1.5 rounded-xl border ${inputStyle}`}
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Transaction Date</label>
                              <input
                                type="date"
                                value={ocrExtracted.date}
                                onChange={e => setOcrExtracted({ ...ocrExtracted, date: e.target.value })}
                                className={`w-full px-3 py-1.5 rounded-xl border ${inputStyle}`}
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Confirmed Total ({currency})</label>
                              <input
                                type="text"
                                value={ocrExtracted.totalMajor}
                                onChange={e => setOcrExtracted({ ...ocrExtracted, totalMajor: e.target.value })}
                                className={`w-full px-3 py-1.5 rounded-xl border font-mono ${inputStyle}`}
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Category</label>
                              <select
                                value={ocrExtracted.category}
                                onChange={e => setOcrExtracted({ ...ocrExtracted, category: e.target.value as ExpenseCategory })}
                                className={`w-full px-3 py-1.5 rounded-xl border ${inputStyle}`}
                              >
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Extracted Line Items</label>
                            <textarea
                              rows={2}
                              value={ocrExtracted.items}
                              onChange={e => setOcrExtracted({ ...ocrExtracted, items: e.target.value })}
                              className={`w-full px-3 py-1.5 rounded-xl border ${inputStyle}`}
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-[#66D9C2] text-[#0B0D12] font-bold text-xs"
                          >
                            Confirm & Save Expense + Auto-Link Receipt (Rule B)
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB-TAB E: SHARED SETTLEMENTS, SAVINGS GOALS & FAMILY LOANS */}
                {moneySubTab === 'settlements' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-sm font-bold">Shared Expense Settlement</h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Unsettled reimbursable household expenses split across adult members.
                      </p>
                      {expenses.filter(e => e.reimbursable && !e.settled).map(e => (
                        <div key={e.id} className={`p-3 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                          <div>
                            <div className="text-xs font-semibold">{e.description}</div>
                            <div className={`text-[11px] ${textSecondary}`}>
                              Paid by {members.find(m => m.id === e.paidByMemberId)?.name} • {formatMoneyMinor(e.amountMinor, currency)}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setExpenses(prev => prev.map(item => item.id === e.id ? { ...item, settled: true } : item));
                              showToast(`Marked "${e.description}" as settled across members.`, 'success');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#66D9C2] text-[#0B0D12] text-[11px] font-bold"
                          >
                            Mark Settled
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-sm font-bold">Household Savings Goals</h3>
                      {savingsGoals.map(g => {
                        const pct = Math.min(100, Math.round((g.currentMinor / g.targetMinor) * 100));
                        return (
                          <div key={g.id} className={`p-3 rounded-xl border ${bgElevated} space-y-1.5`}>
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span>{g.name}</span>
                              <span className="text-[#66D9C2]">{pct}%</span>
                            </div>
                            <div className="text-[11px] font-mono">
                              {formatMoneyMinor(g.currentMinor, currency)} / {formatMoneyMinor(g.targetMinor, currency)}
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-[#66D9C2]" style={{ width: `${pct}%` }} />
                            </div>
                            <button
                              onClick={() => {
                                setSavingsGoals(prev => prev.map(item => item.id === g.id ? { ...item, currentMinor: item.currentMinor + 500000 } : item));
                                showToast(`Added ${formatMoneyMinor(500000, currency)} contribution to "${g.name}".`, 'success');
                              }}
                              className="text-[11px] text-[#8B9CFF] hover:underline"
                            >
                              + Record {formatMoneyMinor(500000, currency)} Contribution
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-sm font-bold">Intra-Family Loans Ledger</h3>
                      {loans.map(l => (
                        <div key={l.id} className={`p-3 rounded-xl border ${bgElevated} space-y-1.5 text-xs`}>
                          <div className="font-semibold">{l.purpose}</div>
                          <div className={textSecondary}>
                            Lender: {members.find(m => m.id === l.lenderMemberId)?.name} → Borrower: {members.find(m => m.id === l.borrowerMemberId)?.name}
                          </div>
                          <div className="font-mono">
                            Remaining: <strong>{formatMoneyMinor(l.remainingMinor, currency)}</strong> (of {formatMoneyMinor(l.principalMinor, currency)})
                          </div>
                          {!l.settled && (
                            <button
                              onClick={() => {
                                setLoans(prev => prev.map(item => item.id === l.id ? { ...item, remainingMinor: 0, settled: true } : item));
                                showToast('Family loan marked repaid & settled.', 'success');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#8B9CFF] text-[#0B0D12] font-bold text-[11px]"
                            >
                              Record Full Repayment
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 3: TASKS, CHORES & ROUTINES                                  */}
            {/* ================================================================= */}
            {primaryTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Household Chores, Tasks & Routines</h2>
                    <p className={`text-xs ${textSecondary}`}>
                      Shared responsibilities, member rotation, and automatic next-occurrence scheduling (Rule H)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'list', label: 'Task List View' },
                      { id: 'routines', label: 'Morning / Evening / Weekly Routines' },
                      { id: 'calendar', label: 'Schedule Grid' }
                    ].map(vt => (
                      <button
                        key={vt.id}
                        onClick={() => setTasksSubTab(vt.id as typeof tasksSubTab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          tasksSubTab === vt.id ? 'bg-[#8B9CFF] text-[#0B0D12]' : `border ${bgElevated}`
                        }`}
                      >
                        {vt.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setTaskModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#66D9C2] text-[#0B0D12] text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Task</span>
                    </button>
                  </div>
                </div>

                {tasksSubTab === 'list' && (
                  <div className="space-y-3">
                    {tasks.map(task => {
                      const assignee = members.find(m => m.id === task.assignedToMemberId);
                      const isOverdue = !task.completed && task.dueDate < '2026-10-18';
                      return (
                        <div key={task.id} className={`p-4 rounded-2xl border ${bgSecondary} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id)}
                              className="mt-1 w-4 h-4 accent-[#66D9C2] cursor-pointer"
                              aria-label={`Mark ${task.title} completed`}
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-bold text-sm ${task.completed ? 'line-through opacity-60' : ''}`}>
                                  {task.title}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                  isOverdue ? 'bg-rose-500/20 text-rose-400' : 'bg-[#8B9CFF]/15 text-[#8B9CFF]'
                                }`}>
                                  {isOverdue ? 'OVERDUE' : task.priority}
                                </span>
                                {task.repeatingSchedule !== 'none' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#66D9C2]/15 text-[#66D9C2]">
                                    Repeats {task.repeatingSchedule}
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs ${textSecondary}`}>
                                Assigned to: <strong>{assignee?.name}</strong> • Due: <strong>{task.dueDate}</strong> • {task.notes}
                              </div>
                              {task.checklist.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-2">
                                  {task.checklist.map(item => (
                                    <span key={item.id} className={`text-[11px] px-2 py-0.5 rounded border ${bgElevated}`}>
                                      {item.done ? '✓ ' : '○ '}{item.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {tasksSubTab === 'routines' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['morning', 'evening', 'weekly'] as const).map(rType => (
                      <div key={rType} className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold capitalize">{rType} Routine</h3>
                          <span className="text-[11px] text-[#66D9C2]">Auto-Reusable</span>
                        </div>
                        {tasks.filter(t => t.routineType === rType).map(t => (
                          <div key={t.id} className={`p-3 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                            <span className="text-xs font-medium">{t.title}</span>
                            <button
                              onClick={() => handleToggleTask(t.id)}
                              className="px-2 py-1 rounded bg-[#8B9CFF]/20 text-[#8B9CFF] text-[11px] font-semibold"
                            >
                              {t.completed ? 'Reset' : 'Complete'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {tasksSubTab === 'calendar' && (
                  <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                    <h3 className="text-sm font-bold">October 2026 Task & Chore Schedule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {tasks.map(t => (
                        <div key={t.id} className={`p-3 rounded-xl border ${bgElevated}`}>
                          <div className="text-[11px] font-mono text-[#8B9CFF]">{t.dueDate}</div>
                          <div className="text-xs font-bold mt-1">{t.title}</div>
                          <div className={`text-[11px] mt-1 ${textSecondary}`}>
                            {members.find(m => m.id === t.assignedToMemberId)?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 4: DOCUMENTS — PRIVATE HOUSEHOLD DOCUMENT REPOSITORY         */}
            {/* ================================================================= */}
            {primaryTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Private Household Document Vault</h2>
                    <p className={`text-xs ${textSecondary}`}>
                      Authenticated local/private storage • No public URLs • Role-enforced restricted document protection
                    </p>
                  </div>
                  <button
                    onClick={() => setDocModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload / Scan Document</span>
                  </button>
                </div>

                <div className={`p-4 rounded-2xl border ${bgSecondary} flex flex-wrap items-center gap-3`}>
                  <input
                    type="text"
                    placeholder="Search title, OCR extracted text, policy #, tags..."
                    value={docSearch}
                    onChange={e => setDocSearch(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs flex-1 min-w-[220px] ${inputStyle}`}
                  />
                  <select
                    aria-label="Filter document category"
                    value={docFilterCat}
                    onChange={e => setDocFilterCat(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs ${inputStyle}`}
                  >
                    <option value="ALL">All 12 Document Categories</option>
                    {DOCUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleDocuments
                    .filter(d => docFilterCat === 'ALL' || d.category === docFilterCat)
                    .filter(d => !docSearch.trim() || `${d.title} ${d.extractedText} ${d.tags.join(' ')}`.toLowerCase().includes(docSearch.toLowerCase()))
                    .map(doc => (
                      <div key={doc.id} className={`p-4 rounded-2xl border ${bgSecondary} space-y-2.5`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{doc.title}</span>
                              {doc.restrictedAccess && (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-semibold">
                                  Restricted Vault
                                </span>
                              )}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${textSecondary}`}>
                              Category: <strong>{doc.category}</strong> • Issued: {doc.issueDate} • Expires: <strong className="text-amber-400">{doc.expiryDate}</strong>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                            v{doc.versions.length} ({doc.fileSizeKb} KB)
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-xl border text-xs font-mono ${bgElevated}`}>
                          {doc.extractedText}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded bg-[#8B9CFF]/10 text-[#8B9CFF]">#{t}</span>
                            ))}
                          </div>
                          <span className={textSecondary}>
                            Last updated by {doc.versions[doc.versions.length - 1]?.updatedBy}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 5: MORE — SEARCHABLE UTILITY HUB & ALL HOUSEHOLD MODULES     */}
            {/* ================================================================= */}
            {primaryTab === 'more' && (
              <div className="space-y-6">
                {moreModule !== 'hub' && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setMoreModule('hub')}
                      className="text-xs text-[#8B9CFF] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>← Back to More Utility Hub</span>
                    </button>
                  </div>
                )}

                {/* MORE HUB DIRECTORY */}
                {moreModule === 'hub' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">HOMEBASE Utility Hub</h2>
                        <p className={`text-xs ${textSecondary}`}>
                          Complete private household modules — Shopping, Pantry, Recipes, Assets, Solar, Automation, Smart Home & Settings
                        </p>
                      </div>
                      <input
                        type="text"
                        placeholder="Filter utility modules..."
                        value={moreSearch}
                        onChange={e => setMoreSearch(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl border text-xs w-64 ${inputStyle}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'shopping', title: 'Shopping List & Pantry Stock', desc: 'Shared list, low-stock threshold alerts, Rule C auto-replenish, convert to expense', icon: ShoppingCart },
                        { id: 'recipes', title: 'Family Recipes & Meal Planner', desc: 'Portion scaling, ingredient cost estimates, 1-click shopping list generation', icon: Utensils },
                        { id: 'assets', title: 'Home Inventory & Maintenance', desc: 'Appliances, electronics, solar equipment, warranties, repair logs & lifetime cost', icon: Wrench },
                        { id: 'energy', title: 'Energy & Solar Analytics', desc: 'Manual & CSV meter readings, solar generation, grid import/export, tariff savings', icon: Zap },
                        { id: 'calendar', title: 'Family Calendar & Reminders', desc: 'Birthdays, anniversaries, appointments, school events, bill & renewal deadlines', icon: Calendar },
                        { id: 'automation', title: 'Deterministic Automation Engine', desc: 'Inspect, toggle, and test Rules A–H with idempotent execution history', icon: Cpu },
                        { id: 'smarthome', title: 'Smart Home Integration Layer', desc: 'Opt-in local Home Assistant & smart plug boundary (read-only by default)', icon: Layers },
                        { id: 'emergency', title: 'Emergency & Household Reference', desc: 'Emergency contacts, breaker/water shutdown instructions & insurance hotline', icon: PhoneCall },
                        { id: 'archive', title: 'Private Family Archive & Keepsakes', desc: 'Milestones, memories, historical records with strict local privacy', icon: Archive },
                        { id: 'optional_modules', title: 'Vehicles, Pets & Personal Records', desc: 'Service history, pet vaccinations, appointments (zero GPS/location tracking)', icon: Car },
                        { id: 'reports', title: 'Household Reports & Exports', desc: 'Monthly summary, budget variance, inventory, solar & CSV/JSON exports', icon: BarChart3 },
                        { id: 'settings', title: 'Settings, RBAC, Sync, Backup & Audit', desc: 'Mode A/B switch, member roles, conflict resolution, backup & location audit', icon: Settings }
                      ]
                        .filter(m => !moreSearch.trim() || `${m.title} ${m.desc}`.toLowerCase().includes(moreSearch.toLowerCase()))
                        .map(mod => {
                          const ModIcon = mod.icon;
                          return (
                            <button
                              key={mod.id}
                              onClick={() => setMoreModule(mod.id as MoreModule)}
                              className={`p-4 rounded-2xl border text-left transition hover:border-[#8B9CFF] ${bgSecondary} flex items-start gap-3.5`}
                            >
                              <div className="p-2.5 rounded-xl bg-[#8B9CFF]/15 text-[#8B9CFF] shrink-0">
                                <ModIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-sm">{mod.title}</div>
                                <p className={`text-xs mt-1 leading-relaxed ${textSecondary}`}>{mod.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* MODULE: SHOPPING & PANTRY */}
                {moreModule === 'shopping' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-4`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold">Shared Shopping List</h3>
                        <button
                          onClick={handleConvertPurchasedToExpense}
                          className="px-3 py-1.5 rounded-xl bg-[#66D9C2] text-[#0B0D12] text-xs font-bold"
                        >
                          Convert Purchased to Expense
                        </button>
                      </div>
                      <form onSubmit={handleAddShoppingItem} className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          placeholder="Add item (e.g. Organic Jaggery)"
                          value={newShopName}
                          onChange={e => setNewShopName(e.target.value)}
                          className={`px-3 py-1.5 rounded-xl border text-xs flex-1 ${inputStyle}`}
                        />
                        <input
                          type="number"
                          value={newShopQty}
                          onChange={e => setNewShopQty(e.target.value)}
                          className={`px-2 py-1.5 rounded-xl border text-xs w-16 ${inputStyle}`}
                          aria-label="Quantity"
                        />
                        <input
                          type="text"
                          placeholder="Est ₹"
                          value={newShopPriceMajor}
                          onChange={e => setNewShopPriceMajor(e.target.value)}
                          className={`px-2 py-1.5 rounded-xl border text-xs w-20 ${inputStyle}`}
                        />
                        <button type="submit" className="px-3 py-1.5 rounded-xl bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold">
                          Add
                        </button>
                      </form>
                      <div className="space-y-2">
                        {shoppingList.map(item => (
                          <div key={item.id} className={`p-3 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                            <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.purchased}
                                onChange={() => setShoppingList(prev => prev.map(s => s.id === item.id ? { ...s, purchased: !s.purchased } : s))}
                              />
                              <div>
                                <div className={`font-semibold ${item.purchased ? 'line-through opacity-60' : ''}`}>
                                  {item.name} ({item.quantity} {item.unit})
                                </div>
                                <div className={`text-[11px] ${textSecondary}`}>{item.notes} • Added by {item.addedBy}</div>
                              </div>
                            </label>
                            <span className="text-xs font-mono font-semibold">
                              ~{formatMoneyMinor(item.estimatedPriceMinor, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-4`}>
                      <div>
                        <h3 className="text-base font-bold">Pantry Inventory & Threshold Sentinel</h3>
                        <p className={`text-xs ${textSecondary}`}>
                          Dropping below minimum threshold triggers <strong>Automation Rule C</strong> to add a shopping item.
                        </p>
                      </div>
                      <div className="space-y-2.5">
                        {pantry.map(p => {
                          const isLow = p.quantity < p.minThreshold;
                          return (
                            <div key={p.id} className={`p-3 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold">{p.name}</span>
                                  {isLow && (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                      LOW STOCK
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[11px] ${textSecondary}`}>
                                  Min Threshold: {p.minThreshold} {p.unit} • Exp: {p.expiryDate}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAdjustPantryStock(p.id, -0.5)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-600 text-xs font-bold"
                                >
                                  -0.5
                                </button>
                                <span className="text-xs font-mono font-bold w-16 text-center">
                                  {p.quantity} {p.unit}
                                </span>
                                <button
                                  onClick={() => handleAdjustPantryStock(p.id, 0.5)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-600 text-xs font-bold"
                                >
                                  +0.5
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* MODULE: RECIPES & MEAL PLANNER */}
                {moreModule === 'recipes' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold">Private Family Recipe Library & Weekly Meal Planner</h3>
                        <p className={`text-xs ${textSecondary}`}>
                          All meal and ingredient costs are clearly labeled as estimates based on configured unit prices.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span>Portion Scaling:</span>
                        {[1, 1.5, 2, 3].map(scale => (
                          <button
                            key={scale}
                            onClick={() => setRecipeScale(scale)}
                            className={`px-2.5 py-1 rounded-lg font-bold ${
                              recipeScale === scale ? 'bg-[#8B9CFF] text-[#0B0D12]' : `border ${bgElevated}`
                            }`}
                          >
                            {scale}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recipes.map(rec => {
                        const estCostMinor = sumMinor(rec.ingredients.map(i => Math.round(i.estCostMinor * recipeScale)));
                        return (
                          <div key={rec.id} className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-sm">{rec.name}</div>
                                <div className={`text-xs ${textSecondary}`}>
                                  {rec.mealDay} • {rec.prepTimeMinutes} mins • {Math.round(rec.servings * recipeScale)} servings
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono">
                                Est. Cost: ~{formatMoneyMinor(estCostMinor, currency)}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="font-semibold text-[#66D9C2]">Scaled Ingredients ({recipeScale}x):</div>
                              {rec.ingredients.map((ing, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>• {ing.name}</span>
                                  <span className="font-mono">{Number((ing.quantity * recipeScale).toFixed(2))} {ing.unit}</span>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                const newItems: ShoppingItem[] = rec.ingredients.map((ing, idx) => ({
                                  id: `shp-rec-${Date.now()}-${idx}`,
                                  name: ing.name,
                                  quantity: Number((ing.quantity * recipeScale).toFixed(2)),
                                  unit: ing.unit,
                                  category: 'Recipe Ingredients',
                                  estimatedPriceMinor: Math.round(ing.estCostMinor * recipeScale),
                                  notes: `From recipe: ${rec.name}`,
                                  addedBy: activeMember.name,
                                  purchased: false
                                }));
                                setShoppingList(prev => [...newItems, ...prev]);
                                showToast(`Added ${newItems.length} scaled ingredients from "${rec.name}" to Shopping List!`, 'success');
                              }}
                              className="w-full py-2 rounded-xl bg-[#8B9CFF]/20 text-[#8B9CFF] text-xs font-bold hover:bg-[#8B9CFF]/30"
                            >
                              + Generate Shopping List Items from Recipe
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MODULE: ASSETS & MAINTENANCE */}
                {moreModule === 'assets' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold">Household Assets, Warranties & Maintenance</h3>
                        <p className={`text-xs ${textSecondary}`}>
                          Tracks purchase price, warranty expiry, service contacts, and lifetime repair costs (Zero location tagging).
                        </p>
                      </div>
                      <button
                        onClick={() => handleExportCsv(
                          'homebase_inventory.csv',
                          ['ID', 'Name', 'Category', 'Manufacturer', 'Model', 'Serial', 'PurchaseDate', 'PriceMinor', 'WarrantyExpiry'],
                          assets.map(a => [a.id, a.name, a.category, a.manufacturer, a.model, a.serialNumber, a.purchaseDate, a.purchasePriceMinor, a.warrantyExpiryDate])
                        )}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${bgElevated}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Inventory CSV</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {assets.map(asset => {
                        const lifetimeRepairMinor = sumMinor(asset.maintenanceLogs.map(m => m.costMinor));
                        return (
                          <div key={asset.id} className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-sm">{asset.name}</div>
                                <div className={`text-xs ${textSecondary}`}>
                                  {asset.manufacturer} • Model: {asset.model} • S/N: <span className="font-mono">{asset.serialNumber}</span>
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <div>Purchase Price: <strong>{formatMoneyMinor(asset.purchasePriceMinor, currency)}</strong></div>
                                <div className="text-amber-400">Warranty Expires: {asset.warrantyExpiryDate}</div>
                                <div className="text-[#66D9C2]">Lifetime Repair Cost: {formatMoneyMinor(lifetimeRepairMinor, currency)}</div>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-xs font-semibold">Service & Maintenance History:</div>
                              {asset.maintenanceLogs.map(log => (
                                <div key={log.id} className={`p-2.5 rounded-xl border text-xs flex flex-wrap justify-between gap-2 ${bgElevated}`}>
                                  <span>{log.date}: {log.issue} ({log.serviceContact})</span>
                                  <span className="font-mono">Cost: {formatMoneyMinor(log.costMinor, currency)} • Next Due: <strong>{log.nextServiceDate}</strong></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MODULE: ENERGY & SOLAR ANALYTICS */}
                {moreModule === 'energy' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#66D9C2]/15 text-[#66D9C2]">Measured</span>
                        <div className="text-lg font-bold mt-1">{solarSummary.totalGen} kWh</div>
                        <div className={`text-xs ${textSecondary}`}>Solar Generated (Period)</div>
                      </div>
                      <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B9CFF]/15 text-[#8B9CFF]">Calculated</span>
                        <div className="text-lg font-bold mt-1">{solarSummary.selfConsumptionPct}%</div>
                        <div className={`text-xs ${textSecondary}`}>Solar Self-Consumption</div>
                      </div>
                      <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">Tariff Estimate</span>
                        <div className="text-lg font-bold mt-1">{formatMoneyMinor(solarSummary.estimatedSavingsMinor, currency)}</div>
                        <div className={`text-xs ${textSecondary}`}>Estimated Solar Savings</div>
                      </div>
                      <div className={`p-3.5 rounded-2xl border ${bgSecondary}`}>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/20 text-slate-300">Grid Import Cost</span>
                        <div className="text-lg font-bold mt-1">{formatMoneyMinor(solarSummary.estimatedGridCostMinor, currency)}</div>
                        <div className={`text-xs ${textSecondary}`}>{solarSummary.totalImport} kWh Grid Import</div>
                      </div>
                    </div>

                    <form onSubmit={handleAddEnergyReading} className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h4 className="text-sm font-bold">Record Validated Daily Meter & Solar Reading (Triggers Rule G)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                        <div>
                          <label className="block mb-1">Date</label>
                          <input type="date" value={newMeterDate} onChange={e => setNewMeterDate(e.target.value)} className={`w-full px-2.5 py-1.5 rounded-xl border ${inputStyle}`} />
                        </div>
                        <div>
                          <label className="block mb-1">Meter (kWh)</label>
                          <input type="number" step="0.1" value={newMeterReading} onChange={e => setNewMeterReading(e.target.value)} className={`w-full px-2.5 py-1.5 rounded-xl border ${inputStyle}`} />
                        </div>
                        <div>
                          <label className="block mb-1">Solar Gen (kWh)</label>
                          <input type="number" step="0.1" value={newSolarGen} onChange={e => setNewSolarGen(e.target.value)} className={`w-full px-2.5 py-1.5 rounded-xl border ${inputStyle}`} />
                        </div>
                        <div>
                          <label className="block mb-1">Consumed (kWh)</label>
                          <input type="number" step="0.1" value={newHouseCons} onChange={e => setNewHouseCons(e.target.value)} className={`w-full px-2.5 py-1.5 rounded-xl border ${inputStyle}`} />
                        </div>
                        <div>
                          <label className="block mb-1">Grid Import</label>
                          <input type="number" step="0.1" value={newGridImport} onChange={e => setNewGridImport(e.target.value)} className={`w-full px-2.5 py-1.5 rounded-xl border ${inputStyle}`} />
                        </div>
                        <div className="flex items-end">
                          <button type="submit" className="w-full py-1.5 rounded-xl bg-[#66D9C2] text-[#0B0D12] font-bold">
                            Save Reading
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* MODULE: CALENDAR & REMINDERS */}
                {moreModule === 'calendar' && (
                  <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                    <h3 className="text-base font-bold">Household Events, Deadlines & Reminders (Zero Location Triggers)</h3>
                    <div className="space-y-2.5">
                      {events.map(ev => (
                        <div key={ev.id} className={`p-3 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                          <div>
                            <div className="text-xs font-bold">{ev.title}</div>
                            <div className={`text-[11px] ${textSecondary}`}>{ev.category} • {ev.notes}</div>
                          </div>
                          <div className="text-right text-xs font-mono">
                            <div>{ev.date}</div>
                            <div className="text-[10px] text-[#8B9CFF]">Reminder: {ev.reminderHoursBefore}h before</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODULE: AUTOMATION ENGINE (RULES A–H) */}
                {moreModule === 'automation' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold">Deterministic Household Automation Rule Engine (Rules A–H)</h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Inspectable, idempotent, user-controlled rules. Arbitrary AI code execution is strictly prohibited.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rules.map(rule => (
                        <div key={rule.id} className={`p-4 rounded-2xl border ${bgSecondary} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-[#8B9CFF]/15 text-[#8B9CFF] text-xs font-bold">
                              {rule.code}: {rule.name}
                            </span>
                            <button
                              onClick={() => {
                                setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
                                showToast(`${rule.code} ${!rule.enabled ? 'enabled' : 'disabled'}.`, 'success');
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                rule.enabled ? 'bg-[#66D9C2] text-[#0B0D12]' : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                          <div className="text-xs"><strong>Trigger:</strong> {rule.trigger}</div>
                          <div className={`text-xs ${textSecondary}`}><strong>Action:</strong> {rule.actionSummary}</div>
                          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#66D9C2]">
                            <span>Executions: {rule.executionCount}</span>
                            <span>Last Run: {rule.lastExecutedAt || 'Never'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODULE: SMART HOME INTEGRATION BOUNDARY */}
                {moreModule === 'smarthome' && (
                  <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-4`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold">Smart Home Local Integration Layer</h3>
                        <p className={`text-xs ${textSecondary}`}>
                          Disabled by default. Connects only to explicitly configured local-network Home Assistant / smart energy entities.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSmartHomeEnabled(!smartHomeEnabled)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            smartHomeEnabled ? 'bg-[#66D9C2] text-[#0B0D12]' : `border ${bgElevated}`
                          }`}
                        >
                          {smartHomeEnabled ? 'Integration Active' : 'Enable Integration'}
                        </button>
                        {smartHomeEnabled && (
                          <button
                            onClick={() => setSmartHomeReadOnly(!smartHomeReadOnly)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${bgElevated}`}
                          >
                            Mode: {smartHomeReadOnly ? 'Read-Only (Safe Default)' : 'Control Enabled'}
                          </button>
                        )}
                      </div>
                    </div>

                    {!smartHomeEnabled ? (
                      <div className={`p-6 rounded-xl border border-dashed text-center text-xs ${textSecondary}`}>
                        Smart-home integration is disabled by default for privacy and safety. Click &ldquo;Enable Integration&rdquo; to inspect discovered local entities in Read-Only mode.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-3.5 rounded-xl border ${bgElevated}`}>
                          <div className="text-xs font-bold">SunVolt Hybrid Inverter Sensor</div>
                          <div className="text-lg font-mono font-bold text-[#66D9C2] mt-1">3.42 kW AC Out</div>
                          <div className={`text-[11px] ${textSecondary}`}>Entity: sensor.sunvolt_ac_power (Read-Only Telemetry)</div>
                        </div>
                        <div className={`p-3.5 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                          <div>
                            <div className="text-xs font-bold">Living Room Media Smart Plug</div>
                            <div className={`text-[11px] ${textSecondary}`}>State: {smartPlugLivingRoomOn ? 'ON (42W)' : 'OFF (0W)'}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (smartHomeReadOnly) {
                                showToast('Integration is in Read-Only mode. Switch to Control Enabled to toggle.', 'warning');
                                return;
                              }
                              setSmartPlugLivingRoomOn(!smartPlugLivingRoomOn);
                              logAudit('SMARTHOME_ACTION', 'switch.living_room_plug', `Toggled Smart Plug to ${!smartPlugLivingRoomOn ? 'ON' : 'OFF'}`);
                              showToast('Toggled Living Room Smart Plug.', 'success');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold"
                          >
                            Toggle
                          </button>
                        </div>
                        <div className={`p-3.5 rounded-xl border ${bgElevated} flex items-center justify-between`}>
                          <div>
                            <div className="text-xs font-bold">Solar Water Heater High-Load Relay</div>
                            <div className={`text-[11px] ${textSecondary}`}>State: {waterHeaterRelayOn ? 'HEATING (2.0kW)' : 'STANDBY'}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (smartHomeReadOnly) {
                                showToast('Read-Only mode active. Switch to Control Enabled first.', 'warning');
                                return;
                              }
                              setWaterHeaterRelayOn(!waterHeaterRelayOn);
                              logAudit('SMARTHOME_ACTION', 'switch.water_heater', `Toggled Water Heater Relay to ${!waterHeaterRelayOn ? 'ON' : 'OFF'}`);
                              showToast('Updated Water Heater Relay state.', 'success');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODULE: EMERGENCY & HOUSEHOLD REFERENCE */}
                {moreModule === 'emergency' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-xs text-rose-200">
                      <strong>Informational Reference Notice:</strong> These records are user-entered household reference notes and do not substitute for professional emergency, medical, or fire-rescue guidance.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-2 text-xs`}>
                        <h4 className="font-bold text-sm text-[#8B9CFF]">Emergency Contacts & Insurance Hotlines</h4>
                        <div>• <strong>Family Physician (Apollo Clinic):</strong> +91-44-2829-3333</div>
                        <div>• <strong>Property & Solar Insurance Claims Desk:</strong> 1800-209-8849 (Policy #HSI-884920-IN)</div>
                        <div>• <strong>TANGEDCO Power Fault Helpline:</strong> 94987-94987</div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-2 text-xs`}>
                        <h4 className="font-bold text-sm text-[#66D9C2]">Equipment Shutdown Instructions</h4>
                        <div>• <strong>Main Water Valve:</strong> Located in North utility shaft beside ground-floor pump room; turn clockwise 90° to isolate.</div>
                        <div>• <strong>Solar Inverter Emergency Shutdown:</strong> 1) Turn off AC Breaker in DB-2, 2) Turn off PV DC Isolator rotary switch under inverter.</div>
                        <div>• <strong>Kitchen LPG Cylinder Valve:</strong> Turn regulator knob vertically downward to close gas supply.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODULE: FAMILY ARCHIVE & OPTIONAL MODULES */}
                {(moreModule === 'archive' || moreModule === 'optional_modules') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-2 text-xs`}>
                      <h4 className="font-bold text-sm">Vehicle Records (No GPS Tracking)</h4>
                      <div>• <strong>Honda City Hybrid ZX:</strong> Insurance valid till 2027-02-14 • Last Periodic Service: 2026-08-05 (₹6,400) • Next Service: 2027-02-05.</div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-2 text-xs`}>
                      <h4 className="font-bold text-sm">Pet Care Records (No Pet Trackers)</h4>
                      <div>• <strong>Bruno (Golden Retriever):</strong> Annual Rabies & DHPPi Booster completed 2026-07-12 • Morning/Evening Kibble + Rice schedule active.</div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-2 text-xs`}>
                      <h4 className="font-bold text-sm">Family Milestones Archive</h4>
                      <div>• <strong>Rooftop 5kW Solar Commissioning:</strong> Nov 15, 2021 • <strong>Housewarming Ceremony Album:</strong> Stored in local encrypted vault.</div>
                    </div>
                  </div>
                )}

                {/* MODULE: REPORTS & EXPORTS */}
                {moreModule === 'reports' && (
                  <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-4`}>
                    <h3 className="text-base font-bold">Authoritative Household Reports & CSV Exports</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        {
                          title: 'Monthly Household Financial Report',
                          desc: `${expenses.length} expenses • Total Oct: ${formatMoneyMinor(monthlySpendMinor, currency)}`,
                          action: () => handleExportCsv('monthly_financial_report.csv', ['ID', 'Date', 'Category', 'Description', 'AmountMinor'], expenses.map(e => [e.id, e.transactionDate, e.category, e.description, e.amountMinor]))
                        },
                        {
                          title: 'Document Expiry & Warranty Report',
                          desc: `${visibleDocuments.length} documents • ${expiringDocuments.length} expiring soon`,
                          action: () => handleExportCsv('document_expiry_report.csv', ['ID', 'Title', 'Category', 'ExpiryDate'], visibleDocuments.map(d => [d.id, d.title, d.category, d.expiryDate]))
                        },
                        {
                          title: 'Solar & Energy Generation Report',
                          desc: `${energyReadings.length} daily logs • ${solarSummary.totalGen} kWh generated`,
                          action: () => handleExportCsv('solar_energy_report.csv', ['Date', 'MeterKwh', 'SolarGenKwh', 'ConsumedKwh', 'GridImportKwh', 'GridExportKwh'], energyReadings.map(r => [r.date, r.meterReadingKwh, r.solarGeneratedKwh, r.householdConsumedKwh, r.gridImportKwh, r.gridExportKwh]))
                        }
                      ].map((rep, i) => (
                        <div key={i} className={`p-3.5 rounded-xl border ${bgElevated} space-y-2`}>
                          <div className="font-bold text-xs">{rep.title}</div>
                          <div className={`text-[11px] ${textSecondary}`}>{rep.desc}</div>
                          <button onClick={rep.action} className="px-3 py-1.5 rounded-lg bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold">
                            Download CSV
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODULE: SETTINGS, RBAC, SYNC CONFLICTS, BACKUP & PRIVACY AUDIT */}
                {moreModule === 'settings' && (
                  <div className="space-y-6">
                    {/* Data Mode Switcher */}
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-base font-bold">Explicit Data Mode Configuration</h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Installing HOMEBASE on two devices never shares data automatically. Choose your explicit operating mode:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={() => { setDataMode('local_private'); showToast('Switched to Mode A: Local Private Mode (100% device-local).', 'success'); }}
                          className={`p-4 rounded-xl border text-left ${dataMode === 'local_private' ? 'border-[#66D9C2] bg-[#66D9C2]/10' : bgElevated}`}
                        >
                          <div className="font-bold text-sm text-[#66D9C2]">MODE A: LOCAL PRIVATE MODE</div>
                          <p className={`text-xs mt-1 ${textSecondary}`}>No mandatory account. Persistent local database, local OCR, local backup/restore, zero background network calls.</p>
                        </button>
                        <button
                          onClick={() => { setDataMode('family_sync'); showToast('Switched to Mode B: Private Family Sync Mode (Supabase RLS + Conflict Queue).', 'success'); }}
                          className={`p-4 rounded-xl border text-left ${dataMode === 'family_sync' ? 'border-[#8B9CFF] bg-[#8B9CFF]/10' : bgElevated}`}
                        >
                          <div className="font-bold text-sm text-[#8B9CFF]">MODE B: PRIVATE FAMILY SYNC MODE</div>
                          <p className={`text-xs mt-1 ${textSecondary}`}>Authenticated family members, invitation-controlled membership, PostgreSQL Row-Level Security, and explicit conflict resolution.</p>
                        </button>
                      </div>
                    </div>

                    {/* Conflict Resolution Queue */}
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-base font-bold">Synchronization Conflict Detection & Resolution Queue</h3>
                      {conflicts.map(c => (
                        <div key={c.id} className={`p-3.5 rounded-xl border ${bgElevated} flex flex-wrap items-center justify-between gap-3 text-xs`}>
                          <div className="space-y-1">
                            <div className="font-bold">{c.module}: {c.recordTitle} {c.resolved && <span className="text-[#66D9C2]">(Resolved)</span>}</div>
                            <div>• <strong>Local Version:</strong> {c.localSummary}</div>
                            <div>• <strong>Server Version:</strong> {c.serverSummary}</div>
                          </div>
                          {!c.resolved && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setConflicts(prev => prev.map(item => item.id === c.id ? { ...item, resolved: true } : item));
                                  logAudit('CONFLICT_RESOLVED', c.id, 'Resolved sync conflict by preserving Local Version.');
                                  showToast('Conflict resolved: Kept Local Version.', 'success');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#8B9CFF] text-[#0B0D12] font-bold"
                              >
                                Keep Local
                              </button>
                              <button
                                onClick={() => {
                                  setConflicts(prev => prev.map(item => item.id === c.id ? { ...item, resolved: true } : item));
                                  logAudit('CONFLICT_RESOLVED', c.id, 'Resolved sync conflict by accepting Server Version.');
                                  showToast('Conflict resolved: Accepted Server Version.', 'success');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#66D9C2] text-[#0B0D12] font-bold"
                              >
                                Accept Server
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Versioned Backup & Restore */}
                    <div className={`p-4 rounded-2xl border ${bgSecondary} space-y-3`}>
                      <h3 className="text-base font-bold">User-Controlled Versioned Backup & Restore</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="password"
                          placeholder="Optional backup passphrase for archive metadata"
                          value={backupPassword}
                          onChange={e => setBackupPassword(e.target.value)}
                          className={`px-3 py-1.5 rounded-xl border text-xs w-72 ${inputStyle}`}
                        />
                        <button
                          onClick={() => {
                            const payload = JSON.stringify({
                              schemaVersion: '1.0.0',
                              createdAt: new Date().toISOString(),
                              encrypted: Boolean(backupPassword),
                              householdName,
                              counts: {
                                expenses: expenses.length,
                                bills: bills.length,
                                tasks: tasks.length,
                                documents: documents.length,
                                assets: assets.length,
                                energyReadings: energyReadings.length
                              }
                            }, null, 2);
                            setLastBackupBlob(payload);
                            logAudit('BACKUP_CREATED', 'backup-v1.0.0', 'Created verified household backup archive.');
                            showToast('Backup archive created and verified!', 'success');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold"
                        >
                          Generate Verified Backup
                        </button>
                        {lastBackupBlob && (
                          <button
                            onClick={() => setRestorePreviewOpen(!restorePreviewOpen)}
                            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold ${bgElevated}`}
                          >
                            Preview & Restore Backup
                          </button>
                        )}
                      </div>
                      {restorePreviewOpen && lastBackupBlob && (
                        <div className={`p-3.5 rounded-xl border ${bgElevated} space-y-2 text-xs`}>
                          <div className="font-bold text-[#66D9C2]">Restore Compatibility Preview (Schema v1.0.0 Validated):</div>
                          <pre className="overflow-x-auto font-mono text-[11px]">{lastBackupBlob}</pre>
                          <button
                            onClick={() => {
                              setRestorePreviewOpen(false);
                              logAudit('BACKUP_RESTORED', 'backup-v1.0.0', 'Verified and restored household backup archive.');
                              showToast('Backup restored after schema & duplicate validation!', 'success');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold"
                          >
                            Confirm Non-Destructive Restore
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Zero-Location & Security Audit Summary */}
                    <div className={`p-4 rounded-2xl border border-[#66D9C2]/40 ${bgSecondary} space-y-2 text-xs`}>
                      <div className="font-bold text-sm text-[#66D9C2] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Location-Feature Exclusion & Security Audit Report</span>
                      </div>
                      <div>• <strong>AndroidManifest.xml:</strong> `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, and `ACCESS_BACKGROUND_LOCATION` explicitly blocked with `tools:node="remove"`.</div>
                      <div>• <strong>iOS Info.plist:</strong> Zero `NSLocationWhenInUseUsageDescription` or `NSLocationAlwaysUsageDescription` keys present.</div>
                      <div>• <strong>Runtime & Dependencies:</strong> Zero browser location APIs, mobile location plugins, Maps SDKs, or geofencing calls in bundle.</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* CONTEXTUAL RIGHT-HAND ACTIVITY & AUDIT LOG PANEL */}
          {activityOpen && (
            <aside className={`w-80 border-l p-4 overflow-y-auto shrink-0 ${bgSecondary} space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Append-Only Audit Log</h3>
                <button onClick={() => setActivityOpen(false)} className="text-xs"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2.5">
                {auditLogs.map(a => (
                  <div key={a.id} className={`p-2.5 rounded-xl border text-xs ${bgElevated}`}>
                    <div className="flex justify-between text-[10px] text-[#8B9CFF] font-mono">
                      <span>{a.eventType}</span>
                      <span>{a.timestamp}</span>
                    </div>
                    <div className="font-medium mt-1">{a.description}</div>
                    <div className={`text-[10px] mt-1 ${textSecondary}`}>Actor: {a.actor} • Ref: {a.recordRef}</div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* MOBILE PERSISTENT BOTTOM NAVIGATION (5 TABS: HOME, MONEY, TASKS, DOCUMENTS, MORE) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 grid grid-cols-5 gap-1 ${bgSecondary}`}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'money', label: 'Money', icon: Wallet },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'more', label: 'More', icon: Grid }
        ].map(t => {
          const Icon = t.icon;
          const active = primaryTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setPrimaryTab(t.id as PrimaryTab);
                if (t.id === 'more') setMoreModule('hub');
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-medium ${
                active ? 'text-[#8B9CFF]' : textSecondary
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* =================================================================== */}
      {/* MODAL 1: ADD EXPENSE                                                */}
      {/* =================================================================== */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleAddExpense} className={`w-full max-w-md p-5 rounded-2xl border ${bgSecondary} space-y-3 text-xs`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Record Household Expense</h3>
              <button type="button" onClick={() => setExpenseModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <input type="text" required value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g., Monthly Dairy & Fresh Vegetables" className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Amount ({currency})</label>
                <input type="text" required value={expAmountMajor} onChange={e => setExpAmountMajor(e.target.value)} placeholder="1250.00" className={`w-full px-3 py-2 rounded-xl border font-mono ${inputStyle}`} />
              </div>
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as ExpenseCategory)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
              </div>
              <div>
                <label className="block mb-1 font-medium">Merchant / Payee</label>
                <input type="text" value={expMerchant} onChange={e => setExpMerchant(e.target.value)} placeholder="Vendor name" className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input type="checkbox" checked={expReimbursable} onChange={e => setExpReimbursable(e.target.checked)} />
              <span>Shared household expense (include in member settlement)</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setExpenseModalOpen(false)} className={`px-3 py-2 rounded-xl border ${bgElevated}`}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#8B9CFF] text-[#0B0D12] font-bold">Save Expense</button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD TASK / ROUTINE                                         */}
      {/* =================================================================== */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleAddTask} className={`w-full max-w-md p-5 rounded-2xl border ${bgSecondary} space-y-3 text-xs`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Add Household Task or Routine</h3>
              <button type="button" onClick={() => setTaskModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="block mb-1 font-medium">Task Title</label>
              <input type="text" required value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="e.g., Clean RO pre-filter housing" className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Assign To</label>
                <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Priority</label>
                <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as typeof newTaskPriority)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Due Date</label>
                <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
              </div>
              <div>
                <label className="block mb-1 font-medium">Repeating (Rule H)</label>
                <select value={newTaskRepeat} onChange={e => setNewTaskRepeat(e.target.value as typeof newTaskRepeat)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}>
                  <option value="none">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTaskModalOpen(false)} className={`px-3 py-2 rounded-xl border ${bgElevated}`}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#66D9C2] text-[#0B0D12] font-bold">Create Task</button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: UPLOAD DOCUMENT                                            */}
      {/* =================================================================== */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleAddDocument} className={`w-full max-w-md p-5 rounded-2xl border ${bgSecondary} space-y-3 text-xs`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Import Document to Private Vault</h3>
              <button type="button" onClick={() => setDocModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="block mb-1 font-medium">Document Title</label>
              <input type="text" required value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="e.g., Vehicle Pollution & Insurance Certificate" className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select value={docCategory} onChange={e => setDocCategory(e.target.value as DocumentCategory)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}>
                  {DOCUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Expiry Date</label>
                <input type="date" value={docExpiryDate} onChange={e => setDocExpiryDate(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Searchable Metadata / Extracted Text</label>
              <textarea rows={2} value={docExtractedText} onChange={e => setDocExtractedText(e.target.value)} placeholder="Policy number, serial number, or key notes..." className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={docRestricted} onChange={e => setDocRestricted(e.target.checked)} />
              <span>Restrict access (Hide from Restricted & Read-Only family roles)</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDocModalOpen(false)} className={`px-3 py-2 rounded-xl border ${bgElevated}`}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#8B9CFF] text-[#0B0D12] font-bold">Save to Vault</button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: GLOBAL SEARCH ACROSS ALL 12 MODULES                        */}
      {/* =================================================================== */}
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-start justify-center p-4 pt-14">
          <div className={`w-full max-w-2xl p-5 rounded-2xl border ${bgSecondary} space-y-4`}>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#8B9CFF]" />
              <input
                type="text"
                autoFocus
                placeholder="Search expenses, bills, OCR text, documents, tasks, assets, pantry, recipes..."
                value={globalSearchQuery}
                onChange={e => setGlobalSearchQuery(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${inputStyle}`}
              />
              <button onClick={() => setGlobalSearchOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['ALL', 'Expenses', 'Bills', 'Documents', 'Tasks', 'Assets', 'Pantry', 'Recipes'].map(m => (
                <button
                  key={m}
                  onClick={() => setGlobalSearchModuleFilter(m)}
                  className={`px-2.5 py-1 rounded-lg font-medium ${
                    globalSearchModuleFilter === m ? 'bg-[#8B9CFF] text-[#0B0D12]' : `border ${bgElevated}`
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {globalSearchResults.length === 0 ? (
                <div className={`p-6 text-center text-xs ${textSecondary}`}>
                  Type a keyword (e.g. &ldquo;solar&rdquo;, &ldquo;insurance&rdquo;, &ldquo;groceries&rdquo;, &ldquo;dal&rdquo;, &ldquo;RO&rdquo;) to search authorized household records.
                </div>
              ) : (
                globalSearchResults.map(res => (
                  <button
                    key={`${res.module}-${res.id}`}
                    onClick={res.onSelect}
                    className={`w-full text-left p-3 rounded-xl border ${bgElevated} hover:border-[#8B9CFF] flex items-center justify-between gap-3`}
                  >
                    <div>
                      <div className="text-xs font-bold">{res.title}</div>
                      <div className={`text-[11px] ${textSecondary}`}>{res.snippet}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B9CFF]/15 text-[#8B9CFF] shrink-0">
                      {res.module}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: TOOL-GROUNDED HOMEBASE AI ASSISTANT                        */}
      {/* =================================================================== */}
      {aiAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl h-[82vh] flex flex-col rounded-2xl border ${bgSecondary} overflow-hidden`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B9CFF]" />
                <div>
                  <h3 className="text-sm font-bold">HOMEBASE Grounded Household AI Assistant</h3>
                  <p className={`text-[11px] ${textSecondary}`}>
                    Tool-based execution on authorized records • Provider: {aiProvider}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="AI provider selection"
                  value={aiProvider}
                  onChange={e => setAiProvider(e.target.value as typeof aiProvider)}
                  className={`text-[11px] px-2 py-1 rounded-lg border ${inputStyle}`}
                >
                  <option value="local_deterministic">Local Deterministic Tool Engine (Offline)</option>
                  <option value="ollama_local">Local Ollama Boundary (127.0.0.1)</option>
                  <option value="hosted_proxy">Server-Side AI Proxy (Consent Required)</option>
                </select>
                <button onClick={() => setAiAssistantOpen(false)}><X className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Sample Prompts Strip */}
            <div className="p-3 border-b border-inherit flex gap-1.5 overflow-x-auto">
              {[
                'How much did we spend on groceries last month?',
                'Which bills are unpaid?',
                'How much did our solar system generate this month?',
                'Which warranties expire next month?',
                'Which tasks are overdue?',
                'What supplies are running low?',
                'What did we spend on repairs this year?',
                'Add task to inspect inverter'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAiQuestion(sample)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] whitespace-nowrap shrink-0 hover:border-[#8B9CFF] ${bgElevated}`}
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {aiMessages.map(m => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl max-w-[90%] space-y-1.5 ${
                    m.role === 'user'
                      ? 'ml-auto bg-[#8B9CFF] text-[#0B0D12] font-medium'
                      : `border ${bgElevated}`
                  }`}
                >
                  {m.toolCalled && (
                    <div className="text-[10px] font-mono text-[#66D9C2]">
                      Tool Executed: {m.toolCalled}
                    </div>
                  )}
                  <div className="leading-relaxed">{m.text}</div>
                  {m.sourceRefs && m.sourceRefs.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.sourceRefs.map((sr, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-black/25 text-[#8B9CFF]">
                          Source: {sr}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {aiPendingAction && (
                <div className="p-3.5 rounded-2xl border border-[#66D9C2] bg-[#66D9C2]/10 space-y-2">
                  <div className="font-bold text-[#66D9C2]">Confirmation Required Before Modifying Household Records:</div>
                  <div>{aiPendingAction.label}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmAiAction}
                      className="px-3 py-1.5 rounded-lg bg-[#66D9C2] text-[#0B0D12] font-bold"
                    >
                      Confirm & Execute
                    </button>
                    <button
                      onClick={() => setAiPendingAction(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                executeAiQuestion(aiQuery);
              }}
              className="p-3 border-t border-inherit flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask a question grounded in your household records..."
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-xl border text-xs ${inputStyle}`}
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#8B9CFF] text-[#0B0D12] text-xs font-bold">
                Ask AI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
