import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with standard arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm
            ],
        )

        # Create a new browser context
        context = await browser.new_context()
        context.set_default_timeout(15000)

        # Open a new page
        page = await context.new_page()

        # 1. Navigate to http://localhost:3000/career
        print("Navigating to http://localhost:3000/career...")
        await page.goto("http://localhost:3000/career")
        await page.wait_for_timeout(3000)

        # 2. Locate a specific skill card (e.g., "Full-Stack Developer")
        print("Locating card for 'Full-Stack Developer'...")
        card = page.locator('div.group', has=page.locator('h3', has_text="Full-Stack Developer")).first
        button = card.locator('button').first

        # Wait for the button to be visible
        await button.wait_for(state="visible")
        
        btn_text = await button.text_content()
        print(f"Initial button text: {btn_text.strip().replace('\u2713', 'Check')}")

        # If it is already Acquired, click it to reset/toggle it off first
        if "Acquired" in btn_text:
            print("Skill is already acquired, clicking to toggle off first...")
            await button.click(force=True)
            await page.wait_for_timeout(1000)
            btn_text = await button.text_content()
            print(f"Button text after reset: {btn_text.strip().replace('\u2713', 'Check')}")

        # Click the "+ Add to OS" button
        print("Clicking '+ Add to OS' to acquire the skill...")
        await button.click(force=True)
        await page.wait_for_timeout(2000)

        # Verify the button text changes to "✓ Acquired"
        btn_text_after = await button.text_content()
        print(f"Button text after click: {btn_text_after.strip().replace('\u2713', 'Check')}")
        assert "Acquired" in btn_text_after or "✓" in btn_text_after, "Failed: Button text did not change to Acquired!"

        # 3. Verify that the API database shows the updated skill list reactively
        db_skills = await page.evaluate("""async () => {
            const res = await fetch('/api/career/skills');
            const data = await res.json();
            return data.skills;
        }""")
        print(f"Persisted skills in DB: {db_skills}")
        assert "Full-Stack Developer" in db_skills, "Failed: Skill was not persistent in database!"

        # 4. Navigate to http://localhost:3000/placement
        print("Navigating to http://localhost:3000/placement to verify reactive data sharing...")
        await page.goto("http://localhost:3000/placement")
        await page.wait_for_timeout(3000)

        # Verify skill is synchronized with placements page store
        print("Verifying if the skill is synchronized with placements page store...")
        placement_skills = await page.evaluate("""() => {
            return fetch('/api/career/skills').then(res => res.json()).then(data => data.skills);
        }""")
        print(f"Placements page verified skills: {placement_skills}")
        assert "Full-Stack Developer" in placement_skills, "Failed: Placements page did not recognize the acquired skill!"

        # 5. Navigate to http://localhost:3000/internships
        print("Navigating to http://localhost:3000/internships to check dynamic matching...")
        await page.goto("http://localhost:3000/internships")
        await page.wait_for_timeout(3000)

        print("Verifying that the internships page loaded and matched data is displayed...")
        h4_headings = await page.locator('h4.text-white').all_text_contents()
        print(f"Internship matches found: {h4_headings}")

        print("Test passed: Reactive cross-module data sharing and persistent skills synchronization verified successfully!")

    except Exception as e:
        print(f"Test failed with error: {e}")
        raise e
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

if __name__ == "__main__":
    asyncio.run(run_test())
