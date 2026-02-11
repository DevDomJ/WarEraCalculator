# Time
## Purpose
This rule defines how kiro (the agent) handles time-related operations and queries
## Instructions
- When determining the current time, ALWAYS use bash commands with CET timezone: `date` (ID: GET_CET_TIME)
- When timestamps are needed for logging or documentation, use ISO format with CET timezone (ID: ISO_TIMESTAMP)
- When comparing times or calculating durations, ensure all times are in CET for consistency (ID: CONSISTENT_TIMEZONE)
- For time-sensitive operations, always verify the current CET time before proceeding (ID: VERIFY_TIME)
## Priority
Medium
## Error Handling
- If date command fails, note the system time issue and continue with available information
- If timezone conversion is needed, use appropriate date formatting commands