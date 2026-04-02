export interface User {
  name: string;
  year: string;
  bio: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  interactive?: InteractiveComponent;
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
  // Productivity
  { id: 'pomodoro', name: 'تايمر بومودورو', description: 'ركز 25 دقيقة وخد بريك 5 دقائق', category: 'productivity', icon: 'Timer' },
  { id: 'todo', name: 'قائمة مهام ذكية', description: 'نظم مذاكرتك خطوة بخطوة', category: 'productivity', icon: 'CheckSquare' },
  { id: 'stopwatch', name: 'ساعة إيقاف', description: 'احسب وقت حلك للمسائل', category: 'productivity', icon: 'Clock' },
  { id: 'focus-music', name: 'موسيقى تركيز', description: 'أصوات هادية تساعدك على المذاكرة', category: 'productivity', icon: 'Music' },
  { id: 'habit-tracker', name: 'متتبع العادات', description: 'ابني عادات مذاكرة قوية', category: 'productivity', icon: 'Zap' },
  { id: 'daily-planner', name: 'مخطط يومي', description: 'رتب يومك من الصبح لليل', category: 'productivity', icon: 'Calendar' },
  { id: 'goal-setter', name: 'محدد الأهداف', description: 'حط أهدافك وتابع وصولك ليها', category: 'productivity', icon: 'Target' },
  { id: 'distraction-blocker', name: 'مانع التشتت', description: 'ركز في المذاكرة وابعد عن الموبايل', category: 'productivity', icon: 'Shield' },
  { id: 'study-timer', name: 'مؤقت المذاكرة', description: 'احسب وقت كل مادة لوحدها', category: 'productivity', icon: 'Hourglass' },
  { id: 'break-reminder', name: 'منبه الاستراحة', description: 'ماتنساش تاخد بريك عشان تفصل', category: 'productivity', icon: 'Coffee' },
  
  // Math
  { id: 'calculator', name: 'آلة حاسبة علمية (Casio Style)', description: 'حل أصعب المعادلات واللوغاريتمات', category: 'math', icon: 'Calculator' },
  { id: 'unit-converter', name: 'محول وحدات', description: 'حول بين الطول، الوزن، والحرارة', category: 'math', icon: 'ArrowLeftRight' },
  { id: 'geometry-solver', name: 'حل الهندسة', description: 'احسب المساحات والأحجام للأشكال', category: 'math', icon: 'Square' },
  { id: 'algebra-helper', name: 'مساعد الجبر', description: 'تبسيط المعادلات وحل المجاهيل', category: 'math', icon: 'Variable' },
  { id: 'graphing-tool', name: 'رسم الدوال', description: 'ارسم الدوال البيانية بسهولة', category: 'math', icon: 'LineChart' },
  { id: 'statistics-calc', name: 'حاسبة الإحصاء', description: 'احسب المتوسط والوسيط والانحراف', category: 'math', icon: 'BarChart' },
  { id: 'trigonometry', name: 'حساب المثلثات', description: 'حل المثلثات والنسب المثلثية', category: 'math', icon: 'Triangle' },
  { id: 'matrix-calc', name: 'حاسبة المصفوفات', description: 'جمع وضرب وحل المصفوفات', category: 'math', icon: 'Grid' },
  { id: 'fraction-calc', name: 'حاسبة الكسور', description: 'عمليات على الكسور العادية والعشرية', category: 'math', icon: 'Divide' },
  { id: 'percentage-calc', name: 'حاسبة النسب', description: 'احسب النسب المئوية والزيادة والنقص', category: 'math', icon: 'Percent' },

  // Science
  { id: 'periodic-table', name: 'الجدول الدوري', description: 'استكشف العناصر الكيميائية وخصائصها', category: 'science', icon: 'Grid' },
  { id: 'physics-formulas', name: 'قوانين الفيزياء', description: 'كل القوانين اللي محتاجها في مكان واحد', category: 'science', icon: 'Zap' },
  { id: 'chem-balancer', name: 'وزن المعادلات', description: 'وزن المعادلات الكيميائية الصعبة', category: 'science', icon: 'FlaskConical' },
  { id: 'bio-atlas', name: 'أطلس الأحياء', description: 'رسومات توضيحية لأجهزة الجسم', category: 'science', icon: 'Dna' },
  { id: 'space-explorer', name: 'مستكشف الفضاء', description: 'معلومات عن الكواكب والنجوم', category: 'science', icon: 'Orbit' },
  { id: 'earth-science', name: 'علوم الأرض', description: 'طبقات الأرض والبراكين والزلازل', category: 'science', icon: 'Globe' },
  { id: 'lab-simulator', name: 'محاكي المعمل', description: 'تجارب افتراضية آمنة', category: 'science', icon: 'TestTube' },
  { id: 'optics-tool', name: 'أداة البصريات', description: 'دراسة المرايا والعدسات والضوء', category: 'science', icon: 'Sun' },
  { id: 'mechanics-calc', name: 'حاسبة الميكانيكا', description: 'القوة والحركة والطاقة', category: 'science', icon: 'Cog' },
  { id: 'electricity-tool', name: 'أداة الكهرباء', description: 'قانون أوم والدوائر الكهربائية', category: 'science', icon: 'Battery' },

  // Languages
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

  // General
  { id: 'summarizer', name: 'ملخص النصوص', description: 'لخص الدروس الطويلة في نقط بسيطة', category: 'general', icon: 'FileText' },
  { id: 'flashcards', name: 'كروت الذاكرة', description: 'احفظ الكلمات والتعريفات بسرعة', category: 'general', icon: 'Layers' },
  { id: 'gpa-calc', name: 'حساب المعدل', description: 'احسب مجموعك وتقديرك المتوقع', category: 'general', icon: 'Percent' },
  { id: 'mind-map', name: 'خريطة ذهنية', description: 'اربط المعلومات ببعضها بصرياً', category: 'general', icon: 'Share2' },
  { id: 'exam-countdown', name: 'عد تنازلي للامتحان', description: 'فاضل كام يوم على المعمعة؟', category: 'general', icon: 'Clock' },
  { id: 'note-taker', name: 'مدون الملاحظات', description: 'اكتب أهم النقط ورا المدرس', category: 'general', icon: 'PenTool' },
  { id: 'pdf-viewer', name: 'قارئ PDF', description: 'افتح ملازمك وكتبك بسهولة', category: 'general', icon: 'File' },
  { id: 'audio-recorder', name: 'مسجل صوتي', description: 'سجل المحاضرات عشان تسمعها تاني', category: 'general', icon: 'Mic' },
  { id: 'citation-gen', name: 'مولد المراجع', description: 'وثق مصادرك بطريقة صحيحة', category: 'general', icon: 'Link' },
  { id: 'study-group', name: 'مجموعات مذاكرة', description: 'ذاكر مع صحابك أونلاين', category: 'general', icon: 'Users' },
];

// Fill the rest to reach 100
for (let i = STUDY_TOOLS.length + 1; i <= 100; i++) {
  STUDY_TOOLS.push({
    id: `tool-${i}`,
    name: `أداة ذكية ${i}`,
    description: 'أداة مساعدة متطورة جاري تخصيصها لمادتك الدراسية.',
    category: i % 5 === 0 ? 'productivity' : i % 4 === 0 ? 'math' : i % 3 === 0 ? 'science' : i % 2 === 0 ? 'languages' : 'general',
    icon: 'Wrench'
  });
}

export const LABS = [
  { id: 'physics', name: 'الفيزياء', icon: 'Zap', color: 'bg-blue-500' },
  { id: 'chemistry', name: 'الكيمياء', icon: 'FlaskConical', color: 'bg-emerald-500' },
  { id: 'math', name: 'الرياضيات', icon: 'Calculator', color: 'bg-indigo-500' },
  { id: 'biology', name: 'الأحياء', icon: 'Dna', color: 'bg-rose-500' },
  { id: 'astronomy', name: 'الفلك', icon: 'Telescope', color: 'bg-violet-500' },
  { id: 'history', name: 'التاريخ', icon: 'Scroll', color: 'bg-amber-500' },
];
