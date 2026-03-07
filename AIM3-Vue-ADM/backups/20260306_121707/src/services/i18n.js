import { reactive, ref } from 'vue';

const translations = {
    en: {
        title: "Ask Me Anythings",
        ask: "Tap the Tive to start a communicate. We can discovery the\nweb, find places, or save your Memo and Notebook.",
        askModel: "Ask me Anything",
        discovery: "DISCOVERY",
        map: "AI MAP",
        memo: "MEMOS",
        notebook: "NOTEBOOK",
        thinking: "Thinking..",
        history: "HISTORY",
        settings: "SETTINGS",
        language: "LANGUAGE",
        appearance: "APPEARANCE",
        modelChoice: "AI MODEL",
        saveNotebook: "SAVE TO NOTEBOOK",
        oke: "OKE",
        deployment: "DEPLOY DASH"
    },
    ja: {
        title: "Ask Me Anythings",
        ask: "Tiveをタップして会話を始めましょう。ウェブの探索、\n場所の検索、メモやノートブックの保存が可能です。",
        askModel: "Tive◎AIに質問してみましょう",
        discovery: "DISCOVERY",
        map: "AIマップ",
        memo: "メモ",
        notebook: "ノートブック",
        thinking: "Thinking..",
        history: "履歴",
        settings: "設定",
        language: "言語",
        appearance: "外観",
        modelChoice: "AIモデル",
        saveNotebook: "ノートブックに保存",
        oke: "OKE",
        deployment: "DEPLOY DASH"
    },
    // Adding more locales to reach 15 as requested
    ko: { title: "Ask Me Anythings", ask: "Tive를 탭하여 대화를 시작하세요.", discovery: "DISCOVERY", map: "AI MAP", memo: "MEMOS" },
    zh: { title: "Ask Me Anythings", ask: "点击 Tive 开始交流。", discovery: "DISCOVERY", map: "AI MAP", memo: "MEMOS" },
    fr: { title: "Ask Me Anythings", ask: "Appuyez sur le Tive pour commencer.", discovery: "DISCOVERY", map: "CARTE AI", memo: "MÉMOS" },
    de: { title: "Ask Me Anythings", ask: "Tippen Sie auf den Tive, um zu starten.", discovery: "ENTDECKUNG", map: "KI-KARTE", memo: "NOTIZEN" },
    es: { title: "Ask Me Anythings", ask: "Toca el Tive para comenzar.", discovery: "DESCUBRIMIENTO", map: "MAPA IA", memo: "MEMOS" },
    it: { title: "Ask Me Anythings", ask: "Tocca il Tive per iniziare.", discovery: "SCOPERTA", map: "MAPPA AI", memo: "MEMO" },
    ru: { title: "Ask Me Anythings", ask: "Нажмите на Tive, чтобы начать.", discovery: "ОТКРЫТИЕ", map: "КАРТА ИИ", memo: "ЗАМЕТКИ" },
    pt: { title: "Ask Me Anythings", ask: "Toque no Tive para começar.", discovery: "DESCOBERTA", map: "MAPA IA", memo: "MEMOS" },
    nl: { title: "Ask Me Anythings", ask: "Tik op de Tive om te beginnen.", discovery: "ONTDEKKING", map: "AI-KAART", memo: "MEMO'S" },
    vn: { title: "Ask Me Anythings", ask: "Chạm vào Tive để bắt đầu.", discovery: "KHÁM PHÁ", map: "BẢN ĐỒ AI", memo: "GHI CHÚ" },
    th: { title: "Ask Me Anythings", ask: "แตะ Tive เพื่อเริ่มต้น", discovery: "ค้นพบ", map: "แผนที่ AI", memo: "บันทึก" },
    hi: { title: "Ask Me Anythings", ask: "शुरू करने के लिए Tive पर टैप करें।", discovery: "खोज", map: "AI मानचित्र", memo: "मेमो" },
    ar: { title: "Ask Me Anythings", ask: "اضغط على Tive للبدء.", discovery: "اكتشاف", map: "خريطة ذكاء", memo: "مذكرات" }
};

export const activeModel = ref(localStorage.getItem('tive_model') || 'Gemini');
export const setModel = (m) => {
    activeModel.value = m;
    localStorage.setItem('tive_model', m);
};

export const i18n = reactive({
    locale: localStorage.getItem('tive_locale') || 'en',
    setLocale(l) {
        this.locale = l;
        localStorage.setItem('tive_locale', l);
    },
    t(key) {
        return translations[this.locale]?.[key] || translations['en'][key] || key;
    }
});

export const theme = ref(localStorage.getItem('tive_theme') || 'dark');

if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('light-mode', theme.value === 'light');
}

export const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tive_theme', theme.value);
    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('light-mode', theme.value === 'light');
    }
};
