export class GameUI {
  constructor() {
    const ids = [
      "holeNumber", "holeName", "parValue", "strokeValue", "highScoreValue", "highScoreHoleValue",
      "progressText", "progressBar", "statusPill", "powerMeter", "powerFill", "resultModal",
      "resultEyebrow", "resultTitle", "resultSummary", "nextButton", "restartButton", "soundButton",
      "hudRight", "hudLeft",
    ];
    ids.forEach((id) => { this[id] = document.getElementById(id); });
  }

  updateScore(index, total, par, strokes, name) {
    const progress = Math.round((index / total) * 100);
    this.holeNumber.textContent = index + 1;
    if (this.holeName) this.holeName.textContent = name || "";
    this.parValue.textContent = par;
    this.strokeValue.textContent = strokes;
    this.progressText.textContent = `${progress}%`;
    this.progressBar.style.width = `${progress}%`;
  }

  updateHighScores(courseBest, holeBest) {
    if (this.highScoreValue) this.highScoreValue.textContent = courseBest ?? "-";
    if (this.highScoreHoleValue) this.highScoreHoleValue.textContent = holeBest ?? "-";
  }

  setStatus(text) {
    this.statusPill.textContent = text;
    this.statusPill.classList.toggle("is-active", text === "Masuk!");
  }

  setPower(power, max) {
    this.powerMeter.classList.toggle("active", power > 0);
    this.powerFill.style.width = `${power / max * 100}%`;
  }

  hidePower() {
    this.powerMeter.classList.remove("active");
  }

  showAwning(show) {
    this.hudLeft?.classList.toggle("is-armed", show);
    this.hudRight?.classList.toggle("is-armed", show);
  }

  showResult({ final, strokes, par, total }) {
    const delta = strokes - par;
    this.resultEyebrow.textContent = final ? "Course selesai" : "Hole selesai";
    this.resultTitle.textContent = final
      ? "Course complete!"
      : delta < 0 ? "Under par!" : delta === 0 ? "Par!" : "Nice finish!";
    this.resultSummary.textContent = final
      ? `Total ${total} pukulan. Main lagi dan pecahkan skor terbaikmu.`
      : `${strokes} pukulan untuk par ${par}.`;
    this.nextButton.textContent = final ? "Main lagi ↻" : "Hole berikutnya →";
    this.resultModal.hidden = false;
  }

  hideResult() {
    this.resultModal.hidden = true;
  }
}
