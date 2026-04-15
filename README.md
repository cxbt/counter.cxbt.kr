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
- 환경변수 기반 타이틀 설정

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

환경변수:

```bash
APP_TITLE=카운터
```

지정하지 않으면 기본값은 `카운터` 입니다.

## Docker

빌드 및 실행:

```bash
docker compose up -d --build
```

호스트 접근 주소:

```text
http://127.0.0.1:8080
```

컨테이너 환경변수 예시:

```bash
APP_TITLE=카운터 docker compose up -d --build
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

## Deploy

GitHub Actions 워크플로는 [`.github/workflows/deploy.yml`](/Users/s2w/Documents/LS2026/timer/.github/workflows/deploy.yml#L1) 에 있습니다.

필요한 GitHub Secrets:
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY` 또는 `DEPLOY_SSH_KEY_B64`
- `DEPLOY_PORT` 선택, 비우면 `22`

배포 방식:
- `main` 브랜치 push 또는 수동 실행
- 원격 서버의 `~/apps/<repo-name>` 에 배포
- `docker compose up -d --build --remove-orphans` 실행

원격 서버에서 타이틀을 바꾸려면 `~/apps/<repo-name>/.env` 또는 `~/apps/<repo-name>/.env.production` 에 아래처럼 넣으면 됩니다.

```bash
APP_TITLE=원하는 제목
```
