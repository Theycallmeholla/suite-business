
# Suite Business Documentation

Welcome to the Suite Business documentation. This directory contains comprehensive guides for development, deployment, and features.

## Core Documentation

### Getting Started
- [**Development Guide**](DEVELOPMENT_GUIDE.md) - Local development setup and workflow
- [**API Documentation**](API_DOCUMENTATION.md) - Complete API reference

### Integration Guides
- [**Google Integration**](GOOGLE_INTEGRATION.md) - Google OAuth, Places API, and GBP setup
- [**GoHighLevel Guide**](GHL_COMPLETE_GUIDE.md) - Complete GHL integration guide
- [**Stripe Billing**](STRIPE_BILLING.md) - Payment processing and subscriptions

### Feature Documentation
- [**Onboarding Flow**](ONBOARDING.md) - User onboarding process
- [**Site Infrastructure**](SITE_INFRASTRUCTURE.md) - Site rendering and architecture
- [**Template System**](TEMPLATE_SYSTEM.md) - Template selection and customization
- [**Team Management**](TEAM_MANAGEMENT.md) - Roles, permissions, and team setup
- [**Content Editor**](CONTENT_EDITOR.md) - Inline content editing feature
- [**Enhanced Forms**](ENHANCED_FORMS.md) - Form builder and submissions
- [**Logo Upload**](LOGO_UPLOAD.md) - Logo management feature
- [**Custom Domains**](CUSTOM_DOMAINS.md) - Custom domain configuration
- [**Analytics Tracking**](ANALYTICS_TRACKING.md) - Analytics system implementation

### Industry-Specific
- [**Industry Setup Guide**](INDUSTRY_SETUP_GUIDE.md) - Configuring industry verticals
- [**Industry Standards - Landscaping**](INDUSTRY_STANDARDS_LANDSCAPING.md) - Landscaping-specific standards
- [**Landscaping Implementation**](LANDSCAPING_IMPLEMENTATION.md) - Landscaping website checklist

### Future Features (Not Yet Implemented)
- [**Intelligent Content Generation**](INTELLIGENT_CONTENT_GENERATION.md) - AI-powered content system
- [**Implementation Guide**](IMPLEMENTATION_GUIDE.md) - Zero-to-website implementation roadmap
- [**Research Data Format**](RESEARCH_DATA_FORMAT.md) - Market research data structure

### Reference
- [**User Training Manual**](USER_TRAINING_MANUAL.md) - End-user documentation

### Deployment
- [**Deploy VPS**](DEPLOY_VPS.md) - VPS deployment guide

## Quick Links

- Main README: [../README.md](../README.md)
- Code Standards: [../CLAUDE.md](../CLAUDE.md)
- Environment Example: [../.env.local.example](../.env.local.example)

## Documentation Standards

When updating documentation:
1. Keep dates current
2. Mark features as implemented/planned clearly
3. Use consistent formatting
4. Include code examples where helpful
5. Update this index when adding new docs

Last Updated: January 2025
=======
# Documentation Index

**Created**: December 28, 2024, 3:35 PM CST  
**Last Updated**: December 28, 2024, 3:35 PM CST

This directory contains all documentation for the Sitebango platform, organized by category for easy navigation.

## 📁 Directory Structure

### `/api/` - API Documentation
- **API_DOCUMENTATION.md** - Complete REST API reference with endpoints, request/response formats, and examples

### `/architecture/` - System Architecture & Design
- **IMPLEMENTATION_GUIDE.md** - Overall implementation guide and best practices
- **SITE_INFRASTRUCTURE.md** - Client site rendering system and subdomain routing
- **TEMPLATE_SYSTEM.md** - Template engine and theme architecture
- **TEMPLATE_SELECTION_IMPLEMENTATION.md** - New AI-powered template selection system
- **INTELLIGENT_CONTENT_GENERATION.md** - Smart content generation with data scoring

### `/deployment/` - Deployment & Infrastructure
- **DEPLOY_VPS.md** - Complete VPS deployment guide with nginx configuration

### `/development/` - Development Guides
- **DEVELOPMENT_GUIDE.md** - Development setup, practices, and conventions
- **GEMINI.md** - Gemini AI assistant context and instructions
- **ONBOARDING.md** - User onboarding flow documentation
- **template-selection-demo.ts** - Example code for template selection system

### `/features/` - Feature Documentation
- **ANALYTICS_TRACKING.md** - Analytics implementation and tracking events
- **AUTHENTICATION_FLOW.md** - Authentication system and user management
- **CONTENT_EDITOR.md** - Content editing features and WYSIWYG editor
- **CUSTOM_DOMAINS.md** - Custom domain support with DNS verification
- **ENHANCED_FORMS.md** - Advanced form handling and validation
- **LOGO_UPLOAD.md** - Logo upload, processing, and optimization
- **TEAM_MANAGEMENT.md** - Team structure and permission system
- **STRIPE_BILLING.md** - Payment integration and subscription management

### `/industries/` - Industry-Specific Implementation
- **INDUSTRY_STANDARDS_LANDSCAPING.md** - Landscaping industry best practices
- **LANDSCAPING_IMPLEMENTATION.md** - Complete landscaping site implementation
- **RESEARCH_DATA_FORMAT.md** - Standard format for industry research data

### `/integrations/` - Third-Party Integrations
- **GHL_COMPLETE_GUIDE.md** - GoHighLevel integration with SaaS mode
- **GOOGLE_INTEGRATION.md** - Google Business Profile and Places API

### `/reports/` - Analysis Reports & Status
- **PRODUCT_COMPLETION_ANALYSIS.md** - Feature completion status and roadmap
- **DOCUMENTATION_GAPS_ANALYSIS.md** - Missing documentation identification
- **ERROR_HANDLING_ANALYSIS.md** - Error handling review and improvements
- **SECURITY_ANALYSIS_REPORT.md** - Security assessment and recommendations
- **WORK_COMPLETED.md** - Log of completed development work
- **ACTION_ITEMS.md** - Pending tasks and action items
- **CUSTOM_DOMAIN_REVIEW.md** - Custom domain implementation analysis

### `/testing/` - Testing Documentation
- **TESTING.md** - Testing strategy, guidelines, and best practices
- **TESTING_COVERAGE_REPORT.md** - Test coverage analysis and gaps

### `/user-guides/` - User Manuals
- **USER_TRAINING_MANUAL.md** - End-user training guide
- **SITEBANGO_USER_TRAINING_MANUAL.md** - Comprehensive platform user manual

## 🚀 Quick Links

### For Developers
- [Development Setup](/development/DEVELOPMENT_GUIDE.md)
- [Architecture Overview](/architecture/IMPLEMENTATION_GUIDE.md)
- [API Reference](/api/API_DOCUMENTATION.md)

### For System Administrators
- [Deployment Guide](/deployment/DEPLOY_VPS.md)
- [Security Report](/reports/SECURITY_ANALYSIS_REPORT.md)
- [GoHighLevel Setup](/integrations/GHL_COMPLETE_GUIDE.md)

### For Product Managers
- [Product Status](/reports/PRODUCT_COMPLETION_ANALYSIS.md)
- [Action Items](/reports/ACTION_ITEMS.md)
- [Feature Documentation](/features/)

### For End Users
- [User Manual](/user-guides/USER_TRAINING_MANUAL.md)
- [Platform Guide](/user-guides/SITEBANGO_USER_TRAINING_MANUAL.md)

## 📝 Documentation Standards

1. **File Naming**: Use UPPERCASE with underscores for markdown files (e.g., `FEATURE_NAME.md`)
2. **Date Format**: Include creation and update dates at the top of each file
3. **Organization**: Place files in the most appropriate subdirectory
4. **Cross-References**: Use relative paths when linking between documents

## 🔍 Finding Information

- **By Feature**: Check `/features/` directory
- **By Integration**: Check `/integrations/` directory
- **By Industry**: Check `/industries/` directory
- **Implementation Details**: Check `/architecture/` directory
- **Current Status**: Check `/reports/` directory

