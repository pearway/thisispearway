# 이미지 교체 가이드 (직접 사진 넣기)

아래 폴더에 **같은 파일명으로 덮어쓰기**만 하면 사이트 사진이 바뀝니다.
(GitHub에서 폴더 열기 → Add file → Upload files → 같은 이름으로 올리기 → Commit)

## 1. 정적 이미지

| 위치 | 파일 | 권장 비율 |
|---|---|---|
| 소개 프로필 | `images/profile/portrait.jpg` | 세로 3:4 |
| 이야기 썸네일 | `images/journal/01.jpg` `02.jpg` `03.jpg` | 세로 4:5 |
| 공유 미리보기(OG) | `images/web/og-thumbnail.jpg` | 1200×630 |

## 2. 프로젝트(Work) 사진 — 폴더 방식

프로젝트 목록과 정보는 `projects.json` 에 있고, 사진은 프로젝트별 폴더에 넣습니다.
각 폴더에 **`cover.jpg`** 를 넣으면 카드/상세 대표 이미지가 됩니다. (없으면 글자 폴백 표시)

```
images/works/woosundam/cover.jpg          우선담
images/works/chicken-farmers/cover.jpg    치킨파머스
images/works/duomo-pizza/cover.jpg        듀오모피자
images/works/mini-warehouse-darak/cover.jpg  미니창고 다락
images/works/jindaegam/cover.jpg          진대감
images/works/grace-serif/cover.jpg        우아한 세리프
images/works/toucan/cover.jpg             큰부리새
```

- **상세 페이지에 사진 더 넣기**: 해당 폴더에 사진을 아무 이름으로 넣고,
  `projects.json` 의 그 프로젝트 `"images": []` 배열에 경로를 적으면 상세에 순서대로 표시됩니다.
  예: `"images": ["images/works/woosundam/1.jpg", "images/works/woosundam/2.jpg"]`
- **새 프로젝트 추가**: `projects.json` 에 항목 추가 + `images/works/<새-폴더>/` 만들고 저에게 말해주세요.
- 파일 형식: jpg / png / webp 모두 가능. cover 는 이름을 `cover.jpg` 로 맞춰주세요.
