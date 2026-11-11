# Country attraction guides

V2 sidebar country entries open `#attractions/<country>`; list rows open `#attraction/<id>`.

The catalogue is `nordic-v2/attractions.json`, loaded only when a guide is opened. It is independent of daily activities, budget items, and booking data. A failed catalogue request leaves the daily itinerary usable and offers a retry.

- Preserve array order: it follows the actual travel days and driving/walking sequence, with optional detours beside the relevant segment. Norway visits southern Lofoten before returning north; Iceland goes east before the final westbound transfer.
- `days` refers to current V2 activity text, including explicitly conditional stops. An empty array displays **未包含**. A reference photo alone does not establish itinerary inclusion. Do not automatically add candidates to daily activities.
- Scores are editorial recommendations out of 10 based on February route fit, photography/design interests, and detour cost; they are not Google or public review scores. 9+ = 强烈推荐; 8+ = 值得去; below 8 = 有余裕再去. Visit durations are planning estimates.
- Every entry has its own detail route, map query, official information link, and contextual routing advice. Reuse a local photo only when it depicts that landmark; text-only details are supported.
- `attractionStage` in `app.js` supplies consecutive route-segment headings. Review it when adding IDs or changing itinerary order. Country tabs remain in the guide while viewing a list/detail. Returning from a detail restores list scroll position.

Initial catalogue checked 2026-11-11: Finland 7, Norway 25, Iceland 23, Denmark 11. Sources include official attraction websites, MyHelsinki, Visit Tromsø, Norwegian Scenic Routes, Visit South Iceland, Visit Reykjavík and Visit Copenhagen; source URLs are stored per entry. Opening times and prices are intentionally not copied into the catalogue.

## List photographs

All 66 rows have a landmark photograph on the left, with the route number inline before the title. Existing matching itinerary assets are reused; 28 additional Commons photos are stored as 320px thumbnails and up-to-960px detail images in `assets/attractions/`. Every additional photo records its author, licence, and original file page under `photos[].credit`; credits appear in a collapsed list disclosure and on detail captions. List crops and resizing are disclosed. Inspect a new photograph before adding it: article logos and photo montages are unsuitable.
