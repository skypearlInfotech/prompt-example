'use server';
/**
 * @fileOverview AI flow for scoring a resume against a job description.
 *
 * - scoreResume - Main function to perform the analysis.
 * - ScoreResumeInput - Input schema containing resume and job description text.
 * - ScoreResumeOutput - Structured output with overall score, categories, and recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScoreResumeInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the candidate resume.'),
  jobDescriptionText: z.string().describe('The full text content of the job description/requirements.'),
});

export type ScoreResumeInput = z.infer<typeof ScoreResumeInputSchema>;

const ScoreResumeOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('An overall match percentage from 0 to 100.'),
  categories: z.array(z.object({
    name: z.string().describe('The name of the evaluation category (e.g., Technical Skills, Experience).'),
    score: z.number().min(0).max(100).describe('The score for this specific category.'),
    feedback: z.string().describe('Brief, constructive feedback for this category.'),
  })).describe('Breakdown of scores across different professional categories.'),
  recommendations: z.array(z.string()).describe('A list of 3-5 specific, actionable improvements for the resume.'),
});

export type ScoreResumeOutput = z.infer<typeof ScoreResumeOutputSchema>;

const scoreResumePrompt = ai.definePrompt({
  name: 'scoreResumePrompt',
  input: { schema: ScoreResumeInputSchema },
  output: { schema: ScoreResumeOutputSchema },
  prompt: `You are an expert HR Specialist and Technical Recruiter. Your task is to analyze the provided Resume against a Job Description and provide a detailed, objective match score.

Job Description:
{{{jobDescriptionText}}}

Candidate Resume:
{{{resumeText}}}

Please evaluate the following:
1. Technical Proficiency (Alignment with required tools, languages, and stacks).
2. Experience Level (Relevance of past roles and responsibilities).
3. Educational Background & Certifications.
4. Soft Skills & Leadership (Demonstrated impact and teamwork).

Provide an overall score (0-100) and specific scores for these categories. Also, provide a list of 3-5 highly actionable recommendations the candidate can take to improve their resume for this specific role. Be honest and critical but constructive.`,
});

export async function scoreResume(input: ScoreResumeInput): Promise<ScoreResumeOutput> {
  const flow = ai.defineFlow(
    {
      name: 'scoreResumeFlow',
      inputSchema: ScoreResumeInputSchema,
      outputSchema: ScoreResumeOutputSchema,
    },
    async (input) => {
      const { output } = await scoreResumePrompt(input);
      if (!output) throw new Error('AI failed to generate a scoring output.');
      return output;
    }
  );
  return flow(input);
}
