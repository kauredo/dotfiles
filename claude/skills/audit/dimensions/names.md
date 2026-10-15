# names

Identifiers that hide what they hold. The project's own convention outranks any language default, and small scope excuses a lot. Do not police pedantically.

## Discover

Languages (conventions differ). Sample 10 to 20 identifiers per kind (variables, functions, classes, constants, files); the dominant convention wins over the language default. Note framework idioms (DTO suffix, `use*` hooks). Collect the domain terminology: it is valid, not vague. Watch for two terms covering one concept. Summarize and confirm.

## Categories

1. **Vague names**
   - Always vague: tmp, temp, foo, bar, baz, thing, stuff, misc, rv, retval.
   - Vague unless qualified: util, helper, manager, processor, handler, controller, service, factory, wrapper, info, data, item, value, result, request, response, collection, list, array, set, map.
   - Acceptable: a short-scope immediate use (a `result` returned on the next line of a function of about 15 lines or fewer), `item` in a map callback, `data` from a data-fetch hook, node and element domain terms, input and output in an obvious transform, `err`/`error`/`e` in a catch, names destructured from library APIs, one-line callback params.
   - A problem when: module or class scope, scope over about 20 lines, several same-vague names in one scope, public API params, returns and exports.
2. **Single-letter variables**
   - Fine: loop indices `i j k n m`; `e` for catch or event; `x y z` in math; `_` unused; generic params `T K V U R`; `t` for i18n; `$` legacy DOM; Python `f/s/n`; Go `r/w/b` in small scope; Rust `s` in small scope; one-line lambdas.
   - Flag: public API params; scope over about 10 lines; letters outside those idioms (`u` for user, `d` for data); duplicate letters in one scope; important domain concepts; multi-line callbacks.
3. **Boolean naming**
   - Find the project convention first and flag deviations from the dominant style. With none, recommend one and flag the worst.
   - Language varies: JS and TS lean strongly on is/has/can; Python is mixed; Go exported fields and unexported usually bare, methods prefixed; Rust methods prefixed, fields bare.
   - JSX boolean props mirroring HTML attributes (open, disabled, required, checked) are exempt. Internal state should still be prefixed.
   - Negative booleans (`isNot*`, `hasNo*`, `not*`, negated adjectives such as `!isInvalid`) are the worst offenders; prefer the positive form.
   - Boolean-returning functions read as questions (`hasPermission`, `isValidEmail`), not as `check`/`validate` verbs.
4. **Casing and convention consistency**
   - Judge against the project's dominant convention, using the language's norms as the tiebreak (JS/TS, Python, Go, Rust, Java, C#, enum members).
   - Violations: mixed casing in one file, a lowercase class, constants not in constant case, mixed file naming.
   - Cross-boundary naming: API field, frontend variable, DB column and ORM model for one thing; user, account and member used for one entity.
5. **Abbreviation consistency**
   - For each pair, count how often the short and long form appear: msg/message, btn/button, cfg/conf/config, ctx/context, idx/index, cnt/count, num/number, req/request, res/response, err/error, prev/previous, curr/current, dest/destination, src/source, dir/directory, auth/authentication, plus params, args and init.
   - Ratio of the minority form between about 0.2 and 0.8 means mixed: standardize on the majority. Beyond 0.8 the outliers are minor.
   - Always flag the ambiguous ones: res, val, mod, ref, dev, prod, lib, stat, proc.
   - File and directory names count (src/source, utils/utilities, config/configuration).
   - Standard abbreviations pass, limited to the ones that fit the stack. Universal: api, db, sql, url, id, css, html, json, xml, yaml. By ecosystem: Go err ctx req resp; NestJS req res dto; Python self cls args kwargs; Java dto dao impl; C# svc ctx dto; databases tx pk fk; React props and `ref`. Also networking terms, CSS units and i18n.
   - `info` overlaps with vague names. Report it once, under the more actionable category.

## Tiers

- P1: a single letter in a public API; a negative boolean in a condition; one concept under different names across modules.
- P2: vague public names; a missing boolean prefix where the convention has one; ambiguous abbreviations.
- P3: abbreviation inconsistency; casing inconsistency within a file.
- P4: vague names in small local scope.

## Report extras

A `Naming Conventions Discovered` section. Columns `Issue | Location | Current | Suggested`. Summary counts: vague, single-letter outside idioms, boolean issues, casing, abbreviation, cross-boundary.

A public rename needs a deprecation path, so say so in the finding.

## Fix options

Extras: P1 only, fix auto-fixable, generate a rename plan for the public API (hand to `improve`).

- Auto-fixable: add a boolean prefix, fix casing, standardize an abbreviation (confirm which form), flip a negative boolean.
- Human decision: public renames, domain terms, abbreviated versus full, which module's term wins.
