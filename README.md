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
