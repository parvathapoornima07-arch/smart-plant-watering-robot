/**
 * A chainable, thenable builder that mimics the Supabase PostgREST query API
 * enough for controller tests. Every chainable method returns the same builder
 * (so `.from().select().eq().order().range()` etc. work), and awaiting the
 * builder pops the next queued result from `results`.
 *
 * Configure results in order with `enqueue(...)`. If the queue is empty, a
 * safe default ({ data: null, error: null, count: null }) is returned.
 */

export interface QueryResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

export class QueryBuilder {
  private results: QueryResult[] = [];

  enqueue(result: QueryResult): this {
    this.results.push(result);
    return this;
  }

  enqueueMany(results: QueryResult[]): this {
    for (const r of results) this.results.push(r);
    return this;
  }

  reset(): this {
    this.results = [];
    return this;
  }

  // --- chainable query builder methods (all return `this`) ---
  select(_cols?: string, _opts?: unknown) {
    return this;
  }
  insert(_row: unknown) {
    return this;
  }
  update(_row: unknown) {
    return this;
  }
  delete() {
    return this;
  }
  upsert(_row: unknown, _opts?: unknown) {
    return this;
  }
  onConflict() {
    return this;
  }
  eq(_col: string, _val: unknown) {
    return this;
  }
  neq(_col: string, _val: unknown) {
    return this;
  }
  is(_col: string, _val: unknown) {
    return this;
  }
  in(_col: string, _vals: unknown) {
    return this;
  }
  lt(_col: string, _val: unknown) {
    return this;
  }
  gte(_col: string, _val: unknown) {
    return this;
  }
  lte(_col: string, _val: unknown) {
    return this;
  }
  order(_col: string, _opts?: unknown) {
    return this;
  }
  range(_from: number, _to: number) {
    return this;
  }
  limit(_n: number) {
    return this;
  }
  maybeSingle() {
    return this;
  }
  single() {
    return this;
  }

  // --- thenable: awaiting the builder yields the next queued result ---
  then<TResult1 = QueryResult>(
    onFulfilled?: (value: QueryResult) => TResult1 | PromiseLike<TResult1>,
    onRejected?: (reason: unknown) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1> {
    const result = this.results.shift() ?? { data: null, error: null, count: null };
    const p = result.error
      ? Promise.reject(result.error as unknown)
      : Promise.resolve(result as QueryResult);
    return p.then(onFulfilled as (v: QueryResult) => TResult1, onRejected);
  }

  catch<TResult1 = QueryResult>(
    onRejected: (reason: unknown) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1> {
    return this.then(undefined, onRejected);
  }
}

export function createQueryBuilder(): QueryBuilder {
  return new QueryBuilder();
}

/** Returns a fake `db` function whose `.from()` yields the shared builder. */
export function createDb(builder: QueryBuilder) {
  const api = {
    from: () => builder,
  };
  // db() must be a function returning { from }
  return () => api;
}
