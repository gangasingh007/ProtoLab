import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const genAI = process.env.GOOGLE_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null;

interface SummarizePaperParams {
  title: string;
  content: string;
}

interface GenerateInsightsParams {
  experiments: any[];
  papers?: any[];
}

export class AIService {
  // Summarize research paper
  static async summarizePaper(params: SummarizePaperParams): Promise<{
    summary: string;
    findings: string;
    methodology: string;
    limitations: string;
  }> {
    const prompt = `
Analyze this research paper and provide a structured summary:

Title: ${params.title}

Content:
${params.content.slice(0, 15000)} // Limit content length

Please provide:
1. A concise summary (3-4 sentences)
2. Key findings (bullet points)
3. Methodology used
4. Limitations mentioned

Format your response as JSON with keys: summary, findings, methodology, limitations
`;

    try {
      if (groq) {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.3,
          max_tokens: 2000,
        });

        const response = completion.choices[0]?.message?.content || '{}';
        return this.parseAIResponse(response);
      } else if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return this.parseAIResponse(response);
      }

      throw new Error('No AI service configured');
    } catch (error) {
      console.error('AI summarization error:', error);
      throw error;
    }
  }

  // Generate insights from experiments
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
Analyze these research experiments and provide insights:

${experimentsText}

Based on these experiments, provide:
1. Key insights (3-5 observations about the research)
2. Recommendations (3-5 suggestions for next steps)
3. Patterns (any trends or patterns you notice)

Format as JSON with keys: insights (array), recommendations (array), patterns (array)
`;

    try {
      if (groq) {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.5,
          max_tokens: 1500,
        });

        const response = completion.choices[0]?.message?.content || '{}';
        return this.parseInsightsResponse(response);
      } else if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return this.parseInsightsResponse(response);
      }

      throw new Error('No AI service configured');
    } catch (error) {
      console.error('AI insights error:', error);
      throw error;
    }
  }

  // Suggest next experiments
  static async suggestNextExperiment(params: {
    currentExperiment: any;
    relatedPapers?: any[];
  }): Promise<string> {
    const prompt = `
Based on this experiment, suggest what should be done next:

Experiment: ${params.currentExperiment.title}
Hypothesis: ${params.currentExperiment.hypothesis}
Method: ${params.currentExperiment.method}
Current Results: ${params.currentExperiment.results || 'No results yet'}
Status: ${params.currentExperiment.status}

${
  params.relatedPapers && params.relatedPapers.length > 0
    ? `Related Papers:\n${params.relatedPapers.map((p) => `- ${p.title}`).join('\n')}`
    : ''
}

Provide a detailed suggestion for the next steps (200-300 words).
`;

    try {
      if (groq) {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || 'No suggestions available';
      } else if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }

      throw new Error('No AI service configured');
    } catch (error) {
      console.error('AI suggestion error:', error);
      throw error;
    }
  }

  // Extract key information from experiment
  static async extractKeyInfo(experimentText: string): Promise<{
    methods: string[];
    metrics: string[];
    findings: string[];
  }> {
    const prompt = `
Extract key information from this experiment:

${experimentText}

Provide:
1. Methods used (list of techniques/algorithms)
2. Metrics measured (list of evaluation metrics)
3. Key findings (list of important results)

Format as JSON with keys: methods (array), metrics (array), findings (array)
`;

    try {
      if (groq) {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          max_tokens: 800,
        });

        const response = completion.choices[0]?.message?.content || '{}';
        return this.parseKeyInfoResponse(response);
      } else if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return this.parseKeyInfoResponse(response);
      }

      throw new Error('No AI service configured');
    } catch (error) {
      console.error('AI extraction error:', error);
      return { methods: [], metrics: [], findings: [] };
    }
  }

  // Helper: Parse AI response
  private static parseAIResponse(response: string): {
    summary: string;
    findings: string;
    methodology: string;
    limitations: string;
  } {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/``````/) || 
                       response.match(/``````/);
      
      if (jsonMatch) {
        //@ts-ignore
        response = jsonMatch[1];
      }

      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || '',
        findings: parsed.findings || '',
        methodology: parsed.methodology || '',
        limitations: parsed.limitations || '',
      };
    } catch (error) {
      // Fallback: return the raw response
      return {
        summary: response.slice(0, 500),
        findings: 'Unable to parse findings',
        methodology: 'Unable to parse methodology',
        limitations: 'Unable to parse limitations',
      };
    }
  }

  private static parseInsightsResponse(response: string): {
    insights: string[];
    recommendations: string[];
    patterns: string[];
  } {
    try {
      const jsonMatch = response.match(/``````/) || 
                       response.match(/``````/);
      
      if (jsonMatch) {
        //@ts-ignore
        response = jsonMatch[1];
      }

      const parsed = JSON.parse(response);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        patterns: parsed.patterns || [],
      };
    } catch (error) {
      return {
        insights: ['Unable to generate insights'],
        recommendations: ['Unable to generate recommendations'],
        patterns: ['Unable to detect patterns'],
      };
    }
  }

  private static parseKeyInfoResponse(response: string): {
    methods: string[];
    metrics: string[];
    findings: string[];
  } {
    try {
      const jsonMatch = response.match(/``````/) || 
                       response.match(/``````/);
      
      if (jsonMatch) {
        //@ts-ignore
        response  = jsonMatch[1];
      }

      const parsed = JSON.parse(response);
      return {
        methods: parsed.methods || [],
        metrics: parsed.metrics || [],
        findings: parsed.findings || [],
      };
    } catch (error) {
      return { methods: [], metrics: [], findings: [] };
    }
  }
}
