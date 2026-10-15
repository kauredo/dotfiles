# errors

Failures that vanish, lose their cause, or get handled five different ways.

## Discover

Languages, frameworks and their error model (filters, middleware, boundaries). The project's error infrastructure: factories, custom classes, central handlers, logging utilities, monitoring (Sentry and kin), response normalizers, the standard logging approach.

Build a **don't-flag list** from it: framework-level handlers, error boundaries, central monitoring wrappers, data-fetch library error handling, generated code, tests. Summarize and confirm with the user.

## Categories

1. **Empty and broad catches**
   - Empty catch; comment-only catch; a promise `catch` returning nothing, null, false or undefined.
   - Near misses: `console.log` only (flag when a structured logger exists); a UI toast with no logged details.
   - Config-level silencing: logger silent or disabled in prod, monitoring off, error sample rate zero, log level off.
   - Broad: catching a generic error with no narrowing; controllers and services catching what the framework layer should.
   - Per language: bare or broad `except`, `except ... pass`; Go `if err != nil { return }` and `_ =` on error returns; Java `catch Exception/Throwable` outside the top level; Rust `unwrap`, `let _ =` on a Result, `.ok()` dropping the error.
   - Legit empties: an explicit intentional-ignore comment, a feature-detection fallback, cleanup in `finally` already handled.
   - Legit broad: framework handlers, the app boundary, log-then-rethrow.
2. **Lost chains and pointless rethrows**
   - A new error thrown in a catch without the cause: JS `cause` option, Python `from`, Go `%w`, Java cause argument, Rust `map_err`, C# inner exception.
   - C# `throw ex;` resetting the stack, where bare `throw;` keeps it.
   - Go bare `return err` with no context.
   - A catch that only rethrows unchanged.
   - Legit rethrow: adds logging, is conditional, wraps with context, or is a framework transform.
3. **Promises and async**
   - `.then` with no catch (check multi-line chains in two steps); `Promise.all/race/any/allSettled` uncaught.
   - Floating promises: unawaited async calls, handlers and lifecycle hooks calling async without `await`, `void fn()` with no catch.
   - Async handlers with no try/catch where nothing upstream handles it.
   - Entry points (bootstrap, main, init, start) with no await or catch; a missing global unhandled-rejection handler compounds it.
   - Python `create_task` without keeping the task, missing `await`; Go goroutines without `recover`, unread error channels; Rust spawned task handles never joined.
   - Dropped Result/Either/Option values: a call that returns a Result used as a bare statement, or the success value read with the error branch never looked at. On auth, session and security paths this is the worst case, because a failed check has to deny.
   - Leave alone: data-fetch library calls, routes covered by error middleware, functions that hand the promise back to their caller, tests.
4. **Error strategy consistency**
   - Discover the conventions (factory, logger, framework handling, response shape), then state the expected strategy per layer: controllers throw domain errors; services throw or return Result; handlers log and report; UI uses framework error states; event handlers try/catch and report; utilities propagate.
   - Deviations: null-return and throw mixed in one service; bypassing central handling (raw console, direct monitoring SDK calls, raw framework exceptions instead of the factory, controllers catching what middleware owns); hand-rolled UI error state where the data library provides one; inconsistent response shapes (`error` versus `message` key, codes present or absent, validation formats, field-level arrays); dead error utilities (exported, never imported); uneven monitoring coverage across handlers.
5. **Messages and logging gaps**
   - Generic or short messages naming no operation, entity or reason. The short-literal search is a heuristic: read each hit, since short but descriptive messages are fine.
   - Messages carry IDs, never passwords, tokens, keys, card data or PII.
   - Catch blocks that only toast, use raw console, or skip reporting; error callbacks without reporting; rethrows with less context; Go `Errorf` without a wrap verb.

## Tiers

- P1: empty catch on data or payment operations; floating promises in critical paths; a discarded Result on a security path.
- P2: any other empty catch; a promise without catch; a lost chain; bypassing project logging; a discarded Result elsewhere by path criticality.
- P3: pointless rethrow; inconsistent strategy.
- P4: generic message.

## Report extras

An `Error Handling Infrastructure` section. Summary counts: empty catches, broad catches, lost chains, unhandled async, strategy inconsistencies, logging and monitoring gaps.

## Fix options

Extras: P1 only, fix all auto-fixable, generate a refactor plan for strategy unification (hand to `improve`).

- Auto-fixable: add the cause, swap console for the project logger, swap a direct SDK call for the wrapper, swap a raw exception for the factory, remove a pointless rethrow.
- Human decision: handle an empty catch or mark it intentional, throw versus null-return policy, message content, whether async code handles errors or defers to callers.
