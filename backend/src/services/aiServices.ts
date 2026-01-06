import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

interface SummarizePaperParams {
  title: string;
  content: string;
}

interface GenerateInsightsParams {
  experiments: any[];
  papers?: any[];
}

export class AIService {
  // ----------- Paper Summarization -----------
  static async summarizePaper(params: SummarizePaperParams): Promise<{
    summary: string;
    findings: string;
    methodology: string;
    limitations: string;
  }> {
    const prompt = `
Analyze the following research paper and return a STRICT JSON response.

Title: ${params.title}

Content:
${params.content.slice(0, 15000)}

Return JSON with keys:
- summary (string, 3–4 sentences)
- findings (string or bullet list)
- methodology (string)
- limitations (string)

Do NOT add explanations or markdown.
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return this.safeJSONParse(response);
    } catch (error) {
      console.error('Gemini summarization error:', error);
      throw error;
    }
  }

  // ----------- Experiment Insights -----------
  static async generateInsights(params: GenerateInsightsParams): Promise<{
    insights: string[];
    recommendations: string[];
    patterns: string[];
  }> {
    const experimentsText = params.experiments
      .map(
        (e, i) => `
Experiment ${i + 1}: ${e.title}
Status: ${e.status}
Hypothesis: ${e.hypothesis || 'N/A'}
Method: ${e.method || 'N/A'}
Results: ${e.results || 'N/A'}
`
      )
      .join('\n---\n');

    const prompt = `
Analyze the following experiments and return STRICT JSON.

${experimentsText}

Return JSON with:
- insights (array of strings)
- recommendations (array of strings)
- patterns (array of strings)

No markdown. No extra text.
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return this.safeJSONParse(response);
    } catch (error) {
      console.error('Gemini insights error:', error);
      throw error;
    }
  }

  // ----------- Next Experiment Suggestion -----------
  static async suggestNextExperiment(params: {
    currentExperiment: any;
    relatedPapers?: any[];
  }): Promise<string> {
    const prompt = `
Based on the following experiment, suggest next steps:

Title: ${params.currentExperiment.title}
Hypothesis: ${params.currentExperiment.hypothesis}
Method: ${params.currentExperiment.method}
Results: ${params.currentExperiment.results || 'No results'}
Status: ${params.currentExperiment.status}

${
  params.relatedPapers?.length
    ? `Related Papers:\n${params.relatedPapers
        .map((p) => `- ${p.title}`)
        .join('\n')}`
    : ''
}

Provide a clear, actionable suggestion (200–300 words).
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini suggestion error:', error);
      throw error;
    }
  }

  // ----------- Extract Key Info -----------
  static async extractKeyInfo(experimentText: string): Promise<{
    methods: string[];
    metrics: string[];
    findings: string[];
  }> {
    const prompt = `
Extract structured information from the experiment below.

${experimentText}

Return STRICT JSON with:
- methods (array)
- metrics (array)
- findings (array)

No markdown.
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return this.safeJSONParse(response);
    } catch (error) {
      console.error('Gemini extraction error:', error);
      return { methods: [], metrics: [], findings: [] };
    }
  }

  // ----------- Utility: Safe JSON Parsing -----------
  private static safeJSONParse<T>(response: string): T {
    try {
      // Remove markdown/code blocks if present
      const cleaned = response
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse Gemini JSON response');
    }
  }
}
