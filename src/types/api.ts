// === Discriminated Union for API Results ===

export type ApiResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

// === Paginated Response ===

export interface PaginatedMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly success: true;
  readonly data: ReadonlyArray<T>;
  readonly meta: PaginatedMeta;
}

// === API Error Detail ===

export interface ApiErrorDetail {
  readonly status: number;
  readonly message: string;
  readonly requestId?: string;
  readonly timestamp?: string;
}
