# Redundancies
## Purpose
This rule aims to prevent redundant code in the application. The frontend should avoid handling data logic that is probably already handled somewhere in backend. Instead, values that the frontend needs to display should be calculated by the backend and made available through an API.

## Instructions
- The frontend should largely avoid calculating complex data itself. Instead, data that should be displayed in frontend should be calculated in backend and fetched by the frontend via some API (ID: CALCULATE_DATA_IN_BACKEND)
- Redundant code should be avoided for maintainability reasons. When writing new code, check if similar code already exists in the project and try resolving that by a modular approach: Create a method that handles that logic and call that method in all places instead. (ID: ONCE_AND_ONLY_ONCE)
- When creating reusable components or functions, prefer extracting them to shared locations (backend services, frontend components) rather than duplicating logic (ID: EXTRACT_TO_SHARED)
- If the same calculation, validation, or transformation appears in 2+ places, it's a candidate for extraction (ID: TWO_STRIKES_RULE)
- UI patterns that repeat (icons, cards, forms) should become reusable components with props for customization (ID: COMPONENTIZE_PATTERNS)

## Priority
Medium

## Error Handling
- If you can't easily extract a method and call it from all places, then leave it how it is, but notify the user about the conflict
- If extraction would make the code significantly more complex, document why duplication was chosen