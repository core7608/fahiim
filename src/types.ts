export interface User {
  uid: string;
  name: string;
  year: string;
  bio: string;
  email?: string;
  photoURL?: string;
  settings?: UserSettings;
  customTools?: Tool[]; // Tools saved in Drive/Firestore
}

export interface UserSettings {
  geminiApiKey?: string;
  openaiApiKey?: string;
  fahimPersonality?: string; // Custom personality description
  theme?: string; // Theme ID
  gender?: 'male' | 'female';
  googleDriveEnabled?: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  isCustom?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  timestamp: any;
}

export interface Message {
  id: string;
  chatId?: string; // Link message to a session
  role: 'user' | 'model';
  text: string;
  interactive?: InteractiveComponent;
  timestamp?: any;
  fileUrl?: string;
  fileName?: string;
}

export interface InteractiveComponent {
  type: 'physics' | 'chemistry' | 'math' | 'biology' | 'jsx';
  props: any;
}

export interface StudyItem {
  id: string;
  topic: string;
  subject: string;
  time: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const INITIAL_STUDY_PLAN: StudyItem[] = [
  { id: '1', topic: 'قوانين نيوتن للحركة', subject: 'الفيزياء', time: '09:00 AM', completed: false, difficulty: 'medium' },
  { id: '2', topic: 'الروابط الكيميائية', subject: 'الكيمياء', time: '11:30 AM', completed: true, difficulty: 'hard' },
  { id: '3', topic: 'حساب المثلثات', subject: 'الرياضيات', time: '02:00 PM', completed: false, difficulty: 'easy' },
  { id: '4', topic: 'تضاعف الـ DNA', subject: 'الأحياء', time: '04:30 PM', completed: false, difficulty: 'medium' },
];

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'math' | 'science' | 'languages' | 'productivity';
  icon: string;
}

export const STUDY_TOOLS: Tool[] = [
  // Productivity (10)
  { id: 'pomodoro', name: 'تايمر بومودورو', description: 'نظام تركيز (25 دقيقة مذاكرة + 5 دقائق راحة)', category: 'productivity', icon: 'Timer' },
  { id: 'todo', name: 'قائمة مهام ذكية', description: 'نظم مذاكرتك خطوة بخطوة', category: 'productivity', icon: 'CheckSquare' },
  { id: 'stopwatch', name: 'ساعة إيقاف', description: 'احسب وقت حلك للمسائل بدقة', category: 'productivity', icon: 'Clock' },
  { id: 'focus-music', name: 'موسيقى تركيز', description: 'أصوات هادية تساعدك على المذاكرة', category: 'productivity', icon: 'Music' },
  { id: 'habit-tracker', name: 'متتبع العادات', description: 'ابني عادات مذاكرة قوية', category: 'productivity', icon: 'Zap' },
  { id: 'daily-planner', name: 'مخطط يومي', description: 'رتب يومك من الصبح لليل', category: 'productivity', icon: 'Calendar' },
  { id: 'goal-setter', name: 'محدد الأهداف', description: 'حط أهدافك وتابع وصولك ليها', category: 'productivity', icon: 'Target' },
  { id: 'distraction-blocker', name: 'مانع التشتت', description: 'ركز في المذاكرة وابعد عن الموبايل', category: 'productivity', icon: 'Shield' },
  { id: 'study-timer', name: 'مؤقت المذاكرة', description: 'احسب وقت كل مادة لوحدها', category: 'productivity', icon: 'Hourglass' },
  { id: 'break-reminder', name: 'منبه الاستراحة', description: 'ماتنساش تاخد بريك عشان تفصل', category: 'productivity', icon: 'Coffee' },
  
  // Math (10)
  { id: 'calculator', name: 'آلة حاسبة علمية', description: 'حل أصعب المعادلات واللوغاريتمات', category: 'math', icon: 'Calculator' },
  { id: 'unit-converter', name: 'محول وحدات', description: 'حول بين الطول، الوزن، والحرارة', category: 'math', icon: 'ArrowLeftRight' },
  { id: 'geometry-solver', name: 'حل الهندسة', description: 'احسب المساحات والأحجام للأشكال', category: 'math', icon: 'Square' },
  { id: 'algebra-helper', name: 'مساعد الجبر', description: 'تبسيط المعادلات وحل المجاهيل', category: 'math', icon: 'Variable' },
  { id: 'graphing-tool', name: 'رسم الدوال', description: 'ارسم الدوال البيانية بسهولة', category: 'math', icon: 'LineChart' },
  { id: 'statistics-calc', name: 'حاسبة الإحصاء', description: 'احسب المتوسط والوسيط والانحراف', category: 'math', icon: 'BarChart' },
  { id: 'trigonometry', name: 'حساب المثلثات', description: 'حل المثلثات والنسب المثلثية', category: 'math', icon: 'Triangle' },
  { id: 'matrix-calc', name: 'حاسبة المصفوفات', description: 'جمع وضرب وحل المصفوفات', category: 'math', icon: 'Grid' },
  { id: 'fraction-calc', name: 'حاسبة الكسور', description: 'عمليات على الكسور العادية والعشرية', category: 'math', icon: 'Divide' },
  { id: 'percentage-calc', name: 'حاسبة النسب', description: 'احسب النسب المئوية والزيادة والنقص', category: 'math', icon: 'Percent' },

  // Science (10)
  { id: 'periodic-table', name: 'الجدول الدوري', description: 'استكشف العناصر الكيميائية وخصائصها', category: 'science', icon: 'Grid' },
  { id: 'physics-formulas', name: 'قوانين الفيزياء', description: 'كل القوانين اللي محتاجها في مكان واحد', category: 'science', icon: 'Zap' },
  { id: 'chem-balancer', name: 'وزن المعادلات', description: 'وزن المعادلات الكيميائية الصعبة', category: 'science', icon: 'FlaskConical' },
  { id: 'bio-atlas', name: 'أطلس الأحياء', description: 'رسومات توضيحية لأجهزة الجسم', category: 'science', icon: 'Dna' },
  { id: 'lab-simulator', name: 'محاكي المعمل', description: 'تجارب افتراضية آمنة', category: 'science', icon: 'TestTube' },
  { id: 'optics-tool', name: 'أداة البصريات', description: 'دراسة المرايا والعدسات والضوء', category: 'science', icon: 'Sun' },
  { id: 'mechanics-calc', name: 'حاسبة الميكانيكا', description: 'القوة والحركة والطاقة', category: 'science', icon: 'Cog' },
  { id: 'electricity-tool', name: 'أداة الكهرباء', description: 'قانون أوم والدوائر الكهربائية', category: 'science', icon: 'Battery' },
  { id: 'molecular-viewer', name: 'عارض الجزيئات', description: 'شوف تركيب الجزيئات في 3D', category: 'science', icon: 'Layers' },
  { id: 'ecosystem-sim', name: 'محاكي البيئة', description: 'دراسة السلاسل الغذائية والتوازن البيئي', category: 'science', icon: 'Globe' },

  // Astronomy (5)
  { id: 'space-explorer', name: 'مستكشف الفضاء', description: 'معلومات عن الكواكب والنجوم', category: 'science', icon: 'Orbit' },
  { id: 'star-map', name: 'خريطة النجوم', description: 'تعرف على المجموعات النجمية', category: 'science', icon: 'Sparkles' },
  { id: 'moon-phases', name: 'أطوار القمر', description: 'تابع شكل القمر خلال الشهر', category: 'science', icon: 'Moon' },
  { id: 'telescope-view', name: 'رؤية التلسكوب', description: 'محاكاة لرؤية الأجرام السماوية', category: 'science', icon: 'Telescope' },
  { id: 'gravity-sim', name: 'محاكي الجاذبية', description: 'تأثير الجاذبية بين الكواكب', category: 'science', icon: 'CircleDot' },

  // Languages (10)
  { id: 'dictionary', name: 'قاموس ذكي', description: 'ترجمة فورية ومعاني الكلمات', category: 'languages', icon: 'Book' },
  { id: 'verb-conjugator', name: 'تصريف الأفعال', description: 'تصريف الأفعال في كل الأزمنة', category: 'languages', icon: 'Languages' },
  { id: 'grammar-checker', name: 'مصحح القواعد', description: 'تأكد من صحة كتابتك', category: 'languages', icon: 'Check' },
  { id: 'vocab-builder', name: 'باني المفردات', description: 'تعلم كلمات جديدة كل يوم', category: 'languages', icon: 'Plus' },
  { id: 'pronunciation', name: 'النطق الصحيح', description: 'اسمع النطق الصح للكلمات', category: 'languages', icon: 'Volume2' },
  { id: 'synonyms-finder', name: 'مرادفات وعكس', description: 'أوجد الكلمات البديلة لمعانيك', category: 'languages', icon: 'Repeat' },
  { id: 'idioms-list', name: 'تعبيرات شائعة', description: 'أهم الـ Idioms في اللغة الإنجليزية', category: 'languages', icon: 'MessageCircle' },
  { id: 'spelling-bee', name: 'اختبار الإملاء', description: 'حسن مهاراتك في الكتابة', category: 'languages', icon: 'Type' },
  { id: 'translation-pro', name: 'مترجم محترف', description: 'ترجمة نصوص طويلة بدقة', category: 'languages', icon: 'Globe2' },
  { id: 'language-quiz', name: 'كويز لغات', description: 'اختبر مستواك في اللغة', category: 'languages', icon: 'HelpCircle' },

  // General (5)
  { id: 'summarizer', name: 'ملخص النصوص', description: 'لخص الدروس الطويلة في نقط بسيطة', category: 'general', icon: 'FileText' },
  { id: 'flashcards', name: 'كروت الذاكرة', description: 'احفظ الكلمات والتعريفات بسرعة', category: 'general', icon: 'Layers' },
  { id: 'gpa-calc', name: 'حساب المعدل', description: 'احسب مجموعك وتقديرك المتوقع', category: 'general', icon: 'Percent' },
  { id: 'mind-map', name: 'خريطة ذهنية', description: 'اربط المعلومات ببعضها بصرياً', category: 'general', icon: 'Share2' },
  { id: 'note-taker', name: 'مدون الملاحظات', description: 'اكتب أهم النقط ورا المدرس', category: 'general', icon: 'PenTool' },
];
