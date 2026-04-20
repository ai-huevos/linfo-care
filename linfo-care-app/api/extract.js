import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Use the standard OpenAI provider with fallback to AI_GATEWAY_API_KEY
const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY || '',
});

const EXTRACTION_PROMPT = `You are a medical document extraction AI. You analyze images of medical documents in Spanish (prescriptions, lab results, authorizations, clinical notes) and extract structured data.

Return ONLY valid JSON with this structure:
{
  "summary": "Brief description of the document in Spanish",
  "document_date": "YYYY-MM-DD or null",
  "medications": [
    {
      "name": "Drug name",
      "dose": "Dosage",
      "frequency": "How often",
      "route": "IV, oral, etc",
      "category": "quimioterapia|antibiotico|antiemetico|corticoide|analgesico|otro",
      "notes": "Additional notes"
    }
  ],
  "lab_results": [
    {
      "lab_name": "Test name",
      "value": "numeric value",
      "unit": "unit of measurement",
      "normal_min": "min normal range or null",
      "normal_max": "max normal range or null",
      "result_date": "YYYY-MM-DD or null",
      "notes": "Any notes"
    }
  ],
  "authorization": {
    "number": "Auth number or null",
    "entity": "EPS or insurance name or null",
    "services": ["list of authorized services"]
  },
  "doctor_notes": "Free text of doctor notes if present"
}

Patient context: Rodrigo "Roro" Cardona, 78 years old, DLBCL Stage IV, at Clínica del Country, Bogotá.
Known medications: Vincristina, Ondansetrón, Piperacilina, Rosuvastatina, Dexametasona.

Only include fields that are present in the document. Return empty arrays for medications/lab_results if none found.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { file_url, doc_type } = await req.json();

    if (!file_url) {
      return new Response(JSON.stringify({ success: false, error: 'file_url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GPT-4o for vision via Vercel AI / OpenAI Provider
    const result = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image',
              image: new URL(file_url),
            },
          ],
        },
      ],
      maxTokens: 2000,
      temperature: 0.1,
    });

    const text = result.text;
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/({[\s\S]*})/);
    const extracted = JSON.parse(jsonMatch ? jsonMatch[1] : text);

    return new Response(JSON.stringify({ success: true, extracted }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Extract error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error extracting document data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
