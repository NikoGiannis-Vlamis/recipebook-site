const STORAGE_KEY = "recipeBookDemo";

const seedRecipes = [
  {
    id: 1,
    name: "Pasta al Pomodoro",
    ingredients: ["pasta", "tomato", "basil", "olive oil", "garlic"],
    steps: [
      "Boil the pasta until al dente",
      "Sauté garlic in olive oil",
      "Add chopped tomatoes and simmer for 10 minutes",
      "Toss the pasta with the sauce and fresh basil",
    ],
  },
  {
    id: 2,
    name: "Greek Salad",
    ingredients: ["tomato", "cucumber", "feta", "olives", "olive oil", "oregano"],
    steps: [
      "Chop the tomato and cucumber into chunks",
      "Add the olives and a slab of feta on top",
      "Drizzle with olive oil and a pinch of oregano",
    ],
  },
];

function loadRecipes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveRecipes(seedRecipes);
    return seedRecipes.slice();
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedRecipes.slice();
  } catch {
    return seedRecipes.slice();
  }
}

function saveRecipes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextId(list) {
  return list.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

let recipes = loadRecipes();
let activeIngredientFilter = "";
let activeRecipeId = null;

// ---- elements ----
const views = {
  list: document.getElementById("view-list"),
  detail: document.getElementById("view-detail"),
  add: document.getElementById("view-add"),
};
const navList = document.getElementById("nav-list");
const navAdd = document.getElementById("nav-add");
const logoLink = document.getElementById("logo-link");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const listHeading = document.getElementById("list-heading");
const recipeListEl = document.getElementById("recipe-list");
const emptyMsg = document.getElementById("empty-msg");

const detailName = document.getElementById("detail-name");
const detailIngredients = document.getElementById("detail-ingredients");
const detailSteps = document.getElementById("detail-steps");
const deleteBtn = document.getElementById("delete-btn");
const backToListBtn = document.getElementById("back-to-list");

const addForm = document.getElementById("add-form");
const addError = document.getElementById("add-error");

// ---- view switching ----
function showView(name) {
  for (const key in views) {
    views[key].hidden = key !== name;
  }
  navList.classList.toggle("active", name === "list");
  navAdd.classList.toggle("active", name === "add");
}

// ---- list rendering ----
function matchingRecipes() {
  if (!activeIngredientFilter) return recipes;
  const needle = activeIngredientFilter.toLowerCase();
  return recipes.filter((r) =>
    r.ingredients.some((ing) => ing.toLowerCase().includes(needle))
  );
}

function renderList() {
  const matches = matchingRecipes();

  listHeading.textContent = activeIngredientFilter
    ? `Results for "${activeIngredientFilter}"`
    : "All recipes";

  recipeListEl.innerHTML = "";
  matches.forEach((recipe) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = recipe.name;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openRecipe(recipe.id);
    });
    li.appendChild(link);
    recipeListEl.appendChild(li);
  });

  emptyMsg.hidden = matches.length !== 0;
  clearSearchBtn.hidden = !activeIngredientFilter;
}

// ---- detail rendering ----
function openRecipe(id) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return;

  activeRecipeId = id;
  detailName.textContent = recipe.name;

  detailIngredients.innerHTML = "";
  recipe.ingredients.forEach((ing) => {
    const li = document.createElement("li");
    li.textContent = ing;
    detailIngredients.appendChild(li);
  });

  detailSteps.innerHTML = "";
  recipe.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    detailSteps.appendChild(li);
  });

  showView("detail");
}

deleteBtn.addEventListener("click", () => {
  const recipe = recipes.find((r) => r.id === activeRecipeId);
  if (!recipe) return;
  if (!confirm(`Delete recipe "${recipe.name}"?`)) return;

  recipes = recipes.filter((r) => r.id !== activeRecipeId);
  saveRecipes(recipes);
  activeRecipeId = null;
  renderList();
  showView("list");
});

backToListBtn.addEventListener("click", () => showView("list"));

// ---- search ----
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  activeIngredientFilter = searchInput.value.trim();
  renderList();
});

clearSearchBtn.addEventListener("click", () => {
  activeIngredientFilter = "";
  searchInput.value = "";
  renderList();
});

// ---- add recipe ----
function linesFrom(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const ingredients = linesFrom(document.getElementById("ingredients").value);
  const steps = linesFrom(document.getElementById("steps").value);

  addError.hidden = true;

  if (!name) {
    addError.textContent = "Recipe name is required.";
    addError.hidden = false;
    return;
  }
  if (recipes.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
    addError.textContent = `Recipe "${name}" already exists.`;
    addError.hidden = false;
    return;
  }
  if (ingredients.length === 0) {
    addError.textContent = "Add at least one ingredient.";
    addError.hidden = false;
    return;
  }
  if (steps.length === 0) {
    addError.textContent = "Add at least one step.";
    addError.hidden = false;
    return;
  }

  const recipe = { id: nextId(recipes), name, ingredients, steps };
  recipes.push(recipe);
  saveRecipes(recipes);

  addForm.reset();
  activeIngredientFilter = "";
  searchInput.value = "";
  renderList();
  showView("list");
});

// ---- nav ----
navList.addEventListener("click", () => showView("list"));
navAdd.addEventListener("click", () => showView("add"));
logoLink.addEventListener("click", (e) => {
  e.preventDefault();
  showView("list");
});

// ---- init ----
renderList();
showView("list");
