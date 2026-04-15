# Custom Timer

Next.js + Ant Design 기반의 웹 타이머 앱입니다.

주요 기능:
- 남은 시간 비율에 따라 줄어드는 전체 배경 bar
- 총 시간 설정
- milestone 시간 + 목표 이름 설정
- 현재 milestone 강조 표시
- light / dark 모드
- bar 색상 선택
- ms 2자리 표시 옵션
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

호스트에서는 `127.0.0.1:8080` 으로 접근합니다.

헬스체크:

```bash
curl http://127.0.0.1:8080/api/healthz
```

## Stack

- Next.js
- React
- Ant Design
- Docker
