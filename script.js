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
        card.innerHTML = `
            <div class="type-code">${type.code}</div>
            <div class="type-title">${type.title}</div>
            <div class="type-subtitle">${type.subtitle}</div>
            <div class="type-description">${type.description}</div>
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