#!/bin/bash
# ============================================================
# fix-images.sh — 이미지 확장자 불일치 자동 수정 (macOS/Linux 호환)
# ============================================================

set -e
cd "$(dirname "$0")"

echo "=== 이미지 확장자 불일치 검사 ==="

# macOS vs Linux sed 분기
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE() { sed -i '' "$@"; }
else
  SED_INPLACE() { sed -i "$@"; }
fi

FIXED=0
MISSING=0
OKAY=0

# 포스팅에서 참조하는 모든 이미지 경로 수집
REFERENCED=$(grep -roh "src: '[^']*'" posts/*.js | sed "s/src: '//;s/'$//" | sort -u)

for ref in $REFERENCED; do
  filepath="public${ref}"

  # 정상 존재
  if [ -f "$filepath" ]; then
    OKAY=$((OKAY + 1))
    continue
  fi

  # 디렉토리 확인
  dir=$(dirname "$filepath")
  if [ ! -d "$dir" ]; then
    echo "❌ 디렉토리 없음: $dir (참조: $ref)"
    MISSING=$((MISSING + 1))
    continue
  fi

  # 확장자 제거한 이름
  base=$(basename "$ref")
  name_noext="${base%.*}"

  # 대소문자 무시하고 같은 basename의 파일 찾기
  found=$(find "$dir" -maxdepth 1 -iname "${name_noext}.*" 2>/dev/null | head -1)

  if [ -n "$found" ]; then
    actual_name=$(basename "$found")
    expected_name=$(basename "$ref")

    if [ "$actual_name" != "$expected_name" ]; then
      new_path="/images/${actual_name}"
      echo "🔧 $ref → $new_path"

      # 모든 포스팅 파일에서 치환
      for post_file in posts/*.js; do
        if grep -q "$ref" "$post_file" 2>/dev/null; then
          SED_INPLACE "s|${ref}|${new_path}|g" "$post_file"
          echo "   ✅ $(basename $post_file) 수정됨"
          FIXED=$((FIXED + 1))
        fi
      done
    fi
  else
    echo "❌ 파일 없음: $ref"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
echo "=== 결과 ==="
echo "정상: ${OKAY}개"
echo "수정됨: ${FIXED}개"
echo "파일 없음: ${MISSING}개"
echo ""

# 검증
echo "=== JS 구문 검증 ==="
ERRORS=0
for f in posts/*.js; do
  if ! node --check "$f" 2>/dev/null; then
    echo "❌ 구문 에러: $f"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "✅ 모든 파일 정상"
else
  echo "⚠️ ${ERRORS}개 에러 발견"
fi
