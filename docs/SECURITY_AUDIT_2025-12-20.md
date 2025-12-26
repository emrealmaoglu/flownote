# 🔒 NPM Güvenlik Açıkları Raporu

**Tarih:** 20 Aralık 2025  
**Proje:** FlowNote Monorepo v2.0.0  
**Branch:** feature/sprint-14.2-migration-sync

---

## 📊 Özet

- **Toplam Açık:** 13
- **Kritik:** 0
- **Yüksek:** 5 🔴
- **Orta:** 4 🟡
- **Düşük:** 4 🟢

---

## 🔴 Yüksek Öncelikli Açıklar (High)

### 1. **@nestjs/cli** - Command Injection via glob
**Mevcut Versiyon:** `10.4.9`  
**Önerilen Versiyon:** `11.0.14`  
**CVE:** GHSA-5j98-mcp5-4vw2  
**CVSS Score:** 7.5  

**Problem:** glob CLI üzerinden komut enjeksiyonu saldırısı yapılabilir.

**Çözüm:**
```bash
npm install @nestjs/cli@11.0.14 --save-dev
```

---

### 2. **semantic-release** - Dependency Chain Vulnerability
**Mevcut Versiyon:** `22.0.12`  
**Önerilen Versiyon:** `21.1.2` (downgrade gerekli)  
**CVSS Score:** 7.5

**Problem:** @semantic-release/npm paketindeki glob bağımlılığı güvenlik açığı içeriyor.

**Çözüm:**
```bash
npm install semantic-release@21.1.2 --save-dev
npm install @semantic-release/npm@10.0.6 --save-dev
```

---

### 3. **@semantic-release/npm** - npm Dependency Vulnerability
**Mevcut Versiyon:** `11.0.3`  
**Önerilen Versiyon:** `10.0.6` (downgrade gerekli)  

**Problem:** İçerdiği npm paketi glob güvenlik açığından etkileniyor.

---

## 🟡 Orta Öncelikli Açıklar (Moderate)

### 4. **vite** - CORS Bypass via Development Server
**Mevcut Versiyon:** `5.4.21`  
**Önerilen Versiyon:** `7.3.0`  
**CVE:** GHSA-67mh-4wv8-2f99  
**CVSS Score:** 5.3

**Problem:** Development server'da herhangi bir web sitesi request gönderip response okuyabilir.

**Çözüm:**
```bash
cd frontend
npm install vite@7.3.0 --save-dev
```

---

### 5. **vitest** - Dependency Chain (vite + vite-node)
**Mevcut Versiyon:** `1.6.1`  
**Önerilen Versiyon:** `4.0.16`  
**CVSS Score:** 5.3

**Problem:** vite ve vite-node bağımlılıklarından kaynaklanan güvenlik açığı.

**Çözüm:**
```bash
npm install vitest@4.0.16 --save-dev
```

---

### 6. **esbuild** - Development Server Request Leakage
**Mevcut Versiyon:** `≤0.24.2`  
**Önerilen:** vite güncellemesiyle otomatik çözülür  
**CVE:** GHSA-67mh-4wv8-2f99  
**CVSS Score:** 5.3

---

## 🟢 Düşük Öncelikli Açıklar (Low)

### 7-10. **tmp, external-editor, inquirer, @angular-devkit/schematics-cli**
**CVSS Score:** 2.5

**Problem:** Symbolic link manipülasyonu ve geçici dosya güvenlik açıkları.

**Çözüm:** @nestjs/cli güncellemesiyle otomatik çözülür.

---

## ✅ Önerilen Aksiyon Planı

### 🚀 Hızlı Düzeltme (Breaking Changes İçerir)

```bash
# Root dizinde
npm install --save-dev \
  @nestjs/cli@11.0.14 \
  semantic-release@21.1.2 \
  @semantic-release/npm@10.0.6 \
  vite@7.3.0 \
  vitest@4.0.16
```

### ⚠️ Dikkat Edilmesi Gerekenler

1. **@nestjs/cli 11.x** - Major version update, breaking changes olabilir
2. **semantic-release 21.x** - Downgrade gerekiyor (v22'den v21'e)
3. **vite 7.x** - Major update, konfigürasyon değişiklikleri gerekebilir
4. **vitest 4.x** - API değişiklikleri olabilir, testler gözden geçirilmeli

### 🧪 Güncelleme Sonrası Test Adımları

```bash
# 1. Build testleri
npm run build

# 2. Unit testleri
npm run test

# 3. E2E testleri  
npm run test:e2e

# 4. Development server testi
npm run dev
```

---

## 📋 Alternatif Yaklaşım: Kademeli Güncelleme

Breaking changes'den kaçınmak için:

```bash
# 1. Sadece critical patches
npm audit fix

# 2. Minor updates
npm update

# 3. Manual review ve test sonrası major updates
```

---

## 🔗 Referanslar

- [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2) - glob CLI Command Injection
- [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) - esbuild CORS Bypass
- [GHSA-52f5-9888-hmc6](https://github.com/advisories/GHSA-52f5-9888-hmc6) - tmp Symbolic Link Attack

---

## 📝 Detaylı Vulnerability Listesi

```json
{
  "auditReportVersion": 2,
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 4,
      "moderate": 4,
      "high": 5,
      "critical": 0,
      "total": 13
    },
    "dependencies": {
      "prod": 445,
      "dev": 1278,
      "optional": 87,
      "peer": 32,
      "total": 1748
    }
  }
}
```

---

**Öneri:** Sprint 14.2 merge'den önce en azından yüksek öncelikli açıkları kapatmanızı öneririm. Major version update'leri için ayrı bir branch oluşturabilirsiniz.
