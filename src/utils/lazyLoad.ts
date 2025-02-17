// src/utils/lazyLoad.ts
export interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  batchSize: number;
}

export const defaultLazyLoadConfig: LazyLoadConfig = {
  threshold: 0.1,
  rootMargin: '50px',
  batchSize: 20
};
