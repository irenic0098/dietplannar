import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Navbar / Sidebar
    home: "Home",
    dashboard: "Dashboard",
    dietPlan: "Diet Plan",
    foodDb: "Food Database",
    tracking: "Track Progress",
    reports: "Weekly Reports",
    community: "Community",
    dieticians: "Consult Dietician",
    admin: "Admin Panel",
    logout: "Logout",
    login: "Login",
    register: "Register",
    welcome: "Welcome back",

    // Home / Landing
    heroTitle: "Eat Smarter, Live Better",
    heroSubtitle: "Personalized Diet Planning and Wellness Tracking",
    getStarted: "Get Started Now",
    tryCalcs: "Try Free Calculators",
    whyChooseUs: "Why Choose Our Platform?",
    personalPlans: "Personalized Diet Plans",
    personalPlansDesc: "Generate breakfast, lunch, and dinner plans customized to your target weight and active lifestyle.",
    smartTrack: "Smart Hydration & Food Tracker",
    smartTrackDesc: "Log meals and water intake with clean visual charts to hit your daily macro targets.",
    aiConsult: "AI Assistant & Expert Consults",
    aiConsultDesc: "Get instant diet recommendations and chat with our rule-based AI, or book certified dieticians.",

    // Dashboard
    dailySummary: "Daily Summary",
    bmiCalculator: "BMI Calculator",
    bmiCategory: "BMI Category",
    idealWeight: "Ideal Weight Range",
    calorieNeed: "Daily Calories Needed",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbohydrates",
    fats: "Fats",
    waterTracker: "Hydration Tracker",
    drinkWater: "Log a Glass of Water",
    glasses: "Glasses",
    target: "Target",
    logged: "Logged",
    todayLog: "Today's Logged Meals",
    noMealsLogged: "No meals logged yet today.",
    logMealBtn: "Log a Meal",

    // Tracking
    foodLog: "Food Log",
    waterLog: "Water Log",
    exerciseLog: "Exercise Log",
    weightLog: "Weight Log",
    addFood: "Add Food Entry",
    addExercise: "Add Exercise Entry",
    addWeight: "Log Weight",
    duration: "Duration (mins)",
    caloriesBurned: "Calories Burned",
    weight: "Weight (kg)",
    date: "Date",
    quantity: "Quantity (grams)",
    selectFood: "Select Food Item",
    mealType: "Meal Type",
    save: "Save Entry",
    history: "History",

    // Diet Plan
    generatePlan: "Generate New Diet Plan",
    planName: "Plan Name",
    goal: "Health Goal",
    loseWeight: "Lose Weight",
    maintainWeight: "Maintain Weight",
    gainMuscle: "Gain Muscle / Weight",
    healthyEating: "Healthy Eating Only",
    dietPreference: "Dietary Preference",
    none: "No restrictions",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    glutenFree: "Gluten-Free",
    diabetic: "Diabetic-Friendly",
    keto: "Ketogenic (Keto)",
    activityLevel: "Activity Level",
    sedentary: "Sedentary (office job)",
    light: "Lightly Active (1-3 days/week)",
    moderate: "Moderately Active (3-5 days/week)",
    active: "Very Active (6-7 days/week)",
    veryActive: "Extra Active (workouts twice a day)",
    createPlanBtn: "Generate My Plan",
    activePlan: "Your Active Diet Plan",
    groceryList: "Auto-Generated Grocery List",
    noPlanYet: "You don't have an active diet plan yet. Generate one above!",

    // Food Database
    searchFood: "Search Foods...",
    foodCategories: "Categories",
    serving: "Serving",
    addCustomFood: "Create Custom Food",
    customFoodName: "Food Name",
    caloriesPer100g: "Calories (per 100g)",
    proteinPer100g: "Protein (g per 100g)",
    carbsPer100g: "Carbs (g per 100g)",
    fatPer100g: "Fat (g per 100g)",
    submit: "Create Food",

    // AI
    aiTitle: "AI Nutrition Tools",
    askAi: "Chat with AI Diet Assistant",
    aiPlaceholder: "Ask me about BMI, water, protein, weight loss, or diet suggestions...",
    send: "Send",
    aiRecipes: "AI Recipe Generator",
    availableIngredients: "Enter Ingredients you have (comma separated)",
    generateRecipeBtn: "Generate Recipe",
    aiRecommendations: "Get AI Meal Recommendation",
    getRecBtn: "Get Smart Recommendation",

    // Reports
    weeklyReport: "Weekly Nutrition Report",
    deficiencyTitle: "Nutrient Deficiency Analysis (Last 7 Days)",
    noDeficiencies: "Excellent! No nutritional deficiencies detected. Keep up the balanced eating!",
    deficiencyWarning: "Warning: You are below the recommended intake for:",
    suggestedFoods: "Suggested foods to add:",
    downloadPdf: "Download PDF Summary",

    // Community
    forumTitle: "Community Forum",
    createPost: "Share a Tip or Recipe",
    postTitle: "Title",
    postContent: "What is on your mind?",
    postCategory: "Category",
    postBtn: "Publish Post",
    comments: "Comments",
    writeComment: "Write a comment...",
    postCommentBtn: "Comment",
    like: "Like",

    // Dieticians
    dieticianBooking: "Book Dietician Appointment",
    experience: "years experience",
    rating: "Rating",
    fee: "Session Fee",
    bookSession: "Book a Session",
    selectDate: "Select Date",
    selectTime: "Select Time",
    notes: "Notes for the dietician",
    confirmBooking: "Confirm Appointment",
    upcomingAppointments: "My Scheduled Appointments",
  },
  hi: {
    // Navbar / Sidebar
    home: "मुख्य पृष्ठ",
    dashboard: "डैशबोर्ड",
    dietPlan: "आहार योजना",
    foodDb: "खाद्य डेटाबेस",
    tracking: "प्रगति ट्रैक करें",
    reports: "साप्ताहिक रिपोर्ट",
    community: "समुदाय",
    dieticians: "आहार विशेषज्ञ से बात करें",
    admin: "एडमिन पैनल",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "रजिस्टर",
    welcome: "आपका स्वागत है",

    // Home / Landing
    heroTitle: "आपका व्यक्तिगत आहार योजनाकार",
    heroSubtitle: "एआई संचालित भोजन योजना के साथ अपने स्वास्थ्य लक्ष्यों को प्राप्त करें",
    getStarted: "अभी शुरू करें",
    tryCalcs: "मुफ़्त कैलकुलेटर आज़माएं",
    whyChooseUs: "हमारा मंच क्यों चुनें?",
    personalPlans: "व्यक्तिगत आहार योजनाएं",
    personalPlansDesc: "अपने लक्षित वजन और सक्रिय जीवनशैली के अनुसार अनुकूलित नाश्ता, दोपहर के भोजन और रात के खाने की योजनाएं बनाएं।",
    smartTrack: "स्मार्ट हाइड्रेशन और फूड ट्रैकर",
    smartTrackDesc: "अपने दैनिक मैक्रो लक्ष्यों को पूरा करने के लिए स्पष्ट दृश्य चार्ट के साथ भोजन और पानी का सेवन दर्ज करें।",
    aiConsult: "एआई सहायक और विशेषज्ञ परामर्श",
    aiConsultDesc: "तुरंत आहार सिफारिशें प्राप्त करें और हमारे एआई के साथ चैट करें, या प्रमाणित आहार विशेषज्ञों को बुक करें।",

    // Dashboard
    dailySummary: "दैनिक सारांश",
    bmiCalculator: "बीएमआई कैलकुलेटर",
    bmiCategory: "बीएमआई श्रेणी",
    idealWeight: "आदर्श वजन सीमा",
    calorieNeed: "दैनिक आवश्यक कैलोरी",
    calories: "कैलोरी",
    protein: "प्रोटीन",
    carbs: "कार्बोहाइड्रेट",
    fats: "वसा",
    waterTracker: "हाइड्रेशन ट्रैकर",
    drinkWater: "एक गिलास पानी लॉग करें",
    glasses: "गिलास",
    target: "लक्ष्य",
    logged: "दर्ज किया गया",
    todayLog: "आज का दर्ज भोजन",
    noMealsLogged: "आज अभी तक कोई भोजन दर्ज नहीं किया गया है।",
    logMealBtn: "भोजन दर्ज करें",

    // Tracking
    foodLog: "भोजन लॉग",
    waterLog: "पानी लॉग",
    exerciseLog: "व्यायाम लॉग",
    weightLog: "वजन लॉग",
    addFood: "भोजन प्रविष्टि जोड़ें",
    addExercise: "व्यायाम प्रविष्टि जोड़ें",
    addWeight: "वजन लॉग करें",
    duration: "अवधि (मिनट)",
    caloriesBurned: "कैलोरी बर्न",
    weight: "वजन (किग्रा)",
    date: "तारीख",
    quantity: "मात्रा (ग्राम)",
    selectFood: "खाद्य सामग्री चुनें",
    mealType: "भोजन का प्रकार",
    save: "प्रविष्टि सहेजें",
    history: "इतिहास",

    // Diet Plan
    generatePlan: "नई आहार योजना बनाएं",
    planName: "योजना का नाम",
    goal: "स्वास्थ्य लक्ष्य",
    loseWeight: "वजन घटाएं",
    maintainWeight: "वजन बनाए रखें",
    gainMuscle: "मांसपेशियों का विकास / वजन बढ़ाएं",
    healthyEating: "केवल स्वस्थ भोजन",
    dietPreference: "आहार प्राथमिकता",
    none: "कोई प्रतिबंध नहीं",
    vegetarian: "शाकाहारी",
    vegan: "शाकाहारी (वीगन)",
    glutenFree: "ग्लूटेन-मुक्त",
    diabetic: "मधुमेह-अनुकूल",
    keto: "कीटोजेनिक (कीटो)",
    activityLevel: "गतिविधि स्तर",
    sedentary: "गतिहीन (कार्यालय का काम)",
    light: "हल्का सक्रिय (1-3 दिन/सप्ताह)",
    moderate: "मध्यम सक्रिय (3-5 दिन/सप्ताह)",
    active: "बहुत सक्रिय (6-7 दिन/सप्ताह)",
    veryActive: "अत्यधिक सक्रिय (दिन में दो बार कसरत)",
    createPlanBtn: "मेरी योजना बनाएं",
    activePlan: "आपकी सक्रिय आहार योजना",
    groceryList: "स्वचालित रूप से उत्पन्न किराना सूची",
    noPlanYet: "आपके पास अभी तक कोई सक्रिय आहार योजना नहीं है। ऊपर एक बनाएं!",

    // Food Database
    searchFood: "खाद्य पदार्थ खोजें...",
    foodCategories: "श्रेणियां",
    serving: "सेवारत",
    addCustomFood: "कस्टम भोजन बनाएं",
    customFoodName: "भोजन का नाम",
    caloriesPer100g: "कैलोरी (प्रति 100 ग्राम)",
    proteinPer100g: "प्रोटीन (ग्राम प्रति 100 ग्राम)",
    carbsPer100g: "कार्ब्स (ग्राम प्रति 100 ग्राम)",
    fatPer100g: "वसा (ग्राम प्रति 100 ग्राम)",
    submit: "भोजन बनाएं",

    // AI
    aiTitle: "एआई पोषण उपकरण",
    askAi: "एआई आहार सहायक से चैट करें",
    aiPlaceholder: "मुझसे बीएमआई, पानी, प्रोटीन, वजन घटाने या आहार सुझावों के बारे में पूछें...",
    send: "भेजें",
    aiRecipes: "एआई रेसिपी जेनरेटर",
    availableIngredients: "सामग्री दर्ज करें जो आपके पास हैं (अल्पविराम से अलग)",
    generateRecipeBtn: "रेसिपी उत्पन्न करें",
    aiRecommendations: "एआई भोजन सिफारिश प्राप्त करें",
    getRecBtn: "स्मार्ट सिफारिश प्राप्त करें",

    // Reports
    weeklyReport: "साप्ताहिक पोषण रिपोर्ट",
    deficiencyTitle: "पोषक तत्वों की कमी का विश्लेषण (अंतिम 7 दिन)",
    noDeficiencies: "उत्कृष्ट! कोई पोषण संबंधी कमी नहीं पाई गई। संतुलित खान-पान जारी रखें!",
    deficiencyWarning: "चेतावनी: आप अनुशंसित सेवन से नीचे हैं:",
    suggestedFoods: "जोड़ने के लिए अनुशंसित खाद्य पदार्थ:",
    downloadPdf: "पीडीएफ सारांश डाउनलोड करें",

    // Community
    forumTitle: "सामुदायिक मंच",
    createPost: "कोई सुझाव या रेसिपी साझा करें",
    postTitle: "शीर्षक",
    postContent: "आपके दिमाग में क्या है?",
    postCategory: "श्रेणी",
    postBtn: "पोस्ट प्रकाशित करें",
    comments: "टिप्पणियाँ",
    writeComment: "टिप्पणी लिखें...",
    postCommentBtn: "टिप्पणी करें",
    like: "पसंद करें",

    // Dieticians
    dieticianBooking: "आहार विशेषज्ञ अपॉइंटमेंट बुक करें",
    experience: "वर्षों का अनुभव",
    rating: "रेटिंग",
    fee: "सत्र शुल्क",
    bookSession: "सत्र बुक करें",
    selectDate: "तारीख चुनें",
    selectTime: "समय चुनें",
    notes: "आहार विशेषज्ञ के लिए नोट्स",
    confirmBooking: "अपॉइंटमेंट की पुष्टि करें",
    upcomingAppointments: "मेरे निर्धारित अपॉइंटमेंट",
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || key;
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    changeLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
