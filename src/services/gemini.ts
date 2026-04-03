import { GoogleGenAI, Type } from "@google/genai";
import { StudyItem, User } from "../types";

// Default API key as fallback
const DEFAULT_API_KEY = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta as any).env.VITE_GEMINI_API_KEY) || "";

export const getSystemInstruction = (user: User, progress?: StudyItem[]) => {
  const gender = user.settings?.gender || 'male';
  const name = gender === 'male' ? 'فهيم' : 'فهيمة';
  const personality = gender === 'male' ? 'الأخ الكبير الجدع' : 'الأخت الكبيرة الجدعة';
  const greetings = gender === 'male' ? 'يا بطل، بص يا صاحبي' : 'يا بطلة، بصي يا حبيبتي';

  return `
أنت "${name}"، مدرس مصري عامي بأسلوب "${personality}". 
شخصيتك:
- اتكلم بطبيعية جداً كأنك قاعد مع صاحبك، بلاش الطريقة العلمية الجافة. استخدم أمثلة من الشارع، الكورة، الأكل، وأي حاجة قريبة من الطالب.
- لغتك مصرية عامية بسيطة ومحبوبة (مثلاً: "${greetings}"، "سهلة خالص"، "ركز معايا"، "قشطة").
- **مهم جداً**: لا تقم بإنشاء أي كود JSX أو مكونات تفاعلية (Interactive Components) إلا إذا طلب منك الطالب ذلك صراحة (مثلاً: "وريني رسمة"، "اعملي محاكاة"، "صمملي ثيم").

${user.settings?.fahimPersonality ? `توجيهات إضافية لشخصيتك من الطالب:
${user.settings.fahimPersonality}` : ''}

تنسيق الرد:
- اشرح بأسلوبك الجميل الطبيعي.
- إذا طلب منك الطالب شرحاً رسومياً أو محاكاة، أضف كود JSX داخل علامات \`\`\`jsx ... \`\`\`. استخدم Tailwind CSS و motion و lucide-react.
- **تنبيه هام جداً**: لا تضع أي جمل \`import\` أو \`export\` داخل كود الـ JSX. ابدأ مباشرة بتعريف المكون (مثلاً: \`const MyComponent = () => { ... }; render(<MyComponent />);\`).
- يجب أن ينتهي كود الـ JSX دائماً بجملة \`render(<ComponentName />);\` لكي يتم عرضه بشكل صحيح.
- إذا طلب منك الطالب تجربة تفاعلية محددة من الأنواع المتاحة، أضف كود JSON داخل علامات \`\`\`interactive-component ... \`\`\`.
- إذا طلب منك الطالب ثيم جديد، أضف كود JSON داخل علامات \`\`\`theme-json ... \`\`\`.
- **ميزة متطورة (Quiz Mode)**: إذا طلب الطالب اختباراً، قم بإنشاء كود JSON داخل علامات \`\`\`quiz-json ... \`\`\` يحتوي على قائمة من الأسئلة (question, options, correctAnswer, explanation).
- **تحديث الخطة**: إذا اقترحت تعديلاً على خطة المذاكرة، أضف كود JSON داخل علامات \`\`\`study-plan-json ... \`\`\` يحتوي على القائمة الكاملة والجديدة للمواد (id, subject, topic, time, difficulty, completed).

أنواع المكونات المتاحة:
1. physics: { type: 'gravity', mass1: number, mass2: number } أو { type: 'pendulum', length: number }
2. chemistry: { type: 'reaction', elements: string[] }
3. math: { type: 'graph', equation: string }

${progress ? `خطة المذاكرة الحالية:
${progress.map(p => `- ${p.topic} (${p.subject}): ${p.completed ? 'تم الإنجاز ✅' : 'لسه مخلصش ⏳'}`).join('\n')}
يمكنك اقتراح تعديلات على الخطة إذا رأيت ذلك مناسباً لمستوى الطالب.` : ''}
`;
};

export async function* getFahimResponseStream(messages: any[], user: User, progress?: StudyItem[]) {
  const model = "gemini-3-flash-preview";
  const apiKey = user.settings?.geminiApiKey || DEFAULT_API_KEY;

  if (!apiKey) {
    yield "يا بطل، لازم تضيف مفتاح Gemini API في الإعدادات عشان أقدر أرد عليك!";
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: messages,
      config: {
        systemInstruction: getSystemInstruction(user, progress),
        temperature: 0.8,
        tools: [{ googleSearch: {} }], // Enable Search Grounding
      },
    });
    
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Fahim Streaming API Error:", error);
    yield "يا بطل، النت شكله بعافية شوية. جرب تسألني تاني؟";
  }
}

export async function getFahimResponse(messages: any[], user: User, progress?: StudyItem[]) {
  const model = "gemini-3-flash-preview";
  const apiKey = user.settings?.geminiApiKey || DEFAULT_API_KEY;

  if (!apiKey) {
    return "يا بطل، لازم تضيف مفتاح Gemini API في الإعدادات عشان أقدر أرد عليك!";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction: getSystemInstruction(user, progress),
        temperature: 0.8,
        tools: [{ googleSearch: {} }], // Enable Search Grounding
      },
    });
    
    return response.text || "معلش يا صاحبي، حصل مشكلة في السيرفر. جرب تاني كدة؟";
  } catch (error) {
    console.error("Fahim API Error:", error);
    if (error instanceof Error && error.message.includes("API_KEY_INVALID")) {
      return "يا بطل، مفتاح الـ API اللي دخلته مش شغال. اتأكد منه في الإعدادات.";
    }
    return "يا بطل، النت شكله بعافية شوية. جرب تسألني تاني؟";
  }
}
