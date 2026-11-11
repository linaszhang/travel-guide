# V2 page header rules

Budget, packing, attraction lists and flight monitoring share the page-title font (600 Noto Serif SC / Songti), line height 1.4, zero title margin and the same top spacing. One CSS block at the end of nordic-v2/style.css owns these rules, including loading/error flight states.

| Viewport | Title size | Top spacing | Space before main content |
| --- | --- | --- | --- |
| Above 860px | 36px | 40px | 24px |
| 601–860px | 30px | 28px | 20px |
| 381–600px | 28px | 24px | 20px |
| Up to 380px | 26px | 24px | 20px |

Auxiliary actions stay right-aligned. The flight back arrow centers with the title and the daily-check label stays on one line. Attraction counts belong immediately below the heading, so that heading has no bottom margin before its subtitle. Packing progress starts at the same content gap as the budget/flight summary.

Home/country covers remain editorial hero headers; day, accommodation, activity and attraction detail titles remain inside content cards. They are separate hierarchy levels and do not inherit index-page spacing. V1 keeps its existing styles.
