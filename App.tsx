import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { GeneratedPrompt } from './components/GeneratedPrompt';
import { extractSkillsFromResume } from './services/geminiService';
import { extractTextFromPdf } from './utils/pdfParser';
import type { FormData } from './types';

function App() {
  const [formData, setFormData] = useState<FormData>({
    city: 'Bengaluru',
    job_position: 'Senior Frontend Engineer',
    years_of_experience: 5,
    resume_file: null,
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePrompt = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');

    if (!data.resume_file) {
      setError("Please upload a resume PDF file.");
      setIsLoading(false);
      return;
    }

    try {
      const resumeText = await extractTextFromPdf(data.resume_file);
      const skills = await extractSkillsFromResume(resumeText);
      
      const fullPrompt = `SYSTEM:
You are Gemini 2.5 Pro, an expert job-aggregation agent with web access. Your job: actively search and scrape job postings to find the best matches for a candidate. Obey robots.txt, rate limits, and site terms. If blocked or disallowed from scraping a source, note it in status.unavailable_sources and continue. Include last 24 hours of job posting. Return JSON only (see schema below), then a 6-line human summary. Do not include any other commentary.

USER:
Inputs:
- city: "${data.city}"
- job_position: "${data.job_position}"
- years_of_experience: ${data.years_of_experience}
- candidate_skills: [${skills.map(s => `"${s}"`).join(', ')}]

Instructions (do these exactly):
1) Actively search and scrape job postings from as many sources as possible (LinkedIn, Naukri, Indeed, Glassdoor, Monster, AngelList/Wellfound, company career pages, GitHub/StackOverflow jobs, regional portals, government portals, recruitment agencies, alumni boards, and major aggregators/APIs). Try to follow links from aggregator results to original company pages when available.
2) For each posting capture: id, title, company, location_city, is_remote (Yes|No|Hybrid), posting_date (YYYY-MM-DD), skills_required (list), min_experience, max_experience, salary_range (if present), job_description_snippet (<=300 chars), application_url, source (domain), other_sources (list), full_raw_text or summary if very long.
3) Filter: if city != "Any", include only jobs in that Karnataka city. If city == "Any", include jobs across Karnataka only. Prioritize postings in the last 24 hours.
4) Deduplicate identical postings (same title+company+url or same unique job id). Keep the most complete record and list other_sources.
5) Compute match_score (0–100) per posting using skill overlap from 'candidate_skills', title similarity, experience fit, location, and recency. Include missing_skills (important skills not in the candidate's skill list). Provide why_matched (1–2 sentences).
6) Rank by match_score desc and return top 10.
7) If live web access is unavailable for any source, include it in status.unavailable_sources and continue.
8) Respect privacy & legality: do not disclose scraping credentials or private API keys.

OUTPUT: return valid JSON only using this top-level schema (no extra text before JSON):
{
  "jobs": [ up to 10 job objects as described above ]
}`;

      setGeneratedPrompt(fullPrompt);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate prompt: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">
            Gemini Job Aggregator Prompt Generator
          </h1>
          <p className="text-slate-400 mt-1">
            Craft the perfect prompt for your AI-powered job search agent.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputForm
            initialData={formData}
            onSubmit={handleGeneratePrompt}
            isLoading={isLoading}
          />
          <GeneratedPrompt
            prompt={generatedPrompt}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>

      <footer className="container mx-auto text-center p-4 sm:p-6 lg:p-8 mt-8 text-slate-500 text-sm">
        <p>Built by a world-class senior frontend React engineer.</p>
      </footer>
    </div>
  );
}

export default App;
