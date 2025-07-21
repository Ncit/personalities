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
        this.questions = this.generateQuestions();
        this.selectedOption = null;
    }

    generateQuestions() {
        return [
            // Extraversion (E) vs Introversion (I) Questions
            {
                question: "How do you prefer to spend your free time?",
                options: [
                    "Alone, reading a book or watching a movie",
                    "With a small group of close friends",
                    "At a large social gathering or party",
                    "It depends on my mood"
                ],
                dimension: "EI",
                weights: [3, 1, -3, 0] // I, slight I, E, neutral
            },
            {
                question: "When you're in a group setting, you tend to:",
                options: [
                    "Listen more than speak",
                    "Speak and listen equally",
                    "Do most of the talking",
                    "Observe and only speak when necessary"
                ],
                dimension: "EI",
                weights: [2, 0, -2, 1]
            },
            {
                question: "After a long day, you prefer to:",
                options: [
                    "Recharge by spending time alone",
                    "Talk to someone about your day",
                    "Go out with friends to unwind",
                    "Do something active with others"
                ],
                dimension: "EI",
                weights: [3, 0, -2, -1]
            },
            {
                question: "In new social situations, you usually:",
                options: [
                    "Feel energized and excited",
                    "Feel comfortable but not overly excited",
                    "Feel somewhat anxious but push through",
                    "Prefer to avoid them if possible"
                ],
                dimension: "EI",
                weights: [-2, 0, 1, 3]
            },
            {
                question: "When working on a project, you prefer:",
                options: [
                    "Collaborating with a team",
                    "Working independently",
                    "A mix of both depending on the task",
                    "Leading the team"
                ],
                dimension: "EI",
                weights: [-1, 2, 0, -2]
            },
            {
                question: "You get your energy from:",
                options: [
                    "Being around other people",
                    "Spending time alone",
                    "A balance of both",
                    "Depends on the situation"
                ],
                dimension: "EI",
                weights: [-3, 3, 0, 0]
            },
            {
                question: "When making decisions, you prefer to:",
                options: [
                    "Think through it carefully alone",
                    "Discuss it with others",
                    "Trust your gut feeling",
                    "Research and analyze thoroughly"
                ],
                dimension: "EI",
                weights: [1, -1, 0, 0]
            },
            {
                question: "At parties, you typically:",
                options: [
                    "Meet new people and socialize actively",
                    "Stick with people you know",
                    "Find a quiet corner to observe",
                    "Leave early to avoid crowds"
                ],
                dimension: "EI",
                weights: [-3, 0, 2, 3]
            },
            {
                question: "When stressed, you prefer to:",
                options: [
                    "Talk to someone about it",
                    "Process it internally",
                    "Distract yourself with activities",
                    "Take time alone to reflect"
                ],
                dimension: "EI",
                weights: [-2, 2, -1, 1]
            },
            {
                question: "You consider yourself more:",
                options: [
                    "Outgoing and sociable",
                    "Reserved and thoughtful",
                    "Balanced between the two",
                    "It varies depending on the context"
                ],
                dimension: "EI",
                weights: [-3, 3, 0, 0]
            },
            {
                question: "In group discussions, you usually:",
                options: [
                    "Share your thoughts freely",
                    "Listen more than contribute",
                    "Contribute when you have something valuable to add",
                    "Prefer to avoid speaking up"
                ],
                dimension: "EI",
                weights: [-2, 2, 0, 3]
            },
            {
                question: "When meeting new people, you:",
                options: [
                    "Feel excited and energized",
                    "Feel neutral about it",
                    "Feel slightly nervous",
                    "Prefer to avoid it"
                ],
                dimension: "EI",
                weights: [-3, 0, 1, 3]
            },
            {
                question: "You prefer work environments that are:",
                options: [
                    "Collaborative and team-oriented",
                    "Quiet and focused",
                    "Flexible with both options",
                    "Structured but independent"
                ],
                dimension: "EI",
                weights: [-2, 2, 0, 1]
            },
            {
                question: "When solving problems, you prefer to:",
                options: [
                    "Work through it independently",
                    "Brainstorm with others",
                    "Research and then discuss",
                    "Trust your intuition"
                ],
                dimension: "EI",
                weights: [1, -1, 0, 0]
            },
            {
                question: "You feel most comfortable when:",
                options: [
                    "Surrounded by people you know",
                    "Alone with your thoughts",
                    "In a familiar environment",
                    "Exploring new places"
                ],
                dimension: "EI",
                weights: [-1, 2, 0, -1]
            },

            // Sensing (S) vs Intuition (N) Questions
            {
                question: "When learning something new, you prefer:",
                options: [
                    "Step-by-step instructions",
                    "Understanding the big picture first",
                    "Hands-on experience",
                    "Reading about theories and concepts"
                ],
                dimension: "SN",
                weights: [2, -1, 1, -2]
            },
            {
                question: "You tend to focus more on:",
                options: [
                    "What is real and concrete",
                    "What could be possible",
                    "What has worked in the past",
                    "What might work in the future"
                ],
                dimension: "SN",
                weights: [3, -3, 1, -1]
            },
            {
                question: "When reading a book, you prefer:",
                options: [
                    "Stories with clear, factual details",
                    "Stories with abstract concepts and symbolism",
                    "Stories that are practical and useful",
                    "Stories that explore new ideas"
                ],
                dimension: "SN",
                weights: [2, -2, 1, -1]
            },
            {
                question: "You trust information that is:",
                options: [
                    "Based on facts and evidence",
                    "Based on intuition and patterns",
                    "Based on personal experience",
                    "Based on innovative thinking"
                ],
                dimension: "SN",
                weights: [3, -2, 1, -2]
            },
            {
                question: "When making plans, you prefer:",
                options: [
                    "Detailed, step-by-step approaches",
                    "Flexible, adaptable strategies",
                    "Proven methods that work",
                    "Creative, innovative solutions"
                ],
                dimension: "SN",
                weights: [2, -1, 1, -2]
            },
            {
                question: "You enjoy work that involves:",
                options: [
                    "Working with concrete facts and data",
                    "Exploring new possibilities and ideas",
                    "Following established procedures",
                    "Creating new approaches"
                ],
                dimension: "SN",
                weights: [2, -2, 1, -1]
            },
            {
                question: "When solving problems, you rely on:",
                options: [
                    "Past experience and proven methods",
                    "Intuition and creative thinking",
                    "Systematic analysis of facts",
                    "Innovative and unconventional approaches"
                ],
                dimension: "SN",
                weights: [1, -2, 2, -1]
            },
            {
                question: "You prefer conversations about:",
                options: [
                    "Current events and practical matters",
                    "Abstract concepts and theories",
                    "Personal experiences and stories",
                    "Future possibilities and innovations"
                ],
                dimension: "SN",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When learning a new skill, you prefer:",
                options: [
                    "Clear, practical instructions",
                    "Understanding the underlying principles",
                    "Trial and error with guidance",
                    "Exploring different approaches"
                ],
                dimension: "SN",
                weights: [2, -1, 1, -2]
            },
            {
                question: "You are more interested in:",
                options: [
                    "What is happening now",
                    "What could happen in the future",
                    "What has happened in the past",
                    "What might be possible"
                ],
                dimension: "SN",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When making decisions, you consider:",
                options: [
                    "Practical implications and facts",
                    "Future possibilities and potential",
                    "Past experiences and outcomes",
                    "Innovative and creative options"
                ],
                dimension: "SN",
                weights: [2, -2, 1, -1]
            },
            {
                question: "You prefer environments that are:",
                options: [
                    "Organized and structured",
                    "Creative and flexible",
                    "Practical and functional",
                    "Innovative and dynamic"
                ],
                dimension: "SN",
                weights: [1, -1, 2, -2]
            },
            {
                question: "When working on projects, you focus on:",
                options: [
                    "Getting the details right",
                    "Exploring new possibilities",
                    "Following established procedures",
                    "Creating innovative solutions"
                ],
                dimension: "SN",
                weights: [2, -2, 1, -1]
            },
            {
                question: "You trust your:",
                options: [
                    "Senses and observations",
                    "Intuition and gut feelings",
                    "Experience and knowledge",
                    "Creativity and imagination"
                ],
                dimension: "SN",
                weights: [2, -2, 1, -1]
            },

            // Thinking (T) vs Feeling (F) Questions
            {
                question: "When making important decisions, you prioritize:",
                options: [
                    "Logical analysis and facts",
                    "How it will affect people",
                    "What feels right to you",
                    "What makes the most sense"
                ],
                dimension: "TF",
                weights: [2, -2, -1, 1]
            },
            {
                question: "In conflicts, you tend to:",
                options: [
                    "Focus on finding the right solution",
                    "Focus on maintaining harmony",
                    "Focus on what's fair",
                    "Focus on understanding all perspectives"
                ],
                dimension: "TF",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer to be known as:",
                options: [
                    "Competent and capable",
                    "Caring and compassionate",
                    "Fair and just",
                    "Wise and insightful"
                ],
                dimension: "TF",
                weights: [1, -2, 0, -1]
            },
            {
                question: "When giving feedback, you focus on:",
                options: [
                    "What needs to be improved",
                    "How to encourage the person",
                    "Being honest but kind",
                    "Providing constructive guidance"
                ],
                dimension: "TF",
                weights: [2, -2, 0, 0]
            },
            {
                question: "You are more motivated by:",
                options: [
                    "Achieving goals and success",
                    "Helping others and making a difference",
                    "Personal growth and development",
                    "Making a positive impact"
                ],
                dimension: "TF",
                weights: [1, -2, 0, -1]
            },
            {
                question: "When evaluating others, you consider:",
                options: [
                    "Their competence and results",
                    "Their character and values",
                    "Their effort and intentions",
                    "Their potential and growth"
                ],
                dimension: "TF",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer work environments that are:",
                options: [
                    "Efficient and results-oriented",
                    "Supportive and collaborative",
                    "Fair and merit-based",
                    "Inspiring and meaningful"
                ],
                dimension: "TF",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When solving problems, you consider:",
                options: [
                    "What is most efficient",
                    "What is best for everyone involved",
                    "What is most logical",
                    "What aligns with your values"
                ],
                dimension: "TF",
                weights: [1, -2, 1, -1]
            },
            {
                question: "You are more comfortable with:",
                options: [
                    "Direct and honest communication",
                    "Gentle and supportive communication",
                    "Clear and logical communication",
                    "Empathetic and understanding communication"
                ],
                dimension: "TF",
                weights: [1, -2, 1, -1]
            },
            {
                question: "When leading others, you focus on:",
                options: [
                    "Achieving goals and results",
                    "Supporting and developing people",
                    "Maintaining standards and quality",
                    "Creating a positive environment"
                ],
                dimension: "TF",
                weights: [1, -2, 0, -1]
            },
            {
                question: "You prefer to resolve disagreements by:",
                options: [
                    "Finding the most logical solution",
                    "Finding a compromise that works for everyone",
                    "Discussing the facts objectively",
                    "Understanding each person's perspective"
                ],
                dimension: "TF",
                weights: [2, -2, 1, -1]
            },
            {
                question: "When evaluating ideas, you consider:",
                options: [
                    "Whether they are practical and logical",
                    "How they will affect people",
                    "Whether they are well-reasoned",
                    "Whether they align with values"
                ],
                dimension: "TF",
                weights: [2, -2, 1, -1]
            },
            {
                question: "You are more likely to:",
                options: [
                    "Point out flaws in arguments",
                    "Find common ground in disagreements",
                    "Analyze situations objectively",
                    "Consider the emotional impact"
                ],
                dimension: "TF",
                weights: [2, -2, 1, -1]
            },
            {
                question: "When making choices, you rely on:",
                options: [
                    "Logic and reasoning",
                    "Your values and feelings",
                    "Analysis and facts",
                    "Intuition and empathy"
                ],
                dimension: "TF",
                weights: [2, -2, 1, -1]
            },
            {
                question: "You prefer to work with people who are:",
                options: [
                    "Competent and efficient",
                    "Supportive and caring",
                    "Logical and analytical",
                    "Creative and inspiring"
                ],
                dimension: "TF",
                weights: [1, -2, 1, -1]
            },
            {
                question: "When giving advice, you focus on:",
                options: [
                    "What will work best",
                    "What will make them happy",
                    "What is most logical",
                    "What aligns with their values"
                ],
                dimension: "TF",
                weights: [1, -2, 1, -1]
            },

            // Judging (J) vs Perceiving (P) Questions
            {
                question: "You prefer to:",
                options: [
                    "Have a plan and stick to it",
                    "Keep your options open",
                    "Have a general idea but be flexible",
                    "Go with the flow"
                ],
                dimension: "JP",
                weights: [3, -3, 0, -2]
            },
            {
                question: "When working on projects, you:",
                options: [
                    "Set deadlines and meet them",
                    "Work on them when you feel inspired",
                    "Plan ahead but allow for changes",
                    "Work best under pressure"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer environments that are:",
                options: [
                    "Organized and structured",
                    "Flexible and spontaneous",
                    "Balanced between order and flexibility",
                    "Creative and free-flowing"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When making decisions, you:",
                options: [
                    "Decide quickly and stick with it",
                    "Take your time and keep reconsidering",
                    "Consider options carefully then decide",
                    "Wait to see how things develop"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer to:",
                options: [
                    "Finish tasks before starting new ones",
                    "Work on multiple things at once",
                    "Focus on priorities but allow flexibility",
                    "Follow your interests as they arise"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When traveling, you prefer to:",
                options: [
                    "Have a detailed itinerary",
                    "Keep plans flexible and spontaneous",
                    "Have a general plan but allow changes",
                    "Discover things as you go"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You work best when you:",
                options: [
                    "Have clear deadlines and structure",
                    "Can work at your own pace",
                    "Have some structure but flexibility",
                    "Can be spontaneous and creative"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When organizing things, you prefer:",
                options: [
                    "Clear categories and systems",
                    "Flexible arrangements",
                    "Organized but adaptable systems",
                    "Creative and unique approaches"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer to:",
                options: [
                    "Know what to expect",
                    "Be surprised and spontaneous",
                    "Have some predictability with flexibility",
                    "Embrace uncertainty and change"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When meeting deadlines, you:",
                options: [
                    "Always meet them comfortably",
                    "Often work right up to the deadline",
                    "Usually meet them with some effort",
                    "Sometimes need extensions"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer schedules that are:",
                options: [
                    "Fixed and predictable",
                    "Flexible and adaptable",
                    "Structured but with some flexibility",
                    "Open and spontaneous"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When starting a new project, you:",
                options: [
                    "Plan everything out first",
                    "Start working and figure it out as you go",
                    "Have a general plan but adapt as needed",
                    "Let inspiration guide you"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer to:",
                options: [
                    "Make decisions quickly",
                    "Keep your options open as long as possible",
                    "Consider options carefully then decide",
                    "Wait to see what happens"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "When organizing your space, you prefer:",
                options: [
                    "Everything in its proper place",
                    "Creative and flexible arrangements",
                    "Organized but comfortable",
                    "Whatever works in the moment"
                ],
                dimension: "JP",
                weights: [2, -2, 0, -1]
            },
            {
                question: "You prefer to:",
                options: [
                    "Follow established procedures",
                    "Find new and creative ways",
                    "Use proven methods but adapt as needed",
                    "Experiment and try different approaches"
                ],
                dimension: "JP",
                weights: [1, -1, 0, -1]
            },
            {
                question: "When working with others, you prefer:",
                options: [
                    "Clear roles and responsibilities",
                    "Flexible and collaborative approaches",
                    "Structured but cooperative environments",
                    "Creative and dynamic teamwork"
                ],
                dimension: "JP",
                weights: [1, -1, 0, -1]
            }
        ];
    }

    startQuiz() {
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
        const personalities = {
            'ISTJ': {
                title: 'The Inspector',
                subtitle: 'Practical, responsible, and organized',
                description: 'ISTJs are practical, responsible, and organized individuals who value tradition and order. They are reliable, hardworking, and detail-oriented, making them excellent at following through on commitments and maintaining systems.',
                traits: ['Reliable', 'Organized', 'Practical', 'Responsible', 'Detail-oriented', 'Traditional']
            },
            'ISFJ': {
                title: 'The Protector',
                subtitle: 'Caring, loyal, and traditional',
                description: 'ISFJs are warm, caring, and loyal individuals who are deeply committed to the well-being of others. They are practical, responsible, and have a strong sense of duty, often putting others\' needs before their own.',
                traits: ['Caring', 'Loyal', 'Practical', 'Responsible', 'Traditional', 'Supportive']
            },
            'INFJ': {
                title: 'The Counselor',
                subtitle: 'Insightful, idealistic, and compassionate',
                description: 'INFJs are insightful, idealistic, and compassionate individuals who seek meaning and connection in everything they do. They are creative, empathetic, and have a strong desire to help others reach their potential.',
                traits: ['Insightful', 'Idealistic', 'Compassionate', 'Creative', 'Empathetic', 'Visionary']
            },
            'INTJ': {
                title: 'The Mastermind',
                subtitle: 'Strategic, independent, and analytical',
                description: 'INTJs are strategic, independent, and analytical thinkers who excel at developing innovative solutions to complex problems. They are confident, determined, and have high standards for themselves and others.',
                traits: ['Strategic', 'Independent', 'Analytical', 'Confident', 'Determined', 'Innovative']
            },
            'ISTP': {
                title: 'The Craftsman',
                subtitle: 'Flexible, logical, and practical',
                description: 'ISTPs are flexible, logical, and practical individuals who excel at solving problems with their hands and minds. They are calm, observant, and prefer to work independently on concrete tasks.',
                traits: ['Flexible', 'Logical', 'Practical', 'Calm', 'Observant', 'Independent']
            },
            'ISFP': {
                title: 'The Composer',
                subtitle: 'Artistic, gentle, and adaptable',
                description: 'ISFPs are artistic, gentle, and adaptable individuals who live in the present moment. They are sensitive, caring, and have a strong appreciation for beauty and harmony in their environment.',
                traits: ['Artistic', 'Gentle', 'Adaptable', 'Sensitive', 'Caring', 'Harmonious']
            },
            'INFP': {
                title: 'The Healer',
                subtitle: 'Idealistic, creative, and empathetic',
                description: 'INFPs are idealistic, creative, and empathetic individuals who are driven by their values and desire to help others. They are imaginative, compassionate, and seek authentic connections with people.',
                traits: ['Idealistic', 'Creative', 'Empathetic', 'Imaginative', 'Compassionate', 'Authentic']
            },
            'INTP': {
                title: 'The Architect',
                subtitle: 'Analytical, innovative, and independent',
                description: 'INTPs are analytical, innovative, and independent thinkers who excel at understanding complex systems and theories. They are curious, logical, and enjoy exploring abstract concepts and possibilities.',
                traits: ['Analytical', 'Innovative', 'Independent', 'Curious', 'Logical', 'Theoretical']
            },
            'ESTP': {
                title: 'The Dynamo',
                subtitle: 'Energetic, practical, and spontaneous',
                description: 'ESTPs are energetic, practical, and spontaneous individuals who thrive on action and excitement. They are flexible, realistic, and excel at solving problems in the moment with their quick thinking.',
                traits: ['Energetic', 'Practical', 'Spontaneous', 'Flexible', 'Realistic', 'Action-oriented']
            },
            'ESFP': {
                title: 'The Performer',
                subtitle: 'Enthusiastic, friendly, and spontaneous',
                description: 'ESFPs are enthusiastic, friendly, and spontaneous individuals who love to entertain and bring joy to others. They are practical, caring, and live in the present moment, making them great at connecting with people.',
                traits: ['Enthusiastic', 'Friendly', 'Spontaneous', 'Practical', 'Caring', 'Entertaining']
            },
            'ENFP': {
                title: 'The Champion',
                subtitle: 'Enthusiastic, creative, and sociable',
                description: 'ENFPs are enthusiastic, creative, and sociable individuals who are driven by possibilities and connections. They are imaginative, empathetic, and excel at inspiring and motivating others.',
                traits: ['Enthusiastic', 'Creative', 'Sociable', 'Imaginative', 'Empathetic', 'Inspiring']
            },
            'ENTP': {
                title: 'The Visionary',
                subtitle: 'Innovative, strategic, and energetic',
                description: 'ENTPs are innovative, strategic, and energetic individuals who love to explore new ideas and possibilities. They are quick-witted, adaptable, and excel at finding creative solutions to challenges.',
                traits: ['Innovative', 'Strategic', 'Energetic', 'Quick-witted', 'Adaptable', 'Creative']
            },
            'ESTJ': {
                title: 'The Supervisor',
                subtitle: 'Practical, organized, and decisive',
                description: 'ESTJs are practical, organized, and decisive individuals who excel at managing and leading others. They are responsible, direct, and have a strong sense of duty and tradition.',
                traits: ['Practical', 'Organized', 'Decisive', 'Responsible', 'Direct', 'Traditional']
            },
            'ESFJ': {
                title: 'The Provider',
                subtitle: 'Caring, sociable, and responsible',
                description: 'ESFJs are caring, sociable, and responsible individuals who are deeply committed to the well-being of their communities. They are organized, loyal, and excel at creating harmony and cooperation.',
                traits: ['Caring', 'Sociable', 'Responsible', 'Organized', 'Loyal', 'Harmonious']
            },
            'ENFJ': {
                title: 'The Teacher',
                subtitle: 'Charismatic, inspiring, and altruistic',
                description: 'ENFJs are charismatic, inspiring, and altruistic individuals who are natural leaders and mentors. They are empathetic, organized, and have a strong desire to help others grow and develop.',
                traits: ['Charismatic', 'Inspiring', 'Altruistic', 'Empathetic', 'Organized', 'Mentoring']
            },
            'ENTJ': {
                title: 'The Commander',
                subtitle: 'Strategic, confident, and decisive',
                description: 'ENTJs are strategic, confident, and decisive individuals who excel at leading and organizing others. They are analytical, ambitious, and have a natural ability to see the big picture and make tough decisions.',
                traits: ['Strategic', 'Confident', 'Decisive', 'Analytical', 'Ambitious', 'Leadership']
            }
        };

        const personality = personalities[type];
        
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

// MBTI types data for modal
const MBTI_TYPES = [
    {
        code: 'ISTJ',
        title: 'The Inspector',
        subtitle: 'Practical, responsible, and organized',
        description: 'ISTJs are practical, responsible, and organized individuals who value tradition and order. They are reliable, hardworking, and detail-oriented, making them excellent at following through on commitments and maintaining systems.'
    },
    {
        code: 'ISFJ',
        title: 'The Protector',
        subtitle: 'Caring, loyal, and traditional',
        description: 'ISFJs are warm, caring, and loyal individuals who are deeply committed to the well-being of others. They are practical, responsible, and have a strong sense of duty, often putting others\' needs before their own.'
    },
    {
        code: 'INFJ',
        title: 'The Counselor',
        subtitle: 'Insightful, idealistic, and compassionate',
        description: 'INFJs are insightful, idealistic, and compassionate individuals who seek meaning and connection in everything they do. They are creative, empathetic, and have a strong desire to help others reach their potential.'
    },
    {
        code: 'INTJ',
        title: 'The Mastermind',
        subtitle: 'Strategic, independent, and analytical',
        description: 'INTJs are strategic, independent, and analytical thinkers who excel at developing innovative solutions to complex problems. They are confident, determined, and have high standards for themselves and others.'
    },
    {
        code: 'ISTP',
        title: 'The Craftsman',
        subtitle: 'Flexible, logical, and practical',
        description: 'ISTPs are flexible, logical, and practical individuals who excel at solving problems with their hands and minds. They are calm, observant, and prefer to work independently on concrete tasks.'
    },
    {
        code: 'ISFP',
        title: 'The Composer',
        subtitle: 'Artistic, gentle, and adaptable',
        description: 'ISFPs are artistic, gentle, and adaptable individuals who live in the present moment. They are sensitive, caring, and have a strong appreciation for beauty and harmony in their environment.'
    },
    {
        code: 'INFP',
        title: 'The Healer',
        subtitle: 'Idealistic, creative, and empathetic',
        description: 'INFPs are idealistic, creative, and empathetic individuals who are driven by their values and desire to help others. They are imaginative, compassionate, and seek authentic connections with people.'
    },
    {
        code: 'INTP',
        title: 'The Architect',
        subtitle: 'Analytical, innovative, and independent',
        description: 'INTPs are analytical, innovative, and independent thinkers who excel at understanding complex systems and theories. They are curious, logical, and enjoy exploring abstract concepts and possibilities.'
    },
    {
        code: 'ESTP',
        title: 'The Dynamo',
        subtitle: 'Energetic, practical, and spontaneous',
        description: 'ESTPs are energetic, practical, and spontaneous individuals who thrive on action and excitement. They are flexible, realistic, and excel at solving problems in the moment with their quick thinking.'
    },
    {
        code: 'ESFP',
        title: 'The Performer',
        subtitle: 'Enthusiastic, friendly, and spontaneous',
        description: 'ESFPs are enthusiastic, friendly, and spontaneous individuals who love to entertain and bring joy to others. They are practical, caring, and live in the present moment, making them great at connecting with people.'
    },
    {
        code: 'ENFP',
        title: 'The Champion',
        subtitle: 'Enthusiastic, creative, and sociable',
        description: 'ENFPs are enthusiastic, creative, and sociable individuals who are driven by possibilities and connections. They are imaginative, empathetic, and excel at inspiring and motivating others.'
    },
    {
        code: 'ENTP',
        title: 'The Visionary',
        subtitle: 'Innovative, strategic, and energetic',
        description: 'ENTPs are innovative, strategic, and energetic individuals who love to explore new ideas and possibilities. They are quick-witted, adaptable, and excel at finding creative solutions to challenges.'
    },
    {
        code: 'ESTJ',
        title: 'The Supervisor',
        subtitle: 'Practical, organized, and decisive',
        description: 'ESTJs are practical, organized, and decisive individuals who excel at managing and leading others. They are responsible, direct, and have a strong sense of duty and tradition.'
    },
    {
        code: 'ESFJ',
        title: 'The Provider',
        subtitle: 'Caring, sociable, and responsible',
        description: 'ESFJs are caring, sociable, and responsible individuals who are deeply committed to the well-being of their communities. They are organized, loyal, and excel at creating harmony and cooperation.'
    },
    {
        code: 'ENFJ',
        title: 'The Teacher',
        subtitle: 'Charismatic, inspiring, and altruistic',
        description: 'ENFJs are charismatic, inspiring, and altruistic individuals who are natural leaders and mentors. They are empathetic, organized, and have a strong desire to help others grow and develop.'
    },
    {
        code: 'ENTJ',
        title: 'The Commander',
        subtitle: 'Strategic, confident, and decisive',
        description: 'ENTJs are strategic, confident, and decisive individuals who excel at leading and organizing others. They are analytical, ambitious, and have a natural ability to see the big picture and make tough decisions.'
    }
];

function openTypesModal() {
    const modal = document.getElementById('typesModal');
    const list = document.getElementById('typesList');
    list.innerHTML = '';
    MBTI_TYPES.forEach(type => {
        const card = document.createElement('div');
        card.className = 'type-card';
        
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

// Advanced Insights Data
const ADVANCED_INSIGHTS = {
    'ISTJ': {
        strengths: ['Reliable and responsible', 'Practical and organized', 'Detail-oriented', 'Loyal and committed'],
        weaknesses: ['Can be rigid and inflexible', 'May resist change', 'Can be overly critical', 'May struggle with abstract concepts'],
        careers: ['Accountant', 'Project Manager', 'Military Officer', 'Quality Control Specialist'],
        development: ['Practice flexibility and adaptability', 'Learn to embrace change', 'Develop creative thinking', 'Improve emotional expression']
    },
    'ISFJ': {
        strengths: ['Caring and supportive', 'Loyal and reliable', 'Practical and organized', 'Good at following through'],
        weaknesses: ['Can be overly self-sacrificing', 'May resist change', 'Can be too modest', 'May avoid conflict'],
        careers: ['Nurse', 'Teacher', 'Social Worker', 'Administrative Assistant'],
        development: ['Learn to set boundaries', 'Practice self-advocacy', 'Embrace new experiences', 'Develop assertiveness']
    },
    'INFJ': {
        strengths: ['Insightful and intuitive', 'Creative and imaginative', 'Compassionate and caring', 'Determined and idealistic'],
        weaknesses: ['Can be overly idealistic', 'May be too sensitive', 'Can be perfectionistic', 'May withdraw when stressed'],
        careers: ['Counselor', 'Writer', 'Teacher', 'Human Resources Manager'],
        development: ['Practice realistic goal-setting', 'Develop emotional resilience', 'Learn to accept imperfection', 'Build social connections']
    },
    'INTJ': {
        strengths: ['Strategic and analytical', 'Independent and determined', 'Creative problem-solver', 'High standards'],
        weaknesses: ['Can be overly critical', 'May seem arrogant', 'Can be perfectionistic', 'May struggle with emotions'],
        careers: ['Scientist', 'Engineer', 'Investment Banker', 'Management Consultant'],
        development: ['Practice empathy and understanding', 'Learn to accept feedback', 'Develop emotional intelligence', 'Build collaborative skills']
    },
    'ISTP': {
        strengths: ['Flexible and adaptable', 'Practical problem-solver', 'Calm under pressure', 'Hands-on learner'],
        weaknesses: ['Can be impulsive', 'May avoid commitment', 'Can be insensitive', 'May resist structure'],
        careers: ['Mechanic', 'Pilot', 'Athlete', 'Computer Programmer'],
        development: ['Practice long-term planning', 'Develop follow-through', 'Improve emotional sensitivity', 'Learn to work within structure']
    },
    'ISFP': {
        strengths: ['Artistic and creative', 'Gentle and caring', 'Practical and realistic', 'Loyal and supportive'],
        weaknesses: ['Can be overly sensitive', 'May avoid conflict', 'Can be disorganized', 'May resist change'],
        careers: ['Artist', 'Interior Designer', 'Veterinarian', 'Massage Therapist'],
        development: ['Develop organizational skills', 'Practice assertiveness', 'Learn to handle criticism', 'Embrace new experiences']
    },
    'INFP': {
        strengths: ['Idealistic and creative', 'Compassionate and caring', 'Open-minded and flexible', 'Authentic and genuine'],
        weaknesses: ['Can be overly idealistic', 'May be too sensitive', 'Can be disorganized', 'May avoid conflict'],
        careers: ['Writer', 'Artist', 'Counselor', 'Social Worker'],
        development: ['Practice realistic planning', 'Develop emotional resilience', 'Improve organization', 'Learn to handle conflict']
    },
    'INTP': {
        strengths: ['Analytical and logical', 'Creative problem-solver', 'Independent thinker', 'Open to new ideas'],
        weaknesses: ['Can be overly theoretical', 'May seem aloof', 'Can be disorganized', 'May struggle with emotions'],
        careers: ['Scientist', 'Philosopher', 'Computer Programmer', 'Architect'],
        development: ['Practice practical application', 'Develop social skills', 'Improve organization', 'Build emotional intelligence']
    },
    'ESTP': {
        strengths: ['Energetic and action-oriented', 'Practical problem-solver', 'Flexible and adaptable', 'Good at reading people'],
        weaknesses: ['Can be impulsive', 'May avoid planning', 'Can be insensitive', 'May resist structure'],
        careers: ['Entrepreneur', 'Sales Representative', 'Athlete', 'Police Officer'],
        development: ['Practice long-term planning', 'Develop patience', 'Improve sensitivity', 'Learn to work within structure']
    },
    'ESFP': {
        strengths: ['Enthusiastic and friendly', 'Practical and realistic', 'Good at connecting with people', 'Adaptable and flexible'],
        weaknesses: ['Can be disorganized', 'May avoid planning', 'Can be overly emotional', 'May seek constant stimulation'],
        careers: ['Event Planner', 'Sales Representative', 'Teacher', 'Nurse'],
        development: ['Develop organizational skills', 'Practice long-term planning', 'Learn emotional regulation', 'Build focus and concentration']
    },
    'ENFP': {
        strengths: ['Enthusiastic and creative', 'Good at connecting with people', 'Flexible and adaptable', 'Inspiring and motivating'],
        weaknesses: ['Can be disorganized', 'May avoid routine', 'Can be overly emotional', 'May struggle with follow-through'],
        careers: ['Journalist', 'Teacher', 'Marketing Manager', 'Counselor'],
        development: ['Develop organizational skills', 'Practice routine and structure', 'Learn emotional regulation', 'Improve follow-through']
    },
    'ENTP': {
        strengths: ['Innovative and creative', 'Quick-witted and adaptable', 'Good at debating', 'Enthusiastic about new ideas'],
        weaknesses: ['Can be argumentative', 'May avoid routine', 'Can be insensitive', 'May struggle with follow-through'],
        careers: ['Entrepreneur', 'Lawyer', 'Consultant', 'Marketing Manager'],
        development: ['Practice diplomacy', 'Develop routine and structure', 'Improve sensitivity', 'Build follow-through skills']
    },
    'ESTJ': {
        strengths: ['Organized and efficient', 'Practical and realistic', 'Good at leading', 'Reliable and responsible'],
        weaknesses: ['Can be rigid and inflexible', 'May be too controlling', 'Can be insensitive', 'May resist change'],
        careers: ['Manager', 'Military Officer', 'Accountant', 'Project Manager'],
        development: ['Practice flexibility', 'Learn to delegate', 'Improve sensitivity', 'Embrace change and innovation']
    },
    'ESFJ': {
        strengths: ['Caring and supportive', 'Organized and efficient', 'Good at connecting with people', 'Loyal and committed'],
        weaknesses: ['Can be overly concerned with others', 'May be too traditional', 'Can be sensitive to criticism', 'May avoid change'],
        careers: ['Nurse', 'Teacher', 'Human Resources Manager', 'Event Planner'],
        development: ['Practice self-care', 'Embrace new ideas', 'Develop resilience to criticism', 'Learn to adapt to change']
    },
    'ENFJ': {
        strengths: ['Charismatic and inspiring', 'Good at connecting with people', 'Organized and efficient', 'Caring and supportive'],
        weaknesses: ['Can be overly idealistic', 'May be too controlling', 'Can be sensitive to criticism', 'May avoid conflict'],
        careers: ['Teacher', 'Counselor', 'Human Resources Manager', 'Non-profit Director'],
        development: ['Practice realistic goal-setting', 'Learn to let go of control', 'Develop resilience', 'Learn to handle conflict']
    },
    'ENTJ': {
        strengths: ['Strategic and analytical', 'Good at leading', 'Efficient and organized', 'Confident and decisive'],
        weaknesses: ['Can be overly controlling', 'May seem arrogant', 'Can be insensitive', 'May be too demanding'],
        careers: ['CEO', 'Management Consultant', 'Investment Banker', 'Lawyer'],
        development: ['Practice empathy', 'Learn to listen', 'Improve sensitivity', 'Develop collaborative leadership']
    }
};

// Famous Personalities Data
const FAMOUS_PERSONALITIES = {
    'ISTJ': [
        { name: 'Queen Elizabeth II', profession: 'Monarch', image: '👑' },
        { name: 'George Washington', profession: 'President', image: '🇺🇸' },
        { name: 'Angela Merkel', profession: 'Chancellor', image: '🇩🇪' }
    ],
    'ISFJ': [
        { name: 'Mother Teresa', profession: 'Humanitarian', image: '✝️' },
        { name: 'Rosa Parks', profession: 'Civil Rights Activist', image: '🚌' },
        { name: 'Kate Middleton', profession: 'Royal', image: '👑' }
    ],
    'INFJ': [
        { name: 'Nelson Mandela', profession: 'Leader', image: '🇿🇦' },
        { name: 'Martin Luther King Jr.', profession: 'Civil Rights Leader', image: '✊' },
        { name: 'Mother Teresa', profession: 'Humanitarian', image: '✝️' }
    ],
    'INTJ': [
        { name: 'Elon Musk', profession: 'Entrepreneur', image: '🚀' },
        { name: 'Stephen Hawking', profession: 'Physicist', image: '🌌' },
        { name: 'Mark Zuckerberg', profession: 'Tech CEO', image: '💻' }
    ],
    'ISTP': [
        { name: 'Michael Jordan', profession: 'Athlete', image: '🏀' },
        { name: 'Tom Cruise', profession: 'Actor', image: '🎬' },
        { name: 'Bruce Lee', profession: 'Martial Artist', image: '🥋' }
    ],
    'ISFP': [
        { name: 'Marilyn Monroe', profession: 'Actress', image: '💄' },
        { name: 'Bob Dylan', profession: 'Musician', image: '🎸' },
        { name: 'Frida Kahlo', profession: 'Artist', image: '🎨' }
    ],
    'INFP': [
        { name: 'William Shakespeare', profession: 'Playwright', image: '📜' },
        { name: 'J.R.R. Tolkien', profession: 'Author', image: '📚' },
        { name: 'Vincent van Gogh', profession: 'Artist', image: '🌻' }
    ],
    'INTP': [
        { name: 'Albert Einstein', profession: 'Physicist', image: '⚡' },
        { name: 'Isaac Newton', profession: 'Scientist', image: '🍎' },
        { name: 'Charles Darwin', profession: 'Naturalist', image: '🐒' }
    ],
    'ESTP': [
        { name: 'Ernest Hemingway', profession: 'Author', image: '📖' },
        { name: 'Madonna', profession: 'Singer', image: '🎤' },
        { name: 'Jack Nicholson', profession: 'Actor', image: '🎭' }
    ],
    'ESFP': [
        { name: 'Elvis Presley', profession: 'Singer', image: '🎸' },
        { name: 'Marilyn Monroe', profession: 'Actress', image: '💄' },
        { name: 'Will Smith', profession: 'Actor', image: '🎬' }
    ],
    'ENFP': [
        { name: 'Walt Disney', profession: 'Entrepreneur', image: '🏰' },
        { name: 'Robin Williams', profession: 'Actor', image: '😄' },
        { name: 'Oscar Wilde', profession: 'Writer', image: '✒️' }
    ],
    'ENTP': [
        { name: 'Thomas Edison', profession: 'Inventor', image: '💡' },
        { name: 'Benjamin Franklin', profession: 'Founding Father', image: '⚡' },
        { name: 'Steve Jobs', profession: 'Entrepreneur', image: '🍎' }
    ],
    'ESTJ': [
        { name: 'Franklin D. Roosevelt', profession: 'President', image: '🇺🇸' },
        { name: 'Margaret Thatcher', profession: 'Prime Minister', image: '🇬🇧' },
        { name: 'John D. Rockefeller', profession: 'Businessman', image: '💰' }
    ],
    'ESFJ': [
        { name: 'Bill Clinton', profession: 'President', image: '🇺🇸' },
        { name: 'Taylor Swift', profession: 'Singer', image: '🎤' },
        { name: 'Sandra Bullock', profession: 'Actress', image: '🎬' }
    ],
    'ENFJ': [
        { name: 'Barack Obama', profession: 'President', image: '🇺🇸' },
        { name: 'Oprah Winfrey', profession: 'Media Mogul', image: '📺' },
        { name: 'Mahatma Gandhi', profession: 'Leader', image: '🕉️' }
    ],
    'ENTJ': [
        { name: 'Napoleon Bonaparte', profession: 'Military Leader', image: '⚔️' },
        { name: 'Steve Jobs', profession: 'Entrepreneur', image: '🍎' },
        { name: 'Margaret Thatcher', profession: 'Prime Minister', image: '🇬🇧' }
    ]
};

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
            btn.textContent = 'Premium Active';
            btn.disabled = true;
            btn.style.opacity = '0.6';
        } else {
            if (btn.id === 'headerPremiumBtn') {
                btn.innerHTML = '<i class="fas fa-star"></i> Upgrade to Premium';
            }
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });
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
    const radarCanvas = document.getElementById('radarChart');
    if (radarCanvas) {
        const ctx = radarCanvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        
        // Clear canvas
        ctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
        
        // Draw radar grid
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        
        // Draw concentric circles
        for (let r = 20; r <= radius; r += 20) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Draw radar lines
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        const labels = ['E/I', 'S/N', 'T/F', 'J/P'];
        const values = [ePercentage, sPercentage, tPercentage, jPercentage];
        
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 - Math.PI / 2; // Start from top
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Draw line from center
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
            const value = values[i] / 100; // Convert percentage to 0-1
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
    
    // Bar chart
    const barCanvas = document.getElementById('barChart');
    if (barCanvas) {
        const ctx = barCanvas.getContext('2d');
        const barWidth = 40;
        const barSpacing = 20;
        const startX = 50;
        const startY = 150;
        const maxHeight = 100;
        
        // Clear canvas
        ctx.clearRect(0, 0, barCanvas.width, barCanvas.height);
        
        // Draw bars for each dimension
        const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
        const scores = [ePercentage, sPercentage, tPercentage, jPercentage];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
        
        dimensions.forEach((dim, i) => {
            const x = startX + i * (barWidth + barSpacing);
            const height = (scores[i] / 100) * maxHeight;
            
            // Draw bar
            ctx.fillStyle = colors[i];
            ctx.fillRect(x, startY - height, barWidth, height);
            
            // Draw border
            ctx.strokeStyle = '#333';
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
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX - 10, startY);
        ctx.lineTo(startX + 4 * (barWidth + barSpacing) - barSpacing + 10, startY);
        ctx.stroke();
    }
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

document.addEventListener('DOMContentLoaded', () => {
    updatePremiumUI();
    updateStateBadge();
    updateDevToolsAll();
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