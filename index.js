let quizData ={}
        fetch('/data.json')
        .then(response => response.json())
        .then(data => {
            quizData = data
            console.log(data)
        });

// DOM elements
const setupContainer = document.getElementById('setup-container');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const weekSelect = document.getElementById('week-select');
const startQuizButton = document.getElementById('start-quiz');
const nextQuestionButton = document.getElementById('next-question');
const questionContainer = document.getElementById('question-container');
const quizProgress = document.getElementById('quiz-progress');
const questionCounter = document.getElementById('question-counter');
const resultWeek = document.getElementById('result-week');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('total-questions');
const performanceMessage = document.getElementById('performance-message');
const restartQuizButton = document.getElementById('restart-quiz');
const questionReview = document.getElementById('question-review');

// Quiz state
let currentWeek = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let userAnswers = [];

// Event listeners
weekSelect.addEventListener('change', checkStartButtonState);
startQuizButton.addEventListener('click', startQuiz);
nextQuestionButton.addEventListener('click', handleNextQuestion);
restartQuizButton.addEventListener('click', restartQuiz);

// Check if start button should be enabled
function checkStartButtonState() {
    startQuizButton.disabled = weekSelect.value === '';
}

// Start the quiz
function startQuiz() {
    currentWeek = weekSelect.value;
    
    // Load questions from the data
    currentQuestions = quizData.forest[currentWeek];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(currentQuestions.length);
    
    // Show the quiz container and hide setup
    setupContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    
    // Display the first question
    displayQuestion();
}

// Display the current question
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Update progress
    const progressValue = ((currentQuestionIndex) / currentQuestions.length) * 100;
    quizProgress.value = progressValue;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    
    // Create question HTML
    let questionHTML = `
        <div class="question">
            <h3>${question.question}</h3>
            <div class="options">
    `;
    
    // Add options
    question.options.forEach((option, index) => {
        questionHTML += `
            <div class="option" data-index="${index}">${option}</div>
        `;
    });
    
    questionHTML += `
            </div>
        </div>
    `;
    
    // Set question HTML
    questionContainer.innerHTML = questionHTML;
    
    // Add click event to options
    const optionElements = document.querySelectorAll('.option');
    optionElements.forEach(option => {
        option.addEventListener('click', selectOption);
    });
    
    // Disable next button until an option is selected
    nextQuestionButton.disabled = true;
    selectedOption = null;
}

// Handle option selection
function selectOption(event) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.classList.add('selected');
    
    // Store selected option
    selectedOption = parseInt(event.target.dataset.index);
    
    // Enable next button
    nextQuestionButton.disabled = false;
}

// Handle next question button click
function handleNextQuestion() {
    // Store user's answer
    userAnswers[currentQuestionIndex] = selectedOption;
    
    // Check if answer is correct and update score
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (selectedOption === currentQuestion.answer) {
        score++;
    }
    
    // Move to next question or end quiz
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

// End the quiz and show results
function endQuiz() {
    // Hide quiz container and show results
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    
    // Update results
    resultWeek.textContent = weekSelect.options[weekSelect.selectedIndex].text;
    scoreElement.textContent = score;
    totalQuestionsElement.textContent = currentQuestions.length;
    
    // Set performance message
    const percentage = (score / currentQuestions.length) * 100;
    if (percentage >= 80) {
        performanceMessage.textContent = "Excellent! You've mastered this forestry topic!";
    } else if (percentage >= 60) {
        performanceMessage.textContent = "Good job! You're on the right track with forestry concepts!";
    } else {
        performanceMessage.textContent = "Keep studying! You'll improve with more practice on these forestry concepts.";
    }
    
    // Display review of all questions
    displayQuestionReview();
}

// Display review of all questions showing correct and incorrect answers
function displayQuestionReview() {
    questionReview.innerHTML = '<h3>Question Review</h3>';
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        reviewItem.innerHTML = `
            <div class="review-question">
                <span class="question-number">Q${index + 1}:</span> 
                ${question.question}
            </div>
            <div class="review-answers">
                <div class="your-answer">
                    <strong>Your answer:</strong> ${question.options[userAnswer]} 
                    <span class="${isCorrect ? 'correct-mark' : 'incorrect-mark'}">
                        ${isCorrect ? '✓' : '✗'}
                    </span>
                </div>
                ${!isCorrect ? `
                <div class="correct-answer">
                    <strong>Correct answer:</strong> ${question.options[question.answer]}
                </div>` : ''}
            </div>
        `;
        
        questionReview.appendChild(reviewItem);
    });
}

// Restart the quiz
function restartQuiz() {
    // Reset selection
    weekSelect.selectedIndex = 0;
    
    // Disable start button
    startQuizButton.disabled = true;
    
    // Show setup container and hide results
    setupContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
}

// Initialize
checkStartButtonState();