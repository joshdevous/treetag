import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;

export type WithoutChild<T> = Omit<T, 'child'>;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
