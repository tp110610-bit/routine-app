import {
  MAX_NUTRITION_QUANTITY,
  NutritionFood,
  NutritionFoodId,
  NutritionQuickPreset,
  RoutineSection,
  RoutineState,
  getDietAssessment,
  getSectionFeedback,
  getSectionMaxScore,
  nutritionQuickPresets,
  trainingQuickActions,
} from "../../routineData";
import {
  CardTheme,
  FoodFormState,
  InlineNotice,
  ProteinSummary,
  faithOneTapActions,
  nutritionCategoryOptions,
  sectionStyles,
  todayNutritionPreset,
} from "../../lib/dashboard-config";
import { getDetailReasonItems } from "../../lib/dashboard-derived";
import { getSectionStatus } from "../../lib/dashboard-helpers";
import {
  CheckIcon,
  CompactActionButton,
  EmptyStatePanel,
  InlineNoticeMessage,
  QuickInputGroup,
  StarIcon,
  SummaryChips,
} from "./Primitives";

function QuickFoodActions({
  title,
  foods,
  routine,
  favoriteFoodIds,
  onAddFood,
  onToggleFavoriteFood,
  emphasis = false,
  emptyMessage,
  emptyDetail,
}: {
  title: string;
  foods: readonly NutritionFood[];
  routine: RoutineState;
  favoriteFoodIds: readonly string[];
  onAddFood: (foodId: NutritionFoodId) => void;
  onToggleFavoriteFood: (foodId: string) => void;
  emphasis?: boolean;
  emptyMessage: string;
  emptyDetail?: string;
}) {
  if (foods.length === 0) {
    return (
      <QuickInputGroup title={title} helper="탭하면 +1">
        <EmptyStatePanel message={emptyMessage} detail={emptyDetail} compact />
      </QuickInputGroup>
    );
  }

  return (
    <QuickInputGroup title={title} helper="탭하면 +1">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {foods.map((food) => {
          const quantity = Number(routine[food.id] ?? 0);
          const isFavorite = favoriteFoodIds.includes(food.id);

          return (
            <div
              key={food.id}
              className={`flex min-w-[176px] items-center gap-2 rounded-[18px] border px-3 py-3 ${
                emphasis ? "border-slate-200 bg-slate-50/70" : "border-slate-200/80 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onAddFood(food.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-slate-800">{food.label}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  {food.proteinGrams}g · {food.unitLabel}
                  {quantity > 0 ? ` · 현재 ${quantity}` : ""}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onToggleFavoriteFood(food.id)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700"
                }`}
                aria-label={isFavorite ? `${food.label} 즐겨찾기 해제` : `${food.label} 즐겨찾기`}
              >
                <StarIcon filled={isFavorite} />
              </button>
            </div>
          );
        })}
      </div>
    </QuickInputGroup>
  );
}

export function SectionCard({
  section,
  routine,
  score,
  onToggleActivity,
  onSetNutritionQuantity,
  onIncrementNutritionFood,
  onApplyNutritionPreset,
  onCopyPreviousNutrition,
  proteinSummary,
  nutritionFoods,
  customFoods,
  favoriteFoodIds,
  favoriteFoods,
  recentFoods,
  nutritionMessage,
  isFoodFormOpen,
  editingFoodId,
  foodForm,
  foodFormError,
  onOpenCreateFoodForm,
  onCloseFoodForm,
  onFoodFormChange,
  onSaveFood,
  onEditFood,
  onDeleteFood,
  onToggleFavoriteFood,
}: {
  section: RoutineSection;
  routine: RoutineState;
  score: number;
  onToggleActivity: (key: keyof RoutineState, checked: boolean) => void;
  onSetNutritionQuantity: (key: NutritionFoodId, quantity: number) => void;
  onIncrementNutritionFood: (key: NutritionFoodId) => void;
  onApplyNutritionPreset: (preset: NutritionQuickPreset) => void;
  onCopyPreviousNutrition: () => void;
  proteinSummary: ProteinSummary;
  nutritionFoods: readonly NutritionFood[];
  customFoods: readonly NutritionFood[];
  favoriteFoodIds: readonly string[];
  favoriteFoods: readonly NutritionFood[];
  recentFoods: readonly NutritionFood[];
  nutritionMessage: InlineNotice | null;
  isFoodFormOpen: boolean;
  editingFoodId: string | null;
  foodForm: FoodFormState;
  foodFormError: string | null;
  onOpenCreateFoodForm: () => void;
  onCloseFoodForm: () => void;
  onFoodFormChange: (field: keyof FoodFormState, value: string) => void;
  onSaveFood: () => void;
  onEditFood: (food: NutritionFood) => void;
  onDeleteFood: (foodId: string) => void;
  onToggleFavoriteFood: (foodId: string) => void;
}) {
  const styles: CardTheme = sectionStyles[section.id];
  const maxScore = getSectionMaxScore(section.id);
  const progress = (score / maxScore) * 100;
  const dietAssessment = section.id === "nutrition" ? getDietAssessment(routine, customFoods) : null;
  const summaryItems = getDetailReasonItems(section.id, routine, customFoods);

  return (
    <article className={`glass-panel rounded-[30px] p-5 sm:p-6 ${styles.card}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.2rem] font-semibold tracking-[-0.04em] text-slate-950">{section.title}</h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">{section.summary}</p>
        </div>
        <div className="score-pill inline-flex shrink-0 flex-col rounded-[20px] px-3.5 py-2.5 text-left tabular-nums sm:items-end sm:text-right">
          <p className="inline-flex min-w-fit items-baseline whitespace-nowrap text-[1.8rem] font-semibold leading-none tracking-[-0.06em] text-slate-950">
            {score}
            <span className="ml-1 whitespace-nowrap text-sm font-medium tracking-normal text-slate-400">/ {maxScore}</span>
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {getSectionStatus(score, maxScore)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
          <div className={`h-full rounded-full ${styles.progress}`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
      </div>

      {section.id === "nutrition" && dietAssessment ? (
        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[22px] border border-slate-200/80 bg-white/92 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">오늘 단백질 현황</p>
              <p className="text-sm text-slate-500">{Math.round(proteinSummary.ratio * 100)}%</p>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-900">
              오늘 단백질 {proteinSummary.intake}g / 권장 {proteinSummary.recommended}g
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
              <div className="h-full rounded-full bg-gray-600" style={{ width: `${proteinSummary.ratio * 100}%` }} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">점수 근거</p>
            <SummaryChips items={summaryItems} />
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">점수 근거</p>
          <SummaryChips items={summaryItems} />
        </div>
      )}

      {section.id === "nutrition" ? (
        <div className="mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onCopyPreviousNutrition}
              className="score-pill rounded-full px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              어제 식단 복사
            </button>
            <button
              type="button"
              onClick={isFoodFormOpen && !editingFoodId ? onCloseFoodForm : onOpenCreateFoodForm}
              className="score-pill rounded-full px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {isFoodFormOpen && !editingFoodId ? "닫기" : "+ 음식 추가"}
            </button>
          </div>
          <InlineNoticeMessage message={nutritionMessage} />
          <div className="mt-4 space-y-3">
            <QuickFoodActions
              title="즐겨찾기"
              foods={favoriteFoods}
              routine={routine}
              favoriteFoodIds={favoriteFoodIds}
              onAddFood={onIncrementNutritionFood}
              onToggleFavoriteFood={onToggleFavoriteFood}
              emphasis
              emptyMessage="즐겨찾기한 음식이 없습니다"
              emptyDetail="자주 먹는 음식에 별표를 남겨보세요."
            />
            <QuickFoodActions
              title="최근 먹은 음식"
              foods={recentFoods}
              routine={routine}
              favoriteFoodIds={favoriteFoodIds}
              onAddFood={onIncrementNutritionFood}
              onToggleFavoriteFood={onToggleFavoriteFood}
              emptyMessage="최근 먹은 음식이 없습니다"
              emptyDetail="오늘 기록부터 시작해보세요."
            />
          </div>
          <QuickInputGroup title="오늘 식단 초기값" helper="비어 있는 항목만 1로 채움">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">아침, 간식, 운동 후 기본 흐름을 한 번에 채워요.</p>
                <p className="mt-1 text-[12px] text-slate-500">이미 입력된 수량은 그대로 유지됩니다.</p>
              </div>
              <button
                type="button"
                onClick={() => onApplyNutritionPreset(todayNutritionPreset)}
                className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                오늘 식단 초기값 넣기
              </button>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">부분 프리셋</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {nutritionQuickPresets.map((preset) => (
                <CompactActionButton
                  key={preset.id}
                  label={preset.label}
                  description={preset.description}
                  theme={styles}
                  onClick={() => onApplyNutritionPreset(preset)}
                />
              ))}
            </div>
          </QuickInputGroup>
          <div className="mt-4">
            {customFoods.length > 0 ? (
              <p className="text-[12px] text-slate-400">커스텀 음식 {customFoods.length}개</p>
            ) : (
              <EmptyStatePanel
                message="커스텀 음식이 없습니다"
                detail="필요한 음식은 직접 추가할 수 있습니다."
                compact
              />
            )}
          </div>
          {isFoodFormOpen ? (
            <div className="soft-panel mt-4 rounded-[24px] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{editingFoodId ? "음식 수정" : "새 음식 추가"}</p>
                  <p className="mt-1 text-xs text-slate-400">수량, 단백질, 점수 계산에 바로 반영됩니다.</p>
                </div>
                <button
                  type="button"
                  onClick={onCloseFoodForm}
                  className="text-xs font-medium text-slate-400 transition hover:text-slate-700"
                >
                  닫기
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">음식명</span>
                  <input
                    type="text"
                    value={foodForm.label}
                    onChange={(event) => onFoodFormChange("label", event.target.value)}
                    className="w-full rounded-[16px] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                    placeholder="예: 두부"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">단백질(g)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={foodForm.proteinGrams}
                    onChange={(event) => onFoodFormChange("proteinGrams", event.target.value)}
                    className="w-full rounded-[16px] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                    placeholder="0"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">단위명</span>
                  <input
                    type="text"
                    value={foodForm.unitLabel}
                    onChange={(event) => onFoodFormChange("unitLabel", event.target.value)}
                    className="w-full rounded-[16px] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                    placeholder="예: 1개, 1팩"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">카테고리</span>
                  <select
                    value={foodForm.category}
                    onChange={(event) => onFoodFormChange("category", event.target.value)}
                    className="w-full rounded-[16px] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                  >
                    {nutritionCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {foodFormError ? <p className="mt-3 text-sm text-[#8b5e3c]">{foodFormError}</p> : null}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseFoodForm}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={onSaveFood}
                  className="rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {editingFoodId ? "수정 저장" : "추가 저장"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {section.id === "training" ? (
        <div className="mt-5">
          <QuickInputGroup title="원탭 훈련" helper="바로 체크">
            <div className="flex flex-wrap gap-2">
              {trainingQuickActions.map((action) => (
                <CompactActionButton
                  key={action.key}
                  label={action.label}
                  active={Boolean(routine[action.key])}
                  theme={styles}
                  compact
                  onClick={() => onToggleActivity(action.key, !routine[action.key])}
                />
              ))}
            </div>
          </QuickInputGroup>
        </div>
      ) : null}

      {section.id === "faith" ? (
        <div className="mt-5">
          <QuickInputGroup title="원탭 신앙" helper="바로 체크">
            <div className="flex flex-wrap gap-2">
              {faithOneTapActions.map((action) => (
                <CompactActionButton
                  key={action.key}
                  label={action.label}
                  active={Boolean(routine[action.key])}
                  theme={styles}
                  compact
                  onClick={() => onToggleActivity(action.key, !routine[action.key])}
                />
              ))}
            </div>
          </QuickInputGroup>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {section.id === "nutrition" ? "전체 음식 목록" : "전체 목록"}
          </p>
          {section.id === "nutrition" ? (
            <p className="mt-1 text-sm text-slate-400">{section.items.length}개 음식을 바로 조절할 수 있어요.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-slate-200/80 bg-white/78 px-2 py-2 sm:px-3">
        {section.items.map((item, index) => {
          const previousGroup = index > 0 ? section.items[index - 1]?.group : null;
          const shouldRenderGroup = item.group && item.group !== previousGroup;
          const isNutritionItem = section.id === "nutrition";

          if (isNutritionItem) {
            const nutritionKey = item.key as NutritionFoodId;
            const quantity = Number(routine[nutritionKey] ?? 0);
            const checked = quantity > 0;
            const matchedFood = nutritionFoods.find((food) => food.id === nutritionKey);

            return (
              <div key={item.key}>
                <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200/70 bg-white/90 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onSetNutritionQuantity(nutritionKey, event.target.checked ? 1 : 0)}
                      className="peer sr-only"
                    />
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-white transition ${styles.checkbox}`}
                    >
                      <span className={checked ? "opacity-100" : "opacity-0"}>
                        <CheckIcon />
                      </span>
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.note ?? matchedFood?.unitLabel}</p>
                    </div>
                  </label>

                  <div className="flex items-center justify-end gap-2 sm:gap-2.5">
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteFood(nutritionKey)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                        favoriteFoodIds.includes(nutritionKey)
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-400 hover:text-slate-700"
                      }`}
                      aria-label={
                        favoriteFoodIds.includes(nutritionKey)
                          ? `${item.label} 즐겨찾기 해제`
                          : `${item.label} 즐겨찾기`
                      }
                    >
                      <StarIcon filled={favoriteFoodIds.includes(nutritionKey)} />
                    </button>
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-1">
                      <button
                        type="button"
                        onClick={() => onSetNutritionQuantity(nutritionKey, quantity - 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base text-slate-700 transition hover:bg-slate-100"
                        aria-label={`${item.label} 수량 감소`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={MAX_NUTRITION_QUANTITY}
                        step="1"
                        value={quantity}
                        onChange={(event) => {
                          const nextValue = event.target.value.trim();
                          if (nextValue === "") {
                            onSetNutritionQuantity(nutritionKey, 0);
                            return;
                          }

                          const parsed = Number.parseInt(nextValue, 10);
                          onSetNutritionQuantity(nutritionKey, parsed);
                        }}
                        className="h-10 w-12 bg-transparent text-center text-sm font-semibold text-slate-800 outline-none"
                        aria-label={`${item.label} 수량`}
                      />
                      <button
                        type="button"
                        onClick={() => onSetNutritionQuantity(nutritionKey, quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base text-slate-700 transition hover:bg-slate-100"
                        aria-label={`${item.label} 수량 증가`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {matchedFood?.isCustom ? (
                  <div className="mb-1 ml-8 mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEditFood(matchedFood)}
                      className="text-xs font-medium text-slate-400 transition hover:text-slate-700"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteFood(matchedFood.id)}
                      className="text-xs font-medium text-slate-400 transition hover:text-[#8b5e3c]"
                    >
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>
            );
          }

          const checked = Boolean(routine[item.key]);

          return (
            <div key={item.key}>
              {shouldRenderGroup ? (
                <p className="pt-3 text-xs font-semibold tracking-[0.12em] text-slate-500">{item.group}</p>
              ) : null}

              <label className="flex cursor-pointer items-center gap-3 py-2.5 transition hover:opacity-90">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onToggleActivity(item.key, event.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-white transition ${styles.checkbox}`}
                >
                  <span className={checked ? "opacity-100" : "opacity-0"}>
                    <CheckIcon />
                  </span>
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                  {item.label}
                  {item.note ? <span className="ml-1 font-normal text-slate-500">({item.note})</span> : null}
                </span>
                {typeof item.points === "number" ? (
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.subtle} ${styles.accentText}`}>
                    +{item.points}
                  </span>
                ) : null}
              </label>
            </div>
          );
        })}
      </div>

      <div className="soft-panel mt-5 rounded-[22px] px-4 py-3">
        <p
          className="text-sm leading-6 text-slate-600"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {getSectionFeedback(section.id, routine, customFoods)}
        </p>
      </div>
    </article>
  );
}
