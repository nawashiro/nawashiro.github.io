# Tasks

## 1. Identify rendering surfaces

- [x] 1.1 Inventory emoji-bearing content in the current exported HTML and trace its source through Markdown and React rendering; verify the inventory includes article and non-article pages and representative code examples.

## 2. Render Twemoji at generation time

- [x] 2.1 Add text-node-only Twemoji conversion to the article HTML generation path; verify tests show image markup for prose and literal emoji in code/pre and attributes.
- [x] 2.2 Render Twemoji for emoji-bearing React page content during static generation with matching hydration output; verify exported non-article HTML contains Twemoji images and a browser run has no hydration mismatch.
- [x] 2.3 Remove the post-mount `react-twemoji` substitution and pin compatible parser/CDN asset versions without downloading image assets; verify the client bundle no longer invokes DOM-based emoji replacement.

## 3. Verify end-to-end behavior

- [x] 3.1 Build the static export and inspect representative article and non-article HTML for Twemoji images, emoji `alt` text, CDN URLs, and preserved literal code examples; verify behavior before JavaScript executes and run the relevant test suite.
