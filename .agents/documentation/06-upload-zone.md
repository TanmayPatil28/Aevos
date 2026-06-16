# Component Documentation: UploadZone

## 1. Component Name and Path
- **Component Name**: `UploadZone`
- **File Path**: `components/os/records/UploadZone.tsx`

## 2. Simulated Data/Actions
This component simulates the upload and parsing delay of transcript PDFs by invoking a `setTimeout` callback.

### Simulated Data/Actions Code Snippets
The mock delay handler (Lines 12–18):
```tsx
const handleFileSelect = () => {
  onUploadStart();
  // Simulate network parsing delay
  setTimeout(() => {
    onUploadComplete();
  }, 2000);
};
```

## 3. Database/API Migration Plan

### Step 1: Real PDF Upload API
Create a backend route `POST /api/academic/upload` handling file uploads (e.g., using `multer` or Next.js App Router route handlers with `request.formData()`):
- Upload the PDF file to a cloud storage bucket (e.g. Supabase Storage, AWS S3) and retrieve the public file URL.
- Write a record to the `Document` database table:
  ```typescript
  const doc = await prisma.document.create({
    data: {
      userId,
      fileName: file.name,
      fileUrl: s3Url,
      fileType: "application/pdf",
      tags: ["transcript", "academic"]
    }
  });
  ```

### Step 2: PDF Parser Integration
1. Pass the PDF buffer to a parser utility (e.g., using `pdf-parse` library).
2. Scan the text coordinates or pattern match using regular expressions (or an LLM call to Gemini) to extract structured academic data:
   - Institution details, regulation years, schema version.
   - Semester codes, course codes, course names, credits, grades.
3. Compute the confidence score and save an `AcademicSnapshot`:
   ```typescript
   await prisma.academicSnapshot.create({
     data: {
       userId,
       sourceType: "pdf",
       sourceInstitution: "JSPM University",
       snapshotType: "transcript",
       parserVersion: "1.0.0",
       regulationVersion: "2019",
       normalizationVersion: "1.0",
       confidenceScore: 0.95,
       checksumHash: hashFile(fileBuffer),
       academicProfile: parsedJSON // Structuring semesters and courses
     }
   });
   ```

### Step 3: Frontend Event Trigger
Replace the `handleFileSelect` mock logic in `UploadZone.tsx` with a standard form upload request sending the selected file payload to `/api/academic/upload`. Trigger `onUploadComplete()` when the API successfully resolves the response.
