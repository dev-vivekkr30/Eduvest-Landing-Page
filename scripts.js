// Eduvest Landing Page Custom Scripts

// Sync the text and image carousels in the financial-journey-story section
const textCarousel = document.getElementById('familyStoryCarousel');
const imageCarousel = document.getElementById('familyImageCarousel');

if (textCarousel && imageCarousel) {
  const textCarouselInstance = bootstrap.Carousel.getOrCreateInstance(textCarousel);
  const imageCarouselInstance = bootstrap.Carousel.getOrCreateInstance(imageCarousel);

  // When text carousel slides, update image carousel
  textCarousel.addEventListener('slide.bs.carousel', function (event) {
    imageCarouselInstance.to(event.to);
  });

  // When image carousel slides, update text carousel (for completeness, but only text carousel is user-controlled)
  imageCarousel.addEventListener('slide.bs.carousel', function (event) {
    textCarouselInstance.to(event.to);
  });

  // Change 'Next' button text on last slide
  const nextBtn = textCarousel.querySelector('.btn-dark[data-bs-slide="next"]');
  const totalSlides = textCarousel.querySelectorAll('.carousel-item').length;
  textCarousel.addEventListener('slid.bs.carousel', function (event) {
    if (event.to === totalSlides - 1) {
      nextBtn.textContent = 'Start Your Journey';
    } else {
      nextBtn.textContent = 'Next';
    }
  });
  // Set initial state
  if (nextBtn) {
    nextBtn.textContent = 'Next';
  }
}

// Chart.js Pie Chart for Financial Journey Calculator
const pieChartCanvas = document.getElementById('investmentPieChart');
let pieChart;
function calculateInvestment(childAge, monthlyInvestment, expectedReturn) {
  // n = months left until 18
  const n = (18 - childAge) * 12;
  const r = expectedReturn / 100 / 12;
  const investedAmount = monthlyInvestment * n;
  let futureValue = 0;
  if (r > 0 && n > 0) {
    futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  } else {
    futureValue = investedAmount;
  }
  const estReturns = Math.max(futureValue - investedAmount, 0);
  return { investedAmount, estReturns, futureValue, n };
}
function updatePieChart(childAge, monthlyInvestment, expectedReturn) {
  const { investedAmount, estReturns } = calculateInvestment(childAge, monthlyInvestment, expectedReturn);
  if (pieChart) {
    pieChart.data.datasets[0].data = [investedAmount, estReturns];
    pieChart.update();
  }
}
function updateResultDisplay(childAge, monthlyInvestment, expectedReturn) {
  const { futureValue, n } = calculateInvestment(childAge, monthlyInvestment, expectedReturn);
  const resultValue = document.getElementById('investmentResultValue');
  const resultPeriod = document.getElementById('investmentResultPeriod');
  if (resultValue && resultPeriod) {
    const lakhs = futureValue / 100000;
    resultValue.textContent = `₹${lakhs.toLocaleString(undefined, {maximumFractionDigits: 2})} Lakhs`;
    resultPeriod.textContent = `Investment period: ${Math.max(Math.floor(n/12), 0)} years`;
  }
}
if (pieChartCanvas && window.Chart) {
  pieChart = new Chart(pieChartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Invested Amount', 'Est. Returns'],
      datasets: [{
        data: [60, 40], // Dummy data, will be updated
        backgroundColor: [
          '#e0e7ff', // Invested Amount
          '#ffb347'  // Est. Returns
        ],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#222',
            font: { size: 14 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ₹' + context.parsed.toLocaleString();
            }
          }
        }
      }
    }
  });
}
// Sync sliders and number inputs (no value spans)
function syncSliderAndInput(input, slider, min, max, step, onChange) {
  function clamp(val) {
    return Math.max(min, Math.min(max, val));
  }
  input.addEventListener('input', function () {
    let val = clamp(Number(input.value));
    slider.value = val;
    onChange();
  });
  slider.addEventListener('input', function () {
    let val = clamp(Number(slider.value));
    input.value = val;
    onChange();
  });
}

// --- Financial Literacy Hub Quiz Functionality ---
const quizData = [
  {
    question: 'What is the power of compounding?',
    options: [
      'Interest earned on principal only',
      'Interest earned on both principal and previously earned interest',
      'A type of bank account',
      'A government scheme'
    ],
    answer: 1
  },
  {
    question: 'What does inflation do to the value of money over time?',
    options: [
      'Increases it',
      'Decreases it',
      'Keeps it the same',
      'Has no effect'
    ],
    answer: 1
  },
  {
    question: 'Which is generally considered a low-risk investment?',
    options: [
      'Stocks',
      'Mutual Funds',
      'Fixed Deposits',
      'Cryptocurrency'
    ],
    answer: 2
  },
  {
    question: 'Why is it important to start investing early for education?',
    options: [
      'To take advantage of compounding',
      'To avoid taxes',
      'To get government benefits',
      'To spend more'
    ],
    answer: 0
  },
  {
    question: 'What is diversification in investing?',
    options: [
      'Investing in a single asset',
      'Spreading investments across different assets',
      'Investing only in gold',
      'Keeping money in cash only'
    ],
    answer: 1
  }
];

function renderQuizQuestion(idx, userAnswers) {
  const q = quizData[idx];
  const total = quizData.length;
  const progress = Math.round(((idx) / total) * 100);
  return `
    <div class="mb-2 text-secondary">Question ${idx + 1} of ${total}</div>
    <h4 class="fw-bold mb-3">Test Your Financial Knowledge</h4>
    <div class="mb-2">Challenge yourself with these education planning questions</div>
    <div class="progress mb-4" style="height: 6px;">
      <div class="progress-bar bg-primary" role="progressbar" style="width: ${Math.round(((idx + 1) / total) * 100)}%;"></div>
    </div>
    <div class="mb-3 fw-semibold">${q.question}</div>
    <div class="list-group mb-3">
      ${q.options.map((opt, i) => `
        <label class="list-group-item">
          <input class="form-check-input me-2" type="radio" name="quizQ" value="${i}" ${userAnswers[idx] === i ? 'checked' : ''}>
          ${opt}
        </label>
      `).join('')}
    </div>
    <button class="btn btn-primary rounded-pill px-4" id="quizNextBtn">${idx === total - 1 ? 'Submit' : 'Next'}</button>
  `;
}

function renderQuizResult(scorePercent) {
  return `
    <div class="text-center py-5">
      <h2 class="fw-bold mb-2">Test Your Financial Knowledge</h2>
      <div class="mb-3" style="font-size: 1.2rem; color: #5a6473;">Challenge yourself with these education planning questions</div>
      <div style="font-size: 3rem;">🎉</div>
      <h3 class="fw-bold mt-3 mb-2">Quiz Completed!</h3>
      <div class="fw-bold mb-2" style="font-size: 2.5rem; color: #4caf50;">${scorePercent}%</div>
      <div class="mb-4" style="color: #5a6473;">Great job! You have a solid understanding of education planning.</div>
      <button class="btn btn-success rounded-pill px-4" id="quizRetakeBtn">Retake Quiz</button>
    </div>
  `;
}

function setupQuiz() {
  const quizTab = document.getElementById('quiz');
  if (!quizTab) return;
  let currentQ = 0;
  let userAnswers = Array(quizData.length).fill(null);

  function showQuestion() {
    quizTab.querySelector('.card').innerHTML = renderQuizQuestion(currentQ, userAnswers);
    quizTab.querySelectorAll('input[name="quizQ"]').forEach(input => {
      input.addEventListener('change', (e) => {
        userAnswers[currentQ] = Number(e.target.value);
      });
    });
    quizTab.querySelector('#quizNextBtn').onclick = function () {
      if (userAnswers[currentQ] === null) return;
      if (currentQ === quizData.length - 1) {
        // Show result
        const correct = userAnswers.filter((ans, i) => ans === quizData[i].answer).length;
        const percent = Math.round((correct / quizData.length) * 100);
        quizTab.querySelector('.card').innerHTML = renderQuizResult(percent);
        quizTab.querySelector('#quizRetakeBtn').onclick = function () {
          currentQ = 0;
          userAnswers = Array(quizData.length).fill(null);
          showQuestion();
        };
      } else {
        currentQ++;
        showQuestion();
      }
    };
  }
  showQuestion();
}

// --- Financial Calculators Logic ---
window.addEventListener('DOMContentLoaded', function () {
  // FD Calculator
  let fdChart;
  const fdForm = document.getElementById('fdCalcForm');
  const fdAmount = document.getElementById('fdAmount');
  const fdRate = document.getElementById('fdRate');
  const fdYears = document.getElementById('fdYears');
  const fdResultValue = document.getElementById('fdResultValue');
  const fdResultPeriod = document.getElementById('fdResultPeriod');
  const fdPieChart = document.getElementById('fdPieChart');
  if (fdAmount) fdAmount.value = 100000;
  if (fdRate) fdRate.value = 7;
  if (fdYears) fdYears.value = 5;
  if (fdPieChart && window.Chart) {
    fdChart = new Chart(fdPieChart, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#e0e7ff', '#ffb347'],
          borderWidth: 0
        }]
      },
      options: { cutout: '70%', plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }
  function calcFD() {
    const p = Number(fdAmount.value);
    const r = Number(fdRate.value) / 100;
    const n = Number(fdYears.value);
    if (p > 0 && r > 0 && n > 0) {
      const maturity = p * Math.pow(1 + r, n);
      const interest = maturity - p;
      fdResultValue.textContent = `₹${Math.round(maturity).toLocaleString()}`;
      fdResultPeriod.textContent = `Interest Earned: ₹${Math.round(interest).toLocaleString()}`;
      if (fdChart) {
        fdChart.data.datasets[0].data = [p, interest];
        fdChart.update();
      }
    }
  }
  if (fdForm) {
    fdForm.querySelector('button[type="button"]').onclick = function (e) {
      e.preventDefault();
      calcFD();
    };
    calcFD();
  }

  // Mutual Funds Calculators
  // Lumpsum
  let lumpsumChart;
  const lumpsumForm = document.getElementById('lumpsumCalcForm');
  const lumpsumAmount = document.getElementById('lumpsumAmount');
  const lumpsumRate = document.getElementById('lumpsumRate');
  const lumpsumYears = document.getElementById('lumpsumYears');
  const lumpsumResultValue = document.getElementById('lumpsumResultValue');
  const lumpsumPieChart = document.getElementById('lumpsumPieChart');
  if (lumpsumAmount) lumpsumAmount.value = 100000;
  if (lumpsumRate) lumpsumRate.value = 12;
  if (lumpsumYears) lumpsumYears.value = 10;
  if (lumpsumPieChart && window.Chart) {
    lumpsumChart = new Chart(lumpsumPieChart, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Returns'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#e0e7ff', '#ffb347'],
          borderWidth: 0
        }]
      },
      options: { cutout: '70%', plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }
  function calcLumpsum() {
    const p = Number(lumpsumAmount.value);
    const r = Number(lumpsumRate.value) / 100;
    const n = Number(lumpsumYears.value);
    if (p > 0 && r > 0 && n > 0) {
      const fv = p * Math.pow(1 + r, n);
      const returns = fv - p;
      lumpsumResultValue.textContent = `₹${Math.round(fv).toLocaleString()}`;
      if (lumpsumChart) {
        lumpsumChart.data.datasets[0].data = [p, returns];
        lumpsumChart.update();
      }
    }
  }
  if (lumpsumForm) {
    lumpsumForm.querySelector('button[type="button"]').onclick = function (e) {
      e.preventDefault();
      calcLumpsum();
    };
    calcLumpsum();
  }
  // SIP
  let sipChart;
  const sipForm = document.getElementById('sipCalcForm');
  const sipAmount = document.getElementById('sipAmount');
  const sipRate = document.getElementById('sipRate');
  const sipYears = document.getElementById('sipYears');
  const sipResultValue = document.getElementById('sipResultValue');
  const sipPieChart = document.getElementById('sipPieChart');
  if (sipAmount) sipAmount.value = 5000;
  if (sipRate) sipRate.value = 12;
  if (sipYears) sipYears.value = 10;
  if (sipPieChart && window.Chart) {
    sipChart = new Chart(sipPieChart, {
      type: 'doughnut',
      data: {
        labels: ['Invested', 'Returns'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#e0e7ff', '#ffb347'],
          borderWidth: 0
        }]
      },
      options: { cutout: '70%', plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }
  function calcSIP() {
    const p = Number(sipAmount.value);
    const r = Number(sipRate.value) / 100 / 12;
    const n = Number(sipYears.value) * 12;
    if (p > 0 && r > 0 && n > 0) {
      const fv = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const invested = p * n;
      const returns = fv - invested;
      sipResultValue.textContent = `₹${Math.round(fv).toLocaleString()}`;
      if (sipChart) {
        sipChart.data.datasets[0].data = [invested, returns];
        sipChart.update();
      }
    }
  }
  if (sipForm) {
    sipForm.querySelector('button[type="button"]').onclick = function (e) {
      e.preventDefault();
      calcSIP();
    };
    calcSIP();
  }
  // Step-up SIP
  let stepupChart;
  const stepupForm = document.getElementById('stepupCalcForm');
  const stepupAmount = document.getElementById('stepupAmount');
  const stepupIncrease = document.getElementById('stepupIncrease');
  const stepupRate = document.getElementById('stepupRate');
  const stepupYears = document.getElementById('stepupYears');
  const stepupResultValue = document.getElementById('stepupResultValue');
  const stepupPieChart = document.getElementById('stepupPieChart');
  if (stepupAmount) stepupAmount.value = 5000;
  if (stepupIncrease) stepupIncrease.value = 10;
  if (stepupRate) stepupRate.value = 12;
  if (stepupYears) stepupYears.value = 10;
  if (stepupPieChart && window.Chart) {
    stepupChart = new Chart(stepupPieChart, {
      type: 'doughnut',
      data: {
        labels: ['Invested', 'Returns'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#e0e7ff', '#ffb347'],
          borderWidth: 0
        }]
      },
      options: { cutout: '70%', plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }
  function calcStepup() {
    const p = Number(stepupAmount.value);
    const inc = Number(stepupIncrease.value) / 100;
    const r = Number(stepupRate.value) / 100 / 12;
    const n = Number(stepupYears.value) * 12;
    if (p > 0 && r > 0 && n > 0) {
      let invested = 0;
      let fv = 0;
      let sip = p;
      for (let i = 1; i <= n; i++) {
        fv += sip * Math.pow(1 + r, n - i + 1);
        invested += sip;
        if (i % 12 === 0) sip += p * inc;
      }
      const returns = fv - invested;
      stepupResultValue.textContent = `₹${Math.round(fv).toLocaleString()}`;
      if (stepupChart) {
        stepupChart.data.datasets[0].data = [invested, returns];
        stepupChart.update();
      }
    }
  }
  if (stepupForm) {
    stepupForm.querySelector('button[type="button"]').onclick = function (e) {
      e.preventDefault();
      calcStepup();
    };
    calcStepup();
  }
  // Future Fees Prediction
  let feesChart;
  const feesForm = document.getElementById('feesCalcForm');
  const feesCurrent = document.getElementById('feesCurrent');
  const feesInflation = document.getElementById('feesInflation');
  const feesYears = document.getElementById('feesYears');
  const feesResultValue = document.getElementById('feesResultValue');
  const feesPieChart = document.getElementById('feesPieChart');
  if (feesCurrent) feesCurrent.value = 100000;
  if (feesInflation) feesInflation.value = 8;
  if (feesYears) feesYears.value = 10;
  if (feesPieChart && window.Chart) {
    feesChart = new Chart(feesPieChart, {
      type: 'doughnut',
      data: {
        labels: ['Current Fees', 'Inflation Impact'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#e0e7ff', '#ffb347'],
          borderWidth: 0
        }]
      },
      options: { cutout: '70%', plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }
  function calcFees() {
    const c = Number(feesCurrent.value);
    const inf = Number(feesInflation.value) / 100;
    const y = Number(feesYears.value);
    if (c > 0 && inf > 0 && y > 0) {
      const fv = c * Math.pow(1 + inf, y);
      const inflationImpact = fv - c;
      feesResultValue.textContent = `₹${Math.round(fv).toLocaleString()}`;
      if (feesChart) {
        feesChart.data.datasets[0].data = [c, inflationImpact];
        feesChart.update();
      }
    }
  }
  if (feesForm) {
    feesForm.querySelector('button[type="button"]').onclick = function (e) {
      e.preventDefault();
      calcFees();
    };
    calcFees();
  }

  // Quiz setup (existing)
  setupQuiz();
});

// --- Lead Form Modal Logic ---
function openLeadFormModal() {
  const modal = new bootstrap.Modal(document.getElementById('leadFormModal'));
  modal.show();
}

// Attach modal open to all CTA buttons
window.addEventListener('DOMContentLoaded', function () {
  // List of CTA selectors
  const ctaSelectors = [
    '.btn.btn-warning', // Book Consultation
    '.btn-pink', '.btn-blue', '.btn-purple', '.btn-green', // Action Center
    '.btn.btn-dark', // Invest Now, Calculate, etc.
    '.btn-success', // Join Community
    '.btn-primary', // Quiz Next/Submit
    '.btn-outline-secondary', // Schedule, Browse, etc.
    '.fw-semibold.text-primary', '.fw-semibold.text-warning', '.fw-semibold.text-success', '.fw-semibold.text-info', '.fw-semibold.text-danger', '.fw-semibold.text-secondary', '.primary-btn' // Service cards
  ];
  ctaSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(btn => {
      // Only attach if not already a modal close or quiz retake
      if (!btn.classList.contains('modal-close') && !btn.id.includes('quizRetake')) {
        btn.addEventListener('click', function (e) {
          // Prevent default for anchor tags
          if (btn.tagName === 'A') e.preventDefault();
          openLeadFormModal();
        });
      }
    });
  });
}); 