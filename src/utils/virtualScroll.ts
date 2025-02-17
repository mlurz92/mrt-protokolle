// src/utils/virtualScroll.ts
export interface VirtualScrollConfig {
  itemHeight: number;
  overscan: number;
  scrollThreshold: number;
}

export const defaultVirtualScrollConfig: VirtualScrollConfig = {
  itemHeight: 50,
  overscan: 5,
  scrollThreshold: 250
};
tsconfi