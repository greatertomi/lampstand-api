export enum TokenStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  USED = 'used'
}

export interface ReadingLocation {
  cfi: string;
  pages: {
    totalPages: number;
    currentPage: number;
  };
  href: string;
  percentage: number;
}
