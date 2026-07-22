import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client on the server
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: Analyze receipt or grocery text with Gemini
  app.post('/api/analyze-receipt', async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text prompt or grocery list is required.' });
      }

      const ai = getGeminiClient();

      const systemInstruction = `You are a grocery expense categorizer for a Pakistani household budget app called "RationIQ". Given raw text of grocery items (may be in English, Roman Urdu, or a mix, with prices in PKR), extract each item and return ONLY valid JSON in this format:
[
  {"item": "Doodh (Milk)", "category": "Dairy", "amount": 200},
  {"item": "Chawal 5kg (Rice)", "category": "Grains", "amount": 900}
]
Categories allowed: Dairy, Produce, Grains, Meat, Household, Other. All amounts are in PKR (just the number, no symbol in the JSON).

After the JSON, on a new line, add "SUGGESTIONS:" followed by 2-3 short, practical money-saving tips in simple Roman Urdu, relevant to Pakistani households (e.g. buying from wholesale/thoke ka bazaar, seasonal sabzi/fruit, avoiding branded items when local options exist).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: text.trim(),
        config: {
          systemInstruction,
        }
      });

      const responseText = response.text || '';
      if (!responseText) {
        throw new Error('No content returned from Gemini API.');
      }

      let items: any[] = [];
      let suggestions: string[] = [];

      // Split response into JSON part and SUGGESTIONS: part
      const parts = responseText.split(/SUGGESTIONS:/i);
      const jsonPart = parts[0] ? parts[0].trim() : '';
      const suggestionsPart = parts[1] ? parts[1].trim() : '';

      // 1. Parse JSON items
      try {
        let cleanJson = jsonPart.replace(/```json/gi, '').replace(/```/g, '').trim();
        const firstBracket = cleanJson.indexOf('[');
        const lastBracket = cleanJson.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
        }
        const parsedArray = JSON.parse(cleanJson);
        if (Array.isArray(parsedArray)) {
          const VALID_CATEGORIES = ['Dairy', 'Produce', 'Grains', 'Meat', 'Household', 'Other'];
          items = parsedArray.map((it: any) => {
            let cat = it.category ? String(it.category).trim() : 'Other';
            if (!VALID_CATEGORIES.includes(cat)) {
              const lower = cat.toLowerCase();
              if (lower.includes('milk') || lower.includes('dairy') || lower.includes('doodh') || lower.includes('dahi') || lower.includes('makkhan')) cat = 'Dairy';
              else if (lower.includes('veg') || lower.includes('fruit') || lower.includes('sabzi') || lower.includes('phal') || lower.includes('produce')) cat = 'Produce';
              else if (lower.includes('grain') || lower.includes('rice') || lower.includes('chawal') || lower.includes('atta') || lower.includes('flour') || lower.includes('daal')) cat = 'Grains';
              else if (lower.includes('meat') || lower.includes('chicken') || lower.includes('murghi') || lower.includes('gosht') || lower.includes('beef') || lower.includes('mutton') || lower.includes('fish') || lower.includes('anda') || lower.includes('egg')) cat = 'Meat';
              else if (lower.includes('house') || lower.includes('soap') || lower.includes('sabun') || lower.includes('surf') || lower.includes('clean') || lower.includes('detergent')) cat = 'Household';
              else cat = 'Other';
            }
            return {
              name: it.item || it.name || 'Grocery Item',
              category: cat,
              amount: Math.round(Math.max(0, Number(it.amount) || 0))
            };
          });
        }
      } catch (err) {
        console.error('Error parsing JSON from Gemini response:', err, responseText);
      }

      // 2. Parse Roman Urdu Suggestions
      if (suggestionsPart) {
        const lines = suggestionsPart.split('\n')
          .map(line => line.replace(/^[\s\-*•\d\.]+/g, '').trim())
          .filter(line => line.length > 5);
        suggestions = lines.slice(0, 3);
      }

      if (suggestions.length === 0) {
        suggestions = [
          "Thoke ka bazaar (wholesale market) se rashan ikatha khareedein taake har maah Rs. 1,000-2,000 ki bachat ho sake.",
          "Bina maosam ke phal aur sabziyon se parhez karein aur maosmi cheezain lein.",
          "Local trusted brands ya chakki ka aata aur khuli daalein istemaal karke paise bachayein."
        ];
      }

      return res.json({
        success: true,
        data: {
          items,
          suggestions,
          summaryMessage: `Categorized ${items.length} items from your Pakistani grocery list successfully!`
        }
      });

    } catch (error: any) {
      console.error('Error in /api/analyze-receipt:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze text with AI'
      });
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
