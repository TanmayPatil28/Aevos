# Component Documentation: CalendarManager

## 1. Component Name and Path
- **Component Name**: `CalendarManager`
- **File Path**: `components/dashboard/CalendarManager.tsx`

## 2. Simulated Data/Actions
This component manages upcoming academic events, displaying a button to automatically generate subtask preparation checklists. It simulates this generation by triggering a 1500ms timeout that appends a static checklist array to the local event state.

### Simulated Data/Actions Code Snippets
The mock AI subtask generator (Lines 166–177):
```tsx
const handleAIGenerate = (eventId: string, eventName: string) => {
  setIsGeneratingId(eventId);
  setTimeout(() => {
    const mockSubtasks = [
      { id: `st_${Date.now()}_1`, title: `Analyze syllabus & weightage for ${eventName}`, completed: false },
      { id: `st_${Date.now()}_2`, title: `Complete 3 official mock test papers`, completed: false },
      { id: `st_${Date.now()}_3`, title: `Active recall session for weak topics`, completed: false }
    ];
    updateEventSubtasks(eventId, mockSubtasks);
    setIsGeneratingId(null);
  }, 1500);
};
```

## 3. Database/API Migration Plan

### Step 1: Database Schema Expansion
Create a relational model `CalendarSubtask` associated with the `AcademicCalendarEvent` table:
```prisma
model CalendarSubtask {
  id        String   @id @default(cuid())
  eventId   String   @map("event_id")
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  event     AcademicCalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
}
```
Update the `AcademicCalendarEvent` model in `schema.prisma` to include:
```prisma
subtasks CalendarSubtask[]
```

### Step 2: AI Subtask Generator API
Implement a POST API route `/api/ai/calendar/subtasks`:
1. Receive `eventId` and `eventName` parameters.
2. Formulate a prompt for Gemini describing the event context:
   - "Generate exactly 3 specific, actionable steps a college student should take to prepare for the academic event: '{eventName}'. Respond strictly in a JSON array of strings."
3. Parse the LLM's response and save the entities to the database using Prisma:
   ```typescript
   const generatedTitles = JSON.parse(geminiResponseText);
   const subtasks = await prisma.$transaction(
     generatedTitles.map(title => 
       prisma.calendarSubtask.create({
         data: { eventId, title }
       })
     )
   );
   ```

### Step 3: Frontend Binding
Replace the local `setTimeout` generator inside `CalendarManager.tsx` with a POST request to `/api/ai/calendar/subtasks` and update the UI checklist state with the returned list of database subtasks.
