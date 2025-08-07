# Life of Ki Tracking App - Database Setup

Deze folder bevat de complete database schema voor de Life of Ki Tracking App.

## 🗃️ Database Schema

Het `schema.sql` bestand bevat de volledige, up-to-date database structuur inclusief:

### Tabellen
- **`daily_entries`** - Dagelijkse Life of Ki entries met mood, energie, slaap, activiteiten
- **`nutrition_entries`** - Flexibele maaltijd tracking gekoppeld aan daily entries
- **`favorite_foods`** - Quick-add favoriete voedingsmiddelen met automatische generatie
- **`user_preferences`** - User instellingen (week start dag, theme)
- **`weekly_summaries`** - Wekelijkse samenvattingen en reflecties

### Beveiliging
- **Row Level Security (RLS)** op alle tabellen
- Alle policies geïmplementeerd voor complete data isolatie per gebruiker
- Alleen authenticated users hebben toegang

### Performance
- Optimale indexes voor alle query patterns
- Efficient lookups voor user data
- Foreign key constraints voor data integriteit

## 🚀 Setup Instructies

### Nieuwe Database Setup
1. Log in op je Supabase project dashboard
2. Ga naar de SQL Editor
3. Kopieer de volledige inhoud van `schema.sql`
4. Voer het script uit
5. Alle tabellen, policies, indexes en triggers worden aangemaakt

### Bestaande Database Update
Als je al een database hebt met oudere versie van dit schema:
1. **BELANGRIJK**: Maak eerst een backup van je data
2. Het schema gebruikt `IF NOT EXISTS` en `ADD COLUMN IF NOT EXISTS` voor veilige updates
3. Voer het volledige `schema.sql` script uit
4. Bestaande data blijft behouden, nieuwe kolommen worden toegevoegd

## ✅ Verificatie

Na het uitvoeren van het script, controleer of deze tabellen bestaan:
- `public.daily_entries`
- `public.nutrition_entries` 
- `public.favorite_foods`
- `public.user_preferences`
- `public.weekly_summaries`

En dat RLS is ingeschakeld op alle tabellen (zie Table Editor → Settings → Row Level Security).

## 📊 Data Model

```
users (Supabase Auth)
├── daily_entries (1:1 per dag per user)
│   └── nutrition_entries (1:many per daily entry)
├── favorite_foods (many per user)
├── user_preferences (1:1 per user)
└── weekly_summaries (1:1 per week per user)
```

## 🔧 Development

- **TypeScript types**: Worden gegenereerd in `/types/database.types.ts`
- **Client**: Unified Supabase client in `/lib/supabase/client.ts`
- **Auth**: Middleware protected routes voor `/dashboard/*`

## 📝 Schema Wijzigingen

Voor toekomstige schema wijzigingen:
1. Update `schema.sql` met nieuwe `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` statements
2. Test op development database
3. Update TypeScript types
4. Deploy naar production

**Geen aparte migratiebestanden meer** - alles zit in de centrale `schema.sql`.