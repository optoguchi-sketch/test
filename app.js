const STORAGE_KEY = "officePartnerFaqData";
const MAJOR_CATEGORIES = ["出品対応", "メール対応", "その他"];

const defaultData = {
  categories: {
    "出品対応": {
      middleCategories: [
        { id: "unclassified", name: "未分類", locked: true },
        { id: "listing-setup", name: "商品登録", locked: false },
        { id: "inventory", name: "在庫連携", locked: false },
      ],
    },
    "メール対応": {
      middleCategories: [
        { id: "unclassified", name: "未分類", locked: true },
        { id: "templates", name: "テンプレート", locked: false },
        { id: "claims", name: "クレーム", locked: false },
      ],
    },
    "その他": {
      middleCategories: [
        { id: "unclassified", name: "未分類", locked: true },
        { id: "office", name: "社内運用", locked: false },
      ],
    },
  },
  faqs: [
    {
      id: "faq-1",
      title: "初回出品時の必須チェック項目は？",
      body: "**出品前の確認**\n- 価格\n- 在庫\n- 商品画像\n\n不備がある場合は差し戻しされます。",
      majorCategory: "出品対応",
      middleCategoryId: "listing-setup",
      tags: ["初期設定", "チェック"],
      updatedAt: "2024/02/10",
    },
    {
      id: "faq-2",
      title: "テンプレート返信の更新方法",
      body: "テンプレートは**毎週金曜**に見直します。更新は共有フォルダの最新版を使用してください。",
      majorCategory: "メール対応",
      middleCategoryId: "templates",
      tags: ["テンプレ", "メール"],
      updatedAt: "2024/02/12",
    },
    {
      id: "faq-3",
      title: "在庫連携が止まったときの対応",
      body: "ステータスが停止になっていないか確認し、\n1. 再連携\n2. ログ確認\n3. サポート連絡\nの順で対応します。",
      majorCategory: "出品対応",
      middleCategoryId: "inventory",
      tags: ["在庫", "トラブル"],
      updatedAt: "2024/02/09",
    },
    {
      id: "faq-4",
      title: "クレームメールの一次返信",
      body: "**24時間以内**に一次返信を行います。\n謝意と状況確認をセットで送信してください。",
      majorCategory: "メール対応",
      middleCategoryId: "claims",
      tags: ["クレーム", "対応"],
      updatedAt: "2024/02/08",
    },
    {
      id: "faq-5",
      title: "電話対応が必要な場合のフロー",
      body: "メールで解決できない場合は\n1. 内容確認\n2. 電話予約\n3. 共有メモ入力\nの順に進めます。",
      majorCategory: "その他",
      middleCategoryId: "office",
      tags: ["電話", "フロー"],
      updatedAt: "2024/02/05",
    },
  ],
};

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const tagFilters = document.getElementById("tagFilters");
const stats = document.getElementById("stats");
const suggestions = document.getElementById("suggestions");
const categorySections = document.querySelectorAll(".category-block");

const faqModal = document.getElementById("faqModal");
const faqModalTitle = document.getElementById("faqModalTitle");
const faqTitle = document.getElementById("faqTitle");
const faqBody = document.getElementById("faqBody");
const faqMajor = document.getElementById("faqMajor");
const faqMiddle = document.getElementById("faqMiddle");
const faqTags = document.getElementById("faqTags");
const openFaqModal = document.getElementById("openFaqModal");
const saveFaq = document.getElementById("saveFaq");

const categoryModal = document.getElementById("categoryModal");
const categoryName = document.getElementById("categoryName");
const saveCategory = document.getElementById("saveCategory");

let data = loadData();
let editingFaqId = null;
let editingCategory = null;
let activeTags = new Set();
let middleSelection = MAJOR_CATEGORIES.reduce((acc, major) => {
  acc[major] = "all";
  return acc;
}, {});

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(prefix) {
  if (crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "/");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdown(value) {
  const paragraphs = escapeHtml(value).split(/\n{2,}/).filter(Boolean);
  return paragraphs
    .map((paragraph) => {
      let html = paragraph
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.+?)`/g, "<code>$1</code>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
      return `<p>${html}</p>`;
    })
    .join("");
}

function matchesSearch(faq, term) {
  if (!term) return true;
  const value = term.toLowerCase();
  const target = `${faq.title} ${faq.body} ${faq.tags.join(" ")}`.toLowerCase();
  return target.includes(value);
}

function matchesTags(faq) {
  if (!activeTags.size) return true;
  return faq.tags.some((tag) => activeTags.has(tag));
}

function getFilteredFaqs() {
  const term = searchInput.value.trim();
  return data.faqs.filter((faq) => matchesSearch(faq, term) && matchesTags(faq));
}

function getMiddleCategories(major) {
  return data.categories[major]?.middleCategories ?? [];
}

function getMiddleCategoryLabel(major, id) {
  const match = getMiddleCategories(major).find((item) => item.id === id);
  return match ? match.name : "未分類";
}

function renderSuggestions() {
  const term = searchInput.value.trim();
  if (!term) {
    suggestions.classList.remove("is-open");
    suggestions.innerHTML = "";
    return;
  }
  const matched = data.faqs
    .filter((faq) => matchesSearch(faq, term))
    .slice(0, 5);
  if (!matched.length) {
    suggestions.classList.remove("is-open");
    suggestions.innerHTML = "";
    return;
  }
  suggestions.innerHTML = matched
    .map(
      (faq) =>
        `<button type="button" data-suggest="${faq.id}">${escapeHtml(faq.title)}</button>`
    )
    .join("");
  suggestions.classList.add("is-open");
}

function renderTagFilters() {
  const tags = Array.from(
    new Set(data.faqs.flatMap((faq) => faq.tags))
  ).sort();
  if (!tags.length) {
    tagFilters.innerHTML = `<span class="empty-state">タグがありません</span>`;
    return;
  }
  tagFilters.innerHTML = tags
    .map((tag) => {
      const activeClass = activeTags.has(tag) ? "is-active" : "";
      return `<button class="chip ${activeClass}" data-tag="${escapeHtml(tag)}" type="button">${escapeHtml(
        tag
      )}</button>`;
    })
    .join("");
}

function renderStats() {
  const filtered = getFilteredFaqs();
  stats.textContent = `全${data.faqs.length}件中 ${filtered.length}件を表示中`;
}

function renderCategory(major) {
  const section = Array.from(categorySections).find(
    (item) => item.dataset.major === major
  );
  if (!section) return;

  const filteredFaqs = getFilteredFaqs().filter(
    (faq) => faq.majorCategory === major
  );

  const selectedMiddle = middleSelection[major];
  const visibleFaqs =
    selectedMiddle === "all"
      ? filteredFaqs
      : filteredFaqs.filter((faq) => faq.middleCategoryId === selectedMiddle);

  const middleList = getMiddleCategories(major);

  section.innerHTML = `
    <div class="category-header">
      <div>
        <h2 class="category-title">${major}</h2>
        <p class="category-meta">${filteredFaqs.length}件 / ${data.faqs.filter(
    (faq) => faq.majorCategory === major
  ).length}件</p>
      </div>
      <span class="category-meta">中カテゴリ: ${middleList.length}件</span>
    </div>
    <div class="middle-section">
      <div class="middle-header">
        <span class="field-label">中カテゴリ管理</span>
        <div class="middle-add">
          <input type="text" placeholder="中カテゴリを追加" data-middle-input="${major}" />
          <button class="btn btn--ghost" data-middle-add="${major}" type="button">追加</button>
        </div>
      </div>
    <div class="middle-list">
        ${renderMiddleItems(major, middleList, filteredFaqs, selectedMiddle)}
    </div>
    </div>
    <div class="faq-list">
      ${renderFaqCards(visibleFaqs, major)}
    </div>
  `;
}

function renderMiddleItems(major, middleList, filteredFaqs, selectedMiddle) {
  const allCount = filteredFaqs.length;
  const allActiveClass = selectedMiddle === "all" ? "is-active" : "";
  const items = [
    `<div class="middle-item ${allActiveClass}" data-middle="all" data-major="${major}">
      <div class="middle-item__name">
        <button class="icon-button" data-middle-select="all" data-major="${major}">すべて</button>
        <span class="middle-item__count">${allCount}件</span>
      </div>
      <span></span>
      <span></span>
    </div>`,
  ];

  middleList.forEach((middle) => {
    const count = filteredFaqs.filter(
      (faq) => faq.middleCategoryId === middle.id
    ).length;
    const disabled = middle.locked ? "disabled" : "";
    const activeClass = selectedMiddle === middle.id ? "is-active" : "";
    items.push(`
      <div class="middle-item ${activeClass}" data-middle="${middle.id}" data-major="${major}">
        <div class="middle-item__name">
          <button class="icon-button" data-middle-select="${middle.id}" data-major="${major}">
            ${escapeHtml(middle.name)}
          </button>
          <span class="middle-item__count">${count}件</span>
        </div>
        <button class="icon-button" data-middle-edit="${middle.id}" data-major="${major}" ${disabled}>✎</button>
        <button class="icon-button" data-middle-delete="${middle.id}" data-major="${major}" ${disabled}>🗑</button>
      </div>
    `);
  });

  return items.join("");
}

function renderFaqCards(faqs, major) {
  if (!faqs.length) {
    return `<div class="empty-state">該当するFAQがありません</div>`;
  }
  return faqs
    .map((faq) => {
      const middleLabel = getMiddleCategoryLabel(major, faq.middleCategoryId);
      const tags = faq.tags
        .map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`)
        .join("");
      return `
        <details class="faq-card">
          <summary>
            <div class="faq-card__title">${escapeHtml(faq.title)}</div>
            <div class="faq-card__meta">
              <span>${escapeHtml(middleLabel)}</span>
              <span>更新日 ${faq.updatedAt}</span>
            </div>
          </summary>
          <div class="faq-card__body">${renderMarkdown(faq.body)}</div>
          <div class="faq-card__tags">${tags}</div>
          <div class="faq-card__actions">
            <button class="btn btn--ghost" data-faq-edit="${faq.id}" type="button">編集</button>
            <button class="btn btn--ghost" data-faq-delete="${faq.id}" type="button">削除</button>
          </div>
        </details>
      `;
    })
    .join("");
}

function renderAll() {
  renderTagFilters();
  renderStats();
  MAJOR_CATEGORIES.forEach(renderCategory);
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function resetFaqModal() {
  faqTitle.value = "";
  faqBody.value = "";
  faqTags.value = "";
  faqMajor.innerHTML = MAJOR_CATEGORIES.map(
    (major) => `<option value="${major}">${major}</option>`
  ).join("");
  updateMiddleOptions(faqMajor.value);
}

function updateMiddleOptions(major, selectedId) {
  const options = getMiddleCategories(major).map(
    (middle) =>
      `<option value="${middle.id}" ${
        selectedId === middle.id ? "selected" : ""
      }>${escapeHtml(middle.name)}</option>`
  );
  faqMiddle.innerHTML = options.join("");
  if (selectedId) {
    faqMiddle.value = selectedId;
  }
}

function openFaqEditor(faq) {
  editingFaqId = faq?.id ?? null;
  faqModalTitle.textContent = editingFaqId ? "FAQを編集" : "FAQを作成";
  resetFaqModal();
  if (faq) {
    faqTitle.value = faq.title;
    faqBody.value = faq.body;
    faqTags.value = faq.tags.join(", ");
    faqMajor.value = faq.majorCategory;
    updateMiddleOptions(faq.majorCategory, faq.middleCategoryId);
  }
  openModal(faqModal);
}

function saveFaqData() {
  const title = faqTitle.value.trim();
  const body = faqBody.value.trim();
  if (!title || !body) {
    alert("タイトルと本文を入力してください。");
    return;
  }
  const major = faqMajor.value;
  const middle = faqMiddle.value;
  const tags = faqTags.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (editingFaqId) {
    const index = data.faqs.findIndex((faq) => faq.id === editingFaqId);
    if (index >= 0) {
      data.faqs[index] = {
        ...data.faqs[index],
        title,
        body,
        majorCategory: major,
        middleCategoryId: middle,
        tags,
        updatedAt: formatDate(),
      };
    }
  } else {
    data.faqs.unshift({
      id: generateId("faq"),
      title,
      body,
      majorCategory: major,
      middleCategoryId: middle,
      tags,
      updatedAt: formatDate(),
    });
  }
  saveData();
  renderAll();
  closeModal(faqModal);
}

function openCategoryEditor(major, middleId) {
  editingCategory = { major, middleId };
  const middle = getMiddleCategories(major).find((item) => item.id === middleId);
  if (!middle) return;
  categoryName.value = middle.name;
  openModal(categoryModal);
}

function saveCategoryData() {
  if (!editingCategory) return;
  const { major, middleId } = editingCategory;
  const middleList = getMiddleCategories(major);
  const middle = middleList.find((item) => item.id === middleId);
  if (!middle || middle.locked) return;
  const name = categoryName.value.trim();
  if (!name) {
    alert("中カテゴリ名を入力してください。");
    return;
  }
  middle.name = name;
  saveData();
  renderAll();
  closeModal(categoryModal);
}

function addMiddleCategory(major, name) {
  if (!name) return;
  const middleList = getMiddleCategories(major);
  if (middleList.some((item) => item.name === name)) {
    alert("同名の中カテゴリが既に存在します。");
    return;
  }
  middleList.push({ id: generateId("middle"), name, locked: false });
  saveData();
  renderAll();
}

function deleteMiddleCategory(major, middleId) {
  const middleList = getMiddleCategories(major);
  const middle = middleList.find((item) => item.id === middleId);
  if (!middle || middle.locked) return;
  const confirmDelete = confirm(
    `「${middle.name}」を削除します。FAQは未分類へ移動します。`
  );
  if (!confirmDelete) return;

  const unclassified = middleList.find((item) => item.locked);
  data.faqs = data.faqs.map((faq) => {
    if (faq.majorCategory === major && faq.middleCategoryId === middleId) {
      return { ...faq, middleCategoryId: unclassified?.id ?? "unclassified" };
    }
    return faq;
  });

  data.categories[major].middleCategories = middleList.filter(
    (item) => item.id !== middleId
  );

  if (middleSelection[major] === middleId) {
    middleSelection[major] = "all";
  }

  saveData();
  renderAll();
}

function handleMiddleSelection(major, middleId) {
  middleSelection[major] = middleId;
  renderAll();
}

searchInput.addEventListener("input", () => {
  renderSuggestions();
  renderAll();
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  suggestions.classList.remove("is-open");
  renderAll();
});

suggestions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-suggest]");
  if (!button) return;
  const faq = data.faqs.find((item) => item.id === button.dataset.suggest);
  if (!faq) return;
  searchInput.value = faq.title;
  suggestions.classList.remove("is-open");
  renderAll();
});

tagFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tag]");
  if (!button) return;
  const tag = button.dataset.tag;
  if (activeTags.has(tag)) {
    activeTags.delete(tag);
  } else {
    activeTags.add(tag);
  }
  renderAll();
});

openFaqModal.addEventListener("click", () => openFaqEditor(null));

faqMajor.addEventListener("change", (event) => {
  updateMiddleOptions(event.target.value);
});

saveFaq.addEventListener("click", saveFaqData);

saveCategory.addEventListener("click", saveCategoryData);

[faqModal, categoryModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target.dataset.close === "true") {
      closeModal(modal);
    }
  });
});

categorySections.forEach((section) => {
  section.addEventListener("click", (event) => {
    const major = section.dataset.major;
    const middleSelect = event.target.closest("[data-middle-select]");
    if (middleSelect) {
      handleMiddleSelection(major, middleSelect.dataset.middleSelect);
      return;
    }
    const addButton = event.target.closest("[data-middle-add]");
    if (addButton) {
      const input = section.querySelector(`[data-middle-input="${major}"]`);
      const name = input.value.trim();
      addMiddleCategory(major, name);
      input.value = "";
      return;
    }
    const editButton = event.target.closest("[data-middle-edit]");
    if (editButton) {
      openCategoryEditor(major, editButton.dataset.middleEdit);
      return;
    }
    const deleteButton = event.target.closest("[data-middle-delete]");
    if (deleteButton) {
      deleteMiddleCategory(major, deleteButton.dataset.middleDelete);
      return;
    }
    const faqEdit = event.target.closest("[data-faq-edit]");
    if (faqEdit) {
      const faq = data.faqs.find((item) => item.id === faqEdit.dataset.faqEdit);
      if (faq) openFaqEditor(faq);
      return;
    }
    const faqDelete = event.target.closest("[data-faq-delete]");
    if (faqDelete) {
      const confirmDelete = confirm("このFAQを削除しますか？");
      if (!confirmDelete) return;
      data.faqs = data.faqs.filter((item) => item.id !== faqDelete.dataset.faqDelete);
      saveData();
      renderAll();
    }
  });
});

renderAll();
