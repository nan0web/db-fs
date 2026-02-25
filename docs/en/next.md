> 🌐 **Translations**: [Українська (Original)](../next.md)

# @nan0web/db-fs Plan

## Architecture 2.0

We are adopting a transparent **Mount/Attach** architecture defined in [ARCHITECTURE_2_0.md](../../db/ARCHITECTURE_2_0.md).

### Objectives

1. Implement `FSDriver` as a pure I/O backend (already done).
2. Ensure compatibility with `MountableDB` routing.
3. Test `fetch` fallback logic (e.g. `attach(new DBFS('/backup'))`).
