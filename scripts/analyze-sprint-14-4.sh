#!/bin/bash

echo "=========================================="
echo "SPRINT 14.3 POST-STATUS - $(date)"
echo "=========================================="

echo -e "\n=== GIT STATUS ==="
git status
git log --oneline -5

echo -e "\n=== BRANCH STATUS ==="
git branch -a | head -10

echo -e "\n=== FRONTEND ANY TYPE ANALYSIS ==="
echo "Total 'any' in frontend/src:"
grep -rn ": any\|as any\|<any>" --include="*.ts" --include="*.tsx" frontend/src/ 2>/dev/null | wc -l

echo -e "\n--- Category Distribution ---"
echo "Components:" $(grep -rn ": any" --include="*.tsx" frontend/src/components/ 2>/dev/null | wc -l)
echo "Hooks:" $(grep -rn ": any" --include="*.ts" frontend/src/hooks/ 2>/dev/null | wc -l)
echo "Services:" $(grep -rn ": any" --include="*.ts" frontend/src/services/ 2>/dev/null | wc -l)
echo "Store/State:" $(grep -rn ": any" --include="*.ts" frontend/src/store/ frontend/src/state/ 2>/dev/null | wc -l)
echo "Utils:" $(grep -rn ": any" --include="*.ts" frontend/src/utils/ 2>/dev/null | wc -l)
echo "Types:" $(grep -rn ": any" --include="*.ts" frontend/src/types/ 2>/dev/null | wc -l)

echo -e "\n--- Top 10 Critical Files ---"
grep -rn ": any\|as any" --include="*.ts" --include="*.tsx" frontend/src/ 2>/dev/null | cut -d: -f1 | sort | uniq -c | sort -rn | head -10

echo -e "\n=== CONSOLE.LOG ANALYSIS ==="
echo "Backend:" $(grep -rn "console\." --include="*.ts" backend/src/ 2>/dev/null | grep -v node_modules | wc -l)
echo "Frontend:" $(grep -rn "console\." --include="*.ts" --include="*.tsx" frontend/src/ 2>/dev/null | grep -v node_modules | wc -l)
echo "Packages:" $(grep -rn "console\." --include="*.ts" packages/ shared/ 2>/dev/null | grep -v node_modules | wc -l)

echo -e "\n=== API DOCUMENTATION ANALYSIS ==="
echo "Swagger related matches:"
grep -E "swagger|@nestjs/swagger|@ApiTags|@ApiOperation" backend/package.json backend/src/**/*.ts 2>/dev/null | wc -l
echo "Controller count:" $(find backend/src -name "*.controller.ts" 2>/dev/null | wc -l)
echo "Endpoints with @ApiOperation:" $(grep -r "@ApiOperation" backend/src 2>/dev/null | wc -l)

echo -e "\n=== TEST COVERAGE ANALYSIS ==="
echo "Backend unit tests:" $(find backend -name "*.spec.ts" 2>/dev/null | grep -v e2e | wc -l)
echo "Backend E2E tests:" $(find backend -name "*.e2e-spec.ts" 2>/dev/null | wc -l)
echo "Frontend tests:" $(find frontend -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)

echo -e "\n=== SECURITY ANALYSIS ==="
echo "Hardcoded secrets check (potential):"
grep -rn "password.*=\|secret.*=\|api_key\|apiKey" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".example" | grep -v "changeme" | head -5

echo -e "\n=== SUMMARY METRICS ==="
echo "Frontend Any: $(grep -rn ": any\|as any" frontend/src 2>/dev/null | wc -l)"
echo "Console Logs: $(grep -rn "console\." backend/src frontend/src packages/ 2>/dev/null | grep -v node_modules | wc -l)"
