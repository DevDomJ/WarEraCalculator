# Frontend - React
## Purpose
Defines how to act when writing React
## Instructions
- ALWAYS evaluate reusability potential for new visual elements using these criteria: used in 2+ places, has configurable props, or represents a common UI pattern. (ID: EVALUATE_REUSABILITY)
- If reusability potential is high (meets 2+ criteria above), create a dedicated component in appropriate folder (components/, shared/, or ui/) with clear prop interfaces and JSDoc comments. (ID: CREATE_REUSABLE_COMPONENT)
- When creating reusable components, include explicit comments explaining: purpose, key props, usage examples, and any important behavior. (ID: DOCUMENT_COMPONENTS)
- Follow existing component structure and naming conventions found in the project's components folder. (ID: FOLLOW_CONVENTIONS)
- Prefer composition over inheritance - create small, focused components that can be combined. (ID: PREFER_COMPOSITION)
## Priority
Medium
## Error Handling
- If component folder structure is unclear, place new components in src/components/ and ask user for preferred organization
- If existing conventions are inconsistent, follow the most recent or most common pattern and note the inconsistency