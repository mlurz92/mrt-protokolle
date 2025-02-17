// src/models/models.ts
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Protocol extends BaseEntity {
  tree: string;
  region: string;
  examEngine: string;
  program: string;
  protocol: string;
  sequences: Sequence[];
  metadata?: ProtocolMetadata;
}

export interface ProtocolMetadata {
  version?: string;
  lastModifiedBy?: string;
  isActive?: boolean;
  tags?: string[];
}

export interface Sequence extends BaseEntity {
  protocolId: string;
  name: string;
  order: number;
  parameters?: SequenceParameters;
}

export interface SequenceParameters {
  duration?: number;
  resolution?: string;
  contrast?: boolean;
}
