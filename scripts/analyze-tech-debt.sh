#!/bin/bash

LOG_FILE="tech_debt_analysis.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================="
echo "FLOWNOTE TECH DEBT ANALYSIS - $(date)"
echo "=========================================="

# 1. TODO/FIXME/HACK
echo -e "\n=== 1. TODO/FIXME/HACK ANALİZİ ==="
echo "--- Toplam Sayılar ---"
echo "TODO: $(grep -rn "TODO" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"
echo "FIXME: $(grep -rn "FIXME" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"
echo "HACK: $(grep -rn "HACK" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"
echo "XXX: $(grep -rn "XXX" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"

echo -e "\n--- Backend TODO/FIXME Listesi (İlk 30) ---"
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" backend/src/ 2>/dev/null | head -30

echo -e "\n--- Frontend TODO/FIXME Listesi (İlk 30) ---"
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" frontend/src/ 2>/dev/null | head -30

# 2. any Type
echo -e "\n=== 2. ANY TYPE ANALİZİ ==="
echo "--- Toplam any Kullanımı ---"
echo "Backend: $(grep -rn ": any" --include="*.ts" backend/src/ 2>/dev/null | wc -l)"
echo "Frontend: $(grep -rn ": any" --include="*.ts" --include="*.tsx" frontend/src/ 2>/dev/null | wc -l)"
echo "Shared: $(grep -rn ": any" --include="*.ts" shared/ packages/ 2>/dev/null | wc -l)"

echo -e "\n--- Backend any Detayları (İlk 25) ---"
grep -rn ": any\|as any\|<any>" --include="*.ts" backend/src/ 2>/dev/null | head -25

echo -e "\n--- Kritik any Kullanımları (services, controllers) ---"
grep -rn ": any" --include="*.service.ts" --include="*.controller.ts" backend/src/ 2>/dev/null

# 3. Console Usage
echo -e "\n=== 3. CONSOLE.LOG ANALİZİ ==="
echo "--- Toplam Console Kullanımı ---"
echo "console.log: $(grep -rn "console\.log" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"
echo "console.error: $(grep -rn "console\.error" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"
echo "console.warn: $(grep -rn "console\.warn" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)"

echo -e "\n--- Backend Console Kullanımları (İlk 20) ---"
grep -rn "console\." --include="*.ts" backend/src/ 2>/dev/null | grep -v "// console" | head -20

# 4. Logger Infrastructure
echo -e "\n=== 4. LOGGING ALTYAPISI ==="
echo "--- Winston/Logger Kurulumu ---"
grep -rE "winston|@nestjs/common.*Logger|LoggerService" backend/package.json backend/src/ 2>/dev/null | head -15

echo -e "\n--- Logger Usage Examples ---"
grep -rn "private.*logger\|this\.logger\|Logger\." --include="*.ts" backend/src/ 2>/dev/null | head -10

# 5. Error Handling
echo -e "\n=== 5. ERROR HANDLING ANALİZİ ==="
echo "--- Try-Catch Blokları ---"
grep -rn "try {" --include="*.ts" backend/src/ 2>/dev/null | wc -l

echo "--- Empty Catch Blocks ---"
grep -rn -A 2 "catch.*{" --include="*.ts" backend/src/ 2>/dev/null | grep -E "catch.*{\s*}" | head -10

# 6. Code Duplication / Metrics
echo -e "\n=== 6. CODE DUPLICATION/METRICS ==="
echo "--- Büyük Dosyalar (300+ satır) ---"
find . -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | xargs wc -l 2>/dev/null | sort -rn | head -15

# 7. Coverage Gaps
echo -e "\n=== 8. TEST COVERAGE ANALİZİ ==="
echo "Backend spec files: $(find backend -name "*.spec.ts" 2>/dev/null | wc -l)"

echo "--- Missing Service Tests ---"
for service in $(find backend/src -name "*.service.ts" 2>/dev/null); do
  spec="${service%.ts}.spec.ts"
  if [ ! -f "$spec" ]; then
    echo "Missing: $spec"
  fi
done

# 8. TypeScript Config
echo -e "\n=== 10. TYPESCRIPT CONFIG ==="
echo "--- Backend Strictness ---"
cat backend/tsconfig.json 2>/dev/null | grep -E "strict|noImplicit|null"

echo "=========================================="
echo "ANALYSIS COMPLETE"
