# Documentation

The repository is the durable source of truth for Full Circle. Current code and
tests define behavior; these documents record the intent and non-obvious design
constraints that are expensive to recover from implementation alone.

| Document                                                   | Audience                              | Authority                                               |
| ---------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| [Project README](../README.md)                             | Package users                         | Public API, setup, and examples                         |
| [Compiler boundaries](architecture/compiler-boundaries.md) | Maintainers and agents                | Compiler/runtime ownership and TypeScript compatibility |
| [Changelog](../CHANGELOG.md)                               | Package users and release maintainers | Published release history                               |

Actionable work belongs in
[GitHub Issues](https://github.com/bentsignal/full-circle/issues). Completed work
belongs in Git, pull requests, and the changelog rather than an active knowledge
or task log.

Future changes should update the owning code, tests, and focused document in the
same pull request.
