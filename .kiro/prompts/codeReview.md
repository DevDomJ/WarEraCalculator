## Code Review Task

Perform a comprehensive code review of the uncommitted changes and generate a detailed review report.

### Review Criteria:

1. **Security & Sensitive Data**
   - Check for hardcoded credentials, API keys, tokens, or passwords
   - Identify any absolute paths specific to development or production systems
   - Flag any sensitive configuration data that should be externalized

2. **Code Quality & Standards**
   - Verify adherence to all project rules and coding standards
   - Identify code redundancies, duplication, and opportunities for DRY principles
   - Check for proper error handling and edge cases
   - Assess code readability and maintainability

3. **Best Practices**
   - Review naming conventions and consistency
   - Check for proper documentation and comments where needed
   - Identify potential performance issues or antipatterns
   - Verify proper resource management (e.g., file handles, connections)

4. **Architecture & Design**
   - Assess if changes follow established patterns and project structure
   - Identify potential violations of separation of concerns
   - Check for proper abstraction levels

### Output Requirements:

**Do NOT implement any changes or refactor the code.**

Create a structured markdown report with:
- **Summary**: Overview of findings (severity levels if applicable)
- **Detailed Findings**: For each issue:
  - Category (Security/Quality/Best Practice/Architecture)
  - Description of the issue
  - Location in code (file and approximate line or function)
  - Recommended solution
  - Rationale for the recommendation

Save the report as: `tmp/codeReview.md`

Note: Your recommendations will be reviewed by the implementing agent who has full context of the requirements and implementation decisions.