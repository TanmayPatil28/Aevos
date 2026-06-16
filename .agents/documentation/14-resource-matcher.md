# Component Documentation: ResourceMatcherWidget

## 1. Component Name and Path
- **Component Name**: `ResourceMatcherWidget`
- **File Path**: `components/backlog/ResourceMatcherWidget.tsx`

## 2. Simulated Data/Actions
This component recommends study materials, YouTube playlists, and solved question paper PDFs corresponding to the target backlog course. It displays a static list of video lectures and hardcoded PDF document parameters.

### Simulated Data/Actions Code Snippets
Mock playlist names and resource text labels (Line 39, Line 57):
- `"Neso Academy (42 videos)"`
- `"Last 5 Semesters (Solved)"`

Static Unsplash video thumbnail placeholder (Lines 73–77):
```tsx
src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"
```

Hardcoded list of video items and details (Lines 87–94):
```tsx
<p className="text-[15px] text-white">Up Next: Complex Variables (15:20)</p>
...
<p className="text-[15px] text-[#8E8E93]">Lecture 3: Theorems (22:10)</p>
```

Hardcoded solved papers file name and sizes (Lines 110–111):
```tsx
{targetCourse.code}_Solved_Papers.pdf
12.5 MB • 45 Pages
```

## 3. Database/API Migration Plan

### Step 1: Study Resources Schema
Define a new schema `StudyResource` linked to the `Course` model in `schema.prisma` to catalog validated books, links, and PDF files:
```prisma
model StudyResource {
  id        String   @id @default(cuid())
  courseId  String   @map("course_id")
  title     String
  type      String   // VIDEO | PDF | TEXTBOOK
  url       String
  metadata  Json?    // Stores size, pageCount, thumbnail, videoDuration
  createdAt DateTime @default(now()) @map("created_at")

  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

### Step 2: YouTube Integration or Curated API
Write a backend endpoint `/api/courses/[courseId]/resources` that:
1. Queries curated `StudyResource` entries linked to the `courseId`.
2. Connects to the YouTube Data API v3 (using `/youtube/v3/search` and `playlistItems`) to pull actual playlists if no static database resource entries are listed. Use query strings like `courseCode + courseName + " tutorial"` to pull relevant channels/videos.
3. Queries uploaded files in the `Document` database model matching the course code tag:
   ```typescript
   const pdfs = await prisma.document.findMany({
     where: {
       userId,
       tags: { hasEvery: [courseCode, "solved_paper"] }
     }
   });
   ```

### Step 3: Frontend Integration
Modify `ResourceMatcherWidget.tsx` to call `/api/courses/[courseId]/resources`, map the returned files and video arrays, and render the dynamic metadata in place of the static placeholders.
