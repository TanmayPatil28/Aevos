# Component Documentation: StudySquadWidget

## 1. Component Name and Path
- **Component Name**: `StudySquadWidget`
- **File Path**: `components/backlog/deep-dive/StudySquadWidget.tsx`

## 2. Simulated Data/Actions
This component simulates a classroom peer study circle, including simulated chat rooms, randomized online student counts, fake file download progress calculations, and automatic bot-typing replies.

### Simulated Data/Actions Code Snippets
Mock peer messages list (Lines 16–19):
```tsx
const [messages, setMessages] = useState<Message[]>([
  { id: "1", sender: "U1", text: "Does anyone know if the third module is heavily weighted?", isSelf: false, color: "#FF9F0A" },
  { id: "2", sender: "U2", text: "Yes, check the historical analytics widget. It's usually 30% of the paper.", isSelf: false, color: "#30D158" },
]);
```

Randomized online peer calculator (Line 24):
```tsx
const activePeers = Math.floor(Math.random() * 15) + 3; 
```

Simulated file download progress interval (Lines 26–40):
```tsx
const interval = setInterval(() => {
  progress += Math.random() * 20;
  if (progress >= 100) {
    progress = 100;
    clearInterval(interval);
  }
  setDownloadProgress(prev => ({ ...prev, [unit]: progress }));
}, 200);
```

Faked chatbot reply delay and message generation (Lines 57–70):
```tsx
setTimeout(() => {
  setIsTyping(true);
  setTimeout(() => {
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: "U3",
      text: "Yeah I agree with that. The PYQs are a lifesaver.",
      isSelf: false,
      color: "#BF5AF2"
    }]);
  }, 2500);
}, 1000);
```

Hardcoded Master Notes documents mapping (Lines 143–177).

## 3. Database/API Migration Plan

### Step 1: Real-Time Chat Infrastructure
Create database tables for real-time channels and messages:
```prisma
model Channel {
  id        String    @id @default(cuid())
  courseId  String    @unique
  messages  ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(cuid())
  channelId String
  userId    String
  content   String
  createdAt DateTime @default(now())
  channel   Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
}
```
Set up a real-time provider (like Pusher or WebSockets) to broadcast messages to all active clients instantly on the channel matching `courseId`.

### Step 2: Accurate Peer Tracking
Rather than utilizing a randomizer, track active sessions:
- Count the number of active sessions in the last 15 minutes for students enrolled in the same course code.
  ```typescript
  const onlineCount = await prisma.session.count({
    where: {
      user: { enrollments: { some: { courseId } } },
      expires: { gte: new Date() }
    }
  });
  ```

### Step 3: Document Retrieval and Progress Events
1. Query verified syllabus files and study guides from the database:
   ```typescript
   const resources = await prisma.document.findMany({
     where: { tags: { has: courseCode } }
   });
   ```
2. Replace the faked `setInterval` loops with actual Axios download requests using `onDownloadProgress` callbacks to map real network transmission progress to the UI.

### Step 4: AI Study Assistant
Map user input messages to an API route `/api/ai/study-bot` running Gemini. Pass the syllabus/course context, fetch a real explanation, and stream the generated response to the chat feed.
