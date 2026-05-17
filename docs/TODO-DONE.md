# TODO DONE

- AYAK 1차 MVP 범위를 목업 기반 프론트엔드와 데모 세션 구조로 확정
- README와 stitch 목업을 기준으로 홈, 검색, 상세, 내 복용약, 로그인, 회원가입, 마이페이지를 구현
- 로컬 세션과 더미 의약품 데이터 기반으로 1차 사용자 흐름을 검증 가능하게 구성
- Supabase Auth 기반 로그인, 회원가입, 로그아웃, 보호 라우트 구조를 연결
- `user_medications` 테이블을 기준으로 내 복용약 등록, 조회, 삭제를 DB 연동으로 전환
- `medications` 테이블 생성 및 테스트 seed 적재 후 홈, 검색, 상세, 내 복용약 화면의 의약품 조회를 Supabase DB 기준으로 전환
- 공공데이터포털 `DrbEasyDrugInfoService`를 수집해 `medications` 테이블에 upsert하는 자동 적재 스크립트와 실행 경로를 추가
- 공공 의약품 적재 스크립트를 실제 실행해 총 4742건을 `medications` 테이블에 적재했고, 배치 내부 중복 `itemSeq` 제거 로직을 반영했다
