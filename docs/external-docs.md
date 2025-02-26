# External Documentation Sources

This project uses Cursor's `@Docs` feature to integrate external documentation. The following sources have been added:

## SocialData API
- **Source**: [SocialData API Documentation](https://docs.socialdata.tools/)
- **Access**: Use `@Docs SocialData` in Cursor to access the documentation
- **Last Added**: February 26, 2024
- **Description**: Complete API documentation for the SocialData service, including endpoints for searching tweets, retrieving user profiles, and more.
- **Implementation Guide**: See `docs/implementation/socialdata-implementation.md` for our specific implementation details

## Adding More Documentation
To add more external documentation sources:
1. Type `@Docs` in Cursor
2. Select "Add new doc"
3. Paste the documentation URL (include trailing slash for subdirectories)
4. Wait for Cursor to index the documentation

## Using Documentation
Once added, you can access any documentation by:
1. Typing `@Docs` followed by the documentation name
2. Using it as context in your conversations with Cursor's AI assistant

## Project Documentation Structure
```
docs/
├── external-docs.md                 # This file
├── implementation/                  # Implementation guides
│   └── socialdata-implementation.md # SocialData implementation details
├── elizaos/                        # ElizaOS documentation
└── specs/                          # Project specifications
    ├── ELIZAOS_INTEGRATION.md
    └── PROJECT_PLAN.md
``` 