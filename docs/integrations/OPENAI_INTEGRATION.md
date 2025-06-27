# OpenAI Integration and Intelligent Content Generation

**Created**: June 26, 2025, 10:00 AM CST
**Last Updated**: June 26, 2025, 10:00 AM CST

## 1. Overview

The Sitebango platform leverages OpenAI's powerful language models to provide an "Intelligent Content Generation System." This system is designed to automatically generate high-quality, industry-specific content for client websites, significantly reducing the manual effort required for site setup and content creation. By integrating with OpenAI, Sitebango can dynamically produce engaging and relevant text based on collected business data, user interactions, and industry profiles.

The primary goal of this integration is to:
- Automate content creation for various sections of a client's website.
- Enhance content quality and relevance through data-driven insights.
- Provide a progressive content enhancement experience, where content improves as more business data becomes available.
- Support multi-industry content generation tailored to specific business verticals.

## 2. Architecture and Integration Points

OpenAI integration is primarily managed through the `/app/api/intelligence` API routes and the core intelligence system logic within the `/lib/intelligence` directory.

### API Endpoints:
- **`/app/api/intelligence/analyze`**: Analyzes collected business data and calculates a content score across various categories (basic info, content, visuals, trust, differentiation). This score helps determine content density and quality.
- **`/app/api/intelligence/questions`**: Generates "smart questions" based on identified data gaps. These questions are presented to the user via interactive UI components to gather more specific information.
- **`/app/api/intelligence/answers`**: Stores user responses to the smart questions, enriching the business's data profile.
- **`/app/api/intelligence/generate`**: The core endpoint responsible for invoking OpenAI to generate content. It takes all available business data, industry context, and user-provided answers to produce relevant text for different site sections.

### Core Logic:
- **`/lib/intelligence-system.ts`**: This module encapsulates the main business logic for the intelligent content generation system. It orchestrates data analysis, question generation, and content synthesis. It interacts with OpenAI's API, handles prompt engineering, and manages the flow of information.
- **`/lib/intelligence/prompts.ts`**: Contains the various prompt templates used to guide OpenAI's content generation for different sections (e.g., Hero, About, Services). These prompts are dynamically populated with business-specific data.
- **`/lib/intelligence/data-transformers.ts`**: Responsible for transforming raw business data (from GBP, user input, etc.) into a structured format suitable for OpenAI prompts.

### Data Flow:
1.  **Data Collection**: Information is gathered from multiple sources:
    -   Google Business Profile (GBP) data (via `/lib/google-business-profile.ts`).
    -   User input through "Smart Question Components" (e.g., TinderSwipe, ThisOrThat, StylePicker, FontPairing, MultipleChoice) located in `/components/SmartQuestionComponents`.
    -   Industry-specific profiles and default content.
2.  **Data Analysis & Scoring**: The `/app/api/intelligence/analyze` endpoint processes the collected data, identifies gaps, and assigns a content score.
3.  **Question Generation**: If data gaps exist, `/app/api/intelligence/questions` generates targeted questions.
4.  **Content Generation**: The `/app/api/intelligence/generate` endpoint, powered by `intelligence-system.ts`, constructs a comprehensive prompt using all available data and sends it to OpenAI.
5.  **Site Population**: The generated content is then used to populate various sections of the client's website, dynamically rendered by the site infrastructure (e.g., `/components/site-sections/`).

## 3. Content Generation Process

The intelligent content generation process is designed to be iterative and progressively enhanced:

1.  **Initial Data Ingestion**: When a new business is onboarded, initial data is pulled from Google Business Profile (if available) or manually entered.
2.  **Data Scoring**: The system analyzes the completeness and quality of the initial data, assigning a "content density" score.
3.  **Smart Questioning (if needed)**: If the content score is low or specific information is missing, the system intelligently generates questions to fill these gaps. These questions are presented to the user through interactive UI components.
4.  **User Interaction**: Users answer the smart questions, providing more detailed and nuanced information about their business.
5.  **Content Generation**: With a richer dataset, the system constructs a detailed prompt for OpenAI, requesting content for specific sections of the website (e.g., "Generate a compelling 'About Us' section for a landscaping business specializing in sustainable design, located in Austin, TX, with 15 years of experience, and a focus on customer satisfaction.").
6.  **Progressive Enhancement**: As more data is collected over time (e.g., through additional user input, CRM integrations), the generated content can be refined and improved, leading to a higher quality and more personalized website.

## 4. Key Components and Files

-   **`/app/api/intelligence/...`**: API routes for all intelligence-related operations.
-   **`/lib/intelligence-system.ts`**: The central orchestrator for content generation.
-   **`/lib/intelligence/prompts.ts`**: Defines the OpenAI prompt templates.
-   **`/lib/intelligence/data-transformers.ts`**: Prepares data for OpenAI prompts.
-   **`/components/SmartQuestionComponents/...`**: UI components for interactive data collection.
-   **`/lib/business-intelligence.ts`**: Likely contains logic related to data analysis and scoring.
-   **`/lib/site-builder.ts`**: Integrates generated content into the site structure.

## 5. Environment Configuration

To enable OpenAI integration, the following environment variable must be configured in your `.env.local` file:

-   `OPENAI_API_KEY`: Your secret API key obtained from OpenAI.

Example:
```
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

## 6. Usage and Extension

### Generating Content:
To trigger content generation for a specific site section, you would typically make a request to the `/api/intelligence/generate` endpoint, providing the necessary business context and the desired content type.

### Extending Prompts:
Developers can extend the content generation capabilities by:
-   Adding new prompt templates in `/lib/intelligence/prompts.ts` for new site sections or content types.
-   Modifying existing prompt templates to refine the generated output.
-   Enhancing the data transformation logic in `/lib/intelligence/data-transformers.ts` to provide more nuanced input to OpenAI.

### Adding New Smart Questions:
To collect more specific data points, new smart question components can be developed and integrated into the onboarding or data collection flows. These components should be placed in `/components/SmartQuestionComponents` and their data integrated into the `intelligence-system.ts` for prompt generation.

## 7. Important Considerations

-   **API Cost Management**: OpenAI API calls incur costs. The system is designed to optimize calls by:
    -   Leveraging existing data (GBP, user input) to minimize redundant generation.
    -   Using a data scoring algorithm to determine when content generation is most beneficial.
    -   Caching generated content where appropriate.
-   **Prompt Engineering**: The quality of generated content heavily depends on the prompts. Continuous refinement of prompts in `/lib/intelligence/prompts.ts` is crucial for optimal results.
-   **Data Privacy**: Ensure that sensitive business or user data is handled securely and not inadvertently exposed to OpenAI beyond what is necessary for content generation.
-   **Content Review**: While AI-generated content is powerful, it should always be reviewed for accuracy, tone, and brand consistency before final deployment.
-   **Rate Limits**: Be mindful of OpenAI's API rate limits and implement appropriate retry mechanisms or back-off strategies if necessary.
