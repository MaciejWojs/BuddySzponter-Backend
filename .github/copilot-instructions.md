# BuddySzponter-Backend — ARCHITEKTURA I MAPA PROJEKTU

---

## 1. Architektura i Stos

- **Język:** TypeScript (ESNext, strict)
- **Runtime:** Bun
- **Framework HTTP/API:** Hono (REST, OpenAPI, Zod)
- **WebSocket:** socket.io (z bun-engine)
- **ORM:** drizzle-orm (PostgreSQL)
- **Cache:** Valkey (klient Redis)
- **Logger:** winston
- **Konteneryzacja:** Docker, Docker Compose
- **Reverse Proxy/WAF:** nginx (OWASP CRS)
- **Brak Electron/Vue/Pinia/Worker** — projekt to czysty backend (brak renderer/main process, brak frontendu)

---

## 2. Mapa Katalogów

- **src/** — kod źródłowy
  - **config/** — provider i walidacja env
  - **core/** — (miejsce na logikę core, obecnie puste)
  - **infrastucture/**
    - **db/** — klient drizzle, schema, base DAO
    - **cache/** — klient Valkey, baseCacheDao
    - **logger/** — winston
    - **factories/** — DaoFactory, CacheDaoFactory, DbDaoFactory
    - **event-bus/**, **ws/** — (szablony, obecnie puste)
  - **modules/**
    - **auth/** — autoryzacja (api, use-cases, entities, value-objects)
    - **users/** — użytkownicy (api, dao, cache, value-objects)
    - **sessions/**, **roles/**, **devices/**, **connection/** — analogiczna struktura DDD
  - **shared/**
    - **api/** — openapi, middleware, schemas
    - **types/** — typy dzielone (np. UserDbRecord)
    - **value-objects/** — ConnectionId, DeviceId, IpAddress, RoleId, userId
- **drizzle/** — migracje SQL
- **nginx-waf/** — konfiguracja reverse proxy/WAF

---

## 3. Kluczowe Moduły i Implementacje

- **WebSocket:**
  - Inicjalizacja: [`src/socket.ts`](../src/socket.ts)
  - Integracja z Hono: [`src/index.ts`](../src/index.ts)
- **Autoryzacja:**
  - OpenAPI/Routes: [`src/modules/auth/api/auth.openapi.ts`](../src/modules/auth/api/auth.openapi.ts), [`src/modules/auth/api/auth.routes.ts`](../src/modules/auth/api/auth.routes.ts)
  - Schematy: [`src/modules/auth/api/schemas/`](../src/modules/auth/api/schemas/)
  - Value Objects: [`src/modules/auth/domain/value-objects/`](../src/modules/auth/domain/value-objects/)
- **Użytkownicy:**
  - DAO: [`src/modules/users/infrastructure/dao/user.dao.ts`](../src/modules/users/infrastructure/dao/user.dao.ts)
  - Cache: [`src/modules/users/infrastructure/cache/usersCache.dao.ts`](../src/modules/users/infrastructure/cache/usersCache.dao.ts)
  - Typy: [`src/shared/types/UserDB.ts`](../src/shared/types/UserDB.ts)
- **Obsługa błędów:**
  - Middleware: [`src/shared/api/middleware/validator-wrapper.ts`](../src/shared/api/middleware/validator-wrapper.ts)
  - OpenAPI: [`src/shared/api/openapi/error.openapi.ts`](../src/shared/api/openapi/error.openapi.ts)
- **Baza danych:**
  - Schema: [`src/infrastucture/db/schema.ts`](../src/infrastucture/db/schema.ts)
  - Klient: [`src/infrastucture/db/client.ts`](../src/infrastucture/db/client.ts)
- **Cache:**
  - Klient: [`src/infrastucture/cache/client.ts`](../src/infrastucture/cache/client.ts)
- **Logger:**
  - [`src/infrastucture/logger/index.ts`](../src/infrastucture/logger/index.ts)
- **Fabryki DAO:**
  - [`src/infrastucture/factories/`](../src/infrastucture/factories/)

---

## 4. Konwencje Projektowe

- **API:**
  - REST, OpenAPI (Zod), walidacja przez zod-openapi i custom hooki
  - Błędy walidacji: HTTP 422, format: `{ field, error }`
  - Błędy serwera: HTTP 500, format: `{ message, errors }`
- **Baza danych:**
  - Dostęp przez DAO (DrizzleUserDao, BaseDao)
  - Migracje: katalog `drizzle/`
- **Cache:**
  - DAO cache (UsersCacheDao, BaseCacheDao), TTL domyślnie 60s
- **Logger:**
  - winston, poziomy zależne od env
- **Formatowanie:**
  - ESLint (`eslint.config.mjs`), Prettier (`.prettierrc`)
  - Sortowanie importów, zakaz nieużywanych importów
- **Ścieżki aliasów:**
  - Zdefiniowane w `tsconfig.json` (`@modules/*`, `@infra/*`, `@shared/*`, `@logger`)
- **DDD:**
  - Moduły podzielone na warstwy: api, application, domain, infrastructure
- **Brak frontendu, rendererów, workerów**

---

## 5. Notatki
- Projekt nie zawiera obsługi WebRTC, DXGI/WGC, Electron, Vue, Pinia, ani typów IPC.
- Całość to backend REST+WebSocket, z silnym podziałem na warstwy DDD i naciskiem na typowanie oraz walidację.
