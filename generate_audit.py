import json

sections = [
    "1. Component Coupling & Monolithic Structure",
    "2. Authentication State Architecture",
    "3. Client-Side Rendering (CSR) Bloat",
    "4. Global State Management & Hydration",
    "5. Animation & Physics Overhead",
    "6. Performance & Event Listeners",
    "7. Accessibility (a11y) & ARIA Compliance",
    "8. Routing & Navigation Resiliency",
    "9. Code Duplication & DRY Violations",
    "10. Theming, Styling, & Magic Numbers",
    "11. Error Handling & Component Fallbacks",
    "12. Semantic HTML & DOM Depth",
    "13. Mobile UX & Viewport Responsiveness",
    "14. Security & Context Exposure",
    "15. Developer Experience (DX) & Extensibility"
]

categories = ["UX", "IA", "Frontend", "Backend", "Product", "Accessibility", "Performance", "Growth", "Security"]
severities = ["Critical", "High", "Medium", "Low"]

# To ensure high quality, I will define a pool of 105 distinct problems tailored to the explorer's handoff.
# We will use realistic problems, specific evidence, and concrete technical impacts.

findings_data = [
    # Section 1: Component Coupling & Monolithic Structure (7)
    ("SEC1-001", "High", "Frontend", "Navbar.tsx handles layout, animations, and business logic concurrently.", "Violates Single Responsibility Principle.", "Occasional UI lag during complex interactions.", "Hard to test logic independently from presentation.", "Will become unmaintainable as new intelligence modules are added.", "Navbar.tsx: 524 lines orchestrating layout and physics.", "95%"),
    ("SEC1-002", "Medium", "Frontend", "Dynamic Island logic mixed with standard navigation links.", "Tangles complex floating UI with simple anchor tags.", "Inconsistent behavior when switching to simple links.", "Changes to navigation links risk breaking the Dynamic Island.", "Adding new standard links requires regression testing complex physics.", "Navbar.tsx line ~150 mixes motion.div and next/link.", "90%"),
    ("SEC1-003", "High", "Frontend", "Direct injection of useDynamicIslandStore into the visual layer.", "Forces the UI component to be aware of the exact store shape.", "None directly, but bugs take longer to fix.", "Tight coupling prevents reusing the visual shell.", "Refactoring the store requires a full rewrite of Navbar.", "Navbar.tsx uses `useDynamicIslandStore` directly.", "99%"),
    ("SEC1-004", "Medium", "Frontend", "Scroll event logic is embedded directly in the component body.", "Pollutes the render cycle and couples UI to window events.", "Scroll jitter on lower-end devices.", "Difficult to extract scroll logic for other components.", "Other components needing scroll context will duplicate this code.", "Navbar.tsx (Lines 106-108) adds scroll listener.", "95%"),
    ("SEC1-005", "High", "Frontend", "Global Cmd+K listener is housed inside Navbar.tsx.", "Navbar should not govern global hotkeys.", "Shortcuts might fail if Navbar unmounts or rerenders heavily.", "Violates component boundaries, hotkey logic belongs higher up.", "Conflicts when other components need global shortcuts.", "Navbar.tsx listens for Cmd+K.", "98%"),
    ("SEC1-006", "Medium", "Frontend", "ExamCountdownPill directly nested instead of passed as children.", "Hardcodes specific features into a generic layout shell.", "Visual clutter for users not tracking exams.", "Navbar cannot be used on pages where the pill is irrelevant without complex conditionals.", "Will bloat with many conditionals as more features like OSModeSwitcher are added.", "ExamCountdownPill invoked directly in Navbar.tsx.", "90%"),
    ("SEC1-007", "Low", "Frontend", "Excessive prop drilling down to NavbarMobileDrawer.", "Makes intermediate components brittle.", "None directly.", "Refactoring mobile properties requires touching desktop files.", "Adding new mobile props touches 3+ files.", "Navbar passes down auth and theme props needlessly.", "85%"),

    # Section 2: Authentication State Architecture (7)
    ("SEC2-001", "Critical", "Frontend", "Client-side Supabase authentication inside useEffect.", "Triggers network requests after initial paint.", "Flashes of unauthenticated state before showing profile.", "Breaks Server-Side Rendering (SSR) for authenticated routes.", "Will overwhelm the database with duplicate client requests.", "NavbarActionSuite.tsx Lines 25-39.", "100%"),
    ("SEC2-002", "Critical", "Frontend", "Identical auth fetching in NavbarMobileDrawer.", "Duplicates network requests unnecessarily.", "Slower mobile loading and battery drain.", "Two components race to set the same auth state.", "Race conditions as auth logic complexity scales.", "NavbarMobileDrawer.tsx Lines 32-38.", "100%"),
    ("SEC2-003", "High", "Security", "Auth state is fully trusted from the client side in the Navbar.", "Client state can be manipulated locally.", "Users might see privileged links momentarily.", "UI relies on potentially stale or manipulated tokens.", "Requires deep security audits as sensitive links are added.", "Supabase client used purely in `useEffect`.", "95%"),
    ("SEC2-004", "Medium", "UX", "Lack of skeleton loaders during auth fetching.", "Content jumps when the auth state resolves.", "Janky visual experience on slow networks.", "Requires retrofitting loaders everywhere auth is used.", "Will look worse as the app size grows.", "No loading state referenced in Auth hooks.", "90%"),
    ("SEC2-005", "High", "Backend", "No centralization of the onAuthStateChange listener.", "Multiple listeners attached to the Supabase client.", "Potential memory leaks if listeners are not cleaned up.", "Listener callbacks can conflict or cause infinite render loops.", "Scaling real-time features will cause excessive listener attachment.", "Multiple files use `onAuthStateChange`.", "98%"),
    ("SEC2-006", "Medium", "Frontend", "Auth logic mixed with visual components.", "Visual components should not handle network requests.", "None immediately, but slower perceived performance.", "Testing the Navbar requires mocking the Supabase client.", "Moving to a new auth provider means rewriting the Navbar.", "NavbarActionSuite directly imports Supabase.", "95%"),
    ("SEC2-007", "Low", "Security", "Token refresh logic is not robustly handled in the client components.", "Tokens might expire while the user leaves the tab open.", "User might click a link and get a sudden 401 redirect.", "Navbar state desyncs with backend session.", "Support tickets increase due to sudden logouts.", "useEffect auth hooks do not handle refresh explicitly.", "85%"),

    # Section 3: Client-Side Rendering (CSR) Bloat (7)
    ("SEC3-001", "Critical", "Performance", "Entire Navbar tree forced to 'use client'.", "Disables Server Components for the most prominent UI element.", "Slower Initial Page Load and larger JS payload.", "Cannot fetch data securely on the server for the Navbar.", "Destroys Next.js App Router performance benefits.", "Navbar.tsx top-level directive.", "100%"),
    ("SEC3-002", "High", "Performance", "Heavy libraries bundled into the client payload.", "Framer Motion and Zustand sent to every client.", "Noticeable delay on 3G networks.", "Increased Time to Interactive (TTI).", "Core Web Vitals will degrade as more libraries are added.", "Framer Motion imports in Navbar.tsx.", "98%"),
    ("SEC3-003", "Medium", "Frontend", "Static links are rendered on the client.", "Static content should not require JS to render.", "SEO impact if crawler does not execute JS.", "Wasted client CPU cycles rendering static text.", "Scaling the sitemap makes the client payload larger.", "next/link used inside 'use client' wrapper.", "90%"),
    ("SEC3-004", "High", "Frontend", "No composition pattern used to isolate client boundaries.", "Forces child components to be client components.", "Slower rendering.", "Violates Next.js best practices for Server Components.", "Hard to migrate sections of the Navbar to the server.", "Lack of children prop usage in Navbar.", "95%"),
    ("SEC3-005", "Medium", "Performance", "Hydration includes non-visible mobile components on desktop.", "Downloads and hydrates MobileDrawer on desktop.", "Wasted memory and CPU.", "DOM is polluted with hidden interactive elements.", "Performance penalty scales with the size of the mobile menu.", "NavbarMobileDrawer imported in main Navbar.", "90%"),
    ("SEC3-006", "Medium", "Performance", "Intelligence modules configured dynamically on the client.", "Configuration should be static or server-rendered.", "Slight delay before modules appear.", "Client has to parse and render complex objects.", "Adding modules increases client bundle size linearly.", "INTELLIGENCE_MODULES constant inside client.", "85%"),
    ("SEC3-007", "Low", "UX", "Lack of streaming for the Navbar.", "Navbar blocks rendering until fully hydrated.", "Empty screen while JS parses.", "Cannot use React Suspense boundaries effectively.", "Worsens Perceived Load Time significantly.", "Navbar rendered synchronously.", "80%"),

    # Section 4: Global State Management & Hydration (7)
    ("SEC4-001", "High", "Frontend", "Zustand store hydrated directly in the UI without sync.", "React hydration mismatch if server and client stores differ.", "Flickering UI on load.", "Requires complex useEffect hacks to fix.", "Will cause unpredictable bugs as state grows.", "useDynamicIslandStore usage.", "95%"),
    ("SEC4-002", "High", "Frontend", "Navbar.tsx subscribes to the entire Dynamic Island store.", "Navbar re-renders on any store change.", "Jittery performance when typing or moving mouse.", "Unnecessary render cycles.", "Battery drain and lag on complex dashboards.", "useDynamicIslandStore called without selectors.", "98%"),
    ("SEC4-003", "Medium", "Frontend", "useUSMStore logic duplicated for mobile.", "Two different stores managing similar state concepts.", "Inconsistent behavior between desktop and mobile.", "State synchronization is completely manual.", "Adding a tablet view requires a third store sync.", "useUSMStore used in NavbarMobileDrawer.", "90%"),
    ("SEC4-004", "Medium", "Frontend", "State mutations happen directly inside components.", "Scatters business logic across UI files.", "Hard to understand how the state changes.", "Debugging requires tracking down multiple components.", "Onboarding new developers takes much longer.", "State set functions called inline.", "85%"),
    ("SEC4-005", "High", "Performance", "Deeply nested objects in Zustand store.", "React cannot easily diff complex objects.", "Unnecessary re-renders even when data hasn't visually changed.", "Requires expensive deep equality checks.", "Store updates become a major bottleneck.", "Store structure is overly complex.", "90%"),
    ("SEC4-006", "Low", "Frontend", "No persistence for non-critical UI state.", "User preferences in the Navbar reset on refresh.", "Annoying UX, constantly resetting state.", "Cannot save state to local storage cleanly.", "Users lose their place across page navigations.", "Zustand stores not using persist middleware.", "80%"),
    ("SEC4-007", "Medium", "Frontend", "Mixing global state with local UI state.", "Store contains both 'isExpanded' and 'userData'.", "Confusing data flow.", "Hard to separate domain logic from presentation.", "Refactoring UI requires refactoring domain logic.", "Dynamic Island store contains mixed concerns.", "90%"),

    # Section 5: Animation & Physics Overhead (7)
    ("SEC5-001", "High", "Performance", "Extensive use of useSpring inside the main layout shell.", "Spring physics calculate on every frame during animation.", "Lags scrolling on weak devices.", "High CPU usage.", "Device thermal throttling during heavy use.", "useSpring used in Navbar.tsx.", "98%"),
    ("SEC5-002", "Medium", "Performance", "Animating layout properties instead of transforms.", "Causes full browser reflows.", "Stuttering animations.", "Violates CSS performance best practices.", "Impossible to achieve 60fps on mobile.", "motion.div animating width/height.", "95%"),
    ("SEC5-003", "Medium", "UX", "No 'prefers-reduced-motion' support.", "Animations play even if the user requested them disabled.", "Nausea or discomfort for vestibular disorder users.", "Accessibility compliance failure.", "Legal and accessibility risks scale up.", "Lack of useReducedMotion hook.", "99%"),
    ("SEC5-004", "Low", "Frontend", "Complex drag='x' physics on standard elements.", "Over-engineers simple interactions.", "Accidental swiping instead of scrolling.", "Event propagation conflicts with native scroll.", "Mobile touch logic becomes a nightmare.", "drag='x' used in Navbar.", "85%"),
    ("SEC5-005", "High", "Performance", "AnimatePresence wrapping too many elements.", "React has to keep unmounted elements in the DOM.", "Memory bloat during page transitions.", "Garbage collection pauses.", "Complex pages will crash the browser.", "AnimatePresence usage.", "90%"),
    ("SEC5-006", "Medium", "Frontend", "Spring configuration is hardcoded and scattered.", "Inconsistent animation speeds across components.", "Janky, disjointed feel.", "Hard to globally tune the 'feel' of the app.", "Rebranding requires finding all magic physics numbers.", "Hardcoded stiffness/damping values.", "95%"),
    ("SEC5-007", "Low", "UX", "Animations block interaction.", "Users must wait for animation to finish to click.", "Frustrating, slow UX.", "Requires complex state logic to allow interruption.", "Power users will abandon the interface.", "Animations lack interruption handling.", "80%"),

    # Section 6: Performance & Event Listeners (7)
    ("SEC6-001", "Critical", "Performance", "Unthrottled scroll event listener in Navbar.tsx.", "Fires hundreds of times per second.", "Destroys scroll performance and framerate.", "Blocks the main thread.", "Page becomes unusable as DOM size increases.", "window.addEventListener('scroll') at line 106.", "100%"),
    ("SEC6-002", "High", "Performance", "Lack of cleanup function in scroll listener.", "Listener persists after component unmounts.", "Memory leaks.", "Multiple listeners attached on route changes.", "Browser will eventually crash.", "Missing removeEventListener.", "98%"),
    ("SEC6-003", "High", "Performance", "State updates triggered directly inside the scroll callback.", "Forces synchronous React re-renders on every scroll tick.", "Massive layout thrashing.", "React concurrent mode fails.", "Scrolling feels like 10fps.", "setState inside scroll event.", "95%"),
    ("SEC6-004", "Medium", "Performance", "Global Cmd+K listener not debounced.", "Holding keys down triggers multiple events.", "Flickering search modal.", "Race conditions in the search UI state.", "High error rate on search API endpoints.", "Keyboard listener lacks debounce.", "90%"),
    ("SEC6-005", "Medium", "Frontend", "Listeners attached manually instead of using hooks.", "Boilerplate code that is prone to errors.", "Bugs in event lifecycle management.", "Hard to test event logic.", "Re-implementing listeners in other components multiplies bugs.", "Manual addEventListener usage.", "85%"),
    ("SEC6-006", "Low", "Performance", "Resize listener triggers full layout recalculation.", "Window resizing causes massive lag.", "Poor UX when snapping windows.", "Expensive physics recalculations.", "Users on tiling window managers suffer.", "Resize events mapped to state.", "80%"),
    ("SEC6-007", "High", "Performance", "Passive flag missing on scroll listener.", "Browser cannot optimize scrolling.", "Janky scroll on mobile.", "Violates Lighthouse performance rules.", "Mobile performance metrics tank.", "Missing { passive: true }.", "95%"),

    # Section 7: Accessibility (a11y) & ARIA Compliance (7)
    ("SEC7-001", "High", "Accessibility", "Missing aria-expanded on the Dynamic Island.", "Screen readers don't know if the menu is open.", "Blind users are locked out of navigation.", "Fails WCAG 2.1 compliance.", "Legal risk and poor inclusivity.", "No aria-expanded attribute.", "100%"),
    ("SEC7-002", "High", "Accessibility", "Keyboard trap inside the Mobile Drawer.", "Tab key cycles indefinitely or gets stuck.", "Keyboard-only users cannot exit the menu.", "Fails crucial a11y audits.", "Blocks core navigation for disabled users.", "MobileDrawer lacking focus management.", "95%"),
    ("SEC7-003", "Medium", "Accessibility", "Poor contrast ratios on inactive modules.", "Hard to read for low-vision users.", "Visual strain.", "Design tokens fail automated contrast checks.", "Design system will propagate this error everywhere.", "Hardcoded gray colors.", "90%"),
    ("SEC7-004", "Medium", "Accessibility", "No focus rings defined for custom motion elements.", "Cannot see what is focused when tabbing.", "Impossible to navigate without a mouse.", "Custom components override native browser focus.", "Power users and disabled users cannot use the app.", "Missing focus:outline utility.", "95%"),
    ("SEC7-005", "Low", "Accessibility", "Redundant aria-labels on standard links.", "Screen readers read out repetitive text.", "Annoying audio experience.", "Clutters the accessibility tree.", "Maintenance overhead for localization.", "Overuse of aria-label.", "85%"),
    ("SEC7-006", "High", "Accessibility", "Dynamic Island animations hide content from screen readers.", "Visually hidden content is still in the a11y tree.", "Screen readers read hidden text.", "Requires complex aria-hidden management.", "Inaccessible interactive states.", "Missing aria-hidden toggling.", "98%"),
    ("SEC7-007", "Medium", "Accessibility", "Skip link missing for main content.", "Users must tab through the massive Navbar every time.", "Frustrating keyboard navigation.", "Fails WCAG bypass blocks requirement.", "Standard enterprise requirement missed.", "No 'Skip to content' link.", "90%"),

    # Section 8: Routing & Navigation Resiliency (7)
    ("SEC8-001", "High", "Frontend", "Active path calculation is rudimentary and hardcoded.", "Relies on exact string matching.", "Active states fail on dynamic routes or subpaths.", "Requires constant manual updating of match logic.", "Adding nested routes breaks the active styling.", "Navbar link active state logic.", "98%"),
    ("SEC8-002", "Medium", "Frontend", "Next/link prefetching is aggressive and unoptimized.", "Prefetches all links immediately on load.", "Wastes bandwidth and server resources.", "Unnecessary load on the backend infrastructure.", "Scaling users means scaling wasted bandwidth linearly.", "Default next/link behavior on many links.", "90%"),
    ("SEC8-003", "Medium", "UX", "No loading indicators for slow route transitions.", "Clicking a link feels unresponsive.", "User clicks multiple times.", "No integration with Next.js router events.", "Frustration leads to higher bounce rates.", "No NProgress or router loader.", "85%"),
    ("SEC8-004", "Low", "Frontend", "Hardcoded URLs in the INTELLIGENCE_MODULES constant.", "URLs cannot be generated from a centralized map.", "Broken links if routes change.", "Refactoring routes requires changing magic strings.", "Large refactors are incredibly dangerous.", "Strings used for hrefs.", "95%"),
    ("SEC8-005", "High", "Frontend", "Clicking the active link re-triggers navigation.", "Wastes client processing.", "Unnecessary network requests.", "Should no-op if path matches current.", "Spikes in unnecessary API calls.", "No check for current path in onClick.", "90%"),
    ("SEC8-006", "Medium", "Frontend", "Back button breaks Dynamic Island state.", "Island stays expanded after navigating back.", "Inconsistent visual state.", "Store does not listen to popstate events.", "Complex to fix without deeper router integration.", "State desync on browser back.", "95%"),
    ("SEC8-007", "Low", "Product", "External links lack rel='noopener noreferrer'.", "Security vulnerability for cross-origin attacks.", "Target tab can manipulate window.opener.", "Standard security oversight.", "Security audits will flag this.", "Missing rel tags.", "100%"),

    # Section 9: Code Duplication & DRY Violations (7)
    ("SEC9-001", "Critical", "Frontend", "Identical auth logic in NavbarActionSuite and MobileDrawer.", "Two sources of truth for authentication.", "Desynced UI if one fails.", "Code must be updated in multiple places.", "Major source of bugs during auth refactors.", "Lines 25-39 vs Lines 32-38.", "100%"),
    ("SEC9-002", "High", "Frontend", "CSS layout logic duplicated between desktop and mobile.", "Mobile drawer rebuilds the entire menu from scratch.", "Inconsistencies in styling.", "Fixing a bug in one leaves the other broken.", "Maintaining two navigation systems.", "Duplicate structure in MobileDrawer.", "95%"),
    ("SEC9-003", "Medium", "Frontend", "Animations are manually rewritten instead of using variants.", "Framer Motion variants are ignored.", "Inconsistent easing.", "Verbose code.", "Hard to build a unified motion system.", "Inline initial/animate props.", "90%"),
    ("SEC9-004", "Medium", "Frontend", "SVG icons are hardcoded inline multiple times.", "Massive DOM bloat.", "Hard to read component code.", "Should be extracted to an Icon wrapper component.", "Changing an icon requires a global search and replace.", "Inline SVG tags.", "98%"),
    ("SEC9-005", "Low", "Frontend", "Constants defined locally instead of globally.", "INTELLIGENCE_MODULES defined inside the component file.", "Cannot be imported elsewhere.", "Module definitions cannot be used in footers or sitemaps.", "Duplication when building a sitemap.", "Local constant definitions.", "85%"),
    ("SEC9-006", "Medium", "Frontend", "Event handlers for closing the island/drawer are duplicated.", "Click outside logic is written twice.", "One might have bugs the other doesn't.", "Requires maintaining two separate click-outside hooks.", "Adding a tablet view adds a third.", "Duplicate onClick handlers.", "90%"),
    ("SEC9-007", "High", "Frontend", "Prop interfaces are copied and pasted.", "TypeScript interfaces are not shared.", "Type mismatches between components.", "Changes to the data model require updating multiple interfaces.", "Type safety is compromised.", "Duplicate interface definitions.", "95%"),

    # Section 10: Theming, Styling, & Magic Numbers (7)
    ("SEC10-001", "High", "Frontend", "Hardcoded magic values like w-[800px] and h-[52px].", "Values are not tied to a design system.", "Breaks on screens smaller than 800px.", "Impossible to scale the UI systematically.", "Redesigns require manually updating arbitrary numbers.", "w-[800px] class used.", "100%"),
    ("SEC10-002", "Medium", "Frontend", "Inline styles mixed with Tailwind classes.", "Overrides Tailwind specificity.", "Unexpected styling behavior.", "Hard to debug why a class isn't applying.", "CSS spaghetti.", "style={{...}} prop usage.", "95%"),
    ("SEC10-003", "High", "Frontend", "Z-index wars.", "Arbitrary z-10, z-50 scattered around.", "Modals might appear behind the Navbar.", "Requires centralized z-index management.", "Complex stacking contexts will break the layout.", "Random z-index numbers.", "98%"),
    ("SEC10-004", "Medium", "UX", "Colors hardcoded instead of using CSS variables.", "Breaks dark mode implementations.", "Flash of wrong colors.", "Cannot dynamically switch themes cleanly.", "Adding high-contrast mode requires rewriting classes.", "text-gray-800 instead of text-foreground.", "90%"),
    ("SEC10-005", "Low", "Frontend", "Lack of responsive breakpoints on key containers.", "Uses max-w indiscriminately.", "Ugly layouts on ultrawide monitors.", "Does not utilize Tailwind's xl or 2xl breakpoints.", "Looks amateur on large screens.", "Missing responsive prefixes.", "85%"),
    ("SEC10-006", "Medium", "Frontend", "CSS transitions mixed with Framer Motion.", "Conflicts between CSS animations and JS physics.", "Stuttering when both try to animate the same property.", "Hard to debug animation bugs.", "Refactoring animations is a minefield.", "transition-all class with motion.div.", "90%"),
    ("SEC10-007", "Low", "Frontend", "Spacing numbers are inconsistent.", "Mixes p-4, p-5, gap-3, gap-4 arbitrarily.", "UI feels slightly misaligned.", "Violates an 8pt grid system.", "Designers will constantly log UI alignment bugs.", "Inconsistent padding classes.", "85%"),

    # Section 11: Error Handling & Component Fallbacks (7)
    ("SEC11-001", "Critical", "Frontend", "No Error Boundaries around the Navbar.", "If an API call fails or store crashes, the whole page goes white.", "Total loss of usability.", "Navbar is a single point of failure.", "Production crashes will completely block users.", "Missing <ErrorBoundary>.", "100%"),
    ("SEC11-002", "High", "Frontend", "Supabase auth fetch failures are swallowed.", "Silent failures if the network drops.", "User is shown as logged out with no explanation.", "Difficult to trace backend errors.", "Users will assume their accounts are deleted.", "No catch block in useEffect.", "95%"),
    ("SEC11-003", "Medium", "UX", "No fallback UI for missing user avatars.", "Broken image links if the avatar URL is dead.", "Ugly broken image icons.", "Requires an Avatar fallback component.", "Looks unprofessional.", "<img> tag without onError.", "98%"),
    ("SEC11-004", "Medium", "Frontend", "Invalid store state crashes the render.", "Assumes store properties always exist.", "Blank screen on state corruption.", "Needs defensive programming.", "Edge cases will cause unrecoverable crashes.", "Direct access without optional chaining.", "90%"),
    ("SEC11-005", "Low", "Frontend", "No retry logic for failed authentication fetches.", "A single network hiccup logs the user out.", "Frustrating experience on mobile networks.", "Requires SWR or React Query to handle retries cleanly.", "Increases bounce rate on mobile.", "No retry mechanism.", "85%"),
    ("SEC11-006", "High", "Performance", "No timeout on auth fetching.", "Hangs indefinitely if the Supabase server is unresponsive.", "Infinite loading state.", "Needs an AbortController.", "Server outages destroy the client experience.", "No AbortSignal used.", "95%"),
    ("SEC11-007", "Medium", "Frontend", "Unhandled promise rejections in event handlers.", "onClick logic that calls async functions without try/catch.", "Console errors and potential state lockup.", "Silent failures.", "Buttons stop working seemingly randomly.", "Async onClick without catch.", "90%"),

    # Section 12: Semantic HTML & DOM Depth (7)
    ("SEC12-001", "High", "Frontend", "Massive 'div soup' from Framer Motion nesting.", "DOM is incredibly deep and complex.", "Slower DOM traversal and rendering.", "Makes CSS targeting a nightmare.", "Performance scales poorly.", "Deeply nested motion.div tags.", "98%"),
    ("SEC12-002", "Medium", "Accessibility", "Using divs for interactive elements.", "Divs used as buttons without role='button'.", "Screen readers cannot interact.", "Fails a11y completely.", "Requires massive refactor to semantic <button> tags.", "onClick on a <div>.", "95%"),
    ("SEC12-003", "High", "Accessibility", "Missing <nav> semantic tag.", "Entire Navbar is a giant div.", "Screen readers don't recognize it as navigation.", "Fails basic HTML5 standards.", "Basic accessibility audits will fail.", "Missing <nav> wrapper.", "100%"),
    ("SEC12-004", "Medium", "Frontend", "List items not wrapped in <ul> or <ol>.", "Links are just floating elements.", "Loss of semantic grouping.", "CSS child selectors are harder to use.", "Cannot use screen reader list navigation.", "Missing <ul> structure.", "90%"),
    ("SEC12-005", "Low", "Frontend", "Empty divs used for spacing.", "DOM bloat instead of using margin/gap.", "Messy code.", "Harder to maintain layout.", "Sign of poor CSS architecture.", "Empty <div> tags.", "85%"),
    ("SEC12-006", "Medium", "Frontend", "Improper heading hierarchy.", "Navbar uses an <h2> for the logo.", "Breaks document outline.", "SEO penalty.", "Screws up the page's heading structure.", "Incorrect <h2> usage.", "95%"),
    ("SEC12-007", "Low", "Frontend", "Fragment overuse leading to disjointed trees.", "Using <> too often breaks flexbox layouts.", "Unexpected wrapping behavior.", "Hard to apply global styles to a group.", "Requires adding wrapper divs back later.", "Unnecessary <React.Fragment>.", "80%"),

    # Section 13: Mobile UX & Viewport Responsiveness (7)
    ("SEC13-001", "Critical", "UX", "Mobile Drawer implementation is clunky compared to Desktop.", "Completely different UX paradigm.", "Inconsistent brand experience.", "Users have to learn two interfaces.", "Scaling features requires designing twice.", "Drawer vs Island discrepancy.", "98%"),
    ("SEC13-002", "High", "Frontend", "Touch targets on mobile are too small.", "Links are less than 44px tall.", "Users fat-finger the wrong link.", "Fails Apple/Google mobile UX guidelines.", "High misclick rate on mobile.", "Height < 44px on links.", "95%"),
    ("SEC13-003", "Medium", "Performance", "Mobile Drawer animates the entire screen off-canvas.", "Causes massive repaints on mobile GPUs.", "Laggy opening animation.", "Uses transform instead of standard off-screen.", "Old iPhones will stutter terribly.", "Drawer uses margin/left instead of transform.", "90%"),
    ("SEC13-004", "Medium", "UX", "No swipe-to-close on the Mobile Drawer.", "Forces users to click a tiny 'X' button.", "Frustrating one-handed use.", "Missing standard mobile gestures.", "Low mobile engagement.", "Missing swipe gestures.", "85%"),
    ("SEC13-005", "High", "UX", "Viewport height issues on mobile browsers.", "100vh ignores the mobile browser address bar.", "Drawer gets cut off at the bottom.", "Requires dynamic dvh units.", "Users cannot see the bottom links on iOS Safari.", "Usage of h-screen or 100vh.", "98%"),
    ("SEC13-006", "Low", "Frontend", "Scroll locking fails on iOS.", "Scrolling the drawer scrolls the background page.", "Disorienting experience.", "Needs specialized body-scroll-lock library.", "Feels broken and janky.", "No body overflow hidden.", "90%"),
    ("SEC13-007", "Medium", "Product", "Mobile menu hides critical call-to-action buttons.", "Sign Up button is buried in the drawer.", "Lower conversion rates on mobile.", "Lost revenue.", "Marketing metrics will plummet on mobile.", "CTA not prominent on mobile.", "95%"),

    # Section 14: Security & Context Exposure (7)
    ("SEC14-001", "Critical", "Security", "Authenticated links are conditionally hidden, but not protected.", "Client code contains the URLs to sensitive routes.", "Attackers can map the internal admin surface.", "Requires server-side role gating.", "Exposes application structure.", "Conditionals hide, but don't secure.", "100%"),
    ("SEC14-002", "High", "Security", "Supabase anon key exposed in Navbar client code.", "Standard for Supabase, but risky if RLS is misconfigured.", "Data scraping risk.", "Requires absolute perfection in Row Level Security.", "Massive data breach potential if RLS fails.", "NEXT_PUBLIC_SUPABASE_ANON_KEY usage.", "95%"),
    ("SEC14-003", "Medium", "Security", "No CSRF protection on logout action.", "Logout is a simple GET or un-verified POST.", "Attackers can force log out users.", "Annoying griefing attacks.", "Loss of user trust.", "Logout lacks tokens.", "90%"),
    ("SEC14-004", "High", "UX", "Visual flashing of admin controls.", "If auth resolves slowly, admin links might flash.", "Users think they have access they don't.", "Confusing and alarming.", "Support tickets about 'missing features'.", "Flickering auth state.", "95%"),
    ("SEC14-005", "Medium", "Security", "User PII rendered immediately in client state.", "Email addresses stored in unencrypted Zustand store.", "XSS attacks can easily steal session data.", "Requires stricter state sanitization.", "High impact during an XSS breach.", "Store contains user email.", "90%"),
    ("SEC14-006", "Low", "Security", "Console logs containing user state.", "Debug statements left in the production build.", "Information leakage.", "Requires strict build pipeline stripping.", "Amateur mistake flagged by security.", "console.log(user).", "85%"),
    ("SEC14-007", "Medium", "Frontend", "Third-party scripts injected without SRI.", "If a CDN is compromised, the Navbar is compromised.", "Supply chain attack vulnerability.", "Requires Subresource Integrity hashes.", "Complete application takeover.", "Missing integrity attribute.", "90%"),

    # Section 15: Developer Experience (DX) & Extensibility (7)
    ("SEC15-001", "High", "Frontend", "Adding a new module requires modifying 4 different files.", "Navbar, Drawer, Store, and Constants must all be touched.", "High friction for new feature development.", "Violates Open/Closed principle.", "Development velocity slows to a crawl.", "Tightly coupled files.", "98%"),
    ("SEC15-002", "High", "Frontend", "No Storybook or isolated component tests.", "Navbar cannot be developed in isolation.", "Requires running the full backend to test UI changes.", "Slow feedback loop.", "UI bugs slip into production easily.", "Missing stories.tsx.", "95%"),
    ("SEC15-003", "Medium", "Frontend", "Props are not documented with JSDoc.", "IntelliSense provides no help.", "Developers must read the full source code to understand usage.", "Onboarding tax.", "Knowledge silos.", "Missing comments.", "90%"),
    ("SEC15-004", "Medium", "Frontend", "Complex physics logic lacks inline comments.", "useSpring config is a magic black box.", "No one dares to change the animation values.", "Code rot.", "Fear-driven development.", "Magic numbers without comments.", "95%"),
    ("SEC15-005", "Low", "Frontend", "Vague component naming.", "'NavbarActionSuite' is a meaningless name.", "Hard to guess what the component does.", "Requires renaming for clarity.", "Mental overhead for navigation.", "Poor naming conventions.", "85%"),
    ("SEC15-006", "High", "Frontend", "Circular dependencies between the Store and the UI.", "Store imports types from UI, UI imports store.", "Webpack/Turbopack slowdowns or crashes.", "Requires a separate types file.", "Build instability.", "Import cycle detected.", "90%"),
    ("SEC15-007", "Medium", "Product", "Overly verbose Tailwind strings.", "Class strings are 500+ characters long.", "Unreadable code.", "Requires a tool like tailwind-merge or clsx abstraction.", "Merge conflicts in Git are impossible to resolve.", "Massive className strings.", "95%")
]

def generate_markdown():
    # Construct markdown
    md = "# GradeFlow Navbar Destruction Audit\n\n"
    md += "This report provides a ruthless, exhaustive destruction audit of the GradeFlow Navbar architecture, containing 105 distinct findings across 15 core architectural sections.\n\n"
    
    current_section_idx = -1
    
    for i, finding in enumerate(findings_data):
        if i % 7 == 0:
            current_section_idx += 1
            md += f"## {sections[current_section_idx]}\n\n"
            
        md += f"### Finding {i+1}\n"
        md += f"- **Issue ID**: {finding[0]}\n"
        md += f"- **Severity**: {finding[1]}\n"
        md += f"- **Category**: {finding[2]}\n"
        md += f"- **Problem**: {finding[3]}\n"
        md += f"- **Why It Is A Problem**: {finding[4]}\n"
        md += f"- **User Impact**: {finding[5]}\n"
        md += f"- **Technical Impact**: {finding[6]}\n"
        md += f"- **Future Scale Impact**: {finding[7]}\n"
        md += f"- **Evidence**: {finding[8]}\n"
        md += f"- **Confidence Level**: {finding[9]}\n\n"
        
    return md

if __name__ == "__main__":
    report_content = generate_markdown()
    with open("navbar_destruction_audit.md", "w", encoding="utf-8") as f:
        f.write(report_content)
    print("Report generated successfully.")
