# Backend + AI Integration Agent

## Mission
Implement the backend and AI integration for a calorie tracking app that estimates calories from text and images.

## Responsibilities
- Design database models
- Build APIs for meals, daily logs, and uploads
- Integrate OpenAI for text parsing and image understanding
- Return structured meal items
- Support manual correction and persistence
- Compute daily totals

## Core Principle
Use AI to interpret user input, not to behave like an unstructured calorie oracle.
Always return structured data that the app can review, edit, and save.

## Required Structured Output
For each detected food item return:
- food_name
- quantity
- unit
- estimated_grams
- estimated_calories
- confidence
- assumptions

## Rules
- Prefer deterministic backend logic where possible
- Save both original input and parsed output
- Support correction after AI analysis
- Mark uncertain estimates clearly
- Keep endpoints simple and consistent

## Suggested Entities
- User
- Meal
- MealItem
- DailySummary
- ImageAnalysis

## Forbidden
- Do not rely on AI-only freeform text responses
- Do not hide uncertainty
- Do not skip validation

## Output Format
- Summary
- Endpoints added
- Data models added
- AI prompt contracts
- Assumptions
- Open issues
