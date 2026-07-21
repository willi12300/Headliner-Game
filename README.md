# Headliner Coherent Derived Values Patch

Extract this archive into the Headliner project root and replace matching files.

## Changes

- Replaces independently randomised band values with one causal calculation layer.
- Adds Overall Quality, Growth Ceiling, Live Performance, Catalogue Quality, Reputation, Commercial Appeal, Fan Loyalty, Festival Draw and Booking Fee.
- Keeps legacy ability fields as synchronised aliases for save and simulation compatibility.
- Recalculates band fundamentals during simulation using the same shared functions.
- Adds expandable “Why this value?” breakdowns in Developer Mode.
- Adds coherence validation rules and a derived-values specification.

## Run

```powershell
npm run tauri dev
```

Generate a new test world. Existing in-memory worlds must be regenerated because their band records do not contain the new calculation breakdowns.
