# THISISPEARWAY — Setup Guide

이 레포의 파일 구성과 어드민 셋업 방법.

## 파일 구성

```
/
├── index.html         # 메인 사이트 (정적, projects.json fetch)
├── admin.html         # 어드민 (Firebase Auth + Firestore + Storage)
├── projects.json      # 프로젝트 데이터 (admin에서 export)
├── favicon.svg        # 파비콘
├── robots.txt         # /admin 차단 권장
├── sitemap.xml
└── images/            # 정적 이미지 (선택)
```

## 데이터 흐름

```
admin.html (편집)
    ↓
Firestore (source of truth)
    ↓
[Export JSON ↓] 버튼
    ↓
projects.json 다운로드
    ↓
GitHub push → Vercel 자동 재배포
    ↓
index.html (projects.json fetch)
```

어드민에서 편집하면 Firestore에 즉시 반영되지만, **공개 사이트에 반영되려면 Export JSON 후 GitHub push 필요**. 정적 호스팅을 유지하기 위한 의도된 흐름.

## Firebase 설정 (admin.html이 동작하려면 필수)

### 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. **Add project** → 이름 자유롭게 (예: `pearway-admin`)
3. Google Analytics는 꺼도 됨

### 2. 서비스 활성화

#### Authentication
- **Build → Authentication → Get started**
- **Sign-in method** 탭 → **Google** 활성화
- Project support email 본인 이메일 입력 후 Save

#### Firestore Database
- **Build → Firestore Database → Create database**
- Location: **asia-northeast3 (Seoul)** 추천
- Start in **production mode**
- **Rules** 탭에서 아래 규칙으로 교체:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{document} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in [
                        'YOUR_EMAIL@gmail.com'
                      ];
    }
  }
}
```
→ `YOUR_EMAIL@gmail.com`을 본인 Google 계정 이메일로 교체.

#### Storage
- **Build → Storage → Get started**
- **Production mode**, location: **asia-northeast3**
- **Rules** 탭:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in [
                        'YOUR_EMAIL@gmail.com'
                      ];
    }
  }
}
```

### 3. Web App 등록 + Config 가져오기

- **Project Overview → 톱니바퀴 → Project settings**
- **Your apps** 섹션에서 **</> (Web)** 아이콘 클릭
- 앱 닉네임 자유 (예: `pearway-admin-web`), Firebase Hosting 체크 해제
- 등록 후 보여주는 **firebaseConfig 객체** 복사

### 4. admin.html에 Config 붙여넣기

`admin.html` 파일 안 `⚠️ CONFIG` 주석 아래 블록을 본인 값으로 교체:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "pearway-admin.firebaseapp.com",
  projectId: "pearway-admin",
  storageBucket: "pearway-admin.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};

const ALLOWED_EMAILS = [
  "본인@gmail.com"
];
```

### 5. 도메인 허용 (배포 후)

- Firebase Console → **Authentication → Settings → Authorized domains**
- `pearway.kr`, `www.pearway.kr`, `thisispearway.vercel.app` 등 사용하는 도메인 추가
- `localhost`는 기본 포함

## 사용 흐름

1. `pearway.kr/admin.html` 또는 `pearway.kr/admin` 접속
2. **Sign in with Google** → 허용된 계정으로 로그인
3. **+ New Project** 로 추가, 기존 카드는 **Edit** 로 수정
4. 이미지는 **Upload Image** 버튼으로 Firebase Storage에 업로드 (자동 URL 입력)
5. 편집 끝나면 **Export JSON ↓** 클릭 → `projects.json` 다운로드
6. 다운받은 파일을 레포 루트에 덮어쓰고 GitHub push
7. Vercel이 자동 재배포 → 공개 사이트 반영

## /admin 경로 보호 (권장)

`robots.txt` 에 추가:
```
User-agent: *
Disallow: /admin.html
Disallow: /admin
```

`vercel.json` 에 `/admin` → `/admin.html` rewrite를 추가하면 URL이 더 깔끔:
```json
{
  "rewrites": [
    { "source": "/admin", "destination": "/admin.html" }
  ]
}
```

## 비용

- Firebase **Spark 플랜 (무료)** 으로 충분
- Firestore: 50K reads/day, 20K writes/day 무료 — 개인 포트폴리오 어드민 용도로 절대 안 넘음
- Storage: 5GB 무료 + 1GB/day 다운로드 무료
- Auth: 무제한 무료
