<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Data persists in browser localStorage via useLocal hook (src/lib/store.ts); no backend yet.
- Keep navigation order and swipe destinations in the shared navigation module so touch gestures and menu links agree.
- Mount the session-scoped intro around the shared layout, retaining child pages during the overlay to preserve page state.
- Web identity uses a CDN asset pointer; Android launcher/splash and public install icons remain real bundled image resources for offline packaging.
