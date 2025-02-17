// src/utils/validation.ts
export const validationRules = {
  protocol: {
    tree: { required: true, minLength: 1, maxLength: 100 },
    region: { required: true, minLength: 1, maxLength: 100 },
    examEngine: { required: true, minLength: 1, maxLength: 100 },
    program: { required: true, minLength: 1, maxLength: 100 },
    protocol: { required: true, minLength: 1, maxLength: 100 }
  },
  sequence: {
    name: { required: true, minLength: 1, maxLength: 200 },
    order: { required: true, min: 1, max: 1000 }
  }
};

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}
