# ARCHITECTURE STATUTE

- App Router 기반 페이지 구조를 사용한다.
- 공용 레이아웃과 내비게이션은 `components/app-shell.tsx`에서 관리한다.
- 인증은 Supabase Auth를 사용한다.
- 내 복용약 상태 저장은 Supabase `user_medications` 테이블을 사용한다.
- 의약품 마스터 데이터 조회는 Supabase `medications` 테이블을 기준으로 수행한다.
- `medications`는 공공 마스터 데이터이므로 `is_active = true` 범위의 공개 읽기 정책을 둘 수 있고, 사용자별 쓰기 권한은 열지 않는다.
