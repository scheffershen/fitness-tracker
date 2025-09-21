# VibeCoded Constitution

<!-- Sync Impact Report:
     Version change: Template → v1.0.0 (Initial constitution creation)
     Added sections:
     - Code Quality Principles
     - Testing Standards
     - User Experience Consistency
     - Performance Requirements
     - Mobile Development Practices
     Templates requiring updates: ✅ all current templates align
     Follow-up TODOs: None
-->

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)
All code MUST adhere to strict quality standards before integration. ESLint and Prettier MUST pass without warnings. TypeScript strict mode violations are forbidden. Code reviews MUST verify readability, maintainability, and adherence to established patterns. No code commits without passing the format and lint commands.

**Rationale**: Consistent code quality prevents technical debt accumulation and ensures long-term maintainability in a rapidly evolving React Native ecosystem.

### II. Test-First Development (NON-NEGOTIABLE)
Tests MUST be written before implementation using strict TDD methodology. Red-Green-Refactor cycle is mandatory for all features. Integration tests MUST cover user journeys end-to-end. Contract tests MUST validate component interfaces and API boundaries. No implementation without failing tests first.

**Rationale**: Mobile apps require high reliability due to update deployment challenges. TDD ensures functionality works across iOS, Android, and web platforms from the start.

### III. User Experience Consistency
UI components MUST follow established design patterns and accessibility standards. NativeWind styling MUST be consistent across platforms. Navigation patterns MUST be intuitive and follow platform conventions. Loading states, error handling, and user feedback MUST be implemented for all user interactions.

**Rationale**: Cross-platform consistency builds user trust and reduces learning curve. Accessibility ensures broader user adoption and regulatory compliance.

### IV. Performance Requirements
App startup time MUST be under 3 seconds on mid-range devices. Navigation transitions MUST maintain 60fps on target devices. Bundle size MUST be optimized with code splitting for web builds. Memory usage MUST not exceed 100MB baseline on mobile devices. Performance regression tests MUST be included in CI/CD.

**Rationale**: Mobile users expect instant responsiveness. Poor performance leads to immediate app abandonment and negative reviews.

### V. Mobile-First Architecture
Components MUST be designed for touch interfaces first, then adapted for web. Platform-specific code MUST be isolated using Expo's platform detection. Offline capabilities MUST be considered for all data operations. Native module integration MUST follow Expo's managed workflow constraints.

**Rationale**: Mobile-first ensures optimal experience on primary target platforms while maintaining web compatibility as a secondary concern.

## Testing Standards

All features MUST include comprehensive test coverage at multiple levels. Unit tests verify individual component behavior. Integration tests validate user workflows across screens. Contract tests ensure API and component interface stability. Performance tests validate responsiveness requirements. Manual testing scenarios MUST be documented for release validation.

**Testing Stack Requirements**:
- Jest for unit testing framework
- React Native Testing Library for component testing
- Detox or equivalent for end-to-end mobile testing
- Performance monitoring with appropriate tooling

## Development Workflow

Code changes MUST follow the feature branch workflow with required reviews. All commits MUST pass automated quality gates including linting, type checking, and test execution. Breaking changes MUST include migration documentation and backward compatibility strategies. Dependency updates MUST be tested across all target platforms before integration.

**Quality Gates**:
- ESLint and Prettier compliance (npm run lint)
- TypeScript type checking (tsc --noEmit)
- Test suite execution with coverage requirements
- Bundle size analysis and performance benchmarks

## Governance

This constitution supersedes all other development practices and MUST be followed without exception. Amendments require documented justification, team approval, and migration plan for existing code. All pull requests MUST verify constitutional compliance before merge approval.

Constitution violations require explicit justification in complexity tracking documentation. Use CLAUDE.md for runtime development guidance and project-specific implementation details.

**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21