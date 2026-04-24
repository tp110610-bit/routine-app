import {
  DEFAULT_HEIGHT_CM,
  DEFAULT_WEIGHT_KG,
  DetailSectionId,
  NutritionCategory,
  NutritionQuickPreset,
  RoutineSectionId,
} from "../routineData";

export type UserProfile = {
  heightCm: number;
  weightKg: number;
};

export type FoodFormState = {
  label: string;
  proteinGrams: string;
  unitLabel: string;
  category: NutritionCategory;
};

export type ProteinSummary = {
  intake: number;
  recommended: number;
  ratio: number;
};

export type NoticeTone = "neutral" | "success" | "error";

export type InlineNotice = {
  tone: NoticeTone;
  text: string;
};

export type CardTheme = {
  card: string;
  subtle: string;
  accentText: string;
  progress: string;
  checkbox: string;
  activeRing: string;
};

export type ArchiveSummary = {
  date: string;
  baseScore: number;
  totalScore: number;
  extraScore: number;
  completionCount: number;
  proteinIntake: number;
  nutritionScore: number;
  trainingScore: number;
  faithScore: number;
  hasData: boolean;
};

export const nutritionCategoryOptions: Array<{ value: NutritionCategory; label: string }> = [
  { value: "protein", label: "단백질" },
  { value: "proteinMeal", label: "기본 식사" },
  { value: "fruit", label: "과일" },
  { value: "vegetable", label: "채소" },
  { value: "processed", label: "가공식" },
  { value: "snack", label: "간식" },
];

export const detailSectionOrder = ["nutrition", "training", "faith", "hobby"] as const satisfies readonly DetailSectionId[];

export const defaultProfile: UserProfile = {
  heightCm: DEFAULT_HEIGHT_CM,
  weightKg: DEFAULT_WEIGHT_KG,
};

export const defaultFoodForm: FoodFormState = {
  label: "",
  proteinGrams: "",
  unitLabel: "1회",
  category: "protein",
};

export const todayNutritionPreset: NutritionQuickPreset = {
  id: "today-default",
  label: "오늘 식단 초기값",
  description: "아침 · 간식 · 운동 후 기본",
  items: [
    { key: "greekYogurt", quantity: 1 },
    { key: "banana", quantity: 1 },
    { key: "mealit", quantity: 1 },
    { key: "proteinDrink", quantity: 1 },
    { key: "nuts", quantity: 1 },
    { key: "chickenBreast", quantity: 1 },
    { key: "blackBeanSoyMilk", quantity: 1 },
  ],
};

export const faithOneTapActions = [
  { key: "qt", label: "QT" },
  { key: "prayer", label: "기도" },
  { key: "godAwareness", label: "하나님 의식" },
  { key: "listeningToWord", label: "말씀듣기" },
] as const;

export const HYDRATION_SAFE_DATE = "2000-01-01";

export const sectionStyles: Record<RoutineSectionId, CardTheme> = {
  nutrition: {
    card: "border-gray-200 bg-white",
    subtle: "bg-gray-50",
    accentText: "text-gray-700",
    progress: "bg-gray-600",
    checkbox: "peer-checked:border-gray-600 peer-checked:bg-gray-600",
    activeRing: "ring-gray-600/10 border-gray-200",
  },
  training: {
    card: "border-gray-200 bg-white",
    subtle: "bg-gray-50",
    accentText: "text-gray-700",
    progress: "bg-gray-600",
    checkbox: "peer-checked:border-gray-600 peer-checked:bg-gray-600",
    activeRing: "ring-gray-600/10 border-gray-200",
  },
  faith: {
    card: "border-gray-200 bg-white",
    subtle: "bg-gray-50",
    accentText: "text-gray-700",
    progress: "bg-gray-600",
    checkbox: "peer-checked:border-gray-600 peer-checked:bg-gray-600",
    activeRing: "ring-gray-600/10 border-gray-200",
  },
};

export const hobbyStyles: CardTheme = {
  card: "border-gray-200 bg-white",
  subtle: "bg-gray-50",
  accentText: "text-gray-700",
  progress: "bg-gray-600",
  checkbox: "peer-checked:border-gray-600 peer-checked:bg-gray-600",
  activeRing: "ring-gray-600/10 border-gray-200",
};
