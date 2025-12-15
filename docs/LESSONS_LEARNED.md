# FlowNote - Lessons Learned & Common Pitfalls

Bu dosya, geliştirme sürecinde karşılaştığımız hataları ve çözümlerini içerir.
Yeni sprint başlamadan önce bu dosyayı okuyun!

---

## 🔴 Frontend Errors

### 1. process.env Vite'da Çalışmıyor
**Sprint:** 5 | **Dosya:** `ErrorBoundary.tsx`

**Hata:**
```
error TS2580: Cannot find name 'process'. 
Do you need to install type definitions for node?
```

**Yanlış:**
```typescript
{process.env.NODE_ENV === 'development' && ...}
```

**Doğru:**
```typescript
{import.meta.env.DEV && ...}
```

**Kural:** Frontend'de environment variable'lar için HER ZAMAN `import.meta.env` kullan!

---

### 2. react-refresh Warning - Export Components Only
**Sprint:** 5 | **Dosya:** `Toast.tsx`

**Hata:**
```
warning: Fast refresh only works when a file only exports components
```

**Çözüm:** Component ve utility fonksiyonlarını ayrı dosyalara böl:
- `Toast.tsx` → Sadece `ToastProvider` component
- `lib/toast.ts` → `showSuccess`, `showError` helpers

---

### 3. Commit Message Case Sensitivity
**Sprint:** 4 | **Tüm commitler**

**Hata:**
```
✖ subject must be lower-case [subject-case]
```

**Yanlış:**
```
feat(config): Add SQLite support
```

**Doğru:**
```
feat(config): add sqlite support
```

**Kural:** Commit subject'leri HER ZAMAN küçük harfle başla!

---

## 🟡 Backend Errors

### 4. TypeORM Type Compatibility
**Sprint:** 4 | **Dosya:** `app.module.ts`

**Hata:**
```
Type 'better-sqlite3' is not assignable to type...
```

**Çözüm:** Return type explicitly belirt:
```typescript
useFactory: (config: ConfigService): TypeOrmModuleOptions => { ... }
```

---

### 5. User Entity Email Nullable
**Sprint:** 4 | **Dosya:** `user.entity.ts`

**Dikkat:** Admin kullanıcısı için email nullable olmalı:
```typescript
@Column({ type: 'varchar', nullable: true })
email: string | null;
```

---

## 🟢 CI/CD Errors

### 6. EGITNOPERMISSION - Semantic Release
**Sprint:** 3 | **Dosya:** `.github/workflows/ci.yml`

**Hata:**
```
EGITNOPERMISSION: Cannot push to the Git repository
```

**Çözüm:** `GH_TOKEN` secret oluştur ve repository'de "Contents: Read and write" izni ver.

---

### 7. Docker Build - npm ci vs npm install
**Sprint:** 1 | **Dosya:** `Dockerfile`

**Hata:**
```
npm ci requires package-lock.json
```

**Çözüm:** Monorepo workspace'lerde `npm install` kullan, `npm ci` değil.

---

## ✅ Best Practices Checklist

Her PR'dan önce kontrol et:

- [ ] Frontend'de `process.env` yerine `import.meta.env` kullandım
- [ ] Component dosyalarında sadece component export ediyorum
- [ ] Commit mesajları küçük harfle başlıyor
- [ ] TypeORM return type'ları explicit
- [ ] Docker build local'de test edildi
- [ ] Lint ve build geçiyor

---

## 📚 Dosya Konumları

| Dosya | Konum |
|-------|-------|
| Bu döküman | `.ai-context/LESSONS_LEARNED.md` |
| Roadmap | `.ai-context/ROADMAP.md` |
| ADR'lar | `.ai-context/ADR/` |
