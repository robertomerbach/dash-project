import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

// Formatadores memorizados para reutilização
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

/**
 * Combine class names with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as BRL currency
 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/**
 * Format a number with Brazilian locale
 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  
  // Use Math.round for better performance than toFixed+Number conversion
  return Math.round((current - previous) / previous * 1000) / 10;
}

// Character sets para geração de senha
const CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  special: "!@#$%^&*"
};

/**
 * Generate a secure random password with guaranteed character types
 */
export function generatePassword(length: number = 12): string {
  if (length < 4) {
    throw new Error("Password length must be at least 4 characters");
  }
  
  // Garantir pelo menos um caractere de cada tipo
  const password = [
    CHARS.lowercase[Math.floor(Math.random() * CHARS.lowercase.length)],
    CHARS.uppercase[Math.floor(Math.random() * CHARS.uppercase.length)],
    CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)],
    CHARS.special[Math.floor(Math.random() * CHARS.special.length)]
  ];
  
  // Concatenar todos os tipos de caracteres
  const allChars = CHARS.lowercase + CHARS.uppercase + CHARS.numbers + CHARS.special;
  const remainingLength = length - password.length;
  
  // Preencher o restante da senha
  for (let i = 0; i < remainingLength; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Fisher-Yates shuffle para melhor aleatoriedade
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  
  return password.join('');
}

/**
 * Generate a cryptographically secure token
 */
export function generateToken(length: number = 32): string {
  // A função randomBytes gera bytes, então ajustamos para obter o comprimento hex correto
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}