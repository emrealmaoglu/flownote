# ADR-001: JSONB for Block Storage

## Status
✅ **Kabul Edildi**

## Context (Bağlam)
FlowNote uygulamasında notlar, basit text yerine "Block" tabanlı bir yapıda saklanacaktır. Her not, farklı türlerde bloklar içerebilir: Text, Heading, Checkbox, Image.

## Decision (Karar)
PostgreSQL'in **JSONB** veri tipini kullanarak block'ları tek bir alan içinde saklayacağız.

### Neden JSONB?
1. **Esnek Yapı:** Yeni block tipleri eklendiğinde schema değişikliği gerektirmez
2. **Sorgulama:** PostgreSQL JSONB'de indexing ve query desteği sunar
3. **Performans:** Binary format sayesinde hızlı okuma/yazma
4. **Ordering:** Block'ların sırası `order` field ile korunur

### Alternatifler Değerlendirildi

| Alternatif | Neden Reddedildi |
|------------|------------------|
| Ayrı `blocks` tablosu | Gereksiz komplekslik, JOIN overhead |
| Plain JSON | JSONB'nin performans avantajlarından mahrum |
| NoSQL (MongoDB) | Proje PostgreSQL gereksinimine sahip |

## Consequences (Sonuçlar)

### Pozitif
- Tek tablo yeterli, schema basit kalır
- Frontend'e gönderilen data doğrudan kullanılabilir
- Block tipleri kolayca genişletilebilir

### Negatif
- JSONB içeriği için manuel validasyon gerekli (Zod ile çözüldü)
- Complex text search için pg_trgm extension'ı gerekebilir

## Implementation Notes
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{"blocks": []}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: GIN index for JSONB queries
CREATE INDEX idx_notes_content ON notes USING GIN (content);
```

---

**Karar Tarihi:** 2024-12-12
**Karar Veren:** @Arch
