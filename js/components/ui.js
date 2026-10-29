export class GameUI {
  constructor() {
    const ids = ["holeNumber","parValue","strokeValue","progressText","progressBar","statusPill","powerMeter","powerFill","resultModal","resultEyebrow","resultTitle","resultSummary","nextButton","restartButton","soundButton","highScoreValue","highScoreHoleValue"];
    ids.forEach((id) => { this[id] = document.getElementById(id); });
  }

  updateScore(index, total, par, strokes) {
    const progress = Math.round((index / total) * 100);
    this.holeNumber.textContent = index + 1; this.parValue.textContent = par; this.strokeValue.textContent = strokes;
    this.progressText.textContent = `${progress}%`; this.progressBar.style.width = `${progress}%`;
  }

  updateHighScores(courseBest, holeBest) {
    if (this.highScoreValue) this.highScoreValue.textContent = courseBest === undefined || courseBest === null ? "-" : courseBest;
    if (this.highScoreHoleValue) this.highScoreHoleValue.textContent = holeBest === undefined || holeBest === null ? "-" : holeBest;
  }
  setStatus(text) { this.statusPill.textContent = text; }
  setPower(power, max) { this.powerMeter.classList.toggle("active", power > 0); this.powerFill.style.width = `${power / max * 100}%`; }
  hidePower() { this.powerMeter.classList.remove("active"); }
  showResult({ final, strokes, par, total }) {
    const delta = strokes - par;
    this.resultEyebrow.textContent = final ? "Course selesai" : "Hole selesai";
    this.resultTitle.textContent = final ? "Course complete!" : delta < 0 ? "Under par!" : delta === 0 ? "Par!" : "Nice finish!";
    this.resultSummary.textContent = final ? `Total ${total} pukulan. Main lagi dan pecahkan skor terbaikmu.` : `${strokes} pukulan untuk par ${par}.`;
    this.nextButton.textContent = final ? "Main lagi ↻" : "Hole berikutnya →";
    this.resultModal.hidden = false;
  }
  hideResult() { this.resultModal.hidden = true; }
}
