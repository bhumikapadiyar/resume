import { GoogleGenerativeAI } from '@google/generative-ai';

function invalidAnalysis() {
  const error = new Error('Gemini returned an invalid ATS analysis.');
  error.statusCode = 502;
  return error;
}

function validateAnalysis(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw invalidAnalysis();
  if (!Number.isFinite(result.score) || result.score < 0 || result.score > 100) throw invalidAnalysis();
  for (const key of ['verdict', 'summary']) {
    if (typeof result[key] !== 'string' || !result[key].trim()) throw invalidAnalysis();
  }
  for (const key of ['strengths', 'improvements']) {
    if (!Array.isArray(result[key]) || result[key].some(item => typeof item !== 'string')) throw invalidAnalysis();
  }
  if (!result.keywords || !Array.isArray(result.keywords.matched) || !Array.isArray(result.keywords.missing)) throw invalidAnalysis();
  if (result.keywords.matched.some(item => typeof item !== 'string') || result.keywords.missing.some(item => typeof item !== 'string')) throw invalidAnalysis();
  if (!Array.isArray(result.sections) || result.sections.length === 0 || result.sections.some(section => (
    !section || typeof section.name !== 'string' || !section.name.trim() ||
    !Number.isFinite(section.score) || section.score < 0 || section.score > 100 ||
    typeof section.note !== 'string'
  ))) throw invalidAnalysis();
  return result;
}

export async function analyzeResume(text, jobDescription = '') {
  if (!text || text.trim().length < 80) {
    const error = new Error('Resume text is too short to produce a reliable ATS score.');
    error.statusCode = 400;
    throw error;
  }
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured.');
    error.statusCode = 503;
    throw error;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = `You are an ATS resume expert. Score ONLY evidence present in the supplied resume. Never invent experience, skills, metrics, keywords, or sections. Return ONLY valid JSON matching this exact shape: {"score": number, "verdict": string, "summary": string, "strengths": string[], "improvements": string[], "keywords": {"matched": string[], "missing": string[]}, "sections": [{"name": string, "score": number, "note": string}]}. The score must be a defensible 0-100 assessment based on contact/header, experience evidence, skills/keyword evidence, and ATS formatting. If a job description is supplied, weigh keyword match against it; otherwise state that no target role was supplied. Keep every claim grounded in the text. Resume:\n${text.slice(0, 30000)}\nJob description:\n${jobDescription.slice(0, 12000)}`;

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const candidateModels = [primaryModel, 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const timeout = new Promise((_, reject) => {
        const error = new Error(`Gemini analysis timed out (${modelName}).`);
        error.statusCode = 504;
        setTimeout(() => reject(error), 45_000);
      });
      const response = await Promise.race([model.generateContent(prompt), timeout]);
      const rawText = response.response.text();
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleaned);
      return { result: validateAnalysis(result), source: 'gemini' };
    } catch (err) {
      lastError = err;
      const isRetryable =
        err.message?.includes('429') ||
        err.message?.includes('503') ||
        err.message?.includes('404') ||
        err.message?.includes('quota') ||
        err.message?.includes('high demand') ||
        err.message?.includes('UNAVAILABLE') ||
        err.message?.includes('overloaded');
      if (isRetryable) {
        console.warn(`Model ${modelName} availability issue (${err.message?.slice(0, 80)}...), trying next fallback model...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || invalidAnalysis();
}
