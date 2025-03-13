document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('legal-form');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const topRecommendationDiv = document.getElementById('top-recommendation');
    const topRecommendationContent = document.getElementById('top-recommendation-content');
    const otherRecommendationsDiv = document.getElementById('other-recommendations');
    const recommendationsList = document.getElementById('recommendations-list');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const situationTextarea = document.getElementById('situation');
    const aiDetectionStatus = document.getElementById('ai-detection-status');
    const caseTypeOptions = document.querySelectorAll('.case-type-option');
    
    // Theme toggle initialization
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Theme toggle event listener
    themeToggleBtn.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // API key for Google Generative AI - Replace with your actual API key
    const API_KEY = "AIzaSyDUqYPRqZWP8_2ZjdnBiHg7NcrtlHroIn4";

    // Set up case type options click handler
    caseTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Remove selection from all options
            caseTypeOptions.forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selection to clicked option
            option.classList.add('selected');
        });
    });
    
    // AI-powered case type detection based on situation description
    let typingTimer;
    const doneTypingInterval = 1000; // 1 second after user stops typing
    
    situationTextarea.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        
        if (situationTextarea.value) {
            aiDetectionStatus.innerHTML = '<i class="fas fa-brain text-primary-500 animate-pulse mr-2"></i> Analyzing your situation...';
            
            typingTimer = setTimeout(() => {
                detectCaseType(situationTextarea.value);
            }, doneTypingInterval);
        } else {
            aiDetectionStatus.textContent = 'Describe your situation for AI-assisted case type detection';
        }
    });
    
    function detectCaseType(situationText) {
        // Simulating AI detection with basic keyword matching
        // In a production environment, this would call the Google Generative AI API
        const text = situationText.toLowerCase();
        
        let detectedType = '';
        let confidence = 0;
        
        // Simple keyword matching logic
        const caseTypes = [
            { type: 'criminal', keywords: ['arrest', 'crime', 'police', 'charges', 'criminal', 'jail', 'prison', 'defendant', 'felony', 'misdemeanor'] },
            { type: 'family', keywords: ['divorce', 'custody', 'child support', 'marriage', 'alimony', 'spouse', 'adoption', 'visitation', 'parental rights'] },
            { type: 'personal-injury', keywords: ['accident', 'injury', 'damages', 'pain', 'suffering', 'medical bills', 'compensation', 'negligence', 'hospital'] },
            { type: 'business', keywords: ['contract', 'company', 'business', 'incorporation', 'llc', 'partnership', 'trademark', 'corporate', 'employment'] },
            { type: 'estate', keywords: ['will', 'trust', 'estate', 'inheritance', 'probate', 'executor', 'beneficiary', 'assets', 'death'] },
            { type: 'immigration', keywords: ['visa', 'green card', 'citizenship', 'deportation', 'immigration', 'asylum', 'naturalization', 'foreigner', 'alien'] }
        ];
        
        caseTypes.forEach(caseType => {
            const matchCount = caseType.keywords.filter(keyword => text.includes(keyword)).length;
            const currentConfidence = matchCount / caseType.keywords.length;
            
            if (currentConfidence > confidence && matchCount > 0) {
                detectedType = caseType.type;
                confidence = currentConfidence;
            }
        });
        
        if (detectedType && confidence > 0.1) {
            // Auto-select the detected case type
            document.querySelector(`input[value="${detectedType}"]`).checked = true;
            
            // Highlight the selected option
            caseTypeOptions.forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.value === detectedType) {
                    opt.classList.add('selected');
                }
            });
            
            // Update status message
            aiDetectionStatus.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-2"></i> AI detected: <span class="font-semibold">${formatCaseType(detectedType)}</span> (${Math.round(confidence * 100)}% confidence)`;
        } else {
            aiDetectionStatus.innerHTML = '<i class="fas fa-info-circle text-yellow-500 mr-2"></i> Please provide more details for case type detection';
        }
        
        // In a real implementation, you would use the Google Generative AI:
        /*
        callGoogleGenerativeAI(`Detect the legal case type from this description: ${situationText}`, API_KEY)
            .then(response => {
                // Process AI response and select the appropriate case type
                // Update aiDetectionStatus with the result
            })
            .catch(error => {
                console.error('Error with AI detection:', error);
                aiDetectionStatus.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i> Error detecting case type';
            });
        */
    }
    
    function formatCaseType(type) {
        switch(type) {
            case 'criminal': return 'Criminal Defense';
            case 'family': return 'Family Law';
            case 'personal-injury': return 'Personal Injury';
            case 'business': return 'Business Law';
            case 'estate': return 'Estate Planning';
            case 'immigration': return 'Immigration';
            case 'other': return 'Other';
            default: return type.charAt(0).toUpperCase() + type.slice(1);
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const caseType = document.querySelector('input[name="case-type"]:checked')?.value;
        const location = document.getElementById('location').value;
        const situation = document.getElementById('situation').value;
        const budget = document.getElementById('budget').value;
        
        // Validate form
        if (!caseType) {
            showAlert('Please select a case type.');
            highlightMissingInput('.case-type-container');
            return;
        }
        
        if (!location) {
            showAlert('Please enter your location.');
            highlightMissingInput('#location');
            return;
        }
        
        if (!situation) {
            showAlert('Please describe your situation.');
            highlightMissingInput('#situation');
            return;
        }
        
        if (!budget) {
            showAlert('Please select your budget range.');
            highlightMissingInput('#budget');
            return;
        }
        
        // Show loading spinner and hide any previous results
        resultsDiv.classList.remove('hidden');
        loadingDiv.classList.remove('hidden');
        topRecommendationDiv.classList.add('hidden');
        otherRecommendationsDiv.classList.add('hidden');
        
        // Scroll to results with smooth animation
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // In a real application, you would call the Google Generative AI API here
        // For now, we'll use mock data to simulate the response
        setTimeout(() => {
            // Hide loading spinner
            loadingDiv.classList.add('hidden');
            
            // Generate mock recommendation data
            const recommendations = generateMockRecommendations(caseType, location, situation, budget);
            
            // Display top recommendation
            displayTopRecommendation(recommendations[0]);
            
            // Display other recommendations
            displayOtherRecommendations(recommendations.slice(1));
        }, 2000);
    });
    
    function highlightMissingInput(selector) {
        const element = document.querySelector(selector);
        element.classList.add('highlight-missing');
        
        setTimeout(() => {
            element.classList.remove('highlight-missing');
        }, 2000);
    }
    
    function displayTopRecommendation(lawyer) {
        topRecommendationDiv.classList.remove('hidden');
        
        // Format win rate color class
        const winRateClass = getWinRateClass(lawyer.winRate);
        
        topRecommendationContent.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between">
                <div class="mb-4 md:mb-0">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <i class="fas fa-user-tie mr-3 text-primary-500"></i>${lawyer.name}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300 flex items-center mt-2">
                        <i class="fas fa-building mr-2 text-gray-500 dark:text-gray-400"></i>${lawyer.firm}
                    </p>
                    <div class="mt-4 flex flex-wrap gap-3">
                        <span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-sm font-medium ${winRateClass}">
                            <i class="fas fa-trophy mr-2"></i>${lawyer.winRate}% Win Rate
                        </span>
                        <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            <i class="fas fa-dollar-sign mr-2"></i>${lawyer.estimatedCost}
                        </span>
                    </div>
                    <div class="mt-6 flex flex-wrap gap-3">
                        <a href="${lawyer.website}" target="_blank" class="contact-btn website-btn">
                            <i class="fas fa-globe mr-2"></i>Website
                        </a>
                        <a href="tel:${lawyer.phone}" class="contact-btn call-btn">
                            <i class="fas fa-phone mr-2"></i>Call
                        </a>
                        <a href="mailto:${lawyer.email}" class="contact-btn email-btn">
                            <i class="fas fa-envelope mr-2"></i>Email
                        </a>
                    </div>
                </div>
            </div>
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 class="font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
                    <i class="fas fa-gavel mr-3 text-primary-500"></i>Similar Case Example:
                </h4>
                <p class="text-gray-700 dark:text-gray-300">${lawyer.caseExample}</p>
            </div>
        `;
    }
    
    function displayOtherRecommendations(lawyers) {
        otherRecommendationsDiv.classList.remove('hidden');
        recommendationsList.innerHTML = '';
        
        lawyers.forEach(lawyer => {
            // Format win rate color class
            const winRateClass = getWinRateClass(lawyer.winRate);
            
            const lawyerCard = document.createElement('div');
            lawyerCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lawyer-card transition-all';
            lawyerCard.innerHTML = `
                <div class="flex flex-col justify-between h-full">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <i class="fas fa-user-tie mr-3 text-primary-500"></i>${lawyer.name}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 flex items-center mt-2">
                            <i class="fas fa-building mr-2 text-gray-500 dark:text-gray-400"></i>${lawyer.firm}
                        </p>
                        <div class="mt-4 flex flex-wrap gap-2">
                            <span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-sm font-medium ${winRateClass}">
                                <i class="fas fa-trophy mr-1"></i>${lawyer.winRate}% Win Rate
                            </span>
                            <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                                <i class="fas fa-dollar-sign mr-1"></i>${lawyer.estimatedCost}
                            </span>
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 class="font-semibold mb-2 text-gray-800 dark:text-white flex items-center">
                                <i class="fas fa-gavel mr-2 text-primary-500"></i>Similar Case:
                            </h4>
                            <p class="text-gray-700 dark:text-gray-300 text-sm">${lawyer.caseExample}</p>
                        </div>
                    </div>
                    <div class="mt-5 flex flex-wrap gap-2">
                        <a href="${lawyer.website}" target="_blank" class="contact-btn website-btn text-xs">
                            <i class="fas fa-globe mr-1"></i>Website
                        </a>
                        <a href="tel:${lawyer.phone}" class="contact-btn call-btn text-xs">
                            <i class="fas fa-phone mr-1"></i>Call
                        </a>
                        <a href="mailto:${lawyer.email}" class="contact-btn email-btn text-xs">
                            <i class="fas fa-envelope mr-1"></i>Email
                        </a>
                    </div>
                </div>
            `;
            
            recommendationsList.appendChild(lawyerCard);
        });
    }
    
    function getWinRateClass(winRate) {
        if (winRate >= 75) {
            return 'win-rate-high';
        } else if (winRate >= 50) {
            return 'win-rate-medium';
        } else {
            return 'win-rate-low';
        }
    }
    
    function showAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center z-50 transform transition-all duration-500 translate-x-full';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle mr-3 text-xl"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(alertDiv);
        
        // Animate the alert in
        setTimeout(() => {
            alertDiv.classList.remove('translate-x-full');
        }, 10);
        
        // Animate the alert out and remove it
        setTimeout(() => {
            alertDiv.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 500);
        }, 3000);
    }
    
    // Mock data generation function - In a real application, this would be replaced with API calls
    function generateMockRecommendations(caseType, location, situation, budget) {
        // This is just for demonstration purposes
        // In a real application, you would use the Google Generative AI to generate these recommendations
        
        const mockData = {
            criminal: [
                {
                    name: "Sarah Johnson",
                    firm: "Johnson Criminal Defense",
                    winRate: 87,
                    estimatedCost: "$8,000 - $15,000",
                    website: "https://www.johnsondefense.com",
                    phone: "(555) 123-4567",
                    email: "sarah@johnsondefense.com",
                    caseExample: "Successfully defended a client facing similar charges to yours, resulting in all charges being dismissed due to procedural errors in evidence collection."
                },
                {
                    name: "Michael Rodriguez",
                    firm: "Rodriguez & Associates",
                    winRate: 82,
                    estimatedCost: "$10,000 - $20,000",
                    website: "https://www.rodriguezlaw.com",
                    phone: "(555) 234-5678",
                    email: "michael@rodriguezlaw.com",
                    caseExample: "Negotiated a plea deal that resulted in significantly reduced sentencing for a client with a similar case profile."
                },
                {
                    name: "David Chen",
                    firm: "Chen Law Group",
                    winRate: 78,
                    estimatedCost: "$7,500 - $18,000",
                    website: "https://www.chenlawgroup.com",
                    phone: "(555) 345-6789",
                    email: "david@chenlawgroup.com",
                    caseExample: "Won a complete acquittal for a client in a jury trial with circumstances similar to yours."
                },
                {
                    name: "Jennifer Williams",
                    firm: "Williams Defense Attorneys",
                    winRate: 75,
                    estimatedCost: "$9,000 - $16,000",
                    website: "https://www.williamsdefense.com",
                    phone: "(555) 456-7890",
                    email: "jennifer@williamsdefense.com",
                    caseExample: "Successfully challenged key evidence in a similar case, leading to charges being significantly reduced."
                },
                {
                    name: "Robert Davis",
                    firm: "Davis & Partners",
                    winRate: 72,
                    estimatedCost: "$8,500 - $17,000",
                    website: "https://www.davispartners.com",
                    phone: "(555) 567-8901",
                    email: "robert@davispartners.com",
                    caseExample: "Secured a favorable verdict in a high-profile case with similar elements to yours by effectively cross-examining prosecution witnesses."
                }
            ],
            family: [
                {
                    name: "Patricia Martinez",
                    firm: "Martinez Family Law",
                    winRate: 92,
                    estimatedCost: "$5,000 - $12,000",
                    website: "https://www.martinezfamilylaw.com",
                    phone: "(555) 678-9012",
                    email: "patricia@martinezfamilylaw.com",
                    caseExample: "Negotiated a favorable custody arrangement in a similarly complex family situation, prioritizing the children's well-being."
                },
                {
                    name: "James Wilson",
                    firm: "Wilson Family Law Group",
                    winRate: 88,
                    estimatedCost: "$6,000 - $14,000",
                    website: "https://www.wilsonfamilylaw.com",
                    phone: "(555) 789-0123",
                    email: "james@wilsonfamilylaw.com",
                    caseExample: "Successfully mediated a high-conflict divorce with asset distribution challenges similar to your situation."
                },
                {
                    name: "Linda Thompson",
                    firm: "Thompson Legal Services",
                    winRate: 85,
                    estimatedCost: "$4,500 - $11,000",
                    website: "https://www.thompsonlegal.com",
                    phone: "(555) 890-1234",
                    email: "linda@thompsonlegal.com",
                    caseExample: "Secured favorable child support terms in a case with financial circumstances similar to yours."
                },
                {
                    name: "Thomas Brown",
                    firm: "Brown Family Advocates",
                    winRate: 82,
                    estimatedCost: "$5,500 - $13,000",
                    website: "https://www.brownfamilylaw.com",
                    phone: "(555) 901-2345",
                    email: "thomas@brownfamilylaw.com",
                    caseExample: "Successfully handled a complex adoption case with similar jurisdictional challenges to your situation."
                },
                {
                    name: "Elizabeth Garcia",
                    firm: "Garcia Law Offices",
                    winRate: 80,
                    estimatedCost: "$4,000 - $10,000",
                    website: "https://www.garcialawoffices.com",
                    phone: "(555) 012-3456",
                    email: "elizabeth@garcialawoffices.com",
                    caseExample: "Won a favorable outcome in a contested custody case with parental fitness concerns similar to your case."
                }
            ],
            "personal-injury": [
                {
                    name: "Richard Lee",
                    firm: "Lee Injury Law",
                    winRate: 94,
                    estimatedCost: "Contingency Fee: 33%",
                    website: "https://www.leeinjurylaw.com",
                    phone: "(555) 987-6543",
                    email: "richard@leeinjurylaw.com",
                    caseExample: "Secured a $1.2 million settlement for a client with injuries similar to yours from a comparable accident scenario."
                },
                {
                    name: "Maria Gonzalez",
                    firm: "Gonzalez & Associates",
                    winRate: 91,
                    estimatedCost: "Contingency Fee: 30-35%",
                    website: "https://www.gonzalezlawfirm.com",
                    phone: "(555) 876-5432",
                    email: "maria@gonzalezlawfirm.com",
                    caseExample: "Won a jury verdict of $850,000 in a case with similar liability issues to yours."
                },
                {
                    name: "Christopher Taylor",
                    firm: "Taylor Injury Attorneys",
                    winRate: 89,
                    estimatedCost: "Contingency Fee: 32%",
                    website: "https://www.taylorinjurylaw.com",
                    phone: "(555) 765-4321",
                    email: "chris@taylorinjurylaw.com",
                    caseExample: "Negotiated a settlement 40% higher than the initial offer in a case with injuries comparable to yours."
                },
                {
                    name: "Susan Anderson",
                    firm: "Anderson Law Group",
                    winRate: 86,
                    estimatedCost: "Contingency Fee: 33-40%",
                    website: "https://www.andersonlawgroup.com",
                    phone: "(555) 654-3210",
                    email: "susan@andersonlawgroup.com",
                    caseExample: "Successfully litigated a complex liability case with similar disputed facts to your situation."
                },
                {
                    name: "Joseph Kim",
                    firm: "Kim Injury Lawyers",
                    winRate: 84,
                    estimatedCost: "Contingency Fee: 30%",
                    website: "https://www.kiminjurylawyers.com",
                    phone: "(555) 543-2109",
                    email: "joseph@kiminjurylawyers.com",
                    caseExample: "Obtained substantial compensation for medical expenses and lost wages in a case with similar injury severity to yours."
                }
            ],
            // Add more case types as needed
        };
        
        // Return appropriate mock data based on case type, or default to a generic set
        return mockData[caseType] || [
            {
                name: "Alexandra Wright",
                firm: "Wright Legal Solutions",
                winRate: 90,
                estimatedCost: "$5,000 - $15,000",
                website: "https://www.wrightlegalsolutions.com",
                phone: "(555) 111-2222",
                email: "alexandra@wrightlegalsolutions.com",
                caseExample: "Successfully handled a similar case to yours, resulting in a favorable outcome for the client."
            },
            {
                name: "Benjamin Foster",
                firm: "Foster & Associates",
                winRate: 85,
                estimatedCost: "$6,000 - $18,000",
                website: "https://www.fosterlaw.com",
                phone: "(555) 222-3333",
                email: "benjamin@fosterlaw.com",
                caseExample: "Won a challenging case with circumstances similar to yours through meticulous preparation and strong advocacy."
            },
            {
                name: "Catherine Patel",
                firm: "Patel Law Group",
                winRate: 82,
                estimatedCost: "$4,500 - $14,000",
                website: "https://www.patellawgroup.com",
                phone: "(555) 333-4444",
                email: "catherine@patellawgroup.com",
                caseExample: "Negotiated a favorable settlement in a case with similar legal complexities to your situation."
            },
            {
                name: "Daniel Morgan",
                firm: "Morgan Legal",
                winRate: 78,
                estimatedCost: "$5,500 - $16,000",
                website: "https://www.morganlegal.com",
                phone: "(555) 444-5555",
                email: "daniel@morganlegal.com",
                caseExample: "Successfully argued a motion that led to a decisive advantage in a case similar to yours."
            },
            {
                name: "Emily Washington",
                firm: "Washington & Partners",
                winRate: 75,
                estimatedCost: "$4,000 - $13,000",
                website: "https://www.washingtonpartners.com",
                phone: "(555) 555-6666",
                email: "emily@washingtonpartners.com",
                caseExample: "Developed a creative legal strategy that resolved a similar case favorably without protracted litigation."
            }
        ];
    }
});

// Google Generative AI implementation - This would be replaced with actual API calls
async function callGoogleGenerativeAI(prompt, apiKey) {
    // This is a placeholder function
    // In a real application, you would implement the API call to Google Generative AI here
    // The prompt would be constructed based on the user's input
    
    // For example:
    /*
    const response = await fetch('https://generativeai.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });
    
    const data = await response.json();
    return data;
    */
    
    // For now, just return a mock response
    return {
        success: true,
        message: "Mock response"
    };
} 