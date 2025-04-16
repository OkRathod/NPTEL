document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const setupContainer = document.getElementById('setup-container');
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');
    const categorySelect = document.getElementById('quiz-category');
    const weekSelect = document.getElementById('week-select');
    const startQuizBtn = document.getElementById('start-quiz');
    const nextQuestionBtn = document.getElementById('next-question');
    const questionContainer = document.getElementById('question-container');
    const quizProgress = document.getElementById('quiz-progress');
    const questionCounter = document.getElementById('question-counter');
    const resultCategory = document.getElementById('result-category');
    const resultWeek = document.getElementById('result-week');
    const scoreElement = document.getElementById('score');
    const totalQuestionsElement = document.getElementById('total-questions');
    const performanceMessage = document.getElementById('performance-message');
    const questionReview = document.getElementById('question-review');
    const restartQuizBtn = document.getElementById('restart-quiz');

    // Quiz State
    let quizData = {};
    let currentCategory = '';
    let currentWeek = '';
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let selectedAnswers = [];
    let score = 0;

    // Fetch quiz data from JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
            setupCategoryOptions();
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            alert('Failed to load quiz data. Please refresh the page.');
        });

    // Setup category dropdown options
    function setupCategoryOptions() {
        categorySelect.addEventListener('change', function() {
            currentCategory = this.value;
            setupWeekOptions(currentCategory);
            weekSelect.disabled = false;
            startQuizBtn.disabled = true;
        });
    }

    // Setup week dropdown options based on selected category
    function setupWeekOptions(category) {
        weekSelect.innerHTML = '<option value="" disabled selected>Select a week</option>';
        
        if (category && quizData[category]) {
            const weeks = Object.keys(quizData[category]);
            weeks.forEach(week => {
                const option = document.createElement('option');
                option.value = week;
                option.textContent = week.charAt(0).toUpperCase() + week.slice(1);
                weekSelect.appendChild(option);
            });
        }
        
        weekSelect.addEventListener('change', function() {
            currentWeek = this.value;
            startQuizBtn.disabled = false;
        });
    }

    // Start quiz button event
    startQuizBtn.addEventListener('click', function() {
        if (currentCategory && currentWeek) {
            currentQuestions = quizData[currentCategory][currentWeek];
            currentQuestionIndex = 0;
            selectedAnswers = Array(currentQuestions.length).fill(null);
            score = 0;
            
            setupContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
            
            loadQuestion(currentQuestionIndex);
        }
    });

    // Load question based on index
    function loadQuestion(index) {
        const question = currentQuestions[index];
        questionCounter.textContent = `Question ${index + 1} of ${currentQuestions.length}`;
        quizProgress.value = ((index + 1) / currentQuestions.length) * 100;
        
        let questionHTML = `
            <div class="question">
                <h3>${question.question}</h3>
                <div class="options">
        `;
        
        question.options.forEach((option, optionIndex) => {
            const isSelected = selectedAnswers[index] === optionIndex;
            questionHTML += `
                <div class="option ${isSelected ? 'selected' : ''}" data-index="${optionIndex}">
                    ${option}
                </div>
            `;
        });
        
        questionHTML += `</div></div>`;
        questionContainer.innerHTML = questionHTML;
        
        // Add click event to options
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', selectOption);
        });
        
        // Disable next button until an option is selected
        nextQuestionBtn.disabled = selectedAnswers[index] === null;
    }

    // Handle option selection
    function selectOption() {
        const optionIndex = parseInt(this.getAttribute('data-index'));
        
        // Remove selected class from all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Update selected answer
        selectedAnswers[currentQuestionIndex] = optionIndex;
        
        // Enable next button
        nextQuestionBtn.disabled = false;
    }

    // Next question button event
    nextQuestionBtn.addEventListener('click', function() {
        // Check if answer is correct and update score
        const correctAnswerIndex = currentQuestions[currentQuestionIndex].answer;
        if (selectedAnswers[currentQuestionIndex] === correctAnswerIndex) {
            score++;
        }
        
        // Move to next question or show results
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            loadQuestion(currentQuestionIndex);
        } else {
            showResults();
        }
    });

    // Show quiz results
    function showResults() {
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        resultCategory.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
        resultWeek.textContent = currentWeek.charAt(0).toUpperCase() + currentWeek.slice(1);
        scoreElement.textContent = score;
        totalQuestionsElement.textContent = currentQuestions.length;
        
        // Calculate percentage and show performance message
        const percentage = (score / currentQuestions.length) * 100;
        
        if (percentage >= 90) {
            performanceMessage.textContent = 'Excellent! You\'re a forestry expert!';
        } else if (percentage >= 70) {
            performanceMessage.textContent = 'Great job! You know your forests well.';
        } else if (percentage >= 50) {
            performanceMessage.textContent = 'Good effort! Keep learning about forests.';
        } else {
            performanceMessage.textContent = 'Keep studying! The forest has many secrets to reveal.';
        }
        
        // Show question review
        let reviewHTML = '<h3>Question Review</h3>';
        
        currentQuestions.forEach((question, questionIndex) => {
            const userAnswer = selectedAnswers[questionIndex];
            const correctAnswer = question.answer;
            const isCorrect = userAnswer === correctAnswer;
            
            reviewHTML += `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-question">
                        <span class="question-number">${questionIndex + 1}</span> ${question.question}
                    </div>
                    <div class="review-answers">
                        <p>Your answer: ${question.options[userAnswer]} ${isCorrect ? 
                            '<span class="correct-mark">✓</span>' : 
                            '<span class="incorrect-mark">✗</span>'}
                        </p>
                        ${!isCorrect ? `<p class="correct-answer">Correct answer: ${question.options[correctAnswer]}</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        questionReview.innerHTML = reviewHTML;
    }

    // Restart quiz button event
    restartQuizBtn.addEventListener('click', function() {
        resultsContainer.classList.add('hidden');
        setupContainer.classList.remove('hidden');
        
        // Reset selections
        categorySelect.selectedIndex = 0;
        weekSelect.disabled = true;
        weekSelect.innerHTML = '<option value="" disabled selected>Select a week</option>';
        startQuizBtn.disabled = true;
    });

    // Add floating animation to decorative elements
    document.querySelectorAll('.leaf').forEach(leaf => {
        // Random delay for animation
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 4;
        
        leaf.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
});