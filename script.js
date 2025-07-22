// Import data from QuizData.js
import { MBTI_TYPES, ADVANCED_INSIGHTS, FAMOUS_PERSONALITIES } from './src/data/QuizData.ru.js';
import localizationManager from './src/locales/LocalizationManager.js';
import { MBTI_QUESTIONS } from './src/data/MainQuiz.js';
import { MBTI_SPECIALIZED_QUESTIONS } from './src/data/SpecializedQuiz.js';
import { MBTI_SPECIALIZED_QUESTIONS_RU } from './src/data/SpecializedQuiz.ru.js';
import { MBTI_QUESTIONS_RU } from './src/data/MainQuiz.ru.js';

// MBTI Quiz Application
class MBTIQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = {
            E: 0, I: 0, // Extraversion vs Introversion
            S: 0, N: 0, // Sensing vs Intuition
            T: 0, F: 0, // Thinking vs Feeling
            J: 0, P: 0  // Judging vs Perceiving
        };
        this.currentQuizType = 'mbti'; // Default quiz type
        this.questions = this.generateQuestions();
        this.selectedOption = null;
    }

    generateQuestions() {
        // Check if user is premium to determine quiz length
        const isPremiumUser = isPremium();
        
        // Handle different quiz types for premium users
        if (isPremiumUser && this.currentQuizType !== 'mbti') {
            return this.generateSpecializedQuestions();
        }
        
        // Return the appropriate questions based on current locale
        // const currentLocale = localizationManager.getCurrentLocale();
        return MBTI_QUESTIONS_RU; //currentLocale === 'ru' ? MBTI_QUESTIONS_RU : MBTI_QUESTIONS;
    }
    
    generateSpecializedQuestions() {
        // Each specialized quiz now has 20+ questions
        const currentLocale = localizationManager.getCurrentLocale();
        const questions = currentLocale === 'ru' ? MBTI_SPECIALIZED_QUESTIONS_RU : MBTI_SPECIALIZED_QUESTIONS;
        return questions[this.currentQuizType] || questions['leadership'];
    }

    startQuiz() {
        this.questions = this.generateQuestions(); // <-- Add this line
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('quizQuestions').style.display = 'flex';
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('option1').textContent = question.options[0];
        document.getElementById('option2').textContent = question.options[1];
        document.getElementById('option3').textContent = question.options[2];
        document.getElementById('option4').textContent = question.options[3];
        
        document.getElementById('questionCounter').textContent = `${this.currentQuestion + 1} / ${this.questions.length}`;
        
        // Update progress bar
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = this.currentQuestion === 0;
        document.getElementById('nextBtn').disabled = this.selectedOption === null;
        
        // Clear previous selection
        this.clearOptionSelection();
        
        // Update dev tools visibility
        updateDevToolsVisibility();
    }

    selectOption(optionNumber) {
        this.clearOptionSelection();
        this.selectedOption = optionNumber;
        document.querySelector(`button[onclick="selectOption(${optionNumber})"]`).classList.add('selected');
        document.getElementById('nextBtn').disabled = false;
    }

    clearOptionSelection() {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    nextQuestion() {
        if (this.selectedOption === null) return;
        
        // Record answer
        const question = this.questions[this.currentQuestion];
        const weight = question.weights[this.selectedOption - 1];
        
        if (question.dimension === 'EI') {
            if (weight > 0) this.scores.I += weight;
            else if (weight < 0) this.scores.E += Math.abs(weight);
        } else if (question.dimension === 'SN') {
            if (weight > 0) this.scores.S += weight;
            else if (weight < 0) this.scores.N += Math.abs(weight);
        } else if (question.dimension === 'TF') {
            if (weight > 0) this.scores.T += weight;
            else if (weight < 0) this.scores.F += Math.abs(weight);
        } else if (question.dimension === 'JP') {
            if (weight > 0) this.scores.J += weight;
            else if (weight < 0) this.scores.P += Math.abs(weight);
        }
        
        this.answers.push(this.selectedOption);
        this.selectedOption = null;
        
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.selectedOption = this.answers[this.currentQuestion];
            this.displayQuestion();
            if (this.selectedOption) {
                document.querySelector(`button[onclick="selectOption(${this.selectedOption})"]`).classList.add('selected');
                document.getElementById('nextBtn').disabled = false;
            }
        }
    }

    showResults() {
        document.getElementById('quizQuestions').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';
        
        const personalityType = this.calculatePersonalityType();
        
        // Save results to localStorage
        this.saveResultsToStorage(personalityType);
        
        this.displayPersonalityResults(personalityType);
        this.displayDimensionBreakdown();
        
        // Show premium features if user is premium
        if (isPremium()) {
            displayAdvancedInsights(personalityType);
            displayFamousPersonalities(personalityType);
            createAnalyticsCharts();
            
            // Generate share link
            const shareLink = document.getElementById('shareLink');
            const link = `${window.location.origin}${window.location.pathname}?type=${personalityType}&premium=1`;
            shareLink.value = link;
        }
    }

    calculatePersonalityType() {
        const type = [];
        
        // E vs I
        type.push(this.scores.E > this.scores.I ? 'E' : 'I');
        
        // S vs N
        type.push(this.scores.S > this.scores.N ? 'S' : 'N');
        
        // T vs F
        type.push(this.scores.T > this.scores.F ? 'T' : 'F');
        
        // J vs P
        type.push(this.scores.J > this.scores.P ? 'J' : 'P');
        
        return type.join('');
    }

    displayPersonalityResults(type) {
        const personality = MBTI_TYPES[type];
        
        document.getElementById('personalityType').textContent = type;
        document.getElementById('personalityTitle').textContent = personality.title;
        document.getElementById('personalitySubtitle').textContent = personality.subtitle;
        document.getElementById('personalityDescription').textContent = personality.description;
        
        const traitsContainer = document.getElementById('personalityTraits');
        traitsContainer.innerHTML = '';
        personality.traits.forEach(trait => {
            const traitElement = document.createElement('span');
            traitElement.className = 'trait';
            traitElement.textContent = trait;
            traitsContainer.appendChild(traitElement);
        });
    }

    displayDimensionBreakdown() {
        const totalE = this.scores.E + this.scores.I;
        const totalS = this.scores.S + this.scores.N;
        const totalT = this.scores.T + this.scores.F;
        const totalJ = this.scores.J + this.scores.P;
        
        const ePercentage = totalE > 0 ? (this.scores.E / totalE) * 100 : 50;
        const sPercentage = totalS > 0 ? (this.scores.S / totalS) * 100 : 50;
        const tPercentage = totalT > 0 ? (this.scores.T / totalT) * 100 : 50;
        const jPercentage = totalJ > 0 ? (this.scores.J / totalJ) * 100 : 50;
        
        document.getElementById('eBar').style.width = `${ePercentage}%`;
        document.getElementById('sBar').style.width = `${sPercentage}%`;
        document.getElementById('tBar').style.width = `${tPercentage}%`;
        document.getElementById('jBar').style.width = `${jPercentage}%`;
    }

    restartQuiz() {
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        
        document.getElementById('resultsScreen').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'block';
        
        // Check and show last results button after restart
        checkAndShowLastResultsButton();
    }
    
    saveResultsToStorage(personalityType) {
        const results = {
            personalityType: personalityType,
            scores: this.scores,
            answers: this.answers,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };
        
        localStorage.setItem('mbti_last_results', JSON.stringify(results));
    }
    
    loadResultsFromStorage() {
        const saved = localStorage.getItem('mbti_last_results');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }
    
    hasPreviousResults() {
        return localStorage.getItem('mbti_last_results') !== null;
    }
    
    displayLastResults() {
        const results = this.loadResultsFromStorage();
        if (!results) return false;
        
        // Restore scores and answers
        this.scores = results.scores;
        this.answers = results.answers;
        
        // Display results
        this.displayPersonalityResults(results.personalityType);
        this.displayDimensionBreakdown();
        
        // Show premium features if user is premium
        if (isPremium()) {
            displayAdvancedInsights(results.personalityType);
            displayFamousPersonalities(results.personalityType);
            createAnalyticsCharts();
            
            // Generate share link
            const shareLink = document.getElementById('shareLink');
            const link = `${window.location.origin}${window.location.pathname}?type=${results.personalityType}&premium=1`;
            shareLink.value = link;
        }
        
        return true;
    }

    shareResults() {
        const personalityType = this.calculatePersonalityType();
        const shareText = `I just discovered my MBTI personality type is ${personalityType}! Take the quiz yourself to find yours.`;
        
        if (navigator.share) {
            navigator.share({
                title: 'MBTI Personality Quiz Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!');
            });
        }
    }
}

function openTypesModal() {
    const modal = document.getElementById('typesModal');
    const list = document.getElementById('typesList');
    list.innerHTML = '';
    Object.values(MBTI_TYPES).forEach(type => {
        const card = document.createElement('div');
        card.classNamef = 'type-card';
        
        // Show limited description for free users, full for premium
        const isPremiumUser = isPremium();
        const description = isPremiumUser ? 
            type.description : 
            type.description.substring(0, 100) + '...';
        
        card.innerHTML = `
            <div class="type-code">${type.code}</div>
            <div class="type-title">${type.title}</div>
            <div class="type-subtitle">${type.subtitle}</div>
            <div class="type-description">${description}</div>
            ${!isPremiumUser ? `
                <div class="premium-teaser">
                    <button class="premium-teaser-btn" onclick="openPremiumModal()">
                        <i class="fas fa-star"></i> Unlock Full Description
                    </button>
                </div>
            ` : ''}
        `;
        list.appendChild(card);
    });
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTypesModal() {
    document.getElementById('typesModal').style.display = 'none';
    document.body.style.overflow = '';
}

// Premium status logic
function isPremium() {
    return localStorage.getItem('mbti_premium') === '1';
}

function setPremium(val) {
    if (val) {
        localStorage.setItem('mbti_premium', '1');
    } else {
        localStorage.removeItem('mbti_premium');
    }
    updatePremiumUI();
}

function openPremiumModal() {
    document.getElementById('premiumModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('premiumUnlockMsg').textContent = '';
}

function closePremiumModal() {
    document.getElementById('premiumModal').style.display = 'none';
    document.body.style.overflow = '';
}

function unlockPremium() {
    setPremium(true);
    document.getElementById('premiumUnlockMsg').textContent = '🎉 Premium unlocked! Enjoy all features.';
    setTimeout(() => {
        closePremiumModal();
    }, 1200);
}



// Update premium UI function to show/hide premium content
function updatePremiumUI() {
    const isPremiumUser = isPremium();
    
    // Update premium-locked elements
    document.querySelectorAll('.premium-locked').forEach(el => {
        el.style.display = isPremiumUser ? 'none' : 'block';
    });
    
    // Update premium content elements
    document.querySelectorAll('.premium-content').forEach(el => {
        el.style.display = isPremiumUser ? 'block' : 'none';
    });
    
    // Update premium buttons
    const btns = document.querySelectorAll('.btn-premium, .premium-teaser-btn');
    btns.forEach(btn => {
        if (isPremiumUser) {
            btn.textContent = localizationManager.get('ui.premiumActive');
            btn.disabled = true;
            btn.style.opacity = '0.6';
        } else {
            if (btn.id === 'headerPremiumBtn') {
                btn.innerHTML = `<i class="fas fa-star"></i> ${localizationManager.get('ui.upgradeToPremium')}`;
            }
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });
    
    // Update quiz description based on premium status
    updateQuizDescription();
}

// Function to display advanced insights
function displayAdvancedInsights(personalityType) {
    if (!isPremium()) return;
    
    const insights = ADVANCED_INSIGHTS[personalityType];
    if (!insights) return;
    
    // Display strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '<ul>' + insights.strengths.map(s => `<li>${s}</li>`).join('') + '</ul>';
    
    // Display weaknesses
    const weaknessesList = document.getElementById('weaknessesList');
    weaknessesList.innerHTML = '<ul>' + insights.weaknesses.map(w => `<li>${w}</li>`).join('') + '</ul>';
    
    // Display careers
    const careerList = document.getElementById('careerList');
    careerList.innerHTML = '<ul>' + insights.careers.map(c => `<li>${c}</li>`).join('') + '</ul>';
    
    // Display development
    const developmentList = document.getElementById('developmentList');
    developmentList.innerHTML = '<ul>' + insights.development.map(d => `<li>${d}</li>`).join('') + '</ul>';
}

// Function to display famous personalities
function displayFamousPersonalities(personalityType) {
    if (!isPremium()) return;
    
    const famous = FAMOUS_PERSONALITIES[personalityType];
    if (!famous) return;
    
    const famousGrid = document.getElementById('famousGrid');
    famousGrid.innerHTML = famous.map(person => `
        <div class="famous-person">
            <div style="font-size: 3rem; margin-bottom: 10px;">${person.image}</div>
            <h4>${person.name}</h4>
            <p>${person.profession}</p>
        </div>
    `).join('');
}

// Function to create analytics charts
function createAnalyticsCharts() {
    if (!isPremium()) return;
    
    // Get actual scores from the quiz
    const scores = quiz.scores;
    const totalE = scores.E + scores.I;
    const totalS = scores.S + scores.N;
    const totalT = scores.T + scores.F;
    const totalJ = scores.J + scores.P;
    
    const ePercentage = totalE > 0 ? (scores.E / totalE) * 100 : 50;
    const sPercentage = totalS > 0 ? (scores.S / totalS) * 100 : 50;
    const tPercentage = totalT > 0 ? (scores.T / totalT) * 100 : 50;
    const jPercentage = totalJ > 0 ? (scores.J / totalJ) * 100 : 50;
    
    // Radar chart
    createRadarChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Bar chart
    createBarChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Balance chart
    createBalanceChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Pie chart
    createPieChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Timeline chart
    createTimelineChart();
    
    // Strengths chart
    createStrengthsChart(ePercentage, sPercentage, tPercentage, jPercentage);
}

// Radar Chart
function createRadarChart(e, s, t, j) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw radar grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw concentric circles
    for (let r = 20; r <= radius; r += 20) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Draw radar lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    const labels = ['E/I', 'S/N', 'T/F', 'J/P'];
    const values = [e, s, t, j];
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Add label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        const labelX = centerX + (radius + 15) * Math.cos(angle);
        const labelY = centerY + (radius + 15) * Math.sin(angle);
        ctx.fillText(labels[i], labelX, labelY);
    }
    
    // Draw data polygon
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const value = values[i] / 100;
        const x = centerX + (radius * value) * Math.cos(angle);
        const y = centerY + (radius * value) * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add data points
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const value = values[i] / 100;
        const x = centerX + (radius * value) * Math.cos(angle);
        const y = centerY + (radius * value) * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Bar Chart
function createBarChart(e, s, t, j) {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const barWidth = 40;
    const barSpacing = 20;
    const startX = 50;
    const startY = 150;
    const maxHeight = 100;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
    const scores = [e, s, t, j];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
    
    dimensions.forEach((dim, i) => {
        const x = startX + i * (barWidth + barSpacing);
        const height = (scores[i] / 100) * maxHeight;
        
        // Draw bar
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, startY - height, barWidth, height);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, startY - height, barWidth, height);
        
        // Draw percentage text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(scores[i])}%`, x + barWidth/2, startY - height - 5);
        
        // Draw dimension label
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(dim, x + barWidth/2, startY + 15);
    });
    
    // Draw axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX - 10, startY);
    ctx.lineTo(startX + 4 * (barWidth + barSpacing) - barSpacing + 10, startY);
    ctx.stroke();
}

// Balance Chart (showing balance between preferences)
function createBalanceChart(e, s, t, j) {
    const canvas = document.getElementById('balanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 100;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const pairs = [
        { name: 'E/I', value: e, color1: '#667eea', color2: '#764ba2' },
        { name: 'S/N', value: s, color1: '#f093fb', color2: '#f5576c' },
        { name: 'T/F', value: t, color1: '#4facfe', color2: '#00f2fe' },
        { name: 'J/P', value: j, color1: '#43e97b', color2: '#38f9d7' }
    ];
    
    pairs.forEach((pair, index) => {
        const y = 30 + index * 35;
        
        // Draw balance bar
        ctx.fillStyle = pair.color1;
        ctx.fillRect(50, y, 100, 20);
        ctx.fillStyle = pair.color2;
        ctx.fillRect(50 + 100, y, 100, 20);
        
        // Draw indicator
        const indicatorX = 50 + (pair.value / 100) * 200;
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(indicatorX, y + 10, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(pair.name, 20, y + 15);
        
        // Draw percentage
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(pair.value)}%`, indicatorX, y + 15);
    });
}

// Pie Chart (showing preference distribution)
function createPieChart(e, s, t, j) {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 100;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const data = [
        { label: 'E/I', value: e, color: '#667eea' },
        { label: 'S/N', value: s, color: '#764ba2' },
        { label: 'T/F', value: t, color: '#f093fb' },
        { label: 'J/P', value: j, color: '#f5576c' }
    ];
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Draw labels
    data.forEach((item, index) => {
        const y = 180 + index * 20;
        ctx.fillStyle = item.color;
        ctx.fillRect(50, y - 8, 12, 12);
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.label}: ${Math.round(item.value)}%`, 70, y);
    });
}

// Timeline Chart (showing personality development)
function createTimelineChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw timeline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(270, 75);
    ctx.stroke();
    
    // Draw timeline points
    const points = [
        { x: 50, label: 'Past', color: '#667eea' },
        { x: 150, label: 'Present', color: '#f093fb' },
        { x: 250, label: 'Future', color: '#43e97b' }
    ];
    
    points.forEach(point => {
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, 75, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(point.label, point.x, 95);
    });
    
    // Draw personality type in center
    const personalityType = document.getElementById('personalityType')?.textContent || 'MBTI';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(personalityType, 150, 50);
}

// Strengths Chart (showing personality strengths)
function createStrengthsChart(e, s, t, j) {
    const canvas = document.getElementById('strengthsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const strengths = [
        { name: 'Analytical', value: Math.max(t, 100 - t), color: '#667eea' },
        { name: 'Creative', value: Math.max(s, 100 - s), color: '#764ba2' },
        { name: 'Social', value: Math.max(e, 100 - e), color: '#f093fb' },
        { name: 'Organized', value: Math.max(j, 100 - j), color: '#f5576c' }
    ];
    
    const barHeight = 25;
    const spacing = 10;
    const startY = 30;
    
    strengths.forEach((strength, index) => {
        const y = startY + index * (barHeight + spacing);
        const width = (strength.value / 100) * 200;
        
        // Draw bar
        ctx.fillStyle = strength.color;
        ctx.fillRect(50, y, width, barHeight);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, y, width, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(strength.name, 10, y + 17);
        
        // Draw percentage
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(strength.value)}%`, 45, y + 17);
    });
}

// Function to generate PDF (real PDF with jsPDF)
function generatePDF() {
    if (!isPremium()) return;
    
    const btn = document.querySelector('#pdfContent .btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    btn.disabled = true;

    setTimeout(() => {
        // Gather data
        const personalityType = document.getElementById('personalityType').textContent;
        const title = document.getElementById('personalityTitle').textContent;
        const subtitle = document.getElementById('personalitySubtitle').textContent;
        const description = document.getElementById('personalityDescription').textContent;
        
        // Advanced insights
        let strengths = '', weaknesses = '', careers = '', development = '';
        if (ADVANCED_INSIGHTS[personalityType]) {
            strengths = ADVANCED_INSIGHTS[personalityType].strengths.join(', ');
            weaknesses = ADVANCED_INSIGHTS[personalityType].weaknesses.join(', ');
            careers = ADVANCED_INSIGHTS[personalityType].careers.join(', ');
            development = ADVANCED_INSIGHTS[personalityType].development.join(', ');
        }
        
        // Famous people
        let famous = '';
        if (FAMOUS_PERSONALITIES[personalityType]) {
            famous = FAMOUS_PERSONALITIES[personalityType].map(p => `${p.name} (${p.profession})`).join(', ');
        }
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 15;
        doc.setFontSize(18);
        doc.text('MBTI Personality Quiz Report', 10, y);
        y += 10;
        doc.setFontSize(14);
        doc.text(`Type: ${personalityType} - ${title}`, 10, y);
        y += 8;
        doc.setFontSize(11);
        doc.text(subtitle, 10, y);
        y += 8;
        doc.setFontSize(10);
        doc.text('Description:', 10, y);
        y += 6;
        doc.setFontSize(9);
        doc.text(doc.splitTextToSize(description, 180), 10, y);
        y += doc.getTextDimensions(doc.splitTextToSize(description, 180)).h + 4;
        if (strengths) {
            doc.setFontSize(10);
            doc.text('Strengths:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(strengths, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(strengths, 180)).h + 4;
        }
        if (weaknesses) {
            doc.setFontSize(10);
            doc.text('Growth Areas:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(weaknesses, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(weaknesses, 180)).h + 4;
        }
        if (careers) {
            doc.setFontSize(10);
            doc.text('Career Recommendations:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(careers, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(careers, 180)).h + 4;
        }
        if (development) {
            doc.setFontSize(10);
            doc.text('Personal Development:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(development, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(development, 180)).h + 4;
        }
        if (famous) {
            doc.setFontSize(10);
            doc.text('Famous Personalities:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(famous, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(famous, 180)).h + 4;
        }
        
        // Save PDF
        doc.save(`MBTI_Report_${personalityType}.pdf`);
        
        btn.innerHTML = '<i class="fas fa-check"></i> PDF Generated!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }, 1200);
}

// Function to copy share link
function copyShareLink() {
    if (!isPremium()) return;
    
    const shareLink = document.getElementById('shareLink');
    const personalityType = document.getElementById('personalityType').textContent;
    const link = `${window.location.origin}${window.location.pathname}?type=${personalityType}&premium=1`;
    
    shareLink.value = link;
    
    // Copy to clipboard
    shareLink.select();
    document.execCommand('copy');
    
    // Show feedback
    const btn = document.querySelector('#shareContent .btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}

// App state: 'development' or 'release'
const APP_STATE = 'development'; // Change to 'release' for production

// Get state from URL parameter or use default
function getAppStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    if (stateParam === 'development' || stateParam === 'release') {
        return stateParam;
    }
    return APP_STATE;
}

// Update URL with current state
function updateURLWithState(state) {
    const url = new URL(window.location);
    url.searchParams.set('state', state);
    window.history.replaceState({}, '', url);
}

// Get current app state
function getCurrentAppState() {
    return getAppStateFromURL();
}

function updateStateBadge() {
    const badge = document.getElementById('stateBadge');
    if (!badge) return;
    
    const currentState = getCurrentAppState();
    
    if (currentState === 'development') {
        badge.textContent = 'DEVELOPMENT';
        badge.classList.add('dev');
        badge.classList.remove('release');
    } else {
        badge.textContent = 'RELEASE';
        badge.classList.add('release');
        badge.classList.remove('dev');
    }
    
    // Show/hide development tools based on state
    updateDevToolsVisibility();
}

// Function to show/hide development tools
function updateDevToolsVisibility() {
    const devTools = document.getElementById('devTools');
    if (devTools) {
        devTools.style.display = getCurrentAppState() === 'development' ? 'block' : 'none';
    }
}

// Show/hide dev tools on welcome screen
function updateDevToolsWelcomeVisibility() {
    const devToolsWelcome = document.getElementById('devToolsWelcome');
    if (devToolsWelcome) {
        devToolsWelcome.style.display = getCurrentAppState() === 'development' ? 'block' : 'none';
    }
}

// Fill all answers randomly from welcome screen
function fillAllRandomAnswersFromWelcome() {
    if (getCurrentAppState() !== 'development') return;
    // Start quiz and fill all answers randomly
    quiz = new MBTIQuiz();
    for (let i = 0; i < quiz.questions.length; i++) {
        const randomAnswer = Math.floor(Math.random() * 4) + 1;
        quiz.answers[i] = randomAnswer;
        const question = quiz.questions[i];
        const weight = question.weights[randomAnswer - 1];
        if (question.dimension === 'EI') {
            if (weight > 0) quiz.scores.I += weight;
            else if (weight < 0) quiz.scores.E += Math.abs(weight);
        } else if (question.dimension === 'SN') {
            if (weight > 0) quiz.scores.S += weight;
            else if (weight < 0) quiz.scores.N += Math.abs(weight);
        } else if (question.dimension === 'TF') {
            if (weight > 0) quiz.scores.T += weight;
            else if (weight < 0) quiz.scores.F += Math.abs(weight);
        } else if (question.dimension === 'JP') {
            if (weight > 0) quiz.scores.J += weight;
            else if (weight < 0) quiz.scores.P += Math.abs(weight);
        }
    }
    quiz.currentQuestion = quiz.questions.length - 1;
    quiz.selectedOption = quiz.answers[quiz.currentQuestion];
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    quiz.showResults();
    updateDevToolsVisibility();
    updateDevToolsWelcomeVisibility();
    console.log('Random answers filled from welcome screen!');
}

// Update dev tools visibility on mode change
function updateDevToolsAll() {
    updateDevToolsVisibility();
    updateDevToolsWelcomeVisibility();
}

// Function to fill random answers for testing
function fillRandomAnswers() {
    if (getCurrentAppState() !== 'development') return;
    
    // Fill all remaining questions with random answers
    for (let i = this.currentQuestion; i < this.questions.length; i++) {
        const randomAnswer = Math.floor(Math.random() * 4) + 1; // 1-4
        this.answers[i] = randomAnswer;
        
        // Update scores based on random answer
        const question = this.questions[i];
        const weight = question.weights[randomAnswer - 1];
        
        if (question.dimension === 'EI') {
            if (weight > 0) this.scores.I += weight;
            else if (weight < 0) this.scores.E += Math.abs(weight);
        } else if (question.dimension === 'SN') {
            if (weight > 0) this.scores.S += weight;
            else if (weight < 0) this.scores.N += Math.abs(weight);
        } else if (question.dimension === 'TF') {
            if (weight > 0) this.scores.T += weight;
            else if (weight < 0) this.scores.F += Math.abs(weight);
        } else if (question.dimension === 'JP') {
            if (weight > 0) this.scores.J += weight;
            else if (weight < 0) this.scores.P += Math.abs(weight);
        }
    }
    
    // Jump to results
    this.currentQuestion = this.questions.length - 1;
    this.selectedOption = this.answers[this.currentQuestion];
    this.showResults();
    
    console.log('Random answers filled for testing!');
}

// Function to change app state programmatically
function changeAppState(newState) {
    if (newState === 'development' || newState === 'release') {
        updateURLWithState(newState);
        updateStateBadge();
        console.log(`App state changed to: ${newState}`);
    }
}

// Function to toggle between development and release states
function toggleAppState() {
    const currentState = getCurrentAppState();
    const newState = currentState === 'development' ? 'release' : 'development';
    changeAppState(newState);
}

// Function to view last results
function viewLastResults() {
    if (quiz && quiz.hasPreviousResults()) {
        // Hide welcome screen
        document.getElementById('welcomeScreen').style.display = 'none';
        
        // Show results screen
        document.getElementById('resultsScreen').style.display = 'block';
        
        // Display last results
        quiz.displayLastResults();
        
        // Update premium UI
        updatePremiumUI();
    }
}

// Function to check and show last results button
function checkAndShowLastResultsButton() {
    const viewLastResultsBtn = document.getElementById('viewLastResultsBtn');
    if (quiz && quiz.hasPreviousResults()) {
        viewLastResultsBtn.style.display = 'inline-block';
    } else {
        viewLastResultsBtn.style.display = 'none';
    }
}

// Function to update quiz description based on premium status
function updateQuizDescription() {
    const questionCountSpan = document.getElementById('questionCount');
    const quizDescription = document.getElementById('quizDescription');
    const premiumQuizTypes = document.getElementById('premiumQuizTypes');
    
    // Add null checks to prevent errors
    if (isPremium()) {
        if (questionCountSpan) {
            questionCountSpan.textContent = '60';
        }
        if (quizDescription) {
            quizDescription.innerHTML = localizationManager.get('ui.mbtiDescription', { count: 60 });
        }
        if (premiumQuizTypes) {
            premiumQuizTypes.style.display = 'block';
        }
    } else {
        if (questionCountSpan) {
            questionCountSpan.textContent = '20';
        }
        if (quizDescription) {
            quizDescription.innerHTML = `${localizationManager.get('ui.mbtiDescription', { count: 20 })} <span style="color: #ffd700; font-weight: 600;">${localizationManager.get('ui.premiumUpgradeNote')}</span>`;
        }
        if (premiumQuizTypes) {
            premiumQuizTypes.style.display = 'none';
        }
    }
}

// Function to start different quiz types
function startQuizType(quizType) {
    if (!isPremium()) {
        openPremiumModal();
        return;
    }
    
    // Set current quiz type
    quiz.currentQuizType = quizType;
    
    // Update welcome screen to show quiz type
    const welcomeContent = document.querySelector('.welcome-content h2');
    if (welcomeContent) {
        const originalTitle = welcomeContent.textContent;
        
        const quizTypeTitles = {
            'leadership': localizationManager.get('quizTypes.leadership.name'),
            'communication': localizationManager.get('quizTypes.communication.name'),
            'stress': localizationManager.get('quizTypes.stress.name'),
            'learning': localizationManager.get('quizTypes.learning.name'),
            'relationships': localizationManager.get('quizTypes.relationships.name'),
            'creativity': localizationManager.get('quizTypes.creativity.name'),
            'decision': localizationManager.get('quizTypes.decision.name'),
            'teamwork': localizationManager.get('quizTypes.teamwork.name'),
            'career': localizationManager.get('quizTypes.career.name'),
            'conflict': localizationManager.get('quizTypes.conflict.name'),
            'motivation': localizationManager.get('quizTypes.motivation.name'),
            'adaptability': localizationManager.get('quizTypes.adaptability.name'),
            'emotional': localizationManager.get('quizTypes.emotional.name'),
            'productivity': localizationManager.get('quizTypes.productivity.name'),
            'social': localizationManager.get('quizTypes.social.name')
        };
        
        welcomeContent.textContent = quizTypeTitles[quizType] || localizationManager.get('ui.mbtiQuiz');
        
        // Start the quiz
        quiz.startQuiz();
        
        // Restore original title when quiz ends
        setTimeout(() => {
            if (welcomeContent) {
                welcomeContent.textContent = originalTitle;
            }
        }, 100);
    } else {
        // If welcome content not found, just start the quiz
        quiz.startQuiz();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the quiz
    quiz = new MBTIQuiz();
    
    updatePremiumUI();
    updateStateBadge();
    updateDevToolsAll();
    
    // Update quiz description based on premium status
    updateQuizDescription();
    
    // Check for previous results and show button if available
    checkAndShowLastResultsButton();
    
    // Log current state for debugging
    console.log(`Current app state: ${getCurrentAppState()}`);
});

// Initialize the quiz
let quiz;

// Global functions for HTML onclick handlers
function startQuiz() {
    quiz = new MBTIQuiz();
    quiz.startQuiz();
}

function selectOption(optionNumber) {
    if (quiz) quiz.selectOption(optionNumber);
}

function nextQuestion() {
    if (quiz) quiz.nextQuestion();
}

function previousQuestion() {
    if (quiz) quiz.previousQuestion();
}

function restartQuiz() {
    if (quiz) quiz.restartQuiz();
}

function shareResults() {
    if (quiz) quiz.shareResults();
}

function exitQuiz() {
    // Show custom confirmation modal
    const exitQuizModal = document.getElementById('exitQuizModal');
    if (exitQuizModal) {
        exitQuizModal.style.display = 'flex';
    }
}

function closeExitQuizModal() {
    const exitQuizModal = document.getElementById('exitQuizModal');
    if (exitQuizModal) {
        exitQuizModal.style.display = 'none';
    }
}

function confirmExitQuiz() {
    // Reset quiz state
    if (quiz) {
        quiz.currentQuestion = 0;
        quiz.answers = [];
        quiz.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        quiz.selectedOption = null;
    }
    
    // Return to welcome screen
    const quizQuestions = document.getElementById('quizQuestions');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    if (quizQuestions) {
        quizQuestions.style.display = 'none';
    }
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
    }
    
    // Reset quiz type to default
    if (quiz) {
        quiz.currentQuizType = 'mbti';
    }
    
    // Update quiz description
    updateQuizDescription();
    
    // Close the modal
    closeExitQuizModal();
}

// Make all functions available globally for HTML onclick handlers
window.startQuiz = startQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.restartQuiz = restartQuiz;
window.shareResults = shareResults;
window.exitQuiz = exitQuiz;
window.closeExitQuizModal = closeExitQuizModal;
window.confirmExitQuiz = confirmExitQuiz;
window.openTypesModal = openTypesModal;
window.closeTypesModal = closeTypesModal;
window.openPremiumModal = openPremiumModal;
window.closePremiumModal = closePremiumModal;
window.unlockPremium = unlockPremium;
window.toggleAppState = toggleAppState;
window.viewLastResults = viewLastResults;
window.startQuizType = startQuizType;
window.fillAllRandomAnswersFromWelcome = fillAllRandomAnswersFromWelcome;
window.generatePDF = generatePDF;
window.copyShareLink = copyShareLink; 