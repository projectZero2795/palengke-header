# @palengke/shared-header

Shared React header used by the Palengke ecosystem.

## Usage

Import the component and CSS from the package:

```tsx
import { PalengkeHeader } from "@palengke/shared-header";
import "@palengke/shared-header/styles.css";

<PalengkeHeader
  homeHref="https://palengke.es"
  currentApp="jobs"
  productLabel="Jobs"
  productHref="https://jobs.palengke.es"
  actions={<AccountMenu />}
/>
```

Keep app-specific authenticated menus, notifications, admin tools, and quick actions in the `actions` slot.

The shared ecosystem navigation shows all Palengke tools and marks the current app as the active pill, matching the production palengke.es header. Set `showCurrentAppLink={false}` only if a special surface must hide itself.


If no app-specific `actions` are provided, the header renders the shared ecosystem feature buttons plus Sign in / Sign up links to Palengke.es. It no longer renders a fake account avatar for anonymous visitors.
