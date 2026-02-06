let faqs = [
  {
    id: 1,
    group: "mail",
    category: "hr",
    categoryLabel: "人事・労務",
    question: "有給休暇の申請方法を教えてください",
    answer:
      "有給休暇は社内ポータルの「勤怠管理」→「休暇申請」から申請できます。取得希望日の3営業日前までに申請してください。",
    updatedAt: "2024/01/15",
  },
  {
    id: 2,
    group: "mail",
    category: "it",
    categoryLabel: "IT・システム",
    question: "PCの故障時はどこに連絡すればよいですか？",
    answer:
      "Slackの#it-helpに状況を投稿し、機器番号を共有してください。緊急時は内線1234へ連絡をお願いします。",
    updatedAt: "2024/02/01",
  },
  {
    id: 3,
    group: "other",
    category: "general",
    categoryLabel: "一般",
    question: "名刺の発注方法は？",
    answer:
      "総務ポータルの「備品申請」から名刺を選択し、必要情報を入力してください。通常3営業日以内に納品されます。",
    updatedAt: "2024/01/28",
  },
  {
    id: 4,
    group: "listing",
    category: "finance",
    categoryLabel: "経理・財務",
    question: "経費精算の締め日はいつですか？",
    answer:
      "毎月25日が締め日です。月末精算分は翌月5日までに提出してください。",
    updatedAt: "2024/02/05",
  },
  {
    id: 5,
    group: "listing",
    category: "legal",
    categoryLabel: "法務・コンプライアンス",
    question: "契約書のレビュー依頼フローを教えてください",
    answer:
      "契約書レビューは法務チームのフォームから依頼してください。レビュー期間の目安は5営業日です。",
    updatedAt: "2024/01/10",
  },
  {
    id: 6,
    group: "other",
    category: "general",
    categoryLabel: "一般",
    question: "来客時の受付手順は？",
    answer:
      "来客予定はGoogleカレンダーに登録し、当日は受付タブレットにて来客登録を依頼してください。",
    updatedAt: "2024/01/20",
  },
  {
    id: 7,
    group: "mail",
    category: "hr",
    categoryLabel: "人事・労務",
    question: "在宅勤務の申請ルールを知りたいです",
    answer:
      "在宅勤務は週2回まで可能です。申請は前日までに上長承認を取得し、勤怠システムへ登録してください。",
    updatedAt: "2024/02/08",
  },
];

const categories = [
  { id: "general", label: "一般", group: "other" },
  { id: "hr", label: "人事・労務", group: "mail" },
  { id: "it", label: "IT・システム", group: "mail" },
  { id: "finance", label: "経理・財務", group: "listing" },
  { id: "legal", label: "法務・コンプライアンス", group: "listing" },
  { id: "uncategorized", label: "未分類", group: "other" },
];

const faqGroups = [
  { id: "mail", label: "メール対応系", icon: "📨", colorClass: "chip--mail" },
  { id: "listing", label: "出品系", icon: "🏷️", colorClass: "chip--listing" },
  { id: "other", label: "その他", icon: "📌", colorClass: "chip--other" },
];

const faqList = document.getElementById("faqList");
const searchInput = document.getElementById("searchInput");
const resultCount = document.getElementById("resultCount");
const categoryFilters = document.getElementById("categoryFilters");
const modalGroupChips = document.getElementById("modalGroupChips");
const modalCategoryChips = document.getElementById("modalCategoryChips");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryButton = document.getElementById("addCategory");
const modal = document.getElementById("faqModal");
const openModalButton = document.getElementById("openModal");
const createFaqButton = document.getElementById("createFaq");

let activeCategory = "all";
let selectedCategory = categories[0]?.id ?? "general";
let selectedGroup = faqGroups[0]?.id ?? "other";

const slugifyCategory = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const getCategoryCounts = () =>
  categories.reduce((acc, category) => {
    acc[category.id] = faqs.filter((faq) => faq.category === category.id).length;
    return acc;
  }, {});

const getCategoriesForGroup = (groupId) =>
  categories.filter((category) => category.group === groupId);

const renderCategoryFilters = () => {
  const counts = getCategoryCounts();
  const totalCount = faqs.length;
  const groupSections = faqGroups
    .map((group) => {
      const groupCategories = categories.filter((category) => category.group === group.id);
      if (groupCategories.length === 0) return "";
      return `
        <div class="filters__group">
          <div class="filters__group-title">
            <span class="filters__group-icon">${group.icon}</span>
            <span>${group.label}</span>
          </div>
          <div class="filters__group-list">
            ${groupCategories
              .map(
                (category) => `
                <button class="chip ${group.colorClass} ${
                  activeCategory === category.id ? "is-active" : ""
                }" data-category="${category.id}">
                  ${category.label} (${counts[category.id] ?? 0})
                </button>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");
  categoryFilters.innerHTML = `
    <button class="chip ${activeCategory === "all" ? "is-active" : ""}" data-category="all">
      すべて (${totalCount})
    </button>
    <div class="filters__groups">${groupSections}</div>
  `;
};

const renderGroupChips = () => {
  modalGroupChips.innerHTML = faqGroups
    .map(
      (group) => `
      <button class="chip ${group.colorClass} ${
        selectedGroup === group.id ? "is-active" : ""
      }" type="button" data-group="${group.id}">
        <span class="chip__icon">${group.icon}</span>
        ${group.label}
      </button>
    `
    )
    .join("");
};

const renderModalCategories = () => {
  const visibleCategories = getCategoriesForGroup(selectedGroup);
  if (selectedGroup === "other") {
    const uncategorized = categories.find((category) => category.id === "uncategorized");
    if (uncategorized && !visibleCategories.includes(uncategorized)) {
      visibleCategories.push(uncategorized);
    }
  }
  modalCategoryChips.innerHTML = visibleCategories
    .map(
      (category) => `
      <div class="category-row">
        <button class="chip ${selectedCategory === category.id ? "is-active" : ""}" type="button" data-modal-category="${
          category.id
        }">
          ${category.label}
        </button>
        ${
          category.id !== "uncategorized"
            ? `<button class="category-delete" type="button" data-category-delete="${category.id}">
          削除
        </button>`
            : ""
        }
      </div>
    `
    )
    .join("");
};

const createFaqCard = (faq) => {
  const card = document.createElement("article");
  card.className = "faq-item";
  const groupLabelClass = `faq-item__category--${faq.group ?? "other"}`;
  card.innerHTML = `
    <div class="faq-item__header" data-toggle="${faq.id}">
      <div>
        <div class="faq-item__meta">
          <span class="faq-item__category ${groupLabelClass}">${faq.categoryLabel}</span>
          <span>更新日: ${faq.updatedAt}</span>
        </div>
        <h3 class="faq-item__title">${faq.question}</h3>
      </div>
      <div class="faq-item__toggle">⌄</div>
    </div>
    <div class="faq-item__content">
      <p>${faq.answer}</p>
      <div class="faq-item__footer">
        <span>スタッフがいつでも編集可能</span>
        <div class="faq-item__actions">
          <button class="link-button" data-edit="${faq.id}">編集</button>
          <button class="link-button" data-delete="${faq.id}">削除</button>
        </div>
      </div>
    </div>
  `;
  return card;
};

const renderFaqs = (items) => {
  faqList.innerHTML = "";
  faqGroups.forEach((group) => {
    const groupItems = items.filter((faq) => faq.group === group.id);
    const section = document.createElement("section");
    section.className = "faq-group";
    section.innerHTML = `
      <header class="faq-group__header">
        <h3>${group.label}</h3>
        <span>${groupItems.length}件</span>
      </header>
    `;
    const list = document.createElement("div");
    list.className = "faq-group__list";
    if (groupItems.length === 0) {
      list.innerHTML = `<p class="faq-group__empty">該当FAQがありません</p>`;
    } else {
      groupItems.forEach((faq) => list.appendChild(createFaqCard(faq)));
    }
    section.appendChild(list);
    faqList.appendChild(section);
  });
};

const applyFilters = () => {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesTerm =
      faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term);
    return matchesCategory && matchesTerm;
  });
  renderFaqs(filtered);
  resultCount.textContent = `${filtered.length}件のFAQが見つかりました`;
  renderCategoryFilters();
};

searchInput.addEventListener("input", applyFilters);
document.getElementById("searchAction").addEventListener("click", applyFilters);

categoryFilters.addEventListener("click", (event) => {
  const target = event.target;
  if (!target.matches("[data-category]")) return;
  activeCategory = target.dataset.category;
  applyFilters();
});

faqList.addEventListener("click", (event) => {
  const header = event.target.closest("[data-toggle]");
  if (header) {
    header.parentElement.classList.toggle("is-open");
  }
  if (event.target.matches("[data-edit]")) {
    alert("デモ: FAQの編集画面へ遷移します。");
  }
  if (event.target.matches("[data-delete]")) {
    const targetId = Number(event.target.dataset.delete);
    faqs = faqs.filter((faq) => faq.id !== targetId);
    applyFilters();
  }
});

const openModal = () => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
};

openModalButton.addEventListener("click", () => {
  openModalButton.classList.add("is-pulse");
  setTimeout(() => openModalButton.classList.remove("is-pulse"), 500);
  renderGroupChips();
  renderModalCategories();
  openModal();
});

modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});

modalCategoryChips.addEventListener("click", (event) => {
  const target = event.target;
  if (target.matches("[data-modal-category]")) {
    selectedCategory = target.dataset.modalCategory;
    renderModalCategories();
    return;
  }
  if (!target.matches("[data-category-delete]")) return;
  const id = target.dataset.categoryDelete;
  const index = categories.findIndex((category) => category.id === id);
  if (index === -1) return;
  categories.splice(index, 1);
  faqs = faqs.map((faq) =>
    faq.category === id
      ? {
          ...faq,
          category: "uncategorized",
          categoryLabel: "未分類",
        }
      : faq
  );
  if (!categories.find((category) => category.id === selectedCategory)) {
    selectedCategory = categories[0]?.id ?? "general";
  }
  if (activeCategory === id) {
    activeCategory = "uncategorized";
  }
  renderModalCategories();
  applyFilters();
});

modalGroupChips.addEventListener("click", (event) => {
  const target = event.target;
  if (!target.matches("[data-group]")) return;
  selectedGroup = target.dataset.group;
  const groupCategories = getCategoriesForGroup(selectedGroup);
  const selectedStillVisible = groupCategories.find((category) => category.id === selectedCategory);
  if (!selectedStillVisible) {
    selectedCategory = groupCategories[0]?.id ?? "uncategorized";
  }
  renderGroupChips();
  renderModalCategories();
});

addCategoryButton.addEventListener("click", () => {
  const label = newCategoryInput.value.trim();
  if (!label) return;
  const id = slugifyCategory(label) || `category-${Date.now()}`;
  const exists = categories.find((category) => category.id === id || category.label === label);
  if (!exists) {
    categories.push({ id, label, group: selectedGroup });
  }
  selectedCategory = id;
  newCategoryInput.value = "";
  renderModalCategories();
  renderCategoryFilters();
});

createFaqButton.addEventListener("click", () => {
  const question = document.getElementById("questionInput").value.trim();
  const answer = document.getElementById("answerInput").value.trim();
  if (!question || !answer) {
    alert("質問と回答を入力してください。");
    return;
  }
  const category = categories.find((item) => item.id === selectedCategory) ?? categories[0];
  const group = faqGroups.find((item) => item.id === selectedGroup) ?? faqGroups[0];
  faqs.unshift({
    id: Date.now(),
    group: group.id,
    category: category.id,
    categoryLabel: category.label,
    question,
    answer,
    updatedAt: new Date().toISOString().slice(0, 10).replace(/-/g, "/"),
  });
  document.getElementById("questionInput").value = "";
  document.getElementById("answerInput").value = "";
  applyFilters();
  closeModal();
});

renderCategoryFilters();
renderFaqs(faqs);
renderModalCategories();
