// Type declarations for @ton/core
declare module '@ton/core' {
  export function beginCell(): any;
  export class Address {
    static parse(address: string): Address;
    toString(): string;
  }
  export function toNano(amount: string | number): bigint;
}
