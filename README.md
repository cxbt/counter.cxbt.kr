# 카운터

Next.js + Ant Design 기반의 웹 카운트다운 앱입니다.

현재 기능:
- 전체 시간 설정
- 마일스톤 시간 + 이름 설정
- 남은 시간에 따라 줄어드는 카운터 바
- 마일스톤 라벨과 시각적 마커 표시
- `ms` 2자리 표시 옵션
- light / dark 모드
- 카운터 바 색상 변경
- 타이머 글자 크기 조절
- 카운터 바 높이 조절
- 설정값 `localStorage` 저장

## Local

의존성 설치:

```bash
npm install
```

개발 서버:

```bash
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run start
```

기본 포트는 `3000`입니다.

## Docker

빌드 및 실행:

```bash
docker compose up -d --build
```

호스트 접근 주소:

```text
http://127.0.0.1:8080
```

헬스체크:

```bash
curl http://127.0.0.1:8080/api/healthz
```

## Stack

- Next.js
- React
- Ant Design
- Docker
