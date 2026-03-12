export class QuizListItem {
  static render({ icon, title, meta, accent }) {
    return `
      <div class="quiz-list-item" data-quiz="${title}">
        <div class="quiz-list-item__icon-wrap" style="background:${accent}15;color:${accent}">
          <i data-lucide="${icon}" style="width:20px;height:20px"></i>
        </div>
        <div class="quiz-list-item__info">
          <div class="quiz-list-item__title">${title}</div>
          <div class="quiz-list-item__meta">${meta}</div>
        </div>
        <i data-lucide="chevron-right" class="quiz-list-item__chevron" style="width:18px;height:18px"></i>
      </div>
    `;
  }
}
